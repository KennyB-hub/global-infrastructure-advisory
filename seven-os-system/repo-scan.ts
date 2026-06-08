import fs from "fs";
import path from "path";

export function scanRepo(rootDir: string = process.cwd()) {
  function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    return entries.map(entry => {
      const full = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        return {
          type: "dir",
          name: entry.name,
          path: full,
          children: walk(full)
        };
      }

      return {
        type: "file",
        name: entry.name,
        path: full
      };
    });
  }

  return walk(rootDir);
}
