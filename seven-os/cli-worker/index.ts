#!/usr/bin/env node
import { spawn } from "node:child_process";
import path from "node:path";

const cmd = process.argv[2];

function runScript(script: string) {
  const full = path.join(process.cwd(), "seven-os", "cli", script);
  spawn(full, { stdio: "inherit", shell: true });
}

switch (cmd) {
  case "phoenix":
    runScript("phoenix-status.ts");
    break;
  case "status":
    runScript("status.js"); // your existing system status CLI
    break;
  default:
    console.log("Seven-CLI commands:");
    console.log("  status   - Seven System Status");
    console.log("  phoenix  - Mission Phoenix Funding Status");
    break;
}
