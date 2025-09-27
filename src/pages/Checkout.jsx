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

    const rawId = raw?.id ?? raw?.cartItemId ?? raw?.cart_item_id ?? product?.id;
    const id = typeof rawId === "string" || typeof rawId === "number" ? rawId : `${index}`;

    return {
      id,
      name,
      quantity,
      unitPrice,
      total,
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
    () => cart.reduce((sum, item) => sum + (Number.isFinite(item.total) ? item.total : 0), 0),
    [cart]
  );
  const tax = subtotal * 0.18; // 18% ITBIS
  const total = subtotal + tax;

  const handleCheckout = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/Invoices`,
        {
          billingAddress: "Calle Falsa 123",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Factura generada con éxito ✅");
      navigate(`/invoices/${res.data.id}`);
    } catch (err) {
      alert("Error al generar la factura ❌");
    }
  };

  if (loading) return <p>Cargando carrito...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Resumen de la Orden</h2>

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
          {cart.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="p-2">{item.name}</td>
              <td className="p-2">{item.quantity}</td>
              <td className="p-2">${item.unitPrice.toFixed(2)}</td>
              <td className="p-2">
                ${item.total.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-right space-y-2">
        <p>Subtotal: <strong>${subtotal.toFixed(2)}</strong></p>
        <p>ITBIS (18%): <strong>${tax.toFixed(2)}</strong></p>
        <p className="text-xl">Total: <strong>${total.toFixed(2)}</strong></p>
      </div>

      <button
        onClick={handleCheckout}
        className="mt-6 w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
      >
        Generar Factura
      </button>
    </div>
  );
}
