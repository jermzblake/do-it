import React from 'react'
import { useTotalTaskCount } from '@/client/hooks/use-total-task-count'
import { TaskForm } from '@/client/components/task-form'
import { Button } from '@/client/components/ui/button'

export const CreateTaskContainer = () => {
  const { totalTaskCount } = useTotalTaskCount()
  const [showCreateTaskForm, setShowCreateTaskForm] = React.useState(totalTaskCount < 1)

  React.useEffect(() => {
    setShowCreateTaskForm(totalTaskCount < 1)
  }, [totalTaskCount])

  return (
    <div>
      {!showCreateTaskForm && <Button onClick={() => setShowCreateTaskForm(true)}>Create Task</Button>}
      {showCreateTaskForm && <TaskForm setShowForm={setShowCreateTaskForm} />}
    </div>
  )
}
