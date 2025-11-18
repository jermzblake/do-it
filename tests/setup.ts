// Bun test setup: provide a minimal DOM via happy-dom for React Testing Library
import { Window } from 'happy-dom'

const windowInstance = new Window()

// Attach to globals
// @ts-ignore
globalThis.window = windowInstance as unknown as Window & typeof globalThis
// @ts-ignore
globalThis.document = windowInstance.document
// @ts-ignore
globalThis.HTMLElement = windowInstance.HTMLElement
// @ts-ignore
globalThis.Node = windowInstance.Node
// @ts-ignore
globalThis.navigator = { userAgent: 'happy-dom' } as any

// Polyfill requestAnimationFrame for React 19
// @ts-ignore
globalThis.requestAnimationFrame = (cb: FrameRequestCallback) =>
  setTimeout(() => cb(Date.now()), 0) as unknown as number
// @ts-ignore
globalThis.cancelAnimationFrame = (id: number) => clearTimeout(id)

// Polyfill matchMedia for hooks that rely on media queries
// @ts-ignore
if (!globalThis.window.matchMedia) {
  // @ts-ignore
  globalThis.window.matchMedia = (query: string) => {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {}, // deprecated
      removeListener: () => {}, // deprecated
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    } as unknown as MediaQueryList
  }
}

// Polyfill DocumentFragment for Radix UI components under happy-dom
// @ts-ignore
if (typeof globalThis.DocumentFragment === 'undefined') {
  // @ts-ignore
  globalThis.DocumentFragment = (globalThis.document as any).defaultView?.DocumentFragment ?? (function () {} as any)
}

// Suppress React act warnings in tests where we await settles
// (optional; keep console noise low)
const originalError = console.error
console.error = (...args) => {
  const msg = args[0]
  if (typeof msg === 'string' && msg.includes('Warning: An update to %s inside a test was not wrapped in act')) {
    return
  }
  originalError(...args)
}
