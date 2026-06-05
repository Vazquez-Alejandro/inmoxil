-- =============================================================================
-- INMOXIL - Multi-tenant SaaS Schema (Neon PostgreSQL)
-- =============================================================================

-- 1. TABLES

CREATE TABLE workspaces (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  slug              TEXT UNIQUE NOT NULL,
  logo_url          TEXT,
  primary_color     TEXT DEFAULT '#0F2B46',
  secondary_color   TEXT DEFAULT '#D4A843',
  accent_color      TEXT DEFAULT '#E85D3A',
  plan              TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'pro', 'enterprise')),
  credits_remaining INTEGER DEFAULT 50,
  credits_used      INTEGER DEFAULT 0,
  stripe_customer_id      TEXT,
  stripe_subscription_id  TEXT,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE users (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email        TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  full_name    TEXT,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  role         TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE properties (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id      UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  portal            TEXT NOT NULL,
  title             TEXT NOT NULL,
  price             NUMERIC,
  currency          TEXT DEFAULT 'USD',
  price_usd         NUMERIC,
  monthly_expenses  NUMERIC,
  address           TEXT,
  street            TEXT,
  neighborhood      TEXT,
  city              TEXT,
  state             TEXT,
  country           TEXT,
  zip_code          TEXT,
  lat               NUMERIC,
  lng               NUMERIC,
  beds              INTEGER,
  baths             INTEGER,
  sqm               NUMERIC,
  lot_sqm           NUMERIC,
  property_type     TEXT DEFAULT 'apartment',
  status            TEXT DEFAULT 'active',
  url               TEXT,
  photos            TEXT[] DEFAULT '{}',
  description       TEXT,
  features          TEXT[] DEFAULT '{}',
  year_built        INTEGER,
  garage            INTEGER,
  publisher         TEXT,
  publisher_phone   TEXT,
  source_url        TEXT NOT NULL,
  scraped_at        TIMESTAMPTZ DEFAULT now(),
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE generated_ads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  property_id     UUID REFERENCES properties(id) ON DELETE SET NULL,
  type            TEXT NOT NULL CHECK (type IN ('feed', 'story', 'reel', 'meta_ad')),
  image_url       TEXT NOT NULL,
  template_id     TEXT NOT NULL,
  customizations  JSONB DEFAULT '{}',
  credits_used    INTEGER DEFAULT 1,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE credit_transactions (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id       UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  amount             INTEGER NOT NULL,
  type               TEXT NOT NULL CHECK (type IN ('purchase', 'consumption', 'refund', 'bonus')),
  description        TEXT NOT NULL,
  ad_id              UUID REFERENCES generated_ads(id) ON DELETE SET NULL,
  stripe_payment_id  TEXT,
  created_at         TIMESTAMPTZ DEFAULT now()
);

-- 2. INDEXES

CREATE INDEX idx_users_workspace ON users(workspace_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_properties_workspace ON properties(workspace_id);
CREATE INDEX idx_properties_portal ON properties(portal);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_created_at ON properties(created_at);
CREATE INDEX idx_generated_ads_workspace ON generated_ads(workspace_id);
CREATE INDEX idx_generated_ads_property ON generated_ads(property_id);
CREATE INDEX idx_credit_transactions_workspace ON credit_transactions(workspace_id);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at);

-- 3. RPC FUNCTIONS

CREATE OR REPLACE FUNCTION deduct_credit(p_workspace_id UUID, p_ad_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_credits INTEGER;
BEGIN
  SELECT credits_remaining INTO v_credits
  FROM workspaces WHERE id = p_workspace_id FOR UPDATE;

  IF v_credits <= 0 THEN
    RETURN FALSE;
  END IF;

  UPDATE workspaces
  SET credits_remaining = credits_remaining - 1,
      credits_used = credits_used + 1,
      updated_at = now()
  WHERE id = p_workspace_id;

  INSERT INTO credit_transactions (workspace_id, amount, type, description, ad_id)
  VALUES (p_workspace_id, -1, 'consumption', 'Anuncio generado', p_ad_id);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION add_credits(p_workspace_id UUID, p_amount INTEGER, p_description TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE workspaces
  SET credits_remaining = credits_remaining + p_amount,
      updated_at = now()
  WHERE id = p_workspace_id;

  INSERT INTO credit_transactions (workspace_id, amount, type, description)
  VALUES (p_workspace_id, p_amount, 'purchase', p_description);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 4. TRIGGER: auto-update updated_at

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workspaces_updated_at
  BEFORE UPDATE ON workspaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
