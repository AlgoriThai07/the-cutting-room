import { useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/authStore.ts'

interface SidebarMenuProps {
  isOpen: boolean
  onClose: () => void
}

const PUBLIC_LINKS = [
  { label: 'Home', to: '/' },
] as const

const AUTH_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'New Track', to: '/story' },
  { label: 'Explore', to: '/explore' },
  { label: 'My Tracks', to: '/tracks' },
  { label: 'Friends', to: '/friends' },
  { label: 'Profile', to: '/profile' },
] as const

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
} as const

const panelVariants = {
  hidden: { x: '-100%' },
  visible: { x: 0 },
} as const

function SidebarMenu({ isOpen, onClose }: SidebarMenuProps) {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const logout = useAuthStore((s) => s.logout)

  const links = isAuthenticated ? AUTH_LINKS : PUBLIC_LINKS

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose()
    },
    [onClose],
  )

  const handleSignOut = useCallback(() => {
    logout()
    onClose()
    navigate('/')
  }, [logout, onClose, navigate])

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="sidebar-overlay"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.2 }}
          onClick={handleOverlayClick}
          aria-modal="true"
          role="dialog"
          aria-label="Navigation menu"
        >
          <motion.nav
            className="sidebar-panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="sidebar-brand font-hand">Cutting Room</h2>

            <ul className="sidebar-nav">
              {links.map(({ label, to }) => (
                <li key={to}>
                  <Link to={to} className="sidebar-link" onClick={onClose}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            {isAuthenticated ? (
              <div className="sidebar-footer">
                <button
                  type="button"
                  className="sidebar-signout font-hand"
                  onClick={handleSignOut}
                >
                  Sign out
                </button>
              </div>
            ) : null}
          </motion.nav>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export default SidebarMenu
