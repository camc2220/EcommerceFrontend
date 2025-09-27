import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";

const normalizeInvoiceItems = list => {
  if (!Array.isArray(list)) return [];

  return list.map((rawItem, index) => {
    const product =
      rawItem?.product ||
      rawItem?.Product ||
      rawItem?.productDto ||
      rawItem?.productDetail ||
      rawItem?.item ||
      {};

    const productName =
      rawItem?.productName ||
      rawItem?.product_name ||
      product?.name ||
      product?.title ||
      product?.productName ||
      product?.nombre ||
      `Producto ${rawItem?.productId ?? rawItem?.product_id ?? index + 1}`;

    const productId =
      rawItem?.productId ??
      rawItem?.product_id ??
      product?.id ??
      product?.productId ??
      rawItem?.id ??
      `item-${index}`;

    const quantityRaw =
      rawItem?.quantity ??
      rawItem?.qty ??
      rawItem?.amount ??
      rawItem?.units ??
      1;
    const quantity = Number.parseInt(quantityRaw, 10);
    const safeQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;

    const unitPriceSource =
      rawItem?.unitPrice ??
      rawItem?.unit_price ??
      rawItem?.price ??
      rawItem?.productPrice ??
      product?.price ??
      product?.unitPrice ??
      product?.unit_price ??
      0;
    const unitPrice = Number(unitPriceSource);
    const safeUnitPrice =
      Number.isFinite(unitPrice) && unitPrice >= 0 ? unitPrice : 0;

    const lineTotalSource =
      rawItem?.lineTotal ??
      rawItem?.line_total ??
      rawItem?.total ??
      rawItem?.totalPrice ??
      rawItem?.subtotal;
    const lineTotal = Number(lineTotalSource);
    const safeLineTotal =
      Number.isFinite(lineTotal) && lineTotal >= 0
        ? lineTotal
        : safeUnitPrice * safeQuantity;

    const id =
      rawItem?.id ??
      rawItem?.invoiceItemId ??
      rawItem?.invoice_item_id ??
      rawItem?.detailId ??
      rawItem?.detalleId ??
      `${productId}-${index}`;

    return {
      id,
      productId,
      productName,
      quantity: safeQuantity,
      unitPrice: safeUnitPrice,
      lineTotal: safeLineTotal,
    };
  });
};

const formatCurrency = value => {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString("es-PE", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export default function InvoiceDetail() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await api.get(`/Invoices/${id}`);
        const payload = res?.data;
        const invoiceData = payload?.data ?? payload;

        if (!invoiceData) {
          throw new Error("Factura no encontrada");
        }

        const normalizedItems =
          normalizeInvoiceItems(
            invoiceData?.invoiceItems ??
              invoiceData?.items ??
              invoiceData?.invoiceDetails ??
              invoiceData?.details,
          );

        setInvoice(invoiceData);
        setItems(normalizedItems);
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
      <p>
        <strong>Total:</strong> {formatCurrency(Number(invoice.total))}
      </p>
      <p><strong>Estado:</strong> {invoice.status}</p>
      <p><strong>Dirección:</strong> {invoice.billingAddress}</p>
      <p><strong>Fecha:</strong> {new Date(invoice.createdAt).toLocaleDateString()}</p>

      <h2 className="text-xl font-semibold mt-6">Items</h2>
      {items.length > 0 ? (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Producto
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Cantidad
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Precio unitario
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {items.map(item => (
                <tr key={item.id}>
                  <td className="px-4 py-2">
                    <div className="text-sm font-medium text-gray-900">
                      {item.productName}
                    </div>
                    <div className="text-xs text-gray-500">ID: {item.productId}</div>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">{item.quantity}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {formatCurrency(item.lineTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No hay items registrados.</p>
      )}

      <Link to="/invoices" className="mt-4 inline-block text-blue-600 hover:underline">
        ← Volver a facturas
      </Link>
    </div>
  );
}
