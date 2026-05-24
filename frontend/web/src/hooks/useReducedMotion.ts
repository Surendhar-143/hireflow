import { useEffect, useState } from 'react'

/**
 * useReducedMotion
 * ─────────────────────────────────────────────────────────────────────────────
 * Returns true when the user has `prefers-reduced-motion: reduce` set in
 * their OS/browser accessibility settings.
 *
 * Use this to conditionally disable or simplify animations in JS-driven
 * motion (e.g. framer-motion, manual requestAnimationFrame loops).
 *
 * CSS animations are handled separately via the `@media (prefers-reduced-motion)`
 * block in globals.css.
 *
 * @example
 *   const reducedMotion = useReducedMotion()
 *   <motion.div animate={reducedMotion ? {} : { x: 100 }} />
 */
export function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState<boolean>(() => {
    // Safe SSR/initial check
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReduced(e.matches)
    }

    // Modern API
    mq.addEventListener('change', handler)

    // Set initial value (in case it changed between render and effect)
    setPrefersReduced(mq.matches)

    return () => mq.removeEventListener('change', handler)
  }, [])

  return prefersReduced
}
