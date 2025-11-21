# Testing Guide

This project uses Bun's built-in test runner with React Testing Library and a lightweight DOM provided by `happy-dom`.

## Test Coverage

### Client-Side Tests

Focused tests validate our React Query hooks and cache behavior:

- `useUpdateTask`
  - Non-status updates (e.g., name): optimistic in-place update only in the list containing the task; no refetch needed
  - Status changes: task is removed from the old column immediately; only the new status column refetches
- `useCreateTask`
  - Only the created task's status column refetches
  - Pagination: no optimistic insertion; data updates only after the refetch completes
- `useDeleteTask`
  - Optimistically removes the task from all lists; no refetch

Test files live here:

- Hook tests: `src/client/tests/use-tasks.test.tsx`
- Test environment setup: `tests/setup.ts`

### Server-Side Tests

Comprehensive unit tests cover server utilities and validators:

**Utility Functions** (`src/server/tests/utils/`)

- `cookies.test.ts` - Cookie setting, getting, and deletion
- `response.test.ts` - Response formatting and error handling
- `validation-error-handler.test.ts` - Zod and custom validation error handling
- `session.cookies.test.ts` - Session cookie extraction and validation

**Validators** (`src/server/tests/validators/`)

- `task.validator.test.ts` - Task schema validation (insert and update)

These tests validate:

- Input validation and sanitization
- Error handling and formatting
- Cookie management and security
- Schema constraints (string length, numeric ranges, enums)
- Date coercion and optional fields

## How to run

Run with the preload setup to install the DOM environment:

```sh
bun test --preload ./tests/setup.ts
```

Alternatively, use the npm script:

```sh
bun run test
```

## Test environment

- DOM: [`happy-dom`](https://github.com/capricorn86/happy-dom)
- Rendering and assertions: [`@testing-library/react`](https://testing-library.com/docs/react-testing-library/intro/), [`@testing-library/dom`]
- Query layer: [`@tanstack/react-query`]

The preload file `tests/setup.ts`:

- Creates a `Window` instance and attaches `window`, `document`, and common globals
- Polyfills `requestAnimationFrame`
- Mutes noisy `act(...)` warnings to keep logs readable

## Patterns used in tests

- Provide a `QueryClientProvider` wrapper for hooks and components:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

function createWrapper(qc: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
}
```

- Seed React Query cache with realistic API responses:

```ts
import type { ApiResponse } from '@/types/api.types'

function makeResponse<T>(data: T, extra?: Partial<ApiResponse<T>>): ApiResponse<T> {
  return {
    data,
    metaData: {
      message: 'ok',
      status: 'SUCCESS',
      timestamp: new Date().toISOString(),
      ...(extra?.metaData ?? {}),
    },
    ...(extra ?? {}),
  } as ApiResponse<T>
}
```

- Monkey-patch network calls on the shared `apiClient` to avoid real HTTP:

```ts
import { apiClient } from '@/client/lib/axios'

let originalGet = apiClient.get.bind(apiClient)

// stub
// @ts-ignore
apiClient.get = async (url: string) => makeResponse(/* ... */)

// restore in afterEach
// @ts-ignore
apiClient.get = originalGet
```

- Distinguish initial fetches vs. mutation-triggered refetches: wait for initial GETs, then reset counters before asserting refetch behavior.

## Adding new tests

1. Create a new test in `src/client/tests/` (e.g., `some-hook.test.tsx`).
2. Build a `QueryClient` and wrapper, seed any needed cache entries.
3. Stub `apiClient` methods (`get`, `post`, `put`, `delete`) as needed.
4. Use `renderHook` or `render` with the wrapper to exercise the hook/component.
5. Assert cache updates, network calls, and UI as appropriate.

## Troubleshooting

- "Cannot find module '@testing-library/react'":
  - Run `bun install` to ensure dev dependencies are installed.
- Missing DOM APIs:
  - Ensure you run tests with `--preload ./tests/setup.ts`.
- Flaky timing with refetches:
  - Prefer `await waitFor(...)` and, where useful, deferred promises to control resolution order.

## Test Organization

```
src/
├── client/
│   └── tests/              # Client-side tests
│       ├── use-tasks.test.tsx
│       └── ...
└── server/
    └── tests/              # Server-side tests
        ├── utils/          # Utility function tests
        │   ├── cookies.test.ts
        │   ├── response.test.ts
        │   ├── validation-error-handler.test.ts
        │   └── session.cookies.test.ts
        └── validators/     # Validator tests
            └── task.validator.test.ts
tests/
└── setup.ts                # Global test setup
```

## Writing Server-Side Tests

### Testing Utilities

Server utilities are pure functions that are easy to test:

```typescript
import { describe, test, expect } from 'bun:test'
import { setCookie, getCookie } from '../../utils/cookies'

describe('getCookie', () => {
  test('should return cookie value when it exists', () => {
    const req = new Request('http://localhost', {
      headers: { Cookie: 'session_token=abc123' },
    })

    const value = getCookie(req as any, 'session_token')
    expect(value).toBe('abc123')
  })
})
```

### Testing Validators

Use Zod's `safeParse` to test validation schemas:

```typescript
import { describe, test, expect } from 'bun:test'
import { insertTaskSchema } from '../../validators/task.validator'

describe('insertTaskSchema', () => {
  test('should reject empty name', () => {
    const invalidTask = {
      userId: 'user-123',
      name: '',
      priority: 2,
      effort: 3,
    }

    const result = insertTaskSchema.safeParse(invalidTask)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Task name is required')
    }
  })
})
```

### Mocking Functions

For functions with dependencies, use Bun's `mock`:

```typescript
import { mock, beforeEach } from 'bun:test'
import * as cookiesModule from '../cookies'

describe('getUserFromSessionCookie', () => {
  beforeEach(() => {
    // Reset mocks
  })

  test('should return userId when session is valid', async () => {
    // @ts-ignore
    cookiesModule.getCookie = mock(() => 'valid-token')

    // ... test logic
  })
})
```

## CI

The `package.json` includes a `test` script that runs Bun tests with the preload setup. Integrate this command in your CI workflow.

## Future Test Coverage

Additional tests to consider (require test database setup):

### Integration Tests

- **Repositories**: Database operations, query logic, soft deletes
- **Services**: Business logic, error handling, validation
- **Controllers**: Request/response handling, authentication
- **Routes**: HTTP routing and parameter extraction

### E2E Tests

- Full authentication flow (OAuth)
- Complete task CRUD operations
- Session management and expiration
