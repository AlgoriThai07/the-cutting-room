import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Header from '@/components/Header/Header.tsx'
import { useAuthStore } from '@/store/authStore.ts'
import { useTrackStore } from '@/store/trackStore.ts'
import { useSocialStore } from '@/store/socialStore.ts'

function ProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const currentUser = useAuthStore((s) => s.user)
  const getTracksByOwner = useTrackStore((s) => s.getTracksByOwner)
  const fetchTrackHistory = useTrackStore((s) => s.fetchTrackHistory)
  const getUserProfile = useSocialStore((s) => s.getUserProfile)
  const selectedProfile = useSocialStore((s) => s.selectedProfile)
  const isLoading = useSocialStore((s) => s.isLoading)

  const isOwnProfile = !userId || userId === currentUser?.id

  useEffect(() => {
    if (isOwnProfile && currentUser) {
      fetchTrackHistory()
    } else if (userId) {
      // Fetch user profile if not own profile
      getUserProfile(userId)
    }
  }, [isOwnProfile, currentUser, userId, fetchTrackHistory, getUserProfile])

  const profileUser = isOwnProfile ? currentUser : selectedProfile

  if (isLoading && !isOwnProfile) {
    return (
      <div className="page-frame story-page">
        <Header variant="story" />
        <div className="expanded-empty">
          <h2 className="font-hand fs-xl">Loading...</h2>
        </div>
      </div>
    )
  }

  if (!profileUser) {
    return (
      <div className="page-frame story-page">
        <Header variant="story" />
        <div className="expanded-empty">
          <h2 className="font-hand fs-xl">User not found</h2>
        </div>
      </div>
    )
  }

  // If viewing another user, we need to fetch their tracks.
  // Currently getTracksByOwner relies on tracks being in the store.
  // We might need to fetch tracks for this specific user if not already loaded.
  // For now, let's assume getTracksByOwner filters from loaded tracks, 
  // but we should probably add a fetchUserTracks action if not exists.
  // However, the current getTracksByOwner filters from `tracks` array which is populated by `getCommunityTracks`.
  // If the user's tracks are not in community tracks, they won't show up.
  // Let's settle for displaying what we have for now, or use `selectedProfile.tracks` if backend returns it (it doesn't yet).

  const userTracks = getTracksByOwner(profileUser.id || profileUser._id)

  return (
    <div className="page-frame story-page">
      <Header variant="story" />

      <div className="profile-view">
        <motion.div
          className="profile-header-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <img
            src={profileUser.avatar || `https://api.dicebear.com/7.x/shapes/svg?seed=${profileUser.username}`}
            alt={profileUser.displayName || profileUser.username}
            className="profile-avatar"
            width="96"
            height="96"
            draggable={false}
          />

          <div className="profile-info">
            <h2 className="font-hand fs-xxl">{profileUser.displayName || profileUser.username}</h2>
            <p className="profile-bio fs-base">{profileUser.bio || ''}</p>

            <div className="profile-stats">
              <div className="profile-stat">
                <span className="profile-stat-value font-hand fs-l">
                  {profileUser.tracksCount || 0}
                </span>
                <span className="profile-stat-label fs-xs">Tracks</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-value font-hand fs-l">
                  {profileUser.friends?.length || profileUser.friendsCount || 0}
                </span>
                <span className="profile-stat-label fs-xs">Friends</span>
              </div>
            </div>
          </div>
        </motion.div>

        {isOwnProfile ? (
          <div className="profile-actions">
            <Link to="/tracks/monthly" className="btn-gradient btn-studio">
              <span>Monthly Showcase</span>
            </Link>
          </div>
        ) : null}

        <div className="profile-tracks-section">
          <h3 className="font-hand fs-l profile-tracks-heading">
            {isOwnProfile ? 'Your Tracks' : `${profileUser.displayName || profileUser.username}\u2019s Tracks`}
          </h3>

          <div className="profile-tracks-grid">
            {userTracks.length > 0 ? (
              userTracks.map((track, i) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                >
                  <Link to={`/tracks/${track.id}`} className="profile-track-card">
                    <img
                      src={track.nodes[0]?.src ?? 'https://picsum.photos/seed/empty/200/200'}
                      alt={track.title}
                      className="profile-track-thumb"
                      loading="lazy"
                      draggable={false}
                    />
                    <div className="profile-track-info">
                      <span className="profile-track-title font-hand fs-s">{track.title}</span>
                      <span className="profile-track-week fs-xs">{track.weekLabel}</span>
                    </div>
                    {track.status === 'active' ? (
                      <span className="profile-track-badge fs-xs">Active</span>
                    ) : null}
                  </Link>
                </motion.div>
              ))
            ) : (
              <p className="profile-no-tracks fs-base">No tracks (that are public) yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
