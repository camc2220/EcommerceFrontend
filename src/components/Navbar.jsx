import { Link } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

export default function Navbar(){
  const { user, logout } = useContext(AuthContext)
  return (
    <nav className="bg-white shadow">
      <div className="container flex items-center justify-between py-4">
        <Link to="/" className="text-2xl font-bold">Ecommerce</Link>
        <div className="flex items-center gap-4">
          <Link to="/products" className="hover:underline">Products</Link>
          <Link to="/cart" className="hover:underline">Cart</Link>
          {user ? (
            <button onClick={logout} className="px-3 py-1 bg-red-500 text-white rounded">Logout</button>
          ) : (
            <>
              <Link to="/login" className="px-3 py-1 bg-blue-500 text-white rounded">Login</Link>
              <Link to="/register" className="px-3 py-1 border rounded">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
