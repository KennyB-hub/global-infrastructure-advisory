import { GovernanceRule } from './types.js';
import { loadGlobalManifest } from "../seven-runtime/manifest-loader";

const globalManifest = loadGlobalManifest();

export interface GovernanceBrain {
  loadRules(rules: GovernanceRule[]): void;
  getRulesByDomain(domain: string): GovernanceRule[];
  findRuleById(id: string): GovernanceRule | undefined;
}

export class InMemoryGovernanceBrain implements GovernanceBrain {
  private rules: GovernanceRule[] = [];

  loadRules(rules: GovernanceRule[]) {
    this.rules = rules;
  }

  getRulesByDomain(domain: string) {
    return this.rules.filter(r => r.domain === domain);
  }

  findRuleById(id: string) {
    return this.rules.find(r => r.id === id);
  }
}
