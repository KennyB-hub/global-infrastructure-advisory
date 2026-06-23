import schema from "./context-schema.json" assert { type: "json" };

export class ContextBuilder {
  static build(input, location, environment, sector, actions, audit) {
    return {
      input,
      location,
      environment,
      sector,
      actions,
      audit
    };
  }
}
