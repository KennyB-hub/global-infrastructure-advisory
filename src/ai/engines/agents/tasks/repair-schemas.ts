import fs from "fs";
import path from "path";

export async function repairSchemas(task) {
  const schemaDir = path.resolve("backend/data/schemas");

  for (const file of task.payload.badSchemas) {
    const full = path.join(schemaDir, file);
    fs.writeFileSync(full, "{}"); // reset to empty valid JSON
  }
}
