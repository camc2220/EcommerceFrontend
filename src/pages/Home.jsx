import { Link } from 'react-router-dom'
export default function Home(){
  return (
    <div>
      <header className="bg-white rounded p-6 shadow mb-6">
        <h1 className="text-3xl font-bold">Welcome to the store</h1>
        <p className="mt-2 text-gray-600">Shop the best deals</p>
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
