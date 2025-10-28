import { createResponse, createErrorResponse, ResponseCode, StatusCode } from '../../utils/response.ts'
import { randomUUID } from 'crypto'
import * as SessionService from '../../services/auth/sessions.service.ts'
import * as UsersService from '../../services/users/users.service.ts'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
const REDIRECT_URI = 'http://localhost:3000/api/auth/callback'

const STATE_STORE = new Map<string, { verifier: string; created: number }>()

const base64url = (buf: ArrayBuffer | ArrayBufferView) => {
  // normalize to Uint8Array so Buffer.from receives an ArrayLike<number>
  let bytes: Uint8Array
  if (buf instanceof ArrayBuffer) {
    bytes = new Uint8Array(buf)
  } else {
    const view = buf as ArrayBufferView
    bytes = new Uint8Array(view.buffer, view.byteOffset, view.byteLength)
  }
  return Buffer.from(bytes).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const pkcePair = async () => {
  const buffer = new ArrayBuffer(32)
  const verifier = base64url(crypto.getRandomValues(new Uint8Array(buffer)))
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
  const challenge = base64url(digest)
  return { verifier, challenge }
}

export const handleAuthStart = async () => {
  const { verifier, challenge } = await pkcePair()
  const state = randomUUID()

  STATE_STORE.set(state, { verifier, created: Date.now() })

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  url.searchParams.set('client_id', GOOGLE_CLIENT_ID)
  url.searchParams.set('redirect_uri', REDIRECT_URI)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', 'openid email profile')
  url.searchParams.set('state', state)
  url.searchParams.set('code_challenge', challenge)
  url.searchParams.set('code_challenge_method', 'S256')

  return new Response(null, { status: 302, headers: { Location: url.toString() } })
}

export const handleAuthCallback = async (request: Bun.BunRequest) => {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')

  if (!code || !state) return new Response('Missing params', { status: 400 })
  const stored = STATE_STORE.get(state)
  // if (!stored) return new Response("Invalid state", { status: 400 });
  if (!stored) {
    const response = createErrorResponse(
      'Invalid state',
      ResponseCode.BAD_REQUEST,
      'The provided state parameter is invalid or has expired',
    )
    return Response.json(response, { status: 400 })
  }

  // Exchange authorization code for tokens
  const body = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code',
    code,
    code_verifier: stored.verifier,
  })

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!tokenRes.ok) {
    const response = createErrorResponse(
      'Error fetching tokens',
      ResponseCode.BAD_REQUEST,
      `Token endpoint returned ${tokenRes.status}`,
    )
    return Response.json(response, { status: 400 })
  }
  const tokenData = await tokenRes.json()

  // Fetch user info
  const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  })
  if (!userInfoRes.ok) {
    const response = createErrorResponse(
      'Error fetching user info',
      ResponseCode.BAD_REQUEST,
      `Userinfo endpoint returned ${userInfoRes.status}`,
    )
    return Response.json(response, { status: 400 })
  }
  const userInfo = await userInfoRes.json()

  //upsert user
  const userPayload = {
    email: String(userInfo.email),
    name: String(userInfo.name),
    ssoType: 'google',
    ssoId: String(userInfo.sub),
  }
  let user
  try {
    user = await UsersService.createUser(userPayload)
  } catch (error) {
    const response = createErrorResponse(
      'Error upserting user',
      ResponseCode.INTERNAL_SERVER_ERROR,
      (error as Error).message,
    )
    return Response.json(response, { status: 500 })
  }

  //create session
  //TODO: generate a secure random token (JWT or similar)
  const sessionToken = randomUUID()
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) // 7 days
  try {
    await SessionService.createSession({
      userId: user.id,
      sessionToken,
      expiresAt: expires,
    })
  } catch (error) {
    console.error('Error creating session:', (error as Error).message)
    const response = createErrorResponse(
      'Error creating session',
      ResponseCode.INTERNAL_SERVER_ERROR,
      (error as Error).message,
    )
    return Response.json(response, { status: 500 })
  }

  const res = new Response(null, { status: 302, headers: { Location: '/' } })
  res.headers.set('Set-Cookie', `session=${sessionToken}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`)
  return res
}
