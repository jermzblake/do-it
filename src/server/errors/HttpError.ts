export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public type?: string,
  ) {
    super(message)
    this.name = 'HttpError'
  }
}

export class BadRequestError extends HttpError {
  constructor(message = 'Bad Request', code = 'BAD_REQUEST') {
    super(400, code, message, 'about:blank')
    this.name = 'BadRequestError'
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = 'Unauthorized', code = 'UNAUTHORIZED') {
    super(401, code, message, 'about:blank')
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = 'Forbidden', code = 'FORBIDDEN') {
    super(403, code, message, 'about:blank')
    this.name = 'ForbiddenError'
  }
}

export class NotFoundError extends HttpError {
  constructor(message = 'Resource not found', code = 'NOT_FOUND') {
    super(404, code, message, 'about:blank')
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends HttpError {
  constructor(message = 'Conflict', code = 'CONFLICT') {
    super(409, code, message, 'about:blank')
    this.name = 'ConflictError'
  }
}

export class InternalServerError extends HttpError {
  constructor(message = 'Internal Server Error', code = 'INTERNAL_ERROR') {
    super(500, code, message, 'about:blank')
    this.name = 'InternalServerError'
  }
}
