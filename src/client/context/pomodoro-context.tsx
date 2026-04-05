import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { Task } from '@/shared/task'
import { useKitchenTimerAlarm } from '@/client/hooks/use-kitchen-timer-alarm'

// ---------------------------------------------------------------------------
// Mode configuration
// ---------------------------------------------------------------------------

export type PomodoroModeKey = 'standard' | 'feature_dev' | 'architecture' | 'incident_response' | 'flowtime'

export interface PomodoroMode {
  key: PomodoroModeKey
  label: string
  /** Work duration in seconds. null = Flowtime (stopwatch). */
  workSeconds: number | null
  /** Rest duration in seconds. null = user-configured (Flowtime). */
  restSeconds: number | null
}

export const POMODORO_MODES: Record<PomodoroModeKey, PomodoroMode> = {
  standard: {
    key: 'standard',
    label: 'Standard',
    workSeconds: 25 * 60,
    restSeconds: 5 * 60,
  },
  feature_dev: {
    key: 'feature_dev',
    label: 'Feature Development',
    workSeconds: 50 * 60,
    restSeconds: 10 * 60,
  },
  architecture: {
    key: 'architecture',
    label: 'Architecture / Refactoring',
    workSeconds: 90 * 60,
    restSeconds: 20 * 60,
  },
  incident_response: {
    key: 'incident_response',
    label: 'Incident Response',
    workSeconds: 15 * 60,
    restSeconds: 3 * 60,
  },
  flowtime: {
    key: 'flowtime',
    label: 'Flowtime',
    workSeconds: null,
    restSeconds: null,
  },
}

export const DEFAULT_MODE: PomodoroModeKey = 'feature_dev'

// ---------------------------------------------------------------------------
// State types
// ---------------------------------------------------------------------------

export type PomodoroPhase = 'work' | 'rest'
export type PomodoroStatus = 'idle' | 'running' | 'paused'

export interface PomodoroState {
  taskId: string | null
  taskName: string | null
  mode: PomodoroModeKey
  phase: PomodoroPhase
  status: PomodoroStatus
  /**
   * Seconds remaining in the current phase.
   * null = Flowtime work phase (stopwatch — counts up).
   */
  secondsRemaining: number | null
  /** Elapsed seconds spent in work phases across all intervals. */
  secondsElapsedWork: number
  /** Elapsed seconds spent in rest phases across all intervals. */
  secondsElapsedRest: number
  /** Configurable rest duration for Flowtime mode, in minutes. */
  flowtimeRestMinutes: number
}

const INITIAL_STATE: PomodoroState = {
  taskId: null,
  taskName: null,
  mode: DEFAULT_MODE,
  phase: 'work',
  status: 'idle',
  secondsRemaining: null,
  secondsElapsedWork: 0,
  secondsElapsedRest: 0,
  flowtimeRestMinutes: 10,
}

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

interface PomodoroContextValue {
  state: PomodoroState
  startSession: (task: Pick<Task, 'id' | 'name'>, modeOverride?: PomodoroModeKey) => void
  pauseResume: () => void
  reset: () => void
  endSession: () => void
  setMode: (mode: PomodoroModeKey) => void
  setFlowtimeRestMinutes: (minutes: number) => void
  startFlowtimeRest: () => void
}

