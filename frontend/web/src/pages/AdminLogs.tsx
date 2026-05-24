import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, ShieldAlert, Users, Search, RefreshCw, Sliders,
  Eye, EyeOff, CheckCircle2, Lock, ArrowRight, HelpCircle, FileJson
} from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { adminApi, AuditLogDTO, CandidateWithUser } from '@/api/admin.api'
import { useAuth } from '@/components/auth/AuthContext'
import { useSEO } from '@/hooks/useSEO'

export default function AdminLogs() {
  useSEO({
    title: 'Admin Security Logs & Overrides - HireFlow',
    description: 'System audit logs, authorization scopes, and supervisor override panel.',
  })

  const { user } = useAuth()
  const [logs, setLogs] = useState<AuditLogDTO[]>([])
  const [candidates, setCandidates] = useState<CandidateWithUser[]>([])
  const [logsFilter, setLogsFilter] = useState('')
  const [activeTab, setActiveTab] = useState<'logs' | 'candidates'>('logs')
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedPayload, setSelectedPayload] = useState<any | null>(null)

  const fetchData = async (showRefreshToast = false) => {
    try {
      setIsRefreshing(true)
      const [logsData, candidatesData] = await Promise.all([
        adminApi.getAuditLogs(),
        adminApi.listCandidates()
      ])
      setLogs(logsData)
      setCandidates(candidatesData)
      if (showRefreshToast) {
        toast.success('Security console updated in real-time')
      }
    } catch (err: any) {
      toast.error('Failed to load supervisor data. Ensure admin status.')
      console.error(err)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleToggleVisibility = async (candidateId: string, currentOpen: boolean) => {
    try {
      toast.promise(adminApi.toggleCandidateVisibility(candidateId), {
        loading: 'Toggling visibility settings...',
        success: (data) => {
          // Update local state instantly
          setCandidates(prev => prev.map(c => {
            if (c.id === candidateId) {
              return { ...c, openToWork: !currentOpen }
            }
            return c
          }))
          // Re-fetch audit logs to show the new override entry
          adminApi.getAuditLogs().then(logsData => setLogs(logsData))
          return `Candidate status set to ${!currentOpen ? 'Visible (Open to Work)' : 'Hidden (Private)'}`
        },
        error: 'Failed to modify candidate settings.'
      })
    } catch (err) {
      console.error(err)
    }
  }

  const filteredLogs = logs.filter(log => {
    const query = logsFilter.toLowerCase()
    return (
      log.action.toLowerCase().includes(query) ||
      log.resourceType.toLowerCase().includes(query) ||
      (log.actor?.name && log.actor.name.toLowerCase().includes(query)) ||
      (log.actor?.email && log.actor.email.toLowerCase().includes(query))
    )
  })

  // Group stats
  const deniedAttempts = logs.filter(l => l.action.includes('denied') || l.action.includes('failure') || l.action.includes('unauthorized')).length
  const activeCandidates = candidates.length
  const openToWorkCandidates = candidates.filter(c => c.openToWork).length

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-2xl bg-surface border border-border p-6 shadow-sidebar">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-500/10 via-transparent to-rose-500/10 pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-brand-500/20 text-brand-400 rounded-lg">
                <Shield className="size-6 animate-pulse" />
              </div>
              <span className="text-xs font-semibold tracking-wider uppercase text-brand-400">Security Control</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/75 bg-clip-text text-transparent">
              Platform Supervisor Console
            </h1>
            <p className="text-sm text-muted-foreground">
              Review live tenant operations, access logs, and enforce administrative overrides.
            </p>
          </div>
          <Button
            onClick={() => fetchData(true)}
            variant="outline"
            className="flex items-center gap-2 shrink-0 border-border bg-surface-elevated text-foreground hover:bg-accent"
            disabled={isRefreshing}
          >
            <RefreshCw className={`size-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Syncing...' : 'Sync System Logs'}
          </Button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-surface-elevated/50 backdrop-blur-md border-border shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Operations</p>
              <h3 className="text-2xl font-bold text-foreground">{isLoading ? '...' : logs.length}</h3>
            </div>
            <div className="p-3 bg-brand-500/10 text-brand-400 rounded-xl">
              <Sliders className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface-elevated/50 backdrop-blur-md border-border shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Security Alerts</p>
              <h3 className="text-2xl font-bold text-rose-500">{isLoading ? '...' : deniedAttempts}</h3>
            </div>
            <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl">
              <ShieldAlert className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface-elevated/50 backdrop-blur-md border-border shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Candidates Registered</p>
              <h3 className="text-2xl font-bold text-foreground">{isLoading ? '...' : activeCandidates}</h3>
            </div>
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <Users className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface-elevated/50 backdrop-blur-md border-border shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Available Talents</p>
              <h3 className="text-2xl font-bold text-emerald-500">{isLoading ? '...' : openToWorkCandidates}</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Eye className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Navigation Tabs & Search Controls */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="bg-surface border-border">
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Supervisor Hub</CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-1">
              <Button
                onClick={() => setActiveTab('logs')}
                variant={activeTab === 'logs' ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2.5 font-medium"
              >
                <Sliders className="size-4" />
                Audit Logs
              </Button>
              <Button
                onClick={() => setActiveTab('candidates')}
                variant={activeTab === 'candidates' ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2.5 font-medium"
              >
                <Users className="size-4" />
                Visibility Control
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-surface border-border p-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Filters</h4>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search audit trail..."
                value={logsFilter}
                onChange={e => setLogsFilter(e.target.value)}
                className="pl-9 bg-surface-elevated border-border"
              />
            </div>
          </Card>
        </div>

        {/* Right Side: Log Feed / Candidate Override Lists */}
        <div className="lg:col-span-9">
          <AnimatePresence mode="wait">
            {activeTab === 'logs' ? (
              <motion.div
                key="logs-table"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <Card className="bg-surface border-border overflow-hidden">
                  <CardHeader className="border-b border-border">
                    <CardTitle className="text-lg">Security Compliance Trail</CardTitle>
                    <CardDescription>
                      Comprehensive record of authentication, access grants, and system events.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 overflow-x-auto">
                    {isLoading ? (
                      <div className="p-8 text-center space-y-3">
                        <RefreshCw className="size-8 text-brand-500 animate-spin mx-auto" />
                        <p className="text-sm text-muted-foreground">Loading audit records from security zone...</p>
                      </div>
                    ) : filteredLogs.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
                        No operations match search query parameters.
                      </div>
                    ) : (
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="bg-surface-elevated text-muted-foreground font-semibold border-b border-border">
                            <th className="p-4">Action</th>
                            <th className="p-4">Actor</th>
                            <th className="p-4">Resource</th>
                            <th className="p-4">IP Address</th>
                            <th className="p-4">Date</th>
                            <th className="p-4 text-right">Details</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {filteredLogs.map(log => {
                            const isFailure = log.action.includes('denied') || log.action.includes('failure');
                            return (
                              <tr key={log.id} className="hover:bg-accent/40 transition-colors">
                                <td className="p-4 font-mono text-xs">
                                  <div className="flex items-center gap-2">
                                    <span className={`size-1.5 rounded-full ${isFailure ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                                    <span className={isFailure ? 'text-rose-400 font-semibold' : 'text-foreground'}>
                                      {log.action}
                                    </span>
                                  </div>
                                </td>
                                <td className="p-4">
                                  {log.actor ? (
                                    <div className="flex items-center gap-2">
                                      <Avatar name={log.actor.name} size="xs" />
                                      <div className="min-w-0">
                                        <p className="font-medium text-foreground text-xs leading-none">{log.actor.name}</p>
                                        <p className="text-[10px] text-muted-foreground truncate max-w-[120px]">{log.actor.email}</p>
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-xs text-muted-foreground italic">Anonymous API</span>
                                  )}
                                </td>
                                <td className="p-4">
                                  <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider border-border/80 bg-accent/35">
                                    {log.resourceType}
                                  </Badge>
                                </td>
                                <td className="p-4 font-mono text-[10px] text-muted-foreground">{log.ipAddress || 'Internal'}</td>
                                <td className="p-4 text-[11px] text-muted-foreground whitespace-nowrap">
                                  {new Date(log.createdAt).toLocaleString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit'
                                  })}
                                </td>
                                <td className="p-4 text-right">
                                  {log.payload ? (
                                    <Button
                                      size="icon-sm"
                                      variant="ghost"
                                      onClick={() => setSelectedPayload(log)}
                                      title="Inspect payload payload"
                                      className="hover:bg-brand-500/10 hover:text-brand-400 border border-transparent hover:border-brand-500/20"
                                    >
                                      <FileJson className="size-3.5" />
                                    </Button>
                                  ) : (
                                    <span className="text-muted-foreground/45 text-xs select-none">-</span>
                                  )}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="candidates-table"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <Card className="bg-surface border-border overflow-hidden">
                  <CardHeader className="border-b border-border">
                    <CardTitle className="text-lg">Candidate Profile Control & Overrides</CardTitle>
                    <CardDescription>
                      Administrative toggles to adjust talent pool discovery flags and profile listings.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 overflow-x-auto">
                    {isLoading ? (
                      <div className="p-8 text-center space-y-3">
                        <RefreshCw className="size-8 text-brand-500 animate-spin mx-auto" />
                        <p className="text-sm text-muted-foreground">Loading profiles list...</p>
                      </div>
                    ) : candidates.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
                        No registered candidates found.
                      </div>
                    ) : (
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="bg-surface-elevated text-muted-foreground font-semibold border-b border-border">
                            <th className="p-4">Candidate</th>
                            <th className="p-4">Headline</th>
                            <th className="p-4">Location</th>
                            <th className="p-4">Skills</th>
                            <th className="p-4">Talent Pool status</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {candidates.map(candidate => (
                            <tr key={candidate.id} className="hover:bg-accent/40 transition-colors">
                              <td className="p-4">
                                <div className="flex items-center gap-2.5">
                                  <Avatar name={candidate.user.name} src={candidate.user.avatar || undefined} size="sm" />
                                  <div className="min-w-0">
                                    <p className="font-semibold text-foreground leading-snug">{candidate.user.name}</p>
                                    <p className="text-[11px] text-muted-foreground truncate">{candidate.user.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-xs font-medium text-foreground max-w-[150px] truncate">
                                {candidate.headline || <span className="text-muted-foreground/60 italic">No headline set</span>}
                              </td>
                              <td className="p-4 text-xs text-muted-foreground">{candidate.location || '-'}</td>
                              <td className="p-4">
                                <div className="flex flex-wrap gap-1 max-w-[200px]">
                                  {candidate.skills && candidate.skills.length > 0 ? (
                                    candidate.skills.slice(0, 3).map((skill, i) => (
                                      <Badge key={i} variant="secondary" className="text-[9px] px-1 py-0 border-border">
                                        {skill}
                                      </Badge>
                                    ))
                                  ) : (
                                    <span className="text-[10px] text-muted-foreground/50">-</span>
                                  )}
                                  {candidate.skills && candidate.skills.length > 3 && (
                                    <span className="text-[9px] text-muted-foreground">+{candidate.skills.length - 3}</span>
                                  )}
                                </div>
                              </td>
                              <td className="p-4">
                                <Badge
                                  variant={candidate.openToWork ? 'success' : 'secondary'}
                                  className="text-[10px] px-2 py-0.5"
                                >
                                  {candidate.openToWork ? 'Open to Work' : 'Hidden'}
                                </Badge>
                              </td>
                              <td className="p-4 text-right">
                                <Button
                                  onClick={() => handleToggleVisibility(candidate.id, candidate.openToWork)}
                                  variant="outline"
                                  size="sm"
                                  className={`gap-1.5 text-xs border-border bg-surface hover:bg-accent`}
                                >
                                  {candidate.openToWork ? (
                                    <>
                                      <EyeOff className="size-3.5 text-amber-500" />
                                      Hide Profile
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="size-3.5 text-emerald-500" />
                                      Make Public
                                    </>
                                  )}
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Audit Payload JSON Modal/Dialog Drawer */}
      <AnimatePresence>
        {selectedPayload && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-border bg-surface-elevated flex items-center justify-between">
                <div className="flex items-center gap-2 text-brand-400">
                  <FileJson className="size-5" />
                  <h3 className="font-semibold text-foreground text-sm">Security Event Payload</h3>
                </div>
                <Badge variant="outline" className="font-mono text-[10px] uppercase border-border/80 bg-accent/40">
                  {selectedPayload.action}
                </Badge>
              </div>
              <div className="p-5 space-y-4 max-h-[450px] overflow-y-auto font-mono text-xs">
                <div className="p-3 bg-surface-elevated rounded-lg border border-border/60 space-y-2">
                  <p className="text-muted-foreground"><span className="font-semibold text-foreground">Actor ID:</span> {selectedPayload.actorId || 'Anonymous API'}</p>
                  <p className="text-muted-foreground"><span className="font-semibold text-foreground">Resource Type:</span> {selectedPayload.resourceType}</p>
                  <p className="text-muted-foreground"><span className="font-semibold text-foreground">Resource ID:</span> {selectedPayload.resourceId || 'N/A'}</p>
                  <p className="text-muted-foreground"><span className="font-semibold text-foreground">User Agent:</span> {selectedPayload.userAgent || 'Unknown'}</p>
                </div>
                <div className="p-4 bg-surface-elevated/70 rounded-lg border border-border overflow-hidden">
                  <pre className="text-[11px] text-brand-300 leading-relaxed overflow-x-auto whitespace-pre-wrap select-text">
                    {JSON.stringify(selectedPayload.payload || {}, null, 2)}
                  </pre>
                </div>
              </div>
              <div className="p-3 border-t border-border bg-surface-elevated text-right">
                <Button
                  onClick={() => setSelectedPayload(null)}
                  variant="outline"
                  className="border-border text-foreground hover:bg-accent"
                >
                  Close Inspector
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
