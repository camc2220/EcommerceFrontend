import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/api'

export default function Cart(){
  const [items, setItems] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/cart')
      .then(res => setItems(res.data))
      .catch(err => {
        console.error(err)
        if (err.response && err.response.status === 401) navigate('/login')
      })
  }, [])

  const checkout = async () => {
    try {
      await api.post('/cart/checkout')
      alert('Order created')
      navigate('/invoices' || '/')
    } catch (err) {
      alert('Checkout failed')
    }
  }

  if (!items.length) return <div>No items in cart.</div>

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Your Cart</h2>
      <div className="space-y-4">
        {items.map(it => (
          <div key={it.id} className="bg-white p-4 rounded shadow flex justify-between">
            <div>
              <div className="font-semibold">{it.productName}</div>
              <div className="text-sm text-gray-600">Qty: {it.quantity}</div>
            </div>
            <div className="text-lg font-semibold">${it.price * it.quantity}</div>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <button onClick={checkout} className="px-4 py-2 bg-blue-600 text-white rounded">Checkout</button>
      </div>
    </div>
  )
}
