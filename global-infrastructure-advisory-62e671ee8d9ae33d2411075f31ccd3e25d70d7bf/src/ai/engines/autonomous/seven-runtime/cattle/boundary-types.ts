// cattle/boundary-types.ts
export interface LatLon {
  lat: number;
  lon: number;
}

export interface PastureBoundary {
  pastureId: string;
  name?: string;
  polygon: LatLon[]; // closed ring
}
