-- =============================================================================
-- INMOXIL - Multi-tenant SaaS Schema (Initial Migration)
-- =============================================================================
-- This migration sets up the complete database schema for Inmoxil, including:
--   1. Tables: workspaces, users, properties, generated_ads, credit_transactions
--   2. Row Level Security (RLS) policies for tenant isolation
--   3. RPC functions: deduct_credit, add_credits
--   4. Indexes for performance
--   5. Trigger for auto-updating updated_at
--   6. Storage bucket note
-- =============================================================================

-- =============================================================================
-- 1. TABLES
-- =============================================================================

-- -------------------------------------------
-- WORKSPACES (tenants)
-- -------------------------------------------
-- Each workspace is an isolated tenant. Holds branding, plan info, and credit balance.
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

-- -------------------------------------------
-- USERS (linked to auth.users)
-- -------------------------------------------
-- Each user belongs to exactly one workspace. Role determines access level.
CREATE TABLE users (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT UNIQUE NOT NULL,
  full_name    TEXT,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  role         TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- -------------------------------------------
-- PROPERTIES (scraped real estate listings)
-- -------------------------------------------
-- Properties belong to a workspace and are sourced from external portals.
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

-- -------------------------------------------
-- GENERATED ADS
-- -------------------------------------------
-- Ads generated from properties. Each ad costs credits.
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

-- -------------------------------------------
-- CREDIT TRANSACTIONS (audit log)
-- -------------------------------------------
-- Immutable log of all credit movements (purchases, consumptions, refunds, bonuses).
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

-- =============================================================================
-- 2. INDEXES
-- =============================================================================

-- Users
CREATE INDEX idx_users_workspace ON users(workspace_id);
CREATE INDEX idx_users_email ON users(email);

-- Properties
CREATE INDEX idx_properties_workspace ON properties(workspace_id);
CREATE INDEX idx_properties_portal ON properties(portal);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_created_at ON properties(created_at);

-- Generated ads
CREATE INDEX idx_generated_ads_workspace ON generated_ads(workspace_id);
CREATE INDEX idx_generated_ads_property ON generated_ads(property_id);

-- Credit transactions
CREATE INDEX idx_credit_transactions_workspace ON credit_transactions(workspace_id);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at);

-- =============================================================================
-- 3. RPC FUNCTIONS
-- =============================================================================

-- -------------------------------------------
-- deduct_credit
-- -------------------------------------------
-- Deducts 1 credit from a workspace when an ad is generated.
-- Returns TRUE on success, FALSE if insufficient credits.
-- Uses FOR UPDATE to prevent race conditions.
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

-- -------------------------------------------
-- add_credits
-- -------------------------------------------
-- Adds credits to a workspace (e.g. on purchase or bonus).
-- Returns TRUE on success.
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

-- =============================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =============================================================================
-- All tables have RLS enabled. Policies enforce tenant isolation by checking
-- the current user's workspace_id from the users table.

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------
-- Workspaces: users can only read their own workspace
-- -------------------------------------------
CREATE POLICY "Users see own workspace"
  ON workspaces FOR SELECT
  USING (
    id IN (SELECT workspace_id FROM users WHERE id = auth.uid())
  );

-- -------------------------------------------
-- Users: members can only see users in their workspace
-- -------------------------------------------
CREATE POLICY "Users see workspace members"
  ON users FOR SELECT
  USING (
    workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid())
  );

-- -------------------------------------------
-- Properties: full access within own workspace
-- -------------------------------------------
CREATE POLICY "Properties scoped to workspace"
  ON properties FOR ALL
  USING (
    workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid())
  );

-- -------------------------------------------
-- Generated Ads: full access within own workspace
-- -------------------------------------------
CREATE POLICY "Ads scoped to workspace"
  ON generated_ads FOR ALL
  USING (
    workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid())
  );

-- -------------------------------------------
-- Credit Transactions: read-only within own workspace
-- -------------------------------------------
CREATE POLICY "Credits scoped to workspace"
  ON credit_transactions FOR SELECT
  USING (
    workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid())
  );

-- =============================================================================
-- 5. TRIGGER: auto-update updated_at on workspaces
-- =============================================================================

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

-- =============================================================================
-- 6. STORAGE
-- =============================================================================
-- After running this migration, create a 'brand-logos' bucket in Supabase Storage:
--   1. Go to Storage in the Supabase dashboard
--   2. Create a new bucket named 'brand-logos'
--   3. Set it to private (uncheck public)
--   4. Add a storage policy allowing authenticated users to upload/read
--      only within their workspace folder (e.g. path: {workspace_id}/*)
