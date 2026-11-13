import type { Invitation } from '../../../packages/editor-core/document';
import type { SharedDetails } from '../../../packages/database/schema';

export type AccountUser = { id: string; name: string; email: string; emailVerified: boolean; role: string; twoFactorEnabled: boolean };
export type AccountInfo = { user: AccountUser | null; capabilities: { emailPassword: boolean; google: boolean; emailRecovery: boolean; emailCapture: boolean; database: 'postgresql' | 'embedded-local' } };
export type EventProject = { id: string; title: string; occasion: string; sharedDetails: SharedDetails; revision: number; updatedAt: string; cardCount?: number; invitations?: Invitation[] };
export class ApiError extends Error { constructor(public status: number, public code: string, message: string) { super(message); } }
export async function api<T>(path: string, method = 'GET', input?: unknown): Promise<T> {
  const response = await fetch(path, { method, credentials: 'same-origin', cache: 'no-store',
    headers: input === undefined ? undefined : { 'Content-Type': 'application/json' }, body: input === undefined ? undefined : JSON.stringify(input) });
  if (response.status === 204) return undefined as T;
  const value = await response.json();
  if (!response.ok) throw new ApiError(response.status, value.error?.code || value.code || 'REQUEST_FAILED', value.error?.message || value.message || 'The request failed. Please try again.');
  return value as T;
}
export async function saveAccountInvitation(document: Invitation): Promise<Invitation> {
  const result = await api<{ invitation: Invitation }>(`/api/v1/invitations/${document.id}`, 'PUT', { document });
  return result.invitation;
}
