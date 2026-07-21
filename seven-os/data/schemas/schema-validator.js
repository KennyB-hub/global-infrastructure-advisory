import Ajv from "ajv";
import { loadSchemaRegistry } from "../../ai/validation/schema-registry.js";

const ajv = new Ajv({ allErrors: true });
const registry = loadSchemaRegistry();

export function validate(schemaName, data) {
  const schema = registry[schemaName];

  if (!schema) {
    throw new Error(`Schema '${schemaName}' not found in registry.`);
  }

  const validateFn = ajv.compile(schema);
  const valid = validateFn(data);

  return {
    ok: valid,
    errors: validateFn.errors || []
  };
}
