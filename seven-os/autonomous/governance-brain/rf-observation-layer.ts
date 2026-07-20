import { DeviceRFProfile, BehaviorSample } from './types.js';

export interface RFObservationLayer {
  registerDeviceProfile(profile: DeviceRFProfile): void;
  recordBehavior(sample: BehaviorSample): void;
  getProfiles(): DeviceRFProfile[];
  getBehaviorForDevice(deviceId: string): BehaviorSample[];
}

export class InMemoryRFObservationLayer implements RFObservationLayer {
  private profiles = new Map<string, DeviceRFProfile>();
  private behavior: BehaviorSample[] = [];

  registerDeviceProfile(profile: DeviceRFProfile) {
    this.profiles.set(profile.deviceId, profile);
  }

  recordBehavior(sample: BehaviorSample) {
    this.behavior.push(sample);
  }

  getProfiles() {
    return Array.from(this.profiles.values());
  }

  getBehaviorForDevice(deviceId: string) {
    return this.behavior.filter(b => b.deviceId === deviceId);
  }
}
