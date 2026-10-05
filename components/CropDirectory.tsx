"use client";

import React, { useState } from "react";

interface CropDirectoryProps {
  crops: any[];
}

export default function CropDirectory({ crops }: CropDirectoryProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSeason, setSelectedSeason] = useState("all");
  const [selectedCropModal, setSelectedCropModal] = useState<any | null>(null);

  const categories = Array.from(new Set(crops.map((c) => c.category)));
  const seasons = [
    "Kharif",
    "Rabi",
    "Summer",
    "Perennial",
  ];

  const filteredCrops = crops.filter((c) => {
    const matchesSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.local_name && c.local_name.toLowerCase().includes(search.toLowerCase())) ||
      (c.varieties && c.varieties.some((v: string) => v.toLowerCase().includes(search.toLowerCase())));

    const matchesCategory =
      selectedCategory === "all" || c.category === selectedCategory;

    const matchesSeason =
      selectedSeason === "all" ||
      (c.season && c.season.toLowerCase().includes(selectedSeason.toLowerCase()));

    return matchesSearch && matchesCategory && matchesSeason;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Cereals & Food Grains":
        return "fa-wheat-awn";
      case "Pulses":
        return "fa-seedling";
      case "Oilseeds":
        return "fa-droplet";
      case "Fibre & Commercial Cash Crops":
        return "fa-scroll";
      case "Plantation Crops":
        return "fa-mug-hot";
      case "Horticultural - Fruits":
        return "fa-apple-whole";
      case "Horticultural - Vegetables":
        return "fa-carrot";
      case "Spices & Condiments":
        return "fa-pepper-hot";
      case "Sericulture Host Plants":
        return "fa-leaf";
      default:
        return "fa-plant-wilt";
    }
  };

  return (
    <div className="crop-directory-container">
      {/* Intro Header */}
      <div className="panel-intro-box">
        <div className="intro-icon">
          <i className="fa-solid fa-book-bookmark"></i>
        </div>
        <div className="intro-text">
          <h3>Assam 56-Crop Official Agricultural & Remote Sensing Directory</h3>
          <p>
            Complete catalog of all <strong>56 crops</strong> grown across Assam's 6 Agro-Climatic Zones as
            cataloged under <strong>NESFIC-2026 Stream 1 (NESFIC-D-12)</strong>. Includes local Assamese nomenclature,
            crop phenology calendars, Sentinel-1 SAR radar backscatter traits, and optical cloud-resilience signatures.
          </p>
        </div>
      </div>

      {/* Directory Filter Strip */}
      <div className="filter-strip" style={{ marginBottom: "20px" }}>
        <div className="search-input-wrap" style={{ minWidth: "280px" }}>
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Search 56 crops (e.g., Sali Rice, সৰিয়হ, Kaji Nemu)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>
            <i className="fa-solid fa-layer-group"></i> Category ({categories.length})
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All 9 Categories ({crops.length} Crops)</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat} ({crops.filter((c) => c.category === cat).length})
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>
            <i className="fa-solid fa-calendar-days"></i> Season
          </label>
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
          >
            <option value="all">All Seasons</option>
            {seasons.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <button
          className="btn btn-secondary"
          onClick={() => {
            setSearch("");
            setSelectedCategory("all");
            setSelectedSeason("all");
          }}
        >
          <i className="fa-solid fa-arrows-rotate"></i> Reset
        </button>

        <div style={{ marginLeft: "auto", fontSize: "12px", color: "var(--text-muted)", alignSelf: "center" }}>
          Showing <strong>{filteredCrops.length}</strong> of <strong>{crops.length}</strong> Crops
        </div>
      </div>

      {/* Crops Grid */}
      <div className="crops-card-grid">
        {filteredCrops.map((crop) => {
          const isGi = (crop.name || "").includes("GI Tagged") || (crop.id || "").includes("bhut-jolokia") || (crop.id || "").includes("assam-lemon");
          return (
            <div
              key={crop.id}
              className="crop-card"
              onClick={() => setSelectedCropModal(crop)}
            >
              <div className="crop-card-header">
                <div className="crop-category-badge">
                  <i className={`fa-solid ${getCategoryIcon(crop.category)}`}></i>
                  <span>{crop.category}</span>
                </div>
                {isGi && (
                  <span className="badge-gi" title="Geographical Indication Tagged Crop of Assam">
                    <i className="fa-solid fa-award"></i> GI Tag
                  </span>
                )}
              </div>

              <div className="crop-card-body">
                <h4 className="crop-name-title">{crop.name}</h4>
                <div className="crop-local-name">
                  <span>অসমীয়া:</span> <strong>{crop.local_name || "—"}</strong>
                </div>

                <div className="crop-meta-tags">
                  <span className="meta-pill">
                    <i className="fa-solid fa-calendar"></i> {crop.season || "Annual"}
                  </span>
                  <span className="meta-pill yield">
                    <i className="fa-solid fa-chart-simple"></i> {crop.typical_yield_range_mtha || "—"} MT/Ha
                  </span>
                </div>

                <div className="crop-brief-desc">
                  <strong>SAR Signature:</strong>{" "}
                  {crop.sar_sensitivity ? crop.sar_sensitivity.slice(0, 95) + "..." : "C-Band backscatter tracking"}
                </div>
              </div>

              <div className="crop-card-footer">
                <span className="view-detail-btn">
                  View Full Phenology & Remote Sensing <i className="fa-solid fa-arrow-right"></i>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Crop Details Modal */}
      {selectedCropModal && (
        <div className="modal-backdrop" onClick={() => setSelectedCropModal(null)}>
          <div className="modal-box crop-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div className="modal-icon-badge">
                  <i className={`fa-solid ${getCategoryIcon(selectedCropModal.category)}`}></i>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px", color: "#0f172a" }}>
                    {selectedCropModal.name}
                  </h3>
                  <div style={{ fontSize: "13px", color: "#166534", fontWeight: 700 }}>
                    অসমীয়া স্থানীয় নাম: {selectedCropModal.local_name}
                  </div>
                </div>
              </div>
              <button className="btn-close" onClick={() => setSelectedCropModal(null)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="crop-detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Crop Category</span>
                  <span className="detail-val font-semibold">{selectedCropModal.category}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Cropping Season</span>
                  <span className="detail-val">{selectedCropModal.season}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Sowing / Planting Window</span>
                  <span className="detail-val">{selectedCropModal.sowing_window || "Seasonal"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Harvesting Window</span>
                  <span className="detail-val">{selectedCropModal.harvest_window || "Seasonal"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Typical Yield Range</span>
                  <span className="detail-val font-bold" style={{ color: "#15803d" }}>
                    {selectedCropModal.typical_yield_range_mtha} MT / Ha
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Soil & Terrain Preference</span>
                  <span className="detail-val">{selectedCropModal.soil_preference || "Alluvial floodplain"}</span>
                </div>
              </div>

              {/* Recommended Varieties */}
              <div className="detail-section-box">
                <div className="section-title">
                  <i className="fa-solid fa-seedling"></i> Recommended Varieties / Cultivars in Assam
                </div>
                <div className="variety-pill-list">
                  {(selectedCropModal.varieties || ["Assam Local Selection"]).map((v: string) => (
                    <span key={v} className="variety-pill">
                      {v}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sentinel-1 SAR Dual-Pol Trajectory */}
              <div className="detail-section-box sar-box">
                <div className="section-title" style={{ color: "#0369a1" }}>
                  <i className="fa-solid fa-radar"></i> Sentinel-1 C-Band SAR Radar Detection Trajectory (100% Cloud Penetration)
                </div>
                <p style={{ margin: "4px 0 0", fontSize: "13px", lineHeight: "1.5", color: "#1e293b" }}>
                  {selectedCropModal.sar_sensitivity || "SAR C-band cross-polarization (VH) backscatter increases during vegetative development."}
                </p>
              </div>

              {/* Optical Challenges */}
              <div className="detail-section-box optical-box">
                <div className="section-title" style={{ color: "#b45309" }}>
                  <i className="fa-solid fa-cloud-sun"></i> Optical Remote Sensing (Sentinel-2 MSI) Window & Challenges
                </div>
                <p style={{ margin: "4px 0 0", fontSize: "13px", lineHeight: "1.5", color: "#1e293b" }}>
                  {selectedCropModal.optical_challenge || "Optical coverage severely hindered by monsoon cloud cover (>75%). Filtered clear-sky composite required."}
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-primary"
                onClick={() => setSelectedCropModal(null)}
              >
                Close Crop Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
