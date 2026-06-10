// © 2026 Global Infrastructure Advisory
// Seven Runtime — Full Stack Wiring (Air + Ground + Voice + Rescue + Sync)

import { TerrainModel } from "../drone/terrain-routing";
import { SevenRuntime } from "../seven";

import { DroneRegistry } from "../drone/drone-registry";
import { GroundRegistry } from "../ground/ground-registry";

import { DroneRescueUnit } from "../rescue/adapters/drone-rescue-unit";
import { GroundRescueUnit } from "../adapters/ground-rescue-unit";

import { SevenNarrator, NarratorSink } from "../voice/seven-narrator";
import { SevenRescueCommander } from "../rescue/seven-rescue-commander";

import { NAPEvent } from "../sectors/nap-sectors";
import { SevenInterop } from "../interop/seven-interop";

import { ConnectionMonitor } from "../core/connection-monitor";
import { EventQueue } from "../core/event-queue";

import { HybridMode } from "../hybrid/hybrid-mode";
import { SatelliteContinuityLayer } from "../sync/satellite-continuity";
import { GeoFallbackEngine } from "../geo/geo-fallback-engine";

export class SevenStack {
    readonly runtime: SevenRuntime;
    readonly droneRegistry: DroneRegistry;
    readonly groundRegistry: GroundRegistry;
    readonly narrator: SevenNarrator;
    readonly rescue: SevenRescueCommander;
    readonly interop: SevenInterop;

    readonly connectionMonitor: ConnectionMonitor;
    readonly eventQueue: EventQueue;
    readonly satelliteContinuity: SatelliteContinuityLayer;
    readonly geoFallback: GeoFallbackEngine;
    readonly hybridMode: HybridMode;

    constructor(terrain: TerrainModel, sink: NarratorSink) {
        this.runtime = new SevenRuntime(terrain);

        // Voice
        this.narrator = new SevenNarrator(sink);
        const speakFn = (msg: string) => this.narrator.say(msg);

        // Registries
        this.droneRegistry = new DroneRegistry(speakFn);
        this.groundRegistry = new GroundRegistry(speakFn);

        // Rescue Commander
        this.rescue = new SevenRescueCommander(this.runtime, this.narrator);

        // Connectivity + Sync
        this.connectionMonitor = new ConnectionMonitor();
        this.eventQueue = new EventQueue();

        this.satelliteContinuity = new SatelliteContinuityLayer(
            this.connectionMonitor,
            this.eventQueue,
            speakFn
        );

        this.geoFallback = new GeoFallbackEngine(speakFn);

        this.hybridMode = new HybridMode(
            this.connectionMonitor,
            this.eventQueue,
            speakFn,
            this.satelliteContinuity
        );

        // Interop (NAP, CAD, C2, SCADA, etc.)
        this.interop = new SevenInterop(this);
    }

    // ---------------------------------------------------------
    // RESCUE UNIT LOOKUP
    // ---------------------------------------------------------
    getRescueUnit(id: string) {
        const drone = this.droneRegistry.get(id);
        if (drone) return new DroneRescueUnit(drone);

        const ground = this.groundRegistry.get(id);
        if (ground) return new GroundRescueUnit(ground);

        return null;
    }

    // ---------------------------------------------------------
    // REGISTRATION HELPERS
    // ---------------------------------------------------------
    registerDrone(plugin) {
        this.droneRegistry.register(plugin);
    }

    registerGroundUnit(plugin) {
        this.groundRegistry.register(plugin);
    }

    // ---------------------------------------------------------
    // NAP / Sector Event Handling
    // ---------------------------------------------------------
    async handleNAP(event: NAPEvent) {
        return this.interop.handleEvent({
            system: "NAP",
            type: event.type,
            payload: event
        });
    }

    // ---------------------------------------------------------
    // VOICE HELPERS
    // ---------------------------------------------------------
    speak(text: string) {
        return this.narrator.say(text);
    }

    async reportStatus() {
        const conn = this.connectionMonitor.getStatus();
        const mode = this.hybridMode.getMode();
        const cont = this.satelliteContinuity.getStatus();

        const phrase = [
            "System status report.",
            `Connection ${conn.state} via ${conn.transport}.`,
            `Hybrid mode ${mode}.`,
            cont.mode === "SATELLITE_ONLY"
                ? "Satellite continuity active."
                : "Ground networks available."
        ].join(" ");

        await this.narrator.say(phrase);
    }
}

