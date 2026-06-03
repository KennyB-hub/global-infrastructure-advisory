import { DeviceRFProfile, BehaviorSample } from '../governance-brain/types';

export class RFObservationLayer {
  private profiles = new Map<string, DeviceRFProfile>();
  private behavior: BehaviorSample[] = [];

  registerProfile(profile: DeviceRFProfile) {
    this.profiles.set(profile.deviceId, profile);
  }

  recordBehavior(sample: BehaviorSample) {
    this.behavior.push(sample);
  }

  getProfile(deviceId: string) {
    return this.profiles.get(deviceId);
  }

  getBehavior(deviceId: string) {
    return this.behavior.filter(b => b.deviceId === deviceId);
  }
}
