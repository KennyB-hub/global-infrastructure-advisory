// Geofence helpers for DroneControl

export type Geofence = { isInside: (lat: number, lon: number) => boolean };

export function createCircularGeofence(centerLat: number, centerLon: number, radiusMeters: number): Geofence {
  function toRad(deg: number) { return (deg * Math.PI) / 180; }
  function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371000; // earth radius meters
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  return {
    isInside(lat: number, lon: number) {
      const d = haversine(centerLat, centerLon, lat, lon);
      return d <= radiusMeters;
    }
  };
}
