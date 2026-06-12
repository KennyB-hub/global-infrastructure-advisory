export function getRegionStatus(location) {
  return {
    disaster: false,
    warZone: false,
    region: location?.region || 'default'
  };
}
