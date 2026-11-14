# UI/UX and Visual Design System

## Current audit - 2026-11-14

Visual artwork now comes from the shared canonical renderer with separate interaction targets. Mobile mode/history controls and tablet properties are available; suite actions support focus/touch. Guest management explicitly distinguishes manual entries/device preview from unimplemented online delivery. [Audit and UI acceptance](../development/audit-2026-11-14.md).

## Implemented royal extension (2026-11-13)

Twenty new original artworks supply rich palace/garden/peacock/darbar/jharokha/mandap/scroll/lotus/procession scenes, with two distinct variations per category. Individually aligned arch/oval portraits overlay each artwork; editable typography and color-controlled stationery panels preserve readability. A gallery collection/category selector and independent Bride/Groom controls reuse the current design system. See the [collection guide](../design/royal-collection.md), [prompt set](../design/royal-art-prompts.json) and [asset manifest](../design/royal-art-manifest.json).

## Design Principles
Elegant, celebratory, accessible, mobile-first, fast to personalize, consistent preview-to-export. Avoid making all occasions look like weddings.

## Screens
1. Landing: hero, occasion categories, trending templates, how it works, trust and CTA.
2. Gallery: filters for occasion, photo/non-photo, orientation, color, premium/free, search, sort.
3. Template detail: large preview, variants, included photo slots, format, start button.
4. Simple Editor: form on left, responsive preview on right, step-by-step event details, photos, colors, final review.
5. Advanced Editor: assets/tools left, center canvas, layer/property inspector right; undo/redo, zoom, snap guides.
6. Projects: event collections, cards, draft/published statuses, duplicate, rename, delete.
7. Account/billing: profile, purchases, download history, data controls.
8. Admin: template upload, schema validation, sample preview, publishing, usage overview.
9. Public invitation: responsive design, event details, map link, optional RSVP.

## Visual Tokens (Proposed)
- Primary: deep plum `#542B48`; accent: coral `#E98A79`; secondary: gold `#C5A46D`.
- Background: warm ivory `#FFF9F5`; foreground `#28202B`; success `#287D62`.
- Type: clean UI sans-serif; decorative fonts only within invitations and with licensed font assets.
- 8px spacing rhythm, rounded controls, visible keyboard focus, AA contrast for controls.

## Template Design Matrix
50 concepts total: Wedding 8, Haldi 4, Mehndi 4, Sangeet 4, Engagement 4, Birthday 6, Anniversary 4, Baby Shower 4, Housewarming 3, Corporate 3, Graduation 3, Festivals 3. Target mix: 29 photo-ready, 21 non-photo.

**Style families:** editorial minimal, botanical watercolor, royal heritage, contemporary typography, vibrant geometric, dark luxury, pastel illustration, cinematic photo, festive motifs, clean corporate. Each concept requires unique composition, typography hierarchy and decoration treatment; palette changes alone do not count as distinct templates.

## Editable Template Requirements
Text fields, image frames, background, shapes, safe zones, print bleed where applicable, z-order, fonts, theme tokens, field constraints, optional sections, text overflow handling, mobile thumbnail and export dimensions.

## Responsive Behavior
Desktop: side-by-side editor and preview. Tablet: collapsible property panel. Mobile: tabbed editing tools with persistent preview and save action. Maintain aspect ratio and zoom rather than clipping the canvas.

## Accessibility & Quality
Keyboard-accessible controls, labels, focus states, image alt text, reduced-motion preference, readable contrast, no hidden text behind photo frames, locale-aware dates. Validate Hindi font shaping before language launch.

## Approval Gates
Approve home/gallery, Simple Editor, Advanced Editor, mobile flow, sample photo and non-photo templates, and final export proofs before full implementation.
