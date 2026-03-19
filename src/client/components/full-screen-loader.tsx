import { Loader2 as Loader } from 'lucide-react'

export const FullScreenLoader = () => (
  <div className="flex items-center justify-center h-screen" role="status" aria-live="polite" aria-label="Loading">
    <Loader className="w-8 h-8 animate-spin" aria-hidden="true" />
  </div>
)
