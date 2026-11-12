import { redirect, type LoaderFunctionArgs } from 'react-router'
import { z } from 'zod'

const authTokenSchema = z.string().trim().min(1)

export function getAuthToken() {
  const token = authTokenSchema.safeParse(localStorage.getItem('klozer_token'))

  return token.success ? token.data : null
}

export function authenticateMiddleware({ request }: LoaderFunctionArgs) {
  if (getAuthToken()) {
    return null
  }

  const redirectTo = new URL(request.url).pathname
  throw redirect(`/?redirectTo=${encodeURIComponent(redirectTo)}`)
}
