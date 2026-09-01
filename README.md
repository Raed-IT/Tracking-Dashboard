# Fusion Operations Dashboard

A modular-monolith MVP for real-time multi-source observation fusion. Laravel 12 ingests vendor-neutral observations, correlates durable tracks, maintains Redis live state, and emits Reverb deltas to a Next.js 16 / MapLibre command-center UI.

## Architecture

```text
Source adapters
  ├── Mock aircraft (working)
  └── Flightradar24 (credential-gated skeleton)
       ↓ ObservationData
Queue ingestion → deterministic TrackFusionService
       ├── PostgreSQL/PostGIS observations + history
       ├── Redis track:{uuid} live state
       ├── alert/geofence evaluation boundary
       └── Reverb track.updated → Next.js Zustand store → MapLibre layers
```

PostgreSQL is used instead of MySQL because PostGIS and TimescaleDB are PostgreSQL extensions. Observation tables and repository/service boundaries are ready for conversion to a Timescale hypertable when retention and workload measurements justify it.

## Local setup

Prerequisites: Docker Engine with Compose v2.

```bash
cp .env.example .env
docker compose build
docker compose up -d postgres redis minio
docker compose run --rm api php artisan key:generate
docker compose run --rm api php artisan migrate --seed
docker compose up -d
```

Open `http://localhost`. Development login seed: `admin@example.com` / `change-me`; change it immediately outside throwaway local environments. The current map APIs require a bearer token. Obtain one with `POST /api/v1/auth/login` and store it as `token` in browser local storage while the dedicated login screen is completed.

Run one mock update or a continuous foreground stream:

```bash
docker compose exec api php artisan tracking:mock --once
docker compose exec api php artisan tracking:mock --interval=3
```

The scheduler also dispatches enabled mock sources every ten seconds. Crucially, the generator enters through the same adapter → normalized DTO → fusion → persistence → Redis → broadcast path as a real source.

## Environment

Copy `.env.example`; never commit `.env`. Important variables are `DB_*`, `REDIS_HOST`, `QUEUE_CONNECTION`, `REVERB_*`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_*`, `AWS_*`, `FR24_API_KEY`, and `FR24_BASE_URL`. MinIO supplies local S3-compatible storage. FR24 stays disabled when the API key is absent, and no undocumented endpoint is assumed.

## Development checks

```bash
cd backend && php artisan test
cd backend && ./vendor/bin/pint --test
docker compose run --rm nextjs npm run typecheck
docker compose run --rm nextjs npm run build
docker compose config --quiet
```

## Extending the platform

### Add a source adapter

Implement `DataSourceInterface`, map only documented vendor payload fields into `ObservationData`, register a driver in the adapter resolver, seed/configure a `data_sources` row, and dispatch `FetchSourceDataJob`. Never expose vendor payloads to controllers or the browser.

### Add a map layer

Create a focused component beside `AircraftLayer`, filter the normalized store by category, own a distinct MapLibre source/layer ID, and mount it in `OperationsMap`. Keep fetching and WebSocket state outside layer rendering.

### Add an alert rule

Store declarative conditions in `alert_rules` (event/geofence, track type, altitude, severity). Add a condition evaluator implementing the alert evaluator boundary and enqueue evaluation after live-track update. Controllers only validate requests and invoke actions.

## API surface

Implemented: authentication, viewport/filter/paginated tracks, track detail/history, source list/detail/health, and system status under `/api/v1`. The schema also establishes organizations/roles, geofences, alert rules/alerts, track timeline events, dashboard layouts, and widgets. Alert/geofence/layout CRUD controllers and UI editors are the next implementation slice.

## Production readiness gaps

- Replace the demo MapLibre style URL with a controlled tile/style service.
- Complete organization-scoped policies on every query and private Reverb channel authorization.
- Add secret management, TLS, rate limits, CSP, audit logs, backups, retention/compression, and observability.
- Split queue names/supervisors for fetch, normalize, correlate, persist, alerts, and broadcast; the MVP currently performs these service responsibilities transactionally inside one queued fetch job.
- Add stale-track removal, region/tile subscription routing, reconnect reconciliation, smooth symbol interpolation, full alert/geofence/layout CRUD, camera abstractions, and login UI.
- Validate an official FR24 contract and supply the isolated HTTP client/mapping.
- Expand PostgreSQL integration, API/auth/geofence/alert/frontend/E2E tests before deployment.

## Recommended next phase

Finish the security and operational vertical slice: organization scoping and policies, private region-aware channels, alert/geofence actions and tests, then run a measured ingestion load test before enabling TimescaleDB hypertables and retention policies.
