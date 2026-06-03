export function matchJobs(workforce, jobs) {
  return jobs
    .map(job => {
      let score = 0;

      if (job.sector === workforce.sector) score += 20;

      if (job.skills && workforce.skills)
        score += workforce.skills.filter(s => job.skills.includes(s)).length * 3;

      if (job.certifications && workforce.certifications)
        score += workforce.certifications.filter(c => job.certifications.includes(c)).length * 5;

      if (workforce.experienceYears >= (job.experienceRequired || 0))
        score += 10;

      if (workforce.clearanceLevel === job.clearanceLevel)
        score += 10;

      return { job, score };
    })
    .sort((a, b) => b.score - a.score);
}
