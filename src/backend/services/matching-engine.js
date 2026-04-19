// src/backend/services/matching-engine.js
// Core Matching Engine — government-grade, compliance-aware

export function scoreMatch(worker, job, options = {}) {
  const weights = {
    skills: 0.35,
    location: 0.2,
    availability: 0.15,
    certifications: 0.15,
    compliance: 0.15,
    ...options.weights
  };

  const scores = {
    skills: skillScore(worker, job),
    location: locationScore(worker, job),
    availability: availabilityScore(worker, job),
    certifications: certificationScore(worker, job),
    compliance: complianceScore(worker, job)
  };

  const total =
    scores.skills * weights.skills +
    scores.location * weights.location +
    scores.availability * weights.availability +
    scores.certifications * weights.certifications +
    scores.compliance * weights.compliance;

  return { total, breakdown: scores, weights };
}

function skillScore(worker, job) {
  if (!job.requiredSkills || !worker.skills) return 0;
  const required = job.requiredSkills;
  const has = worker.skills;
  const matched = required.filter(s => has.includes(s)).length;
  return required.length ? matched / required.length : 0;
}

function locationScore(worker, job) {
  if (!job.location || !worker.location) return 0;
  return job.location.region === worker.location.region ? 1 : 0;
}

function availabilityScore(worker, job) {
  if (!job.startDate || !worker.availability) return 0;
  return worker.availability.includes("immediate") ? 1 : 0;
}

function certificationScore(worker, job) {
  if (!job.requiredCerts || !worker.certifications) return 0;
  const required = job.requiredCerts;
  const has = worker.certifications;
  const matched = required.filter(c => has.includes(c)).length;
  return required.length ? matched / required.length : 0;
}

function complianceScore(worker, job) {
  if (job.requiresDavisBacon && !worker.davisBaconEligible) return 0;
  if (job.requiresBonded && !worker.bonded) return 0;
  return 1;
}
