import React from 'react'
import { describe, it, expect } from 'bun:test'
import { renderHook, waitFor, act } from '@testing-library/react'
import { PomodoroProvider, usePomodoroTimer } from '@/client/context/pomodoro-context'
import { POMODORO_MODES } from '@/client/context/pomodoro-context'

type NotificationGlobal = typeof globalThis & {
  Notification?: typeof Notification
}

function wrapper({ children }: { children: React.ReactNode }) {
  return <PomodoroProvider>{children}</PomodoroProvider>
}

describe('pomodoro context startSession mode selection', () => {
  it('starts with default mode when no override is provided', async () => {
    const { result } = renderHook(() => usePomodoroTimer(), { wrapper })

    act(() => {
      result.current.startSession({ id: 't1', name: 'Task 1' })
    })

    await waitFor(() => {
      expect(result.current.state.taskId).toBe('t1')
      expect(result.current.state.mode).toBe('feature_dev')
      expect(result.current.state.secondsRemaining).toBe(50 * 60)
      expect(result.current.state.status).toBe('running')
    })
  })

  it('uses mode override for fixed-interval protocols', async () => {
    const { result } = renderHook(() => usePomodoroTimer(), { wrapper })

    act(() => {
      result.current.startSession({ id: 't2', name: 'Task 2' }, 'incident_response')
    })

    await waitFor(() => {
      expect(result.current.state.mode).toBe('incident_response')
      expect(result.current.state.secondsRemaining).toBe(15 * 60)
      expect(result.current.state.phase).toBe('work')
    })
  })

  it('uses flowtime override with stopwatch-style work phase', async () => {
    const { result } = renderHook(() => usePomodoroTimer(), { wrapper })

    act(() => {
      result.current.startSession({ id: 't3', name: 'Task 3' }, 'flowtime')
    })

    await waitFor(() => {
      expect(result.current.state.mode).toBe('flowtime')
      expect(result.current.state.secondsRemaining).toBeNull()
      expect(result.current.state.status).toBe('running')
    })
  })

  it('does not allow mode changes while running', async () => {
    const { result } = renderHook(() => usePomodoroTimer(), { wrapper })

    act(() => {
      result.current.startSession({ id: 't4', name: 'Task 4' }, 'standard')
    })

    await waitFor(() => {
      expect(result.current.state.mode).toBe('standard')
      expect(result.current.state.status).toBe('running')
    })

    act(() => {
      result.current.setMode('architecture')
    })

    expect(result.current.state.mode).toBe('standard')
  })

  it('transitions from work to rest when work phase completes and triggers alarm side-effect', async () => {
    const originalStandard = { ...POMODORO_MODES.standard }
    const notificationGlobal = globalThis as NotificationGlobal
    const OriginalNotification = notificationGlobal.Notification
    const notificationCalls: Array<{ title: string; body?: string }> = []

    class NotificationMock {
      static permission = 'granted'

      static requestPermission = async () => 'granted'

      constructor(title: string, options?: NotificationOptions) {
        notificationCalls.push({ title, body: options?.body })
      }
    }

    POMODORO_MODES.standard.workSeconds = 1
    POMODORO_MODES.standard.restSeconds = 2
    notificationGlobal.Notification = NotificationMock as unknown as typeof Notification

    try {
      const { result } = renderHook(() => usePomodoroTimer(), { wrapper })

      act(() => {
        result.current.startSession({ id: 't5', name: 'Task 5' }, 'standard')
      })

      await waitFor(
        () => {
          expect(result.current.state.phase).toBe('rest')
          expect(result.current.state.status).toBe('running')
          expect(result.current.state.secondsRemaining).toBe(2)
          expect(notificationCalls.length).toBe(1)
          expect(notificationCalls[0]?.title).toBe('Pomodoro Timer')
          expect(notificationCalls[0]?.body).toContain('Work phase complete')
        },
        { timeout: 2500 },
      )
    } finally {
      POMODORO_MODES.standard.workSeconds = originalStandard.workSeconds
      POMODORO_MODES.standard.restSeconds = originalStandard.restSeconds
      notificationGlobal.Notification = OriginalNotification
    }
  })

  it('resets the current Flowtime stopwatch without clearing total elapsed work', async () => {
    const { result } = renderHook(() => usePomodoroTimer(), { wrapper })

    act(() => {
      result.current.startSession({ id: 't6', name: 'Task 6' }, 'flowtime')
    })

    await waitFor(
      () => {
        expect(result.current.state.flowtimeWorkSeconds).toBeGreaterThan(0)
        expect(result.current.state.secondsElapsedWork).toBeGreaterThan(0)
      },
      { timeout: 2500 },
    )

    const totalElapsedBeforeReset = result.current.state.secondsElapsedWork

    act(() => {
      result.current.reset()
    })

    await waitFor(() => {
      expect(result.current.state.flowtimeWorkSeconds).toBe(0)
      expect(result.current.state.secondsElapsedWork).toBe(totalElapsedBeforeReset)
      expect(result.current.state.mode).toBe('flowtime')
      expect(result.current.state.phase).toBe('work')
      expect(result.current.state.status).toBe('running')
    })
  })
})
