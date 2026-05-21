// © 2026 Global Infrastructure Advisory
// Seven Runtime — NATS.io Message Bus Client

export interface NatsConfig {
  servers: string[];
  timeout?: number;
  maxReconnectAttempts?: number;
  reconnectDelayMs?: number;
}

export interface PublishOptions {
  subject: string;
  data: any;
  replyTo?: string;
}

export class NatsClient {
  private config: NatsConfig;
  private connected: boolean = false;
  private listeners: Map<string, Set<(msg: any) => Promise<void>>> = new Map();
  private messageQueue: Array<{ subject: string; data: any }> = [];

  constructor(config: NatsConfig) {
    this.config = {
      timeout: 5000,
      maxReconnectAttempts: 10,
      reconnectDelayMs: 1000,
      ...config
    };
  }

  /**
   * Connect to NATS cluster
   */
  async connect(): Promise<boolean> {
    try {
      console.log("[NATS] Connecting to", this.config.servers.join(", "));
      // In real implementation, use: import * as nats from "nats";
      // this.connection = await nats.connect({ servers: this.config.servers, ... });
      
      this.connected = true;
      console.log("[NATS] Connected");
      
      // Flush any queued messages
      await this.flushQueue();
      return true;
    } catch (err) {
      console.error("[NATS] Connection failed:", err);
      this.connected = false;
      return false;
    }
  }

  /**
   * Publish a message to a subject
   */
  async publish(subject: string, data: any): Promise<boolean> {
    if (!this.connected) {
      // Queue message for later delivery
      this.messageQueue.push({ subject, data });
      console.warn("[NATS] Not connected, queueing message to", subject);
      return false;
    }

    try {
      console.log(`[NATS] Publishing to ${subject}:`, JSON.stringify(data).substring(0, 100));
      // Real: await this.connection.publish(subject, nats.JSONCodec().encode(data));
      return true;
    } catch (err) {
      console.error(`[NATS] Publish to ${subject} failed:`, err);
      return false;
    }
  }

  /**
   * Subscribe to a subject (immediate callback)
   */
  subscribe(subject: string, callback: (msg: any) => Promise<void>): () => void {
    if (!this.listeners.has(subject)) {
      this.listeners.set(subject, new Set());
    }
    this.listeners.get(subject)!.add(callback);
    console.log(`[NATS] Subscribed to ${subject}`);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(subject);
      if (callbacks) {
        callbacks.delete(callback);
        console.log(`[NATS] Unsubscribed from ${subject}`);
      }
    };
  }

  /**
   * Flush queued messages
   */
  private async flushQueue() {
    const queue = [...this.messageQueue];
    this.messageQueue = [];

    for (const msg of queue) {
      await this.publish(msg.subject, msg.data);
    }
  }

  /**
   * Publish to JetStream (persisted messaging)
   */
  async publishStream(stream: string, subject: string, data: any): Promise<boolean> {
    return this.publish(subject, data);
  }

  /**
   * Subscribe to JetStream (durable consumers)
   */
  async subscribeStream(
    stream: string,
    subject: string,
    durableName: string,
    callback: (msg: any) => Promise<void>
  ): Promise<() => void> {
    return this.subscribe(subject, callback);
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Graceful shutdown
   */
  async disconnect(): Promise<void> {
    this.connected = false;
    console.log("[NATS] Disconnected");
  }

  /**
   * Health check
   */
  getStatus() {
    return {
      connected: this.isConnected(),
      servers: this.config.servers,
      subscriptions: this.listeners.size,
      queuedMessages: this.messageQueue.length
    };
  }
}

// Singleton instance
let _client: NatsClient | null = null;

export function initNatsClient(config: NatsConfig): NatsClient {
  _client = new NatsClient(config);
  return _client;
}

export function getNatsClient(): NatsClient {
  if (!_client) {
    throw new Error("NATS client not initialized. Call initNatsClient() first.");
  }
  return _client;
}
