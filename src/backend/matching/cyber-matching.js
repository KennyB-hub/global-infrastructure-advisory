export function matchCyberJobs(workforce, jobs) {
  return jobs
    .map(job => {
      const score = [
        workforce.skills.filter(s => job.skills.includes(s)).length * 3,
        workforce.certifications.filter(c => job.certifications.includes(c)).length * 5,
        workforce.experienceYears >= (job.experienceRequired || 0) ? 10 : 0,
        workforce.clearanceLevel === job.clearanceLevel ? 10 : 0
      ].reduce((a, b) => a + b, 0);

      return { job, score };
    })
    .sort((a, b) => b.score - a.score);
}
