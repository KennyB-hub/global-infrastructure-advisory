export class GeoGrid {
  static snap(value, resolution = 0.0005) {
    return Math.round(value / resolution) * resolution;
  }

  static cell(lat, lon, resolution = 0.0005) {
    const sLat = GeoGrid.snap(lat, resolution);
    const sLon = GeoGrid.snap(lon, resolution);
    return `GRID_${sLat.toFixed(6)}_${sLon.toFixed(6)}`;
  }
}
