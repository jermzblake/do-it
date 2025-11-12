import { Clock, AlertCircle, CheckCircle2, Pause, X } from 'lucide-react'

export const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  todo: { label: 'To Do', icon: AlertCircle, color: 'bg-slate-100 text-slate-700 border-slate-300' },
  in_progress: { label: 'In Progress', icon: Clock, color: 'bg-blue-100 text-blue-700 border-blue-300' },
  completed: { label: 'Completed', icon: CheckCircle2, color: 'bg-green-100 text-green-700 border-green-300' },
  blocked: { label: 'Blocked', icon: Pause, color: 'bg-red-100 text-red-700 border-red-300' },
  cancelled: { label: 'Cancelled', icon: X, color: 'bg-gray-100 text-gray-700 border-gray-300' },
}

export const priorityConfig: Record<number, { label: string; color: string }> = {
  1: { label: 'Low', color: 'bg-green-100 text-green-800 border-green-200' },
  2: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  3: { label: 'High', color: 'bg-red-100 text-red-800 border-red-200' },
}
