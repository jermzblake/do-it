import React from 'react'
import { useNavigate } from '@tanstack/react-router'
import { priorityConfig } from '@/client/lib/configs'
import type { Task, TaskStatus } from '@/shared/task'
import { Card, CardContent } from '@/client/components/ui/card'
import { Input } from '@/client/components/ui/input'
import { Badge } from '@/client/components/ui/badge'
import { Button } from '@/client/components/ui/button'
import { useUpdateTask } from '@/client/hooks/use-tasks'
import { isOverdue } from '@/client/utils/is-overdue'
import { formatDate } from '@/client/utils/format-date'
import { routes } from '@/client/routes/routes'
import { Edit2, Play, Check, Ban, Trash2, Calendar, AlertCircle, Loader2, X } from 'lucide-react'

interface MobileTaskCardProps {
  task: Task
  onDelete: () => void
  onBlock: () => void
  onSelect?: () => void
}

export const MobileTaskCard = ({ task, onDelete, onBlock, onSelect }: MobileTaskCardProps) => {
  const navigate = useNavigate()
  const updateTask = useUpdateTask(task.id)
  const [isEditingName, setIsEditingName] = React.useState(false)
  const overdue = isOverdue(task.dueDate as string)

  const handleQuickStatusUpdate = async (newStatus: TaskStatus, additionalUpdates: Partial<Task> = {}) => {
    const updates: Partial<Task> = { status: newStatus, ...additionalUpdates }

    // Set timestamps based on status
    if (newStatus === 'in_progress' && !task.startedAt) {
      updates.startedAt = new Date().toISOString()
    }
    if (newStatus === 'completed') {
      updates.completedAt = new Date().toISOString()
    }

    await updateTask.mutateAsync(updates)
  }

  const handleNameUpdate = async (newName: string) => {
    if (newName && newName !== task.name) {
      await updateTask.mutateAsync({ name: newName })
    }
    setIsEditingName(false)
  }

  const handleCardClick = () => {
    if (onSelect) {
      onSelect()
    }
  }

  return (
    <Card className="mb-2 hover:shadow-md transition-all py-2" onClick={handleCardClick}>
      <CardContent className="px-3 py-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            {isEditingName ? (
              <Input
                defaultValue={task.name}
                onBlur={(e) => handleNameUpdate(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleNameUpdate(e.currentTarget.value)
                  }
                  if (e.key === 'Escape') setIsEditingName(false)
                }}
                autoFocus
                className="h-7 text-sm font-semibold"
                disabled={updateTask.isPending}
              />
            ) : (
              <h4
                className="text-sm font-semibold line-clamp-2 cursor-text hover:text-blue-600"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsEditingName(true)
                }}
              >
                {task.name}
              </h4>
            )}
          </div>
          <Badge variant="outline" className={`${priorityConfig[task.priority]?.color} text-xs shrink-0`}>
            {priorityConfig[task.priority]?.label}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-2">
          {task.dueDate && (
            <div className={`flex items-center gap-1 ${overdue ? 'text-red-600 font-medium' : ''}`}>
              <Calendar className="w-3 h-3" />
              <span>{formatDate(typeof task.dueDate === 'object' ? task.dueDate.toISOString() : task.dueDate)}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <span className="font-medium">Effort:</span>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`w-1.5 h-3 rounded-sm ${i < task.effort ? 'bg-blue-500' : 'bg-gray-200'}`} />
              ))}
            </div>
          </div>
        </div>

        {task.blockedReason && (
          <div className="mb-2 p-2 bg-red-50 rounded text-xs text-red-700 flex items-start gap-1">
            <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
            <span>{task.blockedReason}</span>
          </div>
        )}

        <div className="flex items-center gap-1 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation()
              navigate({ to: routes.taskDetails(task.id), search: { edit: true } })
            }}
            disabled={updateTask.isPending}
            title="Edit task"
          >
            <Edit2 className="w-4 h-4" />
          </Button>

          {task.status === 'todo' && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
              onClick={(e) => {
                e.stopPropagation()
                handleQuickStatusUpdate('in_progress')
              }}
              disabled={updateTask.isPending}
              title="Start task"
            >
              {updateTask.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            </Button>
          )}

          {(task.status === 'todo' || task.status === 'in_progress') && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                onClick={(e) => {
                  e.stopPropagation()
                  handleQuickStatusUpdate('completed')
                }}
                disabled={updateTask.isPending}
                title="Complete task"
              >
                {updateTask.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                onClick={(e) => {
                  e.stopPropagation()
                  onBlock()
                }}
                disabled={updateTask.isPending}
                title="Block task"
              >
                {updateTask.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
              </Button>
            </>
          )}

          {task.status === 'blocked' && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
              onClick={(e) => {
                e.stopPropagation()
                handleQuickStatusUpdate('in_progress', {
                  blockedReason: '',
                  notes: `${task.notes || ''} \n\nUnblocked on ${new Date().toLocaleDateString()}`,
                })
              }}
              disabled={updateTask.isPending}
              title="Resume task"
            >
              {updateTask.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            </Button>
          )}

          {task.status !== 'cancelled' && task.status !== 'completed' && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-yellow-600 hover:text-yellow-700"
              onClick={(e) => {
                e.stopPropagation()
                handleQuickStatusUpdate('cancelled')
              }}
              disabled={updateTask.isPending}
              title="Cancel task"
            >
              {updateTask.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 ml-auto"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            title="Delete task"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
