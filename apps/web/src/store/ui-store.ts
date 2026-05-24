import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIStore {
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (v: boolean) => void
  theme: 'dark' | 'light'
  toggleTheme: () => void
  commandMenuOpen: boolean
  setCommandMenuOpen: (v: boolean) => void
  copilotOpen: boolean
  setCopilotOpen: (v: boolean) => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      theme: 'dark',
      toggleTheme: () =>
        set((s) => {
          const next = s.theme === 'dark' ? 'light' : 'dark'
          document.documentElement.classList.toggle('dark', next === 'dark')
          return { theme: next }
        }),
      commandMenuOpen: false,
      setCommandMenuOpen: (v) => set({ commandMenuOpen: v }),
      copilotOpen: false,
      setCopilotOpen: (v) => set({ copilotOpen: v }),
    }),
    {
      name: 'hireflow-ui',
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed, theme: s.theme }),
    }
  )
)
