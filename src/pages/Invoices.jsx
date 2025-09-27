import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "https://ecommercebackend-production-a5a1.up.railway.app";

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/Invoices`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // token guardado tras login
          },
        });
        setInvoices(res.data);
      } catch (err) {
        console.error(err);
        setError("Error al cargar facturas.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  if (loading) return <p className="text-center mt-10">Cargando facturas...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Facturas</h1>
      {invoices.length === 0 ? (
        <p>No hay facturas disponibles.</p>
      ) : (
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">#</th>
              <th className="px-4 py-2 text-left">Usuario</th>
              <th className="px-4 py-2 text-left">Total</th>
              <th className="px-4 py-2 text-left">Estado</th>
              <th className="px-4 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv, i) => (
              <tr key={inv.id} className="border-b">
                <td className="px-4 py-2">{inv.invoiceNumber}</td>
                <td className="px-4 py-2">{inv.userId}</td>
                <td className="px-4 py-2">${inv.total}</td>
                <td className="px-4 py-2">{inv.status}</td>
                <td className="px-4 py-2">
                  <Link
                    to={`/invoices/${inv.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Ver detalle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
