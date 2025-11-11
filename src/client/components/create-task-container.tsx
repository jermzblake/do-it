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

  const CreateTaskButton = () => {
    if (!showCreateTaskForm) {
      return <Button onClick={() => setShowCreateTaskForm(true)}>Create Task</Button>
    } else {
      return null
    }
  }

  const CreateTaskForm = () => {
    if (showCreateTaskForm) {
      return <TaskForm />
    } else {
      return null
    }
  }

  return (
    <div>
      <CreateTaskButton />
      <CreateTaskForm />
    </div>
  )

  //   let showCreateTaskForm = totalTaskCount < 1;

  //   return showCreateTaskForm ? <TaskForm /> : null;
}
