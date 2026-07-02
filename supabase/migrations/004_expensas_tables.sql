-- Migración: Tablas de Expensas para Inmoxil
-- Ejecutar en Neon SQL Editor

-- Tabla de plantillas de expensas
CREATE TABLE IF NOT EXISTS expensa_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  maintenance_fee DECIMAL(12,2) DEFAULT 0,
  water_fee DECIMAL(12,2) DEFAULT 0,
  gas_fee DECIMAL(12,2) DEFAULT 0,
  electricity_fee DECIMAL(12,2) DEFAULT 0,
  insurance_fee DECIMAL(12,2) DEFAULT 0,
  admin_fee DECIMAL(12,2) DEFAULT 0,
  other_fees DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de expensas
CREATE TABLE IF NOT EXISTS expensas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  property_name VARCHAR(255) NOT NULL,
  period VARCHAR(7) NOT NULL, -- Formato: YYYY-MM
  maintenance_fee DECIMAL(12,2) DEFAULT 0,
  water_fee DECIMAL(12,2) DEFAULT 0,
  gas_fee DECIMAL(12,2) DEFAULT 0,
  electricity_fee DECIMAL(12,2) DEFAULT 0,
  insurance_fee DECIMAL(12,2) DEFAULT 0,
  admin_fee DECIMAL(12,2) DEFAULT 0,
  other_fees DECIMAL(12,2) DEFAULT 0,
  total_expensa DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'ARS',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  due_date TIMESTAMP,
  paid_date TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_expensas_workspace ON expensas(workspace_id);
CREATE INDEX IF NOT EXISTS idx_expensas_period ON expensas(period);
CREATE INDEX IF NOT EXISTS idx_expensas_status ON expensas(status);
CREATE INDEX IF NOT EXISTS idx_expensas_property ON expensas(property_id);
CREATE INDEX IF NOT EXISTS idx_expensa_templates_workspace ON expensa_templates(workspace_id);

-- RLS (Row Level Security)
ALTER TABLE expensas ENABLE ROW LEVEL SECURITY;
ALTER TABLE expensa_templates ENABLE ROW LEVEL SECURITY;

-- Policies para expensas
CREATE POLICY "Users can view own expensas" ON expensas
  FOR SELECT USING (workspace_id = current_setting('app.current_workspace')::uuid);

CREATE POLICY "Users can insert own expensas" ON expensas
  FOR INSERT WITH CHECK (workspace_id = current_setting('app.current_workspace')::uuid);

CREATE POLICY "Users can update own expensas" ON expensas
  FOR UPDATE USING (workspace_id = current_setting('app.current_workspace')::uuid);

CREATE POLICY "Users can delete own expensas" ON expensas
  FOR DELETE USING (workspace_id = current_setting('app.current_workspace')::uuid);

-- Policies para plantillas
CREATE POLICY "Users can view own templates" ON expensa_templates
  FOR SELECT USING (workspace_id = current_setting('app.current_workspace')::uuid);

CREATE POLICY "Users can insert own templates" ON expensa_templates
  FOR INSERT WITH CHECK (workspace_id = current_setting('app.current_workspace')::uuid);

CREATE POLICY "Users can update own templates" ON expensa_templates
  FOR UPDATE USING (workspace_id = current_setting('app.current_workspace')::uuid);

CREATE POLICY "Users can delete own templates" ON expensa_templates
  FOR DELETE USING (workspace_id = current_setting('app.current_workspace')::uuid);
