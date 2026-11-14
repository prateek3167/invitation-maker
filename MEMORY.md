# Invitation Maker — Project Memory

Updated 2026-11-13 (Asia/Calcutta). This is repository-local context, not account-level assistant memory.

## Start here

Read AGENTS.md and PLAN.md, then [requirements](docs/product/requirements.md), [design](docs/product/design.md), [architecture](docs/architecture/overview.md), [database](docs/architecture/database.md) and [API](docs/architecture/api.md) before implementation. The user authorized building the initial studio, the next account-foundation phase and a backed-up structural cleanup. Those instructions do not approve public deployment, destructive database work or paid services.

Current truth: [implementation status](docs/development/status.md), [setup](docs/development/setup.md), [roadmap](docs/product/roadmap.md) and [ADR 0001](docs/decisions/0001-server-foundation.md).

## Multi-Card Wedding Suite (Ek Sath Puri Shaadi Ka Set) — 2026-11-14

User explicitly requested building the Multi-Card Wedding Suite:
- **Suite Data Architecture (`packages/editor-core/suite.ts`)**:
  - `WeddingCeremony`: Ceremony definition metadata (`id`, `name`, `hindiName`, `emoji`, `themeColor`, `defaultTime`, `defaultMessage`).
  - `WEDDING_CEREMONIES`: Pre-configured support for 6 key wedding events: Save the Date, Shubh Haldi, Shubh Mehndi, Sangeet Night, Shubh Vivah, Grand Reception.
  - `createEventCard`: Generates an event-specific invitation document pre-populated with matching palette, event titles, auspicious headings, timings, and decomposed canvas elements.
  - `generateWeddingSuite`: Generates a coordinated 5-card Indian wedding suite in 1 click.
  - `syncSuiteCoupleDetails`: Automatically propagates Bride & Groom names, parent/host family lines, and hashtags across all suite cards in real time while preserving each ceremony's individual date, time, and venue.
  - `applyPaletteToSuite`: Propagates color palette updates across every card in the suite.
  - `Invitation.suiteCards?: Invitation[]` on primary document ensures 100% backward-compatible persistence in local IndexedDB (`drafts`) and Account API (`event_projects`) without modifying database schemas.
- **Canva-Style Ceremony Strip (`apps/web/components/canvas/suite-bar.tsx`)**:
  - Docked at the bottom of the visual canvas with live rendered thumbnails, active card highlight, card numbering, ceremony emoji badges, reordering (`<`, `>`), duplicate, delete, and `+ Add Event Card` ceremony popup menu.
  - Dedicated `✨ Generate 5-Card Suite` magic button in both the bottom strip and top toolbar.
- **Multi-Card Export Engine (`apps/web/lib/export.ts`)**:
  - Single active card export (PNG, JPG, PDF).
  - Multi-page High-Res 300 DPI Wedding Booklet PDF (`exportSuitePdf`) via `jsPDF.addPage()`, compiling all ceremony cards into one unified printable booklet.
  - Batch export of all ceremony cards as separate high-resolution images (`exportSuiteImages`).
- Fully tested & verified: 40 unit and integration tests passing (including 5 dedicated suite tests in `tests/unit/suite.test.ts`), production build passing, structure check clean (193 maintained files).

## Canva-Like Interactive Visual Template Editor — 2026-11-14

User explicitly requested enhancing the Template Editor into a full Canva-like interactive design studio:
- **Core Canvas Schema (`packages/editor-core/canvas.ts`)**:
  - `CanvasElement` defines `type: 'text' | 'image' | 'shape' | 'ornament' | 'background'`, `x, y, width, height, rotation, opacity, locked, hidden, zIndex`.
  - Typography attributes: `fontFamily, fontSize, fontWeight, fontStyle, color, textAlign, letterSpacing, lineHeight`.
  - Image attributes: `frameShape ('arch' | 'oval' | 'circle' | 'rect'), zoom, cropX, cropY, filter, slot ('single' | 'bride' | 'groom')`.
  - Shape & Ornament attributes: `shapeType, fill, stroke, strokeWidth, strokeDasharray, svgContent`.
  - `decomposeTemplateToElements`: Automatically deconstructs all 80 templates into individually editable visual elements on canvas.
  - `syncFieldsFromElements` and `syncElementsFromFields`: Bidirectional synchronization between canvas elements and canonical `Invitation.fields`.
