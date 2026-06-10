// seven-os/ai/mci/decision/engine.ts
import { getItemById } from ".";

export function canActOn(id: string, action: string) {
  const result = getItemById(id);
  if (!result) return { allowed: false, reason: "MCI: unknown asset" };

  const { sector, item } = result;

  // simple example: block actions on planned datacenters
  if (sector === "digital" && item.status === "planned" && action === "shutdown") {
    return { allowed: false, reason: "Cannot shutdown planned datacenter" };
  }

  return { allowed: true, reason: "OK" };
}
