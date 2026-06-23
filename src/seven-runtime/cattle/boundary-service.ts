// cattle/boundary-service.ts
import { publishEvent } from "../event-bus";
import { PastureBoundary } from "./boundary-types";

export async function saveBoundary(boundary: PastureBoundary) {
  // TODO: persist to DB
  // await db.savePastureBoundary(boundary);

  await publishEvent("PASTURE_BOUNDARY_UPDATED", boundary);
  return boundary;
}

export async function getBoundary(pastureId: string): Promise<PastureBoundary | null> {
  // TODO: load from DB
  // return db.getPastureBoundary(pastureId);
  return null;
}
