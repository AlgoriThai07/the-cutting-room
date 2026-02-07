import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Header from '@/components/Header/Header.tsx'
import Marquee from '@/components/Marquee/Marquee.tsx'
import SignInModal from '@/components/SignInModal/SignInModal.tsx'
import { useAuthStore } from '@/store/authStore.ts'

/* ── Hoisted static elements (rendering-hoist-jsx) ── */

const scissorsIcon = (
  <div className="scissors-icon" aria-hidden="true">
    <svg
      width="48"
      height="48"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="18" cy="18" r="8" stroke="#f5f5f0" strokeWidth="2" fill="none" />
      <circle cx="18" cy="46" r="8" stroke="#f5f5f0" strokeWidth="2" fill="none" />
      <line x1="24" y1="14" x2="52" y2="40" stroke="#f5f5f0" strokeWidth="2" />
      <line x1="24" y1="50" x2="52" y2="24" stroke="#f5f5f0" strokeWidth="2" />
    </svg>
  </div>
)

const featureIcon = (
  <div className="feature-icon d-none d-md-block" aria-hidden="true">
    <svg
      width="64"
      height="80"
      viewBox="0 0 64 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="8" y="16" width="48" height="40" rx="4" stroke="#f5f5f0" strokeWidth="2" fill="none" />
      <rect x="16" y="24" width="10" height="10" rx="1" fill="#f5f5f0" opacity="0.6" />
      <rect x="30" y="24" width="10" height="10" rx="1" fill="#f5f5f0" opacity="0.6" />
      <rect x="23" y="38" width="10" height="10" rx="1" fill="#f5f5f0" opacity="0.6" />
      <rect x="4" y="56" width="56" height="4" rx="1" fill="#f5f5f0" opacity="0.3" />
      <rect x="8" y="62" width="48" height="4" rx="1" fill="#f5f5f0" opacity="0.2" />
      <rect x="12" y="68" width="40" height="4" rx="1" fill="#f5f5f0" opacity="0.15" />
    </svg>
  </div>
)

const wavyFooter = (
  <div className="wavy-footer" aria-hidden="true">
    <svg
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
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

const decorativeLines = (
  <div className="decorative-lines" aria-hidden="true">
    <span style={{ width: '100%' }} />
    <span style={{ width: '85%' }} />
    <span style={{ width: '92%' }} />
  </div>
)

/* ── Component ── */

function LandingPage() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [signInOpen, setSignInOpen] = useState(false)

  const closeSignIn = useCallback(() => setSignInOpen(false), [])

  const handleCtaClick = useCallback(() => {
    if (isAuthenticated) {
      navigate('/story')
    } else {
      setSignInOpen(true)
    }
  }, [isAuthenticated, navigate])

  return (
    <div className="page-frame landing-frame">
      <Header variant="landing" />
      <Marquee />

      {scissorsIcon}
      {featureIcon}

      <section className="hero-section">
        {decorativeLines}

        <motion.h1
          className="hero-title fs-xxxl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          The Cutting Room
        </motion.h1>

        <motion.div
          className="tagline-block"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
        >
          <p className="tagline-top fs-s">Impressionism &ndash; Realism</p>
          <p className="tagline-body fs-base">
            Where random moments strikes into
            <br />
            untold narrative masterpieces...
          </p>
        </motion.div>
      </section>

      <motion.div
        className="cta-wrapper"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' }}
      >
        <button
          type="button"
          className="btn-gradient btn-cta"
          onClick={handleCtaClick}
        >
          <span>Let your story begins here &rarr;</span>
        </button>
      </motion.div>

      {wavyFooter}

      <SignInModal isOpen={signInOpen} onClose={closeSignIn} />
    </div>
  )
}

export default LandingPage
