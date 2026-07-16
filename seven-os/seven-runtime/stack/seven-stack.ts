import { TerrainModel } from "../drone/terrain-routing";
import { SevenRuntime } from "../seven";

import { UniversalVehicleRegistry } from "../adapters/universal-vehicle-registry";
import { UniversalVehiclePlugin } from "../adapters/universal-vehicle-plugin";

import { SevenNarrator, NarratorSink } from "../voice/seven-narrator";
import { UniversalRescueUnit } from "../rescue/universal-rescue-unit";

import { NAPEvent } from "../sector/nap-sector";
import { SevenInterop } from "../interop/seven-interop";

import { ConnectionMonitor } from "../core/connection-monitor";
import { EventQueue } from "../core/event-queue";

import { HybridMode } from "../hybrid/hybrid-mode";
import { SatelliteContinuityLayer } from "../sync/satellite-continuity";
import { GeoFallbackEngine } from "../geo/geo-fallback-engine";

export class SevenStack {
  readonly runtime: SevenRuntime;
  readonly vehicles: UniversalVehicleRegistry;
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

    // Universal registry
    this.vehicles = new VehicleRegistry(speakFn);

    // Rescue Commander (now universal)
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
  // UNIVERSAL RESCUE LOOKUP
  // ---------------------------------------------------------
  getRescueUnit(id: string) {
    const vehicle = this.vehicles.get(id);
    if (!vehicle) return null;
    return new UniversalRescueUnit(vehicle);
  }

  // ---------------------------------------------------------
  // UNIVERSAL REGISTRATION
  // ---------------------------------------------------------
  registerVehicle(plugin: UniversalVehiclePlugin) {
    this.vehicles.register(plugin);
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