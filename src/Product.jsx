import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from './supabaseClient'
import { useCart } from './CartContext'
import { money } from './config'

export default function Product() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { add } = useCart()
  const [p, setP] = useState(null)
  const [loading, setLoading] = useState(true)
  const [size, setSize] = useState('')
  const [qty, setQty] = useState(1)
  const [msg, setMsg] = useState('')
  const [added, setAdded] = useState(false)

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        setP(data)
        setLoading(false)
      })
  }, [id])

  if (loading) return <p className="center">Loading...</p>
  if (!p)
    return (
      <div className="center">
        <p>Product not found.</p>
        <br />
        <Link to="/shop" className="btn line">Back to shop</Link>
      </div>
    )

  const hasSizes = p.sizes && p.sizes.length > 0

  const addToBag = (goToBag) => {
    if (hasSizes && !size) return setMsg('Please choose a size.')
    setMsg('')
    add(p, size || 'One size', qty)
    if (goToBag) return navigate('/cart')
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <div className="wrap section">
      <Link to="/shop" className="back">← Back to shop</Link>

      <div className="detail">
        <div className="pimg big fade">
          {p.image_url ? <img src={p.image_url} alt={p.name} /> : <span className="mono">{p.name.charAt(0)}</span>}
        </div>

        <div className="info fade d1">
          <span className="eyebrow">{p.category}</span>
          <h1>{p.name}</h1>
          <div className="price">{money(p.price)}</div>
          <p className="desc">{p.description || 'A carefully selected piece from our collection.'}</p>

          {hasSizes && (
            <>
              <h4>Size</h4>
              <div className="sizes">
                {p.sizes.map((s) => (
                  <button key={s} className={`size ${size === s ? 'on' : ''}`} onClick={() => setSize(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </>
          )}

          <h4>Quantity</h4>
          <div className="qty">
            <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
            <span>{qty}</span>
            <button onClick={() => setQty(qty + 1)}>+</button>
          </div>

          {msg && <p className="error">{msg}</p>}

          {p.in_stock ? (
            <div className="buy-btns">
              <button className="btn" onClick={() => addToBag(false)}>
                {added ? '✓ Added to bag' : 'Add to bag'}
              </button>
              <button className="btn line" onClick={() => addToBag(true)}>Buy now</button>
            </div>
          ) : (
            <p className="error">This product is sold out.</p>
          )}

          <ul className="notes">
            <li>🚚 Delivery in 24 - 72 hours</li>
            <li>💵 Cash on delivery</li>
            <li>🔁 Exchange within 7 days</li>
          </ul>
        </div>
      </div>
    </div>
  )
}