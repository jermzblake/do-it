import { Button } from '@/client/components/ui/button'
import { Input } from '@/client/components/ui/input'
import { Label } from '@/client/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/client/components/ui/select'
import { Textarea } from '@/client/components/ui/textarea'
import { useRef, type FormEvent } from 'react'
import { apiClient } from '../lib/axios'

export function TaskForm() {
  const responseInputRef = useRef<HTMLTextAreaElement>(null)

  const submitForm = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      const form = e.currentTarget
      const formData = new FormData(form)
      const taskName = formData.get('taskName') as string
      const taskDescription = formData.get('taskDescription') as string
      // Simulate API call
      const res = await apiClient.post('/tasks', {
        name: taskName,
        description: taskDescription,
      })
      const data = res.data
      responseInputRef.current!.value = JSON.stringify(data, null, 2)
    } catch (error) {
      responseInputRef.current!.value = String(error)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={submitForm} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="taskName">Task Name</Label>
          <Input id="taskName" type="text" name="taskName" required placeholder="Enter task name" />
        </div>
        <div>
          <Label htmlFor="taskDescription">Task Description</Label>
          <Textarea
            id="taskDescription"
            name="taskDescription"
            required
            placeholder="Enter task description"
            className="resize-y"
          />
        </div>
        <Button type="submit" variant="secondary">
          Create Task
        </Button>
      </form>
      <Label htmlFor="response" className="sr-only">
        Response
      </Label>
      <Textarea
        ref={responseInputRef}
        id="response"
        readOnly
        placeholder="Response will appear here..."
        className="min-h-[140px] font-mono resize-y"
      />
    </div>
  )
}
