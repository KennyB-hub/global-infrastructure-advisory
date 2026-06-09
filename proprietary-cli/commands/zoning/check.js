// proprietary-cli/commands/zoning/check.js
import { explainZoningAndLandUse } from "../../../seven-os/engines/zoning-landuse.js";

export async function run(assetId) {
  console.log(explainZoningAndLandUse(assetId));
}
