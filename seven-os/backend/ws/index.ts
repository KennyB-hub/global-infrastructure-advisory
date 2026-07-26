// collar-ws/index.ts

import WebSocket from "ws";
import { connect } from "nats";

export async function startCollarWS() {
    const nc = await connect({ servers: "nats://localhost:4222" });

    const wss = new WebSocket.Server({ port: 6060 });

    wss.on("connection", socket => {
        socket.on("message", async raw => {
            const packet = JSON.parse(raw);
            await nc.publish("collar.telemetry", JSON.stringify(packet));
        });
    });

    console.log("📡 Collar WebSocket online.");
}
