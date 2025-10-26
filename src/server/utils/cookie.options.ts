const sixMonths = 6 * 30 * 24 * 60 * 60 * 1000

interface CookieOptions {
  domain?: string
  path?: string
  expires?: Date
  maxAge?: number
  secure?: boolean
  httpOnly?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
}

export const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: false,
  expires: new Date(Date.now() + sixMonths), // Set the expiration time for the cookie
  // sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
}
