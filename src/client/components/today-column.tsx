import type { Task } from '@/shared/task'
import { AlertCircle, Flame, Play, CalendarDays } from 'lucide-react'
import TodayCard from '@/client/components/today-card'

const BUCKET_CONFIG = {
  overdue: {
    label: 'Overdue',
    sub: 'Past due date',
    Icon: AlertCircle,
    accent: 'text-red-400',
    hbg: 'bg-red-500/5',
    border: 'border-red-500/40',
    empty: 'No overdue tasks',
  },
  'due-today': {
    label: 'Due Today',
    sub: 'Due by end of day',
    Icon: Flame,
    accent: 'text-amber-400',
    hbg: 'bg-amber-500/5',
    border: 'border-amber-500/40',
    empty: 'Nothing due today',
  },
  'start-today': {
    label: 'Start Today',
    sub: 'Scheduled to begin',
    Icon: Play,
    accent: 'text-sky-400',
    hbg: 'bg-sky-500/5',
    border: 'border-sky-500/40',
    empty: 'Nothing to start today',
  },
  upcoming: {
    label: 'Upcoming',
    sub: 'Due soon',
    Icon: CalendarDays,
    accent: 'text-violet-400',
    hbg: 'bg-violet-500/5',
    border: 'border-violet-500/40',
    empty: 'No upcoming tasks',
  },
}

function TodayColumn({
  bucket,
  tasks,
  showEmpty = true,
  onTaskSelect,
}: {
  bucket: 'overdue' | 'due-today' | 'start-today' | 'upcoming'
  tasks: Task[]
  showEmpty?: boolean
  onTaskSelect?: (task: Task) => void
}) {
  const config = BUCKET_CONFIG[bucket]
  if (!tasks.length && !showEmpty) return null
  return (
    <div className="flex flex-col gap-3 min-w-0">
      <div
        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-t-2
        ${config.hbg} ${config.border} border border-slate-800/60`}
      >
        <span className={config.accent}>
          <config.Icon className="w-3.5 h-3.5" />
        </span>
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-semibold uppercase tracking-widest ${config.accent}`}>{config.label}</p>
          <p className="text-[10px] text-slate-600 leading-tight">{config.sub}</p>
        </div>
        <span
          className={`text-[10px] font-bold w-5 h-5 flex items-center justify-center
          rounded-full ${tasks.length > 0 ? `${config.hbg} ${config.accent}` : 'text-slate-700'}`}
        >
          {tasks.length}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {tasks.map((t) => (
          <TodayCard key={t.id} task={t} onSelect={onTaskSelect ? () => onTaskSelect(t) : undefined} />
        ))}
        {tasks.length === 0 && (
          <div
            className="flex items-center justify-center rounded-xl border border-dashed
            border-slate-800 text-[11px] text-slate-700 py-6"
          >
            {config.empty}
          </div>
        )}
      </div>
    </div>
  )
}

export default TodayColumn
