// commands/clean.cjs
// Seven‑OS Safe Cleaner — Removes ONLY empty folders

const fs = require("fs");
const path = require("path");

function isEmptyDir(dir) {
  try {
    const files = fs.readdirSync(dir);
    return files.length === 0;
  } catch {
    return false;
  }
}

function removeEmptyDirs(startPath) {
  if (!fs.existsSync(startPath)) return;

  const entries = fs.readdirSync(startPath);

  for (const entry of entries) {
    const fullPath = path.join(startPath, entry);

    if (fs.statSync(fullPath).isDirectory()) {
      removeEmptyDirs(fullPath);

      if (isEmptyDir(fullPath)) {
        try {
          fs.rmdirSync(fullPath);
          console.log(`🧹 Removed empty folder: ${fullPath}`);
        } catch (err) {
          console.log(`⚠️ Could not remove: ${fullPath}`);
        }
      }
    }
  }
}

console.log("\n🧼 Seven‑OS Cleaner — Removing Empty Folders\n");

const root = path.join(__dirname, "..");

removeEmptyDirs(root);

console.log("\n✨ Cleaning complete.\n");
