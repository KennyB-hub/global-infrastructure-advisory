import fs from "fs";
import path from "path";

export async function fixRuntimeStructure(task) {
  const runtimePath = path.resolve("runtime");

  for (const dir of task.payload.missing) {
    fs.mkdirSync(path.join(runtimePath, dir), { recursive: true });
  }
}
