import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Header from '@/components/Header/Header.tsx'
import { MOCK_FRIENDS } from '@/data/mockUsers.ts'

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
            {MOCK_FRIENDS.map((friend, i) => (
              <motion.div
                key={friend.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
              >
                <Link to={`/profile/${friend.id}`} className="friend-card">
                  <img
                    src={friend.avatar}
                    alt={friend.displayName}
                    className="friend-card-avatar"
                    width="80"
                    height="80"
                    loading="lazy"
                    draggable={false}
                  />
                  <span className="friend-card-name font-hand fs-s">{friend.displayName}</span>
                  <span className="friend-card-bio fs-xs">{friend.bio}</span>
                  <span className="friend-card-tracks fs-xs">{friend.tracksCount} tracks</span>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="friends-find">
            <p className="fs-base" style={{ color: 'var(--warm-white)', opacity: 0.7, textAlign: 'center', padding: '3rem 1rem' }}>
              Friend discovery coming soon. For now, explore the Cutting Room to find interesting creators.
            </p>
            <div style={{ textAlign: 'center' }}>
              <Link to="/explore" className="btn-gradient btn-studio">
                <span>Explore the Cutting Room</span>
              </Link>
            </div>
          </div>
        )}

        {wavyFooter}
      </div>
    </div>
  )
}

export default FriendsPage
