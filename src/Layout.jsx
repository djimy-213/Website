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
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

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
            <a href={`tel:${PHONE_CALL}`} className="phone-link">{PHONE_DISPLAY}</a>
            <a
              href={`https://wa.me/${PHONE_WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="wa-btn"
            >
              WhatsApp us
            </a>
            <span>contact@yourstore.com</span>
            <span>Algiers, Algeria</span>
          </div>
        </div>
        <div className="copy">© {new Date().getFullYear()} {STORE_NAME}. All rights reserved.</div>
      </footer>
    </div>
  )
}