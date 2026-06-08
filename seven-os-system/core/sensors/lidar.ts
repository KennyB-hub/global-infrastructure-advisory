// autonomous/seven/core/sensors/lidar.ts

export type LidarPoint = { x: number; y: number; z: number; intensity?: number };

export type LidarCloud = {
  points: LidarPoint[];
  source: "drone" | "vehicle" | "satellite";
};

export type ClassifiedPoint = LidarPoint & {
  label: "ground" | "structure" | "vegetation" | "unknown";
};

export function classifyCloud(cloud: LidarCloud): ClassifiedPoint[] {
  return cloud.points.map(p => {
    if (p.z < 0.5) return { ...p, label: "ground" };
    if (p.z > 20) return { ...p, label: "structure" };
    // crude example; real logic can be swapped in later
    return { ...p, label: "unknown" };
  });
}
