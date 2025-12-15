import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import { createTask, updateTaskById, getTaskById } from '../../repositories/tasks/tasks.repository'
import { db } from '../../db/db'

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
