import { createContext, useState, useEffect } from 'react'
import api from '../api/api'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) setUser({ token })
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/Auth/login', { email, password })
    localStorage.setItem('token', res.data.token)
    setUser({ token: res.data.token })
    return res.data
  }

  const register = async (email, password, fullName) => {
    const res = await api.post('/Auth/register', { email, password, fullName })
    localStorage.setItem('token', res.data.token)
    setUser({ token: res.data.token })
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}
