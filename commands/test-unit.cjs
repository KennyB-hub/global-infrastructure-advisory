#!/usr/bin/env node

// Seven‑OS Command: test:unit
// Runs Mocha unit tests with ts-node.

const { execSync } = require("child_process");

execSync(
  "mocha -r ts-node/register tests/unit/**/*.spec.ts",
  { stdio: "inherit" }
);
