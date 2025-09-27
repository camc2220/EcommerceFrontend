import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
        setCart(res.data);
      } catch (err) {
        setError("No se pudo cargar el carrito");
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
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
              <td className="p-2">{item.product.name}</td>
              <td className="p-2">{item.quantity}</td>
              <td className="p-2">${item.product.price.toFixed(2)}</td>
              <td className="p-2">
                ${(item.product.price * item.quantity).toFixed(2)}
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
