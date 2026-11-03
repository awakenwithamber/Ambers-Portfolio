-- Amber Patten Portfolio — D1 lead schema (migration 0001)
-- Status workflow: new -> contacted -> qualified -> proposal -> won / lost -> archived
CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  website TEXT,
  project_type TEXT,
  budget TEXT,
  primary_problem TEXT,
  desired_outcome TEXT,
  message TEXT NOT NULL,
  consent INTEGER NOT NULL DEFAULT 0 CHECK (consent IN (0, 1)),
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new','contacted','qualified','proposal','won','lost','archived')),
  source TEXT,
  referrer TEXT,
  ip_hash TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_ip_created ON leads(ip_hash, created_at);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
