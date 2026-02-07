import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Header from '@/components/Header/Header.tsx'
import { useAuthStore } from '@/store/authStore.ts'
import { useTrackStore } from '@/store/trackStore.ts'

function ViewTrackPage() {
  const { trackId } = useParams<{ trackId: string }>()
  const navigate = useNavigate()
  const currentUser = useAuthStore((s) => s.user)
  const getTrackById = useTrackStore((s) => s.getTrackById)
  const track = trackId ? getTrackById(trackId) : undefined

  const [activeTab, setActiveTab] = useState<'visuals' | 'written'>('visuals')
  const [votes, setVotes] = useState({ up: track?.upvotes ?? 0, down: track?.downvotes ?? 0 })

  const handleUpvote = useCallback(() => {
    setVotes((v) => ({ ...v, up: v.up + 1 }))
  }, [])

  const handleDownvote = useCallback(() => {
    setVotes((v) => ({ ...v, down: v.down + 1 }))
  }, [])

  if (!track) {
    return (
      <div className="page-frame story-page">
        <Header variant="story" />
        <div className="expanded-empty">
          <h2 className="font-hand fs-xl">Track not found</h2>
          <button
            type="button"
            className="expanded-back font-hand"
            onClick={() => navigate(-1)}
          >
            &larr; Go back
          </button>
        </div>
      </div>
    )
  }

  const isOwnTrack = currentUser?.id === track.ownerId

  return (
    <div className="page-frame story-page">
      <Header variant="story" />

      <div className="view-track-view">
        <div className="expanded-header">
          <button
            type="button"
            className="expanded-back font-hand"
            onClick={() => navigate(-1)}
          >
            &larr; Back
          </button>
          <h2 className="font-hand fs-xl">{track.title}</h2>
          <p className="expanded-week fs-xs">{track.weekLabel} &middot; {track.ownerName}</p>
        </div>

        {/* Tab navigation */}
        <div className="track-tabs">
          <button
            type="button"
            className={`track-tab font-hand fs-s ${activeTab === 'visuals' ? 'track-tab-active' : ''}`}
            onClick={() => setActiveTab('visuals')}
          >
            Visuals
          </button>
          <button
            type="button"
            className={`track-tab font-hand fs-s ${activeTab === 'written' ? 'track-tab-active' : ''}`}
            onClick={() => setActiveTab('written')}
          >
            Written
          </button>
        </div>

        {/* Tab content */}
        <div className="track-tab-content">
          {activeTab === 'visuals' ? (
            <motion.div
              className="track-visuals-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {track.nodes.map((node, i) => (
                <motion.div
                  key={node.id}
                  className="track-visual-card"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <img
                    src={node.src}
                    alt={node.alt}
                    loading="lazy"
                    draggable={false}
                  />
                  <p className="caption fs-xs">{node.caption}</p>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="track-written"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <p className="track-pinned font-hand fs-s">{track.pinnedSentence}</p>
              <div className="track-narrative">
                {track.narrative.map((para, i) => (
                  <p key={i} className="fs-base">{para}</p>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Interaction bar */}
        <div className="interaction-bar">
          <button type="button" className="interaction-btn" onClick={handleUpvote}>
            <span className="interaction-icon">&uarr;</span>
            <span className="fs-xs">{votes.up}</span>
          </button>
          <button type="button" className="interaction-btn" onClick={handleDownvote}>
            <span className="interaction-icon">&darr;</span>
            <span className="fs-xs">{votes.down}</span>
          </button>
          <button type="button" className="interaction-btn">
            <span className="interaction-icon">&#x1F4AC;</span>
            <span className="fs-xs">{track.commentsCount}</span>
          </button>
          <button type="button" className="interaction-btn">
            <span className="interaction-icon">&#x1F517;</span>
            <span className="fs-xs">Share</span>
          </button>
          {isOwnTrack ? (
            <button type="button" className="interaction-btn interaction-edit">
              <span className="interaction-icon">&#x270F;</span>
              <span className="fs-xs">Edit</span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default ViewTrackPage
