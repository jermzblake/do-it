import React from 'react'
import { TaskForm } from '@/client/components/task-form'
import { MobilePageLayout } from '@/client/components/mobile-page-layout'

export const CreateTaskPage = () => {
  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <MobilePageLayout title="Create Task">
      <TaskForm />
    </MobilePageLayout>
  )
}

export default CreateTaskPage
