import { describe, test, expect } from 'bun:test'
import { createResponse, createErrorResponse, ResponseMessage, ResponseCode, StatusCode } from '../../utils/response'
import type { Pagination } from '../../../shared/api'

describe('createResponse', () => {
  test('should create successful response with data', () => {
    const data = { id: 1, name: 'Test' }
    const response = createResponse(data)

    expect(response.data).toEqual(data)
    expect(response.metaData.message).toBe(ResponseMessage.SUCCESS)
    expect(response.metaData.status).toBe(StatusCode.SUCCESS)
    expect(response.metaData.responseCode).toBe(ResponseCode.SUCCESS)
    expect(response.metaData.timestamp).toBeDefined()
    expect(response.error).toBeUndefined()
  })

  test('should create response with null data', () => {
    const response = createResponse(null)

    expect(response.data).toBeNull()
    expect(response.metaData.message).toBe(ResponseMessage.SUCCESS)
  })

  test('should create response with custom message', () => {
    const response = createResponse({ id: 1 }, ResponseMessage.CREATED)

    expect(response.metaData.message).toBe(ResponseMessage.CREATED)
  })

  test('should create response with custom status', () => {
    const response = createResponse({ id: 1 }, ResponseMessage.CREATED, StatusCode.CREATED)

    expect(response.metaData.status).toBe(StatusCode.CREATED)
  })

  test('should create response with custom response code', () => {
    const response = createResponse({ id: 1 }, ResponseMessage.CREATED, StatusCode.CREATED, ResponseCode.CREATED)

    expect(response.metaData.responseCode).toBe(ResponseCode.CREATED)
  })

  test('should include pagination params when provided', () => {
    const pagination: Pagination = {
      page: 1,
      pageSize: 10,
      totalCount: 100,
      direction: 'desc',
      sortBy: 'createdAt',
    }
    const response = createResponse(
      [{ id: 1 }, { id: 2 }],
      ResponseMessage.SUCCESS,
      StatusCode.SUCCESS,
      ResponseCode.SUCCESS,
      pagination,
    )

    expect(response.metaData.pagination).toEqual(pagination)
  })

  test('should generate ISO timestamp', () => {
    const response = createResponse({ id: 1 })
    const timestamp = response.metaData.timestamp

    expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    expect(() => new Date(timestamp)).not.toThrow()
  })

  test('should handle array data', () => {
    const data = [{ id: 1 }, { id: 2 }, { id: 3 }]
    const response = createResponse(data)

    expect(response.data).toEqual(data)
  })

  test('should handle empty array data', () => {
    const response = createResponse([])

    expect(response.data).toEqual([])
  })
})

describe('createErrorResponse', () => {
  test('should create error response with default code', () => {
    const response = createErrorResponse('Something went wrong')

    expect(response.data).toBeNull()
    expect(response.metaData.message).toBe('Something went wrong')
    expect(response.metaData.status).toBe(StatusCode.INTERNAL_SERVER_ERROR)
    expect(response.metaData.responseCode).toBe(500)
    expect(response.error).toBeDefined()
    expect(response.error?.code).toBe(500)
    expect(response.error?.message).toBe('Something went wrong')
    expect(response.error?.details).toBe('')
  })

  test('should create error response with custom code', () => {
    const response = createErrorResponse('Not found', 404)

    expect(response.metaData.responseCode).toBe(404)
    expect(response.error?.code).toBe(404)
  })

  test('should create error response with details', () => {
    const response = createErrorResponse('Validation failed', 400, 'name: Required, email: Invalid format')

    expect(response.error?.details).toBe('name: Required, email: Invalid format')
  })

  test('should create 400 error response', () => {
    const response = createErrorResponse('Bad request', 400, 'Invalid input')

    expect(response.error?.code).toBe(400)
    expect(response.error?.message).toBe('Bad request')
    expect(response.error?.details).toBe('Invalid input')
  })

  test('should create 401 error response', () => {
    const response = createErrorResponse('Unauthorized', 401)

    expect(response.error?.code).toBe(401)
    expect(response.error?.message).toBe('Unauthorized')
  })

  test('should create 404 error response', () => {
    const response = createErrorResponse('Not found', 404)

    expect(response.error?.code).toBe(404)
    expect(response.error?.message).toBe('Not found')
  })

  test('should always set data to null', () => {
    const response = createErrorResponse('Error')

    expect(response.data).toBeNull()
  })

  test('should generate ISO timestamp', () => {
    const response = createErrorResponse('Error')
    const timestamp = response.metaData.timestamp

    expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    expect(() => new Date(timestamp)).not.toThrow()
  })

  test('should always set status to INTERNAL_SERVER_ERROR', () => {
    const response = createErrorResponse('Any error', 400)

    expect(response.metaData.status).toBe(StatusCode.INTERNAL_SERVER_ERROR)
  })
})

describe('Response constants', () => {
  test('ResponseMessage should contain standard messages', () => {
    expect(ResponseMessage.SUCCESS).toBe('Request Successful.')
    expect(ResponseMessage.CREATED).toBe('Resource created successfully.')
    expect(ResponseMessage.NOT_FOUND).toBe('Resource not found.')
    expect(ResponseMessage.UNAUTHORIZED).toBe('Authentication required.')
  })

  test('ResponseCode should contain standard HTTP codes', () => {
    expect(ResponseCode.SUCCESS).toBe(200)
    expect(ResponseCode.CREATED).toBe(201)
    expect(ResponseCode.BAD_REQUEST).toBe(400)
    expect(ResponseCode.NOT_FOUND).toBe(404)
    expect(ResponseCode.INTERNAL_SERVER_ERROR).toBe(500)
  })

  test('StatusCode should contain formatted status strings', () => {
    expect(StatusCode.SUCCESS).toBe('S1000_SUCCESS')
    expect(StatusCode.CREATED).toBe('S1001_CREATED')
    expect(StatusCode.NOT_FOUND).toBe('C4004_NOT_FOUND')
    expect(StatusCode.INTERNAL_SERVER_ERROR).toBe('E5000_INTERNAL_SERVER_ERROR')
  })
})
