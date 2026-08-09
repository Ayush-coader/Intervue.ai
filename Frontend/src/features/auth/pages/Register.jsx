import { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { Sparkles, User, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import '../auth.form.scss'

function Register() {
  const navigate = useNavigate()
  const { loading, handleregister } = useAuth()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handlesubmit = async (e) => {
    e.preventDefault()
    if (!username || !email || !password) return
    setIsSubmitting(true)
    try {
      await handleregister({ username, email, password })
      navigate('/')
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page-container fade-in">
      {/* Glow Orbs */}
      <div className="auth-glow-orb orb-left"></div>
      <div className="auth-glow-orb orb-right"></div>

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo-badge">
            <Sparkles size={24} />
          </div>
          <h1>Create Account</h1>
          <p>Get personalized AI interview prep, question guides & day-by-day roadmaps</p>
        </div>

        <form onSubmit={handlesubmit}>
          <div className="input-section">
            <label htmlFor="username">Full Name / Username</label>
            <div className="input-field-wrapper">
              <User className="input-icon" size={18} />
              <input
                onChange={(e) => setUsername(e.target.value)}
                value={username}
                type="text"
                id="username"
                name="username"
                placeholder="Alex Morgan"
                required
              />
            </div>
          </div>

          <div className="input-section">
            <label htmlFor="email">Email Address</label>
            <div className="input-field-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                type="email"
                id="email"
                name="email"
                placeholder="name@company.com"
                required
              />
            </div>
          </div>

          <div className="input-section">
            <label htmlFor="password">Password</label>
            <div className="input-field-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                placeholder="Create a password"
                required
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            className="btn-submit"
            type="submit"
            disabled={loading || isSubmitting}
          >
            {loading || isSubmitting ? (
              <>
                <span className="spinner-sm"></span>
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Get Started</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </main>
  )
}

export default Register