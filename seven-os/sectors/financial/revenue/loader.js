const fs = require("fs");
const path = require("path");

function loadRevenueBuckets() {
  const base = path.join(__dirname);
  const buckets = [];

  const sectors = fs.readdirSync(base, { withFileTypes: true });

  for (const sector of sectors) {
    if (!sector.isDirectory()) continue;

    const sectorDir = path.join(base, sector.name);
    const files = fs.readdirSync(sectorDir);

    for (const file of files) {
      if (!file.endsWith(".cjs")) continue;

      const bucket = require(path.join(sectorDir, file));
      buckets.push(bucket);
    }
  }

  return buckets;
}

module.exports = { loadRevenueBuckets };
