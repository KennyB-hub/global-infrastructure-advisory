/**
 * © 2026 Global Infrastructure Advisory
 * Emergency Dispatch Engine — EWO Generator
 */

export const generateEWO = async (worker, project, logToAzure) => {
  const authToken = Math.random().toString(36).substr(2, 9).toUpperCase();

  const ewoData = {
    project_id: project.id,
    lat: project.location.lat,
    lon: project.location.lon,
    sector: project.sector,
    worker_name: worker.name,
    auth_token: authToken,
    timestamp: new Date().toISOString()
  };

  await logToAzure("EMERGENCY_DISPATCH", ewoData);

  return ewoData;
};
