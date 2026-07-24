import { ContextBuilder } from "./context-builder.js";
import { ContextValidator } from "./context-validator.js";
import { GeoContext } from "../../../workers/system/index.js";
import { SectorOverlays } from "../../../workers/system/index.js";
import { PolicyEngine } from "../../policy/engine.js";
import { AuditEngine } from "../../../ai/audit/audit-engine.js";
import { IntegrityDrone } from "../../utilities/integrity/index.js";

export class ContextEngine {
  static generate(input, environment, sector, actions, audit) {
    const { lat, lon } = input;

    // 1. Geo-Logic V12 Alpha → location
    const location = GeoContext.build(lat, lon);

    // 2. Base context
    let ctx = ContextBuilder.build(
      input,
      location,
      environment,
      sector,
      actions,
      audit
    );

    // 3. Sector overlays (correct placement)
    if (SectorOverlays[input.sector]) {
      ctx.sector.context = SectorOverlays[input.sector](ctx);
    }

    // 4. Policy engine (correct placement)
    const policyResult = PolicyEngine.evaluate(ctx);
    ctx.actions = policyResult;

    // 5. Audit engine (correct placement)
    ctx.audit = AuditEngine.build(ctx, {
      policyIds: policyResult.policyIds || []
    });

    // 6. Integrity Drone (correct placement)
    IntegrityDrone.enqueue({
      type: "contextSnapshot",
      data: ctx
    });

    // 7. Validate final context (correct placement)
    ContextValidator.validate(ctx);

    return ctx;
  }
}
