// Repo Diff Analyzer

import { execSync } from "child_process";
import { queueTask } from "../autonomous/task-queue";

export class RepoDiffAnalyzer {
  static analyzeSinceLastCommit() {
    try {
      const diff = execSync("git diff --name-status HEAD", {
        encoding: "utf8"
      });

      const lines = diff
        .split("\n")
        .map(l => l.trim())
        .filter(Boolean);

      const changes = lines.map(line => {
        const [status, file] = line.split(/\s+/, 2);
        return { status, file };
      });

      const risky = changes.filter(c =>
        c.file.startsWith("backend/") || c.file.startsWith("config/")
      );

      if (risky.length) {
        queueTask({
          type: "review-risky-changes",
          payload: { risky },
          status: "pending"
        });
      }

      return { changes, risky };
    } catch (err) {
      queueTask({
        type: "repo-diff-error",
        payload: { error: String(err) },
        status: "pending"
      });
      return { changes: [], risky: [], error: true };
    }
  }
}
