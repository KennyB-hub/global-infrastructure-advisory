export function generateGISOverlay(data, hazards) {
  return {
    layers: ["roads", "towers", "bridges"],
    hazards,
    metadata: {
      generated: new Date().toISOString()
    }
  };
}
