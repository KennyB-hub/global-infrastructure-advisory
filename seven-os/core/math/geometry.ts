// autonomous/seven/core/math/geometry.ts

export type Point2D = { x: number; y: number };
export type Point3D = { x: number; y: number; z: number };

export function distance2D(a: Point2D, b: Point2D): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function distance3D(a: Point3D, b: Point3D): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dz = b.z - a.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function midpoint2D(a: Point2D, b: Point2D): Point2D {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export function dot3D(a: Point3D, b: Point3D): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function cross3D(a: Point3D, b: Point3D): Point3D {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x
  };
}

export function normalize3D(v: Point3D): Point3D {
  const mag = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  if (mag === 0) return { x: 0, y: 0, z: 0 };
  return { x: v.x / mag, y: v.y / mag, z: v.z / mag };
}

// simple line segment intersection in 2D (for zoning, corridors, etc.)
export function segmentsIntersect2D(
  p1: Point2D,
  p2: Point2D,
  p3: Point2D,
  p4: Point2D
): boolean {
  function cross(o: Point2D, a: Point2D, b: Point2D) {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  }

  const d1 = cross(p1, p2, p3);
  const d2 = cross(p1, p2, p4);
  const d3 = cross(p3, p4, p1);
  const d4 = cross(p3, p4, p2);

  return d1 * d2 < 0 && d3 * d4 < 0;
}
