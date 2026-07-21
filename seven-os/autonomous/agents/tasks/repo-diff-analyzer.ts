// repo-diff-analyzer.ts

import { execSync } from "child_process";
import { queueTask } from "../../task-queue";

export class RepoDiffAnalyzer {
  static analyze() {
    try {
      const diff = execSync("git diff --name-status HEAD", { encoding: "utf8" })
        .split("\n")
        .filter(Boolean)
        .map(line => {
          const [status, file] = line.trim().split(/\s+/, 2);
          return { status, file };
        });

      const risky = diff.filter(d =>
        d.file.startsWith("backend/") || d.file.startsWith("config/")
      );

      if (risky.length) {
        queueTask({
          type: "review-risky-changes",
          payload: { risky },
          status: "pending"
        });
      }

      return { diff, risky };
    } catch (err) {
      queueTask({
        type: "repo-diff-error",
        payload: { error: String(err) },
        status: "pending"
      });
      return { diff: [], risky: [], error: true };
    }
  }
}
