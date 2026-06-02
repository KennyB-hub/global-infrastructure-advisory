export class DistanceCalc {
  static toRad(deg) {
    return (deg * Math.PI) / 180;
  }

  // Haversine distance in km
  static haversine(a, b) {
    const R = 6371;
    const dLat = DistanceCalc.toRad(b.lat - a.lat);
    const dLon = DistanceCalc.toRad(b.lon - a.lon);

    const lat1 = DistanceCalc.toRad(a.lat);
    const lat2 = DistanceCalc.toRad(b.lat);

    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

    return 2 * R * Math.asin(Math.sqrt(h));
  }
}
