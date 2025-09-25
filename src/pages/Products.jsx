import { useEffect, useState } from 'react'
import api from '../api/api'
import { Link } from 'react-router-dom'

export default function Products(){
  const [products, setProducts] = useState([])

  useEffect(() => {
    api
      .get('/products')
      .then(res => {
        const payload = res?.data
        if (Array.isArray(payload)) {
          setProducts(payload)
        } else if (payload && Array.isArray(payload.data)) {
          setProducts(payload.data)
        } else if (payload && Array.isArray(payload.items)) {
          setProducts(payload.items)
        } else {
          console.error('Formato inesperado de productos', payload)
          setProducts([])
        }
      })
      .catch(err => console.error(err))
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(p => (
          <div key={p.id} className="bg-white p-4 rounded shadow">
            <h3 className="font-bold">{p.name}</h3>
            <p className="text-sm text-gray-600">{p.description}</p>
            <div className="mt-2 flex items-center justify-between">
              <div className="text-lg font-semibold">${p.price}</div>
              <Link to={`/products/${p.id}`} className="text-sm text-blue-600">View</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
