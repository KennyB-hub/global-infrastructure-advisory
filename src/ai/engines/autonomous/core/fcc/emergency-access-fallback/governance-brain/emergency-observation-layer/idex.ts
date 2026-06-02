import { EmergencyEvent, FallbackPath } from '../governance-brain/types';

export class EmergencyObservationLayer {
  private events: EmergencyEvent[] = [];
  private fallbacks: FallbackPath[] = [];

  recordEmergencyEvent(event: EmergencyEvent) {
    this.events.push(event);
  }

  recordFallback(path: FallbackPath) {
    this.fallbacks.push(path);
  }

  getEvents(deviceId: string) {
    return this.events.filter(e => e.deviceId === deviceId);
  }

  getFallbacks(deviceId: string) {
    return this.fallbacks.filter(f => f.deviceId === deviceId);
  }
}
