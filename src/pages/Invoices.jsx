import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "https://ecommercebackend-production-a5a1.up.railway.app";

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const resolveUserEmail = invoice => {
    if (!invoice) return "—";

    const coalesceString = (...values) => {
      for (const value of values) {
        if (typeof value === "string") {
          const trimmed = value.trim();
          if (trimmed) return trimmed;
        }
      }
      return null;
    };

    const userLike =
      invoice.user ||
      invoice.User ||
      invoice.customer ||
      invoice.Customer ||
      invoice.usuario ||
      invoice.Usuario ||
      {};

    const nameCandidate = coalesceString(
      invoice.userName,
      invoice.username,
      invoice.fullName,
      invoice.full_name,
      invoice.nombreCompleto,
      invoice.nombre,
      invoice.name,
      userLike.userName,
      userLike.username,
      userLike.fullName,
      userLike.full_name,
      userLike.nombreCompleto,
      userLike.nombre,
      userLike.name,
    );

    if (nameCandidate) return nameCandidate;

    const firstName = coalesceString(
      invoice.firstName,
      invoice.first_name,
      invoice.nombre,
      userLike.firstName,
      userLike.first_name,
      userLike.nombre,
    );
    const lastName = coalesceString(
      invoice.lastName,
      invoice.last_name,
      invoice.apellido,
      userLike.lastName,
      userLike.last_name,
      userLike.apellido,
    );
    const combinedName = coalesceString(
      [firstName, lastName].filter(Boolean).join(" ") || null,
    );

    if (combinedName) return combinedName;

    const emailCandidate = coalesceString(
      invoice.userEmail,
      invoice.user_email,
      invoice.email,
      invoice.emailUsuario,
      invoice.usuarioEmail,
      userLike.email,
      userLike.mail,
      userLike.emailAddress,
      userLike.email_address,
      userLike.correo,
      userLike.correoElectronico,
      userLike.correo_electronico,
    );

    if (emailCandidate) return emailCandidate;

    return "Usuario sin información disponible";
  };

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
            {invoices.map(inv => (
              <tr key={inv.id} className="border-b">
                <td className="px-4 py-2">{inv.invoiceNumber}</td>
                <td className="px-4 py-2">{resolveUserEmail(inv)}</td>
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
