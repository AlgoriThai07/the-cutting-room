import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/authStore.ts'

interface SignInModalProps {
  isOpen: boolean
  onClose: () => void
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
} as const

const panelVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1 },
} as const

function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose()
    },
    [onClose],
  )

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!username.trim()) {
        setError('Username is required')
        return
      }
      login(username.trim(), password)
      setUsername('')
      setPassword('')
      setError('')
      onClose()
      navigate('/story')
    },
    [username, password, login, onClose, navigate],
  )

  const handleClose = useCallback(() => {
    setUsername('')
    setPassword('')
    setError('')
    onClose()
  }, [onClose])

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="signin-modal-overlay"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.2 }}
          onClick={handleOverlayClick}
          aria-modal="true"
          role="dialog"
          aria-label="Sign in"
        >
          <motion.div
            className="signin-modal-panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              className="signin-modal-close"
              onClick={handleClose}
              aria-label="Close"
            >
              &times;
            </button>

            <h2 className="signin-modal-title font-hand">Welcome!</h2>
            <p className="signin-modal-subtitle">
              Gain Access to Your Personalized Visual Narrative
            </p>

            <form onSubmit={handleSubmit} className="signin-modal-form">
              <div className="signin-modal-field">
                <label className="signin-modal-label font-hand" htmlFor="signin-username">
                  Username:
                </label>
                <input
                  id="signin-username"
                  type="text"
                  className="signin-modal-input font-body"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>

              <div className="signin-modal-field">
                <label className="signin-modal-label font-hand" htmlFor="signin-password">
                  Password:
                </label>
                <input
                  id="signin-password"
                  type="password"
                  className="signin-modal-input font-body"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>

              {error ? <p className="signin-modal-error">{error}</p> : null}

              <button type="submit" className="btn-gradient btn-signin signin-modal-submit">
                <span>Sign In</span>
              </button>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export default SignInModal
