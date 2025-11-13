import type { Task } from '@/types/tasks.types'

export const filterTasks = (tasks: Task[], searchQuery: string, filterPriority: string) => {
  return tasks.filter((task) => {
    const matchesSearch = task?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPriority = filterPriority === 'all' || task.priority === parseInt(filterPriority)
    return matchesSearch && matchesPriority
  })
}
