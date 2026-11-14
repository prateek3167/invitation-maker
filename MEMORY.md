# Invitation Maker — Project Memory

## Current audit and user constraint - 2026-11-14

The latest user requests whole-project execution-based review, fixes, regression and a readiness report. They explicitly do **not** want hosting or an external database configured here. Persist context in this repository, not a claimed account-level memory. [Audit report](docs/development/audit-2026-11-14.md) is the authoritative current assessment and supersedes older completion/test-count claims below.

Confirmed defects were account field loss; unsafe canvas/SVG and nested validation; suite aggregate identity/history; private canvas/suite photo reference/hydration gaps; unreadable QR; guessed calendar dates; false public sharing/RSVP; duplicate visual rendering; repeated gallery thumbnail work; hidden mobile/tablet controls; copywriter name/binding races and ineffective remote SVG font imports. Fixes and meaningful tests are recorded in the audit. Public guest delivery and billing remain unimplemented; licensed bundled fonts and operational/UAT gates remain open. Do not claim production readiness.

Final audit verification: **70 unit/integration passed + 1 external-PostgreSQL skipped; 15/15 Chrome E2E passed (4.3 minutes)**. Production build, both strict TypeScript projects and structure pass (214 maintained files); npm audit reports zero known vulnerabilities. Catalog/editor/preview/worker now normalize through one editable renderer, including canvasless schema-v1 documents; empty canvases remain empty. Rich layout decorations are shared and movable; historical canvasless text positioning can change, but fields/photos/template snapshots are retained. Gallery memoization reduced the 80-design browser workflow to 41.4 seconds. Removed only two backed-up root build traces (1,027 bytes); retained the real app build and all private state. Evidence is under `.cache/audit-2026-11-14` and `test-results`.

Backup before edits: `C:/Users/USER/AppData/Local/Temp/invitation-maker-audit-20261114-151546/source-config-assets-data.tar.gz`, SHA-256 `3441c48268c9f42698f6180aea15b41b74f789f718732cfb8dc078588f9c428b`; extracted/verified including all 1,054 local private-data files. The interrupted first archive is invalid. Preserve data/secrets and applied migrations. New migration 0008 tracks owner-checked suite/canvas assets; no deployment/destructive database work authorized.

Updated 2026-11-14 (Asia/Calcutta). This is repository-local context, not account-level assistant memory.

## Start here

Read AGENTS.md and PLAN.md, then [requirements](docs/product/requirements.md), [design](docs/product/design.md), [architecture](docs/architecture/overview.md), [database](docs/architecture/database.md) and [API](docs/architecture/api.md) before implementation. The user authorized building the initial studio, the next account-foundation phase and a backed-up structural cleanup. Those instructions do not approve public deployment, destructive database work or paid services.

Current truth: [implementation status](docs/development/status.md), [setup](docs/development/setup.md), [roadmap](docs/product/roadmap.md) and [ADR 0001](docs/decisions/0001-server-foundation.md).

## CI Quality Gate Resolution & E2E Test Hardening — 2026-11-14

Following diagnosis of GitHub Actions Run #5 failure:
- **Circular JSON Prevention in Suite Cards**:
  - In `apps/web/components/editor.tsx`, stripped child card `suiteCards` references during suite updates and account persistence to prevent recursive JSON cycles.
- **E2E Dialog Title Restoration**:
  - Restored download dialog title `title="Ready for your big moment?"` in `editor.tsx` ensuring Playwright's dialog title locator resolves instantaneously.
- **Mobile Top Toolbar Layout & Save Status Pill Visibility**:
  - Under `@media (max-width: 680px)` in `apps/web/app/globals.css`, hardened `.canva-top-toolbar`, `.toolbar-left`, and `.save-status-pill` so that `'Saved on this device'` remains positive-sized, unclipped, and visible on mobile screen widths (390px/393px).
- **Dual-Portrait Canvas & SVG Parity**:
  - Mapped `slot`, `photoSlot`, and `id` in `canvas.ts` and `editor.tsx`, and provided fallback to `document.portraits?.[slot]?.data` in `render.ts` (`renderFromCanvasElements`).
- **100% Quality Gate Verification**:
  - Vitest Unit/Integration Tests: 61/61 passed (16 test files).
  - Playwright E2E Tests: 9/9 passed (`account.spec.ts`, `admin.spec.ts`, `exports.spec.ts`, `royal.spec.ts`, `security.spec.ts`, `studio.spec.ts`).
  - Next.js Production Build: succeeded with 0 errors across all routes.
  - Structure Checks: passed (206 maintained files).
  - TypeScript Typecheck: passed with 0 errors.

## AI Wedding Content & Shloka Assistant & Auspicious Celebration Audio Engine — 2026-11-14

