// /ai/schema-guard.js
export class SchemaGuard {
  validate(input) {
    if (!input || typeof input !== "object") {
      return { valid: false, reason: "Input must be an object" };
    }

    if (!input.workflow) {
      return { valid: false, reason: "Missing workflow" };
    }

    const allowed = ["analyze", "map-2d", "map-3d", "blueprint", "document"];
    if (!allowed.includes(input.workflow)) {
      return { valid: false, reason: "Workflow not allowed" };
    }

    // Block dangerous fields
    const forbidden = ["exec", "run", "shell", "import", "require"];
    for (const key of Object.keys(input)) {
      if (forbidden.includes(key.toLowerCase())) {
        return { valid: false, reason: "Forbidden field detected" };
      }
    }

    return { valid: true };
  }
}
