import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import { createTask, updateTaskById, getTaskById, getTodayViewTasks } from '../../repositories/tasks/tasks.repository'
import { db } from '../../db/db'

const serializeDrizzleNode = (value: unknown) => {
  const seen = new WeakSet<object>()

  return JSON.stringify(
    value,
    (_key, currentValue) => {
      if (typeof currentValue === 'bigint') {
        return currentValue.toString()
      }

      if (typeof currentValue === 'function') {
        return `[Function ${currentValue.name || 'anonymous'}]`
      }

      if (currentValue && typeof currentValue === 'object') {
        if (seen.has(currentValue)) {
          return '[Circular]'
        }
        seen.add(currentValue)
      }

      return currentValue
    },
    2,
  )
}

describe('tasks.repository startBy handling', () => {
  let origInsert: any
  let origUpdate: any
  let origSelect: any

  beforeEach(() => {
    origInsert = (db as any).insert
    origUpdate = (db as any).update
    origSelect = (db as any).select
  })

  afterEach(() => {
    ;(db as any).insert = origInsert
    ;(db as any).update = origUpdate
    ;(db as any).select = origSelect
  })

  test('createTask coerces startBy string to Date before insert and returns Date', async () => {
    ;(db as any).insert = (_table: any) => ({
      values: (values: any) => ({
        returning: async () => [values],
      }),
    })

    const payload: any = {
      userId: 'u1',
      name: 't',
      priority: 1,
      effort: 1,
      status: 'todo',
      startBy: '2025-12-01T09:00:00Z',
    }

    const res = await createTask(payload)
    expect(res).toBeDefined()
    expect(res?.startBy).toBeInstanceOf(Date)
  })

  test('updateTaskById coerces startBy string to Date and returns Date', async () => {
    ;(db as any).update = (_table: any) => ({
      set: (_set: any) => ({
        where: (_cond: any) => ({
          returning: async () => [_set],
        }),
      }),
    })

    const res = await updateTaskById('id-1', { startBy: '2026-01-01T00:00:00Z' } as any)
    expect(res).toBeDefined()
    expect(res?.startBy).toBeInstanceOf(Date)
  })

  test('getTaskById returns the selected row (proxy for startBy presence)', async () => {
    ;(db as any).select = () => ({
      from: (_table: any) => ({
        where: (_cond: any) => ({
          limit: async (_n: number) => [{ id: 'id-1', startBy: new Date('2025-12-01T09:00:00Z') }],
        }),
      }),
    })

    const fetched = await getTaskById('id-1')
    expect(fetched).not.toBeNull()
    expect(fetched!.startBy).toBeInstanceOf(Date)
  })
})

describe('tasks.repository getTodayViewTasks', () => {
  let origSelect: any

  beforeEach(() => {
    origSelect = (db as any).select
  })

  afterEach(() => {
    ;(db as any).select = origSelect
  })

  test('builds filters for overdue/due-today, startBy-today, and due-within-2-days while excluding completed/cancelled/deleted', async () => {
    let capturedWhere: any
    const rows: any = [{ id: 'task-1', name: 'Visible today task' }]

    ;(db as any).select = () => ({
      from: (_table: any) => ({
        where: (condition: any) => {
          capturedWhere = condition

          return {
            orderBy: (_order: any) => ({
              limit: async (_limit: number) => rows,
            }),
          }
        },
      }),
    })

    const result = await getTodayViewTasks('user-123', 'America/New_York')
    const whereSql = serializeDrizzleNode(capturedWhere)

    expect(result).toEqual(rows)
    expect(whereSql).toContain('user_id')
    expect(whereSql).toContain('deleted_at')
    expect(whereSql).toContain('completed_at')
    expect(whereSql).toContain('completed')
    expect(whereSql).toContain('cancelled')
    expect(whereSql).toContain('due_date')
    expect(whereSql).toContain('start_by')
    expect(whereSql).toContain('America/New_York')
    expect(whereSql).toContain('<= CURRENT_DATE AT TIME ZONE')
    expect(whereSql).toContain('= CURRENT_DATE AT TIME ZONE')
    expect(whereSql).toContain("INTERVAL '2 days'")
    expect(whereSql).toContain('BETWEEN (CURRENT_DATE AT TIME ZONE')
  })

  test('orders by due date asc nulls last, then priority desc, then effort asc, and limits to 10 rows', async () => {
    let capturedOrderBy: any
    let capturedLimit: number | undefined
    ;(db as any).select = () => ({
      from: (_table: any) => ({
        where: (_condition: any) => ({
          orderBy: (orderBy: any) => {
            capturedOrderBy = orderBy

            return {
              limit: async (limit: number) => {
                capturedLimit = limit
                return []
              },
            }
          },
        }),
      }),
    })

    await getTodayViewTasks('user-123', 'America/New_York')
    const orderSql = serializeDrizzleNode(capturedOrderBy)

    expect(capturedLimit).toBe(10)
    expect(orderSql).toContain('due_date')
    expect(orderSql).toContain('ASC NULLS LAST')
    expect(orderSql).toContain('priority')
    expect(orderSql).toContain('DESC')
    expect(orderSql).toContain('effort')
  })
})
