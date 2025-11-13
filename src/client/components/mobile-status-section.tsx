import React from 'react'
import { statusConfig } from '@/client/lib/configs'
import { useTasksByStatus } from '@/client/hooks/use-tasks'
import type { Task, TaskStatus } from '@/types/tasks.types'
import { useQueryPerformance } from '@/client/hooks/use-query-performance'
import { filterTasks } from '@/client/utils/filter-tasks'
import { Badge } from '@/client/components/ui/badge'
import { Button } from '@/client/components/ui/button'
import { RefreshCw, AlertCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { MobileTaskCard } from './mobile-task-card'

interface MobileStatusSectionProps {
  status: string
  setEditingTask: (task: Task | null) => void
  setDeleteTaskId: (taskId: string | null) => void
  setTaskToBlockId: (taskId: string | null) => void
  searchQuery: string
  filterPriority: string
}

export const MobileStatusSection = ({
  status,
  setEditingTask,
  setDeleteTaskId,
  setTaskToBlockId,
  searchQuery,
  filterPriority,
}: MobileStatusSectionProps) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const config = statusConfig[status]
  const StatusIcon = config?.icon

  // Each section fetches its own data independently
  const queryResult = useTasksByStatus({
    status: status as TaskStatus,
    page: 1,
    pageSize: 20,
  })

  // Monitor query performance
  useQueryPerformance(queryResult, `tasks-by-status-${status}`, {
    threshold: 100,
    enabled: true,
  })

  const { data, isLoading, error, refetch, isFetching } = queryResult

  const tasks = (data?.data as Task[]) || []
  const filteredTasks = filterTasks(tasks, searchQuery, filterPriority)
  const statusTotalCount = data?.metaData?.pagination?.totalCount || 0

  return (
    <div className="mb-4">
      <div
        className={`${config?.color} border rounded-lg p-3 flex items-center justify-between cursor-pointer`}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-2 flex-1">
          <StatusIcon className="w-5 h-5" />
          <h3 className="font-semibold">{config?.label}</h3>
          <Badge variant="secondary" className="bg-white/60">
            {filteredTasks.length} / <span className={`${config?.color} ml-0.5`}>{statusTotalCount}</span>
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation()
              refetch()
            }}
            disabled={isFetching}
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="mt-2 px-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mb-2" />
              <p className="text-sm">Loading tasks...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8 text-red-600">
              <AlertCircle className="w-6 h-6 mb-2" />
              <p className="text-sm">Error loading tasks</p>
              <Button variant="link" size="sm" onClick={() => refetch()} className="mt-2">
                Try again
              </Button>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-6">
              {tasks.length === 0 ? 'No tasks yet' : 'No tasks match filters'}
            </div>
          ) : (
            filteredTasks.map((task) => (
              <MobileTaskCard
                key={task.id}
                task={task}
                onEdit={() => setEditingTask(task)}
                onDelete={() => setDeleteTaskId(task.id)}
                onBlock={() => setTaskToBlockId(task.id)}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}
