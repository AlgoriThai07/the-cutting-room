import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Header from '@/components/Header/Header.tsx'
import { useTrackStore } from '@/store/trackStore.ts'

function MyTracksPage() {
  const currentTrack = useTrackStore((s) => s.currentTrack)
  const pastTracks = useTrackStore((s) => s.pastTracks)
  const allTracks = [...(currentTrack ? [currentTrack] : []), ...pastTracks]

  return (
    <div className="page-frame story-page">
      <Header variant="story" />

      <div className="my-tracks-view">
        <div className="my-tracks-header">
          <h2 className="font-hand fs-xxl">My Tracks</h2>
          <p className="my-tracks-subtitle fs-s">
            {allTracks.length} track{allTracks.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="my-tracks-list">
          {allTracks.map((track, i) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <Link
                to={track.status === 'active' ? '/story' : `/tracks/${track.id}`}
                className="my-track-card"
              >
                <div className="my-track-card-images">
                  {track.nodes.slice(0, 3).map((node) => (
                    <img
                      key={node.id}
                      src={node.src}
                      alt={node.alt}
                      className="my-track-card-thumb"
                      loading="lazy"
                      draggable={false}
                    />
                  ))}
                  {track.nodes.length > 3 ? (
                    <div className="my-track-card-more fs-xs">
                      +{track.nodes.length - 3}
                    </div>
                  ) : null}
                </div>

                <div className="my-track-card-body">
                  <h3 className="my-track-card-title font-hand fs-m">{track.title}</h3>
                  <span className="my-track-card-week fs-xs">{track.weekLabel}</span>
                  <span className="my-track-card-count fs-xs">
                    {track.nodes.length}/10 pics
                  </span>
                </div>

                <div className="my-track-card-status">
                  {track.status === 'active' ? (
                    <span className="profile-track-badge fs-xs">Active</span>
                  ) : (
                    <span className="my-track-card-completed fs-xs">Completed</span>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {allTracks.length === 0 ? (
          <div className="expanded-empty">
            <h3 className="font-hand fs-l">No tracks yet</h3>
            <p className="fs-base" style={{ color: 'var(--warm-white)', opacity: 0.7, marginTop: '0.5rem' }}>
              Start your first track by uploading moments.
            </p>
            <Link to="/story" className="btn-gradient btn-cta" style={{ marginTop: '1.5rem' }}>
              <span>Create your first track &rarr;</span>
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default MyTracksPage
