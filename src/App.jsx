import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './AuthContext'
import { CartProvider } from './CartContext'
import Layout from './Layout'
import Home from './Home'
import Shop from './Shop'
import Product from './Product'
import Cart from './Cart'
import Account from './Account'
import Admin from './Admin'
import Login from './Login'

function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <p className="center">Loading...</p>
  return user ? children : <Navigate to="/login?next=/account" replace />
}

function AdminOnly({ children }) {
  const { user, profile, loading, isAdmin } = useAuth()
  if (loading || (user && profile === undefined)) return <p className="center">Loading...</p>
  if (!user) return <Navigate to="/login?next=/admin" replace />
  return isAdmin ? children : <Navigate to="/" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="shop" element={<Shop />} />
              <Route path="product/:id" element={<Product />} />
              <Route path="cart" element={<Cart />} />
              <Route path="account" element={<Protected><Account /></Protected>} />
              <Route path="admin" element={<AdminOnly><Admin /></AdminOnly>} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}