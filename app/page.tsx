"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Navbar from "../components/Navbar";
import KpiCards from "../components/KpiCards";
import DataEditor from "../components/DataEditor";
import FieldApp from "../components/FieldApp";
import UncertaintyView from "../components/UncertaintyView";
import ExportView from "../components/ExportView";

import cropsData from "../data/crops.json";
import districtsData from "../data/districts.json";
import initialDb from "../data/db.json";

// Dynamically import Leaflet Map to avoid SSR issues
const GisMap = dynamic(() => import("../components/GisMap"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: "480px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: "6px",
      }}
    >
      <i className="fa-solid fa-spinner fa-spin fa-2x" style={{ color: "#1b5e20" }}></i>
      <span style={{ marginLeft: "10px", fontWeight: 600 }}>Loading Assam GIS Map...</span>
    </div>
  ),
});

export default function Home() {
  const [activeTab, setActiveTab] = useState("tab-dashboard");
  const [crops] = useState(cropsData);
  const [districts] = useState(districtsData);
  const [estimates, setEstimates] = useState<any[]>(initialDb.estimates || []);
  const [fieldRecords, setFieldRecords] = useState<any[]>(initialDb.field_records || []);

  // Filter states
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCrop, setSelectedCrop] = useState("all");
  const [selectedStage, setSelectedStage] = useState("all");

  const [showCce, setShowCce] = useState(true);
  const [showDistricts, setShowDistricts] = useState(true);

  // Filtered estimates for dashboard
  const filteredEstimates = estimates.filter((e) => {
    const matchDist = selectedDistrict === "all" || e.district_id === selectedDistrict;
    const matchCat = selectedCategory === "all" || e.category === selectedCategory;
    const matchCrop = selectedCrop === "all" || e.crop_id === selectedCrop;
    const matchStage = selectedStage === "all" || e.approval_stage === selectedStage;
    return matchDist && matchCat && matchCrop && matchStage;
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
    return true;
  };

  const cropCategories = Array.from(new Set(crops.map((c: any) => c.category)));

  return (
    <div>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-content">
        {/* TAB 1: EXECUTIVE GIS DASHBOARD */}
        {activeTab === "tab-dashboard" && (
          <section className="tab-pane active">
            {/* Filter Strip */}
            <div className="filter-strip">
              <div className="filter-group">
                <label>
                  <i className="fa-solid fa-map-location-dot"></i> District
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                >
                  <option value="all">All Assam Districts (35)</option>
                  {districts.map((d: any) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.zone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>
                  <i className="fa-solid fa-wheat-awn"></i> Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {cropCategories.map((cat: any) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

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
                  setSelectedDistrict("all");
                  setSelectedCategory("all");
                  setSelectedCrop("all");
                  setSelectedStage("all");
                }}
              >
                <i className="fa-solid fa-arrows-rotate"></i> Reset Filters
              </button>
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
                    <i className="fa-solid fa-earth-asia"></i> Spatial GIS Crop Distribution &
                    CCE Ground Truth
                  </div>
                  <div className="map-controls">
                    <label className="layer-toggle">
                      <input
                        type="checkbox"
                        checked={showCce}
                        onChange={(e) => setShowCce(e.target.checked)}
                      />{" "}
                      CCE Field Points
                    </label>
                    <label className="layer-toggle">
                      <input
                        type="checkbox"
                        checked={showDistricts}
                        onChange={(e) => setShowDistricts(e.target.checked)}
                      />{" "}
                      District Hubs
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
                    <span className="legend-dot green"></span> Field CCE Point
                  </span>
                  <span className="legend-item">
                    <span className="legend-dot blue"></span> District Aggregate
                  </span>
                  <span className="legend-item">
                    <span className="legend-dot amber"></span> Pending Verification
                  </span>
                  <span className="legend-item">
                    <span className="legend-dot purple"></span> Sentinel-1 SAR Focus
                  </span>
                </div>
              </div>

              <div className="analytics-panel">
                <div className="panel-header">
                  <div className="panel-title">
                    <i className="fa-solid fa-info-circle"></i> ASSAC Operational Remote Sensing
                  </div>
                </div>
                <div className="assam-agro-info">
                  <div className="info-title">Cloud Penetration Architecture</div>
                  <p>
                    During the Kharif Sali rice season, optical imagery experiences over 75%
                    cloud hindrance. The platform leverages automated{" "}
                    <strong>Sentinel-1 C-band SAR dual-pol (VV/VH)</strong> backscatter trajectories
                    to monitor rice transplanting, heading, and inundation across the Brahmaputra
                    floodplain.
                  </p>
                </div>

                <div className="panel-header" style={{ marginTop: "16px" }}>
                  <div className="panel-title">
                    <i className="fa-solid fa-shield-halved"></i> Verification Breakdown
                  </div>
                </div>
                <div className="verification-bars">
                  <div className="v-row">
                    <div className="v-label-wrap">
                      <span>Department Approved</span>
                      <span>
                        {
                          estimates.filter((e) => e.approval_stage === "Department Approved")
                            .length
                        }{" "}
                        (60%)
                      </span>
                    </div>
                    <div className="v-progress-bar">
                      <div className="v-fill" style={{ width: "60%" }}></div>
                    </div>
                  </div>
                  <div className="v-row">
                    <div className="v-label-wrap">
                      <span>Field Verified</span>
                      <span>
                        {
                          estimates.filter((e) => e.approval_stage === "Field Verified").length
                        }{" "}
                        (20%)
                      </span>
                    </div>
                    <div className="v-progress-bar">
                      <div
                        className="v-fill"
                        style={{ width: "20%", background: "#f59e0b" }}
                      ></div>
                    </div>
                  </div>
                  <div className="v-row">
                    <div className="v-label-wrap">
                      <span>Pending Review</span>
                      <span>
                        {
                          estimates.filter((e) => e.approval_stage === "Pending Review").length
                        }{" "}
                        (20%)
                      </span>
                    </div>
                    <div className="v-progress-bar">
                      <div
                        className="v-fill"
                        style={{ width: "20%", background: "#ef4444" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Estimates Table */}
            <div className="table-card" style={{ marginTop: "20px" }}>
              <div className="panel-header">
                <div className="panel-title">
                  <i className="fa-solid fa-table-list"></i> Active District Crop Estimates
                  Summary
                </div>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => setActiveTab("tab-editor")}
                >
                  <i className="fa-solid fa-pen"></i> Open Full Editor
                </button>
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
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEstimates.map((e) => (
                      <tr key={e.id}>
                        <td>
                          <strong>{e.district_name}</strong>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: "#0f172a" }}>{e.crop_name}</div>
                          <div style={{ fontSize: "10px", color: "#64748b" }}>{e.id}</div>
                        </td>
                        <td>
                          <span className="badge-tag">{e.category}</span>
                        </td>
                        <td>{e.season}</td>
                        <td>
                          <strong>{e.area_hectares.toLocaleString()} Ha</strong>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>
                            {(
                              e.area_bighas || Math.round(e.area_hectares * 7.47)
                            ).toLocaleString()}{" "}
                            Bighas
                          </div>
                        </td>
                        <td>
                          <strong style={{ color: "#15803d" }}>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* TAB 2: DATA EDITOR & RECONCILIATION */}
        {activeTab === "tab-editor" && (
          <section className="tab-pane active">
            <DataEditor estimates={estimates} onUpdateEstimate={handleUpdateEstimate} />
          </section>
        )}

        {/* TAB 3: FIELD DATA COLLECTION APP */}
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

        {/* TAB 4: UNCERTAINTY & VALIDATION */}
        {activeTab === "tab-accuracy" && (
          <section className="tab-pane active">
            <UncertaintyView />
          </section>
        )}

        {/* TAB 5: DEPARTMENTAL EXPORT */}
        {activeTab === "tab-export" && (
          <section className="tab-pane active">
            <ExportView estimates={estimates} />
          </section>
        )}
      </main>
    </div>
  );
}
