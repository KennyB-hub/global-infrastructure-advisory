import fs from 'fs';
import path from 'path';

// Define the "Mission Control" directory map
const missionControl = {
    "public": ["index.html", ".html", ".svg"],  // UI Layer
    "public/css": ["main.css", "admin.css"],     // Stylesheets
    "src/logic": ["sector.js", "space.js", "engine.js"],        // Core Heartbeat
    "src/data": ["config.json", "schema.js", "mock_data.js"],  // Knowledge Base
    "src/auth": ["identity.ts", "vault.js"],                   // Security/Gov
    "src/data/logs": [".log", "session_"]                       // AI Thought Streams
};

// Ensure all const missionControl = {
  ai: ["*.ts", "*.js"],
  autonomous: ["*.ts", "*.js"],
  "seven-runtime": ["*.ts", "*.js"],
  backend: ["*.ts", "*.js"],
  functions: ["*.ts", "*.js"],
  api: ["*.ts", "*.js"],
  cli: ["*.ts", "*.js"],
  sandbox: ["*.ts", "*.js"],
  security: ["*.ts", "*.js"],
  sectors: ["*.ts", "*.js"],
  "geo-utilities": ["*.ts", "*.js"],
  hubs: ["*.ts", "*.js"],
  hub_logic: ["*.ts", "*.js"],
  identity: ["*.ts", "*.js"],
  "infrastructure-packs": ["*.ts", "*.js"],
  kv: ["*.ts", "*.js"],
  "policy-packs": ["*.ts", "*.js"],
  public: ["*.html", "*.css", "*.js"],
  reports: ["*.json", "*.csv"],
  scripts: ["*.cjs", "*.js"],
  system: ["*.ts", "*.js"],
  templates: ["*.html"],
  topology: ["*.json"]
};
