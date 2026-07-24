import { GovernanceRule } from '../core/fcc/telecom-equipment-authorization/types';

export class GovernanceBrain {
  private rules: GovernanceRule[] = [];

  loadRules(rules: GovernanceRule[]) {
    this.rules = rules;
  }

  getRulesByDomain(domain: string) {
    return this.rules.filter(r => r.domain === domain);
  }

  findRule(id: string) {
    return this.rules.find(r => r.id === id);
  }
}
