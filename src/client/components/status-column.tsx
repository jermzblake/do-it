import { statusConfig } from '@/client/lib/configs'
import { useTasksByStatus } from '@/client/hooks/use-tasks'
import type { Task, TaskStatus } from '@/types/tasks.types'
import { useQueryPerformance } from '@/client/hooks/use-query-performance'
import { filterTasks } from '@/client/utils/filter-tasks'
import { Badge } from '@/client/components/ui/badge'
import { Button } from '@/client/components/ui/button'
import { RefreshCw, AlertCircle, Loader2 } from 'lucide-react'
import { TaskCard } from '@/client/components/task-card'

interface StatusColumnProps {
  status: string
  setEditingTask: (task: Task | null) => void
  setDeleteTaskId: (taskId: string | null) => void
  setTaskToBlockId: (taskId: string | null) => void
  searchQuery: string
  filterPriority: string
  setSelectedTask?: (task: Task | null) => void
}

export const StatusColumn = ({
  status,
  setEditingTask,
  setDeleteTaskId,
  setTaskToBlockId,
  searchQuery,
  filterPriority,
  setSelectedTask,
}: StatusColumnProps) => {
  const config = statusConfig[status]
  const StatusIcon = config?.icon

  // Each column fetches its own data independently
  const queryResult = useTasksByStatus({
    status: status as TaskStatus,
    page: 1,
    pageSize: 40,
  })

  // Monitor query performance
  useQueryPerformance(queryResult, `tasks-by-status-${status}`, {
    threshold: 100, // Log if query takes more than 100ms
    enabled: true,
  })

  const { data, isLoading, error, refetch, isFetching } = queryResult

  const tasks = (data?.data as Task[]) || []
  const filteredTasks = filterTasks(tasks, searchQuery, filterPriority)
  const statusTotalCount = data?.metaData?.pagination?.totalCount || 0

  return (
    <div className="flex flex-col min-w-[280px] max-w-[320px]">
      <div className={`${config?.color} border rounded-lg p-3 mb-3 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <StatusIcon className="w-5 h-5" />
          <h3 className="font-semibold">{config?.label}</h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-white/60">
            {filteredTasks.length} / <span className={`${config?.color} ml-0.5`}> {statusTotalCount}</span>
          </Badge>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`w-3 h-3 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 min-h-[200px] max-h-[calc(100vh-300px)] rounded-lg border-2 border-dashed border-gray-200 p-2 bg-white/50">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p className="text-sm">Loading tasks...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-red-600">
            <AlertCircle className="w-8 h-8 mb-2" />
            <p className="text-sm">Error loading tasks</p>
            <Button variant="link" size="sm" onClick={() => refetch()} className="mt-2">
              Try again
            </Button>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-8">
            {tasks.length === 0 ? 'No tasks yet' : 'No tasks match filters'}
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={() => setEditingTask(task)}
              onDelete={() => setDeleteTaskId(task.id)}
              onBlock={() => setTaskToBlockId(task.id)}
              onSelect={setSelectedTask ? () => setSelectedTask(task) : undefined}
            />
          ))
        )}
      </div>
    </div>
  )
}
