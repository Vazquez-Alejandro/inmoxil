-- =============================================================================
-- INMOXIL - Complete schema: all missing tables and columns
-- =============================================================================

-- 1. MISSING COLUMNS ON EXISTING TABLES

ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS public_catalog_enabled BOOLEAN DEFAULT false;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS pub_catalog_slug TEXT;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS contact_address TEXT;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS social_instagram TEXT;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS social_facebook TEXT;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS social_twitter TEXT;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS social_linkedin TEXT;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/Argentina/Buenos_Aires';

ALTER TABLE users ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS role_in_workspace TEXT DEFAULT 'member';
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

ALTER TABLE properties ADD COLUMN IF NOT EXISTS operation_type TEXT DEFAULT 'venta';
ALTER TABLE properties ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE properties ADD COLUMN IF NOT EXISTS owner_id UUID;

ALTER TABLE credit_transactions DROP CONSTRAINT IF EXISTS credit_transactions_type_check;
ALTER TABLE credit_transactions ADD CONSTRAINT credit_transactions_type_check
  CHECK (type IN ('purchase', 'consumption', 'refund', 'bonus', 'usage'));

-- 2. NEW TABLES (in dependency order)

CREATE TABLE IF NOT EXISTS property_owners (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT,
  password_hash TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE properties ADD CONSTRAINT fk_properties_owner FOREIGN KEY (owner_id) REFERENCES property_owners(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS pipeline_stages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  "order"       INTEGER NOT NULL DEFAULT 0,
  color         TEXT DEFAULT '#6366f1',
  is_default    BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pipeline_leads (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id   UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  stage_id       UUID NOT NULL REFERENCES pipeline_stages(id) ON DELETE CASCADE,
  property_id    UUID REFERENCES properties(id) ON DELETE SET NULL,
  full_name      TEXT NOT NULL,
  phone          TEXT,
  email          TEXT,
  document_type  TEXT DEFAULT 'DNI',
  document_number TEXT,
  source         TEXT DEFAULT 'manual',
  status         TEXT DEFAULT 'activo',
  notes          TEXT,
  budget_min     NUMERIC,
  budget_max     NUMERIC,
  currency       TEXT DEFAULT 'ARS',
  requirements   TEXT,
  stage_order    INTEGER DEFAULT 0,
  assigned_to    UUID REFERENCES users(id) ON DELETE SET NULL,
  last_contact_at TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pipeline_activities (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id      UUID NOT NULL REFERENCES pipeline_leads(id) ON DELETE CASCADE,
  type         TEXT NOT NULL,
  description  TEXT,
  outcome      TEXT,
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by   UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contracts (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id               UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  type                       TEXT DEFAULT 'alquiler',
  status                     TEXT DEFAULT 'activo',
  number                     TEXT,
  title                      TEXT NOT NULL,
  start_date                 DATE NOT NULL,
  end_date                   DATE NOT NULL,
  duration_months            INTEGER NOT NULL,
  lessor_name                TEXT NOT NULL,
  lessor_document_type       TEXT DEFAULT 'DNI',
  lessor_document_number     TEXT NOT NULL,
  lessor_address             TEXT,
  lessor_phone               TEXT,
  lessor_email               TEXT,
  lessee_name                TEXT NOT NULL,
  lessee_document_type       TEXT DEFAULT 'DNI',
  lessee_document_number     TEXT NOT NULL,
  lessee_address             TEXT,
  lessee_phone               TEXT,
  lessee_email               TEXT,
  property_address           TEXT NOT NULL,
  property_city              TEXT,
  property_province          TEXT,
  property_description       TEXT,
  property_cpa               TEXT,
  property_registration      TEXT,
  amount                     NUMERIC NOT NULL,
  currency                   TEXT DEFAULT 'ARS',
  adjustment_index           TEXT,
  adjustment_frequency_months INTEGER DEFAULT 12,
  deposit_amount             NUMERIC,
  commission_percentage      NUMERIC,
  commission_amount          NUMERIC,
  expenses_included          BOOLEAN DEFAULT false,
  expenses_amount            NUMERIC,
  clauses                    JSONB DEFAULT '[]',
  notes                      TEXT,
  last_adjustment_date       DATE,
  last_adjustment_value      NUMERIC,
  next_adjustment_date       DATE,
  signed_by_lessor           BOOLEAN DEFAULT false,
  signed_by_lessee           BOOLEAN DEFAULT false,
  signed_at                  TIMESTAMPTZ,
  property_id                UUID REFERENCES properties(id) ON DELETE SET NULL,
  owner_id                   UUID REFERENCES property_owners(id) ON DELETE SET NULL,
  code                       TEXT,
  tenant_name                TEXT,
  monthly_price              NUMERIC,
  created_at                 TIMESTAMPTZ DEFAULT now(),
  updated_at                 TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS guarantors (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id      UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  full_name        TEXT NOT NULL,
  document_type    TEXT DEFAULT 'DNI',
  document_number  TEXT NOT NULL,
  income           NUMERIC,
  income_currency  TEXT DEFAULT 'ARS',
  property_address TEXT,
  property_value   NUMERIC,
  phone            TEXT,
  email            TEXT,
  relationship     TEXT,
  created_at       TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS adjustments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id      UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  previous_amount  NUMERIC NOT NULL,
  new_amount       NUMERIC NOT NULL,
  previous_index   NUMERIC,
  current_index    NUMERIC,
  variation        NUMERIC,
  index_type       TEXT,
  adjustment_date  DATE NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS alerts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id   UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  days_before   INTEGER NOT NULL DEFAULT 7,
  channel       TEXT DEFAULT 'email',
  enabled       BOOLEAN DEFAULT true,
  last_sent_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS index_snapshots (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type       TEXT NOT NULL,
  value      NUMERIC NOT NULL,
  date       DATE NOT NULL,
  source     TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  type         TEXT NOT NULL,
  title        TEXT NOT NULL,
  message      TEXT,
  link         TEXT,
  icon         TEXT DEFAULT 'bell',
  read         BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ml_tokens (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID UNIQUE NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  access_token  TEXT NOT NULL,
  refresh_token TEXT,
  user_id       TEXT,
  seller_id     TEXT,
  expires_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS scrape_schedules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  portal          TEXT NOT NULL CHECK (portal IN ('zonaprop', 'argenprop', 'mercadolibre')),
  active          BOOLEAN DEFAULT true,
  frequency_hours INTEGER NOT NULL DEFAULT 24,
  max_items       INTEGER DEFAULT 50,
  urls            TEXT[] DEFAULT '{}',
  last_run_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE (workspace_id, portal)
);

CREATE TABLE IF NOT EXISTS scrape_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  schedule_id     UUID REFERENCES scrape_schedules(id) ON DELETE SET NULL,
  portal          TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'running',
  items_scraped   INTEGER DEFAULT 0,
  items_imported  INTEGER DEFAULT 0,
  error           TEXT,
  started_at      TIMESTAMPTZ DEFAULT now(),
  completed_at    TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS publish_channels (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  type         TEXT NOT NULL,
  label        TEXT NOT NULL,
  config       JSONB DEFAULT '{}',
  active       BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE (workspace_id, type)
);

CREATE TABLE IF NOT EXISTS publish_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id   UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  property_id    UUID REFERENCES properties(id) ON DELETE SET NULL,
  channel_id     UUID REFERENCES publish_channels(id) ON DELETE SET NULL,
  channel_type   TEXT NOT NULL,
  property_title TEXT,
  status         TEXT NOT NULL,
  result         JSONB DEFAULT '{}',
  error          TEXT,
  external_id    TEXT,
  external_url   TEXT,
  created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS commissions (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id           UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  property_id            UUID REFERENCES properties(id) ON DELETE SET NULL,
  lead_id                UUID REFERENCES pipeline_leads(id) ON DELETE SET NULL,
  contract_id            UUID REFERENCES contracts(id) ON DELETE SET NULL,
  title                  TEXT NOT NULL,
  amount                 NUMERIC NOT NULL,
  currency               TEXT DEFAULT 'ARS',
  status                 TEXT DEFAULT 'pending',
  commission_percentage  NUMERIC,
  description            TEXT,
  due_date               DATE,
  paid_at                TIMESTAMPTZ,
  created_by             UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS role_permissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  role        TEXT NOT NULL,
  permission  TEXT NOT NULL,
  UNIQUE (workspace_id, role, permission)
);

CREATE TABLE IF NOT EXISTS whatsapp_templates (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  content      TEXT NOT NULL,
  variables    TEXT[] DEFAULT '{}',
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  lead_id      UUID REFERENCES pipeline_leads(id) ON DELETE SET NULL,
  property_id  UUID REFERENCES properties(id) ON DELETE SET NULL,
  direction    TEXT NOT NULL DEFAULT 'outbound',
  content      TEXT NOT NULL,
  status       TEXT DEFAULT 'sent',
  sent_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS signature_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id   UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  signer_name   TEXT NOT NULL,
  signer_email  TEXT NOT NULL,
  signer_type   TEXT DEFAULT 'lessee',
  token         UUID DEFAULT gen_random_uuid(),
  status        TEXT DEFAULT 'pending',
  signed_at     TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id     UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  contract_id      UUID REFERENCES contracts(id) ON DELETE SET NULL,
  property_id      UUID REFERENCES properties(id) ON DELETE SET NULL,
  amount           NUMERIC NOT NULL,
  currency         TEXT DEFAULT 'ARS',
  concept          TEXT NOT NULL,
  status           TEXT DEFAULT 'pending',
  due_date         DATE,
  period_from      DATE,
  period_to        DATE,
  notes            TEXT,
  paid_at          TIMESTAMPTZ,
  payment_method   TEXT,
  checkout_url     TEXT,
  stripe_session_id TEXT,
  created_at       TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tenant_access_tokens (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  contract_id     UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  token           UUID DEFAULT gen_random_uuid(),
  email           TEXT NOT NULL,
  last_access_at  TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS report_schedules (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  type         TEXT NOT NULL,
  email        TEXT NOT NULL,
  active       BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS report_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  type         TEXT NOT NULL,
  recipient    TEXT NOT NULL,
  summary      JSONB DEFAULT '{}',
  status       TEXT DEFAULT 'sent',
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS password_resets (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used       BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. INDEXES

CREATE INDEX IF NOT EXISTS idx_pipeline_stages_workspace ON pipeline_stages(workspace_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_leads_workspace ON pipeline_leads(workspace_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_leads_stage ON pipeline_leads(stage_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_leads_status ON pipeline_leads(status);
CREATE INDEX IF NOT EXISTS idx_pipeline_activities_lead ON pipeline_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_contracts_workspace ON contracts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_next_adjustment ON contracts(next_adjustment_date);
CREATE INDEX IF NOT EXISTS idx_guarantors_contract ON guarantors(contract_id);
CREATE INDEX IF NOT EXISTS idx_adjustments_contract ON adjustments(contract_id);
CREATE INDEX IF NOT EXISTS idx_alerts_contract ON alerts(contract_id);
CREATE INDEX IF NOT EXISTS idx_index_snapshots_type ON index_snapshots(type);
CREATE INDEX IF NOT EXISTS idx_notifications_workspace ON notifications(workspace_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(workspace_id, read);
CREATE INDEX IF NOT EXISTS idx_ml_tokens_workspace ON ml_tokens(workspace_id);
CREATE INDEX IF NOT EXISTS idx_scrape_schedules_workspace ON scrape_schedules(workspace_id);
CREATE INDEX IF NOT EXISTS idx_scrape_logs_workspace ON scrape_logs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_publish_channels_workspace ON publish_channels(workspace_id);
CREATE INDEX IF NOT EXISTS idx_publish_logs_workspace ON publish_logs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_commissions_workspace ON commissions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions(status);
CREATE INDEX IF NOT EXISTS idx_role_permissions_workspace ON role_permissions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_workspace ON whatsapp_templates(workspace_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_workspace ON whatsapp_messages(workspace_id);
CREATE INDEX IF NOT EXISTS idx_signature_requests_contract ON signature_requests(contract_id);
CREATE INDEX IF NOT EXISTS idx_signature_requests_workspace ON signature_requests(workspace_id);
CREATE INDEX IF NOT EXISTS idx_signature_requests_token ON signature_requests(token);
CREATE INDEX IF NOT EXISTS idx_payments_workspace ON payments(workspace_id);
CREATE INDEX IF NOT EXISTS idx_payments_contract ON payments(contract_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_tenant_access_tokens_token ON tenant_access_tokens(token);
CREATE INDEX IF NOT EXISTS idx_report_schedules_workspace ON report_schedules(workspace_id);
CREATE INDEX IF NOT EXISTS idx_report_logs_workspace ON report_logs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);
CREATE INDEX IF NOT EXISTS idx_property_owners_workspace ON property_owners(workspace_id);
CREATE INDEX IF NOT EXISTS idx_property_owners_email ON property_owners(email);

-- 4. AUTO-UPDATE updated_at FOR NEW TABLES

DROP TRIGGER IF EXISTS pipeline_leads_updated_at ON pipeline_leads;
CREATE TRIGGER pipeline_leads_updated_at
  BEFORE UPDATE ON pipeline_leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS contracts_updated_at ON contracts;
CREATE TRIGGER contracts_updated_at
  BEFORE UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS ml_tokens_updated_at ON ml_tokens;
CREATE TRIGGER ml_tokens_updated_at
  BEFORE UPDATE ON ml_tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS scrape_schedules_updated_at ON scrape_schedules;
CREATE TRIGGER scrape_schedules_updated_at
  BEFORE UPDATE ON scrape_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS publish_channels_updated_at ON publish_channels;
CREATE TRIGGER publish_channels_updated_at
  BEFORE UPDATE ON publish_channels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS commissions_updated_at ON commissions;
CREATE TRIGGER commissions_updated_at
  BEFORE UPDATE ON commissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS whatsapp_templates_updated_at ON whatsapp_templates;
CREATE TRIGGER whatsapp_templates_updated_at
  BEFORE UPDATE ON whatsapp_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS report_schedules_updated_at ON report_schedules;
CREATE TRIGGER report_schedules_updated_at
  BEFORE UPDATE ON report_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
