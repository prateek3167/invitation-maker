# Phased Implementation Plan

## Authorized Culturally Rich Traditional Elements & Hindi/Devanagari Fonts — 2026-11-14

The user explicitly requested building Culturally Rich Traditional Elements and Hindi/Devanagari Fonts to provide an authentic, premium Indian wedding invitation design experience.

- [x] Phase 1: Integrate authentic Google Devanagari Fonts (`Rozha One`, `Yatra One`, `Kalam`, `Tiro Devanagari Hindi`, `Noto Serif Devanagari`, `Noto Sans Devanagari`) in `apps/web/app/layout.tsx` and unified SVG `<defs>` `<style>` in `packages/template-engine/render.ts`.
- [x] Phase 2: Build categorized Vedic Shlokas & Auspicious Phrasing library (`packages/editor-core/shlokas.ts`) covering Ganesh Vandana, Vivah Mangalam, Gauri Vandana, Saptapadi (Saat Phere), Shanti Mantra, Auspicious Ceremony Headlines, and Formal Family Invitation lines with 1-click insertion and suggested Devanagari typography.
- [x] Phase 3: Create 1-click "Convert to Shudh Hindi (हिंदी में बदलें)" preset tool in `sidebar-tools.tsx` that translates invitation greetings, headings, and details to pure Hindi Devanagari while automatically upgrading canvas elements to Devanagari Google Fonts.
- [x] Phase 4: Build pure vector artwork generators (`packages/template-engine/traditional-elements.ts`) for 13 traditional Indian wedding elements: Royal Lord Ganesha, Line-art Ganesha, Auspicious Swastika, Sacred Pranava Om, Bridal Doli/Palki, Shehnai & Dholak, Royal Baarat Elephant, Saat Phere Havan Kund, Mangalsutra & Sindoor Dani, Mayur Yugam (Peacock Pair), Auspicious Brass Diya, Atithi Devo Bhava (Namaste), and Genda Phool Garland.
- [x] Phase 5: Integrate traditional elements in `packages/editor-core/canvas.ts` (`WEDDING_ELEMENT_TEMPLATES`), `sidebar-tools.tsx` (with category filters: Sacred, Ceremonies, Royal Decor), `interactive-canvas.tsx` (live interactive SVG rendering), and `render.ts` (export parity for PNG/JPG/PDF).
- [x] Phase 6: Expand Font Family selector in `properties-panel.tsx` with optgroups for Traditional Devanagari/Hindi typography and Royal English typography.
- [x] Phase 7: Comprehensive verification with 6 new unit tests (`tests/unit/shlokas.test.ts`), full test suite (46/46 tests pass), strict TypeScript checks, structure check (196 maintained files), and production build.

Verified: 46 unit/integration tests pass across 13 test suites (0 failures); Next.js production build succeeds with all static & dynamic routes compiled; structure check passes (196 maintained files); Devanagari typography, authentic Vedic shlokas, 1-click Hindi preset conversion, and 13 traditional vector elements verified.

## Authorized Multi-Card Wedding Suite (Ek Sath Puri Shaadi Ka Set) — 2026-11-14

The user explicitly requested building the Multi-Card Wedding Suite so couples can create, customize, navigate, and download their complete wedding ceremony suite (Save the Date, Shubh Haldi, Shubh Mehndi, Sangeet Night, Shubh Vivah, Grand Reception) in one project.

- [x] Phase 1: Establish Multi-Card Wedding Suite data model (`WeddingCeremony`, `WEDDING_CEREMONIES`, `suiteCards?: Invitation[]`, `eventTag?: string`) in `packages/editor-core/suite.ts` and `document.ts` with transparent persistence and backward compatibility.
- [x] Phase 2: Implement 1-click ceremony card generator (`createEventCard`) and 5-card coordinated suite generator (`generateWeddingSuite`) with event-appropriate color themes, timing defaults, ceremonies, and typography.
- [x] Phase 3: Implement smart bidirectional detail sync (`syncSuiteCoupleDetails`) so Bride & Groom names and Host family details propagate seamlessly across all suite cards while individual event dates, times, and venues remain independent.
- [x] Phase 4: Build bottom Canva-style ceremony card strip (`apps/web/components/canvas/suite-bar.tsx`) with active card selection, live thumbnails, ceremony badges, reordering (`<`, `>`), duplicate, delete, and `+ Add Event Card` popup menu.
- [x] Phase 5: Implement multi-card export in `apps/web/lib/export.ts` (`exportSuitePdf` for high-resolution 300 DPI multi-page wedding booklet PDF with `jsPDF.addPage`, and `exportSuiteImages` for sequential downloads of all cards).
- [x] Phase 6: Full verification with comprehensive unit tests (`tests/unit/suite.test.ts`), Next.js production build, structure checks, and typecheck.

