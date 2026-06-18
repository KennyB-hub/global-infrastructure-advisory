// transports/transport-mux.ts

import { sendStarlinkPacket } from "./starlink";
import { sendLTEPacket } from "./lte";
import { sendWifiPacket } from "./wifi";
import { sendNatsPacket } from "../transports/nats-client";

export type TransportKind = "starlink" | "lte" | "wifi" | "nats" | "offline";

export interface TransportContext {
  sector: string;
  priority: "critical" | "high" | "normal" | "low";
  location?: { lat: number; lon: number };
  hasService: {
    starlink: boolean;
    lte: boolean;
    wifi: boolean;
  };
}

export interface TransportPayload {
  type: string;
  data: unknown;
  timestamp: string;
}

export async function sendViaBestTransport(
  ctx: TransportContext,
  payload: TransportPayload
): Promise<TransportKind> {
  // 1. Starlink for critical + no local service
  if (ctx.hasService.starlink && ctx.priority === "critical") {
    await sendStarlinkPacket(payload, ctx);
    return "starlink";
  }

  // 2. LTE for high/normal when available
  if (ctx.hasService.lte) {
    await sendLTEPacket(payload, ctx);
    return "lte";
  }

  // 3. WiFi for local mesh / facility sync
  if (ctx.hasService.wifi) {
    await sendWifiPacket(payload, ctx);
    return "wifi";
  }

  // 4. NATS if we’re already on the grid
  await sendNatsPacket(payload, ctx);
  return "nats";
}
