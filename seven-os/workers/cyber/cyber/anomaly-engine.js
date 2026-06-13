// workers/system/cyber/anomaly.engine.js

export function detectAnomalies(data, context) {
  const anomalies = [];

  if (data.latency && data.latency > 2000) {
    anomalies.push("high_latency");
  }

  if (data.requests && data.requests > 1000) {
    anomalies.push("suspicious_request_volume");
  }

  return {
    anomalies,
    suspicious: anomalies.length > 0
  };
}
