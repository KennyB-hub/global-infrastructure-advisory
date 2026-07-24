// © 2026 Global Infrastructure Advisory
// Seven Runtime — Sync Scheduler (Hybrid Mode Compatible)

import { HybridMode } from "../policies/hybrid-mode";
import { EventQueue } from "../../core/event-queue";
import { StarlinkTransport } from "../transports/starlink";
import { LTETransport } from "../transports/lte";
import { WiFiTransport } from "../transports/wifi";

export class SyncScheduler {
    private hybrid: HybridMode;
    private queue: EventQueue;

    private starlink = new StarlinkTransport();
    private lte = new LTETransport();
    private wifi = new WiFiTransport();

    constructor(hybrid: HybridMode, queue: EventQueue) {
        this.hybrid = hybrid;
        this.queue = queue;

        // Run scheduler every 5 seconds
        setInterval(() => this.tick(), 5000);
    }

    private async tick() {
        const mode = this.hybrid.getMode();

        if (mode === "OFFLINE") return;

        const events = this.queue.getQueue();
        if (events.length === 0) return;

        // Try Starlink first
        const starlinkStatus = await this.starlink.getStatus();
        if (starlinkStatus.available) {
            await this.queue.flush(e => this.starlink.send(e));
            return;
        }

        // Try WiFi next
        const wifiStatus = await this.wifi.getStatus();
        if (wifiStatus.available) {
            await this.queue.flush(e => this.wifi.send(e));
            return;
        }

        // Try LTE last
        const lteStatus = await this.lte.getStatus();
        if (lteStatus.available) {
            await this.queue.flush(e => this.lte.send(e));
            return;
        }
    }
}
