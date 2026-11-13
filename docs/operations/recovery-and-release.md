# Recovery and release gates

The application is a tested local MVP foundation, not an approved public deployment. `npm run check:deployment` validates required public configuration without printing secret values or contacting/provisioning services. It currently fails, as expected, because the public URL, managed PostgreSQL/TLS, secret, SMTP sender, durable private mounts and controlled export browser are unconfigured. A static pass never substitutes for live staging tests.

## Local encrypted recovery

Stop the web server first. Provide BACKUP_ENCRYPTION_KEY as 64 hexadecimal characters from a managed/random 32-byte key, stored separately from the backup. Do not commit the key or put a real key in documentation. The utility deliberately rejects public/network-PostgreSQL operation and requires an explicit offline flag.

    npm run recovery -- create --offline
    npm run recovery -- restore PATH_TO_ARCHIVE --offline

Creation captures the current PGlite datadir, recognized managed media/export files and local auth secret when present, encrypts the compressed payload with AES-256-GCM and writes an exclusive `.imbackup` file under ignored `.data/backups`. Archives are limited to small local installations (500 MB media payload); this is not production backup infrastructure. Restore authenticates/decrypts the archive, verifies file checksums, validates filenames and loads the database into a newly generated `.data/restores/recovery-UUID` directory. Existing data is never replaced. Keep the original auth secret for restored authenticator/session ciphertext and verify cards/photos/exports before manually changing application configuration.

Tests restored an actual database/card/photo/secret fixture and compared its rendered output, rejected a wrong key/tampered archive and refused an existing restore directory. The procedure uses the [documented PGlite datadir dump/load API](https://pglite.dev/docs/api), which is PGlite-version-specific and is not a PostgreSQL migration format. Preserve the pinned engine version and checked-in SQL history.

The original full project backup remains at the location/hash recorded in [cleanup report](../development/cleanup-report.md). No real account data was deleted, restored or promoted during validation; all destructive tests used isolated fixtures.

## Public staging acceptance — still open

- Choose hosting/region and provision an explicitly authorized staging environment; establish real managed PostgreSQL, trusted TLS/CA and private durable storage shared with the worker (or implement the chosen object-storage adapter).
- Verify SMTP sender/domain/delivery, reset/verification inbox flows and optional live Google OAuth redirect/identity behavior.
- Configure the actual trusted edge, proxy-aware abuse controls and resource limits. Auth currently intentionally trusts no forwarded IP headers and uses shared per-path rate buckets. Public per-user/IP scaling is not validated; do not trust arbitrary forwarded headers.
- Pin and approve font assets/embedding rights and the deployed browser environment; run all concept/layout/size/photo/long-text exports there. Local pixel parity does not establish cross-platform font equivalence.
- Complete distinct artwork/provenance/commercial rights review, content/privacy/support policies, human mobile/screen-reader usability and user acceptance approval. A template provenance field records an assertion; it is not legal verification.
- Run the optional network PostgreSQL suite, concurrent worker/queue burst/outage tests, browser/memory/load measurements and real staging smoke tests. CI contains PostgreSQL17 configuration but was not executed remotely here.
- Configure provider database PITR/logical backups, synchronized private-media/artifact snapshots, secret recovery, encryption and retention. Restore them into a separate staging environment and record measured RPO/RTO. Local encrypted recovery does not certify production recovery.
- Configure alerts, on-call/support ownership, retention/cleanup schedules, rollout and compatible rollback. Run npm audit and all checks on the exact deployment artifact.

The roadmap requires this MVP gate before Phase 8 Advanced Editor/history and Phase 9 sharing/RSVP. Phase 10 also requires actual pricing/payment-provider decisions and sandbox credentials. These phases remain queued; automatic progression is authorized, but unavailable evidence or business decisions are not silently treated as passed. No deployment, paid service or live payment was created.
