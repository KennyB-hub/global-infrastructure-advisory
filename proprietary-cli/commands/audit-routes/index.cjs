#!/usr/bin/env node
// proprietary-cli/commands/audit-routes/index.cjs
const { spawn } = require("child_process");
const path = require("path");
const script = path.join(__dirname, "..", "dev", "test.js");
const args = ["routing", ...process.argv.slice(2)];
const child = spawn(process.execPath, [script, ...args], { stdio: "inherit" });
child.on("exit", code => process.exit(code));
