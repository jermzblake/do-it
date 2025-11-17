import React from 'react'
import { Button } from '@/client/components/ui/button'
import { Separator } from '@/client/components/ui/separator'
import { useAuth } from '@/client/auth/AuthContext'
import { useNavigate } from '@tanstack/react-router'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/client/components/ui/dialog'
import { TaskForm } from '@/client/components/task-form'

interface SiteHeaderProps {
  pageTitle?: string
}

export const SiteHeader = ({ pageTitle }: SiteHeaderProps) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) return null
  const [showCreateTaskDialog, setShowCreateTaskDialog] = React.useState(false)

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold">Do It {pageTitle && <span className="text-blue-900">{pageTitle}</span>}</h1>
      <div className="flex items-center gap-4">
        <span className="hidden md:block text-sm text-gray-600">Hey, {user.name}</span>
        <Separator orientation="vertical" className="h-6" />
        <Button variant="default" size="sm" onClick={() => setShowCreateTaskDialog(true)}>
          Create Task
        </Button>
        <Button variant="outline" size="sm" onClick={logout}>
          Logout
        </Button>
      </div>
      <Dialog open={showCreateTaskDialog} onOpenChange={setShowCreateTaskDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Task</DialogTitle>
            <DialogDescription>Fill out the form to create a new task.</DialogDescription>
          </DialogHeader>
          <TaskForm setShowForm={setShowCreateTaskDialog} />
        </DialogContent>
      </Dialog>
    </header>
  )
}
