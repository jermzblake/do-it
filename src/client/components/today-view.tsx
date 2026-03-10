import { useState } from 'react'
import { CheckCircle2, CalendarClock, Clock, Layers, Target, Zap } from 'lucide-react'
import TodayColumn from '@/client/components/today-column'
import { useTodayCard } from '@/client/hooks/use-today-card'
// TODO replace seed data once we have an API
import { SEED } from '@/client/utils/today-seed'
import type { Task } from '@/shared/task'
import { isToday, isPast } from '@/client/utils/date-predicates'

function getColumn(task: Task) {
  const { dueDate: dd, startBy: sb } = task
  if (dd && isPast(dd as string)) return 'overdue'
  if (dd && isToday(dd as string)) return 'due-today'
  if (sb && isToday(sb as string)) return 'start-today'
  return 'upcoming'
}

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'big', label: 'Big' },
  { value: 'medium', label: 'Medium' },
  { value: 'small', label: 'Small' },
]

const COLUMNS: ('overdue' | 'due-today' | 'start-today' | 'upcoming')[] = [
  'overdue',
  'due-today',
  'start-today',
  'upcoming',
]

export default function TodayView() {
  const [tasks, setTasks] = useState(SEED)
  const [filter, setFilter] = useState('all')
  const [showEmpty, setShowEmpty] = useState(false)
  const [showDone, setShowDone] = useState(false)
  const { getTaskUrgency } = useTodayCard()

  const onChange = (id: string, status: string) => setTasks((p) => p.map((t) => (t.id === id ? { ...t, status } : t)))

  const filteredTasks = tasks.filter((t) => {
    if (!showDone && (t.status === 'completed' || t.status === 'cancelled')) return false
    if (filter !== 'all') {
      const urgency = getTaskUrgency(t)
      if (filter === 'big' && urgency !== 'overdue' && t.effort >= 4) return true
      if (filter === 'medium' && urgency !== 'overdue' && t.effort >= 2 && t.effort < 4) return true
      if (filter === 'small' && urgency !== 'overdue' && t.effort < 2) return true
      return false
    }
    return true
  })
  const buckets: Record<string, Task[]> = { overdue: [], ['due-today']: [], ['start-today']: [], upcoming: [] }
  filteredTasks.forEach((task) => buckets[getColumn(task)]?.push(task))

  const pills = [
    {
      label: 'To Do',
      count: tasks.filter((task) => task.status === 'todo').length,
      className: 'text-slate-400 bg-slate-800 border-slate-700',
    },
    {
      label: 'In Progress',
      count: tasks.filter((task) => task.status === 'in_progress').length,
      className: 'text-sky-400 bg-sky-500/10 border-sky-500/25',
    },
    {
      label: 'Done',
      count: tasks.filter((task) => task.status === 'completed').length,
      className: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
    },
    {
      label: 'Blocked',
      count: tasks.filter((task) => task.status === 'blocked').length,
      className: 'text-red-400 bg-red-500/10 border-red-500/25',
    },
  ].filter((p) => p.count > 0)

  const dateString = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10 flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
            <CalendarClock className="w-3.5 h-3.5" />
            {dateString}
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-50">Today</h1>
            <div className="flex gap-2 flex-wrap">
              {pills.map(({ label, count, className }) => (
                <span
                  key={label}
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${className}`}
                >
                  <span className="font-semibold">{count}</span>
                  <span className="opacity-70">{label}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap items-center">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors
                ${
                  filter === f.value
                    ? 'bg-violet-500/20 border-violet-500/50 text-violet-300'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300'
                }`}
            >
              {f.label}
            </button>
          ))}
          <button
            onClick={() => setShowDone((value) => !value)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors
              ${showDone ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400' : 'bg-slate-800/60 border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-500'}`}
          >
            <CheckCircle2 className="w-3 h-3" />
            {showDone ? 'Hide' : 'Show'} done
          </button>
          <button
            onClick={() => setShowEmpty((value) => !value)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors
              ${showEmpty ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-slate-800/60 border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-500'}`}
          >
            <Clock className="w-3 h-3" />
            {showEmpty ? 'Hide' : 'Show'} empty columns
          </button>
          <span className="ml-auto text-xs text-slate-600">
            {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {COLUMNS.map((c) => (
            <TodayColumn key={c} bucket={c} tasks={buckets[c] as Task[]} showEmpty={showEmpty} onChange={onChange} />
          ))}
        </div>

        {/* Grid */}
        {filteredTasks.length > 0 && (
          <div className="flex flex-wrap gap-x-5 gap-y-2 pt-4 border-t border-slate-800/80 text-[10px] text-slate-600">
            {[
              { Icon: Zap, color: 'text-amber-400', label: 'Big (effort 4–5)' },
              { Icon: Target, color: 'text-sky-400', label: 'Medium (effort 2–3)' },
              { Icon: Layers, color: 'text-slate-400', label: 'Small (effort 1)' },
            ].map(({ Icon, color, label }) => (
              <span key={label} className="flex items-center gap-1.5">
                <Icon className={`w-3 h-3 ${color}`} />
                {label}
              </span>
            ))}
            <span className="text-slate-800">|</span>
            {[
              { d: 'bg-red-400', label: 'High priority' },
              { d: 'bg-amber-400', label: 'Medium priority' },
              { d: 'bg-slate-500', label: 'Low priority' },
            ].map(({ d, label }) => (
              <span key={label} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${d}`} />
                {label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
