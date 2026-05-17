// © 2026 Global Infrastructure Advisory
// Seven Runtime — Drone Registration & Plug-In System

import { DroneControl } from "./drone-control";

export interface DronePlugin {
    id: string;
    name: string;
    type: "quad" | "vtol" | "fixed-wing" | "heavy-lift" | "thermal" | "lidar";
    control: DroneControl;
}

export class DroneRegistry {
    private drones: Map<string, DronePlugin> = new Map();

    register(plugin: DronePlugin) {
        this.drones.set(plugin.id, plugin);
    }

    unregister(id: string) {
        this.drones.delete(id);
    }

    get(id: string) {
        return this.drones.get(id);
    }

    list() {
        return [...this.drones.values()];
    }
}
