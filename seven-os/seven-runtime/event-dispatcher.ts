// © 2026 Global Infrastructure Advisory
// Seven Runtime — Event Dispatcher (Handler Router)

import { InfraEvent, getEventBus, EventHandler } from "./event-bus";

export class EventDispatcher {
  private handlers: Map<string, EventHandler[]> = new Map();
  private eventBus = getEventBus();

  /**
   * Register a handler for an event type
   */
  register(eventType: string, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }

    const handlers = this.handlers.get(eventType)!;
    handlers.push(handler);
    handlers.sort((a, b) => b.priority - a.priority);

    this.eventBus.registerHandler(eventType, handler);
    console.log(`[Dispatcher] Handler ${handler.id} registered for ${eventType}`);
  }

  /**
   * Unregister a handler
   */
  unregister(eventType: string, handlerId: string): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      const idx = handlers.findIndex(h => h.id === handlerId);
      if (idx >= 0) {
        handlers.splice(idx, 1);
        console.log(`[Dispatcher] Handler ${handlerId} unregistered from ${eventType}`);
      }
    }
  }

  /**
   * Get all handlers for an event type
   */
  getHandlers(eventType: string): EventHandler[] {
    return this.handlers.get(eventType) || [];
  }

  /**
   * Dispatch an event (route to all handlers)
   */
  async dispatch(event: InfraEvent): Promise<void> {
    const handlers = this.getHandlers(event.type);
    console.log(`[Dispatcher] Dispatching ${event.type} to ${handlers.length} handlers`);

    for (const handler of handlers) {
      try {
        await handler.handler(event);
      } catch (err) {
        console.error(`[Dispatcher] Handler ${handler.id} failed:`, err);
      }
    }
  }

  /**
   * Get dispatcher status
   */
  getStatus() {
    return {
      totalEventTypes: this.handlers.size,
      totalHandlers: Array.from(this.handlers.values()).reduce((sum, h) => sum + h.length, 0),
      handlersByType: Object.fromEntries(
        Array.from(this.handlers.entries()).map(([k, v]) => [k, v.length])
      )
    };
  }
}

// Singleton
let _dispatcher: EventDispatcher | null = null;

export function initDispatcher(): EventDispatcher {
  _dispatcher = new EventDispatcher();
  return _dispatcher;
}

export function getDispatcher(): EventDispatcher {
  if (!_dispatcher) {
    throw new Error("Dispatcher not initialized. Call initDispatcher() first.");
  }
  return _dispatcher;
}
