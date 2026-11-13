import { randomUUID } from 'node:crypto';
import { DomainError } from '../../../../packages/database/projects';
import { appOrigin, getAuth } from './auth';

export async function body(request: Request, limit = 8_500_000): Promise<Record<string, unknown>> {
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) throw new DomainError(415, 'UNSUPPORTED_MEDIA_TYPE', 'Send an application/json request.');
  const reader = request.body?.getReader();
  if (!reader) throw new DomainError(400, 'INVALID_JSON', 'A JSON object is required.');
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read(); if (done) break;
      size += value.length;
      if (size > limit) { await reader.cancel(); throw new DomainError(413, 'PAYLOAD_TOO_LARGE', 'This request is too large. Use a smaller photo.'); }
      chunks.push(value);
    }
    const raw = Buffer.concat(chunks);
    const parsed: unknown = JSON.parse(raw.toString('utf8'));
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('object expected');
    return parsed as Record<string, unknown>;
  } catch (error) { if (error instanceof DomainError) throw error; throw new DomainError(400, 'INVALID_JSON', 'A valid JSON object is required.'); }
  finally { reader.releaseLock(); }
}
export async function viewer(request: Request): Promise<string> {
  const auth = await getAuth();
  const result = await auth.api.getSession({ headers: request.headers });
  if (!result) throw new DomainError(401, 'UNAUTHENTICATED', 'Sign in to open your account projects.');
  if (!result.user.emailVerified) throw new DomainError(403, 'EMAIL_NOT_VERIFIED', 'Verify your email before accessing account projects.');
  return result.user.id;
}
export function checkOrigin(request: Request) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) return;
  if (request.headers.get('origin') !== appOrigin()) throw new DomainError(403, 'INVALID_ORIGIN', 'This request must come from your Invitation Maker site.');
}
export function endpoint(handler: (request: Request) => Promise<Response>) {
  return async (request: Request) => {
    const requestId = randomUUID(); const started = Date.now();
    let response: Response;
    try { checkOrigin(request); response = await handler(request); }
    catch (error) {
      if (error instanceof DomainError) response = Response.json({ error: { code: error.code, message: error.message }, requestId }, { status: error.status });
      else { console.error(JSON.stringify({ requestId, event: 'api.failure', errorType: error instanceof Error ? error.name : 'UnknownError' })); response = Response.json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong. Please retry.' }, requestId }, { status: 500 }); }
    }
    response.headers.set('Cache-Control', 'private, no-store'); response.headers.set('X-Request-ID', requestId); response.headers.set('X-Content-Type-Options', 'nosniff');
    console.info(JSON.stringify({ requestId, event: 'api.request', method: request.method, status: response.status, durationMs: Date.now() - started }));
    return response;
  };
}
