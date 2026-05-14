import { ContextBuilder } from "./context-builder.js";
import { ContextValidator } from "./context-validator.js";
// adjust path to wherever your compiled/bundled geo index ends up
import { GeoContext } from "../../../../backend/utilities/dns/geo/geo-logic/index.js";

export class ContextEngine {
  static generate(input, environment, sector, actions, audit) {
    const { lat, lon } = input;

    // V12 alpha geo mapping → location block
    const location = GeoContext.build(lat, lon);

    const ctx = ContextBuilder.build(
      input,
      location,
      environment,
      sector,
      actions,
      audit
    );

    ContextValidator.validate(ctx);

    return ctx;
  }
}

