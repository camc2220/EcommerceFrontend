import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const normalizeCartItems = (payload) => {
  let list = [];

  if (Array.isArray(payload)) {
    list = payload;
  } else if (payload && Array.isArray(payload.data)) {
    list = payload.data;
  } else if (payload && Array.isArray(payload.items)) {
    list = payload.items;
  } else if (payload && Array.isArray(payload.cartItems)) {
    list = payload.cartItems;
  }

  return list.map((raw, index) => {
    const product =
      raw?.product ||
      raw?.Product ||
      raw?.productDto ||
      raw?.item ||
      raw?.productDetails ||
      {};

    const name =
      raw?.productName ||
      product?.name ||
      product?.title ||
      product?.productName ||
      product?.nombre ||
      "Producto";

    const quantityRaw = raw?.quantity ?? raw?.qty ?? raw?.amount ?? raw?.units;
    const parsedQuantity = Number.parseInt(quantityRaw, 10);
    const quantity = Number.isFinite(parsedQuantity) && parsedQuantity > 0 ? parsedQuantity : 1;

    const priceSource =
      raw?.price ??
      raw?.unitPrice ??
      raw?.unit_price ??
      raw?.productPrice ??
      product?.price ??
      product?.unitPrice ??
      product?.unit_price;
    const parsedPrice = Number(priceSource);
    const unitPrice = Number.isFinite(parsedPrice) && parsedPrice >= 0 ? parsedPrice : 0;

    const totalSource = raw?.total ?? raw?.totalPrice ?? raw?.total_price;
    const parsedTotal = Number(totalSource);
    const total =
      Number.isFinite(parsedTotal) && parsedTotal >= 0 ? parsedTotal : unitPrice * quantity;

    const rawProductId =
      raw?.productId ??
      raw?.product_id ??
      product?.id ??
      product?.productId ??
      product?.product_id;
    const productId =
      typeof rawProductId === "string" || typeof rawProductId === "number"
        ? rawProductId
        : null;

    const rawCartItemId = raw?.cartItemId ?? raw?.cart_item_id;
    const rawId = raw?.id ?? rawCartItemId ?? productId;
    const id = typeof rawId === "string" || typeof rawId === "number" ? rawId : `${index}`;

    return {
      id,
      name,
      quantity,
      unitPrice,
      total,
      productId,
      cartItemId:
        typeof rawCartItemId === "string" || typeof rawCartItemId === "number"
          ? rawCartItemId
          : undefined,
    };
  });
};

export default function Checkout() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem("token"); // token JWT guardado tras login
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/Cart`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCart(normalizeCartItems(res.data));
      } catch (err) {
        setError("No se pudo cargar el carrito");
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + (Number.isFinite(item.total) ? item.total : item.unitPrice * item.quantity),
        0
      ),
    [cart]
  );
  const total = subtotal;

  const handleCheckout = async () => {
    if (!cart.length) {
      alert("No hay artículos en el carrito para facturar.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const payload = {
        billingAddress: "Calle Falsa 123",
        items: cart.map((item) => {
          const safeUnitPrice = Number.isFinite(item.unitPrice) ? item.unitPrice : 0;
          const safeQuantity = Number.isFinite(item.quantity) && item.quantity > 0 ? item.quantity : 1;
          const safeLineTotal = Number.isFinite(item.total)
            ? item.total
            : safeUnitPrice * safeQuantity;

          return {
            cartItemId: item.cartItemId ?? item.id,
            productId: item.productId ?? item.id,
            description: item.name,
            quantity: safeQuantity,
            unitPrice: safeUnitPrice,
            lineTotal: safeLineTotal,
          };
        }),
        subtotal,
        total,
      };
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/Invoices`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Factura generada con éxito ✅");
      navigate("/invoices");
    } catch (err) {
      alert("Error al generar la factura ❌");
    }
  };

  if (loading) return <p>Cargando carrito...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Resumen de la Orden</h2>

      {cart.length ? (
        <table className="w-full text-left mb-6">
          <thead>
            <tr className="border-b">
              <th className="p-2">Producto</th>
              <th className="p-2">Cantidad</th>
              <th className="p-2">Precio</th>
              <th className="p-2">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {cart.map((item) => {
              const safeUnitPrice = Number.isFinite(item.unitPrice) ? item.unitPrice : 0;
              const safeQuantity = Number.isFinite(item.quantity) && item.quantity > 0 ? item.quantity : 1;
              const safeLineTotal = Number.isFinite(item.total)
                ? item.total
                : safeUnitPrice * safeQuantity;

              return (
                <tr key={item.id} className="border-b">
                  <td className="p-2">{item.name}</td>
                  <td className="p-2">{safeQuantity}</td>
                  <td className="p-2">${safeUnitPrice.toFixed(2)}</td>
                  <td className="p-2">${safeLineTotal.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p className="mb-6 text-center text-gray-500">No hay productos en el carrito.</p>
      )}

      <div className="text-right space-y-2">
        <p>Subtotal: <strong>${subtotal.toFixed(2)}</strong></p>
        <p className="text-xl">Total: <strong>${total.toFixed(2)}</strong></p>
      </div>

      <button
        onClick={handleCheckout}
        disabled={!cart.length}
        className="mt-6 w-full rounded-lg bg-blue-600 p-3 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Generar Factura
      </button>
    </div>
  );
}
