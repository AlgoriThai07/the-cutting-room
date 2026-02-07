import { useRef, useEffect, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Header from '@/components/Header/Header.tsx'
import UploadModal from '@/components/UploadModal/UploadModal.tsx'
import { useTrackStore } from '@/store/trackStore.ts'

function StoryPage() {
  const parallaxContainerRef = useRef<HTMLDivElement>(null)
  const parallaxLeftRef = useRef<HTMLDivElement>(null)
  const parallaxRightRef = useRef<HTMLDivElement>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const openModal = useCallback(() => setModalOpen(true), [])
  const closeModal = useCallback(() => setModalOpen(false), [])

  // Measure header height and expose as CSS variable for sticky right panel
  useEffect(() => {
    const header = document.querySelector('.story-header') as HTMLElement | null
    if (!header) return

    const observer = new ResizeObserver(([entry]) => {
      const height =
        entry.borderBoxSize?.[0]?.blockSize ??
        entry.target.getBoundingClientRect().height
      document.documentElement.style.setProperty(
        '--story-header-h',
        `${height}px`,
      )
    })

    observer.observe(header)
    return () => observer.disconnect()
  }, [])

  // Parallax scroll handler for the two sub-columns in the left panel
  const handleParallax = useCallback(() => {
    if (window.innerWidth < 768) return

    const leftCol = parallaxLeftRef.current
    const rightCol = parallaxRightRef.current
    const container = parallaxContainerRef.current
    if (!leftCol || !rightCol || !container) return

    const leftHeight = leftCol.offsetHeight
    const rightHeight = rightCol.offsetHeight
    const travel = leftHeight - rightHeight

    if (travel <= 0) return

    const containerRect = container.getBoundingClientRect()
    const topOfColumns = containerRect.top + window.scrollY
    const columnsScrollRange = containerRect.height - window.innerHeight

    if (columnsScrollRange <= 0) return

    const scrollInterval = columnsScrollRange / travel
    const scrollTop = window.scrollY

    // Before parallax zone — reset to origin
    if (scrollTop < topOfColumns) {
      rightCol.style.transform = 'translate3d(0px, 0px, 0px)'
      return
    }

    // Calculate offset and clamp to [0, travel] — no overshoot, no feedback loop
    const offset = Math.round((scrollTop - topOfColumns) / scrollInterval)
    const clampedOffset = Math.max(0, Math.min(offset, travel))
    rightCol.style.transform = `translate3d(0px, ${clampedOffset}px, 0px)`
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleParallax, { passive: true })
    window.addEventListener('resize', handleParallax, { passive: true })

    handleParallax()

    return () => {
      window.removeEventListener('scroll', handleParallax)
      window.removeEventListener('resize', handleParallax)
    }
  }, [handleParallax])

  // New logic for controls
  const navigate = useNavigate()
  const currentTrack = useTrackStore((s) => s.currentTrack)
  const concludeTrack = useTrackStore((s) => s.concludeTrack)
  const fetchCurrentTrack = useTrackStore((s) => s.fetchCurrentTrack)

  // Ensure we have the track loaded
  useEffect(() => {
    fetchCurrentTrack()
  }, [fetchCurrentTrack])

  const picsRemaining = 10 - (currentTrack?.nodes?.length || 0)

  const handleEndStory = async () => {
    if (currentTrack?.id) {
      // Optimistically navigate or show loading?
      // For now, just call API and go to recap
      const success = await concludeTrack(currentTrack.id)
      if (success) {
        navigate('/story/recap')
      }
    }
  }

  // Disable "End Story" if not enough nodes? logic wasn't specified but typically 10 is the goal
  // Disable "New Node" if 0 remaining?
  const canAddNode = picsRemaining > 0

  return (
    <div className="page-frame story-page">
      <Header variant="story" />

      {/* Top Controls Bar */}
      <div className="story-controls">
        <div className="controls-left">
          <button className="btn-control" onClick={handleEndStory}>
            End Story
          </button>
          <button
            className="btn-control"
            onClick={openModal}
            disabled={!canAddNode}
            style={{ opacity: canAddNode ? 1 : 0.5, cursor: canAddNode ? 'pointer' : 'not-allowed' }}
          >
            New Node
          </button>
        </div>
        <div className="controls-right">
          <span className="node-counter font-hand">
            {picsRemaining} Remaining
          </span>
        </div>
      </div>

      <div className="story-body">
        {/* Left panel: two-column parallax collage */}
        <div className="story-left-panel">
          <h2 className="font-hand fs-xl collage-title">Your collage</h2>

          {!currentTrack || !currentTrack.nodes || currentTrack.nodes.length === 0 ? (
            <div className="empty-story-message">
              Create your story now
            </div>
          ) : (
            <div className="row parallax-section" ref={parallaxContainerRef}>
              {/* Left sub-column (Even indices) */}
              <div className="col-6" ref={parallaxLeftRef}>
                {currentTrack.nodes.filter((_, i) => i % 2 === 0).map((node, i) => (
                  <motion.div
                    key={node.id || i}
                    className="collage-card"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                  >
                    <img
                      src={node.src}
                      alt={node.caption || 'Story node'}
                      loading="lazy"
                      draggable={false}
                    />
                    <p className="caption fs-xs">{node.caption}</p>
                  </motion.div>
                ))}
              </div>

              {/* Right sub-column (Odd indices) */}
              <div className="col-6" ref={parallaxRightRef}>
                {currentTrack.nodes.filter((_, i) => i % 2 !== 0).map((node, i) => (
                  <motion.div
                    key={node.id || i}
                    className="collage-card"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                  >
                    <img
                      src={node.src}
                      alt={node.caption || 'Story node'}
                      loading="lazy"
                      draggable={false}
                    />
                    <p className="caption fs-xs">{node.caption}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right panel: independently scrolling storyline */}
        <div className="story-right-panel">
          <div className="storyline-column">
            <h2 className="storyline-header fs-xl">
              This week&apos;s storyline:
            </h2>

            {/* <p className="pinned-sentence fs-s">
              {currentTrack?.pinnedSentence || '...'}
            </p> */}

            <div className="narrative-body">
              {currentTrack?.narrative?.map((text, i) => (
                <p key={i} className="fs-base">
                  {text}
                </p>
              ))}
              {/* Blinking dots if story is incomplete (assuming < 10 nodes means incomplete) */}
              {picsRemaining > 0 && (
                <span className="blinking-dots fs-xl"> . . . </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Right Floating Upload Button */}
      {/* Bottom Right Floating Upload Button - Removed as per request */}
      {/* 
      <button
        type="button"
        className="btn-gradient btn-fab-upload"
        onClick={openModal}
        aria-label="Upload New"
      >
        <span>+</span>
      </button> 
      */}

      <UploadModal isOpen={modalOpen} onClose={closeModal} />
    </div>
  )
}

export default StoryPage
