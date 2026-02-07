import { useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Header from '@/components/Header/Header.tsx'
import { useTrackStore } from '@/store/trackStore.ts'

function MonthlyShowcasePage() {
  const navigate = useNavigate()
  const pastTracks = useTrackStore((s) => s.pastTracks)
  const currentTrack = useTrackStore((s) => s.currentTrack)
  const allTracks = [...(currentTrack ? [currentTrack] : []), ...pastTracks]
  const carouselRef = useRef<HTMLDivElement>(null)

  const scrollRight = useCallback(() => {
    carouselRef.current?.scrollBy({ left: 300, behavior: 'smooth' })
  }, [])

  const scrollLeft = useCallback(() => {
    carouselRef.current?.scrollBy({ left: -300, behavior: 'smooth' })
  }, [])

  return (
    <div className="page-frame story-page">
      <Header variant="story" />

      <div className="showcase-view">
        <div className="expanded-header">
          <button
            type="button"
            className="expanded-back font-hand"
            onClick={() => navigate(-1)}
          >
            &larr; Back
          </button>
          <h2 className="font-hand fs-xxl">Showcase Tracks</h2>
          <p className="expanded-week fs-xs">Your monthly collection</p>
        </div>

        <div className="showcase-carousel-wrapper">
          <button
            type="button"
            className="showcase-arrow showcase-arrow-left"
            onClick={scrollLeft}
            aria-label="Scroll left"
          >
            &larr;
          </button>

          <div className="showcase-carousel" ref={carouselRef}>
            {allTracks.map((track, i) => (
              <motion.div
                key={track.id}
                className="showcase-card"
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <Link to={`/tracks/${track.id}`} className="showcase-card-link">
                  <img
                    src={track.nodes[0]?.src ?? 'https://picsum.photos/seed/empty/420/300'}
                    alt={track.title}
                    className="showcase-card-image"
                    loading="lazy"
                    draggable={false}
                  />
                  <div className="showcase-card-info">
                    <span className="showcase-card-title font-hand fs-m">{track.title}</span>
                    <span className="showcase-card-week fs-xs">{track.weekLabel}</span>
                  </div>
                  {track.status === 'active' ? (
                    <span className="profile-track-badge fs-xs">Active</span>
                  ) : null}
                </Link>
              </motion.div>
            ))}
          </div>

          <button
            type="button"
            className="showcase-arrow showcase-arrow-right"
            onClick={scrollRight}
            aria-label="Scroll right"
          >
            &rarr;
          </button>
        </div>
      </div>
    </div>
  )
}

export default MonthlyShowcasePage
