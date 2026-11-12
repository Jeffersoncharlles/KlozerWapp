import { SignInContainer } from '../features/sign-in/components/sign-in-container'
import { loadSignIn, signIn } from '../features/sign-in/services/sign-in-service'

export const loader = loadSignIn
export const action = signIn

export function SignIn() {
  return <SignInContainer />
}
