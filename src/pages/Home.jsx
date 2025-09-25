import { Link } from 'react-router-dom'
export default function Home(){
  return (
    <div>
      <header className="mb-6 rounded bg-white p-6 shadow">
        <h1 className="text-3xl font-bold">Welcome to the store</h1>
        <p className="mt-2 text-gray-600">Shop the best deals</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/login"
            className="rounded bg-blue-600 px-5 py-2 text-white shadow hover:bg-blue-700"
          >
            Iniciar sesión
          </Link>
          <Link
            to="/register"
            className="rounded border border-blue-600 px-5 py-2 text-blue-600 hover:bg-blue-50"
          >
            Crear cuenta
          </Link>
        </div>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-4">Featured</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link to="/products" className="p-4 bg-white rounded shadow hover:shadow-md">Browse products →</Link>
        </div>
      </section>
    </div>
  )
}
