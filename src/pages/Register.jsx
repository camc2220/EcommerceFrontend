import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export default function Register(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const { register } = useContext(AuthContext)
  const navigate = useNavigate()

  const handle = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const trimmedName = fullName.trim()
      await register(email, password, fullName)
      const welcomeMessage = `¡Bienvenido, ${fullName}!`
      setFullName('')
      setEmail('')
      setPassword('')
      navigate('/', { state: { welcomeMessage: trimmedName ? `¡Bienvenido, ${trimmedName}!` : '¡Registro exitoso!' } })
    } catch (err) {
      setError('No se pudo completar el registro. Intenta nuevamente.')
    }
  }

  return (
    <div className="flex justify-center mt-20">
      <form onSubmit={handle} className="flex flex-col gap-4 p-6 border rounded w-96 bg-white">
        <input className="p-2 border rounded" value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Full name" />
        <input className="p-2 border rounded" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" required />
        <input className="p-2 border rounded" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" required />
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        <button className="bg-green-600 text-white px-4 py-2 rounded">Register</button>
      </form>
    </div>
  )
}
