import { useState, useEffect } from 'react'

export function useTypewriter(text: string, speed = 15, delay = 0) {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (!text) {
      setDisplayedText('')
      setIsComplete(false)
      setIsTyping(false)
      return
    }

    setDisplayedText('')
    setIsComplete(false)
    setIsTyping(true)

    let i = 0
    let timeoutId: number

    const startTyping = () => {
      timeoutId = window.setInterval(() => {
        setDisplayedText((prev) => prev + text.charAt(i))
        i++
        if (i >= text.length) {
          clearInterval(timeoutId)
          setIsTyping(false)
          setIsComplete(true)
        }
      }, speed)
    }

    if (delay > 0) {
      timeoutId = window.setTimeout(() => {
        startTyping()
      }, delay)
    } else {
      startTyping()
    }

    return () => {
      clearInterval(timeoutId)
      clearTimeout(timeoutId)
    }
  }, [text, speed, delay])

  return { displayedText, isTyping, isComplete }
}