Verified: 40 unit/integration tests pass across 12 test suites (0 failures); Next.js production build succeeds with all static & dynamic routes compiled; structure check passes (193 maintained files); multi-card suite strip, 5-card generation, live couple detail sync, and multi-page wedding booklet PDF download verified.

## Authorized Canva-like interactive template editor (Phase 8 expansion) — 2026-11-14

The user explicitly requested enhancing the Template Editor into a full Canva-like visual design and editing studio with on-canvas drag-and-drop, individual element customization, text formatting, photo editing, design elements library, layers management, undo/redo, auto-save, and export parity.

- [x] Phase 1: Establish canvas elements schema, types (`CanvasElement`), backward-compatible `Invitation.canvasElements`, template deconstruction engine (`decomposeTemplateToElements` for all 80 templates), and bidirectional field sync.
- [x] Phase 2: Extend unified SVG renderer (`renderSvg`) to render `CanvasElement` trees with pixel precision (transforms, rotations, text styling, clip-paths, shapes) while maintaining export parity for PNG/JPG/PDF.
- [x] Phase 3: Build interactive canvas workspace (`InteractiveCanvas`) with direct on-canvas element selection, drag-to-move, 8-handle resizing, rotation handle, alignment guides/snapping, zoom, and keyboard shortcuts.
- [x] Phase 4: Implement Left Sidebar tool palette: Templates, Text, Photos (single & royal bride/groom), Design Elements Library (shapes, traditional wedding ornaments, toran, kalash, lanterns, peacock plumes, borders), Backgrounds, Uploads, and Layers panel (reorder, lock, hide, depth).
- [x] Phase 5: Implement Right Properties Panel (context-sensitive text/photo/shape/background inspector) and Top Toolbar (undo/redo, zoom, title, save status, dual mode toggle, download).
- [x] Phase 6: Full integration with existing draft persistence (IndexedDB + Account API), tests update, regression verification, and performance/accessibility auditing.

Verified: 35 unit/integration tests pass; Next.js production build succeeds (`Route (app)` static & dynamic API routes); structure checks pass (191 maintained files); interactive Canva visual editing studio verified with drag-to-move, 8 resize handles, rotation, alignment snapping, layer management, design elements library (ornaments/shapes/borders), and seamless dual-mode toggle.

## Authorized wedding template catalog enhancement & luxury collection — 2026-11-13

The user explicitly requested navigating to the Template Catalog, enhancing/redesigning existing templates, and adding modern, professional, premium wedding invitation templates (Royal & Traditional, Luxury, Photogenic, Contemporary, Elegant, Mughal Garden, Imperial Peacock, Maharaja Darbar, Rajputana Jharokha, and wedding events: Haldi, Mehndi, Sangeet, Sagaai, Shaadi).

- [x] Completely upgraded the SVG renderer (`packages/template-engine/render.ts`) with 10 rich vector layout compositions (layouts 0–9): Maharaja Darbar arch & kalash, Modern Editorial Luxury hairlines, Mughal Garden botanical wreaths & cascading rose vines, Imperial Peacock plumes & diamond stars, Rajputana Jharokha sandstone balcony & carved jali lattice, Vintage Shubh Patrika baroque scroll & ribbon banner, Art Deco gala gold borders, Sacred Lotus & hanging marigold torans, Henna Arabesque mandala fans & paisleys, and Starlit Sangeet suspended palace fanoos lanterns.
- [x] Integrated dynamic occasion/event badges (`|| SHREE GANESHAYA NAMAHA ||`, `|| SHUBH HALDI UTSAV ||`, `|| SHUBH MEHNDI KI RAAT ||`, `|| SANGEET & DANCE CELEBRATION ||`, `|| THE ROYAL RING CEREMONY ||`, `|| SHUBH VIVAH ||`), 16-petal sacred mandala centerpieces for non-photo cards, and elegant silhouette couple placeholders when photos are unuploaded.
- [x] Curated and upgraded `catalog.json` with authentic, culturally resonant Indian couple names, heritage palace venues, realistic descriptions, and 10 brand-new wedding event designs (IDs 51–60), expanding total template count to 80 (60 catalog + 20 royal; 57 photo, 23 non-photo).
- [x] Enhanced the studio editor with luxury wedding color palettes (Royal Ruby & Gold, Emerald & Gold, Turmeric & Marigold) and enabled wedding ceremony preset switching across all wedding-related cards.
- [x] Enhanced discovery in the Template Catalog studio with quick wedding navigation pills (`All designs (80)`, `👑 Royal collection (20)`, `✨ Shaadi & Weddings`, `💛 Haldi`, `🌿 Mehndi`, `🎶 Sangeet`, `💍 Sagaai & Ring`) and badges.
- [x] Updated unit/document tests and E2E studio specifications to validate the expanded 80-template catalog.

