import React from 'react'
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
import { TaskForm } from '@/client/components/task-form'

interface CreateTaskDialogProps {
  trigger: React.ReactElement
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export const CreateTaskDialog = ({ trigger, open: controlledOpen, onOpenChange }: CreateTaskDialogProps) => {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const [isFormDirty, setIsFormDirty] = React.useState(false)
  const [showDiscardConfirmation, setShowDiscardConfirmation] = React.useState(false)

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setIsOpen = onOpenChange || setInternalOpen

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isFormDirty) {
      setShowDiscardConfirmation(true)
      return
    }
    setIsOpen(nextOpen)
  }

  const handleDiscardConfirm = () => {
    setShowDiscardConfirmation(false)
    setIsOpen(false)
    setIsFormDirty(false)
  }

  const handleDiscardCancel = () => {
    setShowDiscardConfirmation(false)
  }

  const triggerWithHandler = React.cloneElement(trigger, {
    onClick: (e: React.MouseEvent) => {
      const originalOnClick = (trigger.props as any).onClick
      originalOnClick?.(e)
      setIsOpen(true)
    },
  } as any)

  return (
    <>
      {triggerWithHandler}

      <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Task</DialogTitle>
            <DialogDescription>Fill out the form to create a new task.</DialogDescription>
          </DialogHeader>
          <TaskForm
            setShowForm={(show) => {
              if (!show) setIsFormDirty(false)
              setIsOpen(show)
            }}
            onDirtyChange={setIsFormDirty}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDiscardConfirmation} onOpenChange={setShowDiscardConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to discard them?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDiscardCancel}>Keep Editing</AlertDialogCancel>
            <AlertDialogAction onClick={handleDiscardConfirm}>Discard</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
