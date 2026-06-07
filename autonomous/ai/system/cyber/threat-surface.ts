export class ThreatSurface {
  private activeNodes = new Map<string, number>();
  private sectorActivity = new Map<string, number>();

  update(event: CyberEvent) {
    const key = `${event.source}:${event.sector}`;
    this.activeNodes.set(key, Date.now());

    const count = this.sectorActivity.get(event.sector) || 0;
    this.sectorActivity.set(event.sector, count + 1);
  }
}
