// © 2026 Global Infrastructure Advisory
// Seven Runtime — Full Stack Wiring (Air + Ground + Voice + Rescue)

<<<<<<< HEAD
import { TerrainModel } from "../drone/terrain-routing";
import { SevenRuntime } from "../seven";

import { DroneRegistry, DronePlugin } from "../drone/drone-registry";
import { GroundRegistry, GroundPlugin } from "../ground/ground-registry";

import { DroneRescueUnit, GroundRescueUnit } from "../rescue/adapters";
import { RescueUnit } from "../rescue/rescue-unit";

import { SevenNarrator, NarratorSink } from "../voice/seven-narrator";
import { SevenRescueCommander } from "../rescue/seven-rescue-commander";
import { NAPEvent } from "../sectors/nap-sectors";

export class SevenStack {
    readonly runtime: SevenRuntime;
    readonly droneRegistry: DroneRegistry;
    readonly groundRegistry: GroundRegistry;
    readonly narrator: SevenNarrator;
    readonly rescue: SevenRescueCommander;

    constructor(terrain: TerrainModel, sink: NarratorSink) {
        this.runtime = new SevenRuntime(terrain);

        this.droneRegistry = new DroneRegistry();
        this.groundRegistry = new GroundRegistry();

        this.narrator = new SevenNarrator(sink);
        this.rescue = new SevenRescueCommander(this.runtime, this.narrator);
    }

    async handleNAP(event: NAPEvent) {
    return this.interop.handleEvent({
        system: "NAP",
        type: event.type,
        payload: event
    });
}

    // -----------------------------
    // REGISTRATION
    // -----------------------------
    registerDrone(plugin: DronePlugin) {
        this.droneRegistry.register(plugin);
        this.runtime.registerDrone(plugin); // already wires into SwarmController
    }

    registerGroundUnit(plugin: GroundPlugin) {
        this.groundRegistry.register(plugin);
    }

    // -----------------------------
    // RESCUE UNIT LOOKUP
    // -----------------------------
    getRescueUnit(id: string): RescueUnit | null {
        const drone = this.droneRegistry.get(id);
        if (drone) {
            return new DroneRescueUnit(drone.id, drone.control);
        }

        const ground = this.groundRegistry.get(id);
        if (ground) {
            return new GroundRescueUnit(ground.id, ground.control);
        }

        return null;
    }
}

=======
import { TerrainModel } from "../drone/terrain-routing";
import { SevenRuntime } from "../seven";

import { DroneRegistry, DronePlugin } from "../drone/drone-registry";
import { GroundRegistry, GroundPlugin } from "../ground/ground-registry";

import { DroneRescueUnit, GroundRescueUnit } from "../rescue/adapters";
import { RescueUnit } from "../rescue/rescue-unit";

import { SevenNarrator, NarratorSink } from "../voice/seven-narrator";
import { SevenRescueCommander } from "../rescue/seven-rescue-commander";
import { NAPEvent } from "../sectors/nap-sectors";

export class SevenStack {
    readonly runtime: SevenRuntime;
    readonly droneRegistry: DroneRegistry;
    readonly groundRegistry: GroundRegistry;
    readonly narrator: SevenNarrator;
    readonly rescue: SevenRescueCommander;

    constructor(terrain: TerrainModel, sink: NarratorSink) {
        this.runtime = new SevenRuntime(terrain);

        this.droneRegistry = new DroneRegistry();
        this.groundRegistry = new GroundRegistry();

        this.narrator = new SevenNarrator(sink);
        this.rescue = new SevenRescueCommander(this.runtime, this.narrator);
    }

    async handleNAP(event: NAPEvent) {
    return this.interop.handleEvent({
        system: "NAP",
        type: event.type,
        payload: event
    });
}

    // -----------------------------
    // REGISTRATION
    // -----------------------------
    registerDrone(plugin: DronePlugin) {
        this.droneRegistry.register(plugin);
        this.runtime.registerDrone(plugin); // already wires into SwarmController
    }

    registerGroundUnit(plugin: GroundPlugin) {
        this.groundRegistry.register(plugin);
    }

    // -----------------------------
    // RESCUE UNIT LOOKUP
    // -----------------------------
    getRescueUnit(id: string): RescueUnit | null {
        const drone = this.droneRegistry.get(id);
        if (drone) {
            return new DroneRescueUnit(drone.id, drone.control);
        }

        const ground = this.groundRegistry.get(id);
        if (ground) {
            return new GroundRescueUnit(ground.id, ground.control);
        }

        return null;
    }
}
>>>>>>> 8af3cf37716f0a4a0a0653b41876073990567f4c