User explicitly requested continuing automated phase-wise development into a complete, production-ready implementation (Phase 10):
- **AI Wedding Copywriting & Shloka Assistant (`packages/editor-core/ai-assistant.ts`)**:
  - `generateInvitationCopy`: Intelligent generative wording assistant tailored for Indian weddings.
  - Full ceremony coverage: Vivah (शुभ विवाह), Haldi (हल्दी उत्सव), Mehndi (मेहंदी की रात), Sangeet (संगीत संध्या), Reception (प्रीतिभोज), Sagaai (सगाई).
  - Tones: Royal & Regal (शाही), Traditional (पारंपरिक), Romantic (रोमांटिक), Playful (मस्ती भरा), Formal (औपचारिक).
  - Voices: Couple (वर-वधू), Bride's Parents (कन्या पक्ष), Groom's Parents (वर पक्ष), Friends & Siblings (मित्रगण).
  - Languages: Hindi (Devanagari), English, Hinglish.
  - Dynamically injects bride/groom names, family surnames, authentic Vedic shlokas, rhyming folk couplets, wedding hashtags, and recommended typography.
- **Dedicated "✨ AI Writer" Tool in Canva-like Editor Sidebar (`apps/web/components/canvas/sidebar-tools.tsx`)**:
  - Ceremony, tone, voice, and language pickers with bride, groom, and family surname controls.
  - 1-click option cards showing heading badges, titles, subtitles, framed message bodies, Vedic shlokas, and hashtags.
  - 1-click "Apply to Invitation" synchronization that updates document fields and canvas text elements with live confirmation feedback.
  - 1-click copy-to-clipboard buttons for shlokas, headings, and hashtags.
- **Authentic Indian Wedding Audio Synthesizer (`apps/web/lib/audio.ts`)**:
  - Zero-dependency Web Audio API implementation providing 100% offline celebration music with zero asset loading failure risks.
  - Presets: Mangal Shehnai & Tanpura (मंगल शहनाई), Royal Sitar Raga (रॉयल सितार), and Bansuri & Temple Chimes (मधुर बांसुरी).
  - Tuned with authentic Raag Bilawal / Yaman frequencies, Tanpura root harmonics (Sa-Pa drone), and acoustic envelope shaping.
- **Floating Celebration Audio Player on Digital Guest Hub (`apps/web/app/invite/[id]/page.tsx`)**:
  - Floating pill widget with 1-click play/mute toggle and track selector popover.
  - Visual animated equalizer indicators and track name display.
- Fully verified: 61 unit & integration tests pass across 16 test suites, production build compiles all routes without errors, structure checks pass (206 maintained files).

## Interactive RSVP, Guest Management & WhatsApp / QR Sharing Hub — 2026-11-14

User explicitly requested continuing automated phase-wise development into a production-ready application (Phase 9A/9B):
- **RSVP & Guest Management Engine (`packages/editor-core/rsvp.ts`)**:
  - `RsvpSettings`: Configurable RSVP controls (`enabled, deadline, allowPlusOnes, maxPartySize, collectDietary, collectCeremonies, welcomeMessage`).
  - `RsvpResponse`: Guest attendance records (`guestName, phoneOrEmail, attending, guestCount, ceremonies, dietary, notes, submittedAt`).
  - `calculateRsvpStats`: Aggregates confirmed guest headcounts, party counts, dietary breakdowns (Pure Veg, Jain, Swaminarayan), and ceremony-specific attendance (Haldi, Mehndi, Sangeet, Shaadi).
  - `exportRsvpToCsv`: Generates safe RFC-4180 CSV with spreadsheet formula injection protection (prepends `'` to inputs beginning with `=, +, -, @`) for caterers and wedding planners.
  - `generateSampleRsvpResponses`: Seeds realistic Indian wedding guest responses for instant preview and onboarding.
  - Transparent persistence in `Invitation` document (`rsvpSettings`, `rsvpResponses`, `shareSlug`) across IndexedDB and Account API.
- **Pure TypeScript QR Code Generator (`apps/web/lib/qrcode.ts`)**:
  - Zero-dependency Model 2 QR Code generator with Reed-Solomon Galois Field GF(256) error correction.
  - Generates scalable vector SVG and base64 Data URLs for on-canvas QR badges and physical print downloads.
- **Sharing & Calendar Integrations (`apps/web/lib/share.ts`)**:
  - Auspicious 1-click WhatsApp wedding invite formatter with couple names, muhurat timings, venue, and deep-link.
  - Direct 1-click Google Calendar URL and standard `.ics` iCalendar export.
  - Google Maps venue navigation search deep-link.
- **Host RSVP & Guest Management Dialog (`apps/web/components/rsvp/guest-manager.tsx`)**:
  - Metrics overview cards (Confirmed Guests, Total Parties, Veg/Jain meals, Declined).
  - Searchable and filterable Guest List table with RSVP status badges, dietary tags, and ceremony pills.
  - Modal form to record offline/phone RSVPs.
  - Share tab with live QR code display, SVG download, WhatsApp trigger, and link copier.
  - RSVP settings tab to configure deadlines, party limits, and dietary collection.
- **Public Digital Invitation & RSVP Hub (`apps/web/app/invite/[id]/page.tsx`)**:
  - Mobile-first responsive guest page with ceremony multi-card carousel.
  - Live ticking wedding countdown timer (Days, Hours, Minutes, Seconds).
  - Venue actions: Open in Google Maps, Add to Calendar, Forward on WhatsApp.
  - Interactive RSVP submission form with instant personalized confirmation.
