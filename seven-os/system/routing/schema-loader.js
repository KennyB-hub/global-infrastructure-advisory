const fs = require("fs");
const path = require("path");

function loadSchemas(root = path.join(process.cwd(), "data", "schemas")) {
  const schemas = [];

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".json")) {
        const content = JSON.parse(fs.readFileSync(full, "utf8"));
        schemas.push({ file: full, schema: content });
      }
    }
  }

  if (fs.existsSync(root)) walk(root);
  return schemas;
}

module.exports = { loadSchemas };
