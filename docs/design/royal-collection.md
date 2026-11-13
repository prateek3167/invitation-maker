# Royal Indian wedding collection

Twenty new illustrated designs expand the catalog from 50 to 70. Each of the ten requested categories has two separately generated original backgrounds, individually aligned portrait placements and realistic editable wedding details. This collection is included in the current studio; premium describes its art direction, not a new paid entitlement.

| Category | Variation one | Variation two |
|---|---|---|
| Royal Couple Portrait | Gulabi Sheesh Mahal | Noor-e-Mahal |
| Mughal Garden | Charbagh Reverie | Moonlit Shalimar |
| Imperial Peacock | Neelam Mayura | Emerald Mor Chowk |
| Maharaja Darbar | Darbar of A Thousand Lights | Amber Sheesh Darbar |
| Rajputana Jharokha | Gulabi Jharokha | Jaisalmer Sandstone |
| Royal Palace Heritage | Udaipur Lake Palace | Rajwada Grand Entrance |
| Golden Mandap | Marigold Suvarna Mandap | Gulab Mandap at Dusk |
| Vintage Royal Scroll | Kishangarh Heirloom | Mewar Painted Chronicle |
| Royal Lotus Garden | Padma Mahal | Kamal Bagh at Dawn |
| Regal Elephant Procession | Shahi Baraat | Gajraj Palace Procession |

## Using the collection

Select Royal collection above the gallery to see all20 designs or one category. Open a preview, then Make it yours. Gallery/detail previews show clearly fictional demonstration portraits; these examples are not inserted into saved drafts. In the editor upload bride and groom photographs independently. Each portrait has separate zoom and horizontal/vertical crop controls. Both photos are required for final downloads.

Edit bride/groom names, heading, date, time, venue and message. Wedding event presets support Shaadi, Haldi, Mehndi, Sangeet and Sagaai; choosing a preset updates the heading while retaining your other custom details. Typography and color stories remain editable. Palettes affect text, portrait outlines and the stationery panel; they preserve the original detailed background painting. Portrait, square and story formats preserve the complete composition with matching surrounding space.

## Art assets and provenance

Built-in image_gen produced the backgrounds and fictional demonstration portraits. No stock palace photograph or real couple photograph was downloaded. These are original heritage-inspired imaginative scenes, not claims of exact historical reconstruction. The parameterized [prompt set](royal-art-prompts.json) records categories, scene descriptions, constraints and generation instructions. The [asset manifest](royal-art-manifest.json) records all20 source-generation files, output dimensions/bytes/SHA-256 and the demonstration portrait source. Original generator outputs remain intact outside the source tree.

Production assets live in apps/web/public/royal/:20 full1200x1680 WebP backgrounds,20 lightweight400x560 thumbnails and2 fictional portrait samples. Full backgrounds and thumbnails serve different required display/export purposes. Only optimized production assets are kept in the project; the verified redundant working PNG copy was removed after comparing it with its preserved generator original.

## Document, storage and rendering contract

Restart an already-running development server after updating so database initialization can apply migration0007. For embedded storage, stop the server before using the migration CLI; never open the same embedded database in two processes. Network deployments apply migrations before compatible application rollout. No live database was modified during implementation; validation used isolated databases.

Canonical schemaVersion1 remains backward compatible. Legacy documents retain photo; royal documents add optional portraits with bride and groom Photo/null entries and immutable templateSnapshot. Royal metadata permits only known artwork keys, approved categories, frame shapes, bounded compositions and validated portrait boxes. Text is escaped, colors constrained, private photo ownership checked and arbitrary asset URLs/executable SVG rejected.

The preview loader caches trusted local art and embeds its bytes into canonical SVG. Downloads load the full artwork, not the thumbnail. The server embeds the identical full artwork in immutable export snapshots, so workers require no external asset fetch. Worker packaging must include apps/web/public/royal/*.webp; Next route tracing includes those files. Existing worker network isolation stays enabled. PNG/JPG/raster RGB PDF use the shared renderer; professional CMYK/bleed is unchanged.

Additive migration0007_royal_portrait_assets.sql tracks independent private assets per invitation/slot with owner checks and deferred references. Private hydration, account data export, duplication/import and quota handling include both portraits. Unused-photo cleanup preserves either referenced slot; deleting a portrait/card releases that reference. Existing auth, single-photo/non-photo templates and account data remain compatible. Do not edit old migrations or discard live private files during rollback. An older app that does not understand royal metadata/portraits is not a safe editor for these new drafts; retain the compatible release/data until a planned rollback is verified.

## Validation

See tests/integration/royal.test.ts for the inventory, unique artwork, all-format schema/render proofs, owner isolation, independent crop persistence, cleanup and embedded job snapshot tests. tests/e2e/royal.spec.ts opens every new design from the real gallery, edits it, uploads both photos, verifies saves, exports real PNG files and reopens the saved crop state while alternating desktop/mobile. The export browser suite separately verifies royal PNG pixel parity and real worker PDF output. Final checks pass: 33 unit/integration tests, 9 Chrome E2E tests, strict type checks, production build, structure checks and zero audit vulnerabilities. One optional network PostgreSQL test remains skipped. Twenty actual edited PNG proofs were inspected as a rendered contact sheet.

Public staging/provider, font licensing/pinning, policy/UAT and overall deployment gates remain as documented in ../operations/recovery-and-release.md; this authorized collection increment does not claim deployment.
