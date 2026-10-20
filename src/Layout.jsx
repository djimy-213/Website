import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { useCart } from './CartContext'
import { STORE_NAME, CATEGORIES } from './config'

const PHONE_DISPLAY = '+213 559 64 53 80'
const PHONE_CALL = '+213559645380'
const PHONE_WHATSAPP = '213559645380'

function WhatsAppIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 21l1.65-4.85A8.5 8.5 0 1 1 8 19.4L3 21z" />
      <path d="M9 8.5c.2 2.6 3.9 6.3 6.5 6.5l1.4-1.4-2.2-1.2-1 .8c-.9-.4-1.9-1.4-2.3-2.3l.8-1-1.2-2.2L9 8.5z" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
    </svg>
  )
}

export default function Layout() {
  const { user, isAdmin } = useAuth()
  const { count } = useCart()
  const [open, setOpen] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setContactOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const close = () => setOpen(false)

  return (
    <div className="site">
      <div className="topbar">Free delivery over 15,000 DA · Cash on delivery · Easy exchanges</div>

      <header className="nav">
        <button className="burger" onClick={() => setOpen(!open)} aria-label="Menu">☰</button>
        <Link to="/" className="brand" onClick={close}>{STORE_NAME}</Link>

        <nav className={`links ${open ? 'open' : ''}`}>
          <Link to="/shop" onClick={close}>All</Link>
          {CATEGORIES.map((c) => (
            <Link key={c} to={`/shop?category=${c}`} onClick={close}>{c}</Link>
          ))}
        </nav>

        <div className="actions">
          {isAdmin && <Link to="/admin">Admin</Link>}
          <Link to={user ? '/account' : '/login'}>{user ? 'Account' : 'Log in'}</Link>
          <Link to="/cart" className="cartbtn">Bag <span>{count}</span></Link>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="footer">
        <div className="wrap foot-grid">
          <div>
            <div className="brand light">{STORE_NAME}</div>
            <p>Timeless fashion for the whole family. Quality clothes and shoes, delivered to your door.</p>
          </div>
          <div>
            <h4>Shop</h4>
            {CATEGORIES.map((c) => (
              <Link key={c} to={`/shop?category=${c}`}>{c}</Link>
            ))}
          </div>
          <div>
            <h4>Help</h4>
            <Link to="/cart">My bag</Link>
            <Link to="/account">My orders</Link>
            <span>Delivery 24 - 72 hours</span>
            <span>Exchange within 7 days</span>
          </div>
          <div>
            <h4>Contact</h4>
            <button type="button" className="phone-open" onClick={() => setContactOpen(true)}>
              {PHONE_DISPLAY}
            </button>
            <span>contact@yourstore.com</span>
            <span>Algiers, Algeria</span>
          </div>
        </div>
        <div className="copy">© {new Date().getFullYear()} {STORE_NAME}. All rights reserved.</div>
      </footer>

      {/* CONTACT POPUP */}
      {contactOpen && (
        <div className="contact-overlay" onClick={() => setContactOpen(false)}>
          <div
            className="contact-box"
            role="dialog"
            aria-modal="true"
            aria-label="Contact us"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="contact-x"
              onClick={() => setContactOpen(false)}
              aria-label="Close"
            >
              ×
            </button>

            <span className="contact-eyebrow">Get in touch</span>
            <h3>Contact us</h3>
            <i className="contact-divider"></i>
            <p className="contact-number">{PHONE_DISPLAY}</p>

            <a
              href={`https://wa.me/${PHONE_WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-opt"
              onClick={() => setContactOpen(false)}
            >
              <span className="opt-icon wa"><WhatsAppIcon /></span>
              <span className="opt-text">
                <b>WhatsApp</b>
                <small>Send us a message</small>
              </span>
              <span className="opt-arrow">→</span>
            </a>

            <a
              href={`tel:${PHONE_CALL}`}
              className="contact-opt"
              onClick={() => setContactOpen(false)}
            >
              <span className="opt-icon call"><PhoneIcon /></span>
              <span className="opt-text">
                <b>Call</b>
                <small>Speak with us directly</small>
              </span>
              <span className="opt-arrow">→</span>
            </a>

            <p className="contact-hours">Available every day, 9:00 - 20:00</p>
          </div>
        </div>
      )}
    </div>
  )
}