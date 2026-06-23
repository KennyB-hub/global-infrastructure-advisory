// seven-os/transports/nats-client.ts

import { connect, StringCodec, NatsConnection, Subscription } from "nats";

export class NatsClient {
  private static instance: NatsClient;
  private nc: NatsConnection | null = null;
  private sc = StringCodec();

  private constructor() {}

  static getInstance() {
    if (!NatsClient.instance) {
      NatsClient.instance = new NatsClient();
    }
    return NatsClient.instance;
  }

  async connect(servers: string[]) {
    if (this.nc) return this.nc;

    this.nc = await connect({ servers });
    console.log("🔌 Seven‑OS: Connected to NATS");

    return this.nc;
  }

  async publish(subject: string, data: any) {
    if (!this.nc) throw new Error("NATS not connected");
    this.nc.publish(subject, this.sc.encode(JSON.stringify(data)));
  }

  async subscribe(subject: string, handler: (msg: any) => void): Promise<Subscription> {
    if (!this.nc) throw new Error("NATS not connected");

    const sub = this.nc.subscribe(subject);
    (async () => {
      for await (const m of sub) {
        const decoded = JSON.parse(this.sc.decode(m.data));
        handler(decoded);
      }
    })();

    return sub;
  }

  isConnected() {
    return !!this.nc;
  }

  async disconnect() {
    if (this.nc) {
      await this.nc.close();
      this.nc = null;
    }
  }

  getStatus() {
    return {
      connected: this.isConnected()
    };
  }
}

export const natsClient = NatsClient.getInstance();
