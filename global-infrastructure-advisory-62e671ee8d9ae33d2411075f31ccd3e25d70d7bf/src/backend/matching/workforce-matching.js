import { matchJobs } from "./multi-sector-matching.js";
import { validate } from "../data/schema-validator.js";

export function matchWorkforceToJobs(workforce, jobs) {
  const validation = validate("workforce", workforce);

  if (!validation.ok) {
    return {
      ok: false,
      errors: validation.errors
    };
  }

  const matches = matchJobs(workforce, jobs);

  return {
    ok: true,
    matches
  };
}
