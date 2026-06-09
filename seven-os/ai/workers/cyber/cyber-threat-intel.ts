// cyber.threat-intel.ts – V12 Alpha
// Enriches normalized cyber telemetry with threat intelligence,
// scoring, and simple correlation.

import { NormalizedCyberTelemetry } from "./cyber.normalizer";

export interface ThreatIntelResult {
  score: number; // 0–100
  category: "benign" | "suspicious" | "malicious";
  tags: string[];
  matchedIndicators: string[];
  notes?: string;
}

export class CyberThreatIntelEngine {
  /**
   * Main entry point: enrich a single telemetry event
   */
  static async enrich(
    telemetry: NormalizedCyberTelemetry
  ): Promise<ThreatIntelResult> {
    if (!telemetry) {
      return this.empty();
    }

    const indicators = telemetry.indicators || {};
    const matches: string[] = [];
    const tags: string[] = [];

    let score = 0;

    // Example heuristic rules (can later be replaced or augmented with ML)
    if (indicators.srcIp && this.isKnownBadIP(indicators.srcIp)) {
      score += 40;
      matches.push("srcIp");
      tags.push("known_bad_ip");
    }

    if (indicators.dstIp && this.isKnownBadIP(indicators.dstIp)) {
      score += 30;
      matches.push("dstIp");
      tags.push("known_bad_ip");
    }

    if (indicators.hash && this.isKnownMalwareHash(indicators.hash)) {
      score += 50;
      matches.push("hash");
      tags.push("known_malware");
    }

    if (telemetry.eventType.toLowerCase().includes("ransomware")) {
      score += 40;
      tags.push("ransomware");
    }

    if (telemetry.eventType.toLowerCase().includes("ddos")) {
      score += 30;
      tags.push("ddos");
    }

    if (telemetry.source === "endpoint" && indicators.file?.endsWith(".exe")) {
      score += 10;
      tags.push("suspicious_executable");
    }

    // Map severity into score
    score += this.severityWeight(telemetry.severity);

    // Clamp score
    if (score > 100) score = 100;
    if (score < 0) score = 0;

    const category = this.scoreToCategory(score);

    return {
      score,
      category,
      tags: Array.from(new Set(tags)),
      matchedIndicators: matches,
      notes: this.categoryNote(category)
    };
  }

  /**
   * Placeholder: known bad IP check
   * In production, this would query a TI feed, database, or cache.
   */
  private static isKnownBadIP(ip: string): boolean {
    const demoBadIPs = ["1.2.3.4", "5.6.7.8"];
    return demoBadIPs.includes(ip);
  }

  /**
   * Placeholder: known malware hash check
   */
  private static isKnownMalwareHash(hash: string): boolean {
    const demoBadHashes = [
      "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
    ];
    return demoBadHashes.includes(hash);
  }

  /**
   * Map severity to score weight
   */
  private static severityWeight(sev: string): number {
    switch (sev) {
      case "critical":
        return 40;
      case "high":
        return 25;
      case "medium":
        return 10;
      case "low":
        return 5;
      case "info":
      default:
        return 0;
    }
  }

  /**
   * Map score to category
   */
  private static scoreToCategory(
    score: number
  ): "benign" | "suspicious" | "malicious" {
    if (score >= 70) return "malicious";
    if (score >= 30) return "suspicious";
    return "benign";
  }

  /**
   * Category notes
   */
  private static categoryNote(category: string): string {
    switch (category) {
      case "malicious":
        return "High likelihood of active threat. Immediate response recommended.";
      case "suspicious":
        return "Potential threat. Increase monitoring and consider containment.";
      case "benign":
      default:
        return "No strong indicators of malicious activity.";
    }
  }

  /**
   * Empty result
   */
  private static empty(): ThreatIntelResult {
    return {
      score: 0,
      category: "benign",
      tags: [],
      matchedIndicators: [],
      notes: "No telemetry provided."
    };
  }
}
