# Troubleshooting and operational boundaries

This runbook describes the current local/account foundation. Hosted media, export queues, billing and public invitations are not implemented; do not diagnose them as if they were deployed.

## Local startup

Run npm ci, npm run check:structure and npm run dev from the repository root. Open http://127.0.0.1:3000. See [setup](../development/setup.md). If a native module is locked on Windows, identify and stop only the process you own before reinstalling; do not kill unrelated Node applications or manually prune node_modules.

## Sign-in or API write rejected

PUBLIC_APP_URL must exactly match the browser origin, including localhost versus 127.0.0.1, scheme and port. All writes check Origin. Inspect response status/code and X-Request-ID. A 401 requires signing in again; a 403 usually indicates an origin mismatch. Public mode deliberately disables unverified email/password. Google needs configured provider credentials and the exact callback URL. Email reset/verification delivery is not available yet.

Repeated auth attempts may return 429. Local direct connections share a conservative per-path bucket; do not trust arbitrary forwarded IP headers to bypass it.

## Database unavailable

The default local embedded PostgreSQL directory is .data/postgres; the auth secret is stored separately. Do not open that database from two server processes. Stop the application before npm run db:migrate against the same embedded directory. A configured DATABASE_URL selects a separate PostgreSQL server; it does not migrate local records. A failed initialization can retry after the underlying problem is fixed.

Migrations are transactional and checksum-verified. Restore an accidentally edited migration from backup rather than accepting schema drift. Do not drop tables, delete .data, reset auth secrets or run a destructive restore as a routine repair. Preserve backups before schema/data changes.

## Draft missing or stale

Device drafts are stored in this browser profile; account invitations are on the configured server. Check the correct workspace and account. A copied device draft is a separate account document. Clearing browser site data removes local drafts.

A 409 means another save won the revision check. Reopen the latest version before retrying and preserve unsaved text/downloads first; do not silently overwrite the server revision. Event defaults affect only newly created invitations.

## Photo or download fails

The editor accepts JPG/PNG/WebP up to 12 MB, validates decoding, limits pixel dimensions and resizes before saving. Account request bodies are also bounded. Try a smaller image when a 413 or image validation error appears.

Downloads render the same canonical SVG as the preview. Check required text, photo presence, crop, selected format and browser support. PDF is raster RGB, not editable text/CMYK, and has no bleed. System font differences can affect rendering across machines. There is no deployed export queue to restart.

## Validation fails

Run the structure/type/unit/build/browser commands from [testing](../development/testing.md). Browser tests use port 3005, an owned production preview and isolated temporary data. Stop a preview before rebuilding its Next.js output; stale manifests cause missing assets and false failures. Only the optional network PostgreSQL test is skipped when TEST_DATABASE_URL is absent.

Generated caches, build output and screenshots are reproducible. They are different from persistent account data. CI artifacts should use sanitized fixtures, not private photos.

## Incident/support record

Collect timestamp/timezone, browser/version, request ID, status/error code and reproducible steps. Redact passwords, tokens, signed URLs, invitation contents and contacts. Application JSON logs contain request IDs, status/method/duration and generic failure types. They are a foundation, not complete production alerts or monitoring.

Before public release, implement the outstanding controls and rehearsed database/media backup, restore, rollback and incident ownership described in [status](../development/status.md). Deployment and destructive data changes need explicit authorization.
