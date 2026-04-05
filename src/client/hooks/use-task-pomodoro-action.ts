import { useCallback, useMemo, useState } from 'react'
import type { Task } from '@/shared/task'
import { DEFAULT_MODE, type PomodoroModeKey, usePomodoroTimer } from '@/client/context/pomodoro-context'

interface UseTaskPomodoroActionResult {
  buttonLabel: string
  selectedMode: PomodoroModeKey
  onSelectedModeChange: (mode: PomodoroModeKey) => void
  startPomodoroForTask: () => void
}

/**
 * Encapsulates Pomodoro start/restart behavior for a task.
 * Keeps UI components focused on presentation while this hook owns action policy.
 */
export function useTaskPomodoroAction(task: Pick<Task, 'id' | 'name'>): UseTaskPomodoroActionResult {
  const { state, startSession } = usePomodoroTimer()
  const [selectedMode, setSelectedMode] = useState<PomodoroModeKey>(state.mode ?? DEFAULT_MODE)

  const buttonLabel = useMemo(
    () => (state.taskId === task.id ? 'Restart Focus Timer' : 'Start Focus Timer'),
    [state.taskId, task.id],
  )

  const startPomodoroForTask = useCallback(() => {
    const hasActiveSession = state.taskId !== null
    const isDifferentTask = hasActiveSession && state.taskId !== task.id

    if (isDifferentTask) {
      const activeTaskName = state.taskName ?? 'the current task'
      const confirmed = window.confirm(`Replace current Pomodoro session for "${activeTaskName}"?`)
      if (!confirmed) return
    }

    startSession({ id: task.id, name: task.name }, selectedMode)
  }, [selectedMode, startSession, state.taskId, state.taskName, task.id, task.name])

  return {
    buttonLabel,
    selectedMode,
    onSelectedModeChange: setSelectedMode,
    startPomodoroForTask,
  }
}
