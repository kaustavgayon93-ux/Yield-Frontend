"use client";

import React, { useEffect, useRef } from "react";

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

            const iconHtml = `<div style="background:#0284c7; color:#fff; border-radius:50%; width:26px; height:26px; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:11px; border:2px solid #fff; box-shadow:0 2px 6px rgba(0,0,0,0.3);"><i class="fa-solid fa-satellite"></i></div>`;
            const customIcon = L.divIcon({
              html: iconHtml,
              className: "district-icon",
              iconSize: [26, 26],
            });

            const marker = L.marker([d.lat, d.lng], { icon: customIcon });
            marker.bindPopup(`
              <div style="font-family:'Plus Jakarta Sans', sans-serif; padding:4px;">
                <h4 style="margin:0 0 4px; color:#0f172a; font-size:14px;">${d.name} District</h4>
                <div style="font-size:11px; color:#64748b; margin-bottom:8px;">Zone: ${d.zone}</div>
                <div style="font-size:12px; line-height:1.4;">
                  <div><strong>Tracked Cropped Area:</strong> ${totalArea.toLocaleString()} Ha</div>
                  <div><strong>Forecast Production:</strong> ${totalProd.toLocaleString()} MT</div>
                  <div><strong>Major Crops:</strong> ${(d.major_crops || []).join(", ")}</div>
                </div>
              </div>
            `);
            districtLayerRef.current.addLayer(marker);
          });
        }
      }

      // Render CCE Points
      if (cceLayerRef.current) {
        cceLayerRef.current.clearLayers();
        if (showCcePoints) {
          fieldRecords.forEach((cce) => {
            const isApproved = (cce.verification_status || "").includes("Approved");
            const color = isApproved ? "#16a34a" : "#f59e0b";

            const iconHtml = `<div style="background:${color}; color:#fff; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; font-size:10px; border:2px solid #fff; box-shadow:0 2px 6px rgba(0,0,0,0.3);"><i class="fa-solid fa-wheat-awn"></i></div>`;
            const cceIcon = L.divIcon({
              html: iconHtml,
              className: "cce-icon",
              iconSize: [24, 24],
            });

            const marker = L.marker([cce.plot_lat, cce.plot_lng], { icon: cceIcon });
            marker.bindPopup(`
              <div style="font-family:'Plus Jakarta Sans', sans-serif; min-width:220px; font-size:12px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                  <strong style="color:#1b5e20; font-size:13px;">${cce.crop_name}</strong>
                  <span style="background:${
                    isApproved ? "#dcfce7" : "#fef3c7"
                  }; color:${
              isApproved ? "#166534" : "#92400e"
            }; padding:1px 6px; border-radius:4px; font-size:10px; font-weight:700;">${
              cce.verification_status
            }</span>
                </div>
                <div><strong>Location:</strong> ${cce.village}, ${cce.block} (${cce.district_name})</div>
                <div><strong>Farmer:</strong> ${cce.farmer_name} (${cce.dag_no || "Plot"})</div>
                <div><strong>Cut Biomass:</strong> ${cce.fresh_biomass_kg} kg / ${cce.cce_plot_area_sqm} sqm</div>
                <div style="margin:4px 0; font-size:13px;"><strong>Computed Yield:</strong> <span style="color:#15803d; font-weight:800;">${cce.computed_yield_mt_ha} MT/Ha</span></div>
                ${
                  cce.flood_submergence_depth_cm > 0
                    ? `<div style="color:#b91c1c;">⚠️ Submergence: ${cce.flood_submergence_depth_cm}cm (${cce.flood_inundation_days} days)</div>`
                    : ""
                }
                <div style="font-size:10px; color:#64748b; margin-top:6px;">Enumerator: ${cce.enumerator_name} | GPS Acc: ±${cce.gps_accuracy_m}m</div>
              </div>
            `);
            cceLayerRef.current.addLayer(marker);
          });
        }
      }
    });
  }, [districts, estimates, fieldRecords, showCcePoints, showDistricts]);

  return (
    <div
      ref={mapContainerRef}
      className="gis-map-canvas"
      style={{ height: "480px", width: "100%" }}
    />
  );
}
