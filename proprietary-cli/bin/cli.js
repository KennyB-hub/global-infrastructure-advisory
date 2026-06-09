#!/usr/bin/env node
// Seven OS — Proprietary Operator CL

import { runCLI } from "../command/index.js";

const args = process.argv.slice(2);

const result = await runCLI(args);

if (result && result.ok === false) {
  console.error("CLI command failed:", result.error || result);
}
