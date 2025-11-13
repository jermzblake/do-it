import { SiteHeader } from '../components/site-header'
import TaskDashboard from '../components/task-dashboard'

export const DashboardPage = () => {
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SiteHeader pageTitle="Dashboard" />
      <div>
        <TaskDashboard />
      </div>
    </div>
  )
}
