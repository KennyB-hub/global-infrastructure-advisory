import { RegionMatcher } from "./region-matcher.js";
import { GeoGrid } from "./geo-grid.js";
import { GeoNormalize } from "./geo-normalize.js";

export class GeoMapping {
  static resolve(lat, lon) {
    const { lat: nLat, lon: nLon } = GeoNormalize.normalize(lat, lon);

    const region = RegionMatcher.matchRegion(nLat, nLon);
    const subregion = RegionMatcher.matchSubregion(nLat, nLon);
    const parcel = RegionMatcher.matchParcel(nLat, nLon);

    const gridCell = GeoGrid.cell(nLat, nLon);

    return {
      regionId: region,
      subregionId: subregion,
      parcelId: parcel,
      gridCell,
      snapLevel: "GRID_50M"
    };
  }
}
