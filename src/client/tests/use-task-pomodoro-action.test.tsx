import React from 'react'
import { describe, it, expect, spyOn, afterEach } from 'bun:test'
import { renderHook, waitFor, act } from '@testing-library/react'
import { PomodoroProvider, usePomodoroTimer } from '@/client/context/pomodoro-context'
import { useTaskPomodoroAction } from '@/client/hooks/use-task-pomodoro-action'

function wrapper({ children }: { children: React.ReactNode }) {
  return <PomodoroProvider>{children}</PomodoroProvider>
}

afterEach(() => {
  if (typeof window !== 'undefined') {
    // @ts-ignore
    window.confirm = globalThis.confirm
  }
})

describe('useTaskPomodoroAction', () => {
  it('exposes start label before a task session exists', () => {
    const { result } = renderHook(() => useTaskPomodoroAction({ id: 'task-1', name: 'Task 1' }), { wrapper })

    expect(result.current.buttonLabel).toBe('Start Focus Timer')
    expect(result.current.selectedMode).toBe('feature_dev')
  })

  it('starts session using currently selected mode', async () => {
    const { result } = renderHook(
      () => {
        const action = useTaskPomodoroAction({ id: 'task-1', name: 'Task 1' })
        const pomodoro = usePomodoroTimer()
        return { action, pomodoro }
      },
      { wrapper },
    )

    act(() => {
      result.current.action.onSelectedModeChange('architecture')
    })

    await waitFor(() => {
      expect(result.current.action.selectedMode).toBe('architecture')
    })

    act(() => {
      result.current.action.startPomodoroForTask()
    })

    await waitFor(() => {
      expect(result.current.pomodoro.state.taskId).toBe('task-1')
      expect(result.current.pomodoro.state.mode).toBe('architecture')
      expect(result.current.pomodoro.state.secondsRemaining).toBe(90 * 60)
    })
  })

  it('shows restart label when current task already owns active session', async () => {
    const { result } = renderHook(
      () => {
        const action = useTaskPomodoroAction({ id: 'task-1', name: 'Task 1' })
        const pomodoro = usePomodoroTimer()
        return { action, pomodoro }
      },
      { wrapper },
    )

    act(() => {
      result.current.action.startPomodoroForTask()
    })

    await waitFor(() => {
      expect(result.current.pomodoro.state.taskId).toBe('task-1')
      expect(result.current.action.buttonLabel).toBe('Restart Focus Timer')
    })
  })

  it('does not replace active session when confirm is declined for different task', async () => {
    const confirmSpy = spyOn(window, 'confirm').mockReturnValue(false)

    const { result } = renderHook(
      () => {
        const first = useTaskPomodoroAction({ id: 'task-1', name: 'Task 1' })
        const second = useTaskPomodoroAction({ id: 'task-2', name: 'Task 2' })
        const pomodoro = usePomodoroTimer()
        return { first, second, pomodoro }
      },
      { wrapper },
    )

    act(() => {
      result.current.first.startPomodoroForTask()
    })

    await waitFor(() => {
      expect(result.current.pomodoro.state.taskId).toBe('task-1')
    })

    act(() => {
      result.current.second.startPomodoroForTask()
    })

    expect(confirmSpy).toHaveBeenCalledTimes(1)
    expect(result.current.pomodoro.state.taskId).toBe('task-1')
  })

  it('replaces active session when confirm is accepted for different task', async () => {
    const confirmSpy = spyOn(window, 'confirm').mockReturnValue(true)

    const { result } = renderHook(
      () => {
        const first = useTaskPomodoroAction({ id: 'task-1', name: 'Task 1' })
        const second = useTaskPomodoroAction({ id: 'task-2', name: 'Task 2' })
        const pomodoro = usePomodoroTimer()
        return { first, second, pomodoro }
      },
      { wrapper },
    )

    act(() => {
      result.current.first.startPomodoroForTask()
    })

    await waitFor(() => {
      expect(result.current.pomodoro.state.taskId).toBe('task-1')
    })

    act(() => {
      result.current.second.onSelectedModeChange('incident_response')
    })

    await waitFor(() => {
      expect(result.current.second.selectedMode).toBe('incident_response')
    })

    act(() => {
      result.current.second.startPomodoroForTask()
    })

    expect(confirmSpy).toHaveBeenCalledTimes(1)

    await waitFor(() => {
      expect(result.current.pomodoro.state.taskId).toBe('task-2')
      expect(result.current.pomodoro.state.mode).toBe('incident_response')
      expect(result.current.pomodoro.state.secondsRemaining).toBe(15 * 60)
    })
  })
})
