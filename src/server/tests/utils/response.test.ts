import { describe, test, expect } from 'bun:test'
import { createResponse, ResponseMessage, ResponseCode, StatusCode } from '../../utils/response'
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

  test('should infer default message from response code when message is omitted', () => {
    const response = createResponse({ id: 1 }, undefined, StatusCode.CREATED, ResponseCode.CREATED)

    expect(response.metaData.message).toBe(ResponseMessage.CREATED)
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
