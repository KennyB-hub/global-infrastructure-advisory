export function validateLog(type, entry) {
  const required = {
    session: ['sessionId', 'timestamp', 'request', 'output'],
    audit: ['auditId', 'timestamp', 'actor', 'action'],
    telemetry: ['sessionId', 'timestamp', 'engine', 'durationMs'],
    memory: ['sessionId', 'timestamp', 'memoryEvent', 'key']
  };

  const fields = required[type];
  if (!fields) throw new Error(`Unknown log type: ${type}`);

  const missing = fields.filter(f => !(f in entry));
  return {
    valid: missing.length === 0,
    missing
  };
}
