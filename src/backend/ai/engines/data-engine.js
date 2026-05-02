// Data normalization, validation, and transformation
export class DataEngine {
  // Normalize input fields
  normalize(input) {
    const out = {};
    for (const key in input) {
      out[key.toLowerCase()] = String(input[key]).trim();
    }
    return out;
  }

  // Validate required fields
  validate(input, required) {
    for (const field of required) {
      if (!input[field]) return false;
    }
    return true;
  }

  // Transform for AI Cortex
  transformForAI(input) {
    return {
      ...input,
      timestamp: Date.now(),
      source: "GIA-Platform"
    };
  }
}
