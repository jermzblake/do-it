import { useEffect, useState } from 'react'

/**
 * Standard breakpoints matching common Tailwind CSS defaults
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

export type Breakpoint = keyof typeof BREAKPOINTS

export type ViewSize = 'mobile' | 'tablet' | 'desktop' | 'wide'

/**
 * Hook to check if a media query matches
 * @param query - CSS media query string (e.g., "(min-width: 768px)")
 * @returns boolean indicating if the query matches
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches
    }
    return false
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Set initial value
    setMatches(mediaQuery.matches)

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handler)
      return () => mediaQuery.removeListener(handler)
    }
  }, [query])

  return matches
}

/**
 * Hook to check if viewport is at or above a specific breakpoint
 * @param breakpoint - Breakpoint name (sm, md, lg, xl, 2xl)
 * @returns boolean indicating if viewport is at or above the breakpoint
 */
export const useBreakpoint = (breakpoint: Breakpoint): boolean => {
  const minWidth = BREAKPOINTS[breakpoint]
  return useMediaQuery(`(min-width: ${minWidth}px)`)
}

/**
 * Hook to get the current view size category
 * @returns ViewSize - "mobile" (<768px), "tablet" (768-1024px), "desktop" (1024-1536px), or "wide" (>=1536px)
 */
export const useViewSize = (): ViewSize => {
  const isMd = useBreakpoint('md')
  const isLg = useBreakpoint('lg')
  const is2xl = useBreakpoint('2xl')

  if (is2xl) return 'wide'
  if (isLg) return 'desktop'
  if (isMd) return 'tablet'
  return 'mobile'
}

/**
 * Hook to check if viewport is mobile size
 * @returns boolean indicating if viewport is below tablet breakpoint
 */
export const useIsMobile = (): boolean => {
  return !useBreakpoint('md')
}

/**
 * Hook to check if viewport is tablet size or larger
 * @returns boolean indicating if viewport is at or above tablet breakpoint
 */
export const useIsTablet = (): boolean => {
  return useBreakpoint('md')
}

/**
 * Hook to check if viewport is desktop size or larger
 * @returns boolean indicating if viewport is at or above desktop breakpoint
 */
export const useIsDesktop = (): boolean => {
  return useBreakpoint('lg')
}

/**
 * Hook to get detailed information about all breakpoints
 * @returns object with boolean flags for each breakpoint
 */
export const useBreakpoints = () => {
  const isSm = useBreakpoint('sm')
  const isMd = useBreakpoint('md')
  const isLg = useBreakpoint('lg')
  const isXl = useBreakpoint('xl')
  const is2xl = useBreakpoint('2xl')

  return {
    isSm,
    isMd,
    isLg,
    isXl,
    is2xl,
    // Convenience flags
    isMobile: !isMd,
    isTablet: isMd && !isLg,
    isDesktop: isLg && !is2xl,
    isWide: is2xl,
  }
}

/**
 * Hook to get the current window dimensions
 * @returns object with width and height
 */
export const useWindowSize = () => {
  const [size, setSize] = useState<{ width: number; height: number }>(() => {
    if (typeof window !== 'undefined') {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
      }
    }
    return { width: 0, height: 0 }
  })

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    // Set initial size
    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return size
}
