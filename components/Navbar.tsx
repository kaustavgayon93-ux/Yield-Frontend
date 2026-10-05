"use client";

import React, { useState, useEffect } from "react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const [timeStr, setTimeStr] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
          timeZone: "Asia/Kolkata",
        }) + " IST"
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Top Govt Banner */}
      <div className="gov-topbar">
        <div className="gov-container">
          <div className="gov-emblem-badge">
            <span className="flag-icon">🇮🇳</span>
            <span>GOVERNMENT OF ASSAM • অসম চৰকাৰ | NESFIC-2026 CHALLENGE STREAM 1 (NESFIC-D-12)</span>
          </div>
          <div className="gov-links">
            <span>Assam State Space Applications Centre (ASSAC)</span>
            <span className="sep">|</span>
            <span>Directorate of Agriculture & Horticulture</span>
            {timeStr && (
              <>
                <span className="sep">|</span>
                <span style={{ color: "#facc15", fontWeight: 700 }}>
                  <i className="fa-regular fa-clock"></i> {timeStr}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="main-header">
        <div className="header-container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div className="brand-block">
              <div className="brand-logo">
                <i className="fa-solid fa-satellite-dish"></i>
              </div>
              <div className="brand-text">
                <div className="brand-title">
                  GeoAgri-Assam <span className="badge-tag">ASSAC AI Engine</span>
                  <span className="badge-tag green" style={{ fontSize: "10px" }}>v2.4 Production</span>
                </div>
                <div className="brand-subtitle">
                  Statewide Satellite-Ground Crop Acreage, Yield & Production Estimation System (All 35 Districts • 56 Crops)
                </div>
              </div>
            </div>

            {/* Telemetry Strip */}
            <div className="telemetry-strip">
              <div className="sensor-pill active" title="Dual-Polarization C-Band SAR penetrating cloud cover">
                <span className="dot pulse"></span>
                <i className="fa-solid fa-satellite"></i>
                <div>
                  <div className="sensor-name">Sentinel-1 SAR</div>
                  <div className="sensor-status" style={{ color: "#166534" }}>100% Cloud Penetration</div>
                </div>
              </div>
              <div className="sensor-pill warning" title="Monsoon Optical Clouds Masked">
                <span className="dot warning"></span>
                <i className="fa-solid fa-cloud-sun"></i>
                <div>
                  <div className="sensor-name">Sentinel-2 MSI</div>
                  <div className="sensor-status" style={{ color: "#92400e" }}>74.6% Cloud Masked</div>
                </div>
              </div>
              <div className="sensor-pill active" title="Model Accuracy: Ridge Regression R² = 0.912, MAPE = 5.06%">
                <span className="dot"></span>
                <i className="fa-solid fa-brain"></i>
                <div>
                  <div className="sensor-name">ML Ridge Engine</div>
                  <div className="sensor-status" style={{ color: "#166534" }}>R² = 0.912 • MAPE 5.06%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="nav-tabs">
            <button
              className={`nav-btn ${activeTab === "tab-dashboard" ? "active" : ""}`}
              onClick={() => setActiveTab("tab-dashboard")}
            >
              <i className="fa-solid fa-chart-pie"></i> Executive GIS Dashboard
            </button>
            <button
              className={`nav-btn ${activeTab === "tab-crops" ? "active" : ""}`}
              onClick={() => setActiveTab("tab-crops")}
            >
              <i className="fa-solid fa-book-bookmark"></i> Assam 56-Crop Directory
            </button>
            <button
              className={`nav-btn ${activeTab === "tab-accuracy" ? "active" : ""}`}
              onClick={() => setActiveTab("tab-accuracy")}
            >
              <i className="fa-solid fa-bullseye"></i> Uncertainty & ML Simulator
            </button>
            <button
              className={`nav-btn ${activeTab === "tab-editor" ? "active" : ""}`}
              onClick={() => setActiveTab("tab-editor")}
            >
              <i className="fa-solid fa-pen-to-square"></i> Data Editor & Reconciler
            </button>
            <button
              className={`nav-btn highlight ${activeTab === "tab-fieldapp" ? "active" : ""}`}
              onClick={() => setActiveTab("tab-fieldapp")}
            >
              <i className="fa-solid fa-mobile-screen-button"></i> Field CCE Mobile App
            </button>
            <button
              className={`nav-btn ${activeTab === "tab-export" ? "active" : ""}`}
              onClick={() => setActiveTab("tab-export")}
            >
              <i className="fa-solid fa-file-export"></i> Schedule VI & Export
            </button>

            <a
              href="/api/download/apk"
              download="ASSAC-GeoAgri-Field-CCE.apk"
              className="nav-btn apk-btn"
              title="Download Standalone Signed Android APK for Field Smartphones (4.70 MB)"
            >
              <i className="fa-brands fa-android fa-lg"></i>
              <span>Download Field APK</span>
              <span className="apk-size-pill">4.7 MB</span>
            </a>
          </nav>
        </div>
      </header>
    </>
  );
}
