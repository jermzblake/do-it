const DEFAULT_TIMEZONE = 'UTC'

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
