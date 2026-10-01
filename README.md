# MAİS — Sizden Gelenler

Express app for the public music submission form and its staff dashboard. The production entry point serves the committed `public/` directory and stores mutable JSON state under `DATA_DIR`.

## Run on another host

1. Install Docker Engine and Docker Compose.
2. Copy `.env.example` to `.env` and fill in the Google settings below. Set a new initial owner username and a unique password of at least 14 characters if the data directory has no staff accounts.
3. Start the service with `docker compose up -d --build`.
4. Check `http://localhost:3000/healthz`; it should return `{"status":"ok"}`.
5. Put the service behind HTTPS before exposing the staff dashboard or submission form publicly.

For a direct Node deployment, use Node.js 22, run `npm ci --omit=dev`, set the same environment variables, mount a persistent writable directory at `DATA_DIR`, and run `npm start`.

## Configuration

- `MAX_UPLOAD_MB` defaults to 10 and accepts whole-number values from 1 through 10. The server enforces the limit; the page displays the configured value and checks it before sending. Configure the reverse proxy or platform request-body limit to allow slightly more than 10 MB for multipart overhead.
- `DATA_DIR` contains staff credentials, submissions and quota state, rate-limit records, temporary uploads, and the generated `.jwt_secret`. Keep it on persistent storage. The app uses local JSON files and should stay at one running replica until that state is moved to a shared database and the request limits are coordinated.
- `GOOGLE_CLIENT_ID` is needed for Google sign-in. Configure either `GOOGLE_REFRESH_TOKEN` with `GOOGLE_CLIENT_SECRET`, or `GOOGLE_SERVICE_ACCOUNT_JSON`, and set `GOOGLE_DRIVE_FOLDER_ID` for Drive uploads. Grant the selected identity access to that folder. `DRIVE_OWNER_EMAIL` is optional.
- `JWT_SECRET` is optional when the persistent data directory is retained; the app will create a random secret there. If set, use a newly generated high-entropy value and store it in the host's secret manager.
- `INITIAL_OWNER_USERNAME` and `INITIAL_OWNER_PASSWORD` are read only when no staff credential file exists. The first password must be at least 14 characters. Remove these bootstrap values after the first successful start. Public self-service owner creation is disabled.
- `PORT` is supplied by Railway and other hosts. Docker Compose runs the container on port 3000 and maps it to `HOST_PORT` on the host.
- `METRICS_TOKEN` is optional. Set at least 32 random characters to enable the protected Prometheus-compatible `/metrics` endpoint; without it, the endpoint returns 404. `/healthz` reports process liveness and `/readyz` checks the writable data directory.

The app writes state JSON through temporary files and an atomic rename so a partial write does not replace a valid record. If an existing state file is malformed, startup stops with a clear error instead of silently loading empty state. Multipart uploads are capped at one MP3, 10 text fields, and 16 KB per field. Google Drive uploads retry transient errors and use a request fingerprint to find a prior upload before retrying. Static assets are cached for one day; HTML pages always revalidate.

Never commit `.env`, credentials, exported service-account JSON, or a data-directory backup.

## Backups

The scripts in `scripts/` archive the complete data directory (including the JWT secret), write a SHA-256 checksum, and reject unsafe, linked, or non-empty restore targets. Stop the app or pause new writes while creating a backup so the related JSON records are captured at the same point in time. Backups are **not encrypted**; store them only in an encrypted, access-controlled location and do not put them in Git. Example on Windows:

```powershell
./scripts/backup-data.ps1 -DataDirectory ./data -OutputDirectory D:/private-backups
./scripts/restore-data.ps1 -Archive D:/private-backups/mais-data-YYYYMMDD-HHMMSS.tar.gz -DataDirectory ./restore-test
```

Schedule the backup script in the host scheduler, retain multiple dated copies, and periodically restore one into an isolated empty directory. On Railway, use its volume backup facility or download a volume backup before a migration; the app scripts operate on a directory you can access from the host.

## Verification and load measurement

Every pull request and push to `main` runs the dependency audit, Node syntax check, builds the Docker image, starts it, and checks `/readyz`. The workflow does not deploy automatically. The `k6/` directory contains a gradual 5-to-30-user route profile and a separate, single-submission staging smoke check. The latter uses a real staging Drive folder and rate-limit identity; it must not run against production.

**Security cleanup required before reusing the public GitHub repository:** an earlier public revision contained default admin passwords and a fixed JWT secret. This working copy removes them, but changing the current files does not erase old Git history. Rotate the affected admin passwords and JWT secret, then decide whether to rewrite repository history before publishing this copy.

## Moving existing data

1. Stop writes to the old service and make a separate backup of its persistent data directory (`/app/data` on Railway). Protect that backup as sensitive information; it contains submitter information and admin credential hashes.
2. Copy the entire data directory, including `.jwt_secret`, to the new host's persistent `DATA_DIR`. Preserve file contents and ownership/permissions appropriate to the container's `node` user.
3. Recreate the host environment variables in its secret manager. Rotate any credentials that have ever been committed to a public repository. Keep the same Google Drive folder and grant the new Google identity access; existing audio stays in Drive and the saved Drive file IDs stay in the data files.
4. Start one instance and verify health, staff login, Google sign-in, and a controlled upload before switching DNS. The 10 MB cap is active at the app layer.
5. Keep the old backup until the new service has been checked and the rollback window has passed.

If the JWT secret is rotated instead of copied, staff will need to sign in again. The saved account hashes remain usable unless the credential data is changed.

## Operational note

The current storage model writes JSON files locally and keeps rate-limit and quota state in process memory. A persistent volume protects files across restarts but does not synchronize multiple replicas. For higher concurrency or horizontal scaling, move this state to a shared database and add coordinated request/rate limiting before increasing replica count. Reducing the accepted MP3 size lowers per-upload bandwidth and storage pressure; by itself, it does not create more visitors or increase the host's capacity.
