import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { workspaceRoot } from '../database/client';
import { documentTemplate, royalArtworks, type Invitation } from '../editor-core/document';
export async function serverArtwork(document: Invitation) {
  const id = documentTemplate(document).royal?.artwork; if (!id) return undefined;
  if (!royalArtworks.has(id)) throw new Error('Unsupported royal artwork');
  const bytes = await readFile(path.join(workspaceRoot(),'apps/web/public/royal',`${id}.webp`));
  return `data:image/webp;base64,${bytes.toString('base64')}`;
}
