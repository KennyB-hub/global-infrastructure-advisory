const fs = require("fs");
const path = require("path");

function loadDirectory(dir) {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir)
    .filter(f => !f.startsWith("."))
    .map(f => path.join(dir, f));
}

module.exports = function loadRuntime() {
  const root = process.cwd();

  return {
    sevenOS: loadDirectory(path.join(root, "seven-os")),
    sevenruntime: loadDirectory(path.join(root, "seven-runtime")),
    utilities: loadDirectory(path.join(root, "utilities")),
    topology: loadDirectory(path.join(root, "topology")),
    templates: loadDirectory(path.join(root, "templates")),
    public: loadDirectory(path.join(root, "public")),
    cli: loadDirectory(path.join(root, "proprietary-cli"))
  };
};
