import { useCallback, useState } from 'react'
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

/* ── Hoisted static elements (rendering-hoist-jsx) ── */

const googleIcon = (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
)

function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const login = useAuthStore((s) => s.login)
  const [isSignUp, setIsSignUp] = useState(false)
  const [formData, setFormData] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose()
    },
    [onClose],
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
        const { default: api } = await import('@/services/api')
        
        const { username, email, password } = formData
        let response
        if (isSignUp) {
          response = await api.register({
            username,
            email,
            password,
          })
        } else {
          response = await api.login({ email, password })
        }
        
        if (response.data.token) {
            await login(response.data.token)
            onClose()
        }
    } catch (err: any) {
        setError(err.response?.data?.message || 'Authentication failed')
    } finally {
        setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
        <motion.div
          className="signin-modal-overlay"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.2 }}
          onClick={handleOverlayClick}
        >
          <motion.div
            className="signin-modal-panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <button className="signin-modal-close" onClick={onClose}>&times;</button>

            <h2 className="signin-modal-title font-hand">
                {isSignUp ? 'Join the Studio' : 'Welcome Back'}
            </h2>
            
            <form onSubmit={handleSubmit} className="signin-modal-form">
              {isSignUp && (
                  <input
                    placeholder="Username"
                    className="signin-modal-input"
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})}
                    required
                  />
              )}
              <input
                placeholder="Email"
                type="email"
                className="signin-modal-input"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                required
              />
              <input
                placeholder="Password"
                type="password"
                className="signin-modal-input"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                required
              />

              {error && <p className="signin-modal-error">{error}</p>}

              <button type="submit" className="btn-gradient btn-signin" disabled={loading}>
                <span>{loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}</span>
              </button>
            </form>

            <div className="signin-divider">
                <span>OR</span>
            </div>

            <button
                type="button"
                className="btn-gradient btn-signin google-signin-btn"
                onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || '/api'}/auth/google`}
            >
                <span>{googleIcon} Sign in with Google</span>
            </button>

            <p className="signin-switch-mode">
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                <button onClick={() => setIsSignUp(!isSignUp)}>
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
            </p>
          </motion.div>
        </motion.div>
    </AnimatePresence>
  )
}

export default SignInModal
