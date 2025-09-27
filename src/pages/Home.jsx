import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import api from '../api/api'
import { AuthContext } from '../context/AuthContext'

const DEFAULT_POPUP_DURATION = 2000

const featuredProducts = [
  {
    id: 'auriculares-pro-x',
    name: 'Auriculares Pro X',
    description: 'Audio envolvente con cancelación activa de ruido.',
    price: 149.99,
    imageUrl:
      'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'smartwatch-fit',
    name: 'Smartwatch Fit',
    description: 'Monitorea tu salud con estilo y batería para todo el día.',
    price: 199.99,
    imageUrl:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'laptop-ultra',
    name: 'Laptop Ultra 14"',
    description: 'Ligera, potente y lista para cualquier proyecto.',
    price: 1199,
    imageUrl:
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'camara-vlog',
    name: 'Cámara Vlog 4K',
    description: 'Captura videos con estabilización avanzada y pantalla abatible.',
    price: 749,
    imageUrl:
      'https://images.unsplash.com/photo-1519183071298-a2962be90b8e?auto=format&fit=crop&w=800&q=80',
  },
]

export default function Home(){
  const navigate = useNavigate()
  const location = useLocation()
  const locationState = typeof location.state === 'object' && location.state !== null ? location.state : null
  const popupMessageFromState = typeof locationState?.popupMessage === 'string' ? locationState.popupMessage : ''
  const welcomeMessage = typeof locationState?.welcomeMessage === 'string' ? locationState.welcomeMessage : ''
  const popupMessage = popupMessageFromState || welcomeMessage
  const popupDurationRaw = locationState?.popupDuration
  const popupDuration = Number.isFinite(popupDurationRaw) && popupDurationRaw > 0 ? popupDurationRaw : DEFAULT_POPUP_DURATION
  const [showPopup, setShowPopup] = useState(false)
  const timeoutRef = useRef()
  const auth = useContext(AuthContext)
  const [searchTerm, setSearchTerm] = useState('')
  const [quantities, setQuantities] = useState({})
  const [addingId, setAddingId] = useState(null)
  const user = auth?.user ?? null

  const filteredProducts = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase()
    if (!normalizedTerm) return featuredProducts

    return featuredProducts.filter(product => {
      const name = product.name?.toLowerCase() ?? ''
      const description = product.description?.toLowerCase() ?? ''
      return name.includes(normalizedTerm) || description.includes(normalizedTerm)
    })
  }, [searchTerm])

  useEffect(() => {
    if (!popupMessage) {
      setShowPopup(false)
      return
    }

    setShowPopup(true)

    timeoutRef.current = window.setTimeout(() => {
      setShowPopup(false)
      navigate('.', { replace: true, state: null })
    }, popupDuration)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = undefined
      }
    }
  }, [popupMessage, popupDuration, navigate])

  const clearPopupState = () => {
    navigate('.', { replace: true, state: null })
  }

  const handleClose = () => {
    setShowPopup(false)
    clearPopupState()
  }

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
      {showPopup && popupMessage && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40">
          <div className="max-w-sm rounded-lg bg-white p-6 text-center shadow-lg">
            <p className="mb-4 text-gray-800">{popupMessage}</p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Cerrar
              </button>
              {!user && (
                <button
                  type="button"
                  onClick={() => {
                    setShowPopup(false)
                    clearPopupState()
                    navigate('/login')
                  }}
                  className="rounded border border-blue-600 px-4 py-2 text-blue-600 hover:bg-blue-50"
                >
                  Ir al inicio de sesión
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <header className="mb-6 rounded bg-white p-6 shadow">
        <h1 className="text-3xl font-bold">Welcome to the store</h1>
        <p className="mt-2 text-gray-600">Shop the best deals</p>
        {!user && (
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/login"
              className="rounded bg-blue-600 px-5 py-2 text-white shadow hover:bg-blue-700"
            >
              Iniciar sesión
            </Link>
            <Link
              to="/register"
              className="rounded border border-blue-600 px-5 py-2 text-blue-600 hover:bg-blue-50"
            >
              Crear cuenta
            </Link>
          </div>
        )}
      </header>

      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Productos destacados</h2>
            <p className="text-sm text-gray-600">Descubre nuestras recomendaciones más populares.</p>
          </div>
          <div className="w-full sm:w-64">
            <label className="block text-sm font-medium text-gray-700" htmlFor="search-products">
              Buscar productos
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                id="search-products"
                type="search"
                value={searchTerm}
                onChange={event => setSearchTerm(event.target.value)}
                placeholder="Auriculares, smartwatch, laptop..."
                className="w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map(product => (
            <article key={product.id} className="flex flex-col overflow-hidden rounded-lg bg-white shadow transition hover:-translate-y-0.5 hover:shadow-lg">
              {product.imageUrl && (
                <img src={product.imageUrl} alt={product.name} className="h-48 w-full object-cover" loading="lazy" />
              )}
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                  <p className="mt-1 text-sm text-gray-600">{product.description}</p>
                </div>
                <div className="mt-auto space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-blue-600">${product.price}</span>
                    <Link to={`/products/${product.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-700">
                      Ver producto
                    </Link>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <label className="flex items-center justify-between gap-2 text-sm text-gray-700">
                      Cantidad:
                      <input
                        type="number"
                        min="1"
                        className="w-20 rounded border border-gray-300 px-2 py-1"
                        value={getQuantityFor(product.id) ?? 1}
                        onChange={event => handleQuantityChange(product.id, event.target.value)}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => addToCart(product.id)}
                      disabled={addingId === product.id}
                      className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {addingId === product.id ? 'Agregando…' : 'Agregar al carrito'}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="rounded border border-blue-200 bg-blue-50 p-4 text-blue-700">
            No encontramos resultados para "{searchTerm}". Intenta con otro término o revisa todos nuestros productos.
          </div>
        )}

        <div className="text-center">
          <Link
            to="/products"
            className="inline-flex items-center justify-center rounded border border-blue-600 px-5 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
          >
            Ver todos los productos
          </Link>
        </div>
      </section>
    </div>
  )
}
