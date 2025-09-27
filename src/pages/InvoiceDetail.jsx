import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "https://ecommercebackend-production-a5a1.up.railway.app";

export default function InvoiceDetail() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/Invoices/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setInvoice(res.data);
      } catch (err) {
        console.error(err);
        setError("Error al cargar la factura.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id]);

  if (loading) return <p className="text-center mt-10">Cargando factura...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (!invoice) return <p>No encontrada</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Factura {invoice.invoiceNumber}</h1>
      <p><strong>Total:</strong> ${invoice.total}</p>
      <p><strong>Estado:</strong> {invoice.status}</p>
      <p><strong>Dirección:</strong> {invoice.billingAddress}</p>
      <p><strong>Fecha:</strong> {new Date(invoice.createdAt).toLocaleDateString()}</p>

      <h2 className="text-xl font-semibold mt-6">Items</h2>
      {invoice.invoiceItems?.length > 0 ? (
        <ul className="list-disc ml-6 mt-2">
          {invoice.invoiceItems.map(item => (
            <li key={item.id}>
              {item.quantity} x {item.productId} @ ${item.unitPrice} = ${item.lineTotal}
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay items registrados.</p>
      )}

      <Link to="/invoices" className="mt-4 inline-block text-blue-600 hover:underline">
        ← Volver a facturas
      </Link>
    </div>
  );
}
