# GeoAgri-Assam: Satellite & Ground Crop Estimation Platform

**NESFIC 2026 Challenge Stream 1 (NESFIC-D-12)**  
*Assam State Space Applications Centre (ASSAC) & Directorate of Agriculture, Government of Assam*

---

## 📚 Project Documentation & References

Comprehensive reference documents are stored in the [`docs/`](./docs) folder:
* 📄 **[Product Requirement Document (PRD)](./docs/PRD.md):** Official requirements, user stories, functional and non-functional specifications.
* 🏛️ **[Technical Architecture Blueprint](./docs/ARCHITECTURE.md):** Remote sensing SAR/optical pipeline, machine learning regression, CCE math, and system design.
* 🌾 **[Comprehensive Assam Crops Catalog](./docs/CROPS_CATALOG_ASSAM.md):** Complete inventory of all 56 crops grown in Assam with Assamese local names, seasons, and yield profiles.
* 🤖 **[Claude AI Session Context Guide](./docs/CLAUDE_SESSION_CONTEXT.md):** Guide for AI agents and developer sessions resuming work on this system.

---

## 🌾 Project Overview

This is the Next.js frontend application built to solve the **NESFIC-D-12** challenge statement:
> *"Improve the timeliness, repeatability and spatial detail of crop-area, yield and production estimates for planning, procurement and programme monitoring."*

### Key Features
1. **Executive GIS Dashboard:**
   - Interactive Leaflet GIS mapping centered on Assam with district aggregations and CCE observation pins.
   - Dual-Polarization **Sentinel-1 SAR C-Band** telemetry (for 100% monsoon cloud penetration during Sali rice season).
   - Real-time KPI summaries for Cropped Area (Hectares & Assamese **Bighas**), Forecast Yield (MT/Ha) with explicit **95% Confidence Intervals**, and Total Production (Metric Tonnes).
2. **Departmental Data Editor & Reconciler:**
   - Review AI/SAR predictions vs. ground observations.
   - Adjust calibration factors, area, and yield with real-time recalculation of Bighas and Total Production.
   - Approval stages: `Draft` → `Pending Review` → `Field Verified` → `ASSAC Calibrated` → `Department Approved`.
   - Immutable audit trail tracking changes, timestamps, and justifications.
3. **Field Data Collection Application (Mobile / Enumerator Mode):**
   - Responsive smartphone interface for field enumerators, ADOs, and Patwaris.
   - Automatic GPS geotagging (Latitude, Longitude, Accuracy radius).
   - Standard 5m × 5m Crop Cutting Experiment (CCE) fresh cut biomass calculator with moisture adjustment (standard 14%).
   - Flood submergence tracking (depth in cm, duration in days).
   - Simulated watermarked field photo capture.
4. **Complete Assam Crop Catalog:**
   - Covers all 56 agricultural, horticultural, plantation, and cash crops cultivated across Assam.
5. **Statistical Uncertainty & Export:**
   - Confusion matrix, Overall Accuracy (89.4%), Kappa (0.86), $R^2$ (0.912), and MAPE (5.06%).
   - One-click export for **Government of Assam Schedule VI** reporting (CSV, GeoJSON, JSON).

---

## 🛠️ Tech Stack
- **Framework:** Next.js 14 (App Router)
- **UI & Visualization:** React, Leaflet GIS, Chart.js
- **Styling:** Custom CSS with Government of Assam branding & mobile frame simulator
- **Language:** TypeScript

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
