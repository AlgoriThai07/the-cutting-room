import { create } from 'zustand'
import api from '@/services/api.ts'

export interface Friend {
  id: string
  username: string
  email: string
  avatar: string
}

export interface Notification {
  _id: string
  type: 'like' | 'friend_request' | 'friend_accepted'
  from_user_id: {
    _id: string
    username: string
    avatar: string
  }
  node_id?: {
    _id: string
    recap_sentence: string
  }
  read: boolean
  created_at: string
}

interface SocialState {
  friends: Friend[]
  friendRequests: any[] // simplify for now
  notifications: Notification[]
  unreadCount: number
  searchResults: Friend | null
  isLoading: boolean
  error: string | null

  searchUser: (email: string) => Promise<void>
  clearSearch: () => void
  fetchFriends: () => Promise<void>
  fetchNotifications: () => Promise<void>
  sendFriendRequest: (userId: string) => Promise<boolean>
  acceptFriendRequest: (userId: string) => Promise<boolean>
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
}

export const useSocialStore = create<SocialState>((set, get) => ({
  friends: [],
  friendRequests: [],
  notifications: [],
  unreadCount: 0,
  searchResults: null,
  isLoading: false,
  error: null,

  searchUser: async (email: string) => {
    set({ isLoading: true, error: null, searchResults: null })
    try {
      const response = await api.searchUser(email)
      // Map response to Friend interface
      const user = {
        id: response.data._id,
        username: response.data.username,
        email: response.data.email,
        avatar: response.data.avatar
      }
      set({ searchResults: user })
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'User not found' })
    } finally {
      set({ isLoading: false })
    }
  },

  clearSearch: () => set({ searchResults: null, error: null }),

  fetchFriends: async () => {
    set({ isLoading: true })
    try {
      const response = await api.getFriends()
      const friends = response.data.friends.map((f: any) => ({
        id: f._id,
        username: f.username,
        email: f.email,
        avatar: f.avatar
      }))
      set({ friends })
    } catch (err) {
      console.error('Failed to fetch friends', err)
    } finally {
      set({ isLoading: false })
    }
  },

  fetchNotifications: async () => {
    try {
      const response = await api.getNotifications()
      set({
        notifications: response.data.notifications,
        unreadCount: response.data.unread_count
      })
    } catch (err) {
      console.error('Failed to fetch notifications', err)
    }
  },

  sendFriendRequest: async (userId: string) => {
    set({ isLoading: true })
    try {
      await api.sendFriendRequest(userId)
      return true
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to send request' })
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  acceptFriendRequest: async (userId: string) => {
    try {
      await api.acceptFriendRequest(userId)
      // Refresh notifications and friends
      get().fetchNotifications()
      get().fetchFriends()
      return true
    } catch (err) {
      console.error(err)
      return false
    }
  },

  markRead: async (id: string) => {
    try {
      await api.markNotificationRead(id)
      // Optimistic update
      set(state => ({
        notifications: state.notifications.map(n =>
          n._id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }))
    } catch (err) {
      console.error(err)
    }
  },

  markAllRead: async () => {
    try {
      await api.markAllNotificationsRead()
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0
      }))
    } catch (err) {
      console.error(err)
    }
  }
}))
