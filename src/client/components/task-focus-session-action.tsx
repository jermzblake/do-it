import { Timer } from 'lucide-react'
import { Button } from '@/client/components/ui/button'

interface TaskFocusSessionActionProps {
  buttonLabel: string
  onStart: () => void
  disabled: boolean
}

export const TaskFocusSessionAction = ({ buttonLabel, onStart, disabled }: TaskFocusSessionActionProps) => {
  return (
    <div className="rounded-xl border border-slate-900/20 bg-slate-50 p-3 md:p-4">
      <div className="mb-3">
        <p className="text-sm font-semibold text-slate-900">Focus Session</p>
        <p className="text-xs text-slate-600">Run a Pomodoro timer for this task.</p>
      </div>
      <Button size="sm" className="w-full bg-slate-950 text-white hover:bg-black" onClick={onStart} disabled={disabled}>
        <Timer className="w-4 h-4 mr-2" />
        {buttonLabel}
      </Button>
    </div>
  )
}
