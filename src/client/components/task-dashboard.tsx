import React from 'react'
import { Input } from '@/client/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/client/components/ui/select'
import { Search, Filter } from 'lucide-react'
import type { Task, TaskStatus } from '@/types/tasks.types'
import { EditTaskDialog } from './edit-task-dialog'
import { DeleteTaskDialog } from './delete-task-dialog'
import { StatusColumn } from './status-column'
import { BlockReasonDialog } from './block-reason-dialog'
import { MobileStatusSection } from './mobile-status-section'

const TaskDashboard = () => {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [filterPriority, setFilterPriority] = React.useState('all')
  const [editingTask, setEditingTask] = React.useState<Task | null>(null)
  const [deleteTaskId, setDeleteTaskId] = React.useState<string | null>(null)
  const [taskToBlockId, setTaskToBlockId] = React.useState<string | null>(null)

  const statuses: TaskStatus[] = ['todo', 'in_progress', 'completed', 'blocked', 'cancelled']

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-6">
          <p className="text-slate-600">Manage and track your tasks efficiently</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3 justify-center">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-3">
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-[140px] sm:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="3">High</SelectItem>
                <SelectItem value="2">Medium</SelectItem>
                <SelectItem value="1">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Desktop Kanban View */}
        <div className="hidden md:block overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-min">
            {statuses.map((status) => (
              <StatusColumn
                key={status}
                status={status}
                filterPriority={filterPriority}
                searchQuery={searchQuery}
                setEditingTask={setEditingTask}
                setDeleteTaskId={setDeleteTaskId}
                setTaskToBlockId={setTaskToBlockId}
              />
            ))}
          </div>
        </div>

        {/* Mobile List View */}
        <div className="md:hidden">
          {statuses.map((status) => (
            <MobileStatusSection
              key={status}
              status={status}
              filterPriority={filterPriority}
              searchQuery={searchQuery}
              setEditingTask={setEditingTask}
              setDeleteTaskId={setDeleteTaskId}
              setTaskToBlockId={setTaskToBlockId}
            />
          ))}
        </div>
      </div>

      <EditTaskDialog editingTask={editingTask} setEditingTask={setEditingTask} />
      <DeleteTaskDialog deleteTaskId={deleteTaskId} setDeleteTaskId={setDeleteTaskId} />
      <BlockReasonDialog taskToBlockId={taskToBlockId} setTaskToBlockId={setTaskToBlockId} />
    </div>
  )
}

export default TaskDashboard
