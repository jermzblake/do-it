import { Timer } from 'lucide-react'
import { Button } from '@/client/components/ui/button'
import { ButtonGroup } from '@/client/components/ui/button-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/client/components/ui/select'
import { POMODORO_MODES, type PomodoroModeKey } from '@/client/context/pomodoro-context'

interface TaskFocusSessionActionProps {
  buttonLabel: string
  selectedMode: PomodoroModeKey
  onSelectedModeChange: (mode: PomodoroModeKey) => void
  onStart: () => void
  disabled: boolean
}

export const TaskFocusSessionAction = ({
  buttonLabel,
  selectedMode,
  onSelectedModeChange,
  onStart,
  disabled,
}: TaskFocusSessionActionProps) => {
  return (
    <div className="rounded-xl border border-slate-900/20 bg-slate-50 p-3 md:p-4">
      <div className="mb-3">
        <p className="text-sm font-semibold text-slate-900">Focus Session</p>
        <p className="text-xs text-slate-600">Run a Pomodoro timer for this task.</p>
      </div>
      <ButtonGroup className="w-full">
        <Button
          size="sm"
          className="flex-1 bg-slate-950 text-white hover:bg-black"
          onClick={onStart}
          disabled={disabled}
        >
          <Timer className="w-4 h-4 mr-2" />
          {buttonLabel}
        </Button>

        <Select
          value={selectedMode}
          onValueChange={(value) => onSelectedModeChange(value as PomodoroModeKey)}
          disabled={disabled}
        >
          <SelectTrigger
            size="sm"
            className="w-10 justify-center bg-white px-2 text-slate-900 md:min-w-[200px] md:justify-between md:px-3"
            aria-label="Choose focus mode"
          >
            <SelectValue className="hidden md:flex" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(POMODORO_MODES).map((mode) => (
              <SelectItem key={mode.key} value={mode.key}>
                {mode.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </ButtonGroup>
    </div>
  )
}
