import { GeoMapping } from "./geo-mapping.js";

export class GeoContext {
  static build(lat, lon) {
    const mapping = GeoMapping.resolve(lat, lon);

    return {
      regionId: mapping.regionId,
      subregionId: mapping.subregionId,
      parcelId: mapping.parcelId,
      gridCell: mapping.gridCell,
      snapLevel: mapping.snapLevel,
      elevation: null // optional future integration
    };
  }
}
