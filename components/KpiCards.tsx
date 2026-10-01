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
  return (
    <div className="kpi-grid">
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
            {totalAreaBighas.toLocaleString()} Bighas (1 Ha = 7.47 Bighas)
          </div>
        </div>
      </div>

      <div className="kpi-card">
        <div className="kpi-icon-wrap bg-green">
          <i className="fa-solid fa-scale-balanced"></i>
        </div>
        <div className="kpi-body">
          <div className="kpi-label">WEIGHTED FORECAST YIELD</div>
          <div className="kpi-value">
            {weightedYield.toFixed(2)} <span className="unit">MT / Ha</span>
          </div>
          <div className="kpi-sub highlight-ci">95% CI: ± 0.22 MT/Ha</div>
        </div>
      </div>

      <div className="kpi-card">
        <div className="kpi-icon-wrap bg-amber">
          <i className="fa-solid fa-boxes-stacked"></i>
        </div>
        <div className="kpi-body">
          <div className="kpi-label">TOTAL PRODUCTION FORECAST</div>
          <div className="kpi-value">
            {totalProdMt.toLocaleString()} <span className="unit">MT</span>
          </div>
          <div className="kpi-sub">Procurement Target Baseline</div>
        </div>
      </div>

      <div className="kpi-card">
        <div className="kpi-icon-wrap bg-purple">
          <i className="fa-solid fa-location-crosshairs"></i>
        </div>
        <div className="kpi-body">
          <div className="kpi-label">GROUND CCE OBSERVATIONS</div>
          <div className="kpi-value">
            {cceCount} <span className="unit">Points</span>
          </div>
          <div className="kpi-sub">{verifiedCount} Verified by ADO/DAO</div>
        </div>
      </div>
    </div>
  );
}
