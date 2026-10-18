import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from './supabaseClient'
import './Login.css'

export default function Login() {
  const [searchParams] = useSearchParams()
  const [isSignup, setIsSignup] = useState(searchParams.get('mode') === 'signup')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const switchMode = (signup) => {
    setIsSignup(signup)
    setError('')
    setMessage('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        })
        if (error) throw error
        if (data.session) navigate('/dashboard')
        else setMessage('Account created. Check your email to confirm, then log in.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-blob ab1"></div>
      <div className="auth-blob ab2"></div>
      <div className="auth-blob ab3"></div>

      {/* LEFT SIDE: branding */}
      <aside className="auth-side">
        <Link to="/" className="auth-logo">
          <span className="auth-logo-dot"></span> MyWebsite
        </Link>

        <div className="auth-side-content">
          <h1 key={isSignup ? 'signup-title' : 'login-title'} className="swap">
            {isSignup ? (
              <>
                Start your journey
                <br />
                <span className="auth-gradient">today</span>
              </>
            ) : (
              <>
                Welcome
                <br />
                <span className="auth-gradient">back</span>
              </>
            )}
          </h1>
          <p>
            {isSignup
              ? 'Create your free account and organize your tasks in one beautiful dashboard.'
              : 'Log in to see your tasks, your progress and your statistics.'}
          </p>

          <ul className="perks">
            <li><span>🔐</span> Secure and private</li>
            <li><span>📊</span> Smart dashboard</li>
            <li><span>☁️</span> Saved in the cloud</li>
          </ul>
        </div>

        <div className="auth-float af1">🔒 Secure login</div>
        <div className="auth-float af2">⚡ Fast and simple</div>
      </aside>

      {/* RIGHT SIDE: form */}
      <main className="auth-main">
        <div className="auth-card">
          <Link to="/" className="back-link">← Back to home</Link>

          {/* Sliding switch */}
          <div className="tabs">
            <div className={`indicator ${isSignup ? 'right' : ''}`}></div>
            <button
              type="button"
              className={`tab ${!isSignup ? 'active' : ''}`}
              onClick={() => switchMode(false)}
            >
              Log in
            </button>
            <button
              type="button"
              className={`tab ${isSignup ? 'active' : ''}`}
              onClick={() => switchMode(true)}
            >
              Sign up
            </button>
          </div>

          <h2 key={isSignup ? 'signup-h' : 'login-h'} className="swap">
            {isSignup ? 'Create your account' : 'Log in to your account'}
          </h2>

          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Full name appears only in sign up */}
            <div className={`collapse ${isSignup ? 'open' : ''}`}>
              <div className="field">
                <span className="field-icon">👤</span>
                <input
                  type="text"
                  placeholder="Full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={isSignup}
                  tabIndex={isSignup ? 0 : -1}
                />
              </div>
            </div>

            <div className="field">
              <span className="field-icon">✉️</span>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <span className="field-icon">🔑</span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
              <button
                type="button"
                className="eye"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Show or hide password"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? (
                <span className="spinner"></span>
              ) : isSignup ? (
                'Create account'
              ) : (
                'Log in'
              )}
            </button>

            {error && <p className="auth-error">{error}</p>}
            {message && <p className="auth-success">{message}</p>}
          </form>

          <p className="switch-text">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <span onClick={() => switchMode(!isSignup)}>
              {isSignup ? 'Log in' : 'Sign up'}
            </span>
          </p>
        </div>
      </main>
    </div>
  )
}