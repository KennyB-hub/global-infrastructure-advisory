// src/backend/services/hr-engine.js
// HR Engine — onboarding, compliance, certifications, safety.

export function evaluateCompliance(worker, job) {
  const issues = [];

  if (job.requiredCerts) {
    const missing = job.requiredCerts.filter(
      c => !(worker.certifications || []).includes(c)
    );
    if (missing.length) issues.push(`Missing certifications: ${missing.join(", ")}`);
  }

  if (job.requiresBackgroundCheck && !worker.backgroundCheckCleared) {
    issues.push("Background check not cleared.");
  }

  if (job.requiresDrugTest && !worker.drugTestCleared) {
    issues.push("Drug test not cleared.");
  }

  return {
    compliant: issues.length === 0,
    issues
  };
}

export function buildOnboardingChecklist(worker, job) {
  const checklist = [];

  if (!worker.w4OnFile) checklist.push("Collect W-4.");
  if (!worker.i9OnFile) checklist.push("Collect I-9.");
  if (job.requiresPPE) checklist.push("Issue PPE and safety briefing.");
  if (job.requiresOrientation) checklist.push("Schedule site orientation.");

  return {
    workerId: worker.id,
    jobId: job.id,
    checklist
  };
}
