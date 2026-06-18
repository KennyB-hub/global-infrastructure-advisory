# Universal Dashboard Engine (UDE)
### © 2026 Global Infrastructure Advisory  
### Seven Runtime — Sector‑Adaptive, Mission‑Adaptive, Role‑Adaptive UI Engine

The **Universal Dashboard Engine (UDE)** is the OS‑level UI subsystem inside Seven Runtime.  
It provides a **single dashboard engine** that automatically adapts to:

- Any **sector** (Agriculture, Air, Grid, Pipeline, Emergency, etc.)
- Any **mission** (CATTLE_LOCATE, DRONE_SCAN, GRID_INSPECTION, etc.)
- Any **role** (Farmer, Contractor, EMT, Gov, Public, Pilot)
- Any **unit type** (Drone, Rover, Collar, Ground Unit)

UDE replaces all sector‑specific dashboards with **one universal renderer**.

---

# 📁 Directory Structure

universal/
│
├── renderer.ts          # Main dashboard renderer (core engine)
│
├── layouts/             # Sector + mission layout definitions
│   ├── agriculture.ts
│   ├── air.ts
│   ├── emergency.ts
│   ├── utilities.ts
│   ├── pipeline.ts
│   ├── generic.ts
│   └── index.ts
│
├── widgets/             # Universal widget types
│   ├── map-widget.ts
│   ├── list-widget.ts
│   ├── card-widget.ts
│   ├── feed-widget.ts
│   ├── graph-widget.ts
│   └── index.ts
│
├── themes/              # Role-based UI themes
│   ├── farmer.ts
│   ├── contractor.ts
│   ├── gov.ts
│   ├── public.ts
│   ├── pilot.ts
│   ├── emt.ts
│   ├── default.ts
│   └── index.ts
│
├── bindings/            # Data bindings → SevenRuntime
│   ├── cattle.ts
│   ├── drone.ts
│   ├── utilities.ts
│   ├── pipeline.ts
│   ├── generic.ts
│   └── index.ts
│
├── actions/             # Mission actions (UI → Runtime commands)
│   ├── cattle.ts
│   ├── drone.ts
│   ├── rescue.ts
│   ├── utilities.ts
│   ├── pipeline.ts
│   ├── generic.ts
│   └── index.ts
│
└── shell/               # Final UI shell wrapper
├── shell.ts
└── builder.ts


---

# 🧠 How UDE Works (High‑Level)

UDE is composed of **five layers**:

## 1. Renderer  
The brain of the system.  
Determines:

- sector  
- mission  
- role  
- layout  
- widgets  
- theme  

Then composes everything into a UI Shell.

**File:** `renderer.ts`  
**Entry:** `render(context)`

---

## 2. Layouts  
Define **where widgets go**:

- main region  
- side region  
- footer region  
- optional actions  

Layouts are mission‑specific.

Example:

```ts
export const DRONE_SCAN_LAYOUT = {
  id: "DRONE_SCAN_LAYOUT",
  regions: {
    main: ["MAP_DRONE", "FEED_VIDEO"],
    side: ["CARD_MISSION_STATUS"],
    footer: ["CARD_LINK_STATUS"]
  },
  actions: ["LAUNCH_DRONE", "START_SCAN", "RETURN_HOME"]
};
