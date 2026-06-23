// cyber.normalizer.ts – V12 Alpha
// Normalizes all cyber logs, alerts, and signals into a unified telemetry format.

export interface NormalizedCyberTelemetry {
  source: string;              // firewall, ids, siem, endpoint, cloud
  timestamp: number;
  severity: "info" | "low" | "medium" | "high" | "critical";
  eventType: string;           // login_failure, ddos, ransomware, etc.
  indicators: Record<string, any>;
  raw: any;                    // original event for audit
}

export class CyberTelemetryNormalizer {
  /**
   * Main entry point
   */
  static normalize(event: any): NormalizedCyberTelemetry {
    if (!event) {
      return this.empty("unknown");
    }

    // Detect source type
    if (event.firewall) return this.fromFirewall(event);
    if (event.ids || event.ips) return this.fromIDS(event);
    if (event.siem) return this.fromSIEM(event);
    if (event.endpoint) return this.fromEndpoint(event);
    if (event.cloud) return this.fromCloud(event);

    return this.generic(event);
  }

  /**
   * Firewall logs
   */
  private static fromFirewall(e: any): NormalizedCyberTelemetry {
    return {
      source: "firewall",
      timestamp: Date.now(),
      severity: this.mapSeverity(e.severity),
      eventType: e.action === "deny" ? "blocked_traffic" : "allowed_traffic",
      indicators: {
        srcIp: e.src,
        dstIp: e.dst,
        port: e.port,
        protocol: e.protocol,
        bytes: e.bytes
      },
      raw: e
    };
  }

  /**
   * IDS/IPS alerts
   */
  private static fromIDS(e: any): NormalizedCyberTelemetry {
    return {
      source: "ids_ips",
      timestamp: Date.now(),
      severity: this.mapSeverity(e.priority),
      eventType: e.signature || "intrusion_detected",
      indicators: {
        srcIp: e.src,
        dstIp: e.dst,
        ruleId: e.ruleId,
        classification: e.classification
      },
      raw: e
    };
  }

  /**
   * SIEM events
   */
  private static fromSIEM(e: any): NormalizedCyberTelemetry {
    return {
      source: "siem",
      timestamp: e.timestamp || Date.now(),
      severity: this.mapSeverity(e.level),
      eventType: e.eventType || "siem_event",
      indicators: e.details || {},
      raw: e
    };
  }

  /**
   * Endpoint detections
   */
  private static fromEndpoint(e: any): NormalizedCyberTelemetry {
    return {
      source: "endpoint",
      timestamp: Date.now(),
      severity: this.mapSeverity(e.severity),
      eventType: e.threat || "endpoint_alert",
      indicators: {
        hostname: e.hostname,
        user: e.user,
        file: e.file,
        process: e.process,
        hash: e.hash
      },
      raw: e
    };
  }

  /**
   * Cloud audit logs
   */
  private static fromCloud(e: any): NormalizedCyberTelemetry {
    return {
      source: "cloud",
      timestamp: e.time || Date.now(),
      severity: this.mapSeverity(e.severity),
      eventType: e.action || "cloud_event",
      indicators: {
        user: e.user,
        resource: e.resource,
        region: e.region,
        ip: e.ip
      },
      raw: e
    };
  }

  /**
   * Generic fallback
   */
  private static generic(e: any): NormalizedCyberTelemetry {
    return {
      source: "unknown",
      timestamp: Date.now(),
      severity: "info",
      eventType: "generic_event",
      indicators: e,
      raw: e
    };
  }

  /**
   * Empty object for invalid input
   */
  private static empty(source: string): NormalizedCyberTelemetry {
    return {
      source,
      timestamp: Date.now(),
      severity: "info",
      eventType: "empty",
      indicators: {},
      raw: {}
    };
  }

  /**
   * Severity mapping
   */
  private static mapSeverity(level: any): any {
    if (!level) return "info";

    const map: any = {
      1: "critical",
      2: "high",
      3: "medium",
      4: "low",
      5: "info",
      "critical": "critical",
      "high": "high",
      "medium": "medium",
      "low": "low",
      "info": "info"
    };

    return map[level] || "info";
  }
}
