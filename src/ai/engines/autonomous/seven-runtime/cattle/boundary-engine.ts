// cattle/boundary-engine.ts
import { publishEvent } from "../event-bus";

export function moveBoundary(pasturePolygon, direction, distanceFeet) {
  const distanceMeters = distanceFeet * 0.3048;

  const shifted = pasturePolygon.map(point => {
    return shiftPoint(point, direction, distanceMeters);
  });

  publishEvent("PASTURE_BOUNDARY_UPDATED", {
    newBoundary: shifted,
    moved: distanceFeet,
    direction
  });

  return shifted;
}

function shiftPoint(point, direction, meters) {
  const bearing = {
    north: 0,
    east: 90,
    south: 180,
    west: 270
  }[direction];

  const R = 6378137;
  const dLat = (meters * Math.cos(bearing * Math.PI/180)) / R;
  const dLon = (meters * Math.sin(bearing * Math.PI/180)) / (R * Math.cos(point.lat * Math.PI/180));

  return {
    lat: point.lat + dLat * 180/Math.PI,
    lon: point.lon + dLon * 180/Math.PI
  };
}
