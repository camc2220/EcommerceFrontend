export default function Checkout(){
  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Checkout</h2>
      <p>This demo assumes payment handled server-side. Use the API endpoint /cart/checkout to create an invoice.</p>
    </div>
  )
}
