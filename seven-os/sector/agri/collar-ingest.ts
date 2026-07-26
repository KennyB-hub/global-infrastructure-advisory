// sector/agri/collar-ingest.ts

export async function handleCollarPacket(packet) {
    const { id, gps, battery, movement } = packet;

    // Herd state logic
    const event = {
        id,
        gps,
        battery,
        movement,
        timestamp: Date.now(),
        status: "OK"
    };

    // Example: geofence check
    // Example: rotation schedule check

    return event;
}
