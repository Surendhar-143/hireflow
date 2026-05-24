import type { Variants, Transition } from 'framer-motion'

/* ─── Transition Presets ─────────────────────────────────────────────────────*/

export const transitions = {
  fast: { duration: 0.15, ease: [0.4, 0, 0.2, 1] } satisfies Transition,
  base: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } satisfies Transition,
  slow: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } satisfies Transition,
  spring: { type: 'spring', stiffness: 300, damping: 30 } satisfies Transition,
  springSmooth: { type: 'spring', stiffness: 200, damping: 25 } satisfies Transition,
} as const

/* ─── Variant Presets ────────────────────────────────────────────────────────*/

export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitions.base },
  exit: { opacity: 0, transition: transitions.fast },
}

export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: transitions.base },
  exit: { opacity: 0, y: -6, transition: transitions.fast },
}

export const slideDownVariants: Variants = {
  hidden: { opacity: 0, y: -12 },
  visible: { opacity: 1, y: 0, transition: transitions.base },
  exit: { opacity: 0, y: 12, transition: transitions.fast },
}

export const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: transitions.springSmooth },
  exit: { opacity: 0, scale: 0.95, transition: transitions.fast },
}

export const pageVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.15, ease: [0.4, 0, 1, 1] } },
}

export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0, transition: transitions.springSmooth },
  exit: { opacity: 0, scale: 0.96, y: 8, transition: transitions.fast },
}

export const sidebarVariants: Variants = {
  expanded: { width: 'var(--sidebar-width)', transition: transitions.slow },
  collapsed: { width: 'var(--sidebar-collapsed-width)', transition: transitions.slow },
}

export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitions.base },
  exit: { opacity: 0, transition: transitions.fast },
}

/**
 * Stagger children with a delay
 */
export function staggerContainerVariants(stagger = 0.06, delayChildren = 0): Variants {
  return {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger, delayChildren },
    },
  }
}

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: transitions.base },
}
