import { useRef, useEffect, useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import Header from '@/components/Header/Header.tsx'
import UploadModal from '@/components/UploadModal/UploadModal.tsx'
import { COLLAGE_LEFT_ITEMS, COLLAGE_RIGHT_ITEMS, STORYLINE_CONTENT } from '@/data/storyContent.ts'
import { useScrollStore } from '@/store/scrollStore.ts'

function StoryPage() {
  const parallaxContainerRef = useRef<HTMLDivElement>(null)
  const parallaxLeftRef = useRef<HTMLDivElement>(null)
  const parallaxRightRef = useRef<HTMLDivElement>(null)
  const picsRemaining = useScrollStore((s) => s.picsRemaining)
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

  return (
    <div className="page-frame story-page">
      <Header variant="story" />

      <div className="story-body">
        {/* Left panel: two-column parallax collage */}
        <div className="story-left-panel">
          <h2 className="font-hand fs-xl collage-title">Your collage</h2>

          <div className="row parallax-section" ref={parallaxContainerRef}>
            {/* Left sub-column (taller) */}
            <div className="col-6" ref={parallaxLeftRef}>
              {COLLAGE_LEFT_ITEMS.map((item, i) => (
                <motion.div
                  key={item.id}
                  className="collage-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                >
                  {item.type === 'image' ? (
                    <>
                      <img
                        src={item.src}
                        alt={item.alt}
                        loading="lazy"
                        draggable={false}
                      />
                      <p className="caption fs-xs">{item.caption}</p>
                    </>
                  ) : (
                    <div className="empty-slot">
                      <span className="fs-l">???</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Right sub-column (shorter, parallax-translated) */}
            <div className="col-6" ref={parallaxRightRef}>
              {COLLAGE_RIGHT_ITEMS.map((item, i) => (
                <motion.div
                  key={item.id}
                  className="collage-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                >
                  {item.type === 'image' ? (
                    <>
                      <img
                        src={item.src}
                        alt={item.alt}
                        loading="lazy"
                        draggable={false}
                      />
                      <p className="caption fs-xs">{item.caption}</p>
                    </>
                  ) : (
                    <div className="empty-slot">
                      <span className="fs-l">???</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel: independently scrolling storyline */}
        <div className="story-right-panel">
          <div className="storyline-column">
            <h2 className="storyline-header fs-xl">
              This week&apos;s storyline:
            </h2>

            <p className="pinned-sentence fs-s">
              {STORYLINE_CONTENT.pinnedSentence}
            </p>

            <div className="narrative-body">
              {STORYLINE_CONTENT.paragraphs.map((text, i) => (
                <p key={i} className="fs-base">
                  {text}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Upload action button */}
      <div className="upload-section">
        <button
          type="button"
          className="btn-gradient btn-upload"
          onClick={openModal}
        >
          <span>{picsRemaining}/10 pics remain &middot; Upload new</span>
        </button>
      </div>

      <UploadModal isOpen={modalOpen} onClose={closeModal} />
    </div>
  )
}

export default StoryPage
