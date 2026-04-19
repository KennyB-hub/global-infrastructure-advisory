// src/backend/services/bulk-matcher.js
// Bulk Matcher — runs assignment at scale for programs / agencies.

import { assignBestCandidate } from "./assignment-engine.js";

export function bulkMatch(jobs, candidates, options = {}) {
  if (!Array.isArray(jobs) || !Array.isArray(candidates)) {
    return { matches: [], errors: ["Invalid jobs or candidates array."] };
  }

  const matches = [];
  const unmatchedJobs = [];

  for (const job of jobs) {
    const result = assignBestCandidate(job, candidates, options);
    if (result.assigned) {
      matches.push(result);
    } else {
      unmatchedJobs.push({ jobId: job.id, reason: result.reason });
    }
  }

  return { matches, unmatchedJobs };
}
