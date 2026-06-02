-- GIA DEEP Mind 2100 - Database Schema

-- Table for Audit Logs and AI Insights (Herstory)
CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    trust_zone TEXT,
    query TEXT,
    insight TEXT,
    status TEXT
);

-- Table for Identity Anchors (The Lasso of Truth)
CREATE TABLE IF NOT EXISTS identity_anchors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    anchor_hash TEXT UNIQUE,
    label TEXT, -- e.g., "Global Admin EIN"
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
