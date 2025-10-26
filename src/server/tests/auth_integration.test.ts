// Lightweight integration-style test that mocks external network and services.
// Run this script with Bun or ts-node if available. It's not a formal test runner
// integration; it's a runnable verification script.

import * as AuthController from '../../controllers/auth/auth.controller.ts'
import * as UsersController from '../../controllers/users/users.controller.ts'
import * as UsersService from '../../services/users/users.service.ts'
import * as SessionService from '../../services/auth/sessions.service.ts'

// monkey-patch global fetch to simulate token and userinfo endpoints
const originalFetch = (globalThis as any).fetch
;(globalThis as any).fetch = async (input: any, init?: any) => {
  const url = String(input)
  if (url.includes('oauth2.googleapis.com/token')) {
    return {
      ok: true,
      status: 200,
      json: async () => ({ access_token: 'fake-access-token' }),
    }
  }
  if (url.includes('www.googleapis.com/oauth2/v3/userinfo')) {
    return {
      ok: true,
      status: 200,
      json: async () => ({ email: 'test@example.com', name: 'Test User', sub: 'google-sub-123' }),
    }
  }
  if (originalFetch) return originalFetch(input, init)
  return { ok: false, status: 500 }
}

// stub user/session services
const createdUsers: any[] = []
const createdSessions: any[] = ([](UsersService as any).createUser = async (payload: any) => {
  const user = { id: 'u-' + Date.now(), ...payload }
  createdUsers.push(user)
  return user
})

;(SessionService as any).createSession = async (payload: any) => {
  const session = { id: 's-' + Date.now(), ...payload }
  createdSessions.push(session)
  return session
}

;(UsersService as any).getUserBySessionToken = async (token: string) => {
  const sess = createdSessions.find((s) => s.sessionToken === token)
  if (!sess) return null
  // return user previously created
  return createdUsers.find((u) => u.id === sess.userId) ?? null
}

const run = async () => {
  console.log('Starting test: simulate OAuth flow...')

  // start the flow to get state
  const startRes = await AuthController.handleAuthStart()
  const loc = startRes.headers.get('Location') || ''
  const state = new URL(loc).searchParams.get('state')
  if (!state) throw new Error('No state from start')

  // simulate callback request URL: include code and state
  const callbackUrl = `http://localhost/api/auth/callback?code=mock-code&state=${state}`
  const callbackReq = new Request(callbackUrl)
  const callbackRes = await AuthController.handleAuthCallback(callbackReq)

  if (callbackRes.status !== 302) throw new Error('Callback did not redirect')
  const setCookie = callbackRes.headers.get('Set-Cookie')
  if (!setCookie) throw new Error('No Set-Cookie header on callback response')

  const match = setCookie.match(/session=([^;]+)/)
  if (!match) throw new Error('Set-Cookie did not contain session token')
  const sessionToken = match[1]

  console.log('Got session token:', sessionToken)

  // now call /api/users/me with cookie
  const meReq = new Request('http://localhost/api/users/me', { headers: { cookie: `session=${sessionToken}` } })
  const meRes = await UsersController.getMe(meReq)
  if (meRes.status !== 200) {
    const body = await meRes.text()
    throw new Error('getMe failed: ' + body)
  }
  const body = await meRes.json()
  console.log('getMe response body:', body)
  console.log('Test passed ✅')
}

run()
  .catch((err) => {
    console.error('Test failed ❌', err)
  })
  .finally(() => {
    ;(globalThis as any).fetch = originalFetch
  })
