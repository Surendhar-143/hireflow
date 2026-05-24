import React from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  fadeVariants,
  slideUpVariants,
  slideDownVariants,
  scaleVariants,
  pageVariants,
  staggerContainerVariants,
  staggerItemVariants,
} from '@/lib/motion'

interface MotionProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

/* ─── FadeIn ─────────────────────────────────────────────────────────────── */
export function FadeIn({ children, className, delay = 0 }: MotionProps) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={reduced ? {} : fadeVariants}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  )
}

/* ─── SlideUp ────────────────────────────────────────────────────────────── */
export function SlideUp({ children, className, delay = 0 }: MotionProps) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={reduced ? fadeVariants : slideUpVariants}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  )
}

/* ─── SlideDown ──────────────────────────────────────────────────────────── */
export function SlideDown({ children, className, delay = 0 }: MotionProps) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={reduced ? fadeVariants : slideDownVariants}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  )
}

/* ─── ScaleIn ────────────────────────────────────────────────────────────── */
export function ScaleIn({ children, className, delay = 0 }: MotionProps) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={reduced ? fadeVariants : scaleVariants}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  )
}

/* ─── PageTransition ─────────────────────────────────────────────────────── */
export function PageTransition({ children, className }: MotionProps) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={reduced ? fadeVariants : pageVariants}
    >
      {children}
    </motion.div>
  )
}

/* ─── Stagger ────────────────────────────────────────────────────────────── */
interface StaggerProps extends MotionProps {
  stagger?: number
  delayChildren?: number
}

export function Stagger({ children, className, stagger = 0.06, delayChildren = 0 }: StaggerProps) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={reduced ? {} : staggerContainerVariants(stagger, delayChildren)}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className }: MotionProps) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      className={className}
      variants={reduced ? {} : staggerItemVariants}
    >
      {children}
    </motion.div>
  )
}

/* ─── AnimatePresenceWrapper ─────────────────────────────────────────────── */
interface PresenceProps {
  children: React.ReactNode
  mode?: 'wait' | 'sync' | 'popLayout'
  presenceKey: string | number
  className?: string
}

export function Presence({ children, mode = 'wait', presenceKey, className }: PresenceProps) {
  return (
    <AnimatePresence mode={mode}>
      <motion.div key={presenceKey} className={className}>
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

/* ─── Exports ────────────────────────────────────────────────────────────── */
export { AnimatePresence, motion }
