# Repository cleanup — 2026-11-13

Scope: verify the full project directory, preserve a complete backup, remove proven obsolete/generated material, organize maintained documentation, and rerun the existing application checks. This cleanup does not authorize or certify a production launch.

## Backup and preserved data

- Full archive: `C:/Users/USER/AppData/Local/Temp/invitation-maker-backup-20261113-130504/invitation-maker-before-cleanup.tar.gz`.
- Size: 718,209,964 bytes; 37,834 archive entries.
- SHA-256: `10f165a55c86ced2cb9c17454a578a00d6422bd3b0953eb69122965fd2501d37`.
- Archive creation/listing and required package/source/migration entries were verified before cleanup. The archive includes hidden configuration, persistent `.data`, installed dependencies and generated files, not just tracked source. `backup-record.json` alongside it records verification.
- A separate pre-cleanup hash inventory contains 90 non-data files (including placeholders/generated type metadata) and 1,020 persistent-data files. No account record or auth secret is a cleanup candidate.

The archive is outside the working project and may contain private data. To restore, stop any application process, extract into a separate empty directory, verify its contents, and deliberately select the desired source/data version. Do not extract over a running account database or mix incompatible embedded database files. No automatic overwrite or destructive restoration was performed.

## Verification and disposition

| Candidate | Verification | Action |
|---|---|---|
| Original standalone HTML mockup and its notes | No maintained source/configuration imports or links to the HTML; live catalog is self-contained JSON and Next.js routes are the application entry points | Remove from working tree; original is preserved in full backup |
| Initial repository-review snapshot | Describes the obsolete planning-only/32-file baseline; applicable remaining risks are already in current status/roadmap | Remove redundant history from working tree |
| Separate feature catalog | Workflow/priorities duplicate the retained requirements and roadmap feature matrix | Remove; use the canonical roadmap/requirements |
| Standalone optional MCP plan | No application integration/configuration implements it; preserve its least-privilege/privacy/approval rules in root AGENTS.md | Remove duplicate document after consolidation |
| Fifteen `.gitkeep` files | Every file is zero bytes; populated directories have actual source/tests; unimplemented directories contain nothing else | Remove placeholders and only the now-empty directories |
| Empty apps/api, apps/worker, packages/ui, packages/shared, assets hierarchy | No source/build import references; roadmap describes them only as future options | Remove empty scaffolding; create future modules when implemented |
| Root documentation clutter | Specifications, architecture, setup/status/testing and runbooks are maintained and necessary | Move into docs/product, docs/architecture, docs/development and docs/operations; rename READ.md to README.md |
| Historical status/memory sections | Repeat resolved prototype defects and obsolete statements that accounts/APIs are absent | Consolidate into current status and concise root memory; preserve unresolved release gates |
| Generated cache, smoke database and old browser artifacts | Scripts regenerate these; no active configured account data is stored there | Remove verified disposable cache/test output; tests may regenerate ignored artifacts |
| Unused icon import | Strict TypeScript unused-code analysis reports only ArrowDown | Remove import; enable noUnusedLocals/noUnusedParameters |
| Package dependencies | Source imports, dynamic PDF import, framework runtimes, CSS/PostCSS configuration, test tools and type packages all have consumers | Keep required dependencies; explicitly declare the already-used @next/env instead of relying on transitive hoisting |
| node_modules, lockfile, next-env declarations and current Next build | Installed dependencies, reproducible resolution, compiler integration and npm start output are functional resources | Preserve; do not manually delete third-party files to shrink a dependency tree |
| SQL migration and `.data` | Required schema/checksum history and persistent accounts/sessions | Preserve byte-for-byte; do not rename migration or database storage paths |

The two migration launcher files have different roles: the JavaScript entry compiles the typed CLI, and the TypeScript CLI loads environment settings and executes the shared migrator. Neither is an obsolete duplicate. Application route groups, components and shared source modules were already separated by responsibility; they remain in place to avoid unnecessary runtime import churn.

## Maintained layout

```text
README.md, AGENTS.md, PLAN.md, MEMORY.md
apps/web/                 Next.js routes, components, client/server adapters and configuration
packages/database/        SQL schema, migrations and owner-scoped domain operations
packages/editor-core/     Canonical invitation document and validation
packages/template-engine/ Catalog concepts and shared renderer
scripts/                  Migration, browser-test and structure-check tooling
tests/unit/               Document and request-boundary tests
tests/integration/        Browser storage, SQL/auth/persistence and optional live PostgreSQL tests
tests/e2e/                Real Chrome account/local-studio flows
docs/product/             Requirements, design and full roadmap
docs/architecture/        Architecture, API, database, authentication and integration specifications
docs/decisions/           Architecture decisions
docs/development/         Setup, testing, current status and this cleanup record
docs/operations/          Troubleshooting/runbook
.github/workflows/        CI checks
.data/                    Ignored persistent local accounts/secret; never source-cleaned
```

Generated `.cache`, `.next` and browser artifacts remain ignored and are recreated as needed. A production build output and installed dependencies are not disposable source clutter when the application needs them to run.

## Validation

- Full backup SHA/listing verification: passed before removals.
- Removal/move audit: 20 verified file removals (5 obsolete files and 15 empty placeholders), 13 maintained document moves, 9 empty directory removals and no unexpectedly missing original files.
- Generated cleanup: removed the old 924,222,475-byte cache and 566,066-byte browser-artifact tree; verification creates new ignored temporary output, which is handled separately. The installed dependency tree and usable production build are retained.
- Structure checker: passed for 71 maintained files. All local Markdown links and explicit imported package dependencies resolve; no `.gitkeep` remains.
- Dependency tree: npm ls --depth=0 passed. Every dependency was checked against source, dynamic import, framework, CSS/configuration, command or type usage. No required runtime/tool dependency was removed; @next/env is now explicit. Audit reported zero vulnerabilities.
- Typecheck: passed with unused-local and unused-parameter checks enabled.
- Unit/integration suite: 20 passed; one optional external PostgreSQL test skipped without TEST_DATABASE_URL.
- Database migration CLI: passed twice against a newly isolated smoke database after clearing its generated compiler cache.
- Production build: passed, preserving all app/account/API routes.
- Real Chrome suite: 5 passed, covering the local editor/save/photo/export workflows and account/session/multi-card/import/ownership/CSRF/revision behavior. Selected accessibility checks are part of these tests.
- Protected-file comparison: all 1,020 original .data files, the SQL migration, catalog and environment example match their original SHA-256 hashes (1,023 protected files checked).
- Runtime code remained in its existing architecture. The only application import change removes an unused icon; the browser-test helper now creates its disposable cache parent on a clean checkout. Next.js refreshed its generated type declaration during the verified build.

Post-cleanup screenshots/result metadata and protected-file inventories are saved alongside the external backup under validation-after-cleanup rather than retained as source clutter. Future tests regenerate ignored test-results as usual. No deployment, vendor provisioning, persistent-data mutation or SQL schema change was part of the cleanup. Passing these checks does not resolve the existing email/media/admin/hosting/production-database release gates.
