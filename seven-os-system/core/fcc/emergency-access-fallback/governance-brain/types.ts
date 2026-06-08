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
