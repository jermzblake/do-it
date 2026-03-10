import { Ban, CheckCircle2, Circle } from 'lucide-react'

function StatusIcon({ status: sts }: { status: string }) {
  if (sts === 'completed') return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
  if (sts === 'in_progress') return <Circle className="w-4 h-4 text-sky-400 shrink-0 fill-sky-400/20" />
  if (sts === 'blocked') return <Ban className="w-4 h-4 text-red-400 shrink-0" />
  return <Circle className="w-4 h-4 text-slate-500 shrink-0" />
}

export { StatusIcon }
