import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { useCart } from './CartContext'
import { STORE_NAME, CATEGORIES } from './config'

const PHONE_DISPLAY = '+213 559 64 53 80'
const PHONE_CALL = '+213559645380'
const PHONE_WHATSAPP = '213559645380'

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

      {/* POPUP: WhatsApp or Call */}
      {contactOpen && (
        <div className="contact-overlay" onClick={() => setContactOpen(false)}>
          <div
            className="contact-box"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Contact us</h3>
            <p>{PHONE_DISPLAY}</p>

            <a
              href={`https://wa.me/${PHONE_WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-opt wa"
              onClick={() => setContactOpen(false)}
            >
              WhatsApp
            </a>
            <a
              href={`tel:${PHONE_CALL}`}
              className="contact-opt call"
              onClick={() => setContactOpen(false)}
            >
              Call
            </a>
            <button type="button" className="contact-cancel" onClick={() => setContactOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}