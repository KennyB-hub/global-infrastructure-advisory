// GIA EWO Router
// Routes Emergency Work Orders to the correct sector

import { resolveSectorRoute } from "./global-routing-map.js";

export function routeEwo(ewo) {
  const result = resolveSectorRoute(ewo);
  if (!result.ok) {
    return {
      routed: false,
      reason: result.reason,
      sectorId: result.sectorId
    };
  }

  return {
    routed: true,
    sectorId: result.sectorId,
    handler: result.handler
  };
}
