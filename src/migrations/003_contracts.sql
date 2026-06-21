-- Contracts system tables
-- Run this in Neon SQL editor

CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL DEFAULT 'alquiler',
  status VARCHAR(20) NOT NULL DEFAULT 'borrador',
  number VARCHAR(50) NOT NULL,
  title VARCHAR(500) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  duration_months INTEGER NOT NULL,
  lessor_name VARCHAR(300) NOT NULL,
  lessor_document_type VARCHAR(10) NOT NULL DEFAULT 'DNI',
  lessor_document_number VARCHAR(50) NOT NULL,
  lessor_address VARCHAR(500),
  lessor_phone VARCHAR(50),
  lessor_email VARCHAR(200),
  lessee_name VARCHAR(300) NOT NULL,
  lessee_document_type VARCHAR(10) NOT NULL DEFAULT 'DNI',
  lessee_document_number VARCHAR(50) NOT NULL,
  lessee_address VARCHAR(500),
  lessee_phone VARCHAR(50),
  lessee_email VARCHAR(200),
  property_address VARCHAR(500) NOT NULL,
  property_city VARCHAR(200) NOT NULL,
  property_province VARCHAR(200) NOT NULL,
  property_description TEXT,
  property_cpa VARCHAR(20),
  property_registration VARCHAR(200),
  amount NUMERIC(12,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'ARS',
  adjustment_index VARCHAR(10) NOT NULL DEFAULT 'ICL',
  adjustment_frequency_months INTEGER NOT NULL DEFAULT 6,
  deposit_amount NUMERIC(12,2),
  commission_percentage NUMERIC(5,2),
  commission_amount NUMERIC(12,2),
  expenses_included BOOLEAN DEFAULT false,
  expenses_amount NUMERIC(12,2),
  clauses JSONB DEFAULT '[]',
  notes TEXT,
  last_adjustment_date DATE,
  last_adjustment_value NUMERIC(12,4),
  next_adjustment_date DATE,
  signed_by_lessor BOOLEAN DEFAULT false,
  signed_by_lessee BOOLEAN DEFAULT false,
  signed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contracts_workspace ON contracts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_type ON contracts(type);
CREATE INDEX IF NOT EXISTS idx_contracts_next_adjustment ON contracts(next_adjustment_date);
CREATE INDEX IF NOT EXISTS idx_contracts_number ON contracts(number);

CREATE TABLE IF NOT EXISTS guarantors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  full_name VARCHAR(300) NOT NULL,
  document_type VARCHAR(10) NOT NULL DEFAULT 'DNI',
  document_number VARCHAR(50) NOT NULL,
  income NUMERIC(12,2) NOT NULL DEFAULT 0,
  income_currency VARCHAR(3) NOT NULL DEFAULT 'ARS',
  property_address VARCHAR(500),
  property_value NUMERIC(12,2),
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(200),
  relationship VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guarantors_contract ON guarantors(contract_id);

CREATE TABLE IF NOT EXISTS adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  previous_amount NUMERIC(12,2) NOT NULL,
  new_amount NUMERIC(12,2) NOT NULL,
  previous_index NUMERIC(12,4) NOT NULL,
  current_index NUMERIC(12,4) NOT NULL,
  variation NUMERIC(8,2) NOT NULL,
  index_type VARCHAR(10) NOT NULL,
  adjustment_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_adjustments_contract ON adjustments(contract_id);

CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  days_before INTEGER NOT NULL,
  channel VARCHAR(20) NOT NULL DEFAULT 'email',
  enabled BOOLEAN DEFAULT true,
  last_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_contract ON alerts(contract_id);

CREATE TABLE IF NOT EXISTS index_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(10) NOT NULL,
  value NUMERIC(12,4) NOT NULL,
  date DATE NOT NULL,
  source VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(type, date)
);

CREATE INDEX IF NOT EXISTS idx_index_snapshots_type_date ON index_snapshots(type, date);

ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE guarantors ENABLE ROW LEVEL SECURITY;
ALTER TABLE adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;