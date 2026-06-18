function validateRouting(maps) {
  const issues = [];

  function checkEmpty(name, list) {
    if (!list || list.length === 0) {
      issues.push({ type: "missing", domain: name, message: `${name} has no files` });
    }
  }

  checkEmpty("aiRouting", maps.aiRouting);
  checkEmpty("apiRouting", maps.apiRouting);
  checkEmpty("systemRouting", maps.systemRouting);
  checkEmpty("workerRouting", maps.workerRouting);
  checkEmpty("sectorRouting", maps.sectorRouting);

  // Orphan detection: sectors with no workers
  const sectorFiles = maps.sectorRouting || [];
  const workerFiles = maps.workerRouting || [];

  sectorFiles.forEach(file => {
    const sectorNameMatch = file.match(/\/sectors\/([^/]+)\//);
    if (sectorNameMatch) {
      const sectorName = sectorNameMatch[1];
      const hasWorker = workerFiles.some(w =>
        w.includes(`/system-workers/${sectorName}-workers/`) ||
        w.includes(`/workers/system-workers/${sectorName}-workers/`)
      );
      if (!hasWorker) {
        issues.push({
          type: "orphan",
          domain: "sector",
          file,
          message: `Sector "${sectorName}" has no linked worker domain`,
        });
      }
    }
  });

  // Duplicate route detection (simple path-based)
  const allRoutes = [
    ...maps.apiRouting,
    ...maps.systemRouting,
    ...maps.workerRouting,
  ];

  const seen = new Map();
  allRoutes.forEach(file => {
    const routeKey = file.replace(process.cwd(), "");
    if (seen.has(routeKey)) {
      issues.push({
        type: "duplicate",
        domain: "routing",
        files: [seen.get(routeKey), file],
        message: `Duplicate route mapping for "${routeKey}"`,
      });
    } else {
      seen.set(routeKey, file);
    }
  });

  return issues;
}

module.exports = { validateRouting };
