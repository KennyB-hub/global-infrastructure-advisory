import schema from "./context-schema.json" assert { type: "json" };

export class ContextValidator {
  static validate(obj) {
    if (!obj || typeof obj !== "object") {
      throw new Error("Context object missing or invalid");
    }

    for (const key of Object.keys(schema)) {
      if (!(key in obj)) {
        throw new Error(`Missing required context field: ${key}`);
      }
    }

    return true;
  }
}