- **Unified SVG & Export Parity (`packages/template-engine/render.ts`)**:
  - `renderFromCanvasElements` renders elements in exact zIndex order with full support for transforms, clipPaths, shapes, text wrapping, and traditional Indian wedding ornaments (Kalash, Mandala, Toran, Lanterns, Peacock, Henna arabesque, Dividers, Borders).
  - Preserves 100% fidelity for high-resolution PNG, JPG, and 300 DPI PDF raster exports without pipeline changes.
- **Interactive Canvas Studio (`apps/web/components/canvas/`)**:
  - `interactive-canvas.tsx`: Interactive SVG canvas with direct selection, drag-to-move, 8-point resize handles (`nw, n, ne, e, se, s, sw, w`), top rotation handle stem with angle snapping, horizontal/vertical center alignment guides, floating zoom (40%–200%), and inline text editing.
  - `sidebar-tools.tsx`: 7-tab sidebar dock (Templates, Text & Auspicious Phrasing, Couple Photos & Frames, Traditional Ornaments & Shapes, Luxury Color Stories & Formats, Uploads, Layers Stack).
  - `properties-panel.tsx`: Context-sensitive inspector for text, photos, shapes, ornaments, backgrounds, canvas alignment, and layer arrangement.
  - `top-toolbar.tsx`: Undo/Redo history stack, real-time draft save status, title editing, download, and dual-mode switcher ("Visual Studio" ↔ "Guided Details").
- Fully tested and verified: 35 unit & integration tests pass, Next.js production build succeeds, structure checks pass (191 maintained files). All changes backward-compatible with legacy drafts and database schemas.

## Current implementation

- Next.js/React, strict TypeScript, Tailwind/PostCSS and shared design-token CSS.
- Canonical v1 document: packages/editor-core/document.ts. Shared SVG renderer: packages/template-engine/render.ts. Both device/account editors and downloads use it.
- Local IndexedDB adapter: apps/web/lib/storage.ts. Account API adapter: apps/web/lib/account-api.ts.
- Better Auth development accounts/sessions and SQL-backed multi-card event projects are exposed at /account. Owner checks, revision conflicts, origin/body bounds, auth attempt limits and redacted request logs exist.
- Drizzle schema/migrations are in packages/database. Persistent single-process PGlite is the local default; DATABASE_URL selects node-postgres. Engine selection does not migrate records automatically.
- Device drafts and account projects stay separate. Explicit copy/import creates a new account identity and never deletes the device source. Shared event defaults apply only to new cards.
- Existing studio supports gallery/filter/favorites, guided fields/themes/fonts, photo crop, autosave/reopen, duplicate/delete, session undo and PNG/JPG/raster RGB PDF.
- Catalog: 80 total templates (60 in catalog.json + 20 in royal-catalog.json; 57 photo-ready / 23 non-photo typographic & art) across 12 occasions, featuring 10 custom vector layout engines and authentic cultural Indian wedding designs.
- Portrait output is 1500 by 2100 pixels; PDF is raster RGB without bleed/CMYK/selectable text. Square/story preserve the whole portrait composition with matching background space. Fonts can vary across platforms.

## Operational constraints

- Never edit an applied SQL migration or clean .data/account secrets. Local secret/data must survive upgrades. Private records are not disposable caches.
- PUBLIC_DEPLOYMENT=true requires external PostgreSQL, HTTPS and a managed secret, and disables unverified email/password. Google is configured-only and live OAuth untested.
- Email verification/recovery, admin roles/MFA, object storage/media jobs, server export snapshots/workers, template publishing, production restore/load tests and hosting remain gates.
- Full Advanced Editor, sharing/RSVP, billing, multilingual, AI and collaboration remain later phases. Do not claim roundtrip/layer editing or public-hosting features exist.
- npm run dev starts the studio; npm run db:migrate applies/checks migrations. Stop the embedded server before running a separate migration process against its directory.
- Do not rebuild Next.js output under an active production preview. The browser runner owns an isolated database and generated secret and cleans up only its own directory.
- Validation baseline: typecheck/build, 20 unit/integration tests and 5 Chrome flows pass; the external PostgreSQL test is skipped when no service is configured. CI configuration exists, but no remote CI run is claimed.

