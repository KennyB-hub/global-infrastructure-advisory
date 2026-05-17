// © 2026 Global Infrastructure Advisory
// Seven Runtime — Ground Unit Registry

import { GroundControl } from "./ground-control";

export interface GroundPlugin {
    id: string;
    name: string;
    type: "rover" | "dog-harness";
    control: GroundControl;
}

export class GroundRegistry {
    private units: Map<string, GroundPlugin> = new Map();

    register(plugin: GroundPlugin) {
        this.units.set(plugin.id, plugin);
    }

    unregister(id: string) {
        this.units.delete(id);
    }

    get(id: string) {
        return this.units.get(id);
    }

    list() {
        return [...this.units.values()];
    }
}
