import { create } from 'zustand'
import type { ApplicationDTO, ApplicationStatus } from '@hireflow/types'

interface PipelineStore {
  // Map of status key to array of application cards
  columns: Record<ApplicationStatus, ApplicationDTO[]>
  setColumns: (cols: Record<ApplicationStatus, ApplicationDTO[]>) => void

  // Optimistic stage transition update
  moveCardOptimistic: (
    applicationId: string,
    fromStatus: ApplicationStatus,
    toStatus: ApplicationStatus
  ) => void

  // Tracking dragging items
  draggingId: string | null
  setDraggingId: (id: string | null) => void
}

export const usePipelineStore = create<PipelineStore>()((set) => ({
  columns: {
    applied: [],
    screening: [],
    interview: [],
    offer: [],
    rejected: [],
    withdrawn: [],
  },
  setColumns: (columns) => set({ columns }),

  moveCardOptimistic: (applicationId, fromStatus, toStatus) =>
    set((s) => {
      const fromCol = [...(s.columns[fromStatus] || [])]
      const toCol = [...(s.columns[toStatus] || [])]

      const cardIndex = fromCol.findIndex((c) => c.id === applicationId)
      if (cardIndex === -1) return {} // Card not found

      const [card] = fromCol.splice(cardIndex, 1)
      const updatedCard = { ...card, status: toStatus }
      toCol.push(updatedCard)

      return {
        columns: {
          ...s.columns,
          [fromStatus]: fromCol,
          [toStatus]: toCol,
        },
      };
    }),

  draggingId: null,
  setDraggingId: (draggingId) => set({ draggingId }),
}))
