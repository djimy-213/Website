import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from './supabaseClient'

export default function Login() {
  const [searchParams] = useSearchParams()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignup, setIsSignup] = useState(searchParams.get('mode') === 'signup')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (isSignup) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
      if (error) return setError(error.message)
      if (data.session) navigate('/dashboard')
      else setMessage('Account created. Check your email to confirm, then log in.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return setError(error.message)
      navigate('/dashboard')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>{isSignup ? 'Sign up' : 'Log in'}</h2>

      {isSignup && (
        <input
          type="text"
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      )}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Password (min 6 characters)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        minLength={6}
        required
      />

      <button type="submit">{isSignup ? 'Create account' : 'Log in'}</button>

      <p className="link" onClick={() => setIsSignup(!isSignup)}>
        {isSignup ? 'Already have an account? Log in' : 'No account? Sign up'}
      </p>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}
    </form>
  )
}