const DEFAULT_TIMEZONE = 'UTC'

const timezoneFormatterCache = new Map<string, Intl.DateTimeFormat>()

type ZonedDateParts = {
  year: number | undefined
  month: number | undefined
  day: number | undefined
  hour: number | undefined
  minute: number | undefined
  second: number | undefined
}

const getTimezoneFormatter = (timezone: string) => {
  const cachedFormatter = timezoneFormatterCache.get(timezone)
  if (cachedFormatter) {
    return cachedFormatter
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  timezoneFormatterCache.set(timezone, formatter)
  return formatter
}

const toNumber = (value: string) => Number.parseInt(value, 10)

const getZonedDateParts = (date: Date, timezone: string): ZonedDateParts => {
  const formatter = getTimezoneFormatter(timezone)
  const parts = formatter.formatToParts(date)

  const values: Record<string, number> = {}
  for (const part of parts) {
    if (part.type === 'literal') {
      continue
    }
    values[part.type] = toNumber(part.value)
  }

  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour,
    minute: values.minute,
    second: values.second,
  }
}

const getTimezoneOffsetMs = (date: Date, timezone: string): number => {
  const parts = getZonedDateParts(date, timezone)
  const zonedAsUtcMs = Date.UTC(parts.year!, parts.month! - 1, parts.day, parts.hour, parts.minute, parts.second)
  return zonedAsUtcMs - date.getTime()
}

const getUtcForZonedMidnight = (year: number, month: number, day: number, timezone: string): Date => {
  const targetMidnightUtcMs = Date.UTC(year, month - 1, day, 0, 0, 0, 0)
  let utcMs = targetMidnightUtcMs

  for (let i = 0; i < 3; i++) {
    const offsetMs = getTimezoneOffsetMs(new Date(utcMs), timezone)
    const nextUtcMs = targetMidnightUtcMs - offsetMs

    if (nextUtcMs === utcMs) {
      break
    }

    utcMs = nextUtcMs
  }

  return new Date(utcMs)
}

const addDaysToDateParts = (year: number, month: number, day: number, daysToAdd: number) => {
  const date = new Date(Date.UTC(year, month - 1, day + daysToAdd, 0, 0, 0, 0))
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  }
}

export const getTodayViewUtcBoundaries = (timezone: string, now: Date = new Date()) => {
  const today = getZonedDateParts(now, timezone)
  const tomorrow = addDaysToDateParts(today.year!, today.month!, today.day!, 1)
  const inThreeDays = addDaysToDateParts(today.year!, today.month!, today.day!, 3)

  return {
    startOfTodayUtc: getUtcForZonedMidnight(today.year!, today.month!, today.day!, timezone),
    startOfTomorrowUtc: getUtcForZonedMidnight(tomorrow.year!, tomorrow.month!, tomorrow.day!, timezone),
    startOfThreeDaysOutUtc: getUtcForZonedMidnight(inThreeDays.year, inThreeDays.month, inThreeDays.day, timezone),
  }
}

export const sanitizeTimezoneHeader = (timezoneHeader: string | null | undefined): string => {
  const candidateTimezone = timezoneHeader?.trim()

  if (!candidateTimezone) {
    return DEFAULT_TIMEZONE
  }

  try {
    return new Intl.DateTimeFormat('en-US', { timeZone: candidateTimezone }).resolvedOptions().timeZone
  } catch {
    return DEFAULT_TIMEZONE
  }
}
