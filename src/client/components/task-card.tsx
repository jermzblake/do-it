import React from 'react'
import { priorityConfig } from '@/client/lib/configs'
import type { Task, TaskStatus } from '@/shared/task'
import { Card, CardContent, CardHeader, CardTitle } from '@/client/components/ui/card'
import { Input } from '@/client/components/ui/input'
import { Badge } from '@/client/components/ui/badge'
import { Button } from '@/client/components/ui/button'
import { useUpdateTask } from '@/client/hooks/use-tasks'
import { isOverdue } from '@/client/utils/is-overdue'
import { formatDate } from '@/client/utils/format-date'
import { Edit2, Play, Check, Ban, Calendar, AlertCircle, Loader2, X } from 'lucide-react'

interface TaskCardProps {
  task: Task
  onEdit: () => void
  onBlock: () => void
  onSelect?: () => void
}

export const TaskCard = ({ task, onEdit, onBlock, onSelect }: TaskCardProps) => {
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
    <Card className="mb-3 hover:shadow-md transition-all group" onClick={handleCardClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
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
                  className="h-7 text-base font-semibold"
                  disabled={updateTask.isPending}
                />
              ) : (
                <CardTitle
                  className="text-base font-semibold line-clamp-2 cursor-text hover:text-blue-600"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsEditingName(true)
                  }}
                >
                  {task.name}
                </CardTitle>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Badge variant="outline" className={`${priorityConfig[task.priority]?.color} text-xs`}>
              {priorityConfig[task.priority]?.label}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-3">
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
          <div className="mb-3 p-2 bg-red-50 rounded text-xs text-red-700 flex items-start gap-1">
            <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
            <span>{task.blockedReason}</span>
          </div>
        )}

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            disabled={updateTask.isPending}
          >
            <Edit2 className="w-3 h-3 mr-1" />
            Edit
          </Button>

          {task.status === 'todo' && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-blue-600 hover:text-blue-700"
              onClick={(e) => {
                e.stopPropagation()
                handleQuickStatusUpdate('in_progress')
              }}
              disabled={updateTask.isPending}
            >
              {updateTask.isPending ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <Play className="w-3 h-3 mr-1" />
              )}
              Start
            </Button>
          )}

          {(task.status === 'todo' || task.status === 'in_progress') && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-green-600 hover:text-green-700"
                onClick={(e) => {
                  e.stopPropagation()
                  handleQuickStatusUpdate('completed')
                }}
                disabled={updateTask.isPending}
              >
                {updateTask.isPending ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <Check className="w-3 h-3 mr-1" />
                )}
                Done
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-red-600 hover:text-red-700"
                onClick={(e) => {
                  e.stopPropagation()
                  onBlock()
                }}
                disabled={updateTask.isPending}
              >
                {updateTask.isPending ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <Ban className="w-3 h-3 mr-1" />
                )}
                Block
              </Button>
            </>
          )}
          {task.status === 'blocked' && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-blue-600 hover:text-blue-700"
              onClick={(e) => {
                e.stopPropagation()
                handleQuickStatusUpdate('in_progress', {
                  blockedReason: '',
                  notes: `${task.notes || ''} \n\nUnblocked on ${new Date().toLocaleDateString()}`,
                })
              }}
              disabled={updateTask.isPending}
            >
              {updateTask.isPending ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <Play className="w-3 h-3 mr-1" />
              )}
              Resume
            </Button>
          )}
          {task.status !== 'cancelled' && task.status !== 'completed' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-yellow-600 hover:text-yellow-700"
                onClick={(e) => {
                  e.stopPropagation()
                  handleQuickStatusUpdate('cancelled')
                }}
                disabled={updateTask.isPending}
              >
                {updateTask.isPending ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <X className="w-3 h-3 mr-1" />
                )}
                Cancel
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
