# Setup Guide — Account Foundation v0.2

The Next.js application includes the device-local studio and an authenticated server-backed event workspace. Local setup needs no paid services or external database.

## Run the application

From the repository root, with a supported Node.js LTS release (22 or 24 recommended) and npm:

```powershell
npm ci
npm run dev
```

Open http://127.0.0.1:3000. Use the cloud-shaped **Account studio** link in the header (or `/account`) to register an account and create event collections. Device projects remain available separately under My projects. An npm cache is configured inside `.cache/`.

The first account request initializes a real embedded PostgreSQL engine and applies checked-in migrations. Its single-process data directory is `.data/postgres`; a generated local auth secret is stored separately in `.data/local-auth-secret`. Both are ignored by Git. Keep them private, preserve them across restarts, and do not run multiple server processes against the same embedded directory. Deleting the database removes accounts/projects; deleting the secret invalidates existing sessions.

Email/password accounts work for local development with a minimum 12-character password. Email verification and password-reset delivery are not implemented yet. This is not a public registration release.

```powershell
npm run typecheck
npm run check:structure
npm test
npm run build
npm start
```

Apply/check database migrations explicitly with `npm run db:migrate`. The command loads environment files from `apps/web`, uses the same SQL/checksum ledger as server initialization and can be repeated safely. Stop the local server first when using embedded storage. Do not edit an applied migration; add a new numbered migration instead. Public deployments use the configured PostgreSQL connection rather than an embedded directory.

Production browser tests require an installed Google Chrome and a successful build:

```powershell
npm run build
npm run test:e2e
```

Playwright starts a separate production preview on port 3005 with a fresh isolated database and generated test-only secret. It deletes only that test directory after stopping its owned server; your `.data` account database is untouched. Screenshots/failure traces are written to ignored `test-results/`. The default app port is 3000; if changing it, also set PUBLIC_APP_URL to that exact origin in the app environment. Auth and API write checks intentionally reject a localhost/127.0.0.1/port mismatch.

## Implemented and deferred

Implemented: responsive catalog, 50 concept variants across 12 occasions (29 photo-ready / 21 non-photo), search/filter/sort, detail dialog, favorites, guided editing, colors/fonts/formats, photo processing/crop, autosave/reopen, project duplicate/delete, undo, PNG/JPG and raster RGB PDF download. No remote fonts/images are needed.

Drafts and photos use IndexedDB in the current browser profile; favorites use localStorage. This is not authenticated private cloud storage. Clearing site data removes local drafts. Downloads are independent copies. Do not put sensitive data into a shared browser profile.

PDF uses the same rasterized SVG composition as the image outputs. Portrait is 1500×2100 pixels and 5×7 inches in PDF at 300dpi equivalence, with no bleed. Square/story preserve the full portrait composition with matching background space; they are not separate hand-designed layouts. System fonts can vary across operating systems. No CMYK/PDF-X or selectable PDF text is promised.

Account studio adds working registration/sign-in/session/logout, owner-scoped multi-card event projects, shared defaults for new cards, server autosave and explicit device-draft copying. Changing shared defaults never overwrites existing cards. There are up to 100 events per account and 20 invitations per event. Current project deletion is permanent after confirmation.

Export workers, private object storage, admin publishing, public links, RSVP, billing, full canvas editing and production hosting remain future milestones. Server invitation photos are temporarily embedded in their validated JSON documents; no private upload bucket is configured yet.

## Configured PostgreSQL and optional Google sign-in

Copy the root `.env.example` to `apps/web/.env.local`, then configure PUBLIC_APP_URL, DATABASE_URL and a high-entropy BETTER_AUTH_SECRET through your local environment/secrets manager. No real credentials belong in tracked files. `npm run db:migrate` applies the SQL to that database. The application uses node-postgres, with certificate verification left enabled; do not disable TLS verification to make a hosted connection work.

For optional Google OAuth, supply GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET and configure the exact `${PUBLIC_APP_URL}/api/auth/callback/google` redirect URI with the provider. The UI shows Google only when both credentials exist. Live OAuth has not been tested because no credentials were supplied. Automatic linking of matching-email accounts is disabled.

Set PUBLIC_DEPLOYMENT=true only for an intentionally configured public environment: it requires external PostgreSQL, an explicit managed secret and HTTPS. Public email/password registration is deliberately disabled until email verification/recovery is implemented. External hosting, trusted proxy/IP policy, backups, roles/admin MFA and launch review remain separate gates.

`GET /api/v1/health` checks database readiness without disclosing credentials. Protected API responses have no-store caching and request IDs; JSON logs include status/method/duration, not invitation contents or tokens. Auth attempts use persistent limits; local direct connections share a conservative per-path bucket rather than trusting spoofable forwarding headers.

For an actual PostgreSQL test service, run migrations against an isolated test database and set TEST_DATABASE_URL when running `npm test`. That optional network-driver test is skipped locally when unset. The checked-in GitHub Actions workflow supplies a disposable PostgreSQL 17 service; it has not run in a remote repository during this session.

## Verification and administrator setup

Run `npm run mail:preview -- EMAIL` to inspect local verification/reset links. Registration no longer signs in until email verification. Configure TLS SMTP_URL and MAIL_FROM for real delivery. See [account security operations](../operations/account-security.md) for authenticator/admin provisioning and migration/rollback.

## Current media/export/publishing/recovery setup

Account images now use server-validated private derivatives. Local files stay in ignored .data; public instances need shared durable PRIVATE_MEDIA_DIRECTORY and PRIVATE_EXPORT_DIRECTORY. Account Download can queue background exports; open Export history for results. Local jobs run in-process; npm run worker:exports requires network PostgreSQL and controlled installed Chrome. /admin needs a promoted MFA administrator. See [media/export operations](../operations/media-and-exports.md), [ADR 0002](../decisions/0002-private-media-and-durable-exports.md) and [offline recovery/release](../operations/recovery-and-release.md). Run npm run check:deployment for required public settings.
