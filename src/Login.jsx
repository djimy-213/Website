import { useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { supabase } from './supabaseClient'
import { useAuth } from './AuthContext'
import { STORE_NAME } from './config'

const RULES = [
  { id: 'len', label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { id: 'lower', label: 'A lowercase letter (a-z)', test: (p) => /[a-z]/.test(p) },
  { id: 'upper', label: 'An uppercase letter (A-Z)', test: (p) => /[A-Z]/.test(p) },
  { id: 'num', label: 'A number (0-9)', test: (p) => /[0-9]/.test(p) },
  { id: 'sym', label: 'A special character (. , \\ ! @ # $ ...)', test: (p) => /[^A-Za-z0-9]/.test(p) },
]

const LEVELS = [
  { label: 'Too short', color: '#d93025' },
  { label: 'Very weak', color: '#d93025' },
  { label: 'Weak', color: '#ef6c00' },
  { label: 'Fair', color: '#e6b800' },
  { label: 'Good', color: '#7cb342' },
  { label: 'Strong', color: '#2e7d32' },
]

export default function Login() {
  const [params] = useSearchParams()
  const next = params.get('next') || '/'
  const { user } = useAuth()
  const [isSignup, setIsSignup] = useState(params.get('mode') === 'signup')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const results = RULES.map((r) => ({ ...r, ok: r.test(password) }))
  const score = results.filter((r) => r.ok).length
  const strong = score === RULES.length
  const level = password ? LEVELS[score] : { label: '', color: '#e4dccf' }

  if (user) return <Navigate to={next} replace />

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (isSignup && !strong) {
      setError('Please choose a stronger password: all the rules below must be green.')
      return
    }

    setLoading(true)
    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        })
        if (error) throw error
        if (!data.session) setMessage('Account created. Check your email to confirm, then log in.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setIsSignup(!isSignup)
    setError('')
    setMessage('')
  }

  return (
    <div className="auth">
      <aside className="auth-art">
        <Link to="/" className="brand light">{STORE_NAME}</Link>
        <div className="auth-quote fade">
          <h2>
            Style is a way to say who you are <em>without speaking.</em>
          </h2>
          <p>Join us to follow your orders and shop faster.</p>
        </div>
        <small>© {new Date().getFullYear()} {STORE_NAME}</small>
      </aside>

      <main className="auth-form-wrap">
        <form className="auth-form fade" onSubmit={submit}>
          <Link to="/" className="back">← Back to store</Link>
          <span className="eyebrow">{isSignup ? 'Welcome' : 'Welcome back'}</span>
          <h1>{isSignup ? 'Create your account' : 'Log in'}</h1>

          {isSignup && (
            <input
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          )}

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="pw-wrap">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder={isSignup ? 'Create a strong password' : 'Password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={isSignup ? 8 : 6}
              required
            />
            <button
              type="button"
              className="pw-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>

            {isSignup && (
              <div className="pw-line">
                <div
                  className="pw-line-fill"
                  style={{
                    width: `${(score / RULES.length) * 100}%`,
                    background: level.color,
                  }}
                ></div>
              </div>
            )}
          </div>

          {isSignup && (
            <div className="strength">
              <div className="strength-head">
                <span>Password strength</span>
                <b style={{ color: level.color }}>{level.label}</b>
              </div>

              <ul className="rules">
                {results.map((r) => (
                  <li key={r.id} className={r.ok ? 'ok' : ''}>
                    <span className="dot">{r.ok ? '✓' : '•'}</span>
                    {r.label}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button className="btn full" disabled={loading || (isSignup && !strong)}>
            {loading ? 'Please wait...' : isSignup ? 'Create account' : 'Log in'}
          </button>

          {error && <p className="error">{error}</p>}
          {message && <p className="success-box">{message}</p>}

          <p className="switch">
            {isSignup ? 'Already have an account?' : 'New here?'}{' '}
            <span onClick={switchMode}>{isSignup ? 'Log in' : 'Create an account'}</span>
          </p>
        </form>
      </main>
    </div>
  )
}