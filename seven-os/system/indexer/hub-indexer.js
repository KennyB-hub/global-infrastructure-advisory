import fs from "fs";
import path from "path";

export function indexDashboards(repoRoot) {
  const dashboardsRoot = path.join(repoRoot, "seven-runtime/dashboards");
  const hubs = {};

  if (!fs.existsSync(dashboardsRoot)) return hubs;

  for (const hub of fs.readdirSync(dashboardsRoot)) {
    const hubPath = path.join(dashboardsRoot, hub);
    if (!fs.statSync(hubPath).isDirectory()) continue;

    hubs[hub] = [];

    for (const file of fs.readdirSync(hubPath)) {
      if (file.endsWith(".js")) {
        hubs[hub].push({
          id: `${hub}/${file.replace(".js", "")}`,
          file: `seven-runtime/dashboards/${hub}/${file}`
        });
      }
    }
  }

  return hubs;
}
