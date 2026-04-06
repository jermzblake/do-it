import React from 'react'
import { RouterProvider } from '@tanstack/react-router'
import { router } from './routes'
import '.././index.css'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { Toaster } from '@/client/components/ui/sonner'
import { PomodoroProvider } from '@/client/context/pomodoro-context'
import { PomodoroPanel } from '@/client/components/pomodoro-panel'

const queryClient = new QueryClient()

/**
 * Isolated subtree that does NOT consume PomodoroContext.
 * Wrapped in React.memo so it never re-renders when PomodoroProvider's
 * per-second tick fires — only PomodoroPanel (an actual consumer) updates.
 */
const AppRouterTree = React.memo(function AppRouterTree() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  )
})

// Register Providers here if needed
export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PomodoroProvider>
        <AppRouterTree />
        <PomodoroPanel />
      </PomodoroProvider>
    </QueryClientProvider>
  )
}

export default App