Verified: 33 unit/integration tests and browser flows pass; catalog, vector layouts, photo/non-photo templates, and wedding ceremony presets verified.

## Authorized royal Indian collection expansion — 2026-11-13

The user explicitly authorizes this collection/editor increment independently of the public deployment gate.

- [x] Add twenty original illustrated royal wedding designs: two genuinely distinct artworks/compositions in each of the ten requested categories.
- [x] Add independently editable bride/groom portrait slots, crop controls and Haldi/Mehndi/Sangeet/Sagaai/Shaadi event presets without changing legacy photo documents.
- [x] Integrate discovery/category filters and self-contained artwork in previews, browser downloads and immutable server exports.
- [x] Preserve owner isolation, media cleanup/recovery, template version pinning and existing designs; add migrations/tests for portrait asset references.
- [x] Verify every new template through the actual gallery/editor, persistence and final rendering on desktop/mobile; update provenance and documentation.

Verified:33 unit/integration tests and9 Chrome tests pass; all20 royal designs opened/customized/saved/exported through the gallery/editor, with desktop/mobile coverage and real worker PNG/PDF proofs. Type/build/structure pass; optional network PostgreSQL case remains skipped. See [royal collection guide](docs/design/royal-collection.md).

## Continuous delivery authorization — 2026-11-13

The user explicitly authorized sequential implementation, full regression validation, bug fixing, documentation updates and automatic continuation through the approved roadmap without another phase-start confirmation. A phase is complete only when its implemented acceptance criteria pass; external-service/production checks must remain visibly pending if unavailable. This does not authorize publishing, paid provisioning, sending unsolicited messages, destructive data changes or inventing business/pricing/license approvals.

### Active sequence

- [x] Finish the local account-security foundation: verified email, resend/recovery/reset, profile/session/data controls and secured administrative identity.
- [x] Complete local private media validation/storage and owned immutable export jobs with retries and regression parity.
- [x] Complete versioned template publishing, schema/format proofs and secured admin operational controls.
- [x] Complete available local hardening, encrypted recovery/retention/configuration checks and document real staging/deployment gates.
- [ ] Pass public acceptance: actual provider/storage environment, controlled fonts, distinct licensed launch artwork, staging PostgreSQL/SMTP/OAuth/load/recovery, policies and human UAT.
- [ ] After the MVP gate passes, continue Advanced Editor/history, hosted sharing, RSVP and approved billing/growth slices in roadmap order.

Track acceptance evidence and outstanding external/business constraints in docs/development/phase-status.md. Preserve the clean directory structure and run the complete existing suite after every phase.

Verified 2026-11-13: 31 unit/integration tests and 8 Chrome E2E flows pass, one external PostgreSQL case skipped; type/build/structure pass and runtime audit reports zero vulnerabilities. See [delivery record](docs/development/delivery-2026-11-13.md). Automatic progression reached the public MVP acceptance gate; local fixtures do not pass that gate. Later editor/sharing/RSVP/billing phases remain queued in roadmap order.

## Authorized repository cleanup — 2026-11-13

The user explicitly authorized a verified cleanup and reorganization, with a full backup before changes. This supersedes the earlier instruction to retain the obsolete HTML reference in the working tree; the complete original is preserved in the external backup.

- [x] Back up and verify the complete project, including persistent data and configuration.
- [x] Trace source imports, dependency/configuration usage and documentation references before removal.
- [x] Consolidate maintained documentation under docs; remove only verified historical duplicates, the unused mockup and empty placeholders.
- [x] Remove generated caches/test artifacts safely; preserve runtime data, secrets, dependencies, source and SQL migrations.
- [x] Update references, dependency declarations and unused-code guards; run all existing checks and document results.

This is a structural cleanup only. Existing public-release gates remain unchanged.

Completed with 13 document moves, 20 verified obsolete/placeholder file removals, 9 empty-directory removals, valid structure/dependency checks, passing typecheck/build/migration checks and 25 passing tests. One external PostgreSQL test remains skipped without a configured service. All 1,020 original persistent-data files, the SQL migration, catalog and environment example retain their original SHA-256 hashes. See [cleanup report](docs/development/cleanup-report.md).

## Active build authorization — 2026-11-12

The user's instruction "Please build" authorizes starting the proposed MVP with the roadmap's recommended defaults. This authorization replaces the earlier planning-only instruction. Public deployment and external paid-service provisioning remain separate.

