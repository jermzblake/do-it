# Do It - Task Management Application

A modern, responsive task management application designed to help individuals and teams organize, track, and complete their work efficiently. Built with cutting-edge web technologies for a fast, intuitive user experience across desktop and mobile devices.

## Live Demo

Production deployment (Fly.io): https://do-it-carpe-diem.fly.dev

> If the link is temporarily unavailable, the app may be auto-stopped to conserve resources; visiting the URL will wake it.

## What is Do It?

Do It is a full-stack task management solution that streamlines your workflow with intelligent task organization, priority management, and progress tracking. Whether you're managing personal projects or coordinating team efforts, Do It provides the tools you need to stay organized and productive.

## Key Features

### Task Management

- **Create & Organize Tasks** - Quick task creation with comprehensive details including descriptions, notes, priority levels, and effort estimates
- **Status Tracking** - Manage tasks through five distinct states: To Do, In Progress, Completed, Blocked, and Cancelled
- **Priority System** - Three-level priority ranking (1-3) to focus on what matters most
- **Effort Estimation** - 5-point scale for estimating task complexity and time investment
- **Due Date Management** - Set deadlines and receive visual indicators for overdue tasks
- **Block Tracking** - Document reasons when tasks become blocked with dedicated blocked reason field

### User Experience

- **Responsive Design** - Fully optimized for both desktop and mobile devices with device-specific layouts
- **Real-time Updates** - Instant UI updates powered by optimistic mutations and smart caching
- **Search & Filter** - Quickly find tasks using search functionality and filter by priority
- **Kanban-Style Dashboard** - Visual task organization with status columns for desktop view
- **Mobile-Optimized Views** - Dedicated mobile layouts with expandable status sections and swipe-friendly interactions
- **Inline Editing** - Edit task names directly from cards for quick updates

### Advanced Functionality

- **Task Details Sidebar** - Desktop side panel for viewing and editing full task details without page navigation
- **Status Transitions** - Intelligent status change handling with automatic timestamp tracking (startedAt, completedAt)
- **Query Performance Monitoring** - Built-in developer tools for tracking API performance and optimizing database queries
- **Comprehensive Testing** - Full test coverage for forms, guards, hooks, and status transition logic

## Who is Do It For?

- **Individual Developers** - Track personal projects, bugs, and feature development
- **Project Managers** - Oversee multiple workstreams with priority and effort tracking
- **Students** - Organize assignments, projects, and study tasks with deadline tracking
- **Anyone Seeking Better Organization** - Simple enough for personal use, powerful enough for professional workflows

## Tech Stack

### Frontend

- **React 19** - Modern UI framework with latest concurrent features
- **TanStack Router** - Type-safe, file-based routing with built-in code splitting
- **TanStack Query** - Powerful data fetching, caching, and synchronization
- **Tailwind CSS 4** - Utility-first CSS framework for rapid UI development
- **Shadcn/ui** - High-quality, accessible React components built on Radix UI
- **React Hook Form** - Performant form management with built-in validation
- **Zod** - TypeScript-first schema validation
- **Axios** - HTTP client for API communication
- **date-fns** - Modern date utility library

### Backend

- **Bun** - Ultra-fast JavaScript runtime and toolkit
- **PostgreSQL** - Robust, open-source relational database
- **Drizzle ORM** - TypeScript-first ORM with type-safe queries and migrations
- **Zod** - Schema validation for API endpoints and database operations

### Development & DevOps

- **Docker** - Containerized PostgreSQL for consistent development environments
- **Bun Test** - Fast, built-in testing framework
- **Testing Library** - React component testing utilities
- **Prettier** - Code formatting for consistent style
- **Fly.io** - Production deployment configuration included

## Getting Started

For developers looking to run or contribute to Do It, please see the [Development Quick Reference](./docs/DEV_QUICKREF.md) for setup instructions.

## Project Structure

The application follows a modern monorepo structure with clear separation of concerns:

- `src/client/` - React frontend application with components, hooks, and services
- `src/server/` - Backend API with controllers, repositories, and database logic
- `src/types/` - Shared TypeScript type definitions
- `docs/` - Project documentation including testing guides and CI/CD information

## Documentation

- [Development Quick Reference](./docs/DEV_QUICKREF.md) - Setup and build instructions
- [Testing Guide](./docs/TESTING.md) - Frontend testing practices
- [Server Testing](./docs/SERVER_TESTING.md) - Backend testing documentation
- [CI/CD Guide](./docs/CICD.md) - Continuous integration and deployment
- [Query Performance](./docs/QUERY_PERFORMANCE.md) - Database query optimization

## Future Enhancements

- **Current Tasks Dashboard** - Visualize the current days' tasks
- **Active Timer & Time Logging** - Log time spent on tasks with built-in timer and customizable Pomodoro timer (to help with time management) and manual entry
- **Task Comments & Activity Log** - Track changes and maintain audit history
- **Calendar Integration** - Sync tasks with external calendars (Google Calendar, Outlook)
- **Analytics Dashboard** - Visualize productivity trends, completion rates, and time tracking insights
- **Email Credentials Authentication** - Support non-SSO authentication via https://www.better-auth.com/
- **Notifications** - Email and push notifications for due dates, status changes
- **Tags & Categories** - Advanced organization beyond status and priority for flexible task grouping
- **Dark Mode** - Theme switching for user preference and reduced eye strain
- **Export & Reporting** - Generate reports and export data in various formats (CSV, PDF)
- **Subtasks & Dependencies** - Break down complex tasks and define relationships between tasks
- **Recurring Tasks** - Automatic task creation for repeating work with customizable schedules
- **File Attachments** - Upload and attach files, images, and documents to tasks

## License

This is a personal learning project and portfolio demonstration. You're welcome to explore the code, run it locally, and use it as a learning resource. However, formal licensing terms have not yet been determined for commercial use or redistribution.

---

Built with [Bun](https://bun.sh) - A fast all-in-one JavaScript runtime
