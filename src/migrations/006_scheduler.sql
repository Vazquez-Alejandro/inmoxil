CREATE TABLE IF NOT EXISTS scrape_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  portal VARCHAR(50) NOT NULL CHECK (portal IN ('zonaprop', 'argenprop', 'mercadolibre')),
  active BOOLEAN DEFAULT true,
  frequency_hours INTEGER NOT NULL DEFAULT 24,
  max_items INTEGER NOT NULL DEFAULT 50,
  urls TEXT[] NOT NULL DEFAULT '{}',
  last_run_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(workspace_id, portal)
);

CREATE TABLE IF NOT EXISTS scrape_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES scrape_schedules(id) ON DELETE SET NULL,
  portal VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'running',
  items_scraped INTEGER DEFAULT 0,
  items_imported INTEGER DEFAULT 0,
  error TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX IF NOT EXISTS idx_scrape_logs_workspace ON scrape_logs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_scrape_logs_started ON scrape_logs(started_at DESC);