import { useEffect, useRef } from 'react'
import type { UseQueryResult } from '@tanstack/react-query'
import { isDevEnvironment } from '@/client/constants/environment'

interface PerformanceLog {
  queryKey: string
  duration: number
  status: 'success' | 'error'
  timestamp: string
}

/**
 * Hook to monitor and log query performance metrics
 * Tracks query execution time and logs to console in development
 */
export const useQueryPerformance = (
  queryResult: UseQueryResult<any, any>,
  queryName: string,
  options?: {
    threshold?: number // Log only if duration exceeds this (ms)
    enabled?: boolean // Enable/disable logging
  },
) => {
  const startTimeRef = useRef<number>(0)
  const { isFetching, isSuccess, isError } = queryResult
  const threshold = options?.threshold || 0
  const enabled = options?.enabled ?? process.env.NODE_ENV === 'development'

  // Start timer when fetching begins
  useEffect(() => {
    if (isFetching) {
      startTimeRef.current = performance.now()
    }
  }, [isFetching])

  // Log performance when query completes
  useEffect(() => {
    if (!isFetching && startTimeRef.current > 0 && enabled) {
      const duration = performance.now() - startTimeRef.current

      if (duration >= threshold) {
        const log: PerformanceLog = {
          queryKey: queryName,
          duration: Math.round(duration),
          status: isSuccess ? 'success' : 'error',
          timestamp: new Date().toISOString(),
        }

        const color = isSuccess ? '#10b981' : '#ef4444'
        const emoji = isSuccess ? '✅' : '❌'

        isDevEnvironment &&
          console.group(`%c${emoji} Query Performance: ${queryName}`, `color: ${color}; font-weight: bold;`)
        isDevEnvironment && console.log(`Duration: ${log.duration}ms`)
        isDevEnvironment && console.log(`Status: ${log.status}`)
        isDevEnvironment && console.log(`Timestamp: ${log.timestamp}`)
        isDevEnvironment && console.groupEnd()
        // Warn if query is slow
        if (duration > 1000) {
          isDevEnvironment && console.warn(`⚠️ Slow query detected: ${queryName} took ${Math.round(duration)}ms`)
        }
      }

      startTimeRef.current = 0
    }
  }, [isFetching, isSuccess, isError, enabled, queryName, threshold])

  return {
    lastDuration: startTimeRef.current > 0 ? 0 : performance.now() - startTimeRef.current,
  }
}

/**
 * Utility to aggregate and analyze query performance
 */
export class QueryPerformanceMonitor {
  private static logs: PerformanceLog[] = []
  private static maxLogs = 100

  static addLog(log: PerformanceLog) {
    this.logs.push(log)
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }
  }

  static getStats(queryKey?: string) {
    const relevantLogs = queryKey ? this.logs.filter((log) => log.queryKey === queryKey) : this.logs

    if (relevantLogs.length === 0) {
      return null
    }

    const durations = relevantLogs.map((log) => log.duration)
    const sum = durations.reduce((a, b) => a + b, 0)
    const avg = sum / durations.length
    const min = Math.min(...durations)
    const max = Math.max(...durations)
    const successCount = relevantLogs.filter((log) => log.status === 'success').length
    const errorCount = relevantLogs.filter((log) => log.status === 'error').length

    return {
      count: relevantLogs.length,
      avg: Math.round(avg),
      min,
      max,
      successCount,
      errorCount,
      successRate: ((successCount / relevantLogs.length) * 100).toFixed(1) + '%',
    }
  }

  static printStats(queryKey?: string) {
    const stats = this.getStats(queryKey)
    if (!stats) {
      isDevEnvironment && console.log('No performance data available')
      return
    }

    console.group('📊 Query Performance Statistics' + (queryKey ? ` - ${queryKey}` : ''))
    console.table(stats)
    console.groupEnd()
  }

  static clear() {
    this.logs = []
  }
}

// Make available globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  ;(window as any).queryPerformance = QueryPerformanceMonitor
}
