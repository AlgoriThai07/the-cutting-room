import { create } from 'zustand'
import api from '@/services/api.ts'

export interface Friend {
  id: string
  _id?: string
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
  rejectFriendRequest: (userId: string) => Promise<boolean>
  fetchFriendRequests: () => Promise<void>
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>

  // Profile
  selectedProfile: any | null
  getUserProfile: (id: string) => Promise<void>
}

export const useSocialStore = create<SocialState>((set, get) => ({
  friends: [],
  friendRequests: [],
  notifications: [],
  unreadCount: 0,
  searchResults: null,
  selectedProfile: null,
  isLoading: false,
  error: null,

  searchUser: async (email: string) => {
    set({ isLoading: true, error: null, searchResults: null })
    try {
      const response = await api.searchUser(email)
      // Map response to Friend interface
      const user = {
        id: response.data._id,
        _id: response.data._id,
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

  fetchFriendRequests: async () => {
    try {
      const response = await api.getFriendRequests()
      // We only care about received requests for now
      set({ friendRequests: response.data.received })
    } catch (err) {
      console.error('Failed to fetch friend requests', err)
    }
  },

  fetchNotifications: async () => {
    try {
      // Pass unread_only=true to only get unread items
      const response = await api.getNotifications(true)
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
      // Refresh notifications, friends, and requests
      get().fetchNotifications()
      get().fetchFriends()
      get().fetchFriendRequests()
      return true
    } catch (err) {
      console.error(err)
      return false
    }
  },

  rejectFriendRequest: async (userId: string) => {
    try {
      await api.rejectFriendRequest(userId)
      get().fetchFriendRequests()
      get().fetchNotifications()
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
      set({
        notifications: [], // Clear notifications
        unreadCount: 0
      })
    } catch (err) {
      console.error(err)
    }
  },

  deleteNotification: async (id: string) => {
    try {
      await api.deleteNotification(id)
      set(state => ({
        notifications: state.notifications.filter(n => n._id !== id),
        unreadCount: state.notifications.find(n => n._id === id && !n.read)
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount
      }))
    } catch (err) {
      console.error(err)
    }
  },

  getUserProfile: async (id: string) => {
    set({ isLoading: true, error: null, selectedProfile: null })
    try {
      const response = await api.getUserById(id)
      set({ selectedProfile: response.data })
    } catch (err: any) {
      console.error(err)
      set({ error: err.response?.data?.message || 'Failed to fetch profile' })
    } finally {
      set({ isLoading: false })
    }
  }
}))
