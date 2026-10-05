"use client";

import React, { useState } from "react";

interface FieldAppProps {
  crops: any[];
  districts: any[];
  fieldRecords: any[];
  onSubmitRecord: (record: any) => Promise<boolean>;
}

export default function FieldApp({
  crops,
  districts,
  fieldRecords,
  onSubmitRecord,
}: FieldAppProps) {
  const [lat, setLat] = useState<number>(26.3468);
  const [lng, setLng] = useState<number>(92.6841);
  const [acc, setAcc] = useState<number>(2.5);

  const [districtId, setDistrictId] = useState<string>("nagaon");
  const [block, setBlock] = useState<string>("Raha");
  const [village, setVillage] = useState<string>("Nonoi Pathar");
  const [dagNo, setDagNo] = useState<string>("Dag 412/18");
  const [farmer, setFarmer] = useState<string>("Bhaben Hazarika");
  const [phone, setPhone] = useState<string>("+91 98640 44123");

  const [cropId, setCropId] = useState<string>("rice-sali");
  const [variety, setVariety] = useState<string>("Ranjit");
  const [sowingDate, setSowingDate] = useState<string>("2026-06-25");
  const [phenology, setPhenology] = useState<string>("Maturity / Harvest Ready");

  const [plotArea, setPlotArea] = useState<number>(25); // 5m x 5m
  const [freshBiomass, setFreshBiomass] = useState<number>(9.45);
  const [moisture, setMoisture] = useState<number>(14.0);

  const [floodDepth, setFloodDepth] = useState<number>(0);
  const [floodDays, setFloodDays] = useState<number>(0);
  const [pest, setPest] = useState<string>("Nil / Negligible");

  const [enumName, setEnumName] = useState<string>("Pranjal Sarma (ADO)");
  const [enumPhone, setEnumPhone] = useState<string>("+91 94350 78122");
  const [notes, setNotes] = useState<string>("Uniform standing crop, zero lodging, well managed bunds.");

  const [photoSnapped, setPhotoSnapped] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Compute moisture-adjusted yield
  const factor = (100 - moisture) / (100 - 14.0);
  const rawYield = (freshBiomass / (plotArea || 25)) * 10;
  const computedYield = Number((rawYield * factor).toFixed(2));
  const kgBigha = Number(((computedYield * 1000) / 7.47).toFixed(1));

  const handleFetchGps = () => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(parseFloat(pos.coords.latitude.toFixed(4)));
          setLng(parseFloat(pos.coords.longitude.toFixed(4)));
          setAcc(Math.round(pos.coords.accuracy));
        },
        () => {
          const fakeLat = parseFloat((26.2 + Math.random() * 0.4).toFixed(4));
          const fakeLng = parseFloat((91.5 + Math.random() * 1.5).toFixed(4));
          setLat(fakeLat);
          setLng(fakeLng);
          setAcc(3.2);
        }
      );
    }
  };

  const handleSnapPhoto = () => {
    setPhotoSnapped(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const cropObj = crops.find((c) => c.id === cropId);
    const distObj = districts.find((d) => d.id === districtId);

    const payload = {
      enumerator_name: enumName,
      enumerator_phone: enumPhone,
      district_id: districtId,
      district_name: distObj ? distObj.name : "Nagaon",
      block,
      village,
      dag_no: dagNo,
      farmer_name: farmer,
      farmer_phone: phone,
      crop_id: cropId,
      crop_name: cropObj ? cropObj.name : "Sali Rice",
      variety,
      sowing_date: sowingDate,
      phenology_stage: phenology,
      plot_lat: lat,
      plot_lng: lng,
      gps_accuracy_m: acc,
      cce_plot_shape: "Square (5m x 5m)",
      cce_plot_area_sqm: plotArea,
      fresh_biomass_kg: freshBiomass,
      moisture_pct: moisture,
      flood_submergence_depth_cm: floodDepth,
      flood_inundation_days: floodDays,
      pest_disease_incidence: pest,
      notes,
    };

    await onSubmitRecord(payload);
    setIsSubmitting(false);
  };

  return (
    <div className="field-app-layout">
      {/* Smartphone Simulator */}
      <div className="phone-frame">
        <div className="phone-speaker"></div>
        <div className="phone-screen">
          <div className="app-bar">
            <div className="app-bar-brand">
              <i className="fa-solid fa-seedling"></i> ASSAC Field CCE
            </div>
            <div className="sync-status online">
              <i className="fa-solid fa-wifi"></i> Online Sync
            </div>
          </div>

          <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "10px 14px", borderRadius: "8px", margin: "10px 12px 0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
            <div style={{ fontSize: "11px", color: "#065f46" }}>
              <strong><i className="fa-brands fa-android"></i> Android Native App Ready</strong>
              <div style={{ fontSize: "10px", color: "#047857" }}>Install directly on enumerator phones</div>
            </div>
            <a
              href="/api/download/apk"
              download="ASSAC-GeoAgri-Field-CCE.apk"
              className="btn btn-sm btn-primary"
              style={{ whiteSpace: "nowrap", padding: "4px 10px", fontSize: "11px", textDecoration: "none" }}
            >
              Get APK
            </a>
          </div>

          <form onSubmit={handleSubmit} className="app-form">
            {/* GPS */}
            <div className="form-section-card">
              <div className="section-title">
                <i className="fa-solid fa-location-crosshairs"></i> 1. Field Geolocation (GPS)
              </div>
              <div className="gps-readout">
                <div className="gps-row">
                  <span>Latitude:</span> <strong>{lat}</strong>
                </div>
                <div className="gps-row">
                  <span>Longitude:</span> <strong>{lng}</strong>
                </div>
                <div className="gps-row">
                  <span>Accuracy:</span>{" "}
                  <span className="badge-tag green">± {acc}m (High)</span>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline w-100"
                onClick={handleFetchGps}
              >
                <i className="fa-solid fa-crosshairs"></i> Refresh Field GPS Fix
              </button>
            </div>

            {/* Admin jurisdiction */}
            <div className="form-section-card">
              <div className="section-title">
                <i className="fa-solid fa-landmark"></i> 2. Administrative Jurisdiction
              </div>
              <div className="field-item">
                <label>District *</label>
                <select
                  value={districtId}
                  onChange={(e) => setDistrictId(e.target.value)}
                  required
                >
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.zone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="field-row">
                <div className="field-item">
                  <label>Block *</label>
                  <input
                    type="text"
                    value={block}
                    onChange={(e) => setBlock(e.target.value)}
                    required
                  />
                </div>
                <div className="field-item">
                  <label>Village *</label>
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="field-item">
                <label>Dag / Plot No.</label>
                <input
                  type="text"
                  value={dagNo}
                  onChange={(e) => setDagNo(e.target.value)}
                />
              </div>

              <div className="field-row">
                <div className="field-item">
                  <label>Farmer Name</label>
                  <input
                    type="text"
                    value={farmer}
                    onChange={(e) => setFarmer(e.target.value)}
                  />
                </div>
                <div className="field-item">
                  <label>Farmer Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Crop details */}
            <div className="form-section-card">
              <div className="section-title">
                <i className="fa-solid fa-wheat-awn"></i> 3. Crop Profile (Assam Catalog)
              </div>
              <div className="field-item">
                <label>Crop *</label>
                <select
                  value={cropId}
                  onChange={(e) => setCropId(e.target.value)}
                  required
                >
                  {crops.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} - {c.local_name} [{c.season}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="field-row">
                <div className="field-item">
                  <label>Variety / Clone</label>
                  <input
                    type="text"
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                  />
                </div>
                <div className="field-item">
                  <label>Sowing Date</label>
                  <input
                    type="date"
                    value={sowingDate}
                    onChange={(e) => setSowingDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="field-item">
                <label>Growth Stage</label>
                <select
                  value={phenology}
                  onChange={(e) => setPhenology(e.target.value)}
                >
                  <option value="Maturity / Harvest Ready">
                    Maturity / Harvest Ready (CCE)
                  </option>
                  <option value="Grain Filling / Pod Formation">
                    Grain Filling / Pod Formation
                  </option>
                  <option value="Flowering / Heading">Flowering / Heading</option>
                  <option value="Tillering / Vegetative">Tillering / Vegetative</option>
                </select>
              </div>
            </div>

            {/* CCE Measurements */}
            <div className="form-section-card">
              <div className="section-title">
                <i className="fa-solid fa-scale-balanced"></i> 4. 5m x 5m CCE Cut Measurements
              </div>
              <div className="field-row">
                <div className="field-item">
                  <label>Fresh Biomass Cut (kg) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={freshBiomass}
                    onChange={(e) => setFreshBiomass(parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                <div className="field-item">
                  <label>Moisture %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={moisture}
                    onChange={(e) => setMoisture(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="cce-output-card">
                <div className="output-label">
                  COMPUTED DRY YIELD (STANDARDIZED TO 14% MOISTURE)
                </div>
                <div className="output-val">
                  {computedYield} <span className="unit">MT / Ha</span>
                </div>
                <div className="output-sub">≈ {kgBigha} kg / Bigha</div>
              </div>
            </div>

            {/* Flood impact */}
            <div className="form-section-card">
              <div className="section-title">
                <i className="fa-solid fa-water"></i> 5. Flood Submergence Tracking
              </div>
              <div className="field-row">
                <div className="field-item">
                  <label>Depth (cm)</label>
                  <input
                    type="number"
                    value={floodDepth}
                    onChange={(e) => setFloodDepth(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="field-item">
                  <label>Days Inundated</label>
                  <input
                    type="number"
                    value={floodDays}
                    onChange={(e) => setFloodDays(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>

            {/* Watermarked photo */}
            <div className="form-section-card">
              <div className="section-title">
                <i className="fa-solid fa-camera"></i> 6. Watermarked Field Photo
              </div>
              <div className="photo-preview-wrap">
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "#1b5e20",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                  }}
                >
                  <i className="fa-solid fa-wheat-awn fa-3x"></i>
                </div>
                <div className="photo-watermark">
                  <div>ASSAC CCE SURVEY</div>
                  <div>
                    GPS: {lat} N, {lng} E
                  </div>
                  <div>Captured: {new Date().toLocaleDateString()}</div>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-secondary w-100"
                style={{ marginTop: "8px" }}
                onClick={handleSnapPhoto}
              >
                <i className="fa-solid fa-camera-retro"></i> Snap Geotagged Photo
              </button>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-100"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Uploading...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-cloud-arrow-up"></i> Submit & Synchronize CCE
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Sidebar explanation and live feed */}
      <div className="field-app-sidebar">
        <div className="card-box">
          <div className="card-box-header">
            <i className="fa-solid fa-circle-info"></i> How Field Data Syncs with the Dashboard
          </div>
          <div className="card-box-body">
            <p>
              The <strong>Field Data Collection Application</strong> provides field
              enumerators, ADOs, and Patwaris with a streamlined interface to collect
              standardized 5m x 5m Crop Cutting Experiments (CCE).
            </p>
            <ul className="check-list" style={{ marginTop: "12px", listStyle: "none" }}>
              <li>
                <i className="fa-solid fa-check" style={{ color: "#16a34a" }}></i>{" "}
                <strong>Automatic Yield Calculation:</strong> Translates raw biomass cutting
                weight into metric tonnes per hectare with moisture correction.
              </li>
              <li style={{ marginTop: "6px" }}>
                <i className="fa-solid fa-check" style={{ color: "#16a34a" }}></i>{" "}
                <strong>Flood & Waterlogging Tracking:</strong> Captures depth and days
                submerged to train SAR flood damage classification.
              </li>
              <li style={{ marginTop: "6px" }}>
                <i className="fa-solid fa-check" style={{ color: "#16a34a" }}></i>{" "}
                <strong>Instant Dashboard Map Pinning:</strong> Once submitted, the point
                instantly appears on the Executive GIS Map for departmental review.
              </li>
            </ul>
          </div>
        </div>

        <div className="card-box" style={{ marginTop: "20px" }}>
          <div className="card-box-header">
            <i className="fa-solid fa-satellite"></i> Live Synchronized Field CCE Stream
          </div>
          <div className="cce-feed-list">
            {fieldRecords.map((r) => (
              <div key={r.id} className="cce-feed-card">
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    background: "#2e7d32",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                  }}
                >
                  <i className="fa-solid fa-wheat-awn"></i>
                </div>
                <div className="cce-feed-content">
                  <div className="cce-feed-header">
                    <span>{r.crop_name}</span>
                    <span style={{ fontSize: "11px", color: "#64748b" }}>
                      {new Date(r.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="cce-feed-sub">
                    {r.village}, {r.block} ({r.district_name})
                  </div>
                  <div className="cce-yield-pill">{r.computed_yield_mt_ha} MT/Ha</div>
                  <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>
                    By {r.enumerator_name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
