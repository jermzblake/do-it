# Server-Side Testing Guide

This document provides comprehensive guidance on testing server-side code in the do-it application.

## Overview

Server-side tests are organized by layer and focus on unit testing utilities and validators. Integration tests requiring database setup are planned for future implementation.

## Current Test Coverage

### ✅ Implemented Tests

#### 1. Utility Functions (`src/server/tests/utils/`)

**cookies.test.ts** - Cookie Management

- `setCookie()`: Default options, custom options, HttpOnly/Secure flags, SameSite values, maxAge
- `getCookie()`: Finding cookies, missing headers, URL-encoded values, edge cases
- `deleteCookie()`: Cookie deletion format

**response.test.ts** - Response Formatting

- `createResponse()`: Success responses with data, null data, custom messages, pagination
- `createErrorResponse()`: Error structure, status codes, error details
- Constants validation: ResponseMessage, ResponseCode, StatusCode

**validation-error-handler.test.ts** - Error Handling

- `handleValidationError()`: Zod errors, custom validation errors, non-validation errors
- Error formatting with single/multiple issues, nested paths
- Custom error patterns: "Invalid field", "must be", "is required", "Invalid task status"

**session.cookies.test.ts** - Session Management

- `getUserFromSessionCookie()`: Valid sessions, missing cookies, invalid tokens
- Error propagation from dependencies
- Mocking external functions (getCookie, getUserIdBySessionToken)

#### 2. Validators (`src/server/tests/validators/`)

**task.validator.test.ts** - Schema Validation

- `insertTaskSchema`:
  - Required fields (name, userId, priority, effort)
  - String length constraints (name ≤ 512 chars)
  - Numeric ranges (priority: 1-3, effort: 1-5)
  - Enum validation (status: todo, in_progress, completed, blocked, cancelled)
  - Date coercion (string → Date)
  - Optional fields (description, notes, blockedReason, dates)
  - Integer validation

- `updateTaskSchema`:
  - Partial updates
  - Field omission (userId, id)
  - Constraint validation on updates
  - Empty object handling

## Test Patterns

### Pattern 1: Pure Function Testing

For utilities without external dependencies:

```typescript
import { describe, test, expect } from 'bun:test'
import { setCookie } from '../cookies'

describe('setCookie', () => {
  test('should create cookie with default options', () => {
    const cookie = setCookie('test', 'value', {})

    expect(cookie).toContain('test=value')
    expect(cookie).toContain('HttpOnly')
  })
})
```

### Pattern 2: Validator Testing

Test validation schemas using Zod's `safeParse`:

```typescript
import { insertTaskSchema } from '../task.validator'

test('should reject invalid priority', () => {
  const invalidTask = {
    userId: 'user-123',
    name: 'Test',
    priority: 10, // Invalid: must be 1-3
    effort: 3,
  }

  const result = insertTaskSchema.safeParse(invalidTask)
  expect(result.success).toBe(false)
  if (!result.success) {
    expect(result.error.issues[0]?.message).toBe('Priority must be at most 3')
  }
})
```

### Pattern 3: Mocking Dependencies

For functions with external dependencies:

```typescript
import { spyOn } from 'bun:test'
import * as cookiesModule from '../cookies'
import * as sessionsService from '../../services/auth/sessions.service'

describe('getUserFromSessionCookie', () => {
  test('should return userId when session is valid', async () => {
    const mockReq = new Request('http://localhost') as any

    const getCookieSpy = spyOn(cookiesModule, 'getCookie').mockReturnValue('valid-token')
    const getUserIdSpy = spyOn(sessionsService, 'getUserIdBySessionToken').mockResolvedValue('user-123')

    const result = await getUserFromSessionCookie(mockReq)
    expect(result).toBe('user-123')

    // Clean up
    getCookieSpy.mockRestore()
    getUserIdSpy.mockRestore()
  })
})
```

### Pattern 4: Error Testing

Test error handling and propagation:

```typescript
test('should throw error when session token is missing', async () => {
  const mockReq = new Request('http://localhost') as any

  const getCookieSpy = spyOn(cookiesModule, 'getCookie').mockReturnValue(null)

  await expect(getUserFromSessionCookie(mockReq)).rejects.toThrow('No session token found in cookies')

  getCookieSpy.mockRestore()
})
```

## Running Tests

### Run all tests

```bash
bun test --preload ./tests/setup.ts
```

### Run specific test file

```bash
bun test src/server/tests/utils/cookies.test.ts
```

### Run tests in watch mode

```bash
bun test --watch
```

### Run with coverage (if configured)

```bash
bun test --coverage
```

## Essentials

### Core Principles

1. Prefer unit tests for pure functions first.
2. Name tests after observable behavior.
3. Cover: happy path, one edge case, one error path.
4. Mock only external boundaries (network, DB, OAuth).
5. Clean up spies/mocks after use.
6. Validate schema constraints explicitly.
7. Keep assertions focused.

## Future Test Coverage

### Future Coverage Roadmap (Requires DB / external services)

| Layer        | Goal                                                         |
| ------------ | ------------------------------------------------------------ |
| Repositories | Query correctness (filters, pagination, soft delete)         |
| Services     | Business logic composition + error mapping                   |
| Controllers  | Request validation + auth/session branching + response shape |
| Auth Flow    | OAuth callback, session lifecycle                            |
| Routes       | Parameter extraction + method wiring (thin but sanity)       |

When ready: introduce a disposable Postgres (Docker) or SQLite test DB, and minimal factories for seed data.

## Minimal Patterns

| Pattern                   |
| ------------------------- |
| Pure function test        |
| Validator test            |
| Mocking external boundary |
| Error path assertion      |

## CI Note

CI already runs `bun test --preload ./tests/setup.ts`; no special server-only step required. Keep parity with local runs.

## Troubleshooting

### Issue: Mock not working

**Solution**: Ensure you're storing and restoring original functions

### Issue: Tests failing randomly

**Solution**: Check for shared state, use `beforeEach` for cleanup

### Issue: Async tests timing out

**Solution**: Ensure all promises are awaited, check for infinite loops

### Issue: Type errors with mocks

**Solution**: Use `// @ts-ignore` for mock assignments, or cast types appropriately

## Resources

- [Bun Test Runner](https://bun.sh/docs/cli/test)
- [Zod Validation](https://zod.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Contributing

When adding new server-side code:

1. Write tests alongside implementation
2. Aim for 80%+ coverage on utilities/validators
3. Test happy path and error cases
4. Update this documentation with new patterns
5. Run tests before committing: `bun test`
