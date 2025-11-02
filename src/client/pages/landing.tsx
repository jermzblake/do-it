import { useNavigate } from '@tanstack/react-router'
import { SignInButton } from '../components/ui/button'

export const LandingPage = () => {
  const navigate = useNavigate()

  return (
    <div>
      <h1>Welcome to the Landing Page</h1>
      <SignInButton />
    </div>
  )
}
