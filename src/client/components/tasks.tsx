import React from 'react'
import { useTasksByStatus } from '@/client/hooks/use-tasks'
import type { Task } from '@/types/tasks.types'

export const Tasks = () => {
  const [page, setPage] = React.useState(1)
  const pageSize = 5
  const userId = '00233001-6292-4c8c-a27d-3094debec0bb' //TODO remove hard coded userId
  const status = 'todo' //TODO move status to state?

  const { data: tasksResponse, isLoading, isError, isPlaceholderData } = useTasksByStatus({ status, page, pageSize })

  const tasks = tasksResponse?.data as Task[]
  const hasMore = tasksResponse?.hasMore

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error fetching tasks</div>
  }

  return (
    <div>
      <h1>Tasks</h1>
      <ul>
        {tasks?.map((task: Task) => (
          <li key={task.id}>{task.name}</li>
        ))}
      </ul>
      <button onClick={() => setPage(page - 1)} disabled={page === 1}>
        Previous
      </button>
      <button onClick={() => setPage(page + 1)} disabled={isPlaceholderData || !hasMore}>
        Next
      </button>
    </div>
  )
}
