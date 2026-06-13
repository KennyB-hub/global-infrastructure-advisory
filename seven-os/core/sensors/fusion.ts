// autonomous/seven/core/sensors/fusion.ts

import type { LidarCloud } from "./lidar";

export type ImageFrame = {
  width: number;
  height: number;
  pixels: Uint8Array; // placeholder
  source: "drone" | "satellite" | "camera";
};

export type SensorFusionInput = {
  lidar?: LidarCloud;
  image?: ImageFrame;
  telemetry?: {
    lat: number;
    lon: number;
    alt: number;
    heading?: number;
  };
};

export type FusedScene = {
  hasStructures: boolean;
  hasHazards: boolean;
  estimatedSlope?: number;
};

export function fuseSensors(input: SensorFusionInput): FusedScene {
  const hasStructures = !!input.lidar && input.lidar.points.some(p => p.z > 20);
  const hasHazards = false; // placeholder for later rules

  return {
    hasStructures,
    hasHazards,
    estimatedSlope: undefined
  };
}
