# Product Requirements Document (PRD)

## Current audit scope - 2026-11-14

Catalog: **80 designs (60 base + 20 royal; 57 photo-capable / 23 non-photo)**. Guided/visual editing, suites and manual guests exist; public publication/remote RSVP and billing do not. The user requests local testing without hosting or external database setup. [Current audit and acceptance boundaries](../development/audit-2026-11-14.md) supersede older counts and completion claims below.

## Approved Royal Indian collection extension (2026-11-13)

The user authorized20 additional rich illustrated wedding designs:two unique backgrounds in each of ten royal/traditional Indian categories. Total catalog:70 (49 photo-capable,21 non-photo); original50 remain. Royal templates have independent bride/groom uploads/crops, editable names/date/time/venue/message/fonts/palette and Shaadi/Haldi/Mehndi/Sangeet/Sagaai heading presets. Gallery/demo images must not become saved user photos. Existing auth/privacy/draft/export functionality remains required. See [collection specification/provenance](../design/royal-collection.md).

## Problem & Users
Creating coordinated, personalized invitations across multiple occasions is expensive or requires design expertise. Users need a mobile-friendly workflow for printable and shareable invitations.

**Personas:** guest (browse), registered user (create/manage), admin (moderate/publish), optional professional designer (future). Audiences include families, couples, event planners, businesses.

## Core Features
- 50 initial design concepts: 29 photo-ready and 21 non-photo, spanning wedding, haldi, mehndi, sangeet, engagement, birthday, anniversary, baby shower, housewarming, corporate, graduation and festivals.
- Template browsing, search, event/style/photo filters, previews.
- Simple Editor: guided form fields, upload photo, automatic placement, real-time preview.
- Advanced Editor: canvas selection, text/image editing, transforms, layers, undo/redo, alignment, fonts and colors.
- Projects with multiple invitation cards and shared event details.
- Draft autosave, versioning, download PNG/JPG/PDF, sharing and optional RSVP.
- Account management, admin template publishing, moderation, premium purchases.

## User Journeys
1. Guest: open home → filter templates → preview → start editing → authenticate when saving or purchasing → export/share.
2. Registered user: sign in → projects → create event → select template → Simple Editor → optional Advanced Editor → preview → save/export.
3. Multi-event: create wedding project → add Haldi/Mehndi/Sangeet/Wedding cards → reuse couple and venue details → export each.
4. Admin: sign in with elevated role → create/upload versioned template → test sample data and exports → publish → monitor.
5. Recipient: open shared invitation link → view details → optionally RSVP (only if enabled by host).

## Pages & Roles
| Page | Guest | User | Admin |
|---|---|---|---|
| Home / Gallery / Template detail | View | View | View |
| Editor | Trial (ephemeral) | Save/edit own | Manage own |
| My Projects | No | Own | Own |
| Shared invitation | Link-based | Link-based | Link-based |
| Billing / Account | No | Own | Own |
| Admin templates / users | No | No | Yes |

## MVP Scope
**Included:** responsive home/gallery, initial curated templates, email/Google auth, Simple Editor, photo upload, draft save, reliable PNG/PDF export, basic project management, admin publishing, cloud deployment. Advanced Editor foundation may ship as a controlled beta after core exports are reliable.

**Post-MVP:** full Advanced Editor, payments/subscriptions, RSVP, multi-language, collaborative editing, video invitations, AI design generation, marketplace.

## Acceptance Criteria
- A user can select a template, fill mandatory fields, upload an image where supported, save and reopen a draft.
- Export matches preview in supported dimensions; fonts and images render consistently.
- Users cannot access other users' private projects.
- Switching editor modes preserves project content and supported customizations.
- Admin can publish a versioned template without changing application code.

## Open Decisions
Pricing, payment gateway, initial languages, print formats, template artwork licensing, public link expiry, AI provider, and initial hosting region require approval.
