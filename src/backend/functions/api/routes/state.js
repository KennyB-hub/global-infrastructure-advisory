// © 2026 Global Infrastructure Advisory
// Seven Backend — Unified System State Endpoint

import express from "express";

export default function createStateRouter(stack) {
    const router = express.Router();

    router.get("/", async (req, res) => {
        try {
            const connection = stack.connectionMonitor.getStatus();
            const hybrid = stack.hybridMode.getMode();
            const continuity = stack.satelliteContinuity.getStatus();
            const queueDepth = stack.eventQueue.getQueue().length;

            const geo = stack.geoFallback.estimatePosition({
                lastKnown: stack.runtime?.lastKnownPosition || null,
                timestamp: Date.now()
            });

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

            res.json({
                ok: true,
                payload
            });
        } catch (err) {
            console.error("State endpoint error:", err);
            res.status(500).json({
                ok: false,
                error: "STATE_ENDPOINT_FAILURE"
            });
        }
    });

    return router;
}
