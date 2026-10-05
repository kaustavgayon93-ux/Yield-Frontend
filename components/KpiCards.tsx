"use client";

import React from "react";

interface KpiCardsProps {
  totalAreaHa: number;
  totalAreaBighas: number;
  weightedYield: number;
  totalProdMt: number;
  cceCount: number;
  verifiedCount: number;
}

export default function KpiCards({
  totalAreaHa,
  totalAreaBighas,
  weightedYield,
  totalProdMt,
  cceCount,
  verifiedCount,
}: KpiCardsProps) {
  // Estimated economic value at indicative baseline MSP (₹ 2,300/quintal = ₹ 23,000/MT for paddy/foodgrains)
  const estMspValueCr = Math.round((totalProdMt * 23000) / 10000000);
  const verifiedRate = cceCount > 0 ? Math.round((verifiedCount / cceCount) * 100) : 0;

  return (
    <div className="kpi-grid">
      {/* 1. Cropped Area */}
      <div className="kpi-card">
        <div className="kpi-icon-wrap bg-blue">
          <i className="fa-solid fa-draw-polygon"></i>
        </div>
        <div className="kpi-body">
          <div className="kpi-label">ESTIMATED CROPPED AREA</div>
          <div className="kpi-value">
            {totalAreaHa.toLocaleString()} <span className="unit">Ha</span>
          </div>
          <div className="kpi-sub">
            <strong>{totalAreaBighas.toLocaleString()}</strong> Bighas (1 Ha = 7.47 Bighas)
          </div>
          <div className="kpi-footer-badge">
            <i className="fa-solid fa-map-marked-alt"></i> Sensed via Sentinel-1 SAR Dual-Pol
          </div>
        </div>
      </div>

      {/* 2. Forecast Yield */}
      <div className="kpi-card">
        <div className="kpi-icon-wrap bg-green">
          <i className="fa-solid fa-scale-balanced"></i>
        </div>
        <div className="kpi-body">
          <div className="kpi-label">WEIGHTED FORECAST YIELD</div>
          <div className="kpi-value">
            {weightedYield.toFixed(2)} <span className="unit">MT / Ha</span>
          </div>
          <div className="kpi-sub highlight-ci">
            <i className="fa-solid fa-chart-line"></i> 95% Confidence Interval: ± 0.36 MT/Ha
          </div>
          <div className="kpi-footer-badge green">
            <i className="fa-solid fa-circle-check"></i> Ridge ML Model R² = 0.912 • MAPE 5.06%
          </div>
        </div>
      </div>

      {/* 3. Production Forecast */}
      <div className="kpi-card">
        <div className="kpi-icon-wrap bg-amber">
          <i className="fa-solid fa-boxes-stacked"></i>
        </div>
        <div className="kpi-body">
          <div className="kpi-label">TOTAL PRODUCTION FORECAST</div>
          <div className="kpi-value">
            {totalProdMt.toLocaleString()} <span className="unit">MT</span>
          </div>
          <div className="kpi-sub">
            Est. Economic Value: <strong>₹ {estMspValueCr.toLocaleString()} Cr</strong> (at MSP)
          </div>
          <div className="kpi-footer-badge amber">
            <i className="fa-solid fa-building-wheat"></i> FCI & ASAMB Procurement Baseline
          </div>
        </div>
      </div>

      {/* 4. Ground CCE Ground Truth */}
      <div className="kpi-card">
        <div className="kpi-icon-wrap bg-purple">
          <i className="fa-solid fa-location-crosshairs"></i>
        </div>
        <div className="kpi-body">
          <div className="kpi-label">GROUND CCE OBSERVATIONS</div>
          <div className="kpi-value">
            {cceCount} <span className="unit">Plots (5m×5m)</span>
          </div>
          <div className="kpi-sub">
            <strong>{verifiedCount}</strong> Verified by ADO/DAO ({verifiedRate}% Audit Rate)
          </div>
          <div className="kpi-footer-badge purple">
            <i className="fa-solid fa-droplet"></i> Standardized to 14% Moisture Base
          </div>
        </div>
      </div>
    </div>
  );
}
