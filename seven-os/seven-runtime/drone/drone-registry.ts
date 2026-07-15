// © 2026 Global Infrastructure Advisory
// Seven Runtime — Drone Registry (Schema-Aligned)

import { DroneControl } from "./drone-control";
import { calculateDroneCost } from "../financial/calculate/drone";
import { calculateMissionCost } from "../financial/calculate/mission";
import { RegionMeta } from "../regions/region-meta";
import { SectorMeta } from "../sectors/sector-meta";

export interface DronePlugin {
  id: string;
  name: string;
  type: "quad" | "vtol" | "fixed-wing" | "heavy-lift" | "thermal" | "lidar";
  control: DroneControl;

  connect?(): Promise<void>;
  disconnect?(): Promise<void>;
  getTelemetry?(): Promise<any>;
}

export interface DroneCapabilities {
  payloadKg: number;
  flightMinutes: number;
  rangeMiles: number;
  sensors: string[];
}

export interface DroneRegistration {
  id: string;
  name: string;
  type: DronePlugin["type"];
  sector: string;
  region: string;
  capabilities: DroneCapabilities;
  active: boolean;
  lastMissionId?: string;
  costModel?: any;
}

export class DroneRegistry {
  private drones: Map<string, DroneRegistration> = new Map();

  register(drone: DroneRegistration) {
    if (!SectorMeta.exists(drone.sector)) {
      throw new Error(`Sector '${drone.sector}' not recognized`);
    }

    if (!RegionMeta.exists(drone.region)) {
      throw new Error(`Region '${drone.region}' not recognized`);
    }

    drone.costModel = {}; // audit/estimator workers will fill this later
    this.drones.set(drone.id, drone);
  }

  unregister(id: string) {
    this.drones.delete(id);
  }

  get(id: string) {
    return this.drones.get(id) || null;
  }

  list() {
    return [...this.drones.values()];
  }

  activate(id: string) {
    const drone = this.drones.get(id);
    if (!drone) return null;
    drone.active = true;
    return drone;
  }

  deactivate(id: string) {
    const drone = this.drones.get(id);
    if (!drone) return null;
    drone.active = false;
    return drone;
  }

  assignMission(droneId: string, missionId: string) {
    const drone = this.drones.get(droneId);
    if (!drone) return null;

    drone.lastMissionId = missionId;
    return drone;
  }

  estimateMissionCost(droneId: string, missionParams: any) {
    const drone = this.drones.get(droneId);
    if (!drone) throw new Error("Drone not found");

    const droneCost = calculateDroneCost({
      type: drone.type,
      payloadKg: drone.capabilities.payloadKg,
      flightMinutes: drone.capabilities.flightMinutes,
      region: drone.region
    });

    const missionCost = calculateMissionCost({
      missionId: drone.lastMissionId || "unassigned",
      sector: drone.sector,
      region: drone.region,
      ...missionParams
    });

    return {
      droneCost,
      missionCost,
      total: droneCost + missionCost
    };
  }
}
