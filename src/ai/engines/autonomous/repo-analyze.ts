export function analyzeRepo(structure) {
  const suggestions = [];
  const missing = [];

  const expectedRoots = [
    "src/ai-engine",
    "src/system",
    "src/api",
    "data"
  ];

  // Detect missing root folders
  for (const root of expectedRoots) {
    if (!exists(structure, root)) {
      missing.push({
        type: "missing-folder",
        folder: root,
        reason: "Expected by V12 Alpha architecture"
      });
    }
  }

  // Detect misplaced TS files
  walk(structure, node => {
    if (node.type === "file" && node.name.endsWith(".ts")) {
      if (node.path.includes("/data/")) {
        suggestions.push({
          issue: "TS file in data folder",
          file: node.path,
          recommended: "Move to src/"
        });
      }
    }
  });

  // Detect duplicate filenames
  const fileMap = {};
  walk(structure, node => {
    if (node.type === "file") {
      if (!fileMap[node.name]) fileMap[node.name] = [];
      fileMap[node.name].push(node.path);
    }
  });

  for (const [name, paths] of Object.entries(fileMap)) {
    if (paths.length > 1) {
      suggestions.push({
        issue: "duplicate-file",
        file: name,
        locations: paths
      });
    }
  }

  return { suggestions, missing };
}

function exists(structure, targetPath) {
  let found = false;
  walk(structure, node => {
    if (node.path.endsWith(targetPath)) found = true;
  });
  return found;
}

function walk(nodes, fn) {
  for (const node of nodes) {
    fn(node);
    if (node.children) walk(node.children, fn);
  }
}
