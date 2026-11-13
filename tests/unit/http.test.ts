import { describe, expect, it } from 'vitest';
import { body, checkOrigin, endpoint } from '../../apps/web/lib/server/http';

describe('server request boundaries', () => {
  it('rejects missing/foreign origins on writes and never trusts request host', () => {
    expect(() => checkOrigin(new Request('https://evil.example/api/v1/projects', { method: 'POST' }))).toThrow();
    expect(() => checkOrigin(new Request('http://127.0.0.1:3000/api/v1/projects', { method: 'POST', headers: { origin: 'https://evil.example' } }))).toThrow();
    expect(() => checkOrigin(new Request('http://127.0.0.1:3000/api/v1/projects', { method: 'POST', headers: { origin: 'http://127.0.0.1:3000' } }))).not.toThrow();
  });
  it('bounds streamed JSON payloads and rejects malformed/wrong content types', async () => {
    await expect(body(new Request('http://localhost', { method: 'POST', body: '{}' }))).rejects.toMatchObject({ status: 415 });
    const request = (input: string) => new Request('http://localhost', { method: 'POST', headers: { 'content-type': 'application/json' }, body: input });
    await expect(body(request('['))).rejects.toMatchObject({ status: 400 });
    await expect(body(request('[]'))).rejects.toMatchObject({ status: 400 });
    await expect(body(request('{"payload":"123456789"}'), 5)).rejects.toMatchObject({ status: 413 });
    await expect(body(request('{"title":"Safe"}'))).resolves.toEqual({ title: 'Safe' });
  });
  it('returns opaque server errors with no-store and a request identifier', async () => {
    const result = await endpoint(async () => { throw new Error('DO NOT EXPOSE THIS PRIVATE VALUE'); })(new Request('http://localhost'));
    expect(result.status).toBe(500); expect(result.headers.get('cache-control')).toBe('private, no-store');
    expect(result.headers.get('x-request-id')).toBeTruthy(); expect(await result.text()).not.toContain('PRIVATE VALUE');
  });
});