### Current approved implementation slice

- [x] Create a local Next.js/React application with strict TypeScript and shared canonical invitation types/rendering.
- [x] Deliver responsive discovery, occasion/photo search filters, template previews and a usable guided editor.
- [x] Preserve text, styling, photos and crops through local draft saving/reopening; make device-local storage explicit.
- [x] Implement actual PNG/JPG/PDF downloads from the same document renderer, plus project duplication/deletion.
- [x] Add meaningful document/rendering/persistence tests and run type/build checks.
- [x] Document setup, limitations, release scope and next backend milestones.

Validated 2026-11-13: typecheck/build pass, 8 unit/integration tests and 3 Chrome E2E tests pass, plus selected home/editor accessibility checks and inspected screenshots. See docs/development/status.md. These checkmarks apply only to this slice, not production release gates.

This first local vertical slice is a reviewable foundation. It does not satisfy the production authentication/PostgreSQL/worker/admin launch gates by itself. Use the 50-template inventory and 29/21 mix as the working catalog target; composition/rights validation remains a production gate. Use English and portrait/square/story output presets initially. Keep billing/RSVP/AI deferred.

## Current authorized milestone — Phase 2A server foundation (2026-11-13)

The user explicitly requested moving to the next phase and building it. Implement the following server-backed foundation while preserving the existing device-local workspace:

- [x] Record auth/database choices and implement versioned PostgreSQL-compatible migrations.
- [x] Add working email/password registration, login, session/logout and configured-only Google OAuth using a maintained auth library. Live OAuth remains unverified without credentials.
- [x] Add owner-scoped project/invitation APIs, atomic revisions, multi-card event projects and validation/error contracts.
- [x] Connect an account workspace to server persistence; keep device drafts separate and offer explicit copy/import without deleting them.
- [x] Test migrations, real auth/session flows, two-user isolation, revisions, malformed/cross-origin requests, account project UI and existing local export parity.
- [x] Update setup, API/schema/status/memory documents and provide rollout/rollback boundaries.

Use a persistent embedded PostgreSQL engine for single-process local development/tests when no PostgreSQL service is configured; production PostgreSQL remains configured through DATABASE_URL. No external services or paid hosting will be provisioned. Email delivery, production verification/recovery, admin publishing and export workers remain explicit later gates, not simulated features.

See docs/development/status.md and ADR 0001 for verification and remaining launch gates. The optional live PostgreSQL test and CI service are supplied; an external database/provider was not used here.

## Phase 1 — Setup & Design Approval

- Confirm PRD, role matrix, privacy, pricing and template licensing.
- Finalize UI mockups for home, gallery, Simple Editor, Advanced Editor, projects and admin.
- Create architecture decision records for canvas engine, auth, hosting and exports.
- Define JSON template schema and sample photo/non-photo template proofs.
**Exit gate:** signed-off blueprint, designs and technical choices.

## Phase 2 — Build
**2A Foundation:** monorepo, CI, auth, database migrations, template listing, project CRUD.
**2B MVP:** Simple Editor, photo upload, autosave, previews, PNG/PDF exports, admin publishing, first curated templates.
**2C Expansion:** full Advanced Editor, layer tools, version history, remaining template library, sharing, premium billing as approved.
**Exit gate:** acceptance tests pass in staging; export parity verified.

## Phase 3 — Test
Unit, API integration, E2E, security, accessibility, mobile, load, backups, image handling, export regression and billing sandbox tests. Fix release blockers and run user acceptance testing.
**Exit gate:** zero unresolved critical/high defects, approved release checklist.

## Phase 4 — Launch
Provision production cloud, domain/TLS, backups, alerts, CDN, logging, privacy pages, support process. Run staged rollout, monitor errors and conversion, establish rollback procedure.
**Exit gate:** production smoke tests, incident owner, support channel and metrics.

## Dependencies
Auth before private projects; canonical template renderer before advanced editing; storage before image uploads; export worker before high-quality downloads; webhook verification before paid entitlements.

## Timeline Estimate
Phase 1: 1–2 weeks; Phase 2: 9–15 weeks depending on scope/team; Phase 3: 2–3 weeks; Phase 4: 1–2 weeks. Re-estimate after design approval.

## Verified account-security increment ? 2026-11-13

Verified email, resend/recovery/reset, profile/password/session/data controls, authenticator enrollment and administrator promotion are implemented. Typecheck/build, 23 unit/integration tests and six browser flows pass; one network PostgreSQL test remains skipped. See [account security](docs/operations/account-security.md). Automatically continuing to private media/export/publishing. External SMTP/OAuth/edge configuration remains a staging gate.
