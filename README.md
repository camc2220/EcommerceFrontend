Ecommerce Frontend (React + Vite + Tailwind)

How to run locally:
1. npm install
2. create a .env file with VITE_API_URL pointing to your backend, e.g.:
   VITE_API_URL=https://ecommercebackend-production-a5a1.up.railway.app/api
3. npm run dev

How to build:
1. npm run build
2. The output is in /dist for static deploy.

Notes for Railway:
- Set the environment variable VITE_API_URL to your backend URL.
- Railway will run `npm run build` for static site deployments.

This frontend expects the backend API endpoints:
- POST /api/Auth/login
- POST /api/Auth/register
- GET /api/products
- GET /api/products/{id}
- GET /api/cart
- POST /api/cart/add
- POST /api/cart/checkout
