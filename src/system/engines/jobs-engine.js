export function buildJobsView({ workforce, opportunities }) {
  return opportunities.map(o => {
    const candidates = workforce.filter(w => w.sector === o.sector);
    return { opportunity: o, candidates };
  });
}
