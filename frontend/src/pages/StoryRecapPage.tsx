import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Header from '@/components/Header/Header.tsx'
import { useTrackStore } from '@/store/trackStore.ts'

/* ── Hoisted static elements ── */

const scissorsIcon = (
  <div className="recap-scissors" aria-hidden="true">
    <svg width="40" height="40" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="18" r="8" stroke="#f5f5f0" strokeWidth="2" fill="none" />
      <circle cx="18" cy="46" r="8" stroke="#f5f5f0" strokeWidth="2" fill="none" />
      <line x1="24" y1="14" x2="52" y2="40" stroke="#f5f5f0" strokeWidth="2" />
      <line x1="24" y1="50" x2="52" y2="24" stroke="#f5f5f0" strokeWidth="2" />
    </svg>
  </div>
)

const wavyDivider = (
  <div className="recap-wavy" aria-hidden="true">
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

function StoryRecapPage() {
  const navigate = useNavigate()
  const pastTracks = useTrackStore((s) => s.pastTracks)
  const track = pastTracks[0]

  return (
    <div className="page-frame recap-page">
      <Header variant="story" />

      <div className="recap-body">
        {/* Variant A: Left unfinished */}
        <motion.section
          className="recap-section recap-unfinished"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          {scissorsIcon}

          <h2 className="recap-title font-hand fs-xxl">
            Listening to what you left unfinished...
          </h2>

          <div className="recap-narrative">
            {track ? (
              track.narrative.map((para, i) => (
                <p key={i} className="fs-base">{para}</p>
              ))
            ) : (
              <>
                <p className="fs-base">
                  The frames you left behind this week carry a weight that finished work rarely does.
                  There is something honest about an incomplete sequence — it admits that the story is still happening,
                  still unfolding beyond the edges of what you chose to capture.
                </p>
                <p className="fs-base">
                  The cutting room does not demand closure. It holds your fragments and waits.
                  Sometimes the most powerful narrative is the one that stays open,
                  that refuses the comfort of a tidy ending.
                </p>
              </>
            )}
          </div>
        </motion.section>

        {/* Variant B: The Cutting Room recap */}
        <motion.section
          className="recap-section recap-polished"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
        >
          {scissorsIcon}

          <h2 className="recap-title font-hand fs-xxl">
            The Cutting Room
          </h2>
          <p className="recap-tagline font-hand fs-s">
            Impressionism &ndash; Realism
          </p>

          <div className="recap-narrative">
            <p className="fs-base">
              Where random moments strikes into untold narrative and personal experiences.
              Your week has been assembled, cut, and arranged into something that resembles meaning.
            </p>
            {track ? (
              <>
                <p className="fs-base recap-pinned">{track.pinnedSentence}</p>
                {track.narrative.map((para, i) => (
                  <p key={i} className="fs-base">{para}</p>
                ))}
              </>
            ) : (
              <p className="fs-base">
                No completed tracks yet. Begin your journey by uploading moments to your current track.
              </p>
            )}
          </div>
        </motion.section>
      </div>

      {wavyDivider}

      <div className="recap-actions">
        <button
          type="button"
          className="btn-gradient btn-upload"
          onClick={() => navigate('/explore')}
        >
          <span>Explore the Cutting Room &rarr;</span>
        </button>
        <button
          type="button"
          className="expanded-back font-hand"
          onClick={() => navigate('/story')}
        >
          &larr; Back to your track
        </button>
      </div>
    </div>
  )
}

export default StoryRecapPage
