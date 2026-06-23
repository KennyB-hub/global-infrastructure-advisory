const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const COMMANDS_DIR = path.join(ROOT, "commands");
const PACKAGE_JSON = path.join(ROOT, "package.json");

const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, "utf8"));
pkg.scripts = pkg.scripts || {};

const files = fs.readdirSync(COMMANDS_DIR);

files.forEach(file => {
  if (!file.endsWith(".cjs")) return;

  const name = file.replace(".cjs", "");
  const command = `node commands/${file}`;

  pkg.scripts[name] = command;
});

fs.writeFileSync(PACKAGE_JSON, JSON.stringify(pkg, null, 2));

console.log("✅ All commands registered into package.json");
