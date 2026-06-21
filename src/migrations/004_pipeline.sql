-- Pipeline / CRM tables

CREATE TABLE IF NOT EXISTS pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  color VARCHAR(20) NOT NULL DEFAULT '#6366f1',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pipeline_stages_workspace ON pipeline_stages(workspace_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_order ON pipeline_stages("order");

CREATE TABLE IF NOT EXISTS pipeline_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  stage_id UUID NOT NULL REFERENCES pipeline_stages(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  full_name VARCHAR(300) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(200),
  document_type VARCHAR(10) DEFAULT 'DNI',
  document_number VARCHAR(50),
  source VARCHAR(50) NOT NULL DEFAULT 'manual',
  status VARCHAR(20) NOT NULL DEFAULT 'activo',
  notes TEXT,
  budget_min NUMERIC(12,2),
  budget_max NUMERIC(12,2),
  currency VARCHAR(3) DEFAULT 'ARS',
  requirements TEXT,
  stage_order INTEGER DEFAULT 0,
  assigned_to VARCHAR(100),
  last_contact_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pipeline_leads_workspace ON pipeline_leads(workspace_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_leads_stage ON pipeline_leads(stage_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_leads_status ON pipeline_leads(status);
CREATE INDEX IF NOT EXISTS idx_pipeline_leads_phone ON pipeline_leads(phone);

CREATE TABLE IF NOT EXISTS pipeline_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES pipeline_leads(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL,
  description TEXT NOT NULL,
  outcome TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pipeline_activities_lead ON pipeline_activities(lead_id);