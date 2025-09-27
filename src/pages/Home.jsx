import { useContext, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export default function Home(){
  const { user } = useContext(AuthContext)
  const location = useLocation()
  const navigate = useNavigate()
  const { state, pathname } = location
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (state?.welcomeMessage) {
      setWelcomeMessage(state.welcomeMessage)
      setIsVisible(true)
      navigate(pathname, { replace: true, state: {} })
    }
  }, [state, pathname, navigate])

  useEffect(() => {
    if (!isVisible) return

    const timeout = setTimeout(() => {
      setIsVisible(false)
    }, 5000)

    return () => clearTimeout(timeout)
  }, [isVisible])

  return (
    <div>
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

      <section>
        <h2 className="text-xl font-semibold mb-4">Featured</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link to="/products" className="p-4 bg-white rounded shadow hover:shadow-md">Browse products →</Link>
        </div>
      </section>

      {isVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="w-80 rounded-lg bg-white p-6 text-center shadow-lg">
            <h3 className="text-xl font-semibold text-green-700">{welcomeMessage}</h3>
            <p className="mt-2 text-gray-600">¡Gracias por registrarte! Disfruta de tu experiencia de compra.</p>
            <button
              type="button"
              onClick={() => setIsVisible(false)}
              className="mt-4 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
