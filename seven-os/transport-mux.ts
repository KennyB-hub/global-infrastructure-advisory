// transport-mux.ts
// Seven‑OS Sector Transport Multiplexer

import { connect } from "nats";
import { handleCollarPacket } from "./sector/agri/collar-ingest";
import { pushCattleCommand } from "./runtime/cattle/command-engine";

export async function startTransportMux() {
    const nc = await connect({ servers: "nats://localhost:4222" });
    const js = nc.jetstream();

    // Collar telemetry → Sector Brain
    const sub = nc.subscribe("collar.telemetry");
    (async () => {
        for await (const msg of sub) {
            const data = JSON.parse(msg.data);
            const sectorEvent = await handleCollarPacket(data);
            await js.publish("sector.events", JSON.stringify(sectorEvent));
        }
    })();

    // Sector Brain → Cattle Runtime
    const sectorSub = nc.subscribe("sector.commands");
    (async () => {
        for await (const msg of sectorSub) {
            const cmd = JSON.parse(msg.data);
            await pushCattleCommand(cmd);
        }
    })();

    console.log("🚀 Seven‑OS Transport Mux online.");
}
