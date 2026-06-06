export type GovernanceRule = {
  id: string;
  domain: 'rf' | 'network' | 'emergency';
  description: string;
  conditions: any;      // to refine later (DSL / JSON logic)
  expectations: any;    // expected behavior
};

export type DeviceRFProfile = {
  deviceId: string;
  bands: string[];
  powerLevels: Record<string, number>;
  modulation: string;
  antennaGainDb: number;
  firmwareVersion: string;
  capabilities: string[];
};

export type BehaviorSample = {
  deviceId: string;
  timestamp: string;
  context: Record<string, any>;
  observed: Record<string, any>;
};

export type GovernanceViolation = {
  ruleId: string;
  deviceId: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  expected: any;
  observed: any;
  timestamp: string;
  notes?: string;
};
