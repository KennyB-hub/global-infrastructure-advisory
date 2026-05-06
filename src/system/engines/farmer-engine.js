export function buildFarmerView({ farmer, opportunities }) {
  const regionMatches = opportunities.filter(o => o.region === farmer.region);
  return {
    farmerId: farmer.id,
    region: farmer.region,
    opportunities: regionMatches
  };
}
