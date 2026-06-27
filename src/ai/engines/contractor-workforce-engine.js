// Contractor + Public Workforce Engine

import { writeLog } from '../../logs/log-writer.js';

export function matchWorkforce(task) {
  const { sector, location, skillsRequired, priority, context } = task;

  const pool = loadWorkforcePool(); // contractors + public workforce + NGOs

  const candidates = pool.filter(worker => {
    const sectorMatch = worker.sectors.includes(sector);
    const skillMatch = skillsRequired.every(s => worker.skills.includes(s));
    const regionMatch = worker.regions.includes(location.region);
    const availability = worker.status === 'available';
    return sectorMatch && skillMatch && regionMatch && availability;
  });

  const sorted = candidates.sort((a, b) => {
    const aScore = scoreWorker(a, priority, context);
    const bScore = scoreWorker(b, priority, context);
    return bScore - aScore;
  });

  const selected = sorted[0] || null;

  writeLog('session', {
    sessionId: `workforce-${Date.now()}`,
    request: { task },
    output: { selectedWorker: selected },
    context: { sector, location, priority }
  });

  return selected;
}

function loadWorkforcePool() {
  // Conceptual: contractors, public works, NGOs, emergency volunteers
  return [];
}

function scoreWorker(worker, priority, context) {
  let score = 0;
  if (priority === 'critical') score += 50;
  if (worker.tags?.includes('disaster-experienced')) score += 20;
  if (worker.tags?.includes('war-zone-experienced')) score += 30;
  if (context?.warZone && worker.tags?.includes('humanitarian')) score += 20;
  return score;
}
