export interface CyberPolicy {
  allowedSectors: string[];
  allowedTrustZones: string[];
  maxRate?: number;
  blockOnDrift?: boolean;
  escalateOnAnomaly?: boolean;
}

export const SectorPolicies: Record<string, CyberPolicy> = {
  public: {
    allowedSectors: ['public'],
    allowedTrustZones: ['anon', 'user'],
    maxRate: 50
  },
  contractor: {
    allowedSectors: ['contractor', 'public'],
    allowedTrustZones: ['user'],
    escalateOnAnomaly: true
  },
  gov: {
    allowedSectors: ['gov'],
    allowedTrustZones: ['admin', 'system'],
    blockOnDrift: true
  },
  deepgov: {
    allowedSectors: ['deepgov'],
    allowedTrustZones: ['system'],
    blockOnDrift: true,
    escalateOnAnomaly: true
  }
};
