ALTER TABLE users ADD COLUMN role text NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin'));
ALTER TABLE users ADD COLUMN two_factor_enabled boolean NOT NULL DEFAULT false;
CREATE TABLE two_factors (
  id text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  secret text NOT NULL, backup_codes text NOT NULL, verified boolean NOT NULL DEFAULT true,
  failed_verification_count integer NOT NULL DEFAULT 0, locked_until timestamptz
);
CREATE INDEX two_factors_user_idx ON two_factors(user_id);
CREATE INDEX two_factors_secret_idx ON two_factors(secret);
