import { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export default function Register(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const { register } = useContext(AuthContext)
  const navigate = useNavigate()
  const [status, setStatus] = useState({ type: null, message: '' })

  useEffect(() => {
    if (status.type === 'success') {
      const timeout = setTimeout(() => {
        navigate('/login')
      }, 2000)

      return () => clearTimeout(timeout)
    }
  }, [status.type, navigate])

  const handle = async (e) => {
    e.preventDefault()
    setStatus({ type: null, message: '' })
    try {
      await register(email, password, fullName)
      setFullName('')
      setEmail('')
      setPassword('')
      setStatus({ type: 'success', message: 'Registro exitoso. Redirigiendo al inicio de sesión...' })
    } catch (err) {
      setStatus({ type: 'error', message: 'No se pudo completar el registro. Intenta nuevamente.' })
    }
  }

  if (status.type === 'success') {
    return (
      <div className="flex justify-center mt-20">
        <div className="flex flex-col gap-4 p-6 border rounded w-96 bg-white text-center">
          <h2 className="text-2xl font-semibold text-green-700">¡Registro exitoso!</h2>
          <p>{status.message}</p>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Ir al inicio de sesión
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-center mt-20">
      <form onSubmit={handle} className="flex flex-col gap-4 p-6 border rounded w-96 bg-white">
        <input className="p-2 border rounded" value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Full name" />
        <input className="p-2 border rounded" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" required />
        <input className="p-2 border rounded" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" required />
        {status.type === 'error' && (
          <p className="text-sm text-red-600">{status.message}</p>
        )}
        <button className="bg-green-600 text-white px-4 py-2 rounded">Register</button>
      </form>
    </div>
  )
}
