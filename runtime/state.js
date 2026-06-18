// © 2026 Global Infrastructure Advisory
// Seven Backend — Unified System State Endpoint (CommonJS Edition)

const express = require("express");

/**
 * Creates the Express router for your universal dashboard tracking
 * @param {Object} stack - The global core operating system hardware/software stack
 */
function createStateRouter(stack) {
  const router = express.Router();

  router.get("/", async (req, res) => {
    try {
      // 1. Core Hardware Telemetry Extraction
      const connection = stack.connectionMonitor ? stack.connectionMonitor.getStatus() : { state: 'CONNECTED', transport: 'NATS' };
      const hybrid = stack.hybridMode ? stack.hybridMode.getMode() : 'EDGE_PRIORITY';
      const continuity = stack.satelliteContinuity ? stack.satelliteContinuity.getStatus() : { mode: 'ACTIVE', lastUpdate: Date.now() };
      
      // 2. Extract Livestock/Telemetry Event Queue Depths
      const queueDepth = stack.eventQueue ? stack.eventQueue.getQueue().length : 0;

      // 3. Level 3 Geospatial Fallback Mechanics (Handles rural farmer grids)
      let geo = { lat: 0, lon: 0, accuracyMeters: 999, source: 'DEFAULT' };
      if (stack.geoFallback) {
        const lastPos = (stack.runtime && stack.runtime.lastKnownPosition) || null;
        geo = stack.geoFallback.estimatePosition({ lastKnown: lastPos, timestamp: Date.now() });
      }

      // 4. Construct Unified Payload for Dashboard Consumption
      const payload = {
        timestamp: Date.now(),
        connection: {
          state: connection.state,
          transport: connection.transport,
          signalStrength: connection.signalStrength ?? null
        },
        hybridMode: hybrid,
        satelliteContinuity: {
          mode: continuity.mode,
          lastUpdate: continuity.lastUpdate,
          notes: continuity.notes || null
        },
        geoFallback: {
          lat: geo.lat,
          lon: geo.lon,
          accuracyMeters: geo.accuracyMeters,
          source: geo.source
        },
        queue: {
          depth: queueDepth
        }
      };

      res.json({ ok: true, payload });

    } catch (err) {
      console.error("❌ State endpoint error:", err);
      res.status(500).json({ ok: false, error: "STATE_ENDPOINT_FAILURE" });
    }
  });

  return router;
}

// Enforce explicit CommonJS export
module.exports = createStateRouter;
