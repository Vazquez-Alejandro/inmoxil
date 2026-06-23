-- 011: Settings, WhatsApp, payments, signature requests, permissions

ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS contact_address TEXT;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS social_instagram TEXT;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS social_facebook TEXT;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS social_twitter TEXT;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS social_linkedin TEXT;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/Argentina/Buenos_Aires';

CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('owner','admin','agent')),
  permission VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, role, permission)
);

CREATE TABLE IF NOT EXISTS whatsapp_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  lead_id UUID REFERENCES pipeline_leads(id) ON DELETE SET NULL,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('sent','received')),
  content TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'sent',
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS signature_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE NOT NULL,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
  signer_name TEXT NOT NULL,
  signer_email TEXT NOT NULL,
  signer_type VARCHAR(10) NOT NULL CHECK (signer_type IN ('lessor','lessee')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','sent','signed','expired','declined')),
  signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'ARS',
  concept VARCHAR(50) NOT NULL CHECK (concept IN ('rent','deposit','commission','other')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','refunded')),
  payment_method VARCHAR(50),
  stripe_payment_intent_id TEXT,
  paid_by TEXT,
  paid_at TIMESTAMPTZ,
  due_date DATE,
  period_from DATE,
  period_to DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE contracts ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- Seed default permissions for existing workspaces
INSERT INTO role_permissions (workspace_id, role, permission)
SELECT w.id, 'owner', p.permission
FROM workspaces w
CROSS JOIN (VALUES 
  ('properties.view'), ('properties.create'), ('properties.edit'), ('properties.delete'),
  ('properties.publish'),
  ('leads.view'), ('leads.create'), ('leads.edit'), ('leads.delete'),
  ('leads.move_stage'),
  ('contracts.view'), ('contracts.create'), ('contracts.edit'), ('contracts.delete'),
  ('contracts.sign'),
  ('maintenance.view'), ('maintenance.create'), ('maintenance.edit'), ('maintenance.delete'),
  ('team.view'), ('team.invite'), ('team.remove'), ('team.change_role'),
  ('settings.view'), ('settings.edit'),
  ('whatsapp.view'), ('whatsapp.send'), ('whatsapp.templates'),
  ('reports.view'), ('reports.export'),
  ('payments.view'), ('payments.create'), ('payments.refund'),
  ('billing.view'),
  ('scraping.view'), ('scraping.run'),
  ('publish.view'), ('publish.run')
) AS p(permission)
WHERE NOT EXISTS (
  SELECT 1 FROM role_permissions rp WHERE rp.workspace_id = w.id AND rp.role = 'owner' AND rp.permission = p.permission
);

INSERT INTO role_permissions (workspace_id, role, permission)
SELECT w.id, 'admin', p.permission
FROM workspaces w
CROSS JOIN (VALUES 
  ('properties.view'), ('properties.create'), ('properties.edit'), ('properties.delete'),
  ('leads.view'), ('leads.create'), ('leads.edit'), ('leads.delete'),
  ('leads.move_stage'),
  ('contracts.view'), ('contracts.create'), ('contracts.edit'),
  ('maintenance.view'), ('maintenance.create'), ('maintenance.edit'),
  ('team.view'),
  ('settings.view'),
  ('whatsapp.view'), ('whatsapp.send'), ('whatsapp.templates'),
  ('reports.view'), ('reports.export'),
  ('payments.view'), ('payments.create'),
  ('scraping.view'), ('scraping.run'),
  ('publish.view')
) AS p(permission)
WHERE NOT EXISTS (
  SELECT 1 FROM role_permissions rp WHERE rp.workspace_id = w.id AND rp.role = 'admin' AND rp.permission = p.permission
);

INSERT INTO role_permissions (workspace_id, role, permission)
SELECT w.id, 'agent', p.permission
FROM workspaces w
CROSS JOIN (VALUES 
  ('properties.view'),
  ('leads.view'), ('leads.create'), ('leads.edit'),
  ('leads.move_stage'),
  ('contracts.view'),
  ('maintenance.view'), ('maintenance.create'),
  ('whatsapp.view'), ('whatsapp.send'),
  ('payments.view')
) AS p(permission)
WHERE NOT EXISTS (
  SELECT 1 FROM role_permissions rp WHERE rp.workspace_id = w.id AND rp.role = 'agent' AND rp.permission = p.permission
);
