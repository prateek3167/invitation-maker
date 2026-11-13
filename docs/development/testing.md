# Testing Strategy

Latest Royal Indian extension:33 unit/integration tests pass, one optional external PostgreSQL test skipped;9 Chrome E2E tests pass. The royal flow opens, customizes, uploads two portraits, changes crops, saves and exports all20 designs while alternating desktop/mobile, then reopens saved crop state. Server PNG pixel parity and real PDF output also cover royal artwork/two portraits. All three sizes have canonical render proofs; original browser flows remain passing. See [collection guide](../design/royal-collection.md).

## Current executable checks (account foundation v0.2)

Run `npm run check:structure`, `npm run typecheck`, `npm test`, `npm run build`, then `npm run test:e2e` from the root. Structure checks verify local Markdown links, explicit imported dependencies and absence of empty placeholders; TypeScript also rejects unused locals/parameters. The browser suite uses installed Google Chrome, starts its own production preview on port 3005 and stops only its own server. Stop other previews on that port first. Do not rebuild `.next` while a production preview uses the previous build.

Current suites: 20 passing unit/integration tests and 5 Chrome flows, plus one optional network PostgreSQL test skipped without TEST_DATABASE_URL. They add actual embedded SQL migrations/checksums/disk persistence, auth hashing/session/revocation/rate-limit tests, owner-scoped event/card CRUD, revisions and HTTP security boundaries to the original document/export coverage. Browser runs get an isolated database and generated secret, never the development account database. Screenshots/traces and selected axe checks cover both studios. CI supplies a disposable PostgreSQL service; no remote run is claimed. Worker/admin/billing tests below remain future work.

## Unit Testing
Template JSON schema, field binding, text overflow rules, editor reducer/undo, role permissions, price entitlement rules, date formatting and asset validation. Suggested stack: Vitest + Testing Library.

## Integration Testing
API/database ownership, migrations, storage signed uploads, queue job lifecycle, export renderer parity, OAuth callback handling, payment webhook signatures and idempotency, email delivery adapter mocks.

## End-to-End Testing
Playwright desktop/mobile flows: browse → select → edit → photo upload → save → reopen → export; Advanced Editor transforms and mode roundtrip; admin publish → public gallery; public link revocation; guest access denial; payment sandbox checkout when enabled.

## Visual Regression
Golden image comparisons for representative photo/non-photo templates across portrait, square and story sizes; font embedding, Unicode rendering, safe zones, crop behavior and PDF output.

## Security & Performance
OWASP-style API testing, rate limits, upload fuzzing, authorization negative tests, dependency scanning, accessibility audits (axe), keyboard navigation, Core Web Vitals, export queue load, restore drill.

## Release Gates
All P0 acceptance criteria pass, no unresolved critical/high issues, export parity approved, backup restore proven, staging smoke tests pass, observability active.

## Defect Format
ID, environment, build, severity, reproduction steps, expected vs actual, screenshot/log reference, owner, fix version and regression test.

## Latest continuous-delivery verification

31 unit/integration+8 Chrome tests pass; one optional network PostgreSQL case skipped. Added verification/reset/MFA/admin/session tests, strict private image/ownership/FK/cleanup checks, immutable export idempotency/leases/retry and real PNG/JPG/PDF parity, full MFA-admin publish/replace/withdraw UI with axe, encrypted restore/tamper/overwrite checks and preview/apply maintenance safety. Test runner seeds only a disposable MFA fixture before web startup; no test HTTP backdoor. See [delivery record](delivery-2026-11-13.md). Static deployment checks deliberately fail missing public config; CLI guards deliberately reject unsafe/unconfigured execution. External staging, fonts/rights, human usability, load and production recovery remain gates.
