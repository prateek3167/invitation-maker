# Invitation Maker

A Next.js invitation studio with guided editing, device-local drafts and an authenticated account workspace for multi-card events.

Latest local analysis: [audit, fixes, test evidence and production-readiness gates](docs/development/audit-2026-11-14.md). Public invitation publishing, online RSVP delivery and billing are not implemented; device previews and manual guest tools are labelled accordingly.

## Quick start

Requires Node.js 22 or newer and npm.

    npm ci
    npm run dev

Open http://127.0.0.1:3000. Use **My projects** for device drafts or **Account studio** for server-saved event collections. The local server initializes embedded PostgreSQL automatically; no paid service is required.

See [setup](docs/development/setup.md) for database migrations, environment configuration, optional Google OAuth and storage precautions.

Local registration requires email verification. Run `npm run mail:preview -- YOUR_EMAIL` to open the locally captured message; no external email is sent unless SMTP is configured. Account & security includes recovery, authenticator setup and data controls.

The gallery features **80 wedding and celebration designs**, including **20 Royal Indian wedding designs** across ten heritage categories and **10 brand-new luxury wedding event templates** (Maharaja Darbar, Mughal Garden, Imperial Peacock, Rajputana Jharokha, Haldi, Mehndi, Sangeet, and Sagaai). Choose **Royal collection → All 20 royal designs** or use the wedding event filters to customize and preview invitations. [Royal collection guide](docs/design/royal-collection.md).

## Project layout

    apps/web/                     Next.js routes, components and client/server adapters
    packages/database/            SQL schema, migrations and owner-scoped operations
    packages/editor-core/         Canonical document types and validation
    packages/template-engine/     Catalog concepts and shared SVG renderer
    scripts/                      Migration, browser-test and structure-check commands
    tests/{unit,integration,e2e}/  Document, storage/auth/API and Chrome tests
    docs/                         Product, architecture, decisions, development and operations
    .github/workflows/            CI configuration

The npm workspace uses one root dependency/lockfile set for the web app and shared source modules. Installed dependencies, generated Next.js output and local data are ignored; they are not files to commit. Do not remove .data as a source cleanup.

## Checks

    npm run check:structure
    npm run typecheck
    npm test
    npm run build
    npm run test:e2e

Browser tests use installed Google Chrome, an owned preview on port 3005 and an isolated temporary database. One optional network PostgreSQL test requires TEST_DATABASE_URL. [Testing details](docs/development/testing.md).

## Documentation

- [Current implementation and limits](docs/development/status.md)
- [Sequential phase status](docs/development/phase-status.md) and [latest validation record](docs/development/delivery-2026-11-13.md)
- [Setup and configuration](docs/development/setup.md)
- [Requirements](docs/product/requirements.md), [design](docs/product/design.md) and [development roadmap](docs/product/roadmap.md)
- [Architecture](docs/architecture/overview.md), [database](docs/architecture/database.md), [API](docs/architecture/api.md), [authentication](docs/architecture/authentication.md) and [planned integrations](docs/architecture/integrations.md)
- [Architecture decisions](docs/decisions/0001-server-foundation.md)
- [Troubleshooting](docs/operations/troubleshooting.md)
- [Account security](docs/operations/account-security.md), [private media/export operations](docs/operations/media-and-exports.md) and [recovery/release gates](docs/operations/recovery-and-release.md)
- [Cleanup record and backup](docs/development/cleanup-report.md)
- [Authorized work](PLAN.md), [agent responsibilities](AGENTS.md) and [project memory](MEMORY.md)

## Release status

Working locally: catalog/search/favorites, guided text/style/photo editing, autosave/reopen, browser PNG/JPG/raster PDF downloads, verified accounts/recovery, MFA/admin identity, multi-card events, private processed media, durable background export/history, versioned template publishing and device-draft copying. Encrypted local recovery and storage maintenance commands are available.

Not yet a public production release: real PostgreSQL/SMTP/OAuth, durable hosting/storage, production restore/load/smoke checks, controlled fonts, artwork rights and human UAT remain gates. `npm run check:deployment` reports missing configuration. Full canvas editing/history, sharing/RSVP, billing, AI and collaboration remain later roadmap work after the MVP gate.

Device drafts are private only to the browser profile; account projects use session/owner checks. Embedded local accounts live on this computer's server, not an externally hosted cloud. See the setup/status documents before changing deployment or data storage.
