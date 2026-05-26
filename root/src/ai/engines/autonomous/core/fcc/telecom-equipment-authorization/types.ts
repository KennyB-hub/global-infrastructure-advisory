export type GovernanceRule = {
  id: string;
  domain: 'rf' | 'network' | 'emergency';
  description: string;
  conditions: any;
  expectations: any;
};
