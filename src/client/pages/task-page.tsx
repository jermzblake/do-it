import { useParams, Navigate, Link } from '@tanstack/react-router'
import type { Task } from '@/types/tasks.types'
import { useTaskDetailLogic } from '@/client/hooks/useTaskDetailLogic'
import { TaskDetailsContent } from '@/client/components/task-details-content'
import { useTaskById } from '@/client/hooks/use-tasks'
import { routes } from '@/client/routes/routes'
import { Button } from '@/client/components/ui/button'
import { Edit2 } from 'lucide-react'

const TaskDetailsScreen = ({ task }: { task: Task }) => {
  // Always called when this component is mounted
  const taskDetailLogic = useTaskDetailLogic({ task })

  const renderHeaderName = () => {
    if (task?.name && task.name.length > 15) {
      return `${task.name.substring(0, 13)}...`
    } else if (task?.name) {
      return task.name
    }
    return 'Loading...'
  }

  return (
    <div className="flex flex-col h-full">
      {/* Sticky header */}
      <header className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between gap-2">
        <Link to={routes.dashboard} className="text-sm">
          ← Back
        </Link>
        <h1 className="font-semibold text-lg flex-1 truncate text-blue-900">{renderHeaderName()}</h1>
        {!taskDetailLogic.isEditing && (
          <Button
            variant="outline"
            onClick={taskDetailLogic.onEdit}
            disabled={taskDetailLogic.isUpdating || taskDetailLogic.isDeleting}
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Task
          </Button>
        )}
      </header>

      {/* Scrollable content */}
      <main className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <TaskDetailsContent task={task} {...taskDetailLogic} />
      </main>
    </div>
  )
}

export const TaskPage = () => {
  const { taskId }: { taskId: string } = useParams({ strict: false })

  if (!taskId) {
    return <Navigate to={routes.dashboard} />
  }

  const { data, isLoading, error } = useTaskById(taskId)

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (error || !data?.data) {
    return (
      <div className="p-4">
        <Link to={routes.dashboard} className="text-sm">
          ← Back
        </Link>
        <p className="mt-4 text-red-600">Unable to load task.</p>
      </div>
    )
  }

  const task = data.data as Task
  return <TaskDetailsScreen task={task} />
}
