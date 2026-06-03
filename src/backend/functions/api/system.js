// © 2026 Global Infrastructure Advisory
// Seven Backend — Unified API Gateway

import express from "express";
import cors from "cors";

import { TerrainModel } from "../../seven-runtime/drone/terrain-routing.js";
import { SevenStack } from "../../seven-runtime/stack/seven-stack.js";

import { handleSystemHealth, handleSystemUptime } from "./system-diagnostics.js";
import createVoiceRouter from "./routes/voice.js";
import createAuditRouter from "./routes/audit.js";
import createStateRouter from "./routes/state.js";

const app = express();
app.use(cors());
app.use(express.json());

// ---------------------------------------------------------
// Seven Runtime Initialization
// ---------------------------------------------------------
const terrain = new TerrainModel();
const stack = new SevenStack(terrain, {
    speak: (msg) => console.log("[Seven Voice]", msg)
});

// Attach stack to env for handlers
const env = { stack };

// ---------------------------------------------------------
// SYSTEM ROUTES
// ---------------------------------------------------------
app.get("/api/system/health", (req, res) => {
    handleSystemHealth(req, env).then(r => pipe(r, res));
});

app.get("/api/system/uptime", (req, res) => {
    handleSystemUptime(req, env).then(r => pipe(r, res));
});

// ---------------------------------------------------------
// VOICE ROUTES
// ---------------------------------------------------------
app.use("/api/voice", createVoiceRouter(stack));
app.use("/api/system/state", createStateRouter(stack));

// ---------------------------------------------------------
// INFRASTRUCTURE AUDIT ENGINE
// ---------------------------------------------------------
app.use("/api/audit", createAuditRouter(stack));

// ---------------------------------------------------------
// RESPONSE PIPE
// ---------------------------------------------------------
function pipe(workerResponse, expressResponse) {
    workerResponse.text().then(body => {
        expressResponse
            .status(workerResponse.status)
            .set(Object.fromEntries(workerResponse.headers))
            .send(body);
    });
}

// ---------------------------------------------------------
// START SERVER
// ---------------------------------------------------------
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Seven Backend running on port ${PORT}`);
});
