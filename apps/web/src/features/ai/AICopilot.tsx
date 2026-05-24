import React, { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Sparkles, Send, User, ChevronDown, RefreshCw } from 'lucide-react'
import { useUIStore } from '@/store/ui-store'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTypewriter } from '@/hooks/useTypewriter'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const INITIAL_MESSAGE: Message = {
  id: '1',
  role: 'assistant',
  content: "Hi! I'm your HireFlow Copilot. I can help you analyze your resume, prepare for interviews, or explain why you're a match for specific roles. How can I assist you today?",
}

const SUGGESTIONS = [
  'Review my resume',
  'Prepare me for a Vercel interview',
  'Why am I a 94% match for Senior Frontend?',
]

function AssistantMessage({ message }: { message: Message }) {
  // If it's the initial message, just show it. Otherwise, use typewriter.
  const isInitial = message.id === '1'
  const { displayedText, isTyping } = useTypewriter(isInitial ? '' : message.content, 20)

  return (
    <div className="flex gap-3 max-w-[90%]">
      <div className="size-8 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0">
        <Sparkles className="size-4 text-brand-400" />
      </div>
      <div className="space-y-1.5">
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
          {isInitial ? message.content : displayedText}
          {isTyping && <span className="inline-block w-1.5 h-3 ml-1 bg-brand-400 animate-pulse" />}
        </p>
      </div>
    </div>
  )
}

function UserMessage({ message }: { message: Message }) {
  return (
    <div className="flex gap-3 max-w-[90%] ml-auto flex-row-reverse">
      <div className="size-8 rounded-full bg-accent border border-border flex items-center justify-center shrink-0">
        <User className="size-4 text-foreground" />
      </div>
      <div className="bg-accent rounded-2xl rounded-tr-sm px-4 py-2.5">
        <p className="text-sm text-foreground">{message.content}</p>
      </div>
    </div>
  )
}

export function AICopilot() {
  const { copilotOpen, setCopilotOpen } = useUIStore()
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isProcessing])

  const handleSend = (text: string) => {
    if (!text.trim() || isProcessing) return

    const newMsg: Message = { id: Date.now().toString(), role: 'user', content: text }
    setMessages((prev) => [...prev, newMsg])
    setInput('')
    setIsProcessing(true)

    // Simulate AI thinking and responding
    setTimeout(() => {
      let replyContent = "That's an interesting question. Let me analyze your profile..."
      
      if (text.toLowerCase().includes('resume')) {
        replyContent = "I've scanned your resume. Your experience with React and TypeScript is strong, but you might want to highlight your performance optimization achievements more prominently for Senior roles."
      } else if (text.toLowerCase().includes('vercel')) {
        replyContent = "For Vercel, be prepared to discuss Next.js app router architecture, caching strategies (ISR, SWR), and edge computing. They highly value developer experience (DX)."
      } else if (text.toLowerCase().includes('match')) {
        replyContent = "You're a 94% match because you have 5+ years of React experience, you've worked in SaaS before, and your requested salary range aligns perfectly with the role."
      }

      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: replyContent }
      setMessages((prev) => [...prev, aiMsg])
      setIsProcessing(false)
    }, 1500)
  }

  return (
    <AnimatePresence>
      {copilotOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/20 z-50 lg:hidden backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCopilotOpen(false)}
          />
          <motion.div
            className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-background border-l border-border z-50 flex flex-col shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Header */}
            <div className="h-14 border-b border-border flex items-center justify-between px-4 shrink-0 bg-surface-elevated/50 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-md bg-brand-500/10 flex items-center justify-center">
                  <Sparkles className="size-4 text-brand-400" />
                </div>
                <span className="font-semibold text-foreground">HireFlow Copilot</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-brand-500/10 text-brand-400 border border-brand-500/20">Beta</span>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={() => setCopilotOpen(false)} aria-label="Close Copilot">
                <X className="size-4" />
              </Button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
              {messages.map((msg) =>
                msg.role === 'assistant' ? (
                  <AssistantMessage key={msg.id} message={msg} />
                ) : (
                  <UserMessage key={msg.id} message={msg} />
                )
              )}
              {isProcessing && (
                <div className="flex gap-3 max-w-[90%]">
                  <div className="size-8 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0">
                    <Sparkles className="size-4 text-brand-400" />
                  </div>
                  <div className="flex items-center gap-1 bg-accent/50 rounded-2xl rounded-tl-sm px-4 py-3 w-16">
                    <span className="size-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="size-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="size-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border bg-surface-elevated">
              {messages.length === 1 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSend(s)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium bg-muted text-muted-foreground hover:bg-accent hover:text-foreground transition-colors border border-border"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend(input)
                }}
                className="relative"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask copilot anything..."
                  className="w-full h-11 pl-4 pr-12 rounded-xl border border-input bg-background text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 transition-shadow"
                />
                <Button
                  type="submit"
                  size="icon-sm"
                  variant="primary"
                  className={cn("absolute right-1.5 top-1.5 size-8", !input.trim() && "opacity-50 cursor-not-allowed")}
                  disabled={!input.trim() || isProcessing}
                  aria-label="Send message"
                >
                  <Send className="size-3.5" />
                </Button>
              </form>
              <div className="mt-2 text-center">
                <span className="text-[10px] text-muted-foreground/60 flex items-center justify-center gap-1">
                  <Sparkles className="size-3" /> AI can make mistakes. Verify important info.
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
