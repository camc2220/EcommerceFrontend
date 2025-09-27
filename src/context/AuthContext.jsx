import { createContext, useState, useEffect, useMemo, useCallback } from 'react'
import api from '../api/api'

const missingProviderError = (methodName) => () => {
  throw new Error(`AuthProvider is missing. Tried to call ${methodName} without a provider.`)
}

export const AuthContext = createContext({
  user: null,
  login: missingProviderError('login'),
  logout: missingProviderError('logout'),
  register: missingProviderError('register'),
})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) setUser({ token })
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await api.post('/Auth/login', { email, password })
    localStorage.setItem('token', res.data.token)
    setUser({ token: res.data.token })
    return res.data
  }, [])

  const register = useCallback(async (email, password, fullName) => {
    const res = await api.post('/Auth/register', { email, password, fullName })
    localStorage.setItem('token', res.data.token)
    setUser({ token: res.data.token })
    return res.data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, login, logout, register }), [user, login, logout, register])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
