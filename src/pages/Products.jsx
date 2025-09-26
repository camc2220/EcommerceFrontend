import { useEffect, useState } from 'react'
import api from '../api/api'
import { Link } from 'react-router-dom'

const extractProducts = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.products)) return payload.products
  if (Array.isArray(payload?.data)) return payload.data
  return null
}

export default function Products(){
  const [products, setProducts] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products')
        const normalizedProducts = extractProducts(res.data)
        if (!normalizedProducts) {
          console.error('Formato inesperado de productos', res.data)
          throw new Error('Formato inesperado de productos. Intenta nuevamente más tarde.')
        }
        setProducts(normalizedProducts)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Products</h2>
      {loading && <div>Cargando productos...</div>}
      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}
      {!loading && !error && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map(p => {
            const imageUrl = p.imageUrl ?? p.image_url

            return (
              <div key={p.id} className="space-y-2 overflow-hidden rounded bg-white p-4 shadow">
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt={p.name}
                    className="h-40 w-full rounded object-cover"
                  />
                )}
                <h3 className="font-bold">{p.name}</h3>
                <p className="text-sm text-gray-600">{p.description}</p>
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-lg font-semibold">${p.price}</div>
                  <Link to={`/products/${p.id}`} className="text-sm text-blue-600">
                    View
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
