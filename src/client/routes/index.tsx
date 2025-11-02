import {
  RouterProvider,
  redirect,
  createRoute,
  createRootRoute,
  Outlet,
  createRouter,
  useNavigate,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { routes } from './routes'
import { LandingPage } from '@/client/pages/landing'
import { NotFoundPage } from '@/client/pages/not-found'
import { DashboardPage } from '@/client/pages/dashboard'
import { AuthProvider, useAuth } from '../auth/AuthContext'
import { ErrorBoundary } from '@/client/components/error-boundary'
import { useEffect } from 'react'

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: routes.landing })
    }
  }, [isAuthenticated, navigate, isLoading])

  if (isLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>
  if (!isAuthenticated) return null
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
  component: LandingPage,
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

// Assemble the route tree
const routeTree = rootRoute.addChildren([indexRoute, dashboardRoute])

// Create the router
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultPendingComponent: () => <div className="flex items-center justify-center h-screen">Loading...</div>, // Global fallback component
  // Optional: Configure minimum display time to avoid flashes
  defaultPendingMinMs: 500,
})

// Type registration (for IDE autocompletion)
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
