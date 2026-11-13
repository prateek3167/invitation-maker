import { royalArtworks, documentTemplate, type Invitation } from '../../../packages/editor-core/document';
const cache = new Map<string, Promise<string>>();
function cachedImage(path: string): Promise<string> {
  if(!cache.has(path)) {
    const work=fetch(path).then(async response=>{if(!response.ok)throw new Error('Artwork could not load. Please retry.');const blob=await response.blob();return new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(new Error('Artwork could not be opened.'));reader.readAsDataURL(blob);});});
    cache.set(path,work);void work.catch(()=>cache.delete(path));
  }
  return cache.get(path)!;
}
export async function samplePortraits(document: Invitation): Promise<Invitation> {
  if(!documentTemplate(document).royal)return document;
  const [bride,groom]=await Promise.all([cachedImage('/royal/demo-bride.webp'),cachedImage('/royal/demo-groom.webp')]);
  return {...document,portraits:{bride:document.portraits?.bride || {data:bride,x:50,y:50,zoom:1},groom:document.portraits?.groom || {data:groom,x:50,y:50,zoom:1}}};
}
export async function browserArtwork(document: Invitation, thumbnail = false): Promise<string | undefined> {
  const key = documentTemplate(document).royal?.artwork;
  if (!key) return undefined;
  if (!royalArtworks.has(key)) throw new Error('This royal artwork is unavailable.');
  const path = `/royal/${key}${thumbnail ? '-thumb' : ''}.webp`;
  return cachedImage(path);
}
