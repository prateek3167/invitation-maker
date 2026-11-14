import { expect, it } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { readFile, readdir } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import { createInvitation, templates } from '../../packages/editor-core/document';
import { migrateEmbedded } from '../../packages/database/client';

it('upgrades a populated v7 database, backfills canvas/suite references and preserves documents', async () => {
  const client = new PGlite();
  try {
    await client.exec('CREATE TABLE schema_migrations(name text PRIMARY KEY,checksum text NOT NULL,applied_at timestamptz NOT NULL DEFAULT now())');
    for (const name of (await readdir('packages/database/migrations')).filter(name => /^000[1-7]_.*\.sql$/.test(name)).sort()) {
      const sql = await readFile('packages/database/migrations/' + name, 'utf8');
      await client.exec(sql);
      await client.query('INSERT INTO schema_migrations(name,checksum) VALUES($1,$2)', [name,createHash('sha256').update(sql).digest('hex')]);
    }
    await client.query("INSERT INTO users(id,name,email) VALUES('upgrade-owner','Upgrade','upgrade@example.test')");
    const {rows} = await client.query<{id:string}>("INSERT INTO event_projects(owner_id,title,occasion) VALUES('upgrade-owner','Existing suite','Wedding') RETURNING id");
    const asset = randomUUID();
    await client.query("INSERT INTO private_assets(id,owner_id,source_hash,content_hash,byte_size,width,height) VALUES($1,'upgrade-owner',$2,$2,12,1,1)", [asset,'a'.repeat(64)]);
    const document = createInvitation(templates.find(template => !template.photo)!);
    document.revision = 1;
    document.canvasElements = [{id:'custom-photo',type:'image',name:'Photo',x:0,y:0,width:100,height:100,zIndex:1,src:'asset:'+asset}];
    document.suiteCards = [{...structuredClone(document),id:randomUUID()}];
    await client.query('INSERT INTO invitations(id,project_id,document,revision) VALUES($1,$2,$3,1)', [document.id,rows[0].id,JSON.stringify(document)]);
    await migrateEmbedded(client);
    const references = await client.query<{asset_id:string}>('SELECT asset_id FROM invitation_canvas_assets WHERE invitation_id=$1',[document.id]);
    expect(references.rows).toEqual([{asset_id:asset}]);
    expect((await client.query<{document:unknown}>('SELECT document FROM invitations WHERE id=$1',[document.id])).rows[0].document).toEqual(document);
    await expect(client.query('DELETE FROM private_assets WHERE id=$1',[asset])).rejects.toThrow();
    await migrateEmbedded(client); // Checksum-safe repeat application.
    expect((await client.query('SELECT * FROM schema_migrations')).rows).toHaveLength(8);
  } finally { await client.close(); }
});
