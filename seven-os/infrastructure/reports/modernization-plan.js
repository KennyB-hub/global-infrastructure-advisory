export function generateModernizationPlan(data = {}, hazards = [], score = null) {
  return {
    summary: 'Stub modernization plan generated for local testing',
    hazardsCount: hazards.length,
    score,
    recommendations: [
      { id: 'mock-1', title: 'Validate sensor coverage', priority: 'medium' },
      { id: 'mock-2', title: 'Schedule contractor inspection', priority: 'low' }
    ]
  };
}
