# Scale and host cutover checklist

## Current architecture

`server.js` keeps submissions, staff credentials, quotas, and rate-limit state in JSON files and process memory. Google Drive stores the audio. The service must remain at one replica; adding replicas now can lose quota/rate-limit updates or overwrite JSON state. The `/metrics` counters and the current login/IP throttles are also per-process.

## Required before horizontal scaling

1. Choose the target host and provision a PostgreSQL database and Redis instance in that target environment. Do not expose either database publicly.
2. Add normalized tables for staff accounts, normal and special submissions, quota configuration, and Drive file references. Use transactions and uniqueness/locking for quota and weekly email/IP rules. Use Redis or a shared database for rate limiting, never per-process maps.
3. Build a one-time JSON importer that reports record counts and duplicate/missing Drive IDs without changing production. Run it against a protected copy of the data directory.
4. Verify imported counts, login, quotas, limits, admin actions, special submissions, and audio streaming in an isolated staging environment with a separate Drive folder.
5. Run route and one-upload load checks in staging. Increase replicas only after checks pass and the shared-store code is enabled.

## Cutover and rollback

1. Take a verified data backup and record the active deployment/revision.
2. Pause new submissions briefly, import the final JSON changes, deploy one replica against the new database, and verify `/readyz`, admin login, and a test submission.
3. Switch DNS or traffic only after verification. Keep the old service and untouched backup available until the rollback window closes.
4. If verification fails, restore traffic to the old service and import no new writes back without reconciling Drive file IDs and submission records.

The PostgreSQL/Redis-backed storage adapter and JSON importer are not included in this package yet. They require the destination environment, a protected copy of production data, and staging credentials to implement and verify safely. The present Docker package remains portable as a single-replica service.
