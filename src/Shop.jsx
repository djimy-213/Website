import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from './supabaseClient'
import ProductCard from './ProductCard'
import { CATEGORIES } from './config'

export default function Shop() {
  const [params, setParams] = useSearchParams()
  const category = params.get('category') || 'All'
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('new')

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setProducts(data || [])
        setLoading(false)
      })
  }, [])

  const list = useMemo(() => {
    let l = products.filter(
      (p) =>
        (category === 'All' || p.category === category) &&
        p.name.toLowerCase().includes(search.toLowerCase())
    )
    if (sort === 'low') l = [...l].sort((a, b) => a.price - b.price)
    if (sort === 'high') l = [...l].sort((a, b) => b.price - a.price)
    return l
  }, [products, category, search, sort])

  const pick = (c) => (c === 'All' ? setParams({}) : setParams({ category: c }))

  return (
    <div className="wrap section">
      <div className="sec-head left">
        <span className="eyebrow">Collection</span>
        <h1>{category === 'All' ? 'All products' : category}</h1>
      </div>

      <div className="chips">
        {['All', ...CATEGORIES].map((c) => (
          <button key={c} className={`chip ${category === c ? 'on' : ''}`} onClick={() => pick(c)}>
            {c}
          </button>
        ))}
      </div>

      <div className="toolbar">
        <input
          placeholder="Search a product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="new">Newest</option>
          <option value="low">Price: low to high</option>
          <option value="high">Price: high to low</option>
        </select>
      </div>

      {loading ? (
        <p className="center">Loading...</p>
      ) : list.length === 0 ? (
        <p className="center">No products found.</p>
      ) : (
        <div className="grid">
          {list.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </div>
  )
}