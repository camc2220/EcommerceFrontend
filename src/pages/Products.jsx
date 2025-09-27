import { useEffect, useState } from 'react'
import api from '../api/api'
import { Link, useNavigate } from 'react-router-dom'

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
  const [quantities, setQuantities] = useState({})
  const [addingId, setAddingId] = useState(null)
  const navigate = useNavigate()

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

  const getQuantityFor = productId => {
    const value = quantities[productId]
    if (value === '') return ''
    if (value === undefined || value === null) return 1

    const parsed = Number.parseInt(value, 10)
    if (!Number.isFinite(parsed) || parsed <= 0) return 1
    return parsed
  }

  const handleQuantityChange = (productId, value) => {
    if (value === '') {
      setQuantities(prev => ({ ...prev, [productId]: '' }))
      return
    }

    const parsed = Number.parseInt(value, 10)
    const safeValue = Number.isFinite(parsed) && parsed > 0 ? parsed : 1

    setQuantities(prev => ({ ...prev, [productId]: safeValue }))
  }

  const addToCart = async productId => {
    if (!productId || addingId) return

    const quantityRaw = quantities[productId]
    const parsed = Number.parseInt(quantityRaw, 10)
    const quantity = Number.isFinite(parsed) && parsed > 0 ? parsed : 1

    setAddingId(productId)

    try {
      await api.post('/cart/add', { productId, quantity })
      alert('Producto agregado al carrito')
      setQuantities(prev => ({ ...prev, [productId]: 1 }))
    } catch (err) {
      if (err.response?.status === 401) {
        alert('Debes iniciar sesión para agregar productos al carrito')
        navigate('/login')
      } else {
        console.error('No se pudo agregar el producto al carrito', err)
        alert('No se pudo agregar el producto. Intenta nuevamente más tarde.')
      }
    } finally {
      setAddingId(null)
    }
  }

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
                <div className="mt-2 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold">${p.price}</div>
                    <Link to={`/products/${p.id}`} className="text-sm text-blue-600">
                      View
                    </Link>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      Cantidad:
                      <input
                        type="number"
                        min="1"
                        className="w-20 rounded border border-gray-300 px-2 py-1"
                        value={getQuantityFor(p.id) ?? 1}
                        onChange={e => handleQuantityChange(p.id, e.target.value)}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => addToCart(p.id)}
                      disabled={addingId === p.id}
                      className="rounded bg-green-600 px-3 py-1 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {addingId === p.id ? 'Agregando…' : 'Agregar al carrito'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
