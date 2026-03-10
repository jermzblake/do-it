import { SiteHeader } from '../components/site-header'
import TodayView from '../components/today-view'

export const TodayViewPage = () => {
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SiteHeader pageTitle="Today" />
      <div>
        <TodayView />
      </div>
    </div>
  )
}
