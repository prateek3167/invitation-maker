CREATE TABLE private_assets (
  id uuid PRIMARY KEY,
  owner_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_hash text NOT NULL CHECK (length(source_hash)=64),
  content_hash text NOT NULL CHECK (length(content_hash)=64),
  byte_size integer NOT NULL CHECK (byte_size>0 AND byte_size<=6000000),
  width integer NOT NULL CHECK (width>0 AND width<=2000),
  height integer NOT NULL CHECK (height>0 AND height<=2000),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(owner_id, source_hash)
);
CREATE INDEX private_assets_owner_content_idx ON private_assets(owner_id,content_hash);
