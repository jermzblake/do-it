import React from 'react'
import { Button } from '@/client/components/ui/button'
import { Separator } from '@/client/components/ui/separator'
import { useAuth } from '@/client/auth/AuthContext'
import { useNavigate } from '@tanstack/react-router'
import { CreateTaskDialog } from '@/client/components/create-task-dialog'
import { useIsDesktop } from '@/client/hooks/use-media-query'
import { routes } from '@/client/routes/routes'

interface SiteHeaderProps {
  pageTitle?: string
}

export const SiteHeader = ({ pageTitle }: SiteHeaderProps) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const isDesktop = useIsDesktop()

  if (!user) return null

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm supports-[backdrop-filter:blur(0)]:bg-white/80 shadow-md border-b px-4 py-3 flex justify-between items-center w-full">
      <h1 className="text-2xl font-bold">Do It {pageTitle && <span className="text-blue-900">{pageTitle}</span>}</h1>
      <div className="flex items-center gap-4">
        <span className="hidden md:block text-sm text-gray-600">Hey, {user.name}</span>
        <Separator orientation="vertical" className="h-6" />
        {isDesktop ? (
          <CreateTaskDialog
            trigger={
              <Button variant="default" size="sm">
                Create Task
              </Button>
            }
          />
        ) : (
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              navigate({ to: routes.createTask })
            }}
          >
            Create Task
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={logout}>
          Logout
        </Button>
      </div>
    </header>
  )
}
