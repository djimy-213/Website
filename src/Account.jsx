import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from './supabaseClient'
import { useAuth } from './AuthContext'
import { money } from './config'

export default function Account() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders(data || [])
        setLoading(false)
      })
  }, [user.id])

  const logout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <div className="wrap section">
      <div className="account-head">
        <div className="sec-head left">
          <span className="eyebrow">My account</span>
          <h1>Hello, {profile?.full_name || user.email}</h1>
          <p className="muted">{user.email}</p>
        </div>
        <button className="btn line" onClick={logout}>Log out</button>
      </div>

      {params.get('ordered') && (
        <div className="success-box">
          ✓ Thank you! Your order was received. We will call you to confirm the delivery.
        </div>
      )}

      <h2 className="sub">My orders</h2>

      {loading ? (
        <p className="center">Loading...</p>
      ) : orders.length === 0 ? (
        <div className="center">
          <p>You have no orders yet.</p>
          <br />
          <Link to="/shop" className="btn">Start shopping</Link>
        </div>
      ) : (
        orders.map((o) => (
          <div key={o.id} className="order">
            <div className="order-head">
              <div>
                <b>Order #{o.id}</b>
                <small>{new Date(o.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</small>
              </div>
              <span className={`st ${o.status}`}>{o.status}</span>
            </div>
            {o.order_items.map((i) => (
              <div key={i.id} className="oline">
                <span>{i.name} · {i.size} × {i.quantity}</span>
                <span>{money(i.price * i.quantity)}</span>
              </div>
            ))}
            <div className="oline total">
              <span>Total</span>
              <span>{money(o.total)}</span>
            </div>
          </div>
        ))
      )}
    </div>
  )
}