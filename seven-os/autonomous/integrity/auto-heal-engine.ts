// Auto-Heal Engine

import { FullIntegrityScan } from "../integrity/full-integrity-scan";
import { RepoDiffAnalyzer } from "../integrity/repo-diff-analyzer";
import { queueTask } from "../../autonomous/task-queue";

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
