"use client";

import React from "react";

export default function UncertaintyView() {
  const confusionData = [
    { crop: "Sali Rice", true_pos: 94, false_pos: 6, precision: 0.94, recall: 0.92 },
    { crop: "Boro Rice", true_pos: 92, false_pos: 8, precision: 0.92, recall: 0.95 },
    { crop: "Mustard", true_pos: 91, false_pos: 7, precision: 0.93, recall: 0.90 },
    { crop: "Jute", true_pos: 88, false_pos: 10, precision: 0.89, recall: 0.87 },
    { crop: "Tea", true_pos: 96, false_pos: 4, precision: 0.96, recall: 0.95 },
  ];

  return (
    <div>
      <div className="panel-intro-box">
        <div className="intro-icon">
          <i className="fa-solid fa-chart-line"></i>
        </div>
        <div className="intro-text">
          <h3>Uncertainty Quantification & Remote Sensing Telemetry</h3>
          <p>
            As mandated by NESFIC-D-12, the platform produces reproducible district/State-level
            estimates with <strong>explicit uncertainty</strong> and statistical cross-validation
            against ground crop-cutting experiments.
          </p>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrap bg-blue">
            <i className="fa-solid fa-bullseye"></i>
          </div>
          <div className="kpi-body">
            <div className="kpi-label">CLASSIFICATION OVERALL ACCURACY</div>
            <div className="kpi-value">
              89.4 <span className="unit">%</span>
            </div>
            <div className="kpi-sub">Target Benchmark: ≥ 85% (Met)</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap bg-green">
            <i className="fa-solid fa-chart-pie"></i>
          </div>
          <div className="kpi-body">
            <div className="kpi-label">KAPPA COEFFICIENT (κ)</div>
            <div className="kpi-value">0.86</div>
            <div className="kpi-sub">Substantial Agreement with Ground Reality</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap bg-amber">
            <i className="fa-solid fa-arrow-trend-up"></i>
          </div>
          <div className="kpi-body">
            <div className="kpi-label">YIELD MODEL CORRELATION (R²)</div>
            <div className="kpi-value">0.912</div>
            <div className="kpi-sub">Target Benchmark: ≥ 0.75 (Met)</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap bg-purple">
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
          <div className="kpi-body">
            <div className="kpi-label">MEAN ABSOLUTE PCT ERROR (MAPE)</div>
            <div className="kpi-value">
              5.06 <span className="unit">%</span>
            </div>
            <div className="kpi-sub">Explicit 95% Confidence Bounds Output</div>
          </div>
        </div>
      </div>

      <div className="dashboard-split" style={{ marginTop: "20px" }}>
        <div className="card-box">
          <div className="card-box-header">
            <i className="fa-solid fa-table-cells"></i> Multi-Crop Classification Confusion Matrix
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Crop Class</th>
                  <th>True Positive</th>
                  <th>False Positive</th>
                  <th>Precision</th>
                  <th>Recall</th>
                  <th>Evaluation</th>
                </tr>
              </thead>
              <tbody>
                {confusionData.map((row) => (
                  <tr key={row.crop}>
                    <td>
                      <strong>{row.crop}</strong>
                    </td>
                    <td>{row.true_pos}</td>
                    <td>{row.false_pos}</td>
                    <td>{(row.precision * 100).toFixed(1)}%</td>
                    <td>{(row.recall * 100).toFixed(1)}%</td>
                    <td>
                      <span className="badge-tag green">
                        {row.precision >= 0.9 ? "Excellent" : "Good"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card-box">
          <div className="card-box-header">
            <i className="fa-solid fa-satellite"></i> Active Sensor Stack Architecture
          </div>
          <div className="sensor-stack-details">
            <div className="sensor-item">
              <div className="sensor-icon">
                <i className="fa-solid fa-radar"></i>
              </div>
              <div className="sensor-desc">
                <h4>Sentinel-1 SAR C-Band (Dual-Pol VV/VH)</h4>
                <p>
                  <strong>Primary Monsoon Workhorse:</strong> 100% immune to cloud cover.
                  Captures early transplanting water specular reflection and rapid vegetative
                  volume scattering across Sali rice belts.
                </p>
              </div>
            </div>
            <div className="sensor-item">
              <div className="sensor-icon">
                <i className="fa-solid fa-sun"></i>
              </div>
              <div className="sensor-desc">
                <h4>Sentinel-2 MSI Optical (10m / 20m)</h4>
                <p>
                  <strong>Rabi & Autumn Specialist:</strong> Red-Edge (B5, B6) and NIR (B8)
                  provide clear NDVI/NDRE signatures for Mustard, Boro rice, and Tea during the
                  cloud-free October–March window.
                </p>
              </div>
            </div>
            <div className="sensor-item">
              <div className="sensor-icon">
                <i className="fa-solid fa-drone"></i>
              </div>
              <div className="sensor-desc">
                <h4>UAV / Drone Transects</h4>
                <p>
                  <strong>Sub-Pixel Calibration:</strong> 3cm Ground Sampling Distance (GSD)
                  used in representative blocks to resolve smallholder boundaries and mixed-crop
                  plots.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
