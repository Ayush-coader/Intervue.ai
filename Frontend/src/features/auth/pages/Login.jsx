import { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import '../auth.form.scss'

function Login() {
  const { loading, handlelogin } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handlesubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) return
    setIsSubmitting(true)
    try {
      await handlelogin({ email, password })
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
          <h1>Welcome Back</h1>
          <p>Sign in to access your interview analytics and preparation roadmaps</p>
        </div>

        <form onSubmit={handlesubmit}>
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
                placeholder="••••••••"
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
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/register">Create Account</Link>
          </p>
        </div>
      </div>
    </main>
  )
}

export default Login