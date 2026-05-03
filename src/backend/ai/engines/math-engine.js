// High‑precision math for infrastructure, mapping, and dispatch
export class MathEngine {
  // Haversine distance (meters)
  distance(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const toRad = d => d * Math.PI / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  // Weighted scoring (risk, cost, time, priority)
  weightedScore(values, weights) {
    return values.reduce((sum, v, i) => sum + v * (weights[i] || 1), 0);
  }

  // Normalize values 0–1
  normalize(value, min, max) {
    return (value - min) / (max - min);
  }
}
