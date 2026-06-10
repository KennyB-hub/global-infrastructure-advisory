// © 2026 Global Infrastructure Advisory
// Seven Runtime — Starlink Transport Module

import { QueuedEvent } from "../core/event-queue";

export interface StarlinkStatus {
    available: boolean;
    strong: boolean;
    strength: number; // 0–100
}

export class StarlinkTransport {
    private endpoint = "http://192.168.100.1"; 
    // Starlink router local API (standard for all dishes)

    constructor() {}

    // Check if Starlink is online and usable
    async getStatus(): Promise<StarlinkStatus> {
        try {
            const res = await fetch(`${this.endpoint}/status`, {
                method: "GET"
            });

            if (!res.ok) throw new Error("Starlink status unavailable");

            const data = await res.json();

            const strength = Math.floor((data.downlinkThroughput / 200) * 100);

            return {
                available: true,
                strong: strength > 40,
                strength
            };
        } catch (err) {
            return {
                available: false,
                strong: false,
                strength: 0
            };
        }
    }

    // Send a queued event through Starlink
    async send(event: QueuedEvent): Promise<boolean> {
        try {
            const res = await fetch("https://your-cloud-endpoint/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(event)
            });

            return res.ok;
        } catch (err) {
            return false;
        }
    }
}
