CREATE TABLE export_jobs (
  id uuid PRIMARY KEY,
  owner_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invitation_id uuid NOT NULL,
  revision integer NOT NULL CHECK(revision>0),
  idempotency_key uuid NOT NULL,
  format text NOT NULL CHECK(format IN ('png','jpg','pdf')),
  title text NOT NULL,
  width integer NOT NULL,
  height integer NOT NULL,
  snapshot_svg text NOT NULL,
  snapshot_hash text NOT NULL,
  renderer_version text NOT NULL,
  template_hash text NOT NULL,
  status text NOT NULL DEFAULT 'queued' CHECK(status IN ('queued','processing','completed','failed')),
  attempts integer NOT NULL DEFAULT 0 CHECK(attempts BETWEEN 0 AND 3),
  lease_token uuid,
  lease_until timestamptz,
  available_at timestamptz NOT NULL DEFAULT now(),
  error_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT now()+interval '7 days',
  UNIQUE(owner_id,idempotency_key)
);
CREATE INDEX export_jobs_owner_created_idx ON export_jobs(owner_id,created_at);
CREATE INDEX export_jobs_queue_idx ON export_jobs(status,available_at,lease_until);
