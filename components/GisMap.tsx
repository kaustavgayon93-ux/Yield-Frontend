"use client";

import React, { useEffect, useRef, useState } from "react";

interface GisMapProps {
  districts: any[];
  estimates: any[];
  fieldRecords: any[];
  showCcePoints: boolean;
  showDistricts: boolean;
}

export default function GisMap({
  districts,
  estimates,
  fieldRecords,
  showCcePoints,
  showDistricts,
}: GisMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const districtLayerRef = useRef<any>(null);
  const cceLayerRef = useRef<any>(null);
  const zoneFocusLayerRef = useRef<any>(null);

  const [activeZoneFilter, setActiveZoneFilter] = useState("all");

  const flyToZone = (lat: number, lng: number, zoom: number, zoneName: string) => {
    setActiveZoneFilter(zoneName);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], zoom, { duration: 1.2 });
    }
  };

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    // Dynamically load leaflet
    import("leaflet").then((L) => {
      if (!mapInstanceRef.current && mapContainerRef.current) {
        const map = L.map(mapContainerRef.current).setView([26.25, 92.85], 7);

        L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
          {
            attribution:
              "&copy; OpenStreetMap &copy; CARTO | ASSAC Remote Sensing Portal",
            maxZoom: 18,
          }
        ).addTo(map);

        districtLayerRef.current = L.layerGroup().addTo(map);
        cceLayerRef.current = L.layerGroup().addTo(map);
        zoneFocusLayerRef.current = L.layerGroup().addTo(map);
        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;
      if (!map) return;

      // Render District Hubs
      if (districtLayerRef.current) {
        districtLayerRef.current.clearLayers();
        if (showDistricts) {
          districts.forEach((d) => {
            const matching = estimates.filter((e) => e.district_id === d.id);
            const totalArea = matching.reduce((sum, e) => sum + (e.area_hectares || 0), 0);
            const totalProd = matching.reduce((sum, e) => sum + (e.production_mt || 0), 0);

            // Zone-specific color coding
            let hubColor = "#0284c7"; // default blue
            if (d.zone === "Upper Brahmaputra Valley") hubColor = "#166534";
            else if (d.zone === "North Bank Plain") hubColor = "#0284c7";
            else if (d.zone === "Central Brahmaputra Valley") hubColor = "#d97706";
            else if (d.zone === "Lower Brahmaputra Valley") hubColor = "#2563eb";
            else if (d.zone === "Barak Valley") hubColor = "#7c3aed";
            else if (d.zone === "Hills Zone") hubColor = "#b45309";

            const iconHtml = `<div style="background:${hubColor}; color:#fff; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:11px; border:2px solid #fff; box-shadow:0 3px 8px rgba(0,0,0,0.35);" title="${d.name} (${d.zone})"><i class="fa-solid fa-satellite"></i></div>`;
            const customIcon = L.divIcon({
              html: iconHtml,
              className: "district-icon",
              iconSize: [28, 28],
            });

            const marker = L.marker([d.lat, d.lng], { icon: customIcon });
            marker.bindPopup(`
              <div style="font-family:'Plus Jakarta Sans', sans-serif; min-width:240px; padding:6px;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:1px solid #e2e8f0; padding-bottom:6px; margin-bottom:8px;">
                  <div>
                    <h4 style="margin:0; color:#0f172a; font-size:15px; font-weight:800;">${d.name} District</h4>
                    <span style="font-size:10px; color:#64748b; font-weight:600; text-transform:uppercase;">HQ: ${d.headquarters || d.name}</span>
                  </div>
                  <span style="background:#e0f2fe; color:#0369a1; padding:2px 8px; border-radius:999px; font-size:10px; font-weight:700;">${d.zone}</span>
                </div>
                
                <div style="font-size:12px; line-height:1.6; color:#334155;">
                  <div><strong>Tracked Cropped Area:</strong> <span style="color:#0f172a; font-weight:700;">${totalArea.toLocaleString()} Ha</span> (${Math.round(totalArea * 7.47).toLocaleString()} Bighas)</div>
                  <div><strong>Forecast Production:</strong> <span style="color:#15803d; font-weight:700;">${totalProd.toLocaleString()} MT</span></div>
                  <div><strong>Soil Classification:</strong> ${d.soil_type || "Riverine Alluvium"}</div>
                  <div><strong>Annual Normal Rainfall:</strong> ${d.annual_rainfall_mm || 2200} mm</div>
                  <div style="margin-top:4px;"><strong>Major Crops:</strong> <span style="font-size:11px; color:#475569;">${(d.major_crops || []).join(", ")}</span></div>
                </div>
              </div>
            `);
            districtLayerRef.current.addLayer(marker);
          });
        }
      }

      // Render CCE Ground Truth Points
      if (cceLayerRef.current) {
        cceLayerRef.current.clearLayers();
        if (showCcePoints) {
          fieldRecords.forEach((cce) => {
            const isApproved = (cce.verification_status || "").includes("Approved");
            const color = isApproved ? "#15803d" : "#eab308";

            const iconHtml = `<div style="background:${color}; color:#fff; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; font-size:10px; border:2px solid #fff; box-shadow:0 2px 6px rgba(0,0,0,0.3);"><i class="fa-solid fa-wheat-awn"></i></div>`;
            const cceIcon = L.divIcon({
              html: iconHtml,
              className: "cce-icon",
              iconSize: [24, 24],
            });

            const marker = L.marker([cce.plot_lat, cce.plot_lng], { icon: cceIcon });
            marker.bindPopup(`
              <div style="font-family:'Plus Jakarta Sans', sans-serif; min-width:250px; font-size:12px; padding:4px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; border-bottom:1px solid #e2e8f0; padding-bottom:6px;">
                  <div>
                    <strong style="color:#15803d; font-size:13px;">${cce.crop_name}</strong>
                    <div style="font-size:10px; color:#64748b;">${cce.id} • ${cce.variety || "Local"}</div>
                  </div>
                  <span style="background:${
                    isApproved ? "#dcfce7" : "#fef3c7"
                  }; color:${
                    isApproved ? "#166534" : "#92400e"
                  }; padding:2px 8px; border-radius:4px; font-size:10px; font-weight:700;">
                    ${isApproved ? "Verified & Approved" : "Pending Audit"}
                  </span>
                </div>

                <div style="line-height:1.5; color:#334155;">
                  <div><strong>Plot Location:</strong> ${cce.village}, ${cce.block} (${cce.district_name})</div>
                  <div><strong>Farmer Name:</strong> ${cce.farmer_name} (${cce.dag_no || "Plot"})</div>
                  <div><strong>5m×5m Fresh Biomass:</strong> ${cce.fresh_biomass_kg} kg (Moisture: ${cce.moisture_pct}%)</div>
                  
                  <div style="margin:6px 0; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; padding:4px 8px;">
                    <div style="font-size:11px; color:#166534; font-weight:600;">14% Moisture Standardized Yield:</div>
                    <div style="font-size:15px; font-weight:800; color:#15803d;">
                      ${cce.computed_yield_mt_ha} MT/Ha
                      <span style="font-size:11px; font-weight:600; color:#475569; margin-left:6px;">
                        (${Number(((cce.computed_yield_mt_ha * 1000) / 7.47).toFixed(1))} kg/Bigha)
                      </span>
                    </div>
                  </div>

                  ${
                    cce.flood_submergence_depth_cm > 0
                      ? `<div style="background:#fef2f2; border:1px solid #fecaca; border-radius:4px; padding:3px 6px; color:#991b1b; font-size:11px; margin-bottom:4px;">
                           ⚠️ <strong>Flood Inundation:</strong> ${cce.flood_submergence_depth_cm}cm depth for ${cce.flood_inundation_days} days
                         </div>`
                      : ""
                  }

                  <div style="font-size:10px; color:#64748b; margin-top:4px;">
                    Enumerator: ${cce.enumerator_name} | GPS Fix: ±${cce.gps_accuracy_m}m
                  </div>
                </div>
              </div>
            `);
            cceLayerRef.current.addLayer(marker);
          });
        }
      }
    });
  }, [districts, estimates, fieldRecords, showCcePoints, showDistricts]);

  return (
    <div className="gis-map-wrapper">
      {/* Zone Quick-Zoom Navigation Bar */}
      <div className="zone-jump-bar">
        <span className="jump-title">
          <i className="fa-solid fa-compass"></i> Focus Region:
        </span>
        <button
          className={`zone-pill ${activeZoneFilter === "all" ? "active" : ""}`}
          onClick={() => flyToZone(26.25, 92.85, 7, "all")}
        >
          Statewide Assam (All 35 Districts)
        </button>
        <button
          className={`zone-pill ${activeZoneFilter === "ubvz" ? "active" : ""}`}
          onClick={() => flyToZone(26.95, 94.60, 8, "ubvz")}
        >
          Upper Brahmaputra (Tea Belt)
        </button>
        <button
          className={`zone-pill ${activeZoneFilter === "cbvz" ? "active" : ""}`}
          onClick={() => flyToZone(26.25, 92.50, 9, "cbvz")}
        >
          Central Brahmaputra (Nagaon / Morigaon)
        </button>
        <button
          className={`zone-pill ${activeZoneFilter === "lbvz" ? "active" : ""}`}
          onClick={() => flyToZone(26.35, 91.00, 8, "lbvz")}
        >
          Lower Brahmaputra (Barpeta / Dhubri)
        </button>
        <button
          className={`zone-pill ${activeZoneFilter === "bvz" ? "active" : ""}`}
          onClick={() => flyToZone(24.80, 92.70, 9, "bvz")}
        >
          Barak Valley (Cachar / Silchar)
        </button>
        <button
          className={`zone-pill ${activeZoneFilter === "hz" ? "active" : ""}`}
          onClick={() => flyToZone(25.80, 93.10, 8, "hz")}
        >
          Hills Zone (Karbi Anglong / Haflong)
        </button>
      </div>

      <div
        ref={mapContainerRef}
        className="gis-map-canvas"
        style={{ height: "500px", width: "100%", borderRadius: "8px" }}
      />
    </div>
  );
}
