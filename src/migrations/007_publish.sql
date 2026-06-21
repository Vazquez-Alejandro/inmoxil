CREATE TABLE IF NOT EXISTS publish_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  label VARCHAR(200) NOT NULL,
  config JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(workspace_id, type)
);

CREATE TABLE IF NOT EXISTS publish_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES publish_channels(id) ON DELETE SET NULL,
  channel_type VARCHAR(50) NOT NULL,
  property_title VARCHAR(300),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  result JSONB DEFAULT '{}',
  error TEXT,
  external_id VARCHAR(200),
  external_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_publish_logs_workspace ON publish_logs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_publish_logs_property ON publish_logs(property_id);
CREATE INDEX IF NOT EXISTS idx_publish_logs_created ON publish_logs(created_at DESC);