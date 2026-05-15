import fs from "fs";
import path from "path";

const SCHEMA_DIR = path.resolve("backend/data/schemas");

export function loadSchemaRegistry() {
  const registry = {};

  const files = fs.readdirSync(SCHEMA_DIR);

  for (const file of files) {
    if (file.endsWith(".schema.json")) {
      const fullPath = path.join(SCHEMA_DIR, file);
      const schema = JSON.parse(fs.readFileSync(fullPath, "utf8"));
      const name = file.replace(".schema.json", "");
      registry[name] = schema;
    }
  }

  return registry;
}
