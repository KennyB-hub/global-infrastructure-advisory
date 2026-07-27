// dashboard/bindings/worker-health.ts

import WebSocket from "ws";
import { connect } from "nats";

export async function startWorkerHealthPanel() {
    const nc = await connect({ servers: "nats://localhost:4222" });
    const ws = new WebSocket.Server({ port: 9090 });

    const heartbeatSub = nc.subscribe("sector.*.heartbeat");
    const workerSub    = nc.subscribe("worker.health");

    ws.on("connection", socket => {
        (async () => {
            for await (const msg of heartbeatSub) {
                socket.send(JSON.stringify({
                    type: "sectorHeartbeat",
                    data: JSON.parse(msg.data)
                }));
            }
        })();

        (async () => {
            for await (const msg of workerSub) {
                socket.send(JSON.stringify({
                    type: "workerHealth",
                    data: JSON.parse(msg.data)
                }));
            }
        })();
    });

    console.log("🖥 Universal Dashboard Worker Health Panel online.");
}
