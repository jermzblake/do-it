import { RouterProvider } from '@tanstack/react-router'
import { router } from './routes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/client/components/ui/card'
import { APITester } from './APITester'
import '.././index.css'

import logo from '.././logo.svg'
import reactLogo from '.././react.svg'
import { SignInButton } from '@/client/components/ui/button'

// Register Providers here if needed
export function App() {
  return <RouterProvider router={router} />
}

export default App
