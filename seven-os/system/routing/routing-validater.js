function validateAIRouting(maps, issues) {
  const aiFiles = maps.aiRouting || [];
  const systemFiles = maps.systemRouting || [];

  aiFiles.forEach(file => {
    const engineMatch = file.match(/\/ai\/engines\/([^/]+)\.js/);
    if (engineMatch) {
      const engineName = engineMatch[1];
      const usedInSystem = systemFiles.some(s =>
        s.includes(engineName) || s.includes(`ai-${engineName}`)
      );

      if (!usedInSystem) {
        issues.push({
          type: "orphan",
          domain: "ai-engine",
          file,
          message: `AI engine "${engineName}" is not referenced in system routing`,
        });
      }
    }
  });
}

function validateRouting(maps) {
  const issues = [];
  // existing checks...
  validateAIRouting(maps, issues);
  return issues;
}

module.exports = { validateRouting };

const { loadSchemas } = require("./schema-loader");

function validateSchemas(maps, issues) {
  const schemas = loadSchemas();
  const dataFiles = maps.dataRouting || [];

  schemas.forEach(({ file, schema }) => {
    const targetMatch = schema.target && schema.target.path;
    if (targetMatch) {
      const exists = dataFiles.some(d => d.includes(targetMatch));
      if (!exists) {
        issues.push({
          type: "schema-orphan",
          domain: "schema",
          file,
          message: `Schema targets "${targetMatch}" but no matching data file exists`,
        });
      }
    }
  });
}

function validateRouting(maps) {
  const issues = [];
  // existing checks...
  validateAIRouting(maps, issues);
  validateSchemas(maps, issues);
  return issues;
}

module.exports = { validateRouting };
