// © 2026 Global Infrastructure Advisory
// Seven Runtime — Region Metadata (Sovereign Grade)

import regionModel from "../financial/models/region.json";

export interface RegionDefinition {
  id: string;               // region id (na-appalachia-wv-south-001)
  name: string;             // human-readable name
  type: "urban" | "rural" | "mountain" | "coastal" | "disaster_zone";
  country?: string;         // optional country code
  connectivity?: string[];  // cellular, satellite, mesh
  microgrid?: boolean;      // true/false
  priority?: "normal" | "critical";
}

export class RegionMeta {
  private static regions: Map<string, RegionDefinition> = new Map();

  // Register a region into Seven-OS
  static register(region: RegionDefinition) {
    if (!region.id || !region.name) {
      throw new Error("Region must have id and name");
    }

    if (!regionModel.base[region.type]) {
      throw new Error(`Region type '${region.type}' not recognized`);
    }

    this.regions.set(region.id, region);
  }

  // Check if region exists
  static exists(regionId: string): boolean {
    return this.regions.has(regionId);
  }

  // Get region definition
  static get(regionId: string): RegionDefinition | null {
    return this.regions.get(regionId) || null;
  }

  // List all regions
  static list(): RegionDefinition[] {
    return [...this.regions.values()];
  }

  // Get cost multiplier from region.json
  static getCostMultiplier(regionId: string): number {
    const region = this.regions.get(regionId);
    if (!region) throw new Error(`Region '${regionId}' not found`);

    return regionModel.base[region.type] || 1.0;
  }

  // Get fuel adjustment multiplier
  static getFuelAdjustment(regionId: string): number {
    const region = this.regions.get(regionId);
    if (!region) throw new Error(`Region '${regionId}' not found`);

    return regionModel.fuel_adjustment[region.type] || 1.0;
  }

  // Determine if region is critical priority
  static isCritical(regionId: string): boolean {
    const region = this.regions.get(regionId);
    return region?.priority === "critical";
  }

  // Determine if region has microgrid support
  static hasMicrogrid(regionId: string): boolean {
    const region = this.regions.get(regionId);
    return region?.microgrid === true;
  }

  // Determine if region supports a connectivity type
  static supportsConnectivity(regionId: string, type: string): boolean {
    const region = this.regions.get(regionId);
    return region?.connectivity?.includes(type) ?? false;
  }
}
