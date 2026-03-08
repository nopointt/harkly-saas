-- E4 Insight Canvas: Artifact schema migration
-- Run this in Supabase Dashboard SQL editor

-- Update artifacts table: add status, current_version, make content nullable, add unique constraint
-- If the table exists from a previous migration, alter it; otherwise create fresh.

-- Drop existing table if schema mismatch (only in dev). In prod, use ALTER TABLE statements below.

-- Option A: ALTER existing table (safe for production)
-- ALTER TABLE artifacts ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'NOT_GENERATED';
-- ALTER TABLE artifacts ADD COLUMN IF NOT EXISTS current_version INTEGER NOT NULL DEFAULT 0;
-- ALTER TABLE artifacts ALTER COLUMN content DROP NOT NULL;
-- DROP COLUMN IF EXISTS version; -- old single-version column
-- CREATE UNIQUE INDEX IF NOT EXISTS artifacts_project_id_artifact_type_key ON artifacts(project_id, artifact_type);

-- Option B: Create tables fresh (use IF NOT EXISTS)

CREATE TABLE IF NOT EXISTS artifacts (
  id              TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  project_id      TEXT        NOT NULL,
  artifact_type   TEXT        NOT NULL,
  status          TEXT        NOT NULL DEFAULT 'NOT_GENERATED',
  current_version INTEGER     NOT NULL DEFAULT 0,
  content         JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT artifacts_pkey PRIMARY KEY (id),
  CONSTRAINT artifacts_project_id_artifact_type_key UNIQUE (project_id, artifact_type),
  CONSTRAINT artifacts_project_id_fkey FOREIGN KEY (project_id)
    REFERENCES research_projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS artifact_versions (
  id          TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  artifact_id TEXT        NOT NULL,
  version     INTEGER     NOT NULL,
  content     JSONB       NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT artifact_versions_pkey PRIMARY KEY (id),
  CONSTRAINT artifact_versions_artifact_id_version_key UNIQUE (artifact_id, version),
  CONSTRAINT artifact_versions_artifact_id_fkey FOREIGN KEY (artifact_id)
    REFERENCES artifacts(id) ON DELETE CASCADE
);

-- Share links table (if not already exists from init migration)
CREATE TABLE IF NOT EXISTS share_links (
  id          TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  artifact_id TEXT        NOT NULL,
  token       TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT share_links_pkey PRIMARY KEY (id),
  CONSTRAINT share_links_token_key UNIQUE (token),
  CONSTRAINT share_links_artifact_id_fkey FOREIGN KEY (artifact_id)
    REFERENCES artifacts(id) ON DELETE CASCADE
);

-- Trigger to auto-update updated_at on artifacts
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS artifacts_updated_at ON artifacts;
CREATE TRIGGER artifacts_updated_at
  BEFORE UPDATE ON artifacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