## Cleanup

Maintained documentation now lives under docs; README.md is the entry point. Obsolete HTML/notes, initial audit history, duplicated feature/MCP plans and empty placeholder directories were removed only after full backup and dependency checks. The backup and file dispositions are recorded in [cleanup report](docs/development/cleanup-report.md). Permission/privacy rules from the retired developer-tool plan remain in AGENTS.md.

Run npm run check:structure after reorganizing: it checks documentation links, placeholder clutter and explicit imported dependencies. Strict unused-code compiler checks prevent unused imports from returning.

## Account security ? 2026-11-13

Account signup now requires verified email; local mailbox CLI replaces implicit signup login. Recovery resets revoke sessions; MFA and safe admin promotion implemented. Additive migration 0002; never edit 0001. Settings provide profile/password, device revocation, NDJSON export and permanent deletion. nodemailer10.5.0 pinned after audit; sharp0.35.5 available for media. Evidence and operational constraints: docs/operations/account-security.md. Continue automatically to media/export/publishing; live SMTP/OAuth/Postgres/proxy gates remain pending.

## Continuous delivery checkpoint 2026-11-13

User authorizes automatic sequential phases after tests/docs, without phase-start confirmations. Local security/media/export/publishing and available hardening now implemented. Six additive migrations:0001 unchanged;0002role/MFA;0003assets;0004jobs;0005templates;0006asset FK/owner trigger. Dependencies nodemailer10.5.0,sharp0.35.5,playwright-core1.65.0. Latest31 unit/integration+8 real Chrome tests pass; one external PostgreSQL case skipped; structure/type/build pass; runtime audit zero. Authoritative docs:docs/development/delivery-2026-11-13.md, phase-status.md and docs/operations/recovery-and-release.md.

Signup now requires verification; npm run mail:preview -- EMAIL reads local capture; public SMTP needs SMTP_URL+MAIL_FROM. Account settings:profile/password/devices/export/delete/TOTP/backup codes/unused-photo cleanup. admin:promote requires verified email+MFA and revokes sessions; stop embedded web server before CLI. /admin creates immutable JSON versions/provenance and publishes/withdraws. No real account was promoted/deleted.

Documents pin optional templateSnapshot and stored photo.data may be asset:UUID. APIs hydrate owned bytes; UI applies normalized saved bytes. Private filesystem defaults .data/media and .data/exports; public web/worker need shared durable private mounts (S3 not implemented/claimed). Jobs snapshot embedded SVG/revision/hash/template/renderer, bound idempotency,3 attempts/120sec leases/7-day expiry/50 jobs/account. Local in-process worker; standalone worker:exports requires network PostgreSQL and controlled installed Chrome. Old snapshots survive template withdrawal; never roll back to an app lacking asset/snapshot support.

Encrypted offline local recovery command:recovery -- create --offline / restore ARCHIVE --offline, managed BACKUP_ENCRYPTION_KEY64hex, server stopped, fresh restore directory only. Database/photo/secret restore and tamper/overwrite tests pass. storage:maintain previews; --apply mutates; embedded requires --offline; keeps fresh/live/unknown files. Original full backup remains intact.

MANDATORY NEXT GATE Phase7 OPEN:actual hosting/region/Postgres/SMTP/storage/Google credentials, controlled licensed fonts/browser, distinct artwork/rights/policies and human UAT plus real production restore/load/staging evidence. check:deployment intentionally fails absent config. Fonts still Georgia/Arial fallback, not pinned embedded assets. Phase8 Advanced/history then9sharing/RSVP then10billing stay queued until MVP gate passes; pricing/gateway and optional growth unresolved. No .git/remote, PR/merge/remoteCI/deployment/provisioning/live payments claimed.

## Royal Indian collection delivered (2026-11-13)

