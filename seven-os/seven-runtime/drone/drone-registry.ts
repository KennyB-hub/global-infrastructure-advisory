// © 2026 Global Infrastructure Advisory
// Seven Runtime — Drone Plug‑In Interface

import { DroneControl } from "./drone-control";

export interface DronePlugin {
    id: string;                     // unique hardware ID
    name: string;                   // human-readable name
    type: "quad" | "vtol" | "fixed-wing" | "heavy-lift" | "thermal" | "lidar";
    control: DroneControl;          // unified control interface

    connect?(): Promise<void>;      // optional hardware connect
    disconnect?(): Promise<void>;   // optional hardware disconnect
    getTelemetry?(): Promise<any>;  // optional telemetry feed
}

