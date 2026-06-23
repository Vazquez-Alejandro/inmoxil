-- 012: Tenant portal + auto reports + payment checkout fields

-- Tenant access tokens
CREATE TABLE IF NOT EXISTS tenant_access_tokens (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  contract_id INTEGER NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  last_access_at TIMESTAMP,
  active BOOLEAN DEFAULT true
);
CREATE INDEX IF NOT EXISTS idx_tenant_access_workspace ON tenant_access_tokens(workspace_id);
CREATE INDEX IF NOT EXISTS idx_tenant_access_token ON tenant_access_tokens(token);

-- Report schedules
CREATE TABLE IF NOT EXISTS report_schedules (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'monthly',
  email TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  last_sent_at TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_report_schedules_workspace ON report_schedules(workspace_id);

-- Report logs
CREATE TABLE IF NOT EXISTS report_logs (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'monthly',
  recipient TEXT NOT NULL,
  summary TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_report_logs_workspace ON report_logs(workspace_id);

-- Add checkout fields to payments
ALTER TABLE payments ADD COLUMN IF NOT EXISTS checkout_url TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP;

-- Add workspace settings columns for tenant portal branding
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS logo_url TEXT;
