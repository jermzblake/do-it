import { TASK_DATE_KEYS } from '@/shared/date-keys'

export const toIsoString = (value?: string | Date | null): string | undefined => {
  if (!value) return undefined

  if (typeof value === 'string') {
    if (value.trim() === '') return undefined
    return value
  }

  if (value instanceof Date) {
    if (isNaN(value.getTime())) return undefined
    return value.toISOString()
  }

  return undefined
}

// Normalize known task date keys on a shallow object, converting Date -> ISO string
export const normalizeDates = <T extends Record<string, any> | undefined>(obj: T): T | undefined => {
  if (!obj) return obj
  const copy = { ...(obj as Record<string, any>) }
  const dateKeys = TASK_DATE_KEYS

  dateKeys.forEach((k) => {
    const v = (copy as any)[k]
    if (v instanceof Date) {
      ;(copy as any)[k] = v.toISOString()
    }
  })

  return copy as T
}
