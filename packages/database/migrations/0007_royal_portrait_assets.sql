CREATE TABLE invitation_portrait_assets (
  invitation_id uuid NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  slot text NOT NULL CHECK(slot IN ('bride','groom')),
  asset_id uuid NOT NULL REFERENCES private_assets(id) DEFERRABLE INITIALLY DEFERRED,
  PRIMARY KEY(invitation_id,slot)
);
CREATE INDEX invitation_portrait_assets_asset_idx ON invitation_portrait_assets(asset_id);
CREATE FUNCTION invitation_portrait_references() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE portrait_slot text; portrait jsonb; photo_id uuid;
BEGIN
  DELETE FROM invitation_portrait_assets WHERE invitation_id=NEW.id;
  IF jsonb_typeof(NEW.document->'portraits')='object' THEN
    FOR portrait_slot,portrait IN SELECT key,value FROM jsonb_each(NEW.document->'portraits') LOOP
      IF left(portrait->>'data',6)='asset:' THEN
        photo_id := substring(portrait->>'data' from 7)::uuid;
        IF NOT EXISTS (SELECT 1 FROM private_assets a JOIN event_projects p ON p.owner_id=a.owner_id WHERE a.id=photo_id AND p.id=NEW.project_id) THEN RAISE EXCEPTION 'Private portrait ownership mismatch'; END IF;
        INSERT INTO invitation_portrait_assets(invitation_id,slot,asset_id) VALUES(NEW.id,portrait_slot,photo_id);
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER invitation_portrait_references_trigger AFTER INSERT OR UPDATE OF document,project_id ON invitations FOR EACH ROW EXECUTE FUNCTION invitation_portrait_references();
