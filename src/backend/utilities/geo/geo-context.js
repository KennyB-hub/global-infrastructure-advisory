import { GeoMapping } from "./geo-mapping.js";
import { IntegrityDrone } from "../../../integrity/index.js";

export class GeoContext {
  static build(lat, lon) {
    // 1. Resolve mapping using V12 Alpha engine
    const mapping = GeoMapping.resolve(lat, lon);

    // 2. Build the location block
    const location = {
      regionId: mapping.regionId,
      subregionId: mapping.subregionId,
      parcelId: mapping.parcelId,
      gridCell: mapping.gridCell,
      snapLevel: mapping.snapLevel,
      elevation: null // reserved for future elevation engine
    };

    // 3. Integrity Drone — record geo event for offline sync
    IntegrityDrone.enqueue({
      type: "geoEvent",
      data: {
        lat,
        lon,
        location
      }
    });

    // 4. Return the final location object
    return location;
  }
}
