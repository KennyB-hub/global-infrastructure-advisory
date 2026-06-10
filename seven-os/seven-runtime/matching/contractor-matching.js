import { validate } from "../data/schema-validator.js";

export function matchContractorToJobs(contractor, jobs) {
  const validation = validate("contractor", contractor);

  if (!validation.ok) {
    return {
      ok: false,
      errors: validation.errors
    };
  }

  const results = jobs.map(job => {
    let score = 0;

    if (contractor.sector === job.sector) score += 20;

    if (contractor.services)
      score += contractor.services.filter(s => job.services?.includes(s)).length * 5;

    if (contractor.certifications)
      score += contractor.certifications.filter(c => job.certifications?.includes(c)).length * 3;

    if (contractor.sectorExperience?.includes(job.sector))
      score += 10;

    if (contractor.clearanceLevel === job.clearanceLevel)
      score += 10;

    if (contractor.insurance) score += 5;
    if (contractor.backgroundCheck) score += 5;

    return { job, score };
  });

  return {
    ok: true,
    matches: results.sort((a, b) => b.score - a.score)
  };
}
