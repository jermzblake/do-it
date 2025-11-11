import { useAuth } from '../auth/AuthContext'
import { CreateTaskContainer } from '@/client/components/create-task-container'
import { TaskForm } from '@/client/components/task-form'
import { Tasks } from '@/client/components/tasks'

export const DashboardPage = () => {
  const { logout } = useAuth()
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>Welcome to the Dashboard</h1>
        <p>|</p>
        <button onClick={logout}>Logout</button>
      </div>
      <div className="flex flex-col gap-6 bg-white p-6 rounded-lg shadow-md">
        {/* <TaskForm /> */}
        <CreateTaskContainer />
      </div>
      <div>
        <Tasks />
      </div>
    </div>
  )
}
