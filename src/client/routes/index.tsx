import { createRoute, createRootRoute, Outlet, createRouter, Navigate, useNavigate } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { routes } from './routes'
import { LandingPage } from '@/client/pages/landing'
import { NotFoundPage } from '@/client/pages/not-found'
import { DashboardPage } from '@/client/pages/dashboard'
import { TaskPage } from '@/client/pages/task-page'
import { CreateTaskPage } from '@/client/pages/create-task-page'
import { AuthProvider, useAuth } from '../auth/AuthContext'
import { ErrorBoundary } from '@/client/components/error-boundary'
import { useEffect } from 'react'
import { TodayViewPage } from '../pages/today'
import { Loader2 as Loader } from 'lucide-react'

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: routes.landing })
    }
  }, [isAuthenticated, navigate, isLoading])

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen" role="status" aria-live="polite" aria-label="Loading">
        <Loader className="w-8 h-8 animate-spin" aria-hidden="true" />
        <span className="sr-only">Loading...</span>
      </div>
    )
  if (!isAuthenticated) return null
  return <>{children}</>
}

const RedirectAuthenticatedFromLanding = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen" role="status" aria-live="polite" aria-label="Loading">
        <Loader className="w-8 h-8 animate-spin" aria-hidden="true" />
        <span className="sr-only">Loading...</span>
      </div>
    )
  if (isAuthenticated) return <Navigate to={routes.today} replace />
  return <>{children}</>
}

const rootRoute = createRootRoute({
  component: () => (
    <AuthProvider>
      <Outlet />
      <TanStackRouterDevtools />
    </AuthProvider>
  ),
  notFoundComponent: NotFoundPage,
  errorComponent: ({ error }) => <ErrorBoundary error={error} />,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: routes.landing,
  component: () => (
    <RedirectAuthenticatedFromLanding>
      <LandingPage />
    </RedirectAuthenticatedFromLanding>
  ),
})

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: routes.dashboard,
  component: () => (
    <RequireAuth>
      <DashboardPage />
    </RequireAuth>
  ),
})

const todayRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: routes.today,
  component: () => (
    <RequireAuth>
      <TodayViewPage />
    </RequireAuth>
  ),
})

const taskDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: routes.taskDetailsPattern,
  component: () => (
    <RequireAuth>
      <TaskPage />
    </RequireAuth>
  ),
})

const createTaskRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: routes.createTask,
  component: () => (
    <RequireAuth>
      <CreateTaskPage />
    </RequireAuth>
  ),
})

// Assemble the route tree
const routeTree = rootRoute.addChildren([indexRoute, dashboardRoute, todayRoute, taskDetailsRoute, createTaskRoute])

// Create the router
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultPendingComponent: () => (
    <div className="flex items-center justify-center h-screen">
      <Loader className="w-8 h-8 animate-spin" />
    </div>
  ), // Global fallback component
  // Optional: Configure minimum display time to avoid flashes
  defaultPendingMinMs: 500,
})

// Type registration (for IDE autocompletion)
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
