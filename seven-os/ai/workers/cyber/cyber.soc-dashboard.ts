// cyber.soc-dashboard.ts – V12 Alpha
// Aggregates cyber events into a SOC-style dashboard feed

export class CyberSOCDashboardWorker {
  private static feed: any[] = [];

  static async push(event: any) {
    const entry = {
      timestamp: Date.now(),
      source: event.source || "unknown",
      severity: event.severity || "info",
      eventType: event.eventType || "unknown",
      intelScore: event.intelScore || 0,
      intelCategory: event.intelCategory || "benign",
      tags: event.tags || [],
      raw: event.raw || {}
    };

    this.feed.push(entry);

    return { worker: "cyber", event: "dashboard_updated", entry };
  }

  static async getFeed(limit = 50) {
    return this.feed.slice(-limit);
  }
}
