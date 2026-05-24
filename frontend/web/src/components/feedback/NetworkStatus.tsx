import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff, Wifi } from 'lucide-react'

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const [showStatus, setShowStatus] = useState(false)
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleOnline = () => {
      setIsOnline(true)
      setWasOffline(true)
      setShowStatus(true)
      // Hide back online status after 4 seconds
      const timer = setTimeout(() => setShowStatus(false), 4000)
      return () => clearTimeout(timer)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowStatus(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Initial check
    if (!navigator.onLine) {
      setIsOnline(false)
      setShowStatus(true)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <AnimatePresence>
      {showStatus && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-2xl border backdrop-blur-md shadow-2xl flex items-center gap-3 max-w-sm w-[90%]"
          style={{
            backgroundColor: isOnline
              ? 'rgba(34, 197, 94, 0.08)' // Green-500 tint
              : 'rgba(245, 158, 11, 0.08)', // Amber-500 tint
            borderColor: isOnline
              ? 'rgba(34, 197, 94, 0.2)'
              : 'rgba(245, 158, 11, 0.2)',
            boxShadow: isOnline
              ? '0 10px 30px -10px rgba(34, 197, 94, 0.2)'
              : '0 10px 30px -10px rgba(245, 158, 11, 0.2)',
          }}
        >
          <div
            className={`flex items-center justify-center size-8 rounded-xl shrink-0 ${
              isOnline
                ? 'bg-success/20 text-success'
                : 'bg-warning/20 text-warning'
            }`}
          >
            {isOnline ? (
              <Wifi className="size-4 animate-pulse" />
            ) : (
              <WifiOff className="size-4 animate-bounce" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-foreground">
              {isOnline ? 'Back Online' : 'Network Offline'}
            </h4>
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
              {isOnline
                ? 'Syncing latest tech job posts...'
                : 'Showing cached job data. Reconnecting when network restores.'}
            </p>
          </div>
          <button
            onClick={() => setShowStatus(false)}
            className="text-muted-foreground/60 hover:text-foreground text-[10px] font-medium px-2 py-1 hover:bg-white/5 rounded-lg transition-colors shrink-0"
          >
            Dismiss
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
