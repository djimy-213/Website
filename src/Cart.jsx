import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import { useAuth } from './AuthContext'
import { useCart } from './CartContext'
import { money } from './config'

export default function Cart() {
  const { items, setQty, remove, clear, total } = useCart()
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ full_name: '', phone: '', city: '', address: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (profile?.full_name) setForm((f) => ({ ...f, full_name: f.full_name || profile.full_name }))
  }, [profile])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const delivery = total === 0 || total >= 15000 ? 0 : 600
  const grand = total + delivery

  const placeOrder = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: order, error: err } = await supabase
      .from('orders')
      .insert({ ...form, total: grand })
      .select()
      .single()

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    const rows = items.map((i) => ({
      order_id: order.id,
      product_id: i.id,
      name: i.name,
      price: i.price,
      size: i.size,
      quantity: i.qty,
    }))
    const { error: err2 } = await supabase.from('order_items').insert(rows)

    if (err2) {
      setError(err2.message)
      setLoading(false)
      return
    }

    clear()
    navigate('/account?ordered=1')
  }

  if (items.length === 0)
    return (
      <div className="center empty-bag">
        <div className="big-icon">🛍️</div>
        <h2>Your bag is empty</h2>
        <p>Discover our latest pieces and add your favorites.</p>
        <br />
        <Link to="/shop" className="btn">Start shopping</Link>
      </div>
    )

  return (
    <div className="wrap section">
      <div className="sec-head left">
        <span className="eyebrow">Checkout</span>
        <h1>My bag</h1>
      </div>

      <div className="cart-grid">
        <div>
          {items.map((i) => (
            <div key={i.key} className="citem fade">
              <div className="cthumb">
                {i.image_url ? <img src={i.image_url} alt={i.name} /> : <span className="mono">{i.name.charAt(0)}</span>}
              </div>
              <div className="cinfo">
                <h3>{i.name}</h3>
                <small>Size: {i.size}</small>
                <div className="qty small">
                  <button onClick={() => setQty(i.key, i.qty - 1)}>−</button>
                  <span>{i.qty}</span>
                  <button onClick={() => setQty(i.key, i.qty + 1)}>+</button>
                </div>
              </div>
              <div className="cright">
                <b>{money(i.price * i.qty)}</b>
                <button className="link-btn" onClick={() => remove(i.key)}>Remove</button>
              </div>
            </div>
          ))}
        </div>

        <aside className="summary">
          <h3>Order summary</h3>
          <div className="row"><span>Subtotal</span><span>{money(total)}</span></div>
          <div className="row"><span>Delivery</span><span>{delivery === 0 ? 'Free' : money(delivery)}</span></div>
          <div className="row total"><span>Total</span><span>{money(grand)}</span></div>

          {user ? (
            <form onSubmit={placeOrder} className="checkout">
              <h4>Delivery details</h4>
              <input placeholder="Full name" value={form.full_name} onChange={(e) => set('full_name', e.target.value)} required />
              <input placeholder="Phone number" value={form.phone} onChange={(e) => set('phone', e.target.value)} required />
              <input placeholder="City / Wilaya" value={form.city} onChange={(e) => set('city', e.target.value)} required />
              <input placeholder="Full address" value={form.address} onChange={(e) => set('address', e.target.value)} required />
              <p className="hint">💵 Payment in cash when you receive your order.</p>
              {error && <p className="error">{error}</p>}
              <button className="btn full" disabled={loading}>
                {loading ? 'Placing order...' : 'Place order'}
              </button>
            </form>
          ) : (
            <div className="checkout">
              <p className="hint">Please log in to place your order.</p>
              <Link to="/login?next=/cart" className="btn full">Log in to order</Link>
              <Link to="/login?mode=signup&next=/cart" className="btn line full">Create an account</Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}