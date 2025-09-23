import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  const handle = async (e) => {
    e.preventDefault()
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      alert('Login failed: ' + (err.response?.data?.message || err.message))
    }
  }

  return (
    <div className="flex justify-center mt-20">
      <form onSubmit={handle} className="flex flex-col gap-4 p-6 border rounded w-96 bg-white">
        <input className="p-2 border rounded" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" required />
        <input className="p-2 border rounded" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" required />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Login</button>
      </form>
    </div>
  )
}
