import React, { useState, useEffect, useRef } from 'react'
import { Sparkles, Search, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface SemanticSearchBarProps {
  initialValue: string
  onSearch: (val: string) => void
  onClear: () => void
}

const EXTRACTABLE_KEYWORDS = ['remote', 'frontend', 'react', '150k', 'senior', 'startup']

export function SemanticSearchBar({ initialValue, onSearch, onClear }: SemanticSearchBarProps) {
  const [value, setValue] = useState(initialValue)
  const [isFocused, setIsFocused] = useState(false)
  const [parsedTokens, setParsedTokens] = useState<{ text: string; isPill: boolean }[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Parse natural language into pills visually
  useEffect(() => {
    if (!value) {
      setParsedTokens([])
      return
    }

    const words = value.split(' ')
    const tokens = words.map(w => {
      const cleanWord = w.toLowerCase().replace(/[^a-z0-9]/g, '')
      if (EXTRACTABLE_KEYWORDS.includes(cleanWord)) {
        return { text: w, isPill: true }
      }
      return { text: w, isPill: false }
    })
    
    setParsedTokens(tokens)
  }, [value])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(value)
  }

  const handleClear = () => {
    setValue('')
    onClear()
  }

  const hasPills = parsedTokens.some(t => t.isPill)

  return (
    <form onSubmit={handleSubmit} className="relative max-w-3xl group">
      {/* Background glow when AI parsing is active */}
      <AnimatePresence>
        {isFocused && hasPills && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -inset-1 bg-gradient-to-r from-brand-500/20 via-brand-400/20 to-info/20 rounded-xl blur-md -z-10"
          />
        )}
      </AnimatePresence>

      <div className={cn(
        "relative flex items-center min-h-[44px] rounded-xl border bg-background transition-all overflow-hidden",
        isFocused ? "border-brand-500/50 ring-2 ring-brand-500/20" : "border-input shadow-sm"
      )}>
        <div className="pl-3.5 pr-2 flex items-center justify-center">
          {hasPills ? (
            <Sparkles className="size-4 text-brand-400 animate-pulse" />
          ) : (
            <Search className="size-4 text-muted-foreground" />
          )}
        </div>

        {/* Visual Pill Overlay overlaying the input */}
        <div 
          className="absolute inset-0 left-9 right-24 flex items-center gap-1.5 px-2 pointer-events-none overflow-hidden whitespace-nowrap"
          aria-hidden="true"
        >
          {parsedTokens.map((token, i) => (
            token.isPill ? (
              <motion.span
                key={`${i}-${token.text}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border",
                  "bg-brand-500/10 text-brand-500 border-brand-500/20 backdrop-blur-sm"
                )}
              >
                {token.text}
              </motion.span>
            ) : (
              <span key={`${i}-${token.text}`} className={cn("text-sm", isFocused || value ? "text-transparent" : "text-muted-foreground")}>
                {token.text}
              </span>
            )
          ))}
        </div>

        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={hasPills ? "" : "Ask for 'remote senior react roles over $150k'..."}
          className={cn(
            "flex-1 h-11 bg-transparent px-2 text-sm focus-visible:outline-none",
            // Hide real text when pills are showing to prevent overlapping mess
            hasPills ? "text-transparent caret-foreground" : "text-foreground placeholder:text-muted-foreground"
          )}
        />

        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-[88px] text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            <X className="size-4" />
          </button>
        )}

        <div className="absolute right-1.5">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            className={cn(
              "transition-all",
              hasPills ? "bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 border-0" : ""
            )}
          >
            {hasPills ? (
              <span className="flex items-center gap-1"><Sparkles className="size-3" /> Search</span>
            ) : (
              "Search"
            )}
          </Button>
        </div>
      </div>
      
      {/* Search Hints */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="font-medium">Try:</span>
        <button onClick={() => { setValue('Remote React over 150k'); onSearch('Remote React over 150k') }} className="px-2 py-1 rounded-md bg-accent/50 hover:bg-accent hover:text-foreground transition-colors">Remote React over 150k</button>
        <button onClick={() => { setValue('Senior frontend startup'); onSearch('Senior frontend startup') }} className="px-2 py-1 rounded-md bg-accent/50 hover:bg-accent hover:text-foreground transition-colors">Senior frontend startup</button>
      </div>
    </form>
  )
}
