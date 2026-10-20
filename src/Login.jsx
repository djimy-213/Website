import { useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { supabase } from './supabaseClient'
import { useAuth } from './AuthContext'
import { STORE_NAME } from './config'
import { RULES, checkPassword } from './passwordRules'

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}

export default function Login() {
  const [params] = useSearchParams()
  const next = params.get('next') || '/'
  const { user } = useAuth()
  const [mode, setMode] = useState(params.get('mode') === 'signup' ? 'signup' : 'login')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const isSignup = mode === 'signup'
  const isForgot = mode === 'forgot'
  const { results, score, strong, level } = checkPassword(password)

  if (user) return <Navigate to={next} replace />

  const changeMode = (m) => {
    setMode(m)
    setError('')
    setMessage('')
  }

  const googleLogin = async () => {
    setError('')
    setMessage('')
    setGoogleLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${next.startsWith('/') ? next : '/'}`,
        queryParams: { prompt: 'select_account' },
      },
    })
    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
  }

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
      if (isForgot) {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/reset-password`,
        })
        if (error) throw error
        setMessage('If this email has an account, a reset link was sent. Check your inbox and spam folder.')
      } else if (isSignup) {
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

  const title = isForgot ? 'Forgot password?' : isSignup ? 'Create your account' : 'Log in'
  const eyebrow = isForgot ? 'Reset' : isSignup ? 'Welcome' : 'Welcome back'
  const buttonText = isForgot ? 'Send reset link' : isSignup ? 'Create account' : 'Log in'

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
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>

          {!isForgot && (
            <>
              <button
                type="button"
                className="google-btn"
                onClick={googleLogin}
                disabled={googleLoading}
              >
                <GoogleIcon />
                {googleLoading
                  ? 'Redirecting to Google...'
                  : isSignup
                  ? 'Sign up with Google'
                  : 'Continue with Google'}
              </button>

              <div className="or-line"><span>or use your email</span></div>
            </>
          )}

          {isForgot && (
            <p className="muted">Enter your email and we will send you a link to choose a new password.</p>
          )}

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

          {!isForgot && (
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
          )}

          {mode === 'login' && (
            <button type="button" className="forgot-link" onClick={() => changeMode('forgot')}>
              Forgot password?
            </button>
          )}

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
            {loading ? 'Please wait...' : buttonText}
          </button>

          {error && <p className="error">{error}</p>}
          {message && <p className="success-box">{message}</p>}

          {isForgot ? (
            <p className="switch">
              Remembered it? <span onClick={() => changeMode('login')}>Back to log in</span>
            </p>
          ) : (
            <p className="switch">
              {isSignup ? 'Already have an account?' : 'New here?'}{' '}
              <span onClick={() => changeMode(isSignup ? 'login' : 'signup')}>
                {isSignup ? 'Log in' : 'Create an account'}
              </span>
            </p>
          )}
        </form>
      </main>
    </div>
  )
}