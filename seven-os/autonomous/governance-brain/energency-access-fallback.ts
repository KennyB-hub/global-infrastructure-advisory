import { EmergencyRule } from './types.ts';

export class GovernanceBrain {
  private rules: EmergencyRule[] = [];

  loadRules(rules: EmergencyRule[]) {
    this.rules = rules;
  }

  getRulesByDomain(domain: string) {
    return this.rules.filter(r => r.domain === domain);
  }

  findRule(id: string) {
    return this.rules.find(r => r.id === id);
  }
}
