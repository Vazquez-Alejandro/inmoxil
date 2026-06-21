CREATE TABLE IF NOT EXISTS commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES pipeline_leads(id) ON DELETE SET NULL,
  contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL,
  title VARCHAR(300) NOT NULL DEFAULT '',
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'ARS',
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','cancelled')),
  commission_percentage DECIMAL(5,2),
  description TEXT,
  due_date DATE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_commissions_workspace ON commissions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions(workspace_id, status);

-- Add agent role to users if not exists
DO $$ BEGIN
  ALTER TABLE users ADD COLUMN IF NOT EXISTS role_in_workspace VARCHAR(20) NOT NULL DEFAULT 'owner' CHECK (role_in_workspace IN ('owner','admin','agent'));
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
SQLEOF