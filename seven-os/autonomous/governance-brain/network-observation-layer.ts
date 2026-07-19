import { TowerProfile, NetworkEvent } from './types';

export class NetworkObservationLayer {
  private towers = new Map<string, TowerProfile>();
  private events: NetworkEvent[] = [];

  registerTower(profile: TowerProfile) {
    this.towers.set(profile.towerId, profile);
  }

  recordEvent(event: NetworkEvent) {
    this.events.push(event);
  }

  getTower(towerId: string) {
    return this.towers.get(towerId);
  }

  getEvents(towerId: string) {
    return this.events.filter(e => e.towerId === towerId);
  }
}
