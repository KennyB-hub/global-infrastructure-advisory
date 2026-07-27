// auto-heal-engine.ts

import { FullIntegrityScan } from "agents\tasks\full-integrity-scan.ts";
import { RepoDiffAnalyzer } from "agents\tasks\repo-diff-analyzer.ts";
import { queueTask } from "task-queue.ts";

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

