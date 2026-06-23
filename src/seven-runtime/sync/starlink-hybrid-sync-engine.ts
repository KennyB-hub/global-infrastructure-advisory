// © 2026 Global Infrastructure Advisory
// Seven Runtime — Hybrid Mode Logic (Starlink Hybrid Sync Engine)

import { ConnectionMonitor, ConnectionStatus } from "../core/connection-monitor";
import { EventQueue, QueuedEvent } from "../core/event-queue";

export type HybridModeState = "ONLINE" | "DEGRADED" | "OFFLINE";

export class HybridMode {
    private mode: HybridModeState = "OFFLINE";
    private monitor: ConnectionMonitor;
    private queue: EventQueue;
    private speak: (msg: string) => void;

    constructor(monitor: ConnectionMonitor, queue: EventQueue, speakFn?: (msg: string) => void) {
        this.monitor = monitor;
        this.queue = queue;
        this.speak = speakFn || (() => {});

        this.monitor.onChange((status) => this.handleConnectionChange(status));
    }

    private handleConnectionChange(status: ConnectionStatus) {
        if (status.state === "CONNECTED") {
            this.setMode("ONLINE");
            this.speak("Hybrid Mode online. Full sync available.");
            this.flushQueue();
        } 
        else if (status.state === "DEGRADED") {
            this.setMode("DEGRADED");
            this.speak("Hybrid Mode degraded. Critical sync only.");
            this.flushCriticalOnly();
        } 
        else {
            this.setMode("OFFLINE");
            this.speak("Hybrid Mode offline. Events will be queued.");
        }
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

        await this.queue.flush(async (event: QueuedEvent) => {
            return this.sendEvent(event);
        });
    }

    private async flushCriticalOnly() {
        console.log("[Seven Hybrid Mode] Critical-only sync triggered");
        this.speak("Synchronizing critical events only.");

        const criticalTypes = ["gps", "audit", "alert", "telemetry"];

        const events = this.queue.getQueue().filter(e =>
            criticalTypes.includes(e.type)
        );

        for (const event of events) {
            const ok = await this.sendEvent(event);
            if (ok) this.queue["remove"](event.id);
        }
    }

    private async sendEvent(event: QueuedEvent): Promise<boolean> {
        console.log("[Seven Hybrid Mode] Sending event:", event.type);
        return false; // transport layer will replace this
    }

    getMode() {
        return this.mode;
    }
}
