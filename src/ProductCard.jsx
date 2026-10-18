import { Link } from 'react-router-dom'
import { money } from './config'

export default function ProductCard({ p }) {
  return (
    <Link to={`/product/${p.id}`} className="pcard fade">
      <div className="pimg">
        {p.image_url ? (
          <img src={p.image_url} alt={p.name} loading="lazy" />
        ) : (
          <span className="mono">{p.name.charAt(0)}</span>
        )}
        {!p.in_stock ? (
          <em className="tag out">Sold out</em>
        ) : p.featured ? (
          <em className="tag">New</em>
        ) : null}
      </div>
      <small>{p.category}</small>
      <h3>{p.name}</h3>
      <b>{money(p.price)}</b>
    </Link>
  )
}