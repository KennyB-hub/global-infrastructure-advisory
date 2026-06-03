import { InfraEvent } from "../shared/types/infra-event";
import { makeEvent } from "../shared/utils/events";

export type FiberSegment = {
  segmentId: string;
  lat: number;
  lon: number;
  zone?: string;
  funded: boolean;
  built: boolean;
  claimedComplete: boolean;
  latencyMs?: number;
  outagesLast30d?: number;
};

export function auditFiber(seg: FiberSegment): InfraEvent[] {
  const events: InfraEvent[] = [];
  const loc = { lat: seg.lat, lon: seg.lon, zone: seg.zone };

  // Missing funded segment
  if (seg.funded && !seg.built) {
    events.push(
      makeEvent("fiber", "warning", "fiber-audit", loc, {
        segmentId: seg.segmentId,
        issue: "missing_segment",
        funded: seg.funded,
        built: seg.built,
      })
    );
  }

  // Paper completion
  if (seg.claimedComplete && !seg.built) {
    events.push(
      makeEvent("fiber", "warning", "fiber-audit", loc, {
        segmentId: seg.segmentId,
        issue: "paper_completion",
        claimedComplete: seg.claimedComplete,
        built: seg.built,
      })
    );
  }

  // High latency (fake fiber / bad backhaul)
  if ((seg.latencyMs ?? 0) > 40) {
    events.push(
      makeEvent("fiber", "warning", "fiber-audit", loc, {
        segmentId: seg.segmentId,
        issue: "high_latency",
        latencyMs: seg.latencyMs,
      })
    );
  }

  // Chronic outages
  if ((seg.outagesLast30d ?? 0) > 5) {
    events.push(
      makeEvent("fiber", "warning", "fiber-audit", loc, {
        segmentId: seg.segmentId,
        issue: "chronic_outages",
        outagesLast30d: seg.outagesLast30d,
      })
    );
  }

  return events;
}
