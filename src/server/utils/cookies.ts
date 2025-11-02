export const setCookie = (name: string, value: string, opts: Record<string, any>) => {
  const options = {
    path: '/',
    httpOnly: opts.httpOnly ?? true,
    secure: opts.secure ?? false,
    sameSite: opts.sameSite ?? 'Lax',
    maxAge: opts.maxAge ?? 60 * 60 * 24 * 30, // default 30 days
    ...opts,
  }

  const cookie = `${name}=${value}; Path=${options.path}; Max-Age=${options.maxAge}; SameSite=${options.sameSite}${
    options.httpOnly ? '; HttpOnly' : ''
  }${options.secure ? '; Secure' : ''}`

  return cookie
}

export const getCookie = (req: Bun.BunRequest, name: string): string | null => {
  const cookieHeader = req.headers.get('Cookie')
  if (!cookieHeader) return null
  const match = cookieHeader.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1] as string) : null
}

export const deleteCookie = (name: string) => {
  return `${name}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`
}
