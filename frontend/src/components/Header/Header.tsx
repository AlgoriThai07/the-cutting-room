import { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SignInModal from '@/components/SignInModal/SignInModal.tsx'
import { useAuthStore } from '@/store/authStore.ts'

interface HeaderProps {
  variant?: 'landing' | 'story'
}

function Header({ variant = 'landing' }: HeaderProps) {
  const isStory = variant === 'story'
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const logout = useAuthStore((s) => s.logout)
  const [signInOpen, setSignInOpen] = useState(false)
  const navigate = useNavigate()

  const openSignIn = useCallback(() => setSignInOpen(true), [])
  const closeSignIn = useCallback(() => setSignInOpen(false), [])

  const handleSignOut = useCallback(() => {
    logout()
    navigate('/')
  }, [logout, navigate])

  const NAV_LINKS = [
    { label: 'Explore', to: '/explore' },
    { label: 'My Track', to: '/story' },
    { label: 'Friends', to: '/friends' },
    { label: 'Profile', to: '/profile' },
  ]

  return (
    <>
      <header className={isStory ? 'story-header' : 'landing-header'}>
        <div className="header-left">
          <Link to="/" className="logo-link" aria-label="Go to home">
            <img
              src="/favicon-96x96.png"
              srcSet="/favicon-32x32.png 32w, /favicon-96x96.png 96w, /android-icon-192x192.png 192w"
              sizes="(max-width: 480px) 32px, (max-width: 768px) 48px, 56px"
              alt="Cutting Studio"
              className="logo-icon"
              width="56"
              height="56"
              draggable={false}
            />
          </Link>
        </div>

        <nav className="header-nav">
          {isAuthenticated ? (
            <ul className="nav-list">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="nav-link font-hand">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="nav-link font-hand btn-link"
                >
                  Sign Out
                </button>
              </li>
            </ul>
          ) : (
            /* Public / Landing State: Show "Sign in" button if NOT on landing page */
            (!isStory && variant !== 'landing') && (
              <button
                type="button"
                className="btn-gradient btn-signin"
                onClick={openSignIn}
              >
                <span>Sign in / Log in</span>
              </button>
            )
          )}
        </nav>
      </header>
      <SignInModal isOpen={signInOpen} onClose={closeSignIn} />
    </>
  )
}

export default Header
