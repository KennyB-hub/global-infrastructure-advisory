// © 2026 Global Infrastructure Advisory
// Seven Runtime — Bootstrap & Initialization

import { initEventBus, getEventBus } from "./event-bus";
import { initDispatcher, getDispatcher } from "./event-dispatcher";
import { eventHandlers } from "./event-handlers";
import { natsClient } from "./transports/nats-client";

export interface SevenConfig {
  natsServers: string[];
  environment: "test" | "staging" | "production";
  enableDroneSdk: boolean;
  enableGroundSdk: boolean;
  droneSDKType?: "mavlink" | "dji";
  groundSDKType?: "ros" | "custom";
}

export class SevenRuntime {
  private config: SevenConfig;
  private initialized: boolean = false;

  constructor(config: SevenConfig) {
    this.config = {
      droneSDKType: "mavlink",
      groundSDKType: "ros",
      ...config
    };
  }

  /**
   * Initialize all Seven subsystems
   */
  async initialize(): Promise<boolean> {
    try {
      console.log(`[Seven] Initializing (${this.config.environment})`);

      // 1. Initialize NATS
      const natsClient = initNatsClient({
        servers: this.config.natsServers
      });
      const natsConnected = await natsClient.connect();
      if (!natsConnected && this.config.environment === "production") {
        console.error("[Seven] NATS connection failed - cannot start");
        return false;
      }

      // 2. Initialize Event Bus
      const eventBus = initEventBus();
      console.log("[Seven] Event bus initialized");

      // 3. Initialize Event Dispatcher
      const dispatcher = initDispatcher();
      console.log("[Seven] Event dispatcher initialized");

      // 4. Register event handlers
      for (const handler of eventHandlers) {
        dispatcher.register(handler.event, handler);
      }
      console.log(`[Seven] Registered ${eventHandlers.length} event handlers`);

      // 5. Subscribe to event topics
      await eventBus.subscribeToEvents("error");
      await eventBus.subscribeToEvents("power_loss");
      await eventBus.subscribeToEvents("connectivity");
      await eventBus.subscribeToEvents("battery_low");
      await eventBus.subscribeToEvents("gps_loss");
      await eventBus.subscribeToEvents("altitude_anomaly");
      await eventBus.subscribeToEvents("unit_lost");
      await eventBus.subscribeToEvents("obstacle_detected");
      await eventBus.subscribeToEvents("battery_critical");
      await natsClient.connect(config.natsServers);

      console.log("[Seven] All event subscriptions active");

      this.initialized = true;
      console.log("[Seven] Initialization complete");
      return true;
    } catch (err) {
      console.error("[Seven] Initialization failed:", err);
      return false;
    }
  }

  /**
   * Get initialization status
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get runtime status
   */
  getStatus() {
    const nats = getNatsClient().getStatus();
    const eventBus = getEventBus().getStatus();
    const dispatcher = getDispatcher().getStatus();

    return {
      initialized: this.initialized,
      environment: this.config.environment,
      nats,
      eventBus,
      dispatcher
    };
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    console.log("[Seven] Shutting down");
    try {
      const nats = getNatsClient();
      await nats.disconnect();
      this.initialized = false;
      console.log("[Seven] Shutdown complete");
    } catch (err) {
      console.error("[Seven] Shutdown error:", err);
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    components: Record<string, boolean>;
  }> {
    try {
      const nats = getNatsClient();
      const eventBus = getEventBus();
      const dispatcher = getDispatcher();

      return {
        healthy:
          this.initialized &&
          nats.isConnected() &&
          eventBus.getStatus().connectedToNats &&
          dispatcher.getStatus().totalHandlers > 0,
        components: {
          nats: nats.isConnected(),
          eventBus: eventBus.getStatus().connectedToNats,
          dispatcher: dispatcher.getStatus().totalHandlers > 0,
          initialized: this.initialized
        }
      };
    } catch (err) {
      return {
        healthy: false,
        components: {
          nats: false,
          eventBus: false,
          dispatcher: false,
          initialized: false
        }
      };
    }
  }
}

// Singleton instance
let _seven: SevenRuntime | null = null;

export async function initializeSevenRuntime(config: SevenConfig): Promise<SevenRuntime> {
  _seven = new SevenRuntime(config);
  await _seven.initialize();
  return _seven;
}

export function getSevenRuntime(): SevenRuntime {
  if (!_seven) {
    throw new Error("Seven runtime not initialized. Call initializeSevenRuntime() first.");
  }
  return _seven;
}
