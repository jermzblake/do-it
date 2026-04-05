import { useState } from 'react'
import { ChevronDown, ChevronUp, Play, Pause, RotateCcw, X, Timer, Coffee, Minus, Plus } from 'lucide-react'
import { Button } from '@/client/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/client/components/ui/select'
import { cn } from '@/client/lib/utils'
import { usePomodoroTimer, POMODORO_MODES, type PomodoroModeKey } from '@/client/context/pomodoro-context'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatSeconds(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  const rem = m % 60
  return rem === 0 ? `${h}h` : `${h}h ${rem}m`
}

// ---------------------------------------------------------------------------
// Phase Badge
// ---------------------------------------------------------------------------

function PhaseBadge({ phase }: { phase: 'work' | 'rest' }) {
  if (phase === 'work') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
        <Timer className="size-3" />
        WORK
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-2 py-0.5 text-xs font-semibold text-teal-700">
      <Coffee className="size-3" />
      REST
    </span>
  )
}

// ---------------------------------------------------------------------------
// Pomodoro Panel
// ---------------------------------------------------------------------------

export function PomodoroPanel() {
  const { state, pauseResume, reset, endSession, setMode, setFlowtimeRestMinutes, startFlowtimeRest } =
    usePomodoroTimer()

  const [collapsed, setCollapsed] = useState(false)

  // Stopwatch display for Flowtime work phase (counts up using elapsed work time)
  const stopwatchSeconds = state.secondsElapsedWork

  // Don't render when no session is active
  if (state.status === 'idle' && state.taskId === null) return null

  const isFlowtime = state.mode === 'flowtime'
  const isFlowtimeWork = isFlowtime && state.phase === 'work'
  const showFlowtimeRestSelector = isFlowtimeWork && state.status === 'paused'

  const timeDisplay = isFlowtimeWork
    ? formatSeconds(stopwatchSeconds) // Stopwatch counts up
    : state.secondsRemaining !== null
      ? formatSeconds(state.secondsRemaining)
      : '--:--'

  const handleModeChange = (value: string) => {
    setMode(value as PomodoroModeKey)
  }

  return (
    <div
      className={cn(
        'fixed z-[60] bottom-0 left-0 right-0',
        'md:top-4 md:left-4 md:bottom-auto md:right-auto md:w-80',
        'bg-white border border-slate-200 shadow-2xl',
        'rounded-t-2xl md:rounded-2xl',
        'transition-all duration-200',
      )}
    >
      {/* Header — always visible */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
        onClick={() => setCollapsed((c) => !c)}
        role="button"
        aria-expanded={!collapsed}
        aria-label={collapsed ? 'Expand pomodoro timer' : 'Collapse pomodoro timer'}
      >
        <div className="flex items-center gap-2 min-w-0">
          <PhaseBadge phase={state.phase} />
          <span className="text-sm font-medium text-slate-700 truncate max-w-[120px] md:max-w-[160px]">
            {state.taskName}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono text-sm font-semibold text-slate-900 tabular-nums">
            {isFlowtimeWork ? `+${timeDisplay}` : timeDisplay}
          </span>
          {collapsed ? (
            <ChevronUp className="size-4 text-slate-500" />
          ) : (
            <ChevronDown className="size-4 text-slate-500" />
          )}
        </div>
      </div>

      {/* Expanded body */}
      {!collapsed && (
        <div className="px-4 pb-4 space-y-4 border-t border-slate-100">
          {/* Mode selector — disabled while running */}
          <div className="pt-3">
            <label className="text-xs text-slate-500 font-medium mb-1 block">Mode</label>
            <Select value={state.mode} onValueChange={handleModeChange} disabled={state.status === 'running'}>
              <SelectTrigger className="w-full h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(POMODORO_MODES).map((m) => (
                  <SelectItem key={m.key} value={m.key} className="text-xs">
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Big time display */}
          <div className="text-center">
            <div className="font-mono text-5xl font-bold text-slate-900 tabular-nums tracking-widest">
              {isFlowtimeWork ? `+${timeDisplay}` : timeDisplay}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isFlowtimeWork
                ? 'Stopwatch running — pause to start rest'
                : state.phase === 'work'
                  ? `Work phase — ${POMODORO_MODES[state.mode].label}`
                  : 'Rest phase — take a break'}
            </p>
          </div>

          {/* Flowtime rest selector (shown when paused on work phase) */}
          {showFlowtimeRestSelector && (
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 space-y-2">
              <p className="text-xs font-semibold text-teal-700">Set rest duration</p>
              <div className="flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setFlowtimeRestMinutes(state.flowtimeRestMinutes - 5)}
                  disabled={state.flowtimeRestMinutes <= 5}
                  aria-label="Decrease rest by 5 minutes"
                >
                  <Minus className="size-3" />
                </Button>
                <span className="font-semibold text-teal-800 min-w-[56px] text-center">
                  {state.flowtimeRestMinutes} min
                </span>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setFlowtimeRestMinutes(state.flowtimeRestMinutes + 5)}
                  aria-label="Increase rest by 5 minutes"
                >
                  <Plus className="size-3" />
                </Button>
              </div>
              <Button size="sm" className="w-full bg-teal-600 hover:bg-teal-700 text-white" onClick={startFlowtimeRest}>
                <Coffee className="size-3" />
                Start {state.flowtimeRestMinutes}m Rest
              </Button>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Pause / Resume */}
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={pauseResume}
              disabled={state.status === 'idle'}
            >
              {state.status === 'running' ? (
                <>
                  <Pause className="size-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="size-4" />
                  Resume
                </>
              )}
            </Button>

            {/* Reset */}
            <Button
              variant="outline"
              size="icon-sm"
              onClick={reset}
              title="Reset current phase"
              aria-label="Reset current phase"
            >
              <RotateCcw className="size-4" />
            </Button>

            {/* End session */}
            <Button
              variant="outline"
              size="icon-sm"
              onClick={endSession}
              title="End session"
              aria-label="End session"
              className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
            >
              <X className="size-4" />
            </Button>
          </div>

          {/* Elapsed footer */}
          <div className="flex justify-between text-xs text-slate-400 border-t border-slate-100 pt-3">
            <span>
              Work elapsed:{' '}
              <span className="font-semibold text-slate-600">{formatElapsed(state.secondsElapsedWork)}</span>
            </span>
            <span>
              Rest elapsed:{' '}
              <span className="font-semibold text-slate-600">{formatElapsed(state.secondsElapsedRest)}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
