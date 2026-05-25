import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Briefcase, ArrowRight, Sparkles, Users, Building2, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import logo from '@/assets/logo.png'
import logoText from '@/assets/logo_text.png'
import { Badge } from '@/components/ui/badge'
import { Stagger, StaggerItem, FadeIn } from '@/components/motion'
import { buttonVariants, Button } from '@/components/ui/button'

const STATS = [
  { label: 'Open Roles', value: '12,400+' },
  { label: 'Companies', value: '1,800+' },
  { label: 'Placements', value: '43,000+' },
  { label: 'Avg. Match Score', value: '94%' },
]

const FEATURES = [
  { icon: Sparkles, title: 'AI-Powered Matching', desc: 'Our engine scores every job against your profile in real time — no guesswork.' },
  { icon: Zap, title: 'Instant Applications', desc: 'One-click apply with your HireFlow profile. Recruiters see you in seconds.' },
  { icon: Users, title: 'Recruiter Pipelines', desc: 'Recruiters get structured pipelines, not email inboxes.' },
  { icon: Building2, title: 'Rich Company Profiles', desc: 'Culture, tech stack, team, and real employee reviews — all in one place.' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Ambient gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-brand-600/10 blur-[120px]" />
      </div>

      {/* Nav */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 h-16 border-b border-border/50 backdrop-blur-md bg-background/70">
        <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <img src={logo} className="size-8 object-contain shrink-0" alt="HireFlow logo" />
          <img src={logoText} className="h-5 object-contain shrink-0" alt="HireFlow text logo" />
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <Link to="/jobs" className="hover:text-foreground transition-colors">Browse Jobs</Link>
          <Link to="/companies" className="hover:text-foreground transition-colors">Companies</Link>
          <Link to="/app/recruiter" className="hover:text-foreground transition-colors">For Recruiters</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/app/dashboard" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>Sign In</Link>
          <Link to="/app/dashboard" className={cn(buttonVariants({ variant: 'premium', size: 'sm' }))}>Get Started</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center pt-24 pb-20 px-6">
        <FadeIn delay={0.1}>
          <Badge variant="premium" className="mb-6">
            <Sparkles className="size-3" />
            AI-Native Job Board — Now in Beta
          </Badge>
        </FadeIn>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold tracking-tight max-w-4xl leading-[1.1]"
        >
          Find work that{' '}
          <span className="gradient-text">actually fits</span>
          <br /> who you are.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="mt-6 text-xl text-muted-foreground max-w-xl leading-relaxed"
        >
          HireFlow uses AI to match you to roles — not just keywords. Transparent pipelines, real company culture, and zero noise.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="mt-10 flex items-center gap-3 flex-wrap justify-center"
        >
          <Link to="/jobs" className={cn(buttonVariants({ variant: 'premium', size: 'xl' }), 'gap-2')}>
            Browse Jobs <ArrowRight className="size-4" />
          </Link>
          <Link to="/app/recruiter" className={cn(buttonVariants({ variant: 'outline', size: 'xl' }))}>
            Post a Role
          </Link>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="relative z-10 py-12 border-y border-border/50">
        <Stagger className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 px-6 text-center">
          {STATS.map((s) => (
            <StaggerItem key={s.label}>
              <div className="text-3xl font-bold text-foreground">{s.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Features */}
      <section className="relative z-10 py-24 px-6">
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight">Built different, by design</h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
              Every feature was designed around one question: does this make finding great work easier?
            </p>
          </div>
        </FadeIn>
        <Stagger className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">
          {FEATURES.map((f) => (
            <StaggerItem key={f.title}>
              <div className="glass p-6 rounded-2xl h-full hover:glow-sm transition-shadow duration-slow">
                <div className="flex items-center justify-center size-10 rounded-xl bg-brand-500/10 text-brand-400 mb-4">
                  <f.icon className="size-5" />
                </div>
                <h3 className="text-base font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="glass rounded-3xl p-12 glow">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Ready to find your role?</h2>
            <p className="mt-4 text-muted-foreground">Join 43,000+ professionals who found their next chapter on HireFlow.</p>
            <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
              <Link to="/app/dashboard" className={cn(buttonVariants({ variant: 'premium', size: 'lg' }))}>
                Start for free
              </Link>
              <Link to="/jobs" className={cn(buttonVariants({ variant: 'ghost', size: 'lg' }))}>
                Explore jobs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8 px-6 text-center text-sm text-muted-foreground">
        © 2025 HireFlow, Inc. — Built with AI, shipped with care.
      </footer>
    </div>
  )
}

