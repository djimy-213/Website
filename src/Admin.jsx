import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { CATEGORIES, money } from './config'

const EMPTY = {
  name: '',
  description: '',
  price: '',
  category: 'Men',
  sizes: 'S, M, L, XL',
  image_url: '',
  featured: false,
}
const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

export default function Admin() {
  const [tab, setTab] = useState('products')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const load = async () => {
    const p = await supabase.from('products').select('*').order('created_at', { ascending: false })
    const o = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })
    setProducts(p.data || [])
    setOrders(o.data || [])
    if (p.error || o.error) setError((p.error || o.error).message)
  }

  useEffect(() => {
    load()
  }, [])

  const addProduct = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const { error } = await supabase.from('products').insert({
      name: form.name,
      description: form.description,
      price: Number(form.price),
      category: form.category,
      sizes: form.sizes.split(',').map((s) => s.trim()).filter(Boolean),
      image_url: form.image_url.trim() || null,
      featured: form.featured,
    })
    if (error) setError(error.message)
    else setForm(EMPTY)
    setSaving(false)
    load()
  }

  const update = async (id, patch) => {
    const { error } = await supabase.from('products').update(patch).eq('id', id)
    if (error) setError(error.message)
    load()
  }

  const remove = async (id) => {
    if (!confirm('Delete this product?')) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) setError(error.message)
    load()
  }

  const setStatus = async (id, status) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id)
    if (error) setError(error.message)
    load()
  }

  const revenue = orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + Number(o.total), 0)

  return (
    <div className="wrap section">
      <div className="sec-head left">
        <span className="eyebrow">Management</span>
        <h1>Admin panel</h1>
      </div>

      <div className="stats">
        <div><b>{products.length}</b><span>Products</span></div>
        <div><b>{orders.length}</b><span>Orders</span></div>
        <div><b>{orders.filter((o) => o.status === 'pending').length}</b><span>Pending</span></div>
        <div><b>{money(revenue)}</b><span>Revenue</span></div>
      </div>

      <div className="chips">
        <button className={`chip ${tab === 'products' ? 'on' : ''}`} onClick={() => setTab('products')}>Products</button>
        <button className={`chip ${tab === 'orders' ? 'on' : ''}`} onClick={() => setTab('orders')}>Orders</button>
      </div>

      {error && <p className="error">{error}</p>}

      {tab === 'products' && (
        <>
          <form className="admin-form" onSubmit={addProduct}>
            <h3>Add a product</h3>
            <div className="two">
              <input placeholder="Product name" value={form.name} onChange={(e) => set('name', e.target.value)} required />
              <input type="number" min="0" placeholder="Price (DA)" value={form.price} onChange={(e) => set('price', e.target.value)} required />
            </div>
            <div className="two">
              <select value={form.category} onChange={(e) => set('category', e.target.value)}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <input placeholder="Sizes separated by commas (S, M, L or 40, 41, 42)" value={form.sizes} onChange={(e) => set('sizes', e.target.value)} />
            </div>
            <input placeholder="Image link (https://...)" value={form.image_url} onChange={(e) => set('image_url', e.target.value)} />
            <textarea rows="3" placeholder="Description" value={form.description} onChange={(e) => set('description', e.target.value)} />
            <label className="check">
              <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} />
              Show on the home page (featured)
            </label>
            <button className="btn" disabled={saving}>{saving ? 'Saving...' : 'Add product'}</button>
          </form>

          <div className="alist">
            {products.map((p) => (
              <div key={p.id} className="arow">
                <div className="athumb">
                  {p.image_url ? <img src={p.image_url} alt="" /> : <span className="mono">{p.name.charAt(0)}</span>}
                </div>
                <div className="ainfo">
                  <b>{p.name}</b>
                  <small>{p.category} · {money(p.price)}</small>
                </div>
                <div className="abtns">
                  <button className={`mini ${p.featured ? 'on' : ''}`} onClick={() => update(p.id, { featured: !p.featured })}>
                    {p.featured ? '★ Featured' : '☆ Feature'}
                  </button>
                  <button className={`mini ${p.in_stock ? '' : 'warn'}`} onClick={() => update(p.id, { in_stock: !p.in_stock })}>
                    {p.in_stock ? 'In stock' : 'Sold out'}
                  </button>
                  <button className="mini danger" onClick={() => remove(p.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'orders' && (
        <div>
          {orders.length === 0 && <p className="center">No orders yet.</p>}
          {orders.map((o) => (
            <div key={o.id} className="order">
              <div className="order-head">
                <div>
                  <b>Order #{o.id} · {o.full_name}</b>
                  <small>{o.phone} · {o.city} · {o.address}</small>
                  <small>{new Date(o.created_at).toLocaleString('en-GB')}</small>
                </div>
                <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)} className="status-select">
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              {o.order_items.map((i) => (
                <div key={i.id} className="oline">
                  <span>{i.name} · {i.size} × {i.quantity}</span>
                  <span>{money(i.price * i.quantity)}</span>
                </div>
              ))}
              <div className="oline total"><span>Total</span><span>{money(o.total)}</span></div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}