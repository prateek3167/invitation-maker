# REST API Contract (Draft v1)

## Canvas/suite persistence audit - 2026-11-14

Existing invitation create/update envelopes now preserve validated `canvasElements`, flat `suiteCards` (maximum 25), `eventTag`, manual `rsvpSettings` and `rsvpResponses` (maximum 2,000 per card). Unknown ownership fields are discarded. Canvas elements are bounded/allowlisted; custom SVG accepts only inert parsed XML, never script, events or links. All nested photo references receive owner checks, private normalization and authorized hydration. Root UUID/revision stays stable when switching suite cards. Existing immutable template snapshots remain enforced, including suite children; invalid content returns a validation error. The existing 8.5 MB request cap remains. No public share/guest-response endpoint exists; `/invite/[id]` is explicitly device-only. [Audit](../development/audit-2026-11-14.md).

## Royal portrait extension (2026-11-13)

Existing card create/update envelopes accept optional `portraits:{bride:Photo|null,groom:Photo|null}` for validated royal templates. Each Photo retains `{data,x,y,zoom}` and private owner checks; combined portrait data is capped at8,000,000 encoded characters within the existing8.5MB JSON cap. Non-royal templates cannot add portrait slots. Royal snapshots include allowlisted artwork keys, validated category/frame/composition and bounded photoBoxes. Private validation/storage and authorized card/project/account export hydration include both portraits. Existing single-photo documents remain compatible. No anonymous image endpoint or paid entitlement is introduced. Worker snapshots embed full trusted artwork and both portrait bytes. See [collection contract](../design/royal-collection.md).

## Current media/export/publishing increment — 2026-11-13

This section supersedes planned-only entries below. Account card writes now validate/store private photos and pin approved template snapshots. Responses hydrate photos only after owner checks. All private endpoints require verified sessions, exact Origin for writes and private/no-store responses.

| Endpoint | Contract |
|---|---|
| GET /api/v1/assets/:id | Owned JPEG derivative; foreign/missing 404 |
| DELETE /api/v1/assets | Removes only the owner's unreferenced photos; `{deleted}` |
| GET /api/v1/templates | Built-in concepts plus published versions; existing bounded filters/pagination |
| POST /api/v1/exports | `{invitationId,revision,format:png|jpg|pdf,idempotencyKey:UUID}` → 202 `{export}`; conflicting key/payload or revision 409 |
| GET /api/v1/exports | `{exports:[safeJobMetadata]}` |
| GET /api/v1/exports/:id | `{export:safeJobMetadata}`; inaccessible/expired 404 |
| GET /api/v1/exports/:id/download | Completed owned file; not-ready 409; direct authenticated download, not anonymous signed URL |
| GET /api/v1/admin/templates | MFA-admin only; up to 200 version/provenance/publication records |
| POST /api/v1/admin/templates | MFA-admin `{definition,licenseNote,familyId?}` → immutable version, 201 |
| PATCH /api/v1/admin/templates | MFA-admin `{id,publish:boolean}` changes publication pointer |

Safe job metadata: id, invitationId, revision, format, status, attempts, errorCode, createdAt, expiresAt. No SVG snapshot/credentials are returned. Jobs have three attempts, two-minute leases, seven-day expiry and 50 non-expired jobs/account. Definitions support existing safe compositions/text bindings/colors/photo capability, not executable HTML/SVG or external URLs. Old documents retain immutable snapshots after replacement/withdrawal. See [ADR 0002](../decisions/0002-private-media-and-durable-exports.md) and [operations](../operations/media-and-exports.md).

## Implemented v0.2 contract

Native Better Auth endpoints are mounted at `/api/auth`, while application APIs use `/api/v1`. Existing device drafts still use IndexedDB. No export/payment/admin endpoints are simulated.

