export class RateLimitExceededError extends Error {
  public readonly code: number = 429
  constructor(message = 'Task creation rate limit exceeded') {
    super(message)
    this.name = 'RateLimitExceededError'
  }
}
