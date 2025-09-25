import { useNavigate } from 'react-router-dom'

export default function BackButton(){
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => navigate(-1)}
      className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:from-sky-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-300"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 transition group-hover:bg-white/30">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="h-4 w-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 19.5 3 12l7.5-7.5M3 12h18"
          />
        </svg>
      </span>
      <span>Volver</span>
    </button>
  )
}
