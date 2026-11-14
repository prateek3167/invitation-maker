import { validateInvitation, type Invitation } from '../../../packages/editor-core/document';

const DB = 'invitation-maker-v1';
export class ConflictError extends Error { constructor() { super('This draft changed in another tab. Reopen it before saving again.'); } }
function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore('drafts', { keyPath: 'id' });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(new Error('Device storage is unavailable. You can still download your invitation.'));
    req.onblocked = () => reject(new Error('Close other Invitation Maker tabs to enable storage.'));
  });
}
export async function listDrafts(): Promise<Invitation[]> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('drafts', 'readonly');
    const request = tx.objectStore('drafts').getAll();
    tx.oncomplete = () => { db.close(); resolve((request.result as unknown[]).filter((d): d is Invitation => { try { validateInvitation(d); return true; } catch { return false; } }).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}
export async function loadDraft(id: string): Promise<Invitation | null> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('drafts', 'readonly');
    const request = tx.objectStore('drafts').get(id);
    tx.oncomplete = () => {
      db.close();
      const result = request.result as Invitation | undefined;
      if (result) {
        try {
          validateInvitation(result);
          resolve(result);
        } catch {
          resolve(null);
        }
      } else {
        resolve(null);
      }
    };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}
export async function saveDraft(doc: Invitation): Promise<Invitation> {
  validateInvitation(doc);
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('drafts', 'readwrite');
    const store = tx.objectStore('drafts');
    let conflict = false;
    const saved = { ...doc, revision: doc.revision + 1, updatedAt: new Date().toISOString() };
    const request = store.get(doc.id);
    request.onsuccess = () => {
      const existing = request.result as Invitation | undefined;
      if ((existing && existing.revision !== doc.revision) || (!existing && doc.revision !== 0)) { conflict = true; tx.abort(); return; }
      store.put(saved);
    };
    tx.oncomplete = () => { db.close(); resolve(saved); };
    tx.onabort = tx.onerror = () => { db.close(); reject(conflict ? new ConflictError() : new Error('Could not save. Device storage may be full; download a backup before leaving.')); };
  });
}
export async function deleteDraft(id: string): Promise<void> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('drafts', 'readwrite');
    tx.objectStore('drafts').delete(id);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(new Error('Could not delete this draft.')); };
  });
}
