"use client";

import React from "react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
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
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="main-header">
        <div className="header-container">
          <div className="brand-block">
            <div className="brand-logo">
              <i className="fa-solid fa-satellite-dish"></i>
            </div>
            <div className="brand-text">
              <div className="brand-title">
                GeoAgri-Assam <span className="badge-tag">ASSAC AI Engine</span>
              </div>
              <div className="brand-subtitle">
                Crop-Area, Yield & Production Satellite-Ground Estimation Platform
              </div>
            </div>
          </div>

          {/* Telemetry Strip */}
          <div className="telemetry-strip">
            <div className="sensor-pill active" title="Dual-Polarization C-Band SAR penetrating cloud cover">
              <span className="dot pulse"></span>
              <i className="fa-solid fa-radar"></i>
              <div>
                <div className="sensor-name">Sentinel-1 SAR</div>
                <div className="sensor-status">100% Cloud Penetration</div>
              </div>
            </div>
            <div className="sensor-pill warning" title="Monsoon Optical Clouds Masked">
              <span className="dot warning"></span>
              <i className="fa-solid fa-cloud-sun"></i>
              <div>
                <div className="sensor-name">Sentinel-2 MSI</div>
                <div className="sensor-status">74.6% Cloud Masked</div>
              </div>
            </div>
            <div className="sensor-pill active" title="Drone Flights in Nagaon & Barpeta">
              <span className="dot"></span>
              <i className="fa-solid fa-drone"></i>
              <div>
                <div className="sensor-name">UAV High-Res</div>
                <div className="sensor-status">42 Flights Active</div>
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
              className={`nav-btn ${activeTab === "tab-editor" ? "active" : ""}`}
              onClick={() => setActiveTab("tab-editor")}
            >
              <i className="fa-solid fa-pen-to-square"></i> Data Editor & Reconciler
            </button>
            <button
              className={`nav-btn highlight ${activeTab === "tab-fieldapp" ? "active" : ""}`}
              onClick={() => setActiveTab("tab-fieldapp")}
            >
              <i className="fa-solid fa-mobile-screen-button"></i> Field Data Collection App
            </button>
            <button
              className={`nav-btn ${activeTab === "tab-accuracy" ? "active" : ""}`}
              onClick={() => setActiveTab("tab-accuracy")}
            >
              <i className="fa-solid fa-bullseye"></i> Uncertainty & Validation
            </button>
            <button
              className={`nav-btn ${activeTab === "tab-export" ? "active" : ""}`}
              onClick={() => setActiveTab("tab-export")}
            >
              <i className="fa-solid fa-file-export"></i> Departmental Export
            </button>
            <a
              href="/api/download/apk"
              download="ASSAC-GeoAgri-Field-CCE.apk"
              className="nav-btn"
              style={{
                marginLeft: "auto",
                background: "linear-gradient(135deg, #15803d, #166534)",
                color: "#ffffff",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                textDecoration: "none",
                borderRadius: "6px",
                padding: "8px 14px",
                boxShadow: "0 2px 6px rgba(21,128,61,0.25)"
              }}
              title="Download Signed Android APK for Field Smartphones"
            >
              <i className="fa-brands fa-android fa-lg"></i>
              <span>Download APK</span>
            </a>
          </nav>
        </div>
      </header>
    </>
  );
}
