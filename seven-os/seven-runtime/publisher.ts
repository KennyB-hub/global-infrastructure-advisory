import { fetchTowerTelemetry } from "./infra/ingest";
import { auditTower } from "./audit";
import { InfraEvent } from "../autonomous/core/fcc/telecom-equipment-authorization/types";
import { bus } from "../../event-bus/client"; // your NATS/MQTT client

export async function runTowerAuditCycle() {
  const towers = await fetchTowerTelemetry();

  const allEvents: InfraEvent[] = towers.flatMap(auditTower);

  for (const ev of allEvents) {
    await bus.publish("tower.events", JSON.stringify(ev));
  }
}
