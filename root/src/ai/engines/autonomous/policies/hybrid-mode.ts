// © 2026 Global Infrastructure Advisory
// Seven Runtime — Hybrid Mode Logic (Starlink Hybrid Sync Engine)

import { ConnectionMonitor, ConnectionStatus } from "../core/connection-monitor";
import { EventQueue, QueuedEvent } from "../core/event-queue";

export type HybridModeState = "ONLINE" | "DEGRADED" | "OFFLINE";

export class HybridMode {
    private mode: HybridModeState = "OFFLINE";
    private monitor: ConnectionMonitor;
    private queue: EventQueue;

    constructor(monitor: ConnectionMonitor, queue: EventQueue) {
        this.monitor = monitor;
        this.queue = queue;

        // Listen for connection changes
        this.monitor.onChange((status) => this.handleConnectionChange(status));
    }

    private handleConnectionChange(status: ConnectionStatus) {
        if (status.state === "CONNECTED") {
            this.setMode("ONLINE");
            this.flushQueue();
        } else if (status.state === "DEGRADED") {
            this.setMode("DEGRADED");
            this.flushCriticalOnly();
        } else {
            this.setMode("OFFLINE");
        }
    }

    private setMode(newMode: HybridModeState) {
        if (newMode !== this.mode) {
            this.mode = newMode;
            console.log(`[Seven Hybrid Mode] → ${newMode}`);
        }
    }

    // Called when fully online (Starlink or strong LTE)
    private async flushQueue() {
        console.log("[Seven Hybrid Mode] Full sync triggered");

        await this.queue.flush(async (event: QueuedEvent) => {
            return this.sendEvent(event);
        });
    }

    // Called when degraded (weak LTE, weak WiFi)
    private async flushCriticalOnly() {
        console.log("[Seven Hybrid Mode] Critical-only sync triggered");

        const criticalTypes = ["gps", "audit", "alert", "telemetry"];

        const events = this.queue.getQueue().filter(e =>
            criticalTypes.includes(e.type)
        );

        for (const event of events) {
            const ok = await this.sendEvent(event);
            if (ok) this.queue["remove"](event.id);
        }
    }

    // Stubbed send function — replaced by transport layer later
    private async sendEvent(event: QueuedEvent): Promise<boolean> {
        console.log("[Seven Hybrid Mode] Sending event:", event.type);

        // Placeholder: always fail until transports are added
        return false;
    }

    getMode() {
        return this.mode;
    }
}
