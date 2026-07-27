// sector/shared/heartbeat.ts

import { connect } from "nats";

export async function startSectorHeartbeat(sectorName: string) {
    const nc = await connect({ servers: "nats://localhost:4222" });

    setInterval(async () => {
        const heartbeat = {
            sector: sectorName,
            timestamp: Date.now(),
            status: "OK",
            workers: 34,
            cores: 28
        };

        await nc.publish(`sector.${sectorName}.heartbeat`, JSON.stringify(heartbeat));
    }, 5000); // every 5 seconds
}
