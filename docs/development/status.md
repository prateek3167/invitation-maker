# Invitation Maker — Account Foundation v0.2

Updated: 2026-11-13 (Asia/Calcutta). The user authorized the next server-backed phase. This milestone adds working accounts and private event collections while retaining the device-local studio. It is not a public launch or completion of the roadmap.

## Current milestone

- `/account`: maintained Better Auth email/password registration/sign-in, HTTP-only cookie sessions, logout/revocation and configured-only Google OAuth. Live Google behavior is untested without credentials; no fake provider button is shown.
- PostgreSQL-compatible migrations and Drizzle schema: users, sessions, provider accounts, verification/rate-limit records, projects, invitations, audit and checksum ledger. PGlite persists locally in one server process; DATABASE_URL selects node-postgres.
- Owner-scoped, multi-card event collections; create/rename/delete; shared defaults initialize new cards without overwriting existing edits. Account cards use the existing canonical editor/renderer with server persistence.
- Explicit device-draft copy, including styles/photo, generates a new identity and preserves the source. Original device drafts/favorites/exports continue to work separately.
- Revision-safe updates, 404 for inaccessible private resources, exact-origin checks (including cookie-free signup), bounded JSON bodies, persistent auth limits and no-store/redacted request logs.
- Readiness/public template/session-capability APIs, repeatable migration CLI, and CI configuration with a disposable PostgreSQL service. No remote CI run or live hosted database is claimed.

## Current validation

TypeScript and production build pass. The current suites contain 20 passing unit/integration tests and 5 passing Chrome E2E flows. One additional network PostgreSQL test is intentionally skipped without TEST_DATABASE_URL; no local Docker/psql service was available. The CI workflow is prepared to run that test against PostgreSQL 17.

Coverage includes migration checksums/constraints, disk persistence after reopening the embedded engine, actual password hashing and session revocation, rate limiting, owner A/B isolation, revisions/quotas, malformed/foreign-origin/oversized requests, account UI and original exports. Selected axe checks cover home/editor/auth/workspace. Desktop and mobile account screenshots were inspected. These automated checks do not establish full accessibility conformance or production security certification.

`npm run db:migrate` succeeded twice against an isolated local smoke database. A Windows runtime-loader dependency attempted an unavailable OS user lookup; the CLI instead compiles its typed source with esbuild and uses the same migrator. The final command returns successfully without requiring that OS capability. Dependency audit reported zero vulnerabilities during this milestone.

## Operating and release boundaries

Local accounts live on this computer's development server, not an externally hosted cloud. Do not open the same embedded directory in multiple processes. Device drafts are accessible to anyone using that browser profile; account access is separately session/owner checked. Engine selection does not automatically migrate records between embedded and network PostgreSQL.

Email delivery/verification/reset, account deletion/export UI, admin roles/MFA and support-access processes remain future gates. PUBLIC_DEPLOYMENT=true requires external PostgreSQL, managed secret and HTTPS and disables email/password registration until verification/recovery exists. Local direct connections use a conservative shared auth-rate bucket rather than trusting spoofable forwarding headers; a verified proxy/client-IP policy is needed before public scale.

Photos remain embedded processed data URLs in server invitation JSON temporarily. Private media storage/validation jobs, immutable export jobs/workers, admin template/version publishing, production backup/restore, hosting/region choices and deployment approval remain next work. Advanced canvas editing, sharing/RSVP, billing, languages, AI and collaboration remain later phases. Catalog uniqueness/licensing and raster RGB PDF limitations from the first slice still apply.

## Current source and rollback map

`apps/web/components/account-workspace.tsx` owns account/event UI; `lib/server` owns auth/request boundaries; `app/api` implements auth and owner-scoped application routes; `packages/database` owns schema/migrations/domain operations. `Editor` accepts separate local/server persistence adapters. `scripts/migrate-db.mjs` runs the typed migration CLI; `scripts/test-e2e.mjs` isolates database/secret state and cleans up only its owned test directory. See [ADR 0001](../decisions/0001-server-foundation.md), docs/development/setup.md, docs/architecture/api.md and docs/architecture/database.md.

No external deployment, paid service provisioning, Git merge or independent human approval occurred. Preserve browser schema v1 and server data/secret files on upgrade. Never edit applied SQL migrations or drop account tables as a rollback; use compatible application rollback and verified backups. Request/audit logging is a foundation, not complete production monitoring.

## Export and catalog limits

The catalog contains 50 concept variants (29 photo-ready / 21 non-photo) reusing composition families; distinct artwork and license approval remain required. Portrait export is 1500 by 2100 pixels, with a 5 by 7 inch raster RGB PDF at 300dpi equivalence. There is no bleed, CMYK/PDF-X or selectable PDF text. Square/story sizes preserve the portrait composition with background space; system fonts may vary across platforms. See [setup](setup.md) for operating details.

## Latest authoritative checkpoint (2026-11-13)

Earlier limitations are historical where superseded. Current local security, private media, durable exports, versioned MFA-admin publishing and recovery/hardening are verified:31 unit/integration+8 Chrome tests pass; one external PostgreSQL test skipped; structure/type/build pass; runtime audit zero. See [delivery record](delivery-2026-11-13.md), [phase status](phase-status.md) and [open release gates](../operations/recovery-and-release.md). Public deployment and later roadmap phases are not marked complete.

## Royal collection increment verified — 2026-11-13

Added 20 illustrated Royal Indian templates with independent bride/groom portraits and wedding-event presets, preserving original 50. Total 70 designs. Latest 33 unit/integration+9 Chrome tests pass, one network PostgreSQL test skipped; type/build/structure pass. Every new design has an actual edited/saved/exported PNG proof, with desktop/mobile coverage and royal worker PNG parity/PDF. See [collection guide](../design/royal-collection.md). Public-release gates remain unchanged.

## Wedding template catalog enhancement & luxury collection verified — 2026-11-13

Added 10 new luxury Indian wedding templates (Maharaja Darbar, Mughal Garden, Imperial Peacock, Rajputana Jharokha, Haldi, Mehndi, Sangeet, Sagaai, Grand Vivah) and upgraded existing designs with authentic Indian couple names and palace venues. Total 80 designs (60 catalog + 20 royal; 57 photo / 23 non-photo). Expanded renderer with 10 rich vector layout architectures, auspicious top badges, sacred mandala centerpieces, and graceful silhouette couple placeholders. Enabled luxury wedding color stories and ceremony event presets across all wedding designs. 33 unit/integration tests and browser checks pass; structure and build pass.
