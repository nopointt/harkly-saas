CREATE TABLE IF NOT EXISTS share_links (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  artifact_id TEXT NOT NULL REFERENCES artifacts(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS share_links_token_idx ON share_links(token);
