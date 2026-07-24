// governor-interface.ts
import integrityRules from './integrity-rules.json';

export type GovernorCheck = {
  source: string;
  intent: string;
  sector: string;
  grid: string;
};

export class Governor {
  assertAllowed(check: GovernorCheck) {
    // read integrityRules, trust zones, etc.
    // throw Error if not allowed
  }
}
