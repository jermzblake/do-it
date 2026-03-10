import type { Task } from '@/shared/task'

const t = new Date(),
  y = new Date(t),
  tm = new Date(t),
  i2 = new Date(t),
  i3 = new Date(t)
y.setDate(t.getDate() - 1)
tm.setDate(t.getDate() + 1)
i2.setDate(t.getDate() + 2)
i3.setDate(t.getDate() + 3)

export const SEED: Task[] = [
  {
    id: '1',
    name: 'Redesign authentication flow',
    description: 'Revamp the login/signup UX with better error states.',
    status: 'in_progress',
    priority: 3,
    effort: 5,
    dueDate: t,
    startBy: t,
  },
  {
    id: '2',
    name: 'Fix payment gateway timeout',
    description: 'Stripe webhook occasionally times out under load.',
    status: 'todo',
    priority: 3,
    effort: 4,
    dueDate: y,
  },
  {
    id: '3',
    name: 'Write API documentation',
    description: 'Write API documentation',
    status: 'todo',
    priority: 2,
    effort: 3,
    dueDate: tm,
    startBy: t,
  },
  {
    id: '4',
    name: 'Deploy staging environment',
    description: 'Deploy the staging environment for testing',
    status: 'blocked',
    priority: 2,
    effort: 3,
    dueDate: i2,
    blockedReason: 'Waiting on DevOps credentials',
  },
  {
    id: '5',
    name: 'Audit accessibility on settings page',
    description: 'Audit accessibility on settings page',
    status: 'todo',
    priority: 2,
    effort: 2,
    dueDate: i3,
  },
  {
    id: '6',
    name: 'Add error boundary to dashboard',
    description: 'Add error boundary to dashboard',
    status: 'todo',
    priority: 2,
    effort: 2,
    startBy: t,
  },
  {
    id: '7',
    name: 'Review open PRs',
    description: 'Review open PRs',
    status: 'completed',
    priority: 1,
    effort: 1,
    dueDate: t,
  },
  {
    id: '8',
    name: 'Update changelog',
    description: 'Update changelog',
    status: 'todo',
    priority: 1,
    effort: 1,
    dueDate: i3,
  },
  {
    id: '9',
    name: 'Clean up unused feature flags',
    description: 'Clean up unused feature flags',
    status: 'todo',
    priority: 1,
    effort: 1,
    dueDate: i2,
  },
]
