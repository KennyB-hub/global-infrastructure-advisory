// © 2026 Global Infrastructure Advisory
// Seven Runtime — Event Bus (NATS Integration)

import { getNatsClient, NatsClient } from "./transports/nats-client";

export interface InfraEvent {
  id: string;
  type: string;
  timestamp: number;
  source: "tower" | "drone" | "ground";
  sourceId: string;
  severity: "info" | "warning" | "critical";
  payload: any;
  tags?: string[];
}

export interface EventHandler {
  id: string;
  event: string;
  priority: number;
  handler: (event: InfraEvent) => Promise<void>;
}

export class EventBus {
  private nats: NatsClient;
  private handlers: Map<string, EventHandler[]> = new Map();
  private unsubscribers: Map<string, () => void> = new Map();

  constructor() {
    this.nats = getNatsClient();
  }

  /**
   * Publish an infrastructure event
   */
  async publishEvent(event: InfraEvent): Promise<boolean> {
    const subject = `seven.events.${event.source}.${event.type}`;
    console.log(`[EventBus] Publishing event:`, event.type, `to ${subject}`);
    
    try {
      const success = await this.nats.publish(subject, event);
      if (success) {
        // Also publish to general topic
        await this.nats.publish(`seven.events.all`, event);
      }
      return success;
    } catch (err) {
      console.error("[EventBus] Publish failed:", err);
      return false;
    }
  }

  /**
   * Subscribe to specific event type
   */
  registerHandler(eventType: string, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }

    const handlers = this.handlers.get(eventType)!;
    handlers.push(handler);
    handlers.sort((a, b) => b.priority - a.priority); // Sort by priority (desc)

    console.log(`[EventBus] Handler registered for ${eventType} (priority: ${handler.priority})`);
  }

  /**
   * Subscribe to all events of a type via NATS
   */
  async subscribeToEvents(eventType: string): Promise<boolean> {
    const subject = `seven.events.*.${eventType}`;

    try {
      const unsub = this.nats.subscribe(subject, async (event: InfraEvent) => {
        await this.handleEvent(event);
      });

      this.unsubscribers.set(eventType, unsub);
      console.log(`[EventBus] Listening to ${subject}`);
      return true;
    } catch (err) {
      console.error(`[EventBus] Subscribe to ${eventType} failed:`, err);
      return false;
    }
  }

  /**
   * Internal: route event to registered handlers
   */
  private async handleEvent(event: InfraEvent): Promise<void> {
    const handlers = this.handlers.get(event.type) || [];

    console.log(`[EventBus] Handling event: ${event.type} (${handlers.length} handlers)`);

    for (const handler of handlers) {
      try {
        await handler.handler(event);
      } catch (err) {
        console.error(`[EventBus] Handler ${handler.id} failed:`, err);
      }
    }
  }

  /**
   * Get all registered handlers for an event type
   */
  getHandlers(eventType: string): EventHandler[] {
    return this.handlers.get(eventType) || [];
  }

  /**
   * Unsubscribe from event type
   */
  unsubscribe(eventType: string): void {
    const unsub = this.unsubscribers.get(eventType);
    if (unsub) {
      unsub();
      this.unsubscribers.delete(eventType);
      console.log(`[EventBus] Unsubscribed from ${eventType}`);
    }
  }

  /**
   * Get bus status
   */
  getStatus() {
    return {
      connectedToNats: this.nats.isConnected(),
      registeredEventTypes: this.handlers.size,
      activeSubscriptions: this.unsubscribers.size,
      totalHandlers: Array.from(this.handlers.values()).reduce((sum, h) => sum + h.length, 0)
    };
  }
}

// Singleton instance
let _eventBus: EventBus | null = null;

export function initEventBus(): EventBus {
  _eventBus = new EventBus();
  return _eventBus;
}

export function getEventBus(): EventBus {
  if (!_eventBus) {
    throw new Error("EventBus not initialized. Call initEventBus() first.");
  }
  return _eventBus;
}