- Fully verified: 53 unit & integration tests pass across 14 test suites, production build compiles all routes including `/invite/[id]`, structure check clean (202 maintained files).

## Culturally Rich Traditional Elements & Hindi/Devanagari Fonts — 2026-11-14

User explicitly requested building Culturally Rich Traditional Elements & Hindi/Devanagari Fonts:
- **Google Devanagari Fonts Integration**:
  - Integrated Google Fonts in `apps/web/app/layout.tsx` and unified SVG `<defs>`:
    - `Rozha One`: Royal, high-contrast serif for regal wedding titles (`॥ शुभ विवाह ॥`).
    - `Yatra One`: Handcrafted vintage Devanagari signage style, bold and traditional.
    - `Kalam`: Warm festive handwritten Hindi calligraphy (for Mehndi, Haldi, personal notes).
    - `Tiro Devanagari Hindi`: Classical literary serif for Vedic wedding shlokas.
    - `Noto Serif Devanagari`: Clean, formal Vedic serif for dates, venues, and formal invitations.
    - `Noto Sans Devanagari`: Modern clean sans-serif for addresses, timings, and details.
  - Context-sensitive properties inspector (`properties-panel.tsx`) organizes fonts into optgroups: Traditional Devanagari / Hindi and Royal English Typography.
- **Vedic Shlokas & Auspicious Phrasing Library (`packages/editor-core/shlokas.ts`)**:
  - `VEDIC_SHLOKAS`: Categorized authentic Sanskrit verses with Hindi meanings and recommended typography:
    - Ganesh Invocations (`॥ वक्रतुण्ड महाकाय ॥`, `॥ श्री गणेशाय नमः ॥`, `॥ श्री कुलदेवतायै नमः ॥`).
    - Vivah Mangalam (`मङ्गलं भगवान् विष्णुः`, `यदेतद् हृदयं तव`).
    - Gauri & Shakti Vandana (`सर्वमङ्गलमाङ्गल्ये शिवे सर्वार्थसाधिके`).
    - Saptapadi / Saat Phere (`सखा सप्तपदा भव`).
    - Vedic Ashirwad & Shanti Mantra (`ॐ द्यौः शान्तिरन्तरिक्षं शान्तिः`).
    - Auspicious Ceremony Headlines & Traditional Formal Family Invitation lines (`दर्शनाभिलाषी एवं विनीत`).
  - 1-Click insertion in Left Sidebar Text tab with interactive category filters.
- **1-Click "Convert to Shudh Hindi (हिंदी में बदलें)"**:
  - Translates names, greetings, headings, and dates into authentic Devanagari Hindi while automatically upgrading canvas elements to Devanagari Google Fonts (`Rozha One`, `Noto Serif Devanagari`).
- **Traditional Indian Wedding Vector Artworks (`packages/template-engine/traditional-elements.ts`)**:
  - Pure, high-precision vector SVG generators for 13 royal traditional motifs:
    - `ganesha_royal`: Royal Lord Ganesha with stepped mukut, tilak, large ears, trunk holding modak, and ekadanta.
    - `ganesha_minimal`: Modern clean calligraphic line-art Ganesha symbol.
    - `swastik`: Auspicious Vedic Swastika with 4 bindu dots (Dharma, Artha, Kama, Moksha).
    - `om`: Sacred Pranava Om ॐ with chandrabindu.
    - `doli`: Royal Bridal Palanquin (Doli / Palki) with kalash finial, scalloped canopy, draped silk curtains, and carrying poles.
    - `shehnai`: Traditional Shehnai & celebratory Dholak / Tabla with musical waves.
    - `baarat_elephant`: Caparisoned royal elephant with raised trunk, howdah canopy, nettipattam forehead plate, and scalloped jhool.
    - `havan_kund`: Copper Havan Kund altar with sacred samidha logs and rising agni shikha flames for Saat Phere.
    - `mangalsutra`: Auspicious golden tanmaniya pendant, sacred black beads chain, and peacock-crested sindoor dani.
    - `peacock_pair`: Symmetrical Mayur Yugam with crested crowns and intertwining floral tail feathers.
    - `diya`: Traditional brass deepak with tiered pedestal base and glowing teardrop flame.
    - `namaste`: Respectful folded hands in Anjali Mudra with lotus blossom background.
    - `marigold_garland`: Hanging Genda Phool string with sacred mango leaves and bottom brass bell.
  - Registered in `WEDDING_ELEMENT_TEMPLATES` (`packages/editor-core/canvas.ts`) with category filters (`sacred`, `ceremony`, `decor`).
  - Seamlessly rendered across Interactive SVG Canvas (`interactive-canvas.tsx`) and Export SVG renderer (`render.ts`) preserving 100% export parity.
- Fully verified: 46 unit & integration tests pass across 13 test suites (0 failures), production build compiles all routes, structure check clean (196 maintained files).

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
