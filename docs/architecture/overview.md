# System Architecture

The Royal Indian extension adds20 trusted public artwork/thumbnail pairs, independent portrait slots and collection discovery. The shared renderer embeds full artwork bytes for browser/worker exports; async previews cache local assets and use thumbnails in discovery. Worker network isolation remains enabled; route tracing includes artwork files. Migration0007 preserves ownership-aware portrait references. See [collection implementation](../design/royal-collection.md).

Current local implementation also includes verified mail/recovery/MFA/account controls, Sharp-bounded private derivatives, PostgreSQL durable immutable export jobs with Chrome workers and validated immutable template publication. Earlier pending descriptions below are historical for those modules. Filesystem storage is an interim private-mount adapter; public provider/font/artwork/staging acceptance is open. See [ADR 0002](../decisions/0002-private-media-and-durable-exports.md), [delivery record](../development/delivery-2026-11-13.md) and [release gates](../operations/recovery-and-release.md).

## Current implementation boundary (v0.2)

The local Next.js vertical slice uses React, strict TypeScript, Tailwind's CSS pipeline and shared design-token CSS. `packages/editor-core/document.ts` defines and validates schema v1; `packages/template-engine/render.ts` renders a canonical SVG for both preview and browser raster export. PNG/JPG/PDF downloads use this same composition; PDF embeds a raster image through a lazy-loaded jsPDF adapter. This dependency-free SVG proof precedes the planned Fabric/Konva canvas evaluation, not a decision that replaces that evaluation.

Device drafts use IndexedDB with atomic revisions. A separate `/account` workspace uses Better Auth cookie sessions and owner-scoped Next.js APIs for multi-card event projects. Drizzle operates on the same SQL schema through persistent local PGlite or configured node-postgres. Auth/data initialization is lazy, globally shared in the local process and retryable after failure; local data/secret files are ignored. Public mode requires external PostgreSQL, HTTPS and managed auth secret and disables unverified email registration.

`Editor` accepts a persistence adapter: device drafts retain their existing behavior, and account cards save through authorized APIs. Explicit copy/import preserves the original. Shared event defaults initialize new cards without rewriting existing overrides. The renderer/export path is unchanged; account exports remain browser-generated raster RGB output. See docs/development/status.md and [ADR 0001](../decisions/0001-server-foundation.md). Object-storage media, queues, server exports, template publishing and public hosting remain pending.

## Frontend (UI)
Next.js + React + TypeScript + Tailwind CSS. Server-render gallery and public invitation pages; client-side editor. Fabric.js or Konva.js evaluation spike before choosing canvas engine. Shared packages for UI, template rendering, types, and validation.

## Backend (API)
Node.js/TypeScript API (Next.js route handlers initially or separate Fastify service if scale warrants). Modules: auth, users, projects, invitations, templates, assets, exports, sharing, payments, admin, audit. Use request validation, authorization, rate limits and idempotency for writes. Background queue for high-resolution exports and emails.

## Database
PostgreSQL with migration tooling and transaction-safe writes. Object storage for uploaded images, rendered exports and template assets. Redis optional for queues, rate limits and caching.

## Logical Flow
Browser → CDN/WAF → Web UI/API → PostgreSQL + object storage; API → export queue → worker → generated file → signed download URL. Payment provider → verified webhook → entitlement transaction.

## Template Renderer
A single versioned JSON document describes layers and editable bindings. Simple Editor modifies bound data and approved theme properties. Advanced Editor modifies layer transforms and styles. Both use a shared renderer and a canonical project document; exports render the same document with fixed fonts/assets.

## Public Cloud Deployment
Use managed hosting with TLS, managed Postgres, private object storage, separate worker deployment, secrets manager, backups, monitoring, CI/CD and staging. Choose region according to user base and privacy obligations.

## Security
Private-by-default projects, signed media uploads, content-type and file-signature validation, image processing limits, CSRF protection where applicable, XSS-safe text, role checks at API and database boundaries, audit logs, verified payment webhooks, and data deletion policies.

## Nonfunctional Targets (Initial)
99.9% availability goal after launch; mobile-first performance; p95 API response goal under 500ms for ordinary reads excluding exports; reliable asynchronous export; restore-tested backups. Confirm targets after load tests.

## Architecture Decisions Pending
Editor library, deployment provider, storage vendor, email vendor, payment provider, billing model, and AI policy.
