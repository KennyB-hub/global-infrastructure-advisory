// © 2026 Global Infrastructure Advisory
// Seven Runtime — Universal Vehicle Registry (DroneRegistry + GroundRegistry Unified)

import { UniversalVehiclePlugin } from "../adapters/universal-vehicle-plugin";
import { calculateDroneCost } from "../../financial/calculate/drone";
import { calculateMissionCost } from "../../financial/calculate/mission";

import { RegionMeta } from "../regions/region-meta";
import { SectorMeta } from "../../sector/sector-meta";

export interface VehicleCapabilities {
  payloadKg?: number;
  flightMinutes?: number;
  rangeMiles?: number;
  sensors?: string[];
  groundSpeedMph?: number;
  towCapacityKg?: number;
}

export interface VehicleRegistration {
  id: string;
  name: string;
  type: string; // ANY type: rover, quad, vtol, ugv, utility, custom
  sector: string;
  region: string;
  capabilities: VehicleCapabilities;
  active: boolean;
  lastMissionId?: string;
  costModel?: any;
  plugin?: UniversalVehiclePlugin;
}

export class UniversalVehicleRegistry {
  private vehicles = new Map<string, VehicleRegistration>();
  private speak: (msg: string) => void;

  constructor(speakFn?: (msg: string) => void) {
    this.speak = speakFn || (() => {});
  }

  // ---------------------------------------------------------
  // REGISTRATION
  // ---------------------------------------------------------
  register(reg: VehicleRegistration) {
    if (!SectorMeta.exists(reg.sector)) {
      throw new Error(`Sector '${reg.sector}' not recognized`);
    }

    if (!RegionMeta.exists(reg.region)) {
      throw new Error(`Region '${reg.region}' not recognized`);
    }

    reg.costModel = {}; // audit/estimator workers fill later
    this.vehicles.set(reg.id, reg);

    this.speak(`Vehicle registered: ${reg.id} (${reg.type})`);
  }

  registerPlugin(plugin: UniversalVehiclePlugin, meta: Omit<VehicleRegistration, "plugin">) {
    const reg: VehicleRegistration = { ...meta, plugin };
    this.register(reg);
  }

  // ---------------------------------------------------------
  // LOOKUP
  // ---------------------------------------------------------
  get(id: string) {
    return this.vehicles.get(id) || null;
  }

  list() {
    return [...this.vehicles.values()];
  }

  unregister(id: string) {
    this.vehicles.delete(id);
    this.speak(`Vehicle unregistered: ${id}`);
  }

  // ---------------------------------------------------------
  // STATE CONTROL
  // ---------------------------------------------------------
  activate(id: string) {
    const v = this.vehicles.get(id);
    if (!v) return null;
    v.active = true;
    return v;
  }

  deactivate(id: string) {
    const v = this.vehicles.get(id);
    if (!v) return null;
    v.active = false;
    return v;
  }

  // ---------------------------------------------------------
  // MISSION ASSIGNMENT
  // ---------------------------------------------------------
  assignMission(vehicleId: string, missionId: string) {
    const v = this.vehicles.get(vehicleId);
    if (!v) return null;

    v.lastMissionId = missionId;
    return v;
  }

  // ---------------------------------------------------------
  // MISSION COST ESTIMATION (Drone logic preserved)
  // ---------------------------------------------------------
  estimateMissionCost(vehicleId: string, missionParams: any) {
    const v = this.vehicles.get(vehicleId);
    if (!v) throw new Error("Vehicle not found");

    const droneCost = calculateDroneCost({
      type: v.type,
      payloadKg: v.capabilities.payloadKg || 0,
      flightMinutes: v.capabilities.flightMinutes || 0,
      region: v.region
    });

    const missionCost = calculateMissionCost({
      missionId: v.lastMissionId || "unassigned",
      sector: v.sector,
      region: v.region,
      ...missionParams
    });

    return {
      droneCost,
      missionCost,
      total: droneCost + missionCost
    };
  }

  // ---------------------------------------------------------
  // TELEMETRY
  // ---------------------------------------------------------
  handleTelemetry(id: string, telemetry: any) {
    const v = this.vehicles.get(id);
    if (!v || !v.plugin) {
      this.speak(`Telemetry received for unknown vehicle: ${id}`);
      return false;
    }

    v.plugin.handleTelemetry(telemetry);
    return true;
  }

  // ---------------------------------------------------------
  // COMMAND BROADCAST
  // ---------------------------------------------------------
  async broadcast(cmd: any) {
    const results = [];

    for (const v of this.vehicles.values()) {
      if (!v.plugin) continue;

      const ok = await v.plugin.sendCommand(cmd);
      results.push({ id: v.id, ok });
    }

    return results;
  }
}
