import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from './AuthContext'
import './Home.css'

function Reveal({ children, delay = 0 }) {
  const ref = useRef(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true)
          obs.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`reveal ${show ? 'show' : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

function Counter({ to, suffix = '' }) {
  const ref = useRef(null)
  const [n, setN] = useState(0)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        obs.disconnect()
        const start = performance.now()
        const duration = 1500
        const tick = (now) => {
          const p = Math.min((now - start) / duration, 1)
          setN(Math.round(to * (1 - Math.pow(1 - p, 3))))
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0.5 }
    )
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [to])

  return (
    <span ref={ref}>
      {n}
      {suffix}
    </span>
  )
}

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="home">
      <div className="blob blob1"></div>
      <div className="blob blob2"></div>
      <div className="blob blob3"></div>

      <nav className="nav">
        <div className="logo">
          <span className="logo-dot"></span> MyWebsite
        </div>
        <div className="nav-links">
          {user ? (
            <Link to="/dashboard" className="btn btn-primary">Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Log in</Link>
              <Link to="/login?mode=signup" className="btn btn-primary">Get started</Link>
            </>
          )}
        </div>
      </nav>

      <header className="hero">
        <div className="hero-text">
          <span className="badge">✨ Simple. Fast. Secure.</span>
          <h1>
            Organize your work
            <br />
            <span className="gradient-text">with style</span>
          </h1>
          <p>
            Create your account, manage your tasks, and follow your progress
            from one beautiful dashboard. Your data stays private and safe.
          </p>
          <div className="hero-buttons">
            <Link
              to={user ? '/dashboard' : '/login?mode=signup'}
              className="btn btn-primary btn-lg"
            >
              {user ? 'Open dashboard' : 'Start for free'}
            </Link>
            <a href="#features" className="btn btn-ghost btn-lg">Learn more</a>
          </div>
        </div>

        <div className="hero-visual">
          <div className="mock">
            <div className="mock-bar">
              <i></i><i></i><i></i>
            </div>
            <div className="mock-stats">
              <div><b>12</b><small>Total</small></div>
              <div><b>8</b><small>Done</small></div>
              <div><b>4</b><small>Pending</small></div>
            </div>
            <div className="mock-row done"><span className="check">✓</span> Design the homepage</div>
            <div className="mock-row done"><span className="check">✓</span> Connect Supabase</div>
            <div className="mock-row"><span className="check empty"></span> Deploy the website</div>
          </div>
          <div className="float-card fc1">🔒 Secure login</div>
          <div className="float-card fc2">⚡ Real-time data</div>
        </div>
      </header>

      <section id="features" className="section">
        <Reveal>
          <h2 className="section-title">Everything you need</h2>
          <p className="section-sub">Built with React, Node and Supabase.</p>
        </Reveal>

        <div className="features">
          <Reveal delay={0}>
            <div className="feature">
              <div className="icon">🔐</div>
              <h3>Secure login</h3>
              <p>Sign up and log in with email and password. Each account is protected.</p>
            </div>
          </Reveal>
          <Reveal delay={150}>
            <div className="feature">
              <div className="icon">📊</div>
              <h3>Smart dashboard</h3>
              <p>See your total, completed and pending tasks at a glance.</p>
            </div>
          </Reveal>
          <Reveal delay={300}>
            <div className="feature">
              <div className="icon">☁️</div>
              <h3>Cloud database</h3>
              <p>Your data is saved in the cloud and available from any device.</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section stats-section">
        <Reveal>
          <div className="stats-grid">
            <div>
              <h3><Counter to={100} suffix="%" /></h3>
              <p>Private data</p>
            </div>
            <div>
              <h3><Counter to={24} suffix="/7" /></h3>
              <p>Always available</p>
            </div>
            <div>
              <h3><Counter to={3} /></h3>
              <p>Powerful technologies</p>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="section">
        <Reveal>
          <div className="cta">
            <h2>Ready to get started?</h2>
            <p>Create your free account in less than a minute.</p>
            <Link
              to={user ? '/dashboard' : '/login?mode=signup'}
              className="btn btn-light btn-lg"
            >
              {user ? 'Go to dashboard' : 'Create my account'}
            </Link>
          </div>
        </Reveal>
      </section>

      <footer className="footer">
        © {new Date().getFullYear()} MyWebsite. All rights reserved.
      </footer>
    </div>
  )
}