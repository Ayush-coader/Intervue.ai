import React from 'react'
import { useNavigate, useLocation } from 'react-router'
import { useAuth } from '../features/auth/hooks/useAuth'
import { Sparkles, LogOut, ArrowLeft, LayoutDashboard, Cpu } from 'lucide-react'
import './Navbar.scss'

function Navbar({ showBackBtn = false }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, handlelogout } = useAuth()

  return (
    <header className="app-navbar">
      <div className="nav-container">
        {/* Left: Brand Logo & Navigation */}
        <div className="nav-left">
          <div 
            className="logo-brand" 
            onClick={() => navigate('/')} 
            role="button" 
            tabIndex={0}
          >
            <div className="logo-icon-wrapper">
              <Sparkles className="logo-sparkle" size={20} />
            </div>
            <span className="logo-text brand-text">
              Intervue<span className="logo-accent">.ai</span>
            </span>
          </div>

          <nav className="nav-links">
            <button 
              className={`nav-link-btn ${location.pathname === '/' ? 'active' : ''}`}
              onClick={() => navigate('/')}
            >
              <LayoutDashboard size={16} />
              <span>Workspace</span>
            </button>
          </nav>
        </div>

        {/* Right: Actions, AI Status, & User Profile */}
        <div className="nav-right">
          <div className="ai-status-badge">
            <span className="status-pulse"></span>
            <Cpu size={14} />
            <span className="status-text">AI Ready</span>
          </div>

          {showBackBtn && (
            <button className="nav-action-btn back-btn" onClick={() => navigate('/')}>
              <ArrowLeft size={16} />
              <span>Back to Workspace</span>
            </button>
          )}

          {user && (
            <div className="user-profile-menu">
              <div className="user-avatar" title={user.email || user.username}>
                {(user.username || user.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <span className="user-name">{user.username || user.email?.split('@')[0] || 'User'}</span>
                <span className="user-email">{user.email || ''}</span>
              </div>
              <button 
                className="logout-action-btn" 
                onClick={handlelogout}
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
