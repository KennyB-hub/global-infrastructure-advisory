CREATE TABLE contractors (
    id INTEGER PRIMARY KEY,
    name TEXT,
    skills TEXT,
    location TEXT,
    rating REAL
);

CREATE TABLE opportunities (
    id INTEGER PRIMARY KEY,
    title TEXT,
    description TEXT,
    location TEXT,
    donor_id INTEGER
);

CREATE TABLE donors (
    id INTEGER PRIMARY KEY,
    name TEXT,
    region TEXT
);

CREATE TABLE ai_logs (
    id INTEGER PRIMARY KEY,
    worker_id TEXT,
    action TEXT,
    timestamp TEXT
);
