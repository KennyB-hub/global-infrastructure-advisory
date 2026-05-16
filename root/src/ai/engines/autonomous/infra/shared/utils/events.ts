// autonomous/infra/shared/utils/events.ts
import { v4 as uuid } from "uuid";
import { InfraEvent } from "../types/infra-event";

export function makeEvent(
  sector: InfraEvent["sector"],
  type: InfraEvent["type"],
  source: string,
  location: InfraEvent["location"],
  payload: Record<string, any>
): InfraEvent {
  return {
    id: uuid(),
    timestamp: new Date().toISOString(),
    sector,
    type,
    source,
    location,
    payload,
  };
}
