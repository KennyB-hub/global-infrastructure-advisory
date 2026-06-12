import fs from "fs";
import path from "path";

export async function fixSevenRuntimeStructure(task) {
  const sevenRuntimePath = path.resolve("seven-runtime");

  for (const dir of task.payload.missing) {
    fs.mkdirSync(path.join(sevenRuntimePath, dir), { recursive: true });
  }
}
