import { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import axios from "axios";

function Home() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-3xl font-bold">Bienvenido al Ecommerce</h1>
      <p className="mt-4">Explora productos, agrega al carrito y compra fácil 🚀</p>
      <Link to="/products" className="mt-6 inline-block bg-blue-600 text-white px-4 py-2 rounded">
        Ver productos
      </Link>
    </div>
  );
}

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(import.meta.env.VITE_API_URL + "/api/Product")
      .then(res => {
        const payload = res?.data;
        if (Array.isArray(payload)) {
          setProducts(payload);
        } else if (payload && Array.isArray(payload.data)) {
          setProducts(payload.data);
        } else if (payload && Array.isArray(payload.items)) {
          setProducts(payload.items);
        } else {
          console.error("Formato inesperado de productos", payload);
          setProducts([]);
        }
      })
      .catch(err => console.error("Error cargando productos", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-4">Cargando productos...</p>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
      {products.map(p => (
        <div key={p.id} className="border rounded-lg p-4 shadow">
          <h2 className="font-bold">{p.name}</h2>
          <p className="text-gray-600">${p.price}</p>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Products />} />
    </Routes>
  );
}

