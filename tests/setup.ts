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

// Polyfill getComputedStyle for Radix Presence animations
// @ts-ignore
if (typeof globalThis.getComputedStyle === 'undefined') {
  // @ts-ignore
  globalThis.getComputedStyle = windowInstance.getComputedStyle.bind(windowInstance)
}

// Polyfill MutationObserver used by Radix FocusScope
// @ts-ignore
if (typeof globalThis.MutationObserver === 'undefined') {
  // @ts-ignore
  globalThis.MutationObserver = (windowInstance as any).MutationObserver
}

// Polyfill NodeFilter for focus trapping logic
// @ts-ignore
if (typeof (globalThis as any).NodeFilter === 'undefined') {
  // @ts-ignore
  ;(globalThis as any).NodeFilter = (windowInstance as any).NodeFilter ?? { SHOW_ELEMENT: 1 }
}

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

// Map specific element classes commonly referenced by Radix/FocusScope
// @ts-ignore
if (typeof (globalThis as any).HTMLInputElement === 'undefined') {
  // @ts-ignore
  ;(globalThis as any).HTMLInputElement = (windowInstance as any).HTMLInputElement
}
// @ts-ignore
if (typeof (globalThis as any).HTMLTextAreaElement === 'undefined') {
  // @ts-ignore
  ;(globalThis as any).HTMLTextAreaElement = (windowInstance as any).HTMLTextAreaElement
}
// @ts-ignore
if (typeof (globalThis as any).HTMLSelectElement === 'undefined') {
  // @ts-ignore
  ;(globalThis as any).HTMLSelectElement = (windowInstance as any).HTMLSelectElement
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
