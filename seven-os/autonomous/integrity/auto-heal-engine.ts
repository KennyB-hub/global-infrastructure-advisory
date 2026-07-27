// Auto-Heal Engine

import { FullIntegrityScan } from "full-integrity-scan.ts";
import { RepoDiffAnalyzer } from "repo-diff-analyzer.ts";
import { queueTask } from "..\task-queue.ts";

export class AutoHealEngine {
  static async run() {
    const integrity = FullIntegrityScan.runAll();
    const repo = RepoDiffAnalyzer.analyzeSinceLastCommit();

    queueTask({
      type: "auto-heal-summary",
      payload: { integrity, repo },
      status: "pending"
    });
  }
}

