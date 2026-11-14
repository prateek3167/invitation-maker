-- Protect private media referenced by canvas elements and multi-card suites.
CREATE TABLE invitation_canvas_assets (
  invitation_id uuid NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES private_assets(id) DEFERRABLE INITIALLY DEFERRED,
  PRIMARY KEY(invitation_id,asset_id)
);
CREATE INDEX invitation_canvas_assets_asset_idx ON invitation_canvas_assets(asset_id);
CREATE FUNCTION invitation_canvas_references() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE reference text; photo_id uuid;
BEGIN
  DELETE FROM invitation_canvas_assets WHERE invitation_id=NEW.id;
  FOR reference IN
    SELECT DISTINCT value #>> '{}' FROM (
      SELECT value FROM jsonb_path_query(NEW.document,'$.**.data') AS v(value)
      UNION ALL SELECT value FROM jsonb_path_query(NEW.document,'$.**.src') AS v(value)
    ) refs WHERE jsonb_typeof(value)='string' AND left(value #>> '{}',6)='asset:'
  LOOP
    photo_id := substring(reference from 7)::uuid;
    IF NOT EXISTS (SELECT 1 FROM private_assets a JOIN event_projects p ON p.owner_id=a.owner_id WHERE a.id=photo_id AND p.id=NEW.project_id) THEN
      RAISE EXCEPTION 'Private canvas photo ownership mismatch';
    END IF;
    INSERT INTO invitation_canvas_assets(invitation_id,asset_id) VALUES(NEW.id,photo_id);
  END LOOP;
  RETURN NEW;
END $$;
CREATE TRIGGER invitation_canvas_references_trigger AFTER INSERT OR UPDATE OF document,project_id ON invitations FOR EACH ROW EXECUTE FUNCTION invitation_canvas_references();
UPDATE invitations SET document=document;
