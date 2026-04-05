import React from 'react'
import { describe, it, expect, mock, afterEach } from 'bun:test'
import { cleanup, render, screen, fireEvent } from '@testing-library/react'
import type { PomodoroModeKey } from '@/client/context/pomodoro-context'
import { TaskFocusSessionAction } from '@/client/components/task-focus-session-action'

afterEach(() => {
  cleanup()
})

describe('TaskFocusSessionAction', () => {
  it('renders focus heading, helper copy, and start button label', () => {
    render(
      <TaskFocusSessionAction
        buttonLabel="Start Focus Timer"
        selectedMode="feature_dev"
        onSelectedModeChange={mock(() => {})}
        onStart={mock(() => {})}
        disabled={false}
      />,
    )

    expect(screen.getByText('Focus Session')).toBeTruthy()
    expect(screen.getByText('Run a Pomodoro timer for this task.')).toBeTruthy()
    expect(screen.getByRole('button', { name: /start focus timer/i })).toBeTruthy()
    expect(screen.getByLabelText('Choose focus mode')).toBeTruthy()
  })

  it('calls onStart when primary button is clicked', () => {
    const onStart = mock(() => {})

    render(
      <TaskFocusSessionAction
        buttonLabel="Start Focus Timer"
        selectedMode="feature_dev"
        onSelectedModeChange={mock(() => {})}
        onStart={onStart}
        disabled={false}
      />,
    )

    const startButtons = screen.getAllByRole('button', { name: /start focus timer/i })
    fireEvent.click(startButtons[0]!)
    expect(onStart).toHaveBeenCalledTimes(1)
  })

  it('disables both split-button interactions when disabled=true', () => {
    const onStart = mock(() => {})
    const onModeChange = mock<(mode: PomodoroModeKey) => void>(() => {})

    render(
      <TaskFocusSessionAction
        buttonLabel="Restart Focus Timer"
        selectedMode="feature_dev"
        onSelectedModeChange={onModeChange}
        onStart={onStart}
        disabled={true}
      />,
    )

    const startButton = screen.getByRole('button', { name: /restart focus timer/i })
    const modeTriggers = screen.getAllByLabelText('Choose focus mode')
    const modeTrigger = modeTriggers[0]

    expect(startButton.getAttribute('disabled')).not.toBeNull()
    expect(modeTrigger?.getAttribute('data-disabled')).not.toBeNull()

    fireEvent.click(startButton)

    expect(onStart).toHaveBeenCalledTimes(0)
    expect(onModeChange).toHaveBeenCalledTimes(0)
  })
})
