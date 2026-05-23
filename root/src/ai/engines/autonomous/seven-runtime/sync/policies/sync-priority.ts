// © 2026 Global Infrastructure Advisory
// Seven Runtime — Sync Priority Rules

<<<<<<< HEAD
import { QueuedEvent } from "../core/event-queue";

export class SyncPriority {
    static getPriority(event: QueuedEvent): number {
        switch (event.type) {
            case "alert":
            case "telemetry":
            case "gps":
            case "audit":
                return 1; // highest priority

            case "contractor-note":
            case "pipeline-route":
            case "powerline-locate":
                return 2;

            case "photo":
            case "hologram-asset":
                return 3;

            case "bulk-sync":
            default:
                return 4; // lowest priority
        }
    }

    static sort(events: QueuedEvent[]) {
        return events.sort((a, b) => {
            return SyncPriority.getPriority(a) - SyncPriority.getPriority(b);
        });
    }
}

=======
import { QueuedEvent } from "../core/event-queue";

export class SyncPriority {
    static getPriority(event: QueuedEvent): number {
        switch (event.type) {
            case "alert":
            case "telemetry":
            case "gps":
            case "audit":
                return 1; // highest priority

            case "contractor-note":
            case "pipeline-route":
            case "powerline-locate":
                return 2;

            case "photo":
            case "hologram-asset":
                return 3;

            case "bulk-sync":
            default:
                return 4; // lowest priority
        }
    }

    static sort(events: QueuedEvent[]) {
        return events.sort((a, b) => {
            return SyncPriority.getPriority(a) - SyncPriority.getPriority(b);
        });
    }
}
>>>>>>> 8af3cf37716f0a4a0a0653b41876073990567f4c