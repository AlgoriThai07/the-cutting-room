import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import SidebarMenu from '@/components/SidebarMenu/SidebarMenu.tsx'
import SignInModal from '@/components/SignInModal/SignInModal.tsx'
import { useAuthStore } from '@/store/authStore.ts'

interface HeaderProps {
  variant?: 'landing' | 'story'
}

function Header({ variant = 'landing' }: HeaderProps) {
  const isStory = variant === 'story'
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [menuOpen, setMenuOpen] = useState(false)
  const [signInOpen, setSignInOpen] = useState(false)

  const openMenu = useCallback(() => setMenuOpen(true), [])
  const closeMenu = useCallback(() => setMenuOpen(false), [])
  const openSignIn = useCallback(() => setSignInOpen(true), [])
  const closeSignIn = useCallback(() => setSignInOpen(false), [])

  return (
    <>
      <header className={isStory ? 'story-header' : 'landing-header'}>
        <div className="header-left">
          <button
            type="button"
            className="menu-toggle"
            onClick={openMenu}
            aria-label="Open menu"
          >
            <span />
            <span />
            <span />
          </button>
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
        {isStory || isAuthenticated ? null : (
          <button type="button" className="btn-gradient btn-signin" onClick={openSignIn}>
            <span>Sign in / Log in</span>
          </button>
        )}
      </header>
      <SidebarMenu isOpen={menuOpen} onClose={closeMenu} />
      <SignInModal isOpen={signInOpen} onClose={closeSignIn} />
    </>
  )
}

export default Header
