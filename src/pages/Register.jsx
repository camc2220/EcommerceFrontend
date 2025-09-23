import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export default function Register(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const { register } = useContext(AuthContext)
  const navigate = useNavigate()

  const handle = async (e) => {
    e.preventDefault()
    try {
      await register(email, password, fullName)
      navigate('/')
    } catch (err) {
      alert('Register failed')
    }
  }

  return (
    <div className="flex justify-center mt-20">
      <form onSubmit={handle} className="flex flex-col gap-4 p-6 border rounded w-96 bg-white">
        <input className="p-2 border rounded" value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Full name" />
        <input className="p-2 border rounded" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" required />
        <input className="p-2 border rounded" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" required />
        <button className="bg-green-600 text-white px-4 py-2 rounded">Register</button>
      </form>
    </div>
  )
}
