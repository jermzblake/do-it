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
- Component/Dialog tests: `src/client/tests/create-task-dialog.guard.test.tsx`, `src/client/tests/edit-task-dialog.guard.test.tsx`
- Test utilities: `src/client/tests/test-utils.tsx`
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

## Test Utilities

We provide shared test utilities in `src/client/tests/test-utils.tsx` to reduce boilerplate and ensure consistency across component tests:

### `renderWithProviders(ui: React.ReactElement)`

Renders a component wrapped with fresh `QueryClient` and `RouterProvider` instances:

```tsx
import { renderWithProviders } from './test-utils'

renderWithProviders(<MyComponent />)
```

**Benefits:**

- Automatic provider setup (no manual `QueryClientProvider` or `RouterProvider` boilerplate)
- Fresh isolated state per render (prevents cross-test pollution)
- Consistent query/mutation retry disabled for deterministic tests

### `pressEscape()`

Simulates pressing the Escape key on the document:

```tsx
import { pressEscape } from './test-utils'

pressEscape()
// Equivalent to: fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })
```

### `clickByTestId(testId: string)`

Clicks an element by its `data-testid` attribute:

```tsx
import { clickByTestId } from './test-utils'

clickByTestId('create-task-trigger')
// Equivalent to: fireEvent.click(screen.getByTestId('create-task-trigger'))
```

### `expectDialogOpen(titleRegex: RegExp)`

Asserts a dialog is open by its accessible title, with fallback for `aria-hidden` dialogs:

```tsx
import { expectDialogOpen } from './test-utils'

await expectDialogOpen(/create task/i)
```

**Handles Radix Dialog edge case:** When an `AlertDialog` is shown on top of a `Dialog`, the underlying dialog becomes `aria-hidden`. This helper automatically falls back to checking for a hidden heading.

### `expectDialogClosed(titleRegex: RegExp)`

Asserts a dialog is fully closed and removed from the DOM:

```tsx
import { expectDialogClosed } from './test-utils'

await expectDialogClosed(/create task/i)
```

Waits for both the dialog role and any hidden headings to be removed.

## Patterns used in tests

### Hook Testing

- Provide a `QueryClientProvider` wrapper for hooks:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

function createWrapper(qc: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
}
```

**For component tests, prefer `renderWithProviders` from test-utils instead.**

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

### Component Tests

1. Create a new test in `src/client/tests/` (e.g., `my-component.test.tsx`).
2. Import `renderWithProviders` and other helpers from `./test-utils`.
3. Use `renderWithProviders(<MyComponent />)` to render with providers.
4. Add `afterEach(() => cleanup())` to ensure DOM cleanup between tests.
5. Assert UI behavior using Testing Library queries.

**Example:**

```tsx
import { describe, it, expect, afterEach } from 'bun:test'
import { screen, cleanup } from '@testing-library/react'
import { renderWithProviders, clickByTestId } from './test-utils'
import { MyDialog } from '@/client/components/my-dialog'

describe('MyDialog', () => {
  afterEach(() => {
    cleanup()
  })

  it('opens when trigger is clicked', async () => {
    renderWithProviders(<MyDialog trigger={<button data-testid="open-dialog">Open</button>} />)

    clickByTestId('open-dialog')
    expect(screen.getByRole('dialog')).toBeTruthy()
  })
})
```

### Hook Tests

1. Create a new test in `src/client/tests/` (e.g., `some-hook.test.tsx`).
2. Build a `QueryClient` and wrapper, seed any needed cache entries.
3. Stub `apiClient` methods (`get`, `post`, `put`, `delete`) as needed.
4. Use `renderHook` with the wrapper to exercise the hook.
5. Assert cache updates, network calls, and UI as appropriate.

## Troubleshooting

- **"Cannot find module '@testing-library/react'"**:
  - Run `bun install` to ensure dev dependencies are installed.
- **Missing DOM APIs**:
  - Ensure you run tests with `--preload ./tests/setup.ts`.
- **Flaky timing with refetches**:
  - Prefer `await waitFor(...)` and, where useful, deferred promises to control resolution order.
- **"Found multiple elements by [data-testid]" or role queries**:
  - Ensure `afterEach(() => cleanup())` is added to your test suite to prevent DOM pollution between tests.
  - Use unique `data-testid` values or scope queries with `within()`.
- **Dialog not found or "aria-hidden" issues**:
  - Use `expectDialogOpen` and `expectDialogClosed` from test-utils, which handle Radix Dialog's aria-hidden behavior when AlertDialogs overlay.

## Test Organization

```
src/
├── client/
│   └── tests/              # Client-side tests
│       ├── test-utils.tsx  # Shared test utilities and helpers
│       ├── use-tasks.test.tsx
│       ├── create-task-dialog.guard.test.tsx
│       ├── edit-task-dialog.guard.test.tsx
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
└── setup.ts                # Global test setup (happy-dom polyfills)
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
      expect(result.error.issues[0]?.message).toBe('Task name is required')
    }
  })
})
```

### Mocking Functions

For functions with dependencies, use Bun's `spyOn`:

```typescript
import { spyOn } from 'bun:test'
import * as cookiesModule from '../../utils/cookies'
import * as sessionsService from '../../services/auth/sessions.service'

describe('getUserFromSessionCookie', () => {
  test('should return userId when session is valid', async () => {
    const getCookieSpy = spyOn(cookiesModule, 'getCookie').mockReturnValue('valid-token')
    const getUserIdSpy = spyOn(sessionsService, 'getUserIdBySessionToken').mockResolvedValue('user-123')

    // ... test logic

    getCookieSpy.mockRestore()
    getUserIdSpy.mockRestore()
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
