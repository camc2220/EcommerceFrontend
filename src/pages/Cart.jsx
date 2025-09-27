import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

    const productId =
      raw?.productId ??
      raw?.product_id ??
      product?.id ??
      raw?.id

    const id =
      raw?.id ??
      raw?.cartItemId ??
      raw?.cart_item_id ??
      productId ??
      `${index}`

    return {
      id,
      productName,
      quantity: safeQuantity,
      unitPrice: safeUnitPrice,
      totalPrice: computedTotal,
      imageUrl,
      productId,
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
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [removingId, setRemovingId] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const [quantityDrafts, setQuantityDrafts] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    api
      .get('/cart')
      .then(res => {
        const payload = res?.data
        if (Array.isArray(payload)) {
          const normalized = normalizeCartItems(payload)
          setItems(normalized)
          setQuantityDrafts(
            normalized.reduce((acc, item) => {
              acc[item.id] = item.quantity
              return acc
            }, {}),
          )
        } else if (payload && Array.isArray(payload.data)) {
          const normalized = normalizeCartItems(payload.data)
          setItems(normalized)
          setQuantityDrafts(
            normalized.reduce((acc, item) => {
              acc[item.id] = item.quantity
              return acc
            }, {}),
          )
        } else if (payload && Array.isArray(payload.items)) {
          const normalized = normalizeCartItems(payload.items)
          setItems(normalized)
          setQuantityDrafts(
            normalized.reduce((acc, item) => {
              acc[item.id] = item.quantity
              return acc
            }, {}),
          )
        } else {
          console.error('Formato inesperado del carrito', payload)
          setItems([])
          setQuantityDrafts({})
        }
      })
      .catch(err => {
        console.error(err)
        if (err.response && err.response.status === 401) navigate('/login')
      })
  }, [])

  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + (item.quantity ?? 0), 0),
    [items],
  )

  const totalAmount = useMemo(
    () =>
      items.reduce((sum, item) => {
        const lineTotal = Number.isFinite(item.totalPrice)
          ? item.totalPrice
          : item.unitPrice * item.quantity
        return sum + (Number.isFinite(lineTotal) ? lineTotal : 0)
      }, 0),
    [items],
  )

  const removeItem = async item => {
    if (!item) return

    const productId = item.productId ?? item.id
    if (!productId) {
      console.error('El producto no tiene un identificador válido', item)
      alert('No se pudo remover el artículo. Intenta nuevamente más tarde.')
      return
    }

    setRemovingId(item.id)

    try {
      await api.delete(`/cart/item/${productId}`)
      setItems(prev => prev.filter(it => it.id !== item.id))
      setQuantityDrafts(prev => {
        const next = { ...prev }
        delete next[item.id]
        return next
      })
    } catch (err) {
      console.error('No se pudo remover el artículo del carrito', err)
      alert('No se pudo remover el artículo. Intenta nuevamente más tarde.')
    } finally {
      setRemovingId(null)
    }
  }

  const checkout = async () => {
    if (!items.length || checkoutLoading) return

    setCheckoutLoading(true)

    try {
      await api.post('/cart/checkout', {
        items: items.map(item => ({
          cartItemId: item.id,
          productId: item.productId ?? item.id,
          quantity: item.quantity,
        })),
        total: totalAmount,
      })

      alert('Orden creada correctamente')
      setItems([])
      navigate('/checkout')
    } catch (err) {
      console.error('Checkout failed', err)
      alert('No se pudo completar el checkout. Intenta nuevamente.')
    } finally {
      setCheckoutLoading(false)
    }
  }

  const sanitizeQuantity = useCallback(value => {
    if (value === '') return 1
    const parsed = Number.parseInt(value, 10)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
  }, [])

  const handleQuantityDraftChange = (item, rawValue) => {
    const id = item.id

    if (rawValue === '') {
      setQuantityDrafts(prev => ({ ...prev, [id]: '' }))
      return
    }

    const safeValue = sanitizeQuantity(rawValue)
    setQuantityDrafts(prev => ({ ...prev, [id]: safeValue }))
  }

  const updateQuantity = useCallback(
    async (item, nextQuantity) => {
      if (!item) return

      const cartItemId = item.id
      if (!cartItemId) {
        console.error('El artículo del carrito no tiene un identificador válido', item)
        alert('No se pudo actualizar la cantidad. Intenta nuevamente más tarde.')
        return
      }

      const draftValue = nextQuantity ?? quantityDrafts[cartItemId]
      const quantity = sanitizeQuantity(draftValue)

      if (quantity === item.quantity || updatingId === cartItemId) {
        setQuantityDrafts(prev => ({ ...prev, [cartItemId]: quantity }))
        return
      }

      setUpdatingId(cartItemId)

      try {
        await api.patch(`/cart/items/${cartItemId}/quantity`, { quantity })
        setItems(prev =>
          prev.map(it =>
            it.id === cartItemId
              ? {
                  ...it,
                  quantity,
                  totalPrice: Number.isFinite(it.unitPrice)
                    ? it.unitPrice * quantity
                    : quantity * (it.totalPrice / (item.quantity || 1) || 0),
                }
              : it,
          ),
        )
        setQuantityDrafts(prev => ({ ...prev, [cartItemId]: quantity }))
      } catch (err) {
        console.error('No se pudo actualizar la cantidad del carrito', err)
        alert('No se pudo actualizar la cantidad. Intenta nuevamente más tarde.')
        setQuantityDrafts(prev => ({ ...prev, [cartItemId]: item.quantity }))
      } finally {
        setUpdatingId(null)
      }
    },
    [quantityDrafts, sanitizeQuantity, updatingId],
  )

  useEffect(() => {
    if (!items.length || updatingId) return

    const pendingItem = items.find(it => {
      const draft = quantityDrafts[it.id]
      if (draft === '' || draft === undefined || draft === null) return false
      const safeDraft = sanitizeQuantity(draft)
      return safeDraft !== it.quantity
    })

    if (pendingItem) {
      const draft = quantityDrafts[pendingItem.id]
      updateQuantity(pendingItem, draft)
    }
  }, [items, quantityDrafts, updatingId, sanitizeQuantity, updateQuantity])

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
                <div className="text-sm text-gray-600">Cantidad:</div>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    className="w-20 rounded border border-gray-300 px-2 py-1 text-sm"
                    value={quantityDrafts[it.id] ?? it.quantity ?? 1}
                    onChange={event => handleQuantityDraftChange(it, event.target.value)}
                    onBlur={() => {
                      const draftValue = quantityDrafts[it.id]
                      if (draftValue === '' || draftValue === undefined || draftValue === null) {
                        setQuantityDrafts(prev => ({ ...prev, [it.id]: it.quantity }))
                      }
                    }}
                    disabled={updatingId === it.id || removingId === it.id}
                  />
                </div>
                <div className="text-sm text-gray-500">Precio unitario: {formatCurrency(it.unitPrice)}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-lg font-semibold">{formatCurrency(it.totalPrice)}</div>
              <button
                onClick={() => removeItem(it)}
                disabled={removingId === it.id}
                className={[
                  'rounded border border-red-500 px-3 py-1 text-sm font-medium text-red-600 transition hover:bg-red-50',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                ].join(' ')}
              >
                {removingId === it.id ? 'Removiendo…' : 'Remover'}
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 space-y-4">
        <div className="rounded bg-gray-100 p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Total de artículos</span>
            <span>{totalQuantity}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>
        </div>
        <button
          onClick={checkout}
          disabled={checkoutLoading}
          className={[
            'rounded bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700',
            'disabled:cursor-not-allowed disabled:opacity-60',
          ].join(' ')}
        >
          {checkoutLoading ? 'Procesando…' : 'Checkout'}
        </button>
      </div>
    </div>
  )
}
