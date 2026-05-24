import React, { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Sparkles, Send, User, Bot, Trash2, HelpCircle, Zap } from 'lucide-react'
import { useUIStore } from '@/store/ui-store'
import { Button } from '@/components/ui/button'
import { useMe } from '@/hooks/useQueries'
import { aiApi } from '@/api/ai.api'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

const INITIAL_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: "Hi! I'm your HireFlow Recruiter Copilot. I can help analyze candidate experiences, verify required skills alignment, summarize developer resumes, or draft templates. How can I assist you today?",
}

const SUGGESTIONS = [
  { label: 'Summarize Stripe Experience', text: 'Highlight candidate leadership achievements at Stripe.' },
  { label: 'Verify Skill Fit', text: 'Verify candidate match strength and Tailwind skill fit.' },
  { label: 'Compare Candidates', text: 'Compare modern UI frontend candidates shortlists.' },
]

export function AICopilot() {
  const { copilotOpen, setCopilotOpen } = useUIStore()
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  
  const { data: me } = useMe()
  const scrollRef = useRef<HTMLDivElement>(null)
  const streamAbortRef = useRef<(() => void) | null>(null)

  // Auto-scroll to bottom on message updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isProcessing])

  // Cleanup active streams on unmount
  useEffect(() => {
    return () => {
      if (streamAbortRef.current) streamAbortRef.current()
    }
  }, [])

  const handleSend = async (text: string) => {
    if (!text.trim() || isProcessing) return

    // Cancel any active stream
    if (streamAbortRef.current) {
      streamAbortRef.current()
      streamAbortRef.current = null
    }

    const userMsg: Message = {
      id: Math.random().toString(36).substring(2, 9),
      role: 'user',
      content: text.trim(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsProcessing(true)

    const assistantMsgId = Math.random().toString(36).substring(2, 9)
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      isStreaming: true,
    }

    setMessages((prev) => [...prev, assistantMsg])

    // Build context payload
    const context = {
      userRole: me?.role || 'recruiter',
      userName: me?.name || 'Recruiter',
      companyId: me?.recruiterProfile?.companyId || null,
      currentPath: window.location.pathname,
    }

    try {
      const abortStream = aiApi.chatAssistantStream(
        text.trim(),
        context,
        (token) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId
                ? { ...msg, content: msg.content + token }
                : msg
            )
          )
        },
        () => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId
                ? { ...msg, isStreaming: false }
                : msg
            )
          )
          setIsProcessing(false)
          streamAbortRef.current = null
        },
        (err) => {
          console.error('AICopilot stream error:', err)
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId
                ? {
                    ...msg,
                    content: 'Sorry, connection to the AI engine was lost. Falling back to local index shortly!',
                    isStreaming: false,
                  }
                : msg
            )
          )
          setIsProcessing(false)
          streamAbortRef.current = null
        }
      )

      streamAbortRef.current = abortStream
    } catch (err: any) {
      setIsProcessing(false)
      toast.error('Failed to start assistant conversation session')
    }
  }

  const handleClear = () => {
    if (streamAbortRef.current) {
      streamAbortRef.current()
      streamAbortRef.current = null
    }
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: "Conversation cleared. What can I analyze for you next?",
      },
    ])
    setIsProcessing(false)
  }

  return (
    <AnimatePresence>
      {copilotOpen && (
        <>
          {/* Mobile Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-50 lg:hidden backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCopilotOpen(false)}
          />

          {/* Sliding Copilot Drawer */}
          <motion.div
            className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-slate-950/90 backdrop-blur-2xl border-l border-white/[0.08] z-50 flex flex-col shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
          >
            {/* Header */}
            <div className="h-16 border-b border-white/[0.08] flex items-center justify-between px-4 shrink-0 bg-white/[0.02]">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-brand-500/20">
                  <Bot className="size-4.5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xs text-foreground tracking-wide">HireFlow Copilot</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-brand-500/10 text-brand-400 border border-brand-500/20 uppercase">Streaming v1</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Real-time candidate evaluation</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleClear}
                  title="Clear conversation"
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-white/5 transition-colors"
                >
                  <Trash2 className="size-3.5" />
                </button>
                <Button variant="ghost" size="icon-sm" onClick={() => setCopilotOpen(false)} aria-label="Close Copilot" className="rounded-lg">
                  <X className="size-4" />
                </Button>
              </div>
            </div>

            {/* Scrollable Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-none" ref={scrollRef}>
              {messages.map((msg) => {
                const isAi = msg.role === 'assistant'
                return (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex items-start gap-2.5 max-w-[85%] animate-fade-in',
                      isAi ? 'mr-auto' : 'ml-auto flex-row-reverse'
                    )}
                  >
                    {/* Role Avatar */}
                    <div className={cn(
                      'size-7 rounded-lg flex items-center justify-center shrink-0 border text-[10px]',
                      isAi 
                        ? 'bg-brand-500/10 border-brand-500/20 text-brand-400' 
                        : 'bg-slate-800 border-white/[0.06] text-muted-foreground'
                    )}>
                      {isAi ? <Bot className="size-3.5" /> : <User className="size-3.5" />}
                    </div>

                    {/* Chat Bubble */}
                    <div className={cn(
                      'rounded-2xl p-3 text-xs leading-relaxed border',
                      isAi
                        ? 'bg-white/[0.02] border-white/[0.06] text-foreground'
                        : 'bg-brand-500/10 border-brand-500/20 text-brand-300'
                    )}>
                      <p className="whitespace-pre-line">{msg.content}</p>
                      {msg.isStreaming && (
                        <span className="inline-block size-1.5 bg-brand-400 rounded-full animate-ping ml-1" />
                      )}
                    </div>
                  </div>
                )
              })}

              {isProcessing && messages[messages.length - 1]?.content === '' && (
                <div className="flex items-start gap-2.5 mr-auto max-w-[80%] animate-pulse">
                  <div className="size-7 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center shrink-0">
                    <Bot className="size-3.5" />
                  </div>
                  <div className="rounded-2xl p-3 text-xs bg-white/[0.02] border border-white/[0.06] text-muted-foreground flex items-center gap-1">
                    <span className="size-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="size-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="size-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Input & Quick Suggestions Footer */}
            <div className="p-4 border-t border-white/[0.08] bg-white/[0.01] space-y-3.5">
              {/* Quick Prompt Suggesters */}
              {messages.length === 1 && (
                <div className="space-y-1.5">
                  <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                    <Zap className="size-3 text-brand-400 animate-pulse" />
                    <span>Quick Recruiter Queries</span>
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s.label}
                        onClick={() => handleSend(s.text)}
                        disabled={isProcessing}
                        className="w-full text-left px-3 py-2 text-[10px] font-semibold bg-white/5 border border-white/[0.06] hover:border-brand-500/30 rounded-xl text-muted-foreground hover:text-foreground transition-all truncate cursor-pointer disabled:opacity-50"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Composer */}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend(input)
                }}
                className="relative flex gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask copilot anything..."
                  disabled={isProcessing}
                  className="flex-1 bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-brand-500/40 transition-colors disabled:opacity-50"
                />
                <Button
                  type="submit"
                  disabled={isProcessing || !input.trim()}
                  className={cn(
                    "rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shrink-0 hover:opacity-95 transition-opacity px-3.5",
                    (!input.trim() || isProcessing) && "opacity-50 cursor-not-allowed"
                  )}
                  aria-label="Send message"
                >
                  <Send className="size-3.5" />
                </Button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
export default AICopilot
