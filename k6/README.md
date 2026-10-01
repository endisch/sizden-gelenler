# Load checks

Run against a disposable staging deployment only. The default profile exercises the health, readiness, configuration, and home-page routes with a gradual 5-to-30 virtual-user ramp:

```sh
k6 run -e BASE_URL=https://staging.example.com k6/service-load.js
```

This does not upload tracks or authenticate with Google. For one real upload-path smoke check, use a dedicated Google test account, a staging Drive folder, and an MP3 smaller than the configured limit:

```sh
k6 run -e BASE_URL=https://staging.example.com -e GOOGLE_ID_TOKEN=... -e MP3_FILE=./staging-test.mp3 k6/upload-smoke.js
```

The upload script creates a real staging submission and Drive file. Do not point either script at production until a maintenance window and explicit load profile have been chosen. The rate limit allows only one submission per account/IP per week, so the upload smoke check is intentionally one iteration.
