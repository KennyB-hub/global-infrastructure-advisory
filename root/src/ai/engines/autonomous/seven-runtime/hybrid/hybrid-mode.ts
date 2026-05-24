// © 2026 Global Infrastructure Advisory
// Seven Runtime — Hybrid Mode Logic (Starlink Hybrid Sync Engine)

import { ConnectionMonitor, ConnectionStatus } from "../core/connection-monitor";
import { EventQueue, QueuedEvent } from "../core/event-queue";
import { SatelliteContinuityLayer } from "../sync/satellite-continuity";

export type HybridModeState = "ONLINE" | "DEGRADED" | "OFFLINE" | "SATELLITE_ONLY";

export class HybridMode {
    private mode: HybridModeState = "OFFLINE";

    constructor(
        private monitor: ConnectionMonitor,
        private queue: EventQueue,
        private speak: (msg: string) => void,
        private satelliteContinuity: SatelliteContinuityLayer
    ) {
        this.monitor.onChange((status) => this.handleConnectionChange(status));
    }

    private handleConnectionChange(status: ConnectionStatus) {
        const hasStarlink = status.transport === "starlink";
        const hasGround = status.transport === "lte" || status.transport === "wifi";

        if (hasGround && status.state === "CONNECTED") {
            this.satelliteContinuity.exitSatelliteOnly();
            this.setMode("ONLINE");
            this.speak("Hybrid mode online. Full ground connectivity available.");
            this.flushQueue();
            return;
        }

        if (hasGround && status.state === "DEGRADED") {
            this.satelliteContinuity.exitSatelliteOnly();
            this.setMode("DEGRADED");
            this.speak("Hybrid mode degraded. Critical sync only over ground networks.");
            this.flushCriticalOnly();
            return;
        }

        if (!hasGround && hasStarlink && status.state !== "OFFLINE") {
            this.satelliteContinuity.enterSatelliteOnly("Ground networks unavailable.");
            this.setMode("SATELLITE_ONLY");
            this.speak("Hybrid mode satellite-only. All guidance and sync via Starlink.");
            this.flushCriticalOnly();
            return;
        }

        this.setMode("OFFLINE");
        this.speak("Hybrid mode offline. Events will be queued until connectivity returns.");
    }

    private setMode(newMode: HybridModeState) {
        if (newMode !== this.mode) {
            this.mode = newMode;
            console.log(`[Seven Hybrid Mode] → ${newMode}`);
        }
    }

    private async flushQueue() {
        console.log("[Seven Hybrid Mode] Full sync triggered");
        this.speak("Performing full synchronization.");
        await this.queue.flush(async (event: QueuedEvent) => this.sendEvent(event));
    }

    private async flushCriticalOnly() {
        console.log("[Seven Hybrid Mode] Critical-only sync triggered");
        this.speak("Synchronizing critical events only.");

        const criticalTypes = ["gps", "audit", "alert", "telemetry"];
        const events = this.queue.getQueue().filter(e => criticalTypes.includes(e.type));

        for (const event of events) {
            const ok = await this.sendEvent(event);
            if (ok) this.queue["remove"](event.id);
        }
    }

    private async sendEvent(event: QueuedEvent): Promise<boolean> {
        console.log("[Seven Hybrid Mode] Sending event:", event.type);
        // real Starlink/LTE/WiFi transport plugs in here
        return false;
    }

    getMode() {
        return this.mode;
    }
}
