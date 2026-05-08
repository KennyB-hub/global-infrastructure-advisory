-- security_events: raw events from policy engine, workers, hubs
CREATE TABLE IF NOT EXISTS security_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts INTEGER NOT NULL,
  zone TEXT NOT NULL,
  workflow TEXT NOT NULL,
  event_type TEXT NOT NULL,
  ip TEXT,
  ua TEXT,
  session_key TEXT,
  severity TEXT,          -- optional: low/medium/high/critical (initial guess)
  meta TEXT               -- JSON blob
);

CREATE INDEX IF NOT EXISTS idx_security_events_ts
  ON security_events (ts DESC);

CREATE INDEX IF NOT EXISTS idx_security_events_zone
  ON security_events (zone);

CREATE INDEX IF NOT EXISTS idx_security_events_workflow
  ON security_events (workflow);

-- security_findings: AI/Cyber Engine conclusions
CREATE TABLE IF NOT EXISTS security_findings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts INTEGER NOT NULL,
  severity TEXT NOT NULL,   -- low/medium/high/critical
  summary TEXT NOT NULL,
  details TEXT,             -- JSON or long text
  source TEXT NOT NULL,     -- "cyber-engine", "policy", "system"
  resolved INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_security_findings_ts
  ON security_findings (ts DESC);

CREATE INDEX IF NOT EXISTS idx_security_findings_severity
  ON security_findings (severity);
