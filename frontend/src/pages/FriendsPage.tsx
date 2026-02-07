import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Header from '@/components/Header/Header.tsx'
import { useSocialStore } from '@/store/socialStore.ts'

const wavyFooter = (
  <div className="wavy-footer wavy-footer-relative" aria-hidden="true">
    <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M0,80 C240,20 480,100 720,60 C960,20 1200,100 1440,50"
        stroke="#f5f5f0"
        strokeWidth="2"
        fill="none"
        opacity="0.6"
      />
      <path
        d="M0,100 C300,40 600,110 900,70 C1100,45 1300,90 1440,75"
        stroke="#7a7a7a"
        strokeWidth="2"
        fill="none"
        opacity="0.4"
      />
    </svg>
  </div>
)

function FriendsPage() {
  const [activeTab, setActiveTab] = useState<'my-friends' | 'find'>('my-friends')
  const [searchEmail, setSearchEmail] = useState('')
  const [requestSent, setRequestSent] = useState(false)

  const friends = useSocialStore((s) => s.friends)
  const fetchFriends = useSocialStore((s) => s.fetchFriends)
  const searchUser = useSocialStore((s) => s.searchUser)
  const searchResults = useSocialStore((s) => s.searchResults)
  const clearSearch = useSocialStore((s) => s.clearSearch)
  const sendFriendRequest = useSocialStore((s) => s.sendFriendRequest)
  const isLoading = useSocialStore((s) => s.isLoading)
  const error = useSocialStore((s) => s.error)

  const friendRequests = useSocialStore((s) => s.friendRequests)
  const fetchFriendRequests = useSocialStore((s) => s.fetchFriendRequests)
  const acceptFriendRequest = useSocialStore((s) => s.acceptFriendRequest)
  const rejectFriendRequest = useSocialStore((s) => s.rejectFriendRequest)

  useEffect(() => {
    fetchFriends()
    fetchFriendRequests()
  }, [fetchFriends, fetchFriendRequests])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchEmail.trim()) return
    await searchUser(searchEmail)
    setRequestSent(false)
  }

  const handleSendRequest = async () => {
    if (searchResults) {
      const success = await sendFriendRequest(searchResults._id || searchResults.id)
      if (success) {
        setRequestSent(true)
        // Refresh lists in case of auto-accept or just to be safe
        fetchFriends()
        fetchFriendRequests()
      }
    }
  }

  // Handle query params for auto-search
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const findEmail = searchParams.get('find')

    if (findEmail) {
      setActiveTab('find')
      setSearchEmail(findEmail)
      searchUser(findEmail)
      // Clean up URL
      window.history.replaceState({}, '', '/friends')
    }
  }, [searchUser])

  // Clear search results when switching tabs
  useEffect(() => {
    if (activeTab === 'my-friends') {
      clearSearch()
      setSearchEmail('')
      setRequestSent(false)
    }
  }, [activeTab, clearSearch])

  return (
    <div className="page-frame story-page">
      <Header variant="story" />

      <div className="friends-view">
        <div className="friends-header">
          <h2 className="font-hand fs-xxl">Friends</h2>
        </div>

        <div className="track-tabs">
          <button
            type="button"
            className={`track-tab font-hand fs-s ${activeTab === 'my-friends' ? 'track-tab-active' : ''}`}
            onClick={() => setActiveTab('my-friends')}
          >
            My Friends
          </button>
          <button
            type="button"
            className={`track-tab font-hand fs-s ${activeTab === 'find' ? 'track-tab-active' : ''}`}
            onClick={() => setActiveTab('find')}
          >
            Find Friends
          </button>
        </div>

        {activeTab === 'my-friends' ? (
          <div className="friends-grid">
            {friends.length === 0 ? (
              <p className="fs-base" style={{ color: 'var(--warm-white)', opacity: 0.7, textAlign: 'center', gridColumn: '1/-1', padding: '3rem 1rem' }}>
                You haven't added any friends yet.
              </p>
            ) : (
              friends.map((friend, i) => (
                <motion.div
                  key={friend.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                >
                  <Link to={`/profile/${friend._id || friend.id}`} className="friend-card">
                    <img
                      src={friend.avatar || `https://api.dicebear.com/7.x/shapes/svg?seed=${friend.username}`}
                      alt={friend.username}
                      className="friend-card-avatar"
                      width="80"
                      height="80"
                      loading="lazy"
                      draggable={false}
                    />
                    <span className="friend-card-name font-hand fs-s">{friend.username}</span>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        ) : (
          <div className="friends-find">
            <div className="friend-requests-section">
              {friendRequests.length > 0 && (
                <>
                  <h3 className="font-hand fs-m" style={{ color: 'var(--off-white)', marginBottom: '1rem' }}>Pending Requests</h3>
                  <div className="friend-requests-grid" style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                    {friendRequests.map((req: any) => (
                      <div key={req._id} className="friend-request-card" style={{
                        background: 'var(--charcoal-light)',
                        padding: '1rem',
                        borderRadius: '12px',
                        border: '1px solid var(--charcoal-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <img
                            src={req.avatar || `https://api.dicebear.com/7.x/shapes/svg?seed=${req.username}`}
                            alt={req.username}
                            style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <div>
                            <span className="font-hand fs-s" style={{ color: 'var(--off-white)', display: 'block' }}>{req.username}</span>
                            <span className="fs-xs" style={{ color: 'var(--mid-gray)' }}>{req.email}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => acceptFriendRequest(req._id)}
                            className="btn-gradient"
                            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', borderRadius: '6px' }}
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => rejectFriendRequest(req._id)}
                            style={{
                              background: 'none',
                              border: '1px solid var(--charcoal-border)',
                              color: 'var(--mid-gray-light)',
                              padding: '0.5rem',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                          >
                            Ignore
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ width: '100%', height: '1px', background: 'var(--charcoal-border)', margin: '2rem 0' }}></div>
                </>
              )}
            </div>

            <form onSubmit={handleSearch} className="search-form">
              <input
                type="email"
                placeholder="Enter friend's email address..."
                className="search-input fs-base"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
              />
              <button
                type="submit"
                className="btn-gradient btn-search"
                disabled={isLoading || !searchEmail}
              >
                {isLoading ? 'Searching...' : 'Search'}
              </button>
            </form>

            {error && (
              <p className="search-error fs-s" style={{ color: '#ff6b6b', textAlign: 'center', marginTop: '1rem' }}>
                {error}
              </p>
            )}

            {searchResults && (
              <motion.div
                className="search-result-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Link to={`/profile/${searchResults._id || searchResults.id}`} className="friend-card-link">
                  <img
                    src={searchResults.avatar || `https://api.dicebear.com/7.x/shapes/svg?seed=${searchResults.username}`}
                    alt={searchResults.username}
                    className="friend-card-avatar"
                  />
                  <div className="friend-info">
                    <span className="friend-name font-hand fs-m">{searchResults.username}</span>
                    <span className="friend-email fs-xs">{searchResults.email}</span>
                  </div>
                </Link>

                {requestSent ? (
                  <button className="btn-control btn-sent" disabled>
                    Request Sent
                  </button>
                ) : (
                  <button
                    className="btn-gradient btn-add"
                    onClick={handleSendRequest}
                    disabled={isLoading}
                  >
                    Add Friend
                  </button>
                )}
              </motion.div>
            )}
          </div>
        )}

        {wavyFooter}
      </div>
    </div >
  )
}

export default FriendsPage
