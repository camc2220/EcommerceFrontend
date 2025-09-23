import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/api'

export default function ProductDetail(){
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(err => console.error(err))
  }, [id])

  const addToCart = async () => {
    try {
      await api.post('/cart/add', { productId: id, quantity: 1 })
      alert('Added to cart')
      navigate('/cart')
    } catch (err) {
      alert('You must be logged in to add to cart')
      navigate('/login')
    }
  }

  if (!product) return <div>Loading...</div>

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold">{product.name}</h2>
      <p className="mt-2 text-gray-700">{product.description}</p>
      <div className="mt-4 flex items-center justify-between">
        <div className="text-2xl font-semibold">${product.price}</div>
        <button onClick={addToCart} className="px-4 py-2 bg-green-600 text-white rounded">Add to cart</button>
      </div>
    </div>
  )
}
