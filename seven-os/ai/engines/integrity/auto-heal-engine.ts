// auto-heal-engine.ts

import { FullIntegrityScan } from "./full-integrity-scan";
import { RepoDiffAnalyzer } from "./repo-diff-analyzer";
import { queueTask } from "./task-queue";

export class AutoHealEngine {
  static run() {
    const integrity = FullIntegrityScan.run();
    const repo = RepoDiffAnalyzer.analyze();

    queueTask({
      type: "auto-heal-summary",
      payload: { integrity, repo },
      status: "pending"
    });
  }
}
