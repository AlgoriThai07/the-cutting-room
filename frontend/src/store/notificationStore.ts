import { create } from 'zustand'
import api from '../services/api'

interface Notification {
    _id: string
    type: 'like' | 'friend_request' | 'friend_accepted'
    from_user_id: {
        _id: string
        username: string
        avatar?: string
    }
    node_id?: {
        _id: string
        recap_sentence?: string
    }
    read: boolean
    created_at: string
}

interface NotificationState {
    notifications: Notification[]
    unreadCount: number
    isLoading: boolean
    error: string | null
    pollingInterval: number | null

    fetchNotifications: () => Promise<void>
    markAsRead: (id: string) => Promise<void>
    markAllAsRead: () => Promise<void>
    startPolling: () => void
    stopPolling: () => void
}

const POLL_INTERVAL_MS = 30000 // 30 seconds

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
    pollingInterval: null,

    fetchNotifications: async () => {
        try {
            set({ isLoading: true, error: null })
            const response = await api.get('/notifications')
            set({
                notifications: response.data.notifications,
                unreadCount: response.data.unread_count,
                isLoading: false
            })
        } catch (error) {
            console.error('Failed to fetch notifications:', error)
            set({ error: 'Failed to fetch notifications', isLoading: false })
        }
    },

    markAsRead: async (id: string) => {
        try {
            await api.put(`/notifications/${id}/read`)
            set(state => ({
                notifications: state.notifications.map(n =>
                    n._id === id ? { ...n, read: true } : n
                ),
                unreadCount: Math.max(0, state.unreadCount - 1)
            }))
        } catch (error) {
            console.error('Failed to mark notification as read:', error)
        }
    },

    markAllAsRead: async () => {
        try {
            await api.put('/notifications/read-all')
            set(state => ({
                notifications: state.notifications.map(n => ({ ...n, read: true })),
                unreadCount: 0
            }))
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error)
        }
    },

    startPolling: () => {
        const { pollingInterval, fetchNotifications } = get()

        // Don't start if already polling
        if (pollingInterval) return

        // Fetch immediately
        fetchNotifications()

        // Then poll every 30 seconds
        const interval = window.setInterval(() => {
            const token = localStorage.getItem('cutting-room:token')
            if (token) {
                fetchNotifications()
            }
        }, POLL_INTERVAL_MS)

        set({ pollingInterval: interval })
    },

    stopPolling: () => {
        const { pollingInterval } = get()
        if (pollingInterval) {
            clearInterval(pollingInterval)
            set({ pollingInterval: null })
        }
    }
}))
