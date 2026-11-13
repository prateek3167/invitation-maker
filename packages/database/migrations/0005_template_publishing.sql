CREATE TABLE template_versions (
  id uuid PRIMARY KEY,
  family_id uuid NOT NULL,
  version integer NOT NULL CHECK(version>0),
  definition jsonb NOT NULL,
  content_hash text NOT NULL,
  license_note text NOT NULL,
  created_by text REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(family_id,version)
);
CREATE TABLE template_publications (
  family_id uuid PRIMARY KEY,
  version_id uuid NOT NULL REFERENCES template_versions(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX template_versions_family_idx ON template_versions(family_id,version DESC);