| Endpoint | Request / response | Access |
|---|---|---|
| POST /api/auth/sign-up/email | `{name,email,password}`; maintained auth response and session cookie | Local-development email signup; minimum password length 12 |
| POST /api/auth/sign-in/email | `{email,password}`; maintained auth response and session cookie | Email/password sign-in |
| POST /api/auth/sign-out | `{}`; revokes current session | Same-origin request |
| GET /api/auth/get-session | Maintained session response | Current cookie session |
| POST /api/auth/sign-in/social | `{provider:"google",callbackURL:"/account"}` | Only with configured provider credentials |
| GET /api/v1/auth/me | `{user:null|{id,name,email},capabilities:{emailPassword,google,emailRecovery,database}}` | Public current-session probe; no-store |
| GET /api/v1/health | `{status:"ok"}` after database check | Public readiness |
| GET /api/v1/templates?q=&occasion=&photo=&page=&pageSize= | `{templates,total,page,pageSize}`; photo yes/no, pageSize 1–50 | Public concept catalog |
| GET /api/v1/projects | `{projects:[{id,title,occasion,sharedDetails,revision,updatedAt,cardCount}]}`; maximum 100 | Current owner only |
| POST /api/v1/projects | `{title,occasion,sharedDetails?}` → `{project}`, 201 | Owner derived from session |
| GET /api/v1/projects/:id | `{project:{...metadata,invitations:[canonicalDocument]}}` | Current owner only |
| PATCH /api/v1/projects/:id | `{revision,title?,sharedDetails?}` → `{project}` | Owner; stale revision 409 |
| DELETE /api/v1/projects/:id | 204; permanently deletes event and cascades cards | Current owner only |
| POST /api/v1/projects/:id/invitations | `{templateId}` or `{document}` → `{invitation}`, 201 | Owner; creation/copy generates new UUID and revision 1 |
| GET /api/v1/invitations/:id | `{invitation}` | Parent project owner only |
| PUT /api/v1/invitations/:id | `{document: fullCanonicalDocument}` → `{invitation}` | Parent owner; expected document revision; immutable ID/template |
| DELETE /api/v1/invitations/:id | 204 | Parent owner only |

Canonical documents are defined by `packages/editor-core/document.ts`. The implemented update envelope is `{document:...}`, refining the unimplemented draft `{revision,content}` example below. Successful writes increment revision atomically. Unchanged template identity is required; saving cannot move a card or transfer ownership. Shared details support host/partner/venue/message defaults for newly created cards only. Empty defaults are omitted. Import makes an independent copy; device data is never deleted implicitly.

All POST/PATCH/PUT/DELETE requests require an exact Origin match with configured PUBLIC_APP_URL, including cookie-free signup. JSON is required. Auth bodies are capped at 16,000 bytes; project metadata at 10,000; invitation bodies at 8,500,000. Account quotas: 100 projects, 20 cards/project. Invalid IDs/body return 400, unauthenticated 401, foreign origin 403, inaccessible/missing owner resources 404, stale revision 409, oversized payload 413, wrong content type 415, domain quota 422, auth attempt limit 429. Application errors are `{error:{code,message},requestId}`. The maintained auth handler retains its native response format for library errors. Responses include private/no-store cache policy and X-Request-ID. Errors do not expose SQL, tokens or invitation contents.

Public email/password registration is disabled under PUBLIC_DEPLOYMENT=true pending verified email/recovery. Google configuration is implemented but live OAuth is unverified. No user/admin listing, profile editing, account deletion, recovery, asset-upload, server export, public-share or billing contract below is implemented yet.

## Planned interfaces ? not implemented

The application table above is the current wire contract. Future endpoints require approved schemas, ownership/role checks, migrations and tests before clients use them:

- Profile/session management, account data export/deletion, verified email/recovery and administrator permissions. No generic user/item/login aliases exist.
- Versioned template metadata/detail and admin create/version/validate/publish/unpublish, preserving immutable versions used by existing invitations.
- Private media upload-intent/confirmation with server validation, quotas, content/signature checks, processing state and cleanup.
- Asynchronous export submission/status/signed downloads with an immutable document snapshot, template/renderer/font/asset version pinning, retries, idempotency and ownership checks.
- Explicit publication, revocable/expiring opaque share tokens and opt-in RSVP with host privacy controls.
- Provider-hosted checkout and verified/deduplicated webhooks, transactional entitlements, refunds and reconciliation.

Do not expose incomplete routes as working features. Future APIs must retain bounded pagination/payloads, stable error codes, request IDs, validation, denial by default and documented compatibility. User/account content stays private unless explicitly published.

## Current account security contract (2026-11-13)

Supersedes the earlier unimplemented account-security notes. Signup requires verification and creates no session. Native Better Auth routes implement send-verification-email, verify-email, request-password-reset, reset-password, update-user, change-password, delete-user and two-factor enable/verify-totp/verify-backup-code/disable. All writes retain exact-origin/JSON limits. Verification token replay does not create sessions; resets expire in 30 minutes and revoke old sessions. Public email/password requires configured SMTP.

GET /api/v1/auth/me now returns emailVerified, role, twoFactorEnabled and emailCapture capability. Domain routes require verified email. GET /api/v1/account/sessions returns bounded safe session metadata/current flags without tokens; DELETE with {id} revokes only an owned session. GET /api/v1/account/export streams private NDJSON profile/projects/invitations without auth credentials. Native deletion requires password or a fresh session. Administrators cannot disable MFA. See [operations](../operations/account-security.md).
