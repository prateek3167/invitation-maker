CREATE TABLE users (
  id text PRIMARY KEY, name text NOT NULL, email text NOT NULL UNIQUE,
  email_verified boolean NOT NULL DEFAULT false, image text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT users_email_normalized CHECK (email = lower(email))
);
CREATE TABLE sessions (
  id text PRIMARY KEY, token text NOT NULL UNIQUE, user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL, ip_address text, user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX sessions_user_idx ON sessions(user_id);
CREATE INDEX sessions_expiry_idx ON sessions(expires_at);
CREATE TABLE auth_accounts (
  id text PRIMARY KEY, account_id text NOT NULL, provider_id text NOT NULL,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  access_token text, refresh_token text, id_token text, scope text, password text,
  access_token_expires_at timestamptz, refresh_token_expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(provider_id, account_id)
);
CREATE INDEX auth_accounts_user_idx ON auth_accounts(user_id);
CREATE TABLE auth_verifications (
  id text PRIMARY KEY, identifier text NOT NULL, value text NOT NULL, expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX auth_verifications_identifier_idx ON auth_verifications(identifier);
CREATE TABLE auth_rate_limits (id text PRIMARY KEY, key text NOT NULL UNIQUE, count integer NOT NULL, last_request bigint NOT NULL);
CREATE TABLE event_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (length(title) BETWEEN 1 AND 120), occasion text NOT NULL,
  shared_details jsonb NOT NULL DEFAULT '{}'::jsonb,
  revision integer NOT NULL DEFAULT 0 CHECK (revision >= 0),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (jsonb_typeof(shared_details) = 'object')
);
CREATE INDEX event_projects_owner_updated_idx ON event_projects(owner_id, updated_at DESC);
CREATE TABLE invitations (
  id uuid PRIMARY KEY, project_id uuid NOT NULL REFERENCES event_projects(id) ON DELETE CASCADE,
  document jsonb NOT NULL, revision integer NOT NULL CHECK (revision > 0),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (jsonb_typeof(document) = 'object'),
  CHECK (document->>'id' = id::text),
  CHECK ((document->>'revision')::integer = revision)
);
CREATE INDEX invitations_project_idx ON invitations(project_id);
CREATE TABLE audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), actor_id text REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL, resource_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_actor_created_idx ON audit_events(actor_id, created_at DESC);
