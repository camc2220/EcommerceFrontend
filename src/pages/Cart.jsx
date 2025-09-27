import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/api'

const normalizeCartItems = list => {
  if (!Array.isArray(list)) return []

  return list.map((raw, index) => {
    const product = raw?.product || raw?.Product || raw?.productDto || raw?.item || {}

    const productName =
      raw?.productName ||
      product?.name ||
      product?.title ||
      product?.productName ||
      product?.nombre ||
      'Producto'

    const quantityRaw = raw?.quantity ?? raw?.qty ?? raw?.amount ?? raw?.units
    const quantity = Number.parseInt(quantityRaw, 10)
    const safeQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 1

    const priceSource =
      raw?.price ??
      raw?.unitPrice ??
      raw?.unit_price ??
      raw?.productPrice ??
      product?.price ??
      product?.unitPrice ??
      product?.unit_price
    const unitPrice = Number(priceSource)
    const safeUnitPrice = Number.isFinite(unitPrice) && unitPrice >= 0 ? unitPrice : 0

    const totalSource = raw?.total ?? raw?.totalPrice ?? raw?.total_price
    const totalPrice = Number(totalSource)
    const computedTotal = Number.isFinite(totalPrice) && totalPrice >= 0 ? totalPrice : safeUnitPrice * safeQuantity

    const imageUrl =
      raw?.imageUrl ||
      raw?.image_url ||
      product?.imageUrl ||
      product?.image_url ||
      product?.image ||
      product?.photoUrl ||
      product?.photo_url ||
      ''

    const id =
      raw?.id ??
      raw?.cartItemId ??
      raw?.cart_item_id ??
      raw?.productId ??
      product?.id ??
      `${index}`

    return {
      id,
      productName,
      quantity: safeQuantity,
      unitPrice: safeUnitPrice,
      totalPrice: computedTotal,
      imageUrl,
    }
  })
}

const formatCurrency = value => {
  if (!Number.isFinite(value)) return '—'
  return value.toLocaleString('es-PE', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export default function Cart(){
  const [items, setItems] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    api
      .get('/cart')
      .then(res => {
        const payload = res?.data
        if (Array.isArray(payload)) {
          setItems(normalizeCartItems(payload))
        } else if (payload && Array.isArray(payload.data)) {
          setItems(normalizeCartItems(payload.data))
        } else if (payload && Array.isArray(payload.items)) {
          setItems(normalizeCartItems(payload.items))
        } else {
          console.error('Formato inesperado del carrito', payload)
          setItems([])
        }
      })
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
          <div key={it.id} className="bg-white p-4 rounded shadow flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {it.imageUrl ? (
                <img
                  src={it.imageUrl}
                  alt={it.productName}
                  className="h-16 w-16 rounded object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded bg-gray-100 text-sm text-gray-400">
                  Sin imagen
                </div>
              )}
              <div>
                <div className="font-semibold">{it.productName}</div>
                <div className="text-sm text-gray-600">Cantidad: {it.quantity}</div>
                <div className="text-sm text-gray-500">Precio unitario: {formatCurrency(it.unitPrice)}</div>
              </div>
            </div>
            <div className="text-lg font-semibold">{formatCurrency(it.totalPrice)}</div>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <button onClick={checkout} className="px-4 py-2 bg-blue-600 text-white rounded">Checkout</button>
      </div>
    </div>
  )
}
