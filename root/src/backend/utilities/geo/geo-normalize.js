export class GeoNormalize {
  static cleanLat(lat) {
    if (lat === null || lat === undefined) return null;
    const n = Number(lat);
    return isNaN(n) ? null : Math.min(Math.max(n, -90), 90);
  }

  static cleanLon(lon) {
    if (lon === null || lon === undefined) return null;
    const n = Number(lon);
    return isNaN(n) ? null : Math.min(Math.max(n, -180), 180);
  }

  static normalize(lat, lon) {
    return {
      lat: GeoNormalize.cleanLat(lat),
      lon: GeoNormalize.cleanLon(lon)
    };
  }
}
