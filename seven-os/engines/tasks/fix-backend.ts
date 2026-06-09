import fs from "fs";
import path from "path";

export async function fixBackendStructure(task) {
  const backendPath = path.resolve("backend");

  for (const dir of task.payload.missing) {
    fs.mkdirSync(path.join(backendPath, dir), { recursive: true });
  }
}
