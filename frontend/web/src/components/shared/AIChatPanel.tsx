import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Send, X, Bot, User, Trash2, HelpCircle, ArrowRight, Zap, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { aiApi } from '@/api/ai.api'
import { useMe } from '@/hooks/useQueries'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
  isStreaming?: boolean
}

export function AIChatPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Hello! I am your HireFlow AI Assistant. I can help summarize resume highlights, analyze candidate skill gaps, verify requirements fit, or compare applicants. What would you like to explore today?",
    },
  ])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  
  const { data: me } = useMe()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const streamAbortRef = useRef<(() => void) | null>(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Clean up streaming on unmount
  useEffect(() => {
    return () => {
      if (streamAbortRef.current) streamAbortRef.current()
    }
  }, [])

  const handleSend = async (text: string) => {
    if (!text.trim()) return
    
    // Cancel any active stream
    if (streamAbortRef.current) {
      streamAbortRef.current()
      streamAbortRef.current = null
    }

    const userMessage: Message = {
      id: Math.random().toString(36).substring(2, 9),
      role: 'user',
      text: text.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputText('')
    setIsTyping(true)

    // Setup streaming target message
    const assistantMsgId = Math.random().toString(36).substring(2, 9)
    const assistantMessage: Message = {
      id: assistantMsgId,
      role: 'assistant',
      text: '',
      isStreaming: true,
    }

    setMessages((prev) => [...prev, assistantMessage])

    // Build recruiter context to pass to assistant
    const context = {
      userRole: me?.role || 'recruiter',
      userName: me?.name || 'User',
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
                ? { ...msg, text: msg.text + token }
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
          setIsTyping(false)
          streamAbortRef.current = null
        },
        (err) => {
          console.error('Chat stream failed:', err)
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId
                ? {
                    ...msg,
                    text: 'Sorry, the connection to the AI engine was interrupted. I am falling back online shortly!',
                    isStreaming: false,
                  }
                : msg
            )
          )
          setIsTyping(false)
          streamAbortRef.current = null
        }
      )

      streamAbortRef.current = abortStream
    } catch (error) {
      setIsTyping(false)
      toast.error('Failed to establish conversational session.')
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
        text: "Conversation cleared. What can I analyze for you next?",
      },
    ])
    setIsTyping(false)
  }

  const quickPrompts = [
    { label: 'Leadership', prompt: 'Summarize Alex Rivera\'s leadership and billing latency accomplishments.' },
    { label: 'Skills Alignment', prompt: 'Verify candidate match strength and Tailwind skill fit.' },
    { label: 'Compare Applicants', prompt: 'Compare modern UI frontend candidates shortlists.' },
  ]

  return (
    <>
      {/* Floating Action Button (FAB) Toggle */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 size-14 rounded-full bg-gradient-to-tr from-brand-600 via-brand-500 to-indigo-500 text-white shadow-2xl flex items-center justify-center cursor-pointer border border-white/20 hover:scale-105 active:scale-95 transition-all"
        style={{ boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)' }}
        whileHover={{ rotate: 5 }}
      >
        {isOpen ? <X className="size-6 animate-fade-in" /> : <Sparkles className="size-6 animate-pulse" />}
      </motion.button>

      {/* Slide-in Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%', opacity: 0.9 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.9 }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-surface-elevated/90 backdrop-blur-2xl border-l border-border/80 flex flex-col z-50 shadow-2xl"
          >
            {/* Header */}
            <div className="p-4 border-b border-border/80 flex items-center justify-between bg-secondary/10">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-brand-500/20">
                  <Bot className="size-4.5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-foreground tracking-wide flex items-center gap-1.5">
                    HireFlow Recruiter Copilot
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                  </h3>
                  <p className="text-[10px] text-muted-foreground">Dynamic pipeline assistance v1.0</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleClear}
                  title="Clear chat"
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-secondary/40 transition-colors"
                >
                  <Trash2 className="size-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Message Pane */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none">
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
                    {/* Avatar */}
                    <div className={cn(
                      'size-7 rounded-lg flex items-center justify-center shrink-0 border text-[10px]',
                      isAi 
                        ? 'bg-brand-500/10 border-brand-500/20 text-brand-400' 
                        : 'bg-secondary border-border/50 text-muted-foreground'
                    )}>
                      {isAi ? <Bot className="size-3.5" /> : <User className="size-3.5" />}
                    </div>

                    {/* Bubble */}
                    <div className={cn(
                      'rounded-2xl p-3 text-xs leading-relaxed border',
                      isAi
                        ? 'bg-secondary/30 border-border/50 text-foreground'
                        : 'bg-brand-500/10 border-brand-500/20 text-brand-600 dark:text-brand-300'
                    )}>
                      <p className="whitespace-pre-line">{msg.text}</p>
                      {msg.isStreaming && (
                        <span className="inline-block size-1.5 bg-brand-400 rounded-full animate-ping ml-1" />
                      )}
                    </div>
                  </div>
                )
              })}
              
              {isTyping && messages[messages.length - 1]?.text === '' && (
                <div className="flex items-start gap-2.5 mr-auto max-w-[80%] animate-pulse">
                  <div className="size-7 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center shrink-0">
                    <Bot className="size-3.5" />
                  </div>
                  <div className="rounded-2xl p-3 text-xs bg-secondary/30 border border-border/50 text-muted-foreground flex items-center gap-1">
                    <span className="size-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="size-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="size-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions & Prompt input */}
            <div className="p-4 border-t border-border/80 bg-secondary/10 space-y-3">
              {/* Pre-seeded prompts */}
              <div className="space-y-1.5">
                <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                  <Zap className="size-3 text-brand-400" /> Suggested Recruiter Queries
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {quickPrompts.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => handleSend(p.prompt)}
                      disabled={isTyping}
                      className="px-2 py-1 text-[10px] font-bold bg-secondary/30 border border-border/50 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 hover:border-brand-500/30 transition-all shrink-0 cursor-pointer disabled:opacity-50"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask about candidate experience, highlights..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend(inputText)}
                  disabled={isTyping}
                  className="flex-1 bg-background border border-border rounded-xl px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-brand-500/40 transition-colors disabled:opacity-50"
                />
                <Button
                  onClick={() => handleSend(inputText)}
                  disabled={isTyping || !inputText.trim()}
                  className="px-3 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shrink-0 hover:opacity-95 transition-opacity"
                >
                  <Send className="size-3.5" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
export default AIChatPanel
