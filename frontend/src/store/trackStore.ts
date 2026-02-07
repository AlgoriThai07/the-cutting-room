import { create } from 'zustand'
import api from '@/services/api.ts'
import type { Track } from '@/types/index.ts'

interface TrackState {
  currentTrack: Track | null
  pastTracks: Track[]
  communityTracks: Track[]
  isLoading: boolean
  error: string | null

  fetchCurrentTrack: () => Promise<void>
  fetchTrackHistory: () => Promise<void>
  fetchCommunityTracks: () => Promise<void>
  getTracksByOwner: (ownerId: string) => Track[]
  concludeTrack: (id: string) => Promise<boolean>
  uploadItem: (formData: FormData) => Promise<boolean>
}

const transformTrack = (backendTrack: any): Track => {
  // Safe extraction of nodes
  const nodes = (backendTrack.nodes || backendTrack.node_ids || []).map((node: any) => ({
    id: node._id || node.id,
    src: node.user_item_id?.content_url || 'https://picsum.photos/seed/empty/200/200',
    alt: node.user_item_id?.caption || 'Story node',
    caption: node.user_item_id?.caption || '',
    date: node.created_at || new Date().toISOString(),
  }))

  return {
    id: backendTrack._id || backendTrack.id,
    ownerId: backendTrack.user_id?._id || backendTrack.user_id,
    ownerName: backendTrack.user_id?.username || 'Unknown',
    ownerAvatar: backendTrack.user_id?.avatar || '',
    title: `Week ${backendTrack.week_id?.split('-W')[1] || '??'}`,
    weekLabel: backendTrack.week_id || 'Current Week',
    status: backendTrack.concluded ? 'completed' : 'active',
    nodes,
    narrative: backendTrack.story ? [backendTrack.story] : [],
    pinnedSentence: backendTrack.story ? backendTrack.story.slice(0, 50) + '...' : '',
    upvotes: 0,
    downvotes: 0,
    commentsCount: 0,
    createdAt: backendTrack.created_at
  }
}

export const useTrackStore = create<TrackState>((set, get) => ({
  currentTrack: null,
  pastTracks: [],
  communityTracks: [],
  isLoading: false,
  error: null,

  fetchCurrentTrack: async () => {
    set({ isLoading: true })
    try {
      const response = await api.getCurrentTrack()
      if (response.data && response.data._id) {
        set({ currentTrack: transformTrack(response.data) })
      } else {
        set({ currentTrack: null })
      }
    } catch (err) {
      console.error('Failed to fetch current track', err)
      set({ error: 'Failed to load current track' })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchTrackHistory: async () => {
    set({ isLoading: true })
    try {
      const response = await api.getTrackHistory()
      // backend returns array of tracks
      const tracks = Array.isArray(response.data)
        ? response.data.map(transformTrack)
        : []
      set({ pastTracks: tracks })
    } catch (err) {
      console.error('Failed to fetch track history', err)
      set({ error: 'Failed to load history' })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchCommunityTracks: async () => {
    set({ isLoading: true })
    try {
      const response = await api.getCommunityTracks()
      const tracks = Array.isArray(response.data)
        ? response.data.map(transformTrack)
        : []
      set({ communityTracks: tracks })
    } catch (err) {
      console.error('Failed to fetch community tracks', err)
      // minimal error handling for explore
    } finally {
      set({ isLoading: false })
    }
  },

  getTracksByOwner: (ownerId: string) => {
    const state = get()
    // Combine current and past tracks
    const all = [
      ...(state.currentTrack ? [state.currentTrack] : []),
      ...state.pastTracks
    ]
    // Filter by ownerId (handling both string ID and potential object ID mismatch if any)
    return all.filter((t) => t.ownerId === ownerId || t.ownerId === ownerId)
  },

  concludeTrack: async (id: string) => {
    set({ isLoading: true })
    try {
      await api.concludeTrack(id)
      return true
    } catch (err) {
      console.error('Failed to conclude track', err)
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  uploadItem: async (formData: FormData) => {
    set({ isLoading: true })
    try {
      await api.createItem(formData)
      // Refresh the track to show the new node
      await get().fetchCurrentTrack()
      return true
    } catch (err) {
      console.error('Failed to upload item', err)
      return false
    } finally {
      set({ isLoading: false })
    }
  }
}))
