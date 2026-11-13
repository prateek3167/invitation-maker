# Authentication and Role Management

## Current foundation (v0.2)

Better Auth provides working development email/password registration/login, scrypt password hashing, HTTP-only SameSite sessions, rolling lifetime and logout revocation. Minimum password length is 12. Auth attempt counters are persisted in SQL. Without a verified proxy header, direct local connections use a shared per-path rate bucket rather than trusting client-supplied forwarding headers.

Only current-user account/event/card access is implemented; there is no admin management or role-elevation endpoint. Every private domain query checks ownership, including parent checks for cards. Cross-owner requests return 404. All writes, including signup, check the exact configured Origin before the handler; auth/project/card payload limits are enforced. Request logs omit contents, tokens and email.

Google OAuth configuration exists and is displayed only when credentials are supplied; live provider behavior is not tested here. Automatic account linking is disabled. Local secret generation writes ignored `.data/local-auth-secret`; a public deployment must instead supply an explicit high-entropy BETTER_AUTH_SECRET and HTTPS origin.

Email delivery/verification/reset, admin MFA/roles, profile/account deletion and support access processes are still future gates. PUBLIC_DEPLOYMENT=true disables the email/password method until verification/recovery is implemented, so this is not an approved public registration launch. Library password-reset endpoints without a delivery callback are not presented as usable product features.

Guests may retain explicitly device-local drafts from the first studio slice. This is not permission to save/read an account project: protected server endpoints require a valid session. The intended full-product role matrix below remains the target for later releases.

## Roles
**Guest:** view public gallery, preview templates, optional temporary editor session; cannot access private projects or admin.
**User:** own profile/projects/invitations/assets/exports/orders, publish/revoke own invitation links.
**Admin:** manage users and templates, publish template versions, view moderation/audit; does not automatically access private user content without a documented support/legal process.

## Authentication Setup
Email/password with modern password hashing (Argon2id or provider-managed equivalent), secure recovery, email verification as required, Google OAuth via standards-based library. Prefer HTTP-only secure same-site cookies for web sessions, session rotation and revocation.

## Authorization
Enforce roles and resource ownership server-side for every API. Deny by default. Shared invitations use revocable opaque tokens stored as hashes. Separate admin permission checks from normal user access.

## Security Controls
Rate-limit login/reset, protect against credential stuffing, CSRF and session fixation, support optional admin MFA, audit privileged actions, restrict uploads, redact secrets and PII in logs.

## Permissions Matrix
| Action | Guest | User | Admin |
|---|---|---|---|
| Browse templates | Yes | Yes | Yes |
| Save own invitation | No | Yes | Yes |
| Read another user's private invitation | No | No | No by default |
| Manage template publishing | No | No | Yes |
| Manage user accounts | No | No | Yes |

## Privacy
Data deletion/export requests, user consent for public links, minimum retention, clear photo storage policies and applicable legal review before launch.

## Current security increment (2026-11-13)

The preceding local-only restrictions are superseded for implemented email verification/recovery and account controls. See [account security operations](../operations/account-security.md). Public email/password is enabled only with SMTP_URL and MAIL_FROM; production delivery is still unverified. Better Auth two-factor plugin stores encrypted authenticator secrets/backup codes; fresh-session window is five minutes. Application role input is read-only; CLI promotion requires verified email plus MFA and revokes existing sessions.
