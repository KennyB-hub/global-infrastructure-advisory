#!/usr/bin/env node
// Seven OS — Proprietary Operator CL

import { runCLI } from "../commands/index.js";

const args = process.argv.slice(2);

const result = await runCLI(args);

const loadRuntime = require("../../runtime/runtime-loader.cjs");
module.exports = { runtime: loadRuntime() };

if (result && result.ok === false) {
  console.error("CLI commands failed:", result.error || result);
}
