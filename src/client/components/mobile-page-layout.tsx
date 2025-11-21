import React from 'react'
import { Link } from '@tanstack/react-router'
import { routes } from '@/client/routes/routes'

interface MobilePageLayoutProps {
  title: string
  children: React.ReactNode
  right?: React.ReactNode
  backTo?: string
}

export const MobilePageLayout = ({ title, children, right, backTo }: MobilePageLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden">
      <header className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center justify-between gap-2">
        <Link to={backTo || routes.dashboard} className="text-sm">
          ← Back
        </Link>
        <h1 className="font-semibold text-lg flex-1 truncate text-blue-900">{title}</h1>
        {right}
      </header>
      <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 space-y-6">{children}</main>
    </div>
  )
}
