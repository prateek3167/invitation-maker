# ADR 0001: Account and PostgreSQL foundation

Date: 2026-11-13. Scope: the next server-backed build milestone authorized by the user. This does not approve production hosting or satisfy release gates.

## Decision

- Keep the Next.js modular-monolith API. Use Better Auth 1.7.22 for password hashing, cookie sessions, rotation/revocation and configured-only Google OAuth. Disable implicit account linking.
- Use Drizzle ORM 0.45.4 with the same PostgreSQL schema across node-postgres and PGlite 0.5.16. No Docker/psql service was available in the supplied environment. Embedded PostgreSQL provides a real local SQL engine rather than a fake backend or JSON-file ownership store.
- Use a persistent single-process PGlite directory when DATABASE_URL is absent. Switch to node-postgres when configured. Public deployments require DATABASE_URL, a high-entropy managed secret and HTTPS. Embedded mode is not a distributed/production substitute.
- Auth IDs are opaque text identifiers to match the maintained auth adapter; event/card/audit IDs are UUIDs. This deliberately refines the draft all-UUID convention.
- Apply checked-in SQL migrations transactionally with recorded SHA-256 checksums; network PostgreSQL migration execution also takes an advisory lock. Expose `npm run db:migrate`, and initialize local schemas on first server use.
- Keep device drafts and account projects separate. Copy/import is explicit, creates a new ID and preserves the source. Both editors share the same document/renderer and differ only in persistence adapter.
- Store processed photo data within the account invitation JSON temporarily, under bounded payload/card/project limits. Private object storage and validated media jobs remain the next infrastructure milestone.

## Security boundaries

Every project read/write is constrained by the authenticated owner. Invitation queries constrain the parent project. Owner IDs are never accepted from request bodies; inaccessible resources return 404. Updates require revisions and return 409 on stale writes. Requests have bounded JSON bodies, exact configured-origin checks on all writes (including cookie-free signup), no-store responses and redacted request IDs/status/duration logs. No invitation contents, auth tokens or emails are logged by application request logging.

Sessions use the maintained library's HTTP-only SameSite cookies and secure cookies on HTTPS. Auth attempt counters persist in SQL. With no trusted reverse-proxy header, the safe default is a shared per-path bucket, preventing spoofed X-Forwarded-For bypass. Configure a verified client-IP boundary and abuse policy before public scale.

Development email/password accounts deliberately have no email delivery/verification or reset flow. Public email/password registration is disabled when PUBLIC_DEPLOYMENT=true until those controls are implemented. Google is shown only when credentials are configured; no credentials were supplied and no live OAuth roundtrip was tested. Do not invent an email reset UI that does not send email.

## Validation and alternatives

Real embedded PostgreSQL migrations/constraints, Better Auth hashing/session/revocation, owner A/B isolation, event defaults, cascade deletion, quotas, invalid/foreign-origin bodies and revision conflicts are tested. Chrome exercises account registration, login, multiple cards, reopening, device copy and the original export flows. A separate optional test and CI PostgreSQL service cover the network driver; local network PostgreSQL verification is pending because no server is available.

Provider-managed auth remains viable for production but requires vendor/region/cost choices. Hand-written password/session authentication was rejected in favor of a maintained library. SQLite/flat JSON were rejected for this milestone to keep PostgreSQL semantics. PGlite persistence must not be opened by multiple server processes; switching engines requires deliberate data migration, not pointing PostgreSQL at an embedded directory.

## Remaining gates

SMTP/provider selection, verified signup/recovery, admin MFA and role permissions; private media storage/processing; immutable export jobs and queues; template publishing; database/asset backup and restore; PostgreSQL staging/load/security checks; explicit hosting/region and production approval. Current creation/deletion audit records and request logs are foundations, not a complete monitoring product.

## Source references

- [Better Auth setup](https://better-auth.com/docs/installation), [Drizzle adapter](https://better-auth.com/docs/adapters/drizzle), [Next.js integration](https://better-auth.com/docs/integrations/next).
- [Better Auth rate limiting](https://better-auth.com/docs/concepts/rate-limit), [email/password](https://better-auth.com/docs/authentication/email-password), [schema](https://better-auth.com/docs/concepts/database).
- [PGlite runtime/persistence](https://pglite.dev/docs/), [Drizzle PGlite](https://orm.drizzle.team/docs/connect-pglite).

Documentation checked during this milestone; implementation choices above are project-specific decisions, not claims that the libraries make the application production-ready.
