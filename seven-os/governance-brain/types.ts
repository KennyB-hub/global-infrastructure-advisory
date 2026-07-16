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

export type EmergencyRule = {
  id: string;
  domain: 'emergency' | 'fallback' | 'accessibility';
  description: string;
  conditions: any;
  expectations: any;
};

export type EmergencyEvent = {
  deviceId: string;
  timestamp: string;
  state: 'SOS' | 'NO_SERVICE' | 'WIFI_ONLY' | 'STARLINK_ONLY';
  attemptedAction: string;
  result: string;
  metadata: any;
};

export type FallbackPath = {
  deviceId: string;
  timestamp: string;
  chain: string[]; // e.g. ["LTE", "WiFiCalling", "Starlink"]
  success: boolean;
  failurePoint?: string;
};
