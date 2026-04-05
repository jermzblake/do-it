import { useRef, useCallback } from 'react'

/**
 * Synthesizes a kitchen-timer bell alarm using the Web Audio API.
 * Fires 3 rings with exponential gain decay, ~2s total.
 * Also triggers a browser Notification if permission is granted
 * (useful when the tab is in the background).
 */
export function useKitchenTimerAlarm() {
  const audioCtxRef = useRef<AudioContext | null>(null)

  const getAudioContext = useCallback((): AudioContext | null => {
    if (typeof window === 'undefined' || !window.AudioContext) return null
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext()
    }
    return audioCtxRef.current
  }, [])

  const playRing = useCallback((ctx: AudioContext, startTime: number) => {
    // Primary tone (bell fundamental)
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gainNode = ctx.createGain()

    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(880, startTime) // A5
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(1108.73, startTime) // C#6 — minor third above for "ding" character

    gainNode.gain.setValueAtTime(0.6, startTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6)

    osc1.connect(gainNode)
    osc2.connect(gainNode)
    gainNode.connect(ctx.destination)

    osc1.start(startTime)
    osc1.stop(startTime + 0.65)
    osc2.start(startTime)
    osc2.stop(startTime + 0.65)
  }, [])

  const playAlarm = useCallback(
    (message?: string) => {
      const ctx = getAudioContext()
      if (ctx) {
        const resume = () => {
          const now = ctx.currentTime
          playRing(ctx, now)
          playRing(ctx, now + 0.7)
          playRing(ctx, now + 1.4)
        }

        if (ctx.state === 'suspended') {
          ctx
            .resume()
            .then(resume)
            .catch(() => {})
        } else {
          resume()
        }
      }

      // Browser notification for background tabs
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        try {
          new Notification('Pomodoro Timer', {
            body: message ?? 'Phase complete!',
            icon: '/favicon.ico',
            silent: true, // audio is handled by Web Audio API
          })
        } catch {
          // Notifications not supported in this context — ignore
        }
      }
    },
    [getAudioContext, playRing],
  )

  return { playAlarm }
}
