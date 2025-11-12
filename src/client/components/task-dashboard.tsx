import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/client/components/ui/card'
import { Badge } from '@/client/components/ui/badge'
import { Button } from '@/client/components/ui/button'
import { Input } from '@/client/components/ui/input'
import { Textarea } from '@/client/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/client/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/client/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/client/components/ui/alert-dialog'
import {
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Pause,
  X,
  Search,
  Filter,
  Edit2,
  Trash2,
  Play,
  Ban,
  Check,
  GripVertical,
} from 'lucide-react'
import type { Task } from '@/types/tasks.types'

// Mock data generator
const generateMockTasks = () => {
  const statuses = ['todo', 'in_progress', 'completed', 'blocked', 'cancelled']
  const priorities = [1, 2, 3]
  const efforts = [1, 2, 3, 4, 5]
  const tasks = []
  const now = new Date()

  const taskNames = [
    'Implement user authentication',
    'Fix dashboard loading bug',
    'Write API documentation',
    'Code review PR #123',
    'Deploy to production',
    'Update dependencies',
    'Refactor database queries',
    'Add error logging',
    'Optimize image loading',
    'Create unit tests',
    'Design new landing page',
    'Integrate payment gateway',
    'Setup CI/CD pipeline',
    'Fix mobile responsiveness',
    'Add search functionality',
    'Improve SEO',
    'Setup analytics',
    'Create user onboarding',
    'Add email notifications',
    'Security audit',
  ]

  for (let i = 0; i < 20; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const dueDate = new Date(now.getTime() + (Math.random() - 0.3) * 14 * 24 * 60 * 60 * 1000)

    tasks.push({
      id: `task-${i}`,
      userId: 'user-1',
      name: taskNames[i]!,
      description: 'This is a sample task description that explains what needs to be done.',
      notes: 'Additional notes and context for the task.',
      status: status!,
      priority: priorities[Math.floor(Math.random() * priorities.length)]!,
      effort: efforts[Math.floor(Math.random() * efforts.length)]!,
      dueDate: Math.random() > 0.3 ? dueDate.toISOString() : undefined,
      blockedReason: status === 'blocked' ? 'Waiting for external API documentation' : undefined,
      startedAt:
        status !== 'todo' ? new Date(now.getTime() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      completedAt:
        status === 'completed'
          ? new Date(now.getTime() - Math.random() * 2 * 24 * 60 * 60 * 1000).toISOString()
          : undefined,
      createdAt: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
  }

  return tasks
}

const TaskDashboard = () => {
  const [tasks, setTasks] = useState<Task[]>(generateMockTasks())
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPriority, setFilterPriority] = useState('all')
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)

  const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
    todo: { label: 'To Do', icon: AlertCircle, color: 'bg-slate-100 text-slate-700 border-slate-300' },
    in_progress: { label: 'In Progress', icon: Clock, color: 'bg-blue-100 text-blue-700 border-blue-300' },
    completed: { label: 'Completed', icon: CheckCircle2, color: 'bg-green-100 text-green-700 border-green-300' },
    blocked: { label: 'Blocked', icon: Pause, color: 'bg-red-100 text-red-700 border-red-300' },
    cancelled: { label: 'Cancelled', icon: X, color: 'bg-gray-100 text-gray-700 border-gray-300' },
  }

  const priorityConfig: Record<number, { label: string; color: string }> = {
    1: { label: 'Low', color: 'bg-green-100 text-green-800 border-green-200' },
    2: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    3: { label: 'High', color: 'bg-red-100 text-red-800 border-red-200' },
  }

  const isOverdue = (dueDate: string) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return null
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays < 7) return `${diffDays}d`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPriority = filterPriority === 'all' || task.priority === parseInt(filterPriority)
    return matchesSearch && matchesPriority
  })

  const getTasksByStatus = (status: string) => {
    return filteredTasks.filter((task) => task.status === status)
  }

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks((prevTasks) => prevTasks.map((task) => (task.id === taskId ? { ...task, ...updates } : task)))
  }

  const handleDeleteTask = (taskId: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId))
    setDeleteTaskId(null)
  }

  const handleQuickAction = (task: Task, action: string) => {
    const updates: Partial<Task> = {}

    switch (action) {
      case 'complete':
        updates.status = 'completed'
        updates.completedAt = new Date().toISOString()
        break
      case 'start':
        updates.status = 'in_progress'
        updates.startedAt = new Date().toISOString()
        break
      case 'block':
        updates.status = 'blocked'
        updates.blockedReason = 'Blocked'
        break
    }

    handleUpdateTask(task.id, updates)
  }

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    if (!draggedTask || draggedTask.status === newStatus) return

    const updates: Partial<Task> = { status: newStatus }

    if (newStatus === 'in_progress' && !draggedTask.startedAt) {
      updates.startedAt = new Date().toISOString()
    }
    if (newStatus === 'completed') {
      updates.completedAt = new Date().toISOString()
    }

    handleUpdateTask(draggedTask.id, updates)
    setDraggedTask(null)
  }

  const TaskCard = ({ task }: { task: Task }) => {
    const StatusIcon = statusConfig[task.status]?.icon
    const overdue = isOverdue(task.dueDate as string)
    const [isEditingName, setIsEditingName] = useState(false)

    return (
      <Card
        className="mb-3 hover:shadow-md transition-all cursor-grab active:cursor-grabbing group"
        draggable
        onDragStart={(e) => handleDragStart(e, task)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <GripVertical className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex-1 min-w-0">
                {isEditingName ? (
                  <Input
                    defaultValue={task.name}
                    onBlur={(e) => {
                      handleUpdateTask(task.id, { name: e.target.value })
                      setIsEditingName(false)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleUpdateTask(task.id, { name: e.currentTarget.value })
                        setIsEditingName(false)
                      }
                      if (e.key === 'Escape') setIsEditingName(false)
                    }}
                    autoFocus
                    className="h-7 text-base font-semibold"
                  />
                ) : (
                  <CardTitle
                    className="text-base font-semibold line-clamp-2 cursor-text"
                    onClick={() => setIsEditingName(true)}
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
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setEditingTask(task)}>
              <Edit2 className="w-3 h-3 mr-1" />
              Edit
            </Button>

            {task.status === 'todo' && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-blue-600 hover:text-blue-700"
                onClick={() => handleQuickAction(task, 'start')}
              >
                <Play className="w-3 h-3 mr-1" />
                Start
              </Button>
            )}

            {(task.status === 'todo' || task.status === 'in_progress') && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-green-600 hover:text-green-700"
                  onClick={() => handleQuickAction(task, 'complete')}
                >
                  <Check className="w-3 h-3 mr-1" />
                  Done
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-red-600 hover:text-red-700"
                  onClick={() => handleQuickAction(task, 'block')}
                >
                  <Ban className="w-3 h-3 mr-1" />
                  Block
                </Button>
              </>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-red-600 hover:text-red-700 ml-auto"
              onClick={() => setDeleteTaskId(task.id)}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const StatusColumn = ({ status }: { status: string }) => {
    const config = statusConfig[status]
    const StatusIcon = config?.icon
    const statusTasks = getTasksByStatus(status)

    return (
      <div
        className="flex flex-col min-w-[280px] max-w-[320px]"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, status)}
      >
        <div className={`${config?.color} border rounded-lg p-3 mb-3 flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <StatusIcon className="w-5 h-5" />
            <h3 className="font-semibold">{config?.label}</h3>
          </div>
          <Badge variant="secondary" className="bg-white/60">
            {statusTasks.length}
          </Badge>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 min-h-[200px] rounded-lg border-2 border-dashed border-gray-200 p-2 bg-white/50">
          {statusTasks.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-8">Drop tasks here</div>
          ) : (
            statusTasks.map((task) => <TaskCard key={task.id} task={task} />)
          )}
        </div>
      </div>
    )
  }

  const EditTaskDialog = () => {
    if (!editingTask) return null

    const [formData, setFormData] = useState({
      name: editingTask.name,
      description: editingTask.description || '',
      notes: editingTask.notes || '',
      priority: editingTask.priority,
      effort: editingTask.effort,
      dueDate: editingTask.dueDate ? new Date(editingTask.dueDate).toISOString().split('T')[0] : '',
      blockedReason: editingTask.blockedReason || '',
    })

    const handleSave = () => {
      handleUpdateTask(editingTask.id, {
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
      })
      setEditingTask(null)
    }

    return (
      <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Make changes to your task details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Task Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Task name"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Task description"
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Notes</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Priority</label>
                <Select
                  value={formData.priority.toString()}
                  onValueChange={(v) => setFormData({ ...formData, priority: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Low</SelectItem>
                    <SelectItem value="2">Medium</SelectItem>
                    <SelectItem value="3">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Effort</label>
                <Select
                  value={formData.effort.toString()}
                  onValueChange={(v) => setFormData({ ...formData, effort: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Minimal</SelectItem>
                    <SelectItem value="2">2 - Low</SelectItem>
                    <SelectItem value="3">3 - Medium</SelectItem>
                    <SelectItem value="4">4 - High</SelectItem>
                    <SelectItem value="5">5 - Maximum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Due Date</label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
            {editingTask.status === 'blocked' && (
              <div>
                <label className="text-sm font-medium mb-1 block">Blocked Reason</label>
                <Input
                  value={formData.blockedReason}
                  onChange={(e) => setFormData({ ...formData, blockedReason: e.target.value })}
                  placeholder="Why is this task blocked?"
                />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setEditingTask(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const statuses = ['todo', 'in_progress', 'completed', 'blocked', 'cancelled']

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Task Dashboard</h1>
          <p className="text-slate-600">Manage and track your tasks efficiently</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
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
              <SelectTrigger className="w-[140px]">
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

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {statuses.map((status) => {
            const count = getTasksByStatus(status).length
            const StatusIcon = statusConfig[status]?.icon
            const config = statusConfig[status]
            return (
              <Card key={status} className={`${config?.color} border-2`}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium opacity-80">{config?.label}</p>
                    <p className="text-2xl font-bold mt-1">{count}</p>
                  </div>
                  <StatusIcon className="w-8 h-8 opacity-60" />
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-min">
            {statuses.map((status) => (
              <StatusColumn key={status} status={status} />
            ))}
          </div>
        </div>
      </div>

      <EditTaskDialog />

      <AlertDialog open={!!deleteTaskId} onOpenChange={() => setDeleteTaskId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTaskId && handleDeleteTask(deleteTaskId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default TaskDashboard
