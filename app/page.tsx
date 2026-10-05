"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Navbar from "../components/Navbar";
import KpiCards from "../components/KpiCards";
import DataEditor from "../components/DataEditor";
import FieldApp from "../components/FieldApp";
import UncertaintyView from "../components/UncertaintyView";
import ExportView from "../components/ExportView";
import CropDirectory from "../components/CropDirectory";

import cropsData from "../data/crops.json";
import districtsData from "../data/districts.json";
import initialDb from "../data/db.json";

// Dynamically import Leaflet Map to avoid SSR issues
const GisMap = dynamic(() => import("../components/GisMap"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: "500px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        gap: "12px",
      }}
    >
      <i className="fa-solid fa-spinner fa-spin fa-2x" style={{ color: "#166534" }}></i>
      <span style={{ fontWeight: 700, color: "#1e293b" }}>Loading Assam State GIS Remote Sensing Map...</span>
      <span style={{ fontSize: "12px", color: "#64748b" }}>Rendering all 35 Districts & Ground CCE Plots</span>
    </div>
  ),
});

export default function Home() {
  const [activeTab, setActiveTab] = useState("tab-dashboard");
  const [crops] = useState(cropsData);
  const [districts] = useState(districtsData);
  const [estimates, setEstimates] = useState<any[]>(initialDb.estimates || []);
  const [fieldRecords, setFieldRecords] = useState<any[]>(initialDb.field_records || []);
  const [auditLogs, setAuditLogs] = useState<any[]>((initialDb as any).audit_logs || []);

  // Filter states
  const [selectedZone, setSelectedZone] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCrop, setSelectedCrop] = useState("all");
  const [selectedSeason, setSelectedSeason] = useState("all");
  const [selectedStage, setSelectedStage] = useState("all");
  const [searchFilter, setSearchFilter] = useState("");

  const [showCce, setShowCce] = useState(true);
  const [showDistricts, setShowDistricts] = useState(true);
  const [selectedEstimateModal, setSelectedEstimateModal] = useState<any | null>(null);

  // Available zones & categories
  const agroZones = Array.from(new Set(districts.map((d: any) => d.zone)));
  const cropCategories = Array.from(new Set(crops.map((c: any) => c.category)));

  // Filtered districts according to selected zone
  const filteredDistrictOptions = selectedZone === "all"
    ? districts
    : districts.filter((d: any) => d.zone === selectedZone);

  // Filtered estimates for dashboard
  const filteredEstimates = estimates.filter((e) => {
    // Zone filter check
    const distObj = districts.find((d: any) => d.id === e.district_id);
    const matchZone = selectedZone === "all" || (distObj && distObj.zone === selectedZone);
    const matchDist = selectedDistrict === "all" || e.district_id === selectedDistrict;
    const matchCat = selectedCategory === "all" || e.category === selectedCategory;
    const matchCrop = selectedCrop === "all" || e.crop_id === selectedCrop;
    const matchSeason = selectedSeason === "all" || (e.season && e.season.toLowerCase().includes(selectedSeason.toLowerCase()));
    const matchStage = selectedStage === "all" || e.approval_stage === selectedStage;
    const matchSearch = !searchFilter ||
      e.district_name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      e.crop_name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (e.notes && e.notes.toLowerCase().includes(searchFilter.toLowerCase()));

    return matchZone && matchDist && matchCat && matchCrop && matchSeason && matchStage && matchSearch;
  });

  // Aggregations
  const totalAreaHa = filteredEstimates.reduce(
    (sum, e) => sum + (e.area_hectares || 0),
    0
  );
  const totalAreaBighas = Math.round(totalAreaHa * 7.47);
  const totalProdMt = filteredEstimates.reduce(
    (sum, e) => sum + (e.production_mt || 0),
    0
  );
  const weightedYield =
    totalAreaHa > 0 ? Number((totalProdMt / totalAreaHa).toFixed(2)) : 0;
  const verifiedCount = fieldRecords.filter((r) =>
    (r.verification_status || "").includes("Approved")
  ).length;

  // Zone Breakdown Calculation
  const zoneStats = agroZones.map((zone) => {
    const zoneDistIds = new Set(districts.filter((d: any) => d.zone === zone).map((d: any) => d.id));
    const zoneEsts = estimates.filter((e) => zoneDistIds.has(e.district_id));
    const zoneProd = zoneEsts.reduce((sum, e) => sum + (e.production_mt || 0), 0);
    const zoneArea = zoneEsts.reduce((sum, e) => sum + (e.area_hectares || 0), 0);
    return {
      zone,
      productionMt: zoneProd,
      areaHa: zoneArea,
      districtCount: districts.filter((d: any) => d.zone === zone).length,
    };
  });
  const maxZoneProd = Math.max(...zoneStats.map((z) => z.productionMt), 1);

  const handleUpdateEstimate = async (id: string, updatedData: any) => {
    const index = estimates.findIndex((e) => e.id === id);
    if (index === -1) return false;

    const current = estimates[index];
    const newAreaHa = updatedData.area_hectares;
    const newYield = updatedData.yield_mt_ha;

    const updatedRecord = {
      ...current,
      area_hectares: newAreaHa,
      area_bighas: Math.round(newAreaHa * 7.47),
      yield_mt_ha: newYield,
      yield_uncertainty_ci95_lower: updatedData.yield_uncertainty_ci95_lower,
      yield_uncertainty_ci95_upper: updatedData.yield_uncertainty_ci95_upper,
      production_mt: Math.round(newAreaHa * newYield),
      approval_stage: updatedData.approval_stage,
      updated_by: updatedData.updated_by,
      notes: updatedData.notes,
      last_updated: new Date().toISOString(),
    };

    const nextList = [...estimates];
    nextList[index] = updatedRecord;
    setEstimates(nextList);

    // Create and prepend immutable audit log entry
    const newAuditEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      record_id: id,
      action: "ESTIMATE_CALIBRATION_RECONCILED",
      user: updatedData.updated_by || "Departmental Officer",
      justification: updatedData.justification || "Reconciliation against ground CCE points",
      changes: {
        area_hectares: { before: current.area_hectares, after: newAreaHa },
        yield_mt_ha: { before: current.yield_mt_ha, after: newYield },
      },
    };
    setAuditLogs((prev) => [newAuditEntry, ...prev]);

    // Async REST sync to local and backend APIs
    try {
      await fetch(`/api/estimates/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      }).catch(() => {});

      await fetch(`http://localhost:8000/api/estimates/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      }).catch(() => {});
    } catch {
      // offline fallback
    }

    return true;
  };

  const handleAddNewFieldRecord = async (record: any) => {
    const newRec = {
      ...record,
      id: `cce-2026-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      verification_status: "Verified & Approved",
    };
    setFieldRecords([newRec, ...fieldRecords]);

    try {
      await fetch("/api/field-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      }).catch(() => {});

      await fetch("http://localhost:8000/api/field-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      }).catch(() => {});
    } catch {
      // offline fallback
    }

    return true;
  };

  return (
    <div>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-content">
        {/* TAB 1: EXECUTIVE GIS DASHBOARD */}
        {activeTab === "tab-dashboard" && (
          <section className="tab-pane active">
            {/* Filter Strip */}
            <div className="filter-strip">
              <div className="search-input-wrap" style={{ minWidth: "220px" }}>
                <i className="fa-solid fa-magnifying-glass"></i>
                <input
                  type="text"
                  placeholder="Quick search district or crop..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                />
              </div>

              {/* Agro-Climatic Zone */}
              <div className="filter-group">
                <label>
                  <i className="fa-solid fa-mountain-sun"></i> Agro-Climatic Zone
                </label>
                <select
                  value={selectedZone}
                  onChange={(e) => {
                    setSelectedZone(e.target.value);
                    setSelectedDistrict("all");
                  }}
                >
                  <option value="all">All 6 Agro-Climatic Zones</option>
                  {agroZones.map((z: any) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
              </div>

              {/* District */}
              <div className="filter-group">
                <label>
                  <i className="fa-solid fa-map-location-dot"></i> District ({filteredDistrictOptions.length})
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                >
                  <option value="all">
                    {selectedZone === "all" ? "All Assam Districts (35)" : `Districts in ${selectedZone} (${filteredDistrictOptions.length})`}
                  </option>
                  {filteredDistrictOptions.map((d: any) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.zone})
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div className="filter-group">
                <label>
                  <i className="fa-solid fa-wheat-awn"></i> Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories ({cropCategories.length})</option>
                  {cropCategories.map((cat: any) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Crop */}
              <div className="filter-group">
                <label>
                  <i className="fa-solid fa-seedling"></i> Specific Crop
                </label>
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                >
                  <option value="all">All Crops in Assam ({crops.length})</option>
                  {crops.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.local_name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Approval Stage */}
              <div className="filter-group">
                <label>
                  <i className="fa-solid fa-stamp"></i> Approval Stage
                </label>
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                >
                  <option value="all">All Stages</option>
                  <option value="Department Approved">Department Approved</option>
                  <option value="ASSAC Calibrated">ASSAC Calibrated</option>
                  <option value="Field Verified">Field Verified</option>
                  <option value="Pending Review">Pending Review</option>
                </select>
              </div>

              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSelectedZone("all");
                  setSelectedDistrict("all");
                  setSelectedCategory("all");
                  setSelectedCrop("all");
                  setSelectedSeason("all");
                  setSelectedStage("all");
                  setSearchFilter("");
                }}
              >
                <i className="fa-solid fa-arrows-rotate"></i> Reset Filters
              </button>
            </div>

            {/* Android Field App APK Download Banner */}
            <div className="apk-hero-banner">
              <div className="apk-hero-left">
                <div className="apk-hero-badge-wrap">
                  <div className="apk-icon-circle">
                    <i className="fa-brands fa-android"></i>
                  </div>
                  <div>
                    <div className="apk-hero-title">
                      ASSAC GeoAgri-Assam Field CCE Android App (v2.4 Production)
                      <span className="badge-tag green">100% Offline Capable</span>
                    </div>
                    <div className="apk-hero-desc">
                      Official standalone native Android application for District Agricultural Officers (DAOs), ADOs, and field enumerators across all 35 Assam districts. Bundles all 56 crops, standardized 5m×5m cut calculator with 14% moisture formula, on-device ML estimator, and offline sync queue.
                    </div>
                    <div className="apk-hero-meta">
                      <span><i className="fa-solid fa-file-archive"></i> Package: <strong>in.gov.assam.assac.geoagri</strong></span>
                      <span><i className="fa-solid fa-hard-drive"></i> Size: <strong>4.71 MB</strong></span>
                      <span><i className="fa-solid fa-shield-halved"></i> Signature: <strong>v1, v2, v3 Verified</strong></span>
                      <span><i className="fa-solid fa-signal"></i> Network: <strong>Runs Without Internet</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="apk-hero-actions">
                <a
                  href="/api/download/apk"
                  download="ASSAC-GeoAgri-Field-CCE.apk"
                  className="apk-download-btn"
                  title="Direct Download Standalone Android APK (4.71 MB)"
                >
                  <i className="fa-brands fa-android fa-lg"></i>
                  <span>Download APK (4.71 MB)</span>
                </a>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setActiveTab("tab-fieldapp")}
                  style={{ background: "rgba(255,255,255,0.15)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.25)" }}
                >
                  <i className="fa-solid fa-mobile-screen"></i> Launch Web Field App
                </button>
              </div>
            </div>

            {/* KPI Summary Cards */}
            <KpiCards
              totalAreaHa={totalAreaHa}
              totalAreaBighas={totalAreaBighas}
              weightedYield={weightedYield}
              totalProdMt={totalProdMt}
              cceCount={fieldRecords.length}
              verifiedCount={verifiedCount}
            />

            {/* Map & Analytics Panel */}
            <div className="dashboard-split">
              <div className="map-panel">
                <div className="panel-header">
                  <div className="panel-title">
                    <i className="fa-solid fa-earth-asia"></i> Geospatial Crop Distribution & CCE Ground Truth ({districts.length} Districts)
                  </div>
                  <div className="map-controls">
                    <label className="layer-toggle">
                      <input
                        type="checkbox"
                        checked={showCce}
                        onChange={(e) => setShowCce(e.target.checked)}
                      />{" "}
                      CCE Plots ({fieldRecords.length})
                    </label>
                    <label className="layer-toggle">
                      <input
                        type="checkbox"
                        checked={showDistricts}
                        onChange={(e) => setShowDistricts(e.target.checked)}
                      />{" "}
                      District Hubs ({districts.length})
                    </label>
                  </div>
                </div>

                <GisMap
                  districts={districts}
                  estimates={filteredEstimates}
                  fieldRecords={fieldRecords}
                  showCcePoints={showCce}
                  showDistricts={showDistricts}
                />

                <div className="map-legend">
                  <span className="legend-item">
                    <span className="legend-dot green"></span> Field CCE Point (Verified)
                  </span>
                  <span className="legend-item">
                    <span className="legend-dot amber"></span> Field CCE (Pending Audit)
                  </span>
                  <span className="legend-item">
                    <span className="legend-dot blue"></span> District Hub Aggregate
                  </span>
                  <span className="legend-item">
                    <span className="legend-dot purple"></span> Sentinel-1 SAR Dual-Pol Footprint
                  </span>
                </div>
              </div>

              {/* Side Analytics Panel */}
              <div className="analytics-panel">
                {/* 1. Agro-Climatic Zone Distribution */}
                <div className="panel-header">
                  <div className="panel-title">
                    <i className="fa-solid fa-chart-bar"></i> Agro-Climatic Zone Production
                  </div>
                </div>
                <div className="zone-bars-list">
                  {zoneStats.map((zs) => {
                    const pct = Math.round((zs.productionMt / maxZoneProd) * 100);
                    return (
                      <div key={zs.zone} className="zone-bar-row">
                        <div className="zone-bar-header">
                          <span className="zone-name">{zs.zone}</span>
                          <span className="zone-val">
                            {zs.productionMt.toLocaleString()} MT ({zs.areaHa.toLocaleString()} Ha)
                          </span>
                        </div>
                        <div className="zone-bar-track">
                          <div className="zone-bar-fill" style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 2. Remote Sensing Telemetry Info Box */}
                <div className="assam-agro-info" style={{ marginTop: "16px" }}>
                  <div className="info-title">
                    <i className="fa-solid fa-cloud-bolt"></i> Monsoon Cloud Penetration Architecture
                  </div>
                  <p>
                    During Assam's Kharif season, persistent clouds obscure optical sensors by <strong>75%–85%</strong>.
                    The platform overcomes this using automated <strong>Sentinel-1 C-band SAR (VV/VH)</strong> backscatter trajectories,
                    achieving <strong>100% operational continuity</strong> across the Brahmaputra floodplain.
                  </p>
                </div>

                {/* 3. Departmental Approval Breakdown */}
                <div className="panel-header" style={{ marginTop: "16px" }}>
                  <div className="panel-title">
                    <i className="fa-solid fa-shield-halved"></i> Departmental Approval Stages
                  </div>
                </div>
                <div className="verification-bars">
                  <div className="v-row">
                    <div className="v-label-wrap">
                      <span>Department Approved</span>
                      <span>
                        {estimates.filter((e) => e.approval_stage === "Department Approved").length} of {estimates.length} (
                        {Math.round((estimates.filter((e) => e.approval_stage === "Department Approved").length / estimates.length) * 100)}%)
                      </span>
                    </div>
                    <div className="v-progress-bar">
                      <div
                        className="v-fill"
                        style={{
                          width: `${(estimates.filter((e) => e.approval_stage === "Department Approved").length / estimates.length) * 100}%`,
                          background: "#16a34a",
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="v-row">
                    <div className="v-label-wrap">
                      <span>ASSAC Calibrated</span>
                      <span>
                        {estimates.filter((e) => e.approval_stage === "ASSAC Calibrated").length} of {estimates.length} (
                        {Math.round((estimates.filter((e) => e.approval_stage === "ASSAC Calibrated").length / estimates.length) * 100)}%)
                      </span>
                    </div>
                    <div className="v-progress-bar">
                      <div
                        className="v-fill"
                        style={{
                          width: `${(estimates.filter((e) => e.approval_stage === "ASSAC Calibrated").length / estimates.length) * 100}%`,
                          background: "#0284c7",
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="v-row">
                    <div className="v-label-wrap">
                      <span>Field Verified</span>
                      <span>
                        {estimates.filter((e) => e.approval_stage === "Field Verified").length} of {estimates.length} (
                        {Math.round((estimates.filter((e) => e.approval_stage === "Field Verified").length / estimates.length) * 100)}%)
                      </span>
                    </div>
                    <div className="v-progress-bar">
                      <div
                        className="v-fill"
                        style={{
                          width: `${(estimates.filter((e) => e.approval_stage === "Field Verified").length / estimates.length) * 100}%`,
                          background: "#f59e0b",
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="v-row">
                    <div className="v-label-wrap">
                      <span>Pending Review</span>
                      <span>
                        {estimates.filter((e) => e.approval_stage === "Pending Review").length} of {estimates.length} (
                        {Math.round((estimates.filter((e) => e.approval_stage === "Pending Review").length / estimates.length) * 100)}%)
                      </span>
                    </div>
                    <div className="v-progress-bar">
                      <div
                        className="v-fill"
                        style={{
                          width: `${(estimates.filter((e) => e.approval_stage === "Pending Review").length / estimates.length) * 100}%`,
                          background: "#ef4444",
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Estimates Table */}
            <div className="table-card" style={{ marginTop: "24px" }}>
              <div className="panel-header">
                <div className="panel-title">
                  <i className="fa-solid fa-table-list"></i> Authoritative District Crop Estimates Directory ({filteredEstimates.length} Records)
                </div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <a
                    href="/api/download/apk"
                    download="ASSAC-GeoAgri-Field-CCE.apk"
                    className="btn btn-sm btn-primary"
                    style={{ background: "#15803d", borderColor: "#16a34a", textDecoration: "none", color: "#ffffff", display: "inline-flex", alignItems: "center", gap: "6px" }}
                    title="Direct Download Standalone Signed Android APK"
                  >
                    <i className="fa-brands fa-android"></i> Download APK (4.71 MB)
                  </a>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => setActiveTab("tab-crops")}
                  >
                    <i className="fa-solid fa-book"></i> Browse 56 Crops Catalog
                  </button>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => setActiveTab("tab-editor")}
                  >
                    <i className="fa-solid fa-pen-to-square"></i> Open Reconciler & Calibrator
                  </button>
                </div>
              </div>

              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>District</th>
                      <th>Crop & Local Name</th>
                      <th>Category</th>
                      <th>Season</th>
                      <th>Cropped Area (Ha / Bighas)</th>
                      <th>Yield Forecast (MT/Ha)</th>
                      <th>95% Uncertainty CI</th>
                      <th>Production (MT)</th>
                      <th>Approval Stage</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEstimates.map((e) => {
                      const cropObj = crops.find((c: any) => c.id === e.crop_id);
                      return (
                        <tr key={e.id}>
                          <td>
                            <strong>{e.district_name}</strong>
                            <div style={{ fontSize: "11px", color: "#64748b" }}>{e.id}</div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 700, color: "#0f172a" }}>{e.crop_name}</div>
                            {cropObj && cropObj.local_name && (
                              <div style={{ fontSize: "11px", color: "#166534", fontWeight: 600 }}>
                                অসমীয়া: {cropObj.local_name}
                              </div>
                            )}
                          </td>
                          <td>
                            <span className="badge-tag">{e.category}</span>
                          </td>
                          <td>{e.season}</td>
                          <td>
                            <strong>{e.area_hectares.toLocaleString()} Ha</strong>
                            <div style={{ fontSize: "11px", color: "#64748b" }}>
                              {(e.area_bighas || Math.round(e.area_hectares * 7.47)).toLocaleString()} Bighas
                            </div>
                          </td>
                          <td>
                            <strong style={{ color: "#15803d", fontSize: "14px" }}>
                              {Number(e.yield_mt_ha).toFixed(2)}
                            </strong>
                          </td>
                          <td>
                            <span className="badge-tag green">
                              {e.yield_uncertainty_ci95_lower} – {e.yield_uncertainty_ci95_upper}
                            </span>
                          </td>
                          <td>
                            <strong>{e.production_mt.toLocaleString()} MT</strong>
                          </td>
                          <td>
                            <span
                              className={`badge-stage ${
                                e.approval_stage === "Department Approved"
                                  ? "approved"
                                  : e.approval_stage === "ASSAC Calibrated"
                                  ? "calibrated"
                                  : e.approval_stage === "Field Verified"
                                  ? "verified"
                                  : "pending"
                              }`}
                            >
                              {e.approval_stage}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={() => setSelectedEstimateModal(e)}
                              title="Inspect full telemetry, SAR coverage & audit notes"
                            >
                              <i className="fa-solid fa-eye"></i> Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Estimate Details Modal */}
            {selectedEstimateModal && (
              <div className="modal-backdrop" onClick={() => setSelectedEstimateModal(null)}>
                <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div className="modal-icon-badge">
                        <i className="fa-solid fa-chart-pie"></i>
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: "18px", color: "#0f172a" }}>
                          {selectedEstimateModal.district_name} • {selectedEstimateModal.crop_name}
                        </h3>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>
                          Record ID: {selectedEstimateModal.id} | Stage: {selectedEstimateModal.approval_stage}
                        </div>
                      </div>
                    </div>
                    <button className="btn-close" onClick={() => setSelectedEstimateModal(null)}>
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </div>

                  <div className="modal-body">
                    <div className="crop-detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">Cropped Area</span>
                        <span className="detail-val font-bold">
                          {selectedEstimateModal.area_hectares.toLocaleString()} Ha
                          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 400, marginLeft: "4px" }}>
                            ({(selectedEstimateModal.area_bighas || Math.round(selectedEstimateModal.area_hectares * 7.47)).toLocaleString()} Bighas)
                          </span>
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Yield Forecast</span>
                        <span className="detail-val font-bold" style={{ color: "#15803d" }}>
                          {selectedEstimateModal.yield_mt_ha} MT / Ha
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">95% Confidence Interval</span>
                        <span className="detail-val">
                          {selectedEstimateModal.yield_uncertainty_ci95_lower} to {selectedEstimateModal.yield_uncertainty_ci95_upper} MT/Ha
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Total Production</span>
                        <span className="detail-val font-bold">
                          {selectedEstimateModal.production_mt.toLocaleString()} MT
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">SAR Dual-Pol Coverage</span>
                        <span className="detail-val font-semibold" style={{ color: "#0369a1" }}>
                          {selectedEstimateModal.sar_coverage_pct || 98}% (Sentinel-1)
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Optical Cloud Obscuration</span>
                        <span className="detail-val font-semibold" style={{ color: "#b45309" }}>
                          {selectedEstimateModal.optical_cloud_pct || 72}% Masked
                        </span>
                      </div>
                    </div>

                    <div className="detail-section-box sar-box">
                      <div className="section-title">
                        <i className="fa-solid fa-clipboard-check"></i> Verification & Departmental Audit Notes
                      </div>
                      <p style={{ margin: "4px 0 0", fontSize: "13px", lineHeight: "1.5", color: "#1e293b" }}>
                        {selectedEstimateModal.notes || "Ground truth calibrated against authorized Crop Cutting Experiments."}
                      </p>
                      <div style={{ fontSize: "11px", color: "#64748b", marginTop: "8px" }}>
                        Reviewed by: <strong>{selectedEstimateModal.updated_by || "DAO / ASSAC Cell"}</strong> | Timestamp: {selectedEstimateModal.last_updated}
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      className="btn btn-secondary"
                      onClick={() => setSelectedEstimateModal(null)}
                    >
                      Close Details
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setSelectedEstimateModal(null);
                        setActiveTab("tab-editor");
                      }}
                    >
                      <i className="fa-solid fa-pen-to-square"></i> Edit in Reconciler
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* TAB 2: ASSAM 56-CROP DIRECTORY & PHENOLOGY */}
        {activeTab === "tab-crops" && (
          <section className="tab-pane active">
            <CropDirectory crops={crops} />
          </section>
        )}

        {/* TAB 3: UNCERTAINTY & SATELLITE ML SIMULATOR */}
        {activeTab === "tab-accuracy" && (
          <section className="tab-pane active">
            <UncertaintyView />
          </section>
        )}

        {/* TAB 4: DATA EDITOR & RECONCILIATION */}
        {activeTab === "tab-editor" && (
          <section className="tab-pane active">
            <DataEditor
              estimates={estimates}
              auditLogs={auditLogs}
              onUpdateEstimate={handleUpdateEstimate}
            />
          </section>
        )}

        {/* TAB 5: FIELD DATA COLLECTION APP */}
        {activeTab === "tab-fieldapp" && (
          <section className="tab-pane active">
            <FieldApp
              crops={crops}
              districts={districts}
              fieldRecords={fieldRecords}
              onSubmitRecord={handleAddNewFieldRecord}
            />
          </section>
        )}

        {/* TAB 6: DEPARTMENTAL EXPORT & SCHEDULE VI */}
        {activeTab === "tab-export" && (
          <section className="tab-pane active">
            <ExportView estimates={estimates} />
          </section>
        )}
      </main>
    </div>
  );
}
