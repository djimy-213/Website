import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import { useAuth } from './AuthContext'
import { STORE_NAME } from './config'
import { RULES, checkPassword } from './passwordRules'

export default function ResetPassword() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const { results, score, strong, level } = checkPassword(password)

  const submit = async (e) => {
    e.preventDefault()
    setError('')

    if (!strong) return setError('Please choose a stronger password: all the rules must be green.')
    if (password !== confirm) return setError('The two passwords do not match.')

    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password })
    setSaving(false)

    if (error) return setError(error.message)
    setDone(true)
    setTimeout(() => navigate('/'), 2500)
  }

  return (
    <div className="auth">
      <aside className="auth-art">
        <Link to="/" className="brand light">{STORE_NAME}</Link>
        <div className="auth-quote fade">
          <h2>
            A new start, <em>a safe password.</em>
          </h2>
          <p>Choose a strong password you have not used elsewhere.</p>
        </div>
        <small>© {new Date().getFullYear()} {STORE_NAME}</small>
      </aside>

      <main className="auth-form-wrap">
        {loading ? (
          <p className="center">Loading...</p>
        ) : !user ? (
          <div className="auth-form fade">
            <span className="eyebrow">Reset</span>
            <h1>Link expired</h1>
            <p className="muted">This reset link is invalid or has expired. Please request a new one.</p>
            <Link to="/login" className="btn full">Back to log in</Link>
          </div>
        ) : done ? (
          <div className="auth-form fade">
            <span className="eyebrow">Done</span>
            <h1>Password updated</h1>
            <p className="success-box">✓ Your password was changed. Redirecting to the store...</p>
            <Link to="/" className="btn full">Go to the store</Link>
          </div>
        ) : (
          <form className="auth-form fade" onSubmit={submit}>
            <span className="eyebrow">Reset</span>
            <h1>Choose a new password</h1>

            <div className="pw-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
              <button
                type="button"
                className="pw-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
              <div className="pw-line">
                <div
                  className="pw-line-fill"
                  style={{
                    width: `${(score / RULES.length) * 100}%`,
                    background: level.color,
                  }}
                ></div>
              </div>
            </div>

            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />

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

            <button className="btn full" disabled={saving || !strong}>
              {saving ? 'Saving...' : 'Update password'}
            </button>

            {error && <p className="error">{error}</p>}
          </form>
        )}
      </main>
    </div>
  )
}