import React from 'react'
import { describe, it, expect } from 'bun:test'
import { renderHook, waitFor, act } from '@testing-library/react'
import { PomodoroProvider, usePomodoroTimer } from '@/client/context/pomodoro-context'

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
})
