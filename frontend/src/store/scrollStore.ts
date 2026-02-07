import { create } from 'zustand'

interface ScrollState {
  activeSectionIndex: number
  setActiveSectionIndex: (index: number) => void
  picsRemaining: number
  setPicsRemaining: (count: number) => void
}

export const useScrollStore = create<ScrollState>((set) => ({
  activeSectionIndex: 0,
  setActiveSectionIndex: (index) => set({ activeSectionIndex: index }),
  picsRemaining: 7,
  setPicsRemaining: (count) => set({ picsRemaining: count }),
}))
