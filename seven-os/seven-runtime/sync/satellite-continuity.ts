// © 2026 Global Infrastructure Advisory
// Seven Runtime — Satellite Continuity Layer

import { ConnectionMonitor } from "../core/connection-monitor";
import { EventQueue, QueuedEvent } from "../core/event-queue";
import { SyncPriority } from "./policies/sync-priority";

export interface SatelliteContinuityStatus {
    mode: "NORMAL" | "SATELLITE_ONLY";
    lastUpdate: number;
    notes?: string;
}

export class SatelliteContinuityLayer {
    private status: SatelliteContinuityStatus = {
        mode: "NORMAL",
        lastUpdate: Date.now()
    };

    constructor(
        private monitor: ConnectionMonitor,
        private queue: EventQueue,
        private speak: (msg: string) => void
    ) {}

    getStatus() {
        return this.status;
    }

    enterSatelliteOnly(reason: string) {
        this.status = {
            mode: "SATELLITE_ONLY",
            lastUpdate: Date.now(),
            notes: reason
        };
        this.speak("Satellite continuity mode engaged. Ground systems unavailable.");
    }

    exitSatelliteOnly() {
        this.status = {
            mode: "NORMAL",
            lastUpdate: Date.now()
        };
        this.speak("Satellite continuity mode disengaged. Ground systems restored.");
    }

    async flushCritical(events: QueuedEvent[]) {
        const sorted = SyncPriority.sort(events);
        for (const event of sorted) {
            // In the future this will call the real Starlink transport
            console.log("[Satellite Continuity] Queued critical event:", event.type);
        }
    }
}
