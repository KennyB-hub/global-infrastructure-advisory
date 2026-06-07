// proprietary-cli/commands/mci/list.ts
import { listInfrastructureAssets } from "autonomous/seven/core/mci";

export async function run() {
  const assets = listInfrastructureAssets();
  console.log(JSON.stringify(assets, null, 2));
}
