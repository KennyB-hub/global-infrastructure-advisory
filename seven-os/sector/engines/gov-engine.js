export function buildGovSectorView({ sectors, opportunities, workforce }) {
  return sectors.map(s => {
    const sectorOpps = opportunities.filter(o => o.sector === s.id);
    const sectorWorkers = workforce.filter(w => w.sector === s.id);
    return {
      sectorId: s.id,
      name: s.name,
      opportunities: sectorOpps.length,
      workforce: sectorWorkers.length
    };
  });
}
