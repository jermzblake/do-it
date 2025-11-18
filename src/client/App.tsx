import { RouterProvider } from '@tanstack/react-router'
import { router } from './routes'
import '.././index.css'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { Toaster } from '@/client/components/ui/sonner'

const queryClient = new QueryClient()

// Register Providers here if needed
export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>
  )
}

export default App
