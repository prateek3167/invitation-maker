ALTER TABLE invitations ADD COLUMN asset_id uuid REFERENCES private_assets(id) DEFERRABLE INITIALLY DEFERRED;
CREATE INDEX invitations_asset_idx ON invitations(asset_id) WHERE asset_id IS NOT NULL;
CREATE INDEX export_jobs_owner_expiry_idx ON export_jobs(owner_id,expires_at);
CREATE FUNCTION invitation_asset_reference() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF left(NEW.document->'photo'->>'data',6)='asset:' THEN
    NEW.asset_id := substring(NEW.document->'photo'->>'data' from 7)::uuid;
    IF NOT EXISTS (
      SELECT 1 FROM private_assets a JOIN event_projects p ON p.owner_id=a.owner_id
      WHERE a.id=NEW.asset_id AND p.id=NEW.project_id
    ) THEN RAISE EXCEPTION 'Private asset ownership mismatch'; END IF;
  ELSE NEW.asset_id := NULL;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER invitation_asset_reference_trigger BEFORE INSERT OR UPDATE OF document,project_id ON invitations FOR EACH ROW EXECUTE FUNCTION invitation_asset_reference();
UPDATE invitations SET document=document WHERE left(document->'photo'->>'data',6)='asset:';
