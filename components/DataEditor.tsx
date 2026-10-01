"use client";

import React, { useState } from "react";

interface DataEditorProps {
  estimates: any[];
  onUpdateEstimate: (id: string, updatedData: any) => Promise<boolean>;
}

export default function DataEditor({ estimates, onUpdateEstimate }: DataEditorProps) {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  // Form states in modal
  const [areaHa, setAreaHa] = useState<number>(0);
  const [yieldHa, setYieldHa] = useState<number>(0);
  const [ciLower, setCiLower] = useState<number>(0);
  const [ciUpper, setCiUpper] = useState<number>(0);
  const [stage, setStage] = useState<string>("Draft");
  const [reviewer, setReviewer] = useState<string>("Senior Scientist / DAO");
  const [justification, setJustification] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const filtered = estimates.filter((e) => {
    const matchesStage = stageFilter === "all" || e.approval_stage === stageFilter;
    const matchesSearch =
      !search ||
      e.district_name.toLowerCase().includes(search.toLowerCase()) ||
      e.crop_name.toLowerCase().includes(search.toLowerCase()) ||
      (e.updated_by && e.updated_by.toLowerCase().includes(search.toLowerCase()));
    return matchesStage && matchesSearch;
  });

  const handleOpenEdit = (rec: any) => {
    setSelectedRecord(rec);
    setAreaHa(rec.area_hectares);
    setYieldHa(rec.yield_mt_ha);
    setCiLower(rec.yield_uncertainty_ci95_lower);
    setCiUpper(rec.yield_uncertainty_ci95_upper);
    setStage(rec.approval_stage);
    setReviewer(rec.updated_by || "Dr. P. Borah (ASSAC)");
    setJustification("");
    setNotes(rec.notes || "");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;

    const success = await onUpdateEstimate(selectedRecord.id, {
      area_hectares: areaHa,
      yield_mt_ha: yieldHa,
      yield_uncertainty_ci95_lower: ciLower,
      yield_uncertainty_ci95_upper: ciUpper,
      approval_stage: stage,
      updated_by: reviewer,
      justification,
      notes,
    });

    if (success) {
      setSelectedRecord(null);
    }
  };

  const computedBighas = Math.round(areaHa * 7.47);
  const computedProduction = Math.round(areaHa * yieldHa);

  return (
    <div>
      <div className="panel-intro-box">
        <div className="intro-icon">
          <i className="fa-solid fa-sliders"></i>
        </div>
        <div className="intro-text">
          <h3>Departmental Estimation Editor & Field Calibration</h3>
          <p>
            Authorized agricultural officers (DAO, SDAO, ADO) and ASSAC remote sensing
            scientists can review satellite predictions, calibrate yield models using local Crop
            Cutting Experiment (CCE) results, adjust uncertainty bounds, and transition records
            through departmental approval stages.
          </p>
        </div>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div className="search-input-wrap">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              placeholder="Search by district, crop, or reviewer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="toolbar-actions">
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
            >
              <option value="all">Filter All Stages</option>
              <option value="Draft">Draft</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Field Verified">Field Verified</option>
              <option value="Department Approved">Department Approved</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>District</th>
                <th>Crop Name</th>
                <th>Season</th>
                <th>Area (Ha)</th>
                <th>Area (Bighas)</th>
                <th>Yield (MT/Ha)</th>
                <th>95% CI Range</th>
                <th>Production (MT)</th>
                <th>Status / Stage</th>
                <th>Last Calibrated By</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id}>
                  <td>
                    <code>{e.id}</code>
                  </td>
                  <td>
                    <strong>{e.district_name}</strong>
                  </td>
                  <td>{e.crop_name}</td>
                  <td>{e.season}</td>
                  <td>
                    <strong>{e.area_hectares.toLocaleString()}</strong>
                  </td>
                  <td>{(e.area_bighas || Math.round(e.area_hectares * 7.47)).toLocaleString()}</td>
                  <td>
                    <strong style={{ color: "#15803d" }}>
                      {Number(e.yield_mt_ha).toFixed(2)}
                    </strong>
                  </td>
                  <td>
                    <small>
                      {e.yield_uncertainty_ci95_lower} – {e.yield_uncertainty_ci95_upper}
                    </small>
                  </td>
                  <td>
                    <strong>{e.production_mt.toLocaleString()}</strong>
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
                    <small>{e.updated_by || "System Model"}</small>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => handleOpenEdit(e)}
                    >
                      <i className="fa-solid fa-pen"></i> Calibrate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {selectedRecord && (
        <div className="modal-backdrop open">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3>
                <i className="fa-solid fa-pen-to-square"></i> Calibrate Crop Estimate
              </h3>
              <button
                className="modal-close"
                onClick={() => setSelectedRecord(null)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSave} className="modal-body">
              <div className="field-row">
                <div className="field-item">
                  <label>District</label>
                  <input
                    type="text"
                    readOnly
                    className="input-readonly"
                    value={selectedRecord.district_name}
                  />
                </div>
                <div className="field-item">
                  <label>Crop Name</label>
                  <input
                    type="text"
                    readOnly
                    className="input-readonly"
                    value={`${selectedRecord.crop_name} (${selectedRecord.season})`}
                  />
                </div>
              </div>

              <div className="field-row">
                <div className="field-item">
                  <label>Estimated Area (Hectares) *</label>
                  <input
                    type="number"
                    value={areaHa}
                    onChange={(e) => setAreaHa(parseFloat(e.target.value) || 0)}
                    required
                  />
                  <small className="helper-text">
                    ≈ {computedBighas.toLocaleString()} Bighas
                  </small>
                </div>
                <div className="field-item">
                  <label>Forecasted Yield (MT / Ha) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={yieldHa}
                    onChange={(e) => setYieldHa(parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
              </div>

              <div className="field-row">
                <div className="field-item">
                  <label>95% CI Lower Bound (MT/Ha)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={ciLower}
                    onChange={(e) => setCiLower(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="field-item">
                  <label>95% CI Upper Bound (MT/Ha)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={ciUpper}
                    onChange={(e) => setCiUpper(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="computed-box">
                RECALCULATED PRODUCTION:{" "}
                <strong>{computedProduction.toLocaleString()} MT</strong>
              </div>

              <div className="field-row">
                <div className="field-item">
                  <label>Approval Stage *</label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Pending Review">Pending Review</option>
                    <option value="Field Verified">Field Verified</option>
                    <option value="ASSAC Calibrated">ASSAC Calibrated</option>
                    <option value="Department Approved">Department Approved</option>
                  </select>
                </div>
                <div className="field-item">
                  <label>Authorized Reviewer Name *</label>
                  <input
                    type="text"
                    value={reviewer}
                    onChange={(e) => setReviewer(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="field-item">
                <label>Calibration Justification / Audit Reason *</label>
                <input
                  type="text"
                  placeholder="e.g. Calibrated against 42 fresh CCE observations and local rainfall"
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  required
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedRecord(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="fa-solid fa-check"></i> Save & Log Audit Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
