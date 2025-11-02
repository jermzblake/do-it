import { useAuth } from '../auth/AuthContext'

export const DashboardPage = () => {
  const { logout } = useAuth()
  return (
    <div>
      <h1>Welcome to the Dashboard</h1>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