User explicitly approved collection expansion independently of deployment gates. Added20 original image_gen backgrounds (two per ten requested categories),20 thumbnails and2 fictional preview portraits under apps/web/public/royal; original50 retained,total70 (49 photo-capable/21 non-photo). See docs/design/royal-collection.md, prompt set and SHA256/source-file manifest. Gallery Royal collection filter; independent bride/groom uploads/crops; Shaadi/Haldi/Mehndi/Sangeet/Sagaai heading presets; editable fields/fonts/text-frame-panel palettes. Demo portraits are gallery/detail only, never saved user data; final royal downloads require both uploads.

Canonical schemaVersion1 adds optional portraits and royal template metadata/photoBoxes; shared renderer embeds full trusted artwork for downloads/worker snapshots. Async preview caches public artwork and uses thumbnail variants. Migration0007 creates per-slot asset references/owner trigger/deferred FK; private hydration, copies/account export/cleanup handle both photos. Legacy documents/old migrations preserved; worker bundle must include public/royal art files.

Validation:33 unit/integration+9 Chrome tests pass; one network PostgreSQL test skipped. Royal E2E actually opens/customizes/uploads/crops/saves/exports all20 and reopens, alternating desktop/mobile. Royal server PNG equals browser pixels and real PDF works. Allsizes canonical proofs and visual contact-sheet inspection done. Fixed new selector accessible name plus pre-existing mobile Back button name exposed by these tests. Type/build/structure pass. Current docs/PLAN updated. Overall public deployment gates from previous checkpoint remain open; this collection is implemented locally, no production publishing/provisioning.

## Wedding template catalog enhancement & luxury collection (2026-11-13)

User explicitly authorized comprehensive upgrade of the Template Catalog: enhancing/redesigning existing templates and adding new modern, professional, premium Indian wedding invitations.
- Renderer upgraded (`packages/template-engine/render.ts`) with 10 distinct vector layout architectures (layouts 0–9): Maharaja Darbar, Editorial Luxury, Mughal Garden, Imperial Peacock, Rajputana Jharokha, Vintage Shubh Patrika, Art Deco Gala, Sacred Lotus, Henna Arabesque, and Starlit Sangeet.
- Added dynamic auspicious top badges (Ganeshaya Namaha, Haldi Utsav, Mehndi Ki Raat, Sangeet Celebration, Royal Ring Ceremony, Shubh Vivah), 16-petal sacred mandala centerpieces for non-photo cards, and elegant silhouette couple placeholders when photos are empty.
- Curated catalog with authentic Indian couple names, heritage palace venues, realistic descriptions, and 10 brand-new luxury/traditional wedding event designs (IDs 51–60), expanding total template inventory to 80 (60 catalog + 20 royal; 57 photo, 23 non-photo).
- Studio editor upgraded with luxury wedding color palettes (Royal Ruby & Gold, Emerald & Gold, Turmeric & Marigold) and enabled wedding ceremony preset switching across all wedding cards.
- Quick wedding category navigation pills (`All designs (80)`, `👑 Royal collection (20)`, `✨ Shaadi & Weddings`, `💛 Haldi`, `🌿 Mehndi`, `🎶 Sangeet`, `💍 Sagaai & Ring`) and badges added in studio.
- Tests updated; all 33 unit/integration tests and browser checks pass. Backward compatibility preserved for existing drafts and royal collection.

## Canva-like interactive template editor (Phase 8 authorized — 2026-11-14)

User requested a full Canva-like visual design and editing studio for invitation templates:
- Key capabilities: direct on-canvas drag, move, resize (8 handles), rotate, align, duplicate, delete; rich text styling; photo crop/filters/frames; design elements library (traditional wedding ornaments, shapes, borders); layers management panel (reorder, lock, hide, depth); undo/redo; auto-save and export parity.
- Architectural plan divided into 6 sequential phases:
  1. Data model (`CanvasElement`), deconstruction engine (`decomposeTemplateToElements`), and field sync.
  2. Unified SVG renderer (`renderSvg`) support for element trees with export parity.
  3. Interactive canvas workspace (`InteractiveCanvas`) with transform handles, guides, snapping, and zoom.
  4. Left sidebar tool palette (Templates, Text, Photos, Elements, Backgrounds, Uploads, Layers).
  5. Context-sensitive properties inspector and top toolbar.
  6. Integration with persistence, dual-mode toggle, test suite validation, and regression checks.
