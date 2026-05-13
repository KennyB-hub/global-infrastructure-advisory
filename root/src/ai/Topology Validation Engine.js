export function validateTopology(topologyIndex, fileLoader) {
  const errors = [];
  const validated = {};

  for (const [key, path] of Object.entries(topologyIndex.files)) {
    const data = fileLoader(path);

    if (!data) {
      errors.push(`Missing topology file: ${path}`);
      continue;
    }

    if (!data.version) {
      errors.push(`Topology file missing version: ${path}`);
    }

    if (Array.isArray(data.regions) && data.regions.length === 0) {
      errors.push(`Topology file has empty regions array: ${path}`);
    }

    validated[key] = data;
  }

  return {
    valid: errors.length === 0,
    errors,
    validated
  };
}
