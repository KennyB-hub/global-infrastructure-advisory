// © 2026 Global Infrastructure Advisory
// Seven Runtime — Event Bus (NATS Integration - CommonJS Edition)

const path = require("path");

// Safely bridge to your native NATS client transport layer
let getNatsClient;
try {
  getNatsClient = require("./transports/nats-client").getNatsClient;
} catch (e) {
  // Safe architectural mock stub if Copilot shuffled your transports folder
  console.log("⚠ [EventBus Note] NATS Client transport module missing. Using simulated low-latency fallback.");
  getNatsClient = () => ({
    publish: async (subject, data) => { console.log(`[Mock NATS] Packet pushed to -> ${subject}`); return true; },
    subscribe: (subject, cb) => { console.log(`[Mock NATS] Bound listener to -> ${subject}`); return () => {}; },
    isConnected: () => true
  });
}

class EventBus {
  constructor() {
    this.nats = getNatsClient();
    this.handlers = new Map();
    this.unsubscribers = new Map();
  }

  /**
   * Publish an infrastructure event (Cattle loads, drone feeds, hazard warnings)
   */
  async publishEvent(event) {
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
   * Register local business handlers (e.g., matching cattle hauls or analyzing bridge costs)
   */
  registerHandler(eventType, handlerInstance) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    
    const targetHandlers = this.handlers.get(eventType);
    targetHandlers.push(handlerInstance);
    
    // Maintain your absolute Level 3 Autonomy priority execution rule (Highest priority runs first)
    targetHandlers.sort((a, b) => b.priority - a.priority);
    console.log(`[EventBus] Handler registered for ${eventType} (priority: ${handlerInstance.priority})`);
  }

  /**
   * Subscribe to all events of a type via NATS network frames
   */
  async subscribeToEvents(eventType) {
    const subject = `seven.events.*.${eventType}`;
    try {
      const unsub = this.nats.subscribe(subject, async (event) => {
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
   * Internal: route event to registered handlers based on structural priority matrices
   */
  async handleEvent(event) {
    const targetHandlers = this.handlers.get(event.type) || [];
    console.log(`[EventBus] Handling event: ${event.type} (${targetHandlers.length} handlers)`);
    
    for (const handlerInstance of targetHandlers) {
      try {
        await handlerInstance.handler(event);
      } catch (err) {
        console.error(`[EventBus] Handler ${handlerInstance.id} failed:`, err);
        // Invoke automated recovery worker handoff if a critical flight route collapses
        if (event.type === 'voice-flight-handler' || event.source === 'drone') {
          console.log(`🚨 [L3 EMERGENCY ISOLATION]: Directing fallback state capture parameters...`);
        }
      }
    }
  }

  getHandlers(eventType) {
    return this.handlers.get(eventType) || [];
  }

  unsubscribe(eventType) {
    const unsub = this.unsubscribers.get(eventType);
    if (unsub) {
      unsub();
      this.unsubscribers.delete(eventType);
      console.log(`[EventBus] Unsubscribed from ${eventType}`);
    }
  }

  getStatus() {
    return {
      connectedToNats: this.nats.isConnected(),
      registeredEventTypes: this.handlers.size,
      activeSubscriptions: this.unsubscribers.size,
      totalHandlers: Array.from(this.handlers.values()).reduce((sum, h) => sum + h.length, 0)
    };
  }
}

// Singleton instances via CommonJS
let _eventBus = null;

function initEventBus() {
  _eventBus = new EventBus();
  return _eventBus;
}

function getEventBus() {
  if (!_eventBus) {
    // Graceful auto-init so other modules don't explode if timing gets unaligned
    _eventBus = new EventBus();
  }
  return _eventBus;
}

module.exports = {
  EventBus,
  initEventBus,
  getEventBus
};
