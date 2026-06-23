// backend/system/ewo/ewo-router.js
// GISA Multi‑Sector EWO Router (v3)

import { validateEWO } from "./ewo-schema.js";
import { routeToSectorWorker } from "../routing/sector-router.js";
import { logEvent } from "../logging/system-log.js";

export async function handleEWORequest(request) {
  try {
    const ewo = await request.json();

    // Validate EWO structure
    const validation = validateEWO(ewo);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400 }
      );
    }

    // Log EWO creation
    await logEvent({
      type: "EWO_CREATED",
      ewo_id: ewo.ewo_id,
      sector: ewo.sector,
      region: ewo.region,
      timestamp: Date.now()
    });

    // Route to correct sector worker
    const dispatchResult = await routeToSectorWorker(ewo);

    return new Response(
      JSON.stringify({
        status: "EWO_DISPATCHED",
        ewo_id: ewo.ewo_id,
        sector: ewo.sector,
        dispatch: dispatchResult
      }),
      { status: 200 }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Invalid EWO payload", details: err.message }),
      { status: 500 }
    );
  }
}
