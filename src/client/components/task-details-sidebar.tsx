import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/client/components/ui/sheet'
import type { Task } from '@/types/tasks.types'
import { TaskDetailsContent } from '@/client/components/task-details-content'
import { useTaskDetailLogic } from '@/client/hooks/useTaskDetailLogic'

interface TaskDetailsSidebarProps {
  task: Task
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const TaskDetailsSidebar = ({ task, open, onOpenChange }: TaskDetailsSidebarProps) => {
  if (!task) return null

  const taskDetailLogic = useTaskDetailLogic({
    task,
    onClose: () => onOpenChange(false),
  })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" size="half" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{task?.name}</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-6">
          <TaskDetailsContent task={task} {...taskDetailLogic} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
