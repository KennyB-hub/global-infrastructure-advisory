import { CyberEvent } from './event-model';

export function buildEvent(params: {
  source: string;
  sector: string;
  trustZone: string;
  type: string;
  metadata?: any;
}): CyberEvent {
  return {
    ...params,
    timestamp: Date.now()
  };
}
