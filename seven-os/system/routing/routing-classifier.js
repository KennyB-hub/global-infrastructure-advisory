function classifyFiles(files) {
  const classified = {
    ai: [],
    api: [],
    system: [],
    workers: [],
    sectors: [],
    core: [],
    logs: [],
    data: [],
    other: []
  };

  for (const file of files) {
    if (file.includes("/ai/")) classified.ai.push(file);
    else if (file.includes("/api/")) classified.api.push(file);
    else if (file.includes("/system/")) classified.system.push(file);
    else if (file.includes("/workers/")) classified.workers.push(file);
    else if (file.includes("/sectors/")) classified.sectors.push(file);
    else if (file.includes("/core/")) classified.core.push(file);
    else if (file.includes("/logs/")) classified.logs.push(file);
    else if (file.includes("/data/")) classified.data.push(file);
    else classified.other.push(file);
  }

  return classified;
}

module.exports = { classifyFiles };
