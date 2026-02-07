import { create } from 'zustand'
import type { User } from '@/types/index.ts'

const STORAGE_KEY = 'cutting-room:auth:v1'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (username: string, password: string) => boolean
  logout: () => void
}

function loadPersistedUser(): User | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function persistUser(user: User | null) {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // localStorage unavailable
  }
}

const initialUser = loadPersistedUser()

export const useAuthStore = create<AuthState>((set) => ({
  user: initialUser,
  isAuthenticated: initialUser !== null,

  login: (username: string, _password: string) => {
    const mockUser: User = {
      id: 'user-self',
      username,
      displayName: username.charAt(0).toUpperCase() + username.slice(1),
      avatar: `https://picsum.photos/seed/${username}/200/200`,
      bio: 'Visual storyteller. Collecting moments one frame at a time.',
      tracksCount: 4,
      friendsCount: 12,
    }
    persistUser(mockUser)
    set({ user: mockUser, isAuthenticated: true })
    return true
  },

  logout: () => {
    persistUser(null)
    set({ user: null, isAuthenticated: false })
  },
}))
