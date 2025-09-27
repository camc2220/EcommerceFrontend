import { useContext, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

const DEFAULT_POPUP_DURATION = 2000

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
  const user = auth?.user ?? null

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

      <section>
        <h2 className="text-xl font-semibold mb-4">Featured</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link to="/products" className="rounded bg-white p-4 shadow hover:shadow-md">Browse products →</Link>
        </div>
      </section>
    </div>
  )
}
