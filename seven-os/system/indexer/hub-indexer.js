import fs from "fs";
import path from "path";

export function indexDashboards(repoRoot) {
  // NEW correct dashboard root
  const root = path.join(repoRoot, "utilities/dashboard/universal");

  const dashboards = {
    actions: [],
    bindings: [],
    layouts: [],
    themes: [],
    widgets: [],
    shell: [],
    core: []
  };

  if (!fs.existsSync(root)) return dashboards;

  function scan(subfolder, bucket) {
    const dir = path.join(root, subfolder);
    if (!fs.existsSync(dir)) return;

    for (const file of fs.readdirSync(dir)) {
      if (/\.(ts|js)$/.test(file)) {
        dashboards[bucket].push({
          id: `${subfolder}/${file.replace(/\.(ts|js)$/, "")}`,
          file: `utilities/dashboard/universal/${subfolder}/${file}`
        });
      }
    }
  }

  scan("actions", "actions");
  scan("bindings", "bindings");
  scan("layouts", "layouts");
  scan("themes", "themes");
  scan("widgets", "widgets");
  scan("shell", "shell");

  // core dashboard files
  for (const file of fs.readdirSync(root)) {
    if (/\.(ts|js)$/.test(file)) {
      dashboards.core.push({
        id: `core/${file.replace(/\.(ts|js)$/, "")}`,
        file: `utilities/dashboard/universal/${file}`
      });
    }
  }

  return dashboards;
}
