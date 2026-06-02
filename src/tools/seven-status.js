#!/usr/bin/env node
import fetch from "node-fetch";

const BASE = process.env.SEVEN_API || "http://localhost:8080";

async function main() {
  const res = await fetch(`${BASE}/api/system/state`);
  const json = await res.json();
  const p = json.payload;

  console.log("=== Seven System Status ===");
  console.log("Connection:", p.connection.state, `(${p.connection.transport})`);
  console.log("Hybrid Mode:", p.hybridMode);
  console.log("Satellite:", p.satelliteContinuity.mode);
  console.log("Queue Depth:", p.queue.depth);
  console.log("Geo:", p.geoFallback.lat, p.geoFallback.lon);
  console.log("Drones:", p.drones.length);
  console.log("Ground Units:", p.groundUnits.length);
}

main();
