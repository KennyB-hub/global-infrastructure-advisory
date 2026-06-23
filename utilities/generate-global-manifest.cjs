// scripts/generate-global-manifest.cjs
const path = require("path");
const { writeGlobalManifest } = require("../seven-os/system/indexer/engine.js");

const repoRoot = path.resolve(__dirname, "..");
writeGlobalManifest(repoRoot);
console.log("global-manifest.json regenerated");
