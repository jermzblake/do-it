import { useParams, Navigate, Link, useSearch } from '@tanstack/react-router'
import type { Task } from '@/types/tasks.types'
import { useTaskDetailLogic } from '@/client/hooks/useTaskDetailLogic'
import { TaskDetailsContent } from '@/client/components/task-details-content'
import { useTaskById } from '@/client/hooks/use-tasks'
import { routes } from '@/client/routes/routes'
import { Button } from '@/client/components/ui/button'
import { Edit2 } from 'lucide-react'
import { MobilePageLayout } from '@/client/components/mobile-page-layout'

const TaskDetailsScreen = ({ task, initialIsEditing }: { task: Task; initialIsEditing?: boolean }) => {
  const taskDetailLogic = useTaskDetailLogic({ task, initialIsEditing })

  const renderHeaderName = () => {
    if (task?.name && task.name.length > 15) {
      return `${task.name.substring(0, 13)}...`
    } else if (task?.name) {
      return task.name
    }
    return 'Loading...'
  }

  return (
    <MobilePageLayout
      title={renderHeaderName()}
      right={
        !taskDetailLogic.isEditing && (
          <Button
            variant="outline"
            onClick={taskDetailLogic.onEdit}
            disabled={taskDetailLogic.isUpdating || taskDetailLogic.isDeleting}
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Task
          </Button>
        )
      }
    >
      <TaskDetailsContent task={task} {...taskDetailLogic} />
    </MobilePageLayout>
  )
}

export const TaskPage = () => {
  const { taskId }: { taskId: string } = useParams({ strict: false })
  const search = useSearch({ strict: false }) as { edit?: boolean }

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
  return <TaskDetailsScreen task={task} initialIsEditing={search.edit} />
}