const PomodoroContext = createContext<PomodoroContextValue | null>(null)

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PomodoroState>(INITIAL_STATE)
  const { playAlarm } = useKitchenTimerAlarm()

  // Use a ref for the interval so tick callbacks always have fresh access
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  // Track deferred tick starts so they can be canceled during resets/ends
  const startTickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Track whether notification permission has been requested this session
  const notificationRequestedRef = useRef(false)

  // Stopwatch counter for Flowtime work phase (seconds elapsed this interval)
  const flowtimeStopwatchRef = useRef(0)

  const clearPendingTickStart = useCallback(() => {
    if (startTickTimeoutRef.current !== null) {
      clearTimeout(startTickTimeoutRef.current)
      startTickTimeoutRef.current = null
    }
  }, [])

  const clearTick = useCallback(() => {
    clearPendingTickStart()
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [clearPendingTickStart])

  // Request notification permission once on first session start
  const requestNotificationPermission = useCallback(async () => {
    if (notificationRequestedRef.current) return
    if (typeof Notification === 'undefined') return
    if (Notification.permission === 'granted' || Notification.permission === 'denied') {
      notificationRequestedRef.current = true
      return
    }
    notificationRequestedRef.current = true
    await Notification.requestPermission().catch(() => {})
  }, [])

  const startTick = useCallback(
    (getState: () => PomodoroState) => {
      clearTick()
      intervalRef.current = setInterval(() => {
        setState((prev) => {
          const mode = POMODORO_MODES[prev.mode]

          // Flowtime work phase: count up (stopwatch)
          if (prev.phase === 'work' && mode.workSeconds === null) {
            flowtimeStopwatchRef.current += 1
            return { ...prev, secondsElapsedWork: prev.secondsElapsedWork + 1 }
          }

          if (prev.secondsRemaining === null) return prev

          const next = prev.secondsRemaining - 1

          // Accumulate elapsed time
          const elapsedUpdate =
            prev.phase === 'work'
              ? { secondsElapsedWork: prev.secondsElapsedWork + 1 }
              : { secondsElapsedRest: prev.secondsElapsedRest + 1 }

          if (next > 0) {
            return { ...prev, secondsRemaining: next, ...elapsedUpdate }
          }

          // Phase complete — trigger alarm and transition
          const currentState = getState()
          const alarmMsg =
            prev.phase === 'work'
              ? `Work phase complete for "${currentState.taskName ?? 'task'}". Time to rest!`
              : `Rest complete for "${currentState.taskName ?? 'task'}". Ready for the next interval!`

          playAlarm(alarmMsg)

          if (prev.phase === 'work') {
            // Transition to rest
            const restSeconds = mode.restSeconds ?? prev.flowtimeRestMinutes * 60
            return {
              ...prev,
              ...elapsedUpdate,
              phase: 'rest',
              secondsRemaining: restSeconds,
            }
          } else {
            // Rest complete → go idle, keep elapsed totals, reset for next round
            clearTick()
            return {
              ...prev,
              ...elapsedUpdate,
              status: 'idle',
              phase: 'work',
              secondsRemaining: mode.workSeconds,
            }
          }
        })
      }, 1000)
    },
    [clearTick, playAlarm],
  )

  // Keep a stable ref to current state for use inside tick callbacks
  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])

  const scheduleTickStart = useCallback(() => {
    clearPendingTickStart()
    startTickTimeoutRef.current = setTimeout(() => {
      startTickTimeoutRef.current = null
      startTick(() => stateRef.current)
    }, 0)
  }, [clearPendingTickStart, startTick])

  // Clean up on unmount
  useEffect(() => () => clearTick(), [clearTick])

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  const startSession = useCallback(
    (task: Pick<Task, 'id' | 'name'>, modeOverride?: PomodoroModeKey) => {
      requestNotificationPermission()
      clearTick()
      flowtimeStopwatchRef.current = 0

      setState((prev) => {
        const activeMode = modeOverride ?? prev.mode
        const mode = POMODORO_MODES[activeMode]
        const newState: PomodoroState = {
          ...INITIAL_STATE,
          mode: activeMode,
          flowtimeRestMinutes: prev.flowtimeRestMinutes,
          taskId: task.id,
          taskName: task.name,
          phase: 'work',
          status: 'running',
          // Flowtime work = null (stopwatch); others start countdown
          secondsRemaining: mode.workSeconds,
        }
        return newState
      })

      // We can't call startTick inside setState, so defer 1 frame
      scheduleTickStart()
    },
    [clearTick, requestNotificationPermission, scheduleTickStart],
  )

  const pauseResume = useCallback(() => {
    setState((prev) => {
      if (prev.status === 'running') {
        clearTick()
        return { ...prev, status: 'paused' }
      }
      if (prev.status === 'paused') {
        // Resume — tick will be re-started below
        return { ...prev, status: 'running' }
      }
      return prev
    })
  }, [clearTick])

  // Kick the tick back off when status transitions to running from paused
  const prevStatusRef = useRef(state.status)
  useEffect(() => {
    if (prevStatusRef.current === 'paused' && state.status === 'running') {
      startTick(() => stateRef.current)
    }
    prevStatusRef.current = state.status
  }, [state.status, startTick])

  const reset = useCallback(() => {
    clearTick()
    setState((prev) => {
      const mode = POMODORO_MODES[prev.mode]
      const secondsRemaining =
        prev.phase === 'work' ? mode.workSeconds : (mode.restSeconds ?? prev.flowtimeRestMinutes * 60)

      // Flowtime work resets stopwatch
      if (prev.phase === 'work' && mode.workSeconds === null) {
        flowtimeStopwatchRef.current = 0
      }

      return {
        ...prev,
        status: 'running',
        secondsRemaining,
      }
    })
    scheduleTickStart()
  }, [clearTick, scheduleTickStart])

  const endSession = useCallback(() => {
    clearTick()
    flowtimeStopwatchRef.current = 0
    setState(INITIAL_STATE)
  }, [clearTick])

  const setMode = useCallback((mode: PomodoroModeKey) => {
    // Only allow changing mode when idle or paused
    setState((prev) => {
      if (prev.status === 'running') return prev
      return { ...prev, mode }
    })
  }, [])

  const setFlowtimeRestMinutes = useCallback((minutes: number) => {
    const clamped = Math.max(5, minutes)
    setState((prev) => ({ ...prev, flowtimeRestMinutes: clamped }))
  }, [])

  const startFlowtimeRest = useCallback(() => {
    clearTick()
    setState((prev) => {
      if (prev.mode !== 'flowtime' || prev.phase !== 'work') return prev
      return {
        ...prev,
        phase: 'rest',
        status: 'running',
        secondsRemaining: prev.flowtimeRestMinutes * 60,
      }
    })
    scheduleTickStart()
  }, [clearTick, scheduleTickStart])

  const value: PomodoroContextValue = {
    state,
    startSession,
    pauseResume,
    reset,
    endSession,
    setMode,
    setFlowtimeRestMinutes,
    startFlowtimeRest,
  }

  return <PomodoroContext.Provider value={value}>{children}</PomodoroContext.Provider>
}

// ---------------------------------------------------------------------------
// Consumer hook
// ---------------------------------------------------------------------------

export function usePomodoroTimer(): PomodoroContextValue {
  const ctx = useContext(PomodoroContext)
  if (!ctx) {
    throw new Error('usePomodoroTimer must be used inside <PomodoroProvider>')
  }
  return ctx
}
