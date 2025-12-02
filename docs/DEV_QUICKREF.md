# Development Quick Reference

## Environment Setup

### Create .env file

Create a `.env` file in the root directory and copy the contents from `env.example`.

## Installation

Install all dependencies:

```bash
bun install
```

## Database Setup

### Start PostgreSQL Database

Start a Docker container with the PostgreSQL database:

```bash
bun docker:dev
```

### Run Database Migrations

Apply all database migrations (up functions):

```bash
bun db:migrate
```

### Generate a New Migration

Generate a new database migration with a custom name:

```bash
bun migration:generate --name=your_migration_name
```

## Development

### Start Development Server

Start the development server with hot reload:

```bash
bun dev
```

The application will be available at the configured port (check your `.env` file).

## Production

### Run in Production Mode

Start the application in production mode:

```bash
bun start
```

## Additional Scripts

- `bun build` - Build the application
- `bun test` - Run tests with the configured test setup
- `bun docker:dev` - Start the Docker PostgreSQL container

## Tech Stack

This project uses:

- [Bun](https://bun.sh) - Fast all-in-one JavaScript runtime
- React 19 - UI framework
- TanStack Router - Type-safe routing
- TanStack Query - Data fetching and caching
- Drizzle ORM - Type-safe database toolkit
- PostgreSQL - Database
- Tailwind CSS - Styling
- Shadcn/ui - UI components
- Zod - Schema validation
- React Hook Form - Form management

## Logging & Correlation IDs

### Overview

The server uses `pino` for structured logging plus per-request correlation IDs:

- `requestId` – unique per inbound HTTP request (header `X-Request-ID` if provided, else generated)
- `traceId` – distributed trace identifier (parsed from `traceparent` or `X-Trace-ID`, else generated)

### Using the Logger

In request handlers or services where you have access to the Bun `Request`:

```ts
import { createLogger } from '@/server/utils/logger'

export const handler = async (req: Bun.BunRequest) => {
  const log = createLogger(req)
  log.info({ action: 'doThing' }, 'starting work')
  // ...
  log.info({ resultCount: 3 }, 'completed work')
}
```

All log entries automatically include `requestId` and `traceId` when created via `createLogger(req)`.

### Log Levels

Controlled via `LOG_LEVEL` in `.env`:

- `warn` (recommended for local dev & tests – minimal noise)
- `info` (production baseline)
- `debug` (adds lifecycle `request:start` / `request:end` lines from correlation middleware)
- `error` (only errors)

### Redaction

Sensitive paths are redacted automatically with `[REDACTED]`:

```
user.email
user.name
user.ssoId
sessionToken
headers.authorization
cookie
```

Expand this list in `src/server/utils/logger.ts` if new PII surfaces.

### Correlation in Responses

Success and error envelopes include `requestId` and `traceId` inside `metaData` (success) or RFC 9457 Problem Details.
Headers echo these values: `X-Request-ID`, `X-Trace-ID`.

### Searching Logs

Filter production logs by a specific request:

```bash
grep '"requestId":"<id>"' application.log
```

Or by trace to follow a distributed flow:

```bash
grep '"traceId":"<trace>"' application.log
```

### Adding Logging to New Code

1. Avoid PII – prefer IDs / counts.
2. Use `info` for high-level events, `debug` for granular internals, `error` for failures.
3. Wrap external calls (DB, API) with start/end logs if they are critical to debugging.

### Tests

`tests/setup.ts` forces `LOG_LEVEL=warn` if unset to keep output quiet. Avoid assertions on log text.

### Upgrading / Extending

If adopting OpenTelemetry later, reuse `traceId` as the root span trace and add span IDs as needed.
