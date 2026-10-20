import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from './supabaseClient'
import ProductCard from './ProductCard'
import { STORE_NAME } from './config'

const TILES = [
  { name: 'Women', note: 'Dresses, coats & more', cls: 't1' },
  { name: 'Men', note: 'Suits, shirts & casual', cls: 't2' },
  { name: 'Kids', note: 'Soft & playful', cls: 't3' },
  { name: 'Shoes', note: 'For every step', cls: 't4' },
  { name: 'Accessories', note: 'The finishing touch', cls: 't5' },
]

const PERKS = [
  ['Fast delivery', 'To your door in 24 - 72 hours'],
  ['Cash on delivery', 'Pay when you receive your order'],
  ['Easy exchange', 'Change size within 7 days'],
  ['Quality guaranteed', 'Carefully selected fabrics'],
]

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(8)
      .then(({ data }) => {
        setProducts(data || [])
        setLoading(false)
      })
  }, [])

  const marquee = 'NEW COLLECTION ✦ FREE DELIVERY OVER 15,000 DA ✦ CASH ON DELIVERY ✦ MEN · WOMEN · KIDS · SHOES ✦ '

  return (
    <>
      {/* HERO WITH BLURRED VIDEO BACKGROUND */}
      <section className="hero-video">
        <video
          className="hero-bg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/videos/poster.jpg"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay"></div>

        <div className="hero wrap">
          <div className="hero-text">
            <span className="eyebrow fade">New season · {new Date().getFullYear()}</span>
            <h1 className="fade d1">
              Dress with <em>elegance</em>,<br />every single day.
            </h1>
            <p className="fade d2">
              Discover clothes and shoes for men, women and kids. Timeless pieces,
              honest prices, delivered to your door.
            </p>
            <div className="hero-btns fade d3">
              <Link to="/shop" className="btn gold">Shop the collection</Link>
              <Link to="/shop?category=Shoes" className="btn line">Explore shoes</Link>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee">
        <div className="marquee-in">
          <span>{marquee}</span>
          <span>{marquee}</span>
          <span>{marquee}</span>
          <span>{marquee}</span>
        </div>
      </div>

      {/* CATEGORIES */}
      <section className="wrap section">
        <div className="sec-head">
          <span className="eyebrow">Browse</span>
          <h2>Shop by category</h2>
        </div>
        <div className="tiles">
          {TILES.map((t) => (
            <Link key={t.name} to={`/shop?category=${t.name}`} className={`tile ${t.cls}`}>
              <div>
                <h3>{t.name}</h3>
                <p>{t.note}</p>
              </div>
              <span>Shop now →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="wrap section">
        <div className="sec-head">
          <span className="eyebrow">Our selection</span>
          <h2>Featured pieces</h2>
        </div>
        {loading ? (
          <p className="center">Loading...</p>
        ) : products.length === 0 ? (
          <p className="center">No featured products yet. Add some from the Admin page.</p>
        ) : (
          <div className="grid">
            {products.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        )}
        <div className="center-btn">
          <Link to="/shop" className="btn line">View all products</Link>
        </div>
      </section>

      {/* PERKS */}
      <section className="perks">
        <div className="wrap perks-grid">
          {PERKS.map(([title, text]) => (
            <div key={title}>
              <i className="perk-line"></i>
              <h4>{title}</h4>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="wrap section">
        <div className="cta">
          <h2>Create your account</h2>
          <p>Follow your orders and order faster next time.</p>
          <Link to="/login?mode=signup" className="btn gold">Join {STORE_NAME}</Link>
        </div>
      </section>
    </>
  )
}