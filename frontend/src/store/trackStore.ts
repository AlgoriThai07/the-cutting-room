import { create } from 'zustand'
import type { Track } from '@/types/index.ts'
import { MOCK_TRACKS } from '@/data/mockTracks.ts'

interface TrackState {
  currentTrack: Track | null
  pastTracks: Track[]
  communityTracks: Track[]
  getTrackById: (id: string) => Track | undefined
  getTracksByOwner: (ownerId: string) => Track[]
}

const selfTracks = MOCK_TRACKS.filter((t) => t.ownerId === 'user-self')
const otherTracks = MOCK_TRACKS.filter((t) => t.ownerId !== 'user-self')

export const useTrackStore = create<TrackState>((_set, get) => ({
  currentTrack: selfTracks.find((t) => t.status === 'active') ?? null,
  pastTracks: selfTracks.filter((t) => t.status === 'completed'),
  communityTracks: otherTracks,

  getTrackById: (id: string) => {
    const state = get()
    if (state.currentTrack?.id === id) return state.currentTrack
    return (
      state.pastTracks.find((t) => t.id === id) ??
      state.communityTracks.find((t) => t.id === id)
    )
  },

  getTracksByOwner: (ownerId: string) => {
    const state = get()
    const all = [
      ...(state.currentTrack ? [state.currentTrack] : []),
      ...state.pastTracks,
      ...state.communityTracks,
    ]
    return all.filter((t) => t.ownerId === ownerId)
  },
}))
