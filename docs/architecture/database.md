# Database Design (PostgreSQL)

Migration0007_royal_portrait_assets.sql adds invitation_portrait_assets with per-invitation bride/groom references, asset index, deferred asset FK and an owner-checking trigger. Updates rebuild references from the canonical portraits object; card deletion cascades slot rows. Unused-photo cleanup excludes either referenced portrait and legacy photos. Migrations0001–0006 remain unchanged. Both portraits participate in private hydration/recovery. Public backgrounds ship with the application and must be retained for pinned templates.

Current security/media/export/publishing schema is migrations 0001–0006. The v0.2/planned entries below are historical where superseded. 0002 adds role/MFA; 0003 private_assets adds owner/hash/size/dimensions; 0004 export_jobs adds immutable snapshots/idempotency/leases/expiry; 0005 adds immutable template_versions and publication pointers; 0006 adds invitation asset references, owner enforcement trigger/deferred FK and indexes. Legacy inline documents remain readable; new account documents store asset references and optional templateSnapshot. APIs hydrate private bytes. See [ADR 0002](../decisions/0002-private-media-and-durable-exports.md) and [latest validation](../development/delivery-2026-11-13.md).

## Implemented server schema (v0.2)

`packages/database/migrations/0001_foundation.sql` and `schema.ts` define users, sessions, auth_accounts, auth_verifications, auth_rate_limits, event_projects, invitations and audit_events. Migrations run transactionally, record SHA-256 checksums in schema_migrations and reject changed history. Network PostgreSQL additionally serializes migrations with an advisory lock. `npm run db:migrate` uses the same migrator as runtime initialization.

Auth identifiers are opaque text, matching Better Auth's adapter; event/card/audit identifiers are UUIDs. Emails are normalized lowercase with unique/check constraints instead of the draft CITEXT extension. Timestamps use timestamptz; auth rate-limit last_request is epoch milliseconds in bigint. Password hashing and provider identity/session lifecycle are library-managed.

Projects have an owner FK, title/occasion, shared_details JSON, revision and timestamps. Invitations have parent FK, complete document JSON, revision and timestamps; SQL checks ensure the JSON ID/revision match columns. Owner access is enforced in queries through the parent project. Domain constraints and owner/parent/expiry indexes are checked in. Project deletion cascades invitations; current UI deletion is permanent, not soft-delete recovery. Audit records omit private text/photo payloads.

The same Drizzle PostgreSQL schema uses persistent single-process PGlite locally or node-postgres for DATABASE_URL. Engine selection does not migrate data between engines. Live network PostgreSQL execution is not verified locally; a separate optional test and CI service cover it when available. Do not treat an embedded engine as a multi-process production service.

Device drafts remain independently stored in IndexedDB `invitation-maker-v1`/`drafts`; favorites remain in localStorage. Explicit copy/import gives a server card a new identity. Current server photos are embedded processed data URLs in invitation JSON; object-storage asset tables/jobs remain future work.

## Planned data model ? not migrated

The checked-in SQL and typed schema are the current database contract. Add numbered migrations and acceptance tests for the following future domains rather than maintaining a second inconsistent DDL sketch:

| Domain | Required future entities/invariants |
|---|---|
| Catalog | templates and immutable template_versions, version/schema identifiers, visibility/publish lifecycle, capability metadata, thumbnails and license/provenance |
| Private assets | owner-scoped storage keys, type/signature/byte/dimension/checksum validation, processing/expiry states, derivatives and retention |
| Exports | invitation/document revision snapshot, template/renderer/font/asset pinning, job state/attempts, idempotency, signed download expiry and error codes |
| Sharing/RSVP | hashed opaque share tokens, explicit published snapshots, expiry/revocation/cache policy, opt-in responses and guest-data limits |
| Commerce | provider-scoped orders/payments/events/refunds, unique event ledger, integer minor-unit currency/amount checks, transactional entitlements and reconciliation |
| Identity/operations | verified signup/recovery, role permissions/admin MFA, deletion/export jobs, audit/retention and restore-tested backups |

Keep UTC timestamps, FK/unique/check constraints, indexed owner/parent/status queries, atomic revisions, JSON schema validation and staged backward-compatible migrations. Never store raw card details or plaintext passwords. Finalize recovery/soft-deletion and PII retention policies before public release. Guest browsing does not require a user row; a generic blog/posts resource is outside the product scope.

## Account security migration 0002

Adds users.role (user/admin), users.two_factor_enabled and two_factors with library-managed encrypted secret/backup_codes, verification and lockout fields. Foreign-key cascade deletes authenticator state on account deletion. Promotion revokes all sessions transactionally. Applied migration checksums remain immutable.
