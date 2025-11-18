import { useNavigate } from '@tanstack/react-router'
import { SignInButton } from '../components/ui/button'

export const LandingPage = () => {
  const navigate = useNavigate()

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 text-center">
        Do It <span className="text-blue-900">NOW</span>
      </h1>
      <SignInButton />
    </div>
  )
}
