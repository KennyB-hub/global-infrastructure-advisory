#!/usr/bin/env node
// proprietary-cli/commands/cli-delegates/audit-routes.js
// Delegator: run the existing dev test runner with "routing" argument.
// Forwards any additional args (e.g., --trace ./logs/...)
const { spawn } = require("child_process");
const path = require("path");

const script = path.join(__dirname, "..", "dev", "test.js");
const args = ["routing", ...process.argv.slice(2)];
const child = spawn(process.execPath, [script, ...args], { stdio: "inherit" });

child.on("exit", code => process.exit(code));
