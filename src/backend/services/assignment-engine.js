// src/backend/services/assignment-engine.js
// Assignment Engine — assigns best eligible worker/contractor to a job.

import { scoreMatch } from "./matching-engine.js";

export function assignBestCandidate(job, candidates, options = {}) {
  if (!Array.isArray(candidates) || candidates.length === 0) {
    return { assigned: null, reason: "No candidates available." };
  }

  const scored = candidates
    .map(c => ({
      candidate: c,
      score: scoreMatch(c, job, options)
    }))
    .filter(x => x.score.total > (options.minScore || 0.4))
    .sort((a, b) => b.score.total - a.score.total);

  if (!scored.length) {
    return { assigned: null, reason: "No candidate met minimum score." };
  }

  return {
    assigned: scored[0].candidate,
    score: scored[0].score,
    jobId: job.id
  };
}
