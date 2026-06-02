// © 2026 Global Infrastructure Advisory
// Seven Runtime — Event Queue (Hybrid Mode Compatible)

export interface QueuedEvent {
    id: string;
    type: string;
    timestamp: number;
    payload: any;
    retries: number;
    lastAttempt?: number;
}

export class EventQueue {
    private queue: QueuedEvent[] = [];
    private maxRetries = 10;
    private retryDelay = 5000; // 5 seconds base delay

    constructor() {
        // Periodically attempt to flush the queue
        setInterval(() => this.processQueue(), 4000);
    }

    // Add a new event to the queue
    enqueue(type: string, payload: any) {
        const event: QueuedEvent = {
            id: crypto.randomUUID(),
            type,
            timestamp: Date.now(),
            payload,
            retries: 0
        };

        this.queue.push(event);
        return event.id;
    }

    // Return current queue (for debugging or UI)
    getQueue() {
        return [...this.queue];
    }

    // Called by hybrid mode when connection is available
    async flush(sendFn: (event: QueuedEvent) => Promise<boolean>) {
        for (const event of this.queue) {
            const success = await this.attemptSend(event, sendFn);
            if (success) {
                this.remove(event.id);
            }
        }
    }

    // Internal queue processor (runs automatically)
    private async processQueue() {
        // Hybrid mode will override this with a real send function
        // For now, this is a placeholder
    }

    private async attemptSend(
        event: QueuedEvent,
        sendFn: (event: QueuedEvent) => Promise<boolean>
    ) {
        try {
            const ok = await sendFn(event);
            if (!ok) throw new Error("Send failed");

            return true;
        } catch (err) {
            event.retries++;
            event.lastAttempt = Date.now();

            if (event.retries > this.maxRetries) {
                console.warn("Event dropped after max retries:", event);
                this.remove(event.id);
            }

            return false;
        }
    }

    private remove(id: string) {
        this.queue = this.queue.filter(e => e.id !== id);
    }
}
