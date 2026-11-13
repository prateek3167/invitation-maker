import sharp from 'sharp';
import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { and, eq, or, sql, notExists } from 'drizzle-orm';
import { workspaceRoot, type Database } from './client';
import { assets, invitations, portraitAssets, user } from './schema';
import { DomainError } from './errors';
import type { Invitation } from '../editor-core/document';

export function mediaDirectory() {
  if (process.env.PUBLIC_DEPLOYMENT === 'true' && !process.env.PRIVATE_MEDIA_DIRECTORY) throw new Error('Configure a durable private media mount before public deployment.');
  return path.resolve(workspaceRoot(), process.env.PRIVATE_MEDIA_DIRECTORY || '.data/media');
}
const hash = (value: Buffer) => createHash('sha256').update(value).digest('hex');
let activeDecoders = 0;
function file(id: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) throw new DomainError(400, 'INVALID_ASSET', 'Invalid private photo.');
  return path.join(mediaDirectory(), `${id}.jpg`);
}
export async function readAsset(db: Database, owner: string, id: string) {
  file(id);
  const [record] = await db.select().from(assets).where(and(eq(assets.id, id), eq(assets.ownerId, owner)));
  if (!record) throw new DomainError(404, 'ASSET_NOT_FOUND', 'This private photo is not available.');
  const bytes = await readFile(file(id));
  if (hash(bytes) !== record.contentHash || bytes.length !== record.byteSize) throw new Error('Private media integrity check failed.');
  return { record, bytes };
}
export async function normalizePhoto(bytes: Buffer) {
  if (bytes.length < 12 || bytes.length > 6_000_000) throw new DomainError(413, 'INVALID_IMAGE_SIZE', 'Choose a photo smaller than 6 MB.');
  const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const png = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const webp = bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
  if (!jpeg && !png && !webp) throw new DomainError(400, 'INVALID_IMAGE', 'Choose a genuine JPG, PNG or WebP image.');
  if (activeDecoders >= 2) throw new DomainError(429, 'IMAGE_BUSY', 'Photo processing is busy. Please retry shortly.');
  activeDecoders++;
  try {
    const image = sharp(bytes, { limitInputPixels: 40_000_000, failOn: 'warning' });
    const metadata = await image.metadata();
    if ((metadata.pages || 1) !== 1 || !['jpeg', 'png', 'webp'].includes(metadata.format || '')) throw new Error('Unsupported image');
    // Metadata is stripped by default. EXIF orientation is applied before resizing.
    const result = await image.rotate().resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true }).flatten({ background: '#ffffff' }).jpeg({ quality: 90 }).timeout({ seconds: 10 }).toBuffer({ resolveWithObject: true });
    return { bytes: result.data, width: result.info.width, height: result.info.height };
  } catch { throw new DomainError(400, 'INVALID_IMAGE', 'This image is damaged, animated, too slow to decode, or exceeds the 40 megapixel limit.'); }
  finally { activeDecoders--; }
}
export async function storePhoto(db: Database, owner: string, photo: NonNullable<Invitation['photo']>) {
  if (photo.data.startsWith('asset:')) { await readAsset(db, owner, photo.data.slice(6)); return photo; }
  const match = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$/.exec(photo.data);
  if (!match || match[2].length > 8_000_000) throw new DomainError(400, 'INVALID_IMAGE', 'Use a supported photo.');
  const bytes = Buffer.from(match[2], 'base64'), sourceHash = hash(bytes);
  const [existing] = await db.select({ id: assets.id }).from(assets).where(and(eq(assets.ownerId, owner), or(eq(assets.sourceHash, sourceHash), eq(assets.contentHash, sourceHash))));
  if (existing) { await readAsset(db, owner, existing.id); return { ...photo, data: `asset:${existing.id}` }; }
  const processed = await normalizePhoto(bytes), id = randomUUID();
  await mkdir(mediaDirectory(), { recursive: true, mode: 0o700 });
  await writeFile(file(id), processed.bytes, { flag: 'wx', mode: 0o600 });
  let saved: string;
  try { saved = await db.transaction(async tx => {
    await tx.select({ id: user.id }).from(user).where(eq(user.id, owner)).for('update');
    const [duplicate] = await tx.select({ id: assets.id }).from(assets).where(and(eq(assets.ownerId, owner), eq(assets.sourceHash, sourceHash)));
    if (duplicate) return duplicate.id;
    const [usage] = await tx.select({ bytes: sql<number>`coalesce(sum(${assets.byteSize}),0)::integer`, count: sql<number>`count(*)::integer` }).from(assets).where(eq(assets.ownerId, owner));
    if (usage.bytes + processed.bytes.length > 100_000_000 || usage.count >= 200) throw new DomainError(422, 'MEDIA_QUOTA', 'Your account photo allowance is full.');
    await tx.insert(assets).values({ id, ownerId: owner, sourceHash, contentHash: hash(processed.bytes), byteSize: processed.bytes.length, width: processed.width, height: processed.height });
    return id;
  }); } catch (error) { await unlink(file(id)).catch(() => {}); throw error; }
  if (saved !== id) await unlink(file(id));
  return { ...photo, data: `asset:${saved}` };
}
export async function removeAssetFiles(ids: string[]) {
  for (const id of ids) await unlink(file(id)).catch(error => { if (error.code !== 'ENOENT') throw error; });
}
export async function deleteUnusedPhotos(db: Database, owner: string) {
  const rows = await db.transaction(async tx => {
    await tx.select({ id: user.id }).from(user).where(eq(user.id, owner)).for('update');
    return tx.delete(assets).where(and(eq(assets.ownerId, owner), notExists(tx.select({ id: invitations.id }).from(invitations).where(eq(invitations.assetId, assets.id))), notExists(tx.select({ id: portraitAssets.assetId }).from(portraitAssets).where(eq(portraitAssets.assetId, assets.id))))).returning();
  });
  await removeAssetFiles(rows.map(row => row.id));
  return rows.length;
}
export async function hydratePhoto(db: Database, owner: string, document: Invitation): Promise<Invitation> {
  const result = structuredClone(document);
  const hydrate = async (photo: NonNullable<Invitation['photo']>) => {
    if (!photo.data.startsWith('asset:')) return photo;
    const {bytes}=await readAsset(db,owner,photo.data.slice(6)); return {...photo,data:`data:image/jpeg;base64,${bytes.toString('base64')}`};
  };
  if (result.photo) result.photo=await hydrate(result.photo);
  if (result.portraits) for (const slot of ['bride','groom'] as const) if (result.portraits[slot]) result.portraits[slot]=await hydrate(result.portraits[slot]!);
  return result;
}
export async function storeDocumentPhotos(db: Database, owner: string, document: Invitation) {
  if (document.photo) document.photo=await storePhoto(db,owner,document.photo);
  if (document.portraits) for (const slot of ['bride','groom'] as const) if(document.portraits[slot]) document.portraits[slot]=await storePhoto(db,owner,document.portraits[slot]!);
}
