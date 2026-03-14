import { useState } from 'react'
import { Ban, CalendarClock, CheckCircle2, MoreHorizontal, Play, AlertCircle, Target, Layers, Zap } from 'lucide-react'
import { useTodayCard } from '@/client/hooks/use-today-card'
import { useUpdateTask } from '@/client/hooks/use-tasks'
import { StatusIcon } from '@/client/components/ui/status-icon'
import type { Task, TaskStatus } from '@/shared/task'
import { handleQuickStatusUpdate } from '@/client/utils/task-status-update'

const SIZE_CONFIG = {
  big: { label: 'Big', Icon: Zap, cls: 'bg-amber-500/10 text-amber-400 border-amber-500/25' },
  medium: { label: 'Medium', Icon: Target, cls: 'bg-sky-500/10 text-sky-400 border-sky-500/25' },
  small: { label: 'Small', Icon: Layers, cls: 'bg-slate-500/10 text-slate-400 border-slate-500/25' },
}

const TodayCard = ({ task }: { task: Task }) => {
  const [open, setOpen] = useState(false)
  const { formatDate } = useTodayCard()
  const updateTask = useUpdateTask(task.id)

  const handleStatusChange = async (newStatus: string) => {
    await handleQuickStatusUpdate(updateTask.mutateAsync, task, newStatus as TaskStatus)
  }

  const getSize = (effort: number) => (effort >= 4 ? 'big' : effort >= 2 ? 'medium' : 'small')
  const size = getSize(task.effort)
  const sizeConfig = SIZE_CONFIG[size]

  const dim = task.status === 'completed' || task.status === 'cancelled'

  type Priority = 1 | 2 | 3

  const PIPDOT: Record<Priority, string> = {
    1: 'bg-slate-500',
    2: 'bg-amber-400',
    3: 'bg-red-400',
  }

  const PIPLABEL: Record<Priority, string> = {
    1: 'Low',
    2: 'Medium',
    3: 'High',
  }

  const priority = task.priority as Priority

  return (
    <div
      className={`group relative flex flex-col gap-2.5 rounded-xl border px-4 py-3.5
      bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/70 hover:border-slate-600/70
      transition-all duration-150 ${dim ? 'opacity-40' : ''}`}
    >
      <span className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-full ${PIPDOT[priority]} opacity-60`} />
      <div className="flex items-start gap-2.5">
        <button
          onClick={() => handleStatusChange(task.status === 'completed' ? 'todo' : 'completed')}
          className="mt-0.5 shrink-0 active:scale-90 transition-transform"
          title={task.status === 'completed' ? 'Mark as To Do' : 'Mark as Completed'}
          aria-label={task.status === 'completed' ? 'Mark as To Do' : 'Mark as Completed'}
        >
          <StatusIcon status={task.status} />
        </button>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium leading-snug text-slate-100 ${dim ? 'line-through text-slate-500' : ''}`}>
            {task.name}
          </p>
          {task.description && <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{task.description}</p>}
          {task.status === 'blocked' && task.blockedReason && (
            <p className="text-xs text-red-400/80 mt-1 flex items-center gap-1">
              <Ban className="w-3 h-3" />
              {task.blockedReason}
            </p>
          )}
        </div>
        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="h-6 w-6 flex items-center justify-center rounded opacity-100 lg:opacity-0 lg:group-hover:opacity-100
              text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-opacity"
            title="More actions"
            aria-label="More actions"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
          {open && (
            <div
              className="absolute right-0 top-7 z-50 min-w-36 rounded-lg border border-slate-700
              bg-slate-900 shadow-xl text-xs py-1"
            >
              {task.status !== 'in_progress' && task.status !== 'completed' && (
                <button
                  onClick={() => {
                    handleStatusChange('in_progress')
                    setOpen(false)
                  }}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-slate-200 hover:bg-slate-800"
                >
                  <Play className="w-3.5 h-3.5 text-sky-400" />
                  Start
                </button>
              )}
              {task.status !== 'completed' && (
                <button
                  onClick={() => {
                    handleStatusChange('completed')
                    setOpen(false)
                  }}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-slate-200 hover:bg-slate-800"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Mark Complete
                </button>
              )}
              {task.status !== 'blocked' && (
                <button
                  onClick={() => {
                    handleStatusChange('blocked')
                    setOpen(false)
                  }}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-slate-200 hover:bg-slate-800"
                  title={task.status === 'blocked' ? 'Mark as To Do' : 'Mark as Blocked'}
                  aria-label={task.status === 'blocked' ? 'Mark as To Do' : 'Mark as Blocked'}
                >
                  <Ban className="w-3.5 h-3.5 text-red-400" />
                  Mark Blocked
                </button>
              )}
              {task.status !== 'cancelled' && (
                <button
                  onClick={() => {
                    handleStatusChange('cancelled')
                    setOpen(false)
                  }}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-slate-200 hover:bg-slate-800"
                  title={task.status === 'cancelled' ? 'Mark as To Do' : 'Mark as Cancelled'}
                  aria-label={task.status === 'cancelled' ? 'Mark as To Do' : 'Mark as Cancelled'}
                >
                  <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                  Cancel
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={`inline-flex items-center gap-1 text-[10px] font-medium h-5 px-1.5 rounded border ${sizeConfig.cls}`}
          title={sizeConfig.label}
          aria-label={sizeConfig.label}
        >
          <sizeConfig.Icon className="w-3 h-3" />
          {sizeConfig.label}
        </span>
        <div className="ml-auto flex items-center gap-2.5">
          {task.dueDate && formatDate(task.dueDate) !== 'Today' && (
            <span className="text-[10px] text-slate-500 flex items-center gap-1">
              <CalendarClock className="w-3 h-3" />
              {formatDate(task.dueDate)}
            </span>
          )}
          <span className={`w-2 h-2 rounded-full ${PIPDOT[priority]}`} title={PIPLABEL[priority] + ' Priority'} />
        </div>
      </div>
    </div>
  )
}

export default TodayCard
