import { RouterProvider } from '@tanstack/react-router'
import { router } from './routes'
import '.././index.css'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { Toaster } from '@/client/components/ui/sonner'
import { PomodoroProvider } from '@/client/context/pomodoro-context'
import { PomodoroPanel } from '@/client/components/pomodoro-panel'

const queryClient = new QueryClient()

// Register Providers here if needed
export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PomodoroProvider>
        <RouterProvider router={router} />
        <Toaster />
        <PomodoroPanel />
      </PomodoroProvider>
    </QueryClientProvider>
  )
}

export default App
