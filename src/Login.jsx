import { useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { supabase } from './supabaseClient'
import { useAuth } from './AuthContext'
import { STORE_NAME } from './config'

export default function Login() {
  const [params] = useSearchParams()
  const next = params.get('next') || '/'
  const { user } = useAuth()
  const [isSignup, setIsSignup] = useState(params.get('mode') === 'signup')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  if (user) return <Navigate to={next} replace />

  const submit = async (e) => {
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
            <input placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          )}
          <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />

          <button className="btn full" disabled={loading}>
            {loading ? 'Please wait...' : isSignup ? 'Create account' : 'Log in'}
          </button>

          {error && <p className="error">{error}</p>}
          {message && <p className="success-box">{message}</p>}

          <p className="switch">
            {isSignup ? 'Already have an account?' : 'New here?'}{' '}
            <span onClick={() => { setIsSignup(!isSignup); setError(''); setMessage('') }}>
              {isSignup ? 'Log in' : 'Create an account'}
            </span>
          </p>
        </form>
      </main>
    </div>
  )
}