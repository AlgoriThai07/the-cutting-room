import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage.tsx'
import StoryPage from './pages/StoryPage.tsx'
import ExpandedStoryView from './pages/ExpandedStoryView.tsx'
import StoryRecapPage from './pages/StoryRecapPage.tsx'
import FinishTrackPage from './pages/FinishTrackPage.tsx'
import MyTracksPage from './pages/MyTracksPage.tsx'
import MonthlyShowcasePage from './pages/MonthlyShowcasePage.tsx'
import ViewTrackPage from './pages/ViewTrackPage.tsx'
import ExplorePage from './pages/ExplorePage.tsx'
import ProfilePage from './pages/ProfilePage.tsx'
import FriendsPage from './pages/FriendsPage.tsx'
import AuthGuard from './components/AuthGuard/AuthGuard.tsx'
import DailyUpdateToast from './components/DailyUpdateToast/DailyUpdateToast.tsx'
import { useAuthStore } from './store/authStore.ts'
import { useNotificationStore } from './store/notificationStore.ts'

import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const login = useAuthStore((s) => s.login)
  const [searchParams, setSearchParams] = useSearchParams()

  const startPolling = useNotificationStore((s) => s.startPolling)
  const stopPolling = useNotificationStore((s) => s.stopPolling)

  useEffect(() => {
    // 1. Check URL for token (OAuth redirect)
    const urlToken = searchParams.get('token')
    if (urlToken) {
      login(urlToken)
      setSearchParams({})
      return
    }

    // 2. Check LocalStorage for existing session
    const storedToken = localStorage.getItem('cutting-room:token')
    if (storedToken && !isAuthenticated) {
      // We have a token but state thinks we're logged out. Re-verify.
      // We can just call fetchUser directly to validate token
      useAuthStore.getState().fetchUser()
    }
  }, [searchParams, login, setSearchParams, isAuthenticated])

  // Start/stop notification polling based on auth state
  useEffect(() => {
    if (isAuthenticated) {
      startPolling()
    } else {
      stopPolling()
    }
    return () => stopPolling()
  }, [isAuthenticated, startPolling, stopPolling])

  return (
    <>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />

        {/* Authenticated */}
        <Route path="/story" element={<AuthGuard><StoryPage /></AuthGuard>} />
        <Route path="/story/recap" element={<AuthGuard><StoryRecapPage /></AuthGuard>} />
        <Route path="/story/:trackId" element={<AuthGuard><ExpandedStoryView /></AuthGuard>} />
        <Route path="/finish-track" element={<AuthGuard><FinishTrackPage /></AuthGuard>} />
        <Route path="/tracks" element={<AuthGuard><MyTracksPage /></AuthGuard>} />
        <Route path="/tracks/monthly" element={<AuthGuard><MonthlyShowcasePage /></AuthGuard>} />
        <Route path="/tracks/:trackId" element={<AuthGuard><ViewTrackPage /></AuthGuard>} />
        <Route path="/explore" element={<AuthGuard><ExplorePage /></AuthGuard>} />
        <Route path="/profile" element={<AuthGuard><ProfilePage /></AuthGuard>} />
        <Route path="/profile/:userId" element={<AuthGuard><ProfilePage /></AuthGuard>} />
        <Route path="/friends" element={<AuthGuard><FriendsPage /></AuthGuard>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <DailyUpdateToast show={isAuthenticated} />
    </>
  )
}

export default App
