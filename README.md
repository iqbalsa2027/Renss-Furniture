
  # Furniture Brand Landing Page + CMS Backend

  This repository contains:
  - a public furniture catalog frontend built with Vite + React
  - a CMS backend built with Node.js + Express + PostgreSQL

  The original landing page design reference is available at:
  https://www.figma.com/design/nYciiwoC7eBGo3ZujRJqkj/Furniture-Brand-Landing-Page

  ## Frontend

  Install frontend dependencies:

  `npm install`

  Start the catalog frontend:

  `npm run dev`

  ## Backend CMS

  The backend lives in [server/package.json](./server/package.json).

  Install backend dependencies:

  `cd server && npm install`

  Copy the environment template:

  `cp .env.example .env`

  Required environment variables:
  - `PORT`
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `ADMIN_EMAIL`
  - `ADMIN_PASSWORD`

  ## PostgreSQL setup

  Run the SQL schema in [server/database/001_init.sql](./server/database/001_init.sql) against your PostgreSQL database.

  You can print the SQL file with:

  `npm run db:init`

  After the database is ready, start the backend:

  `npm run dev`

  ## Available CMS endpoints

  Public endpoints:
  - `GET /api/health`
  - `GET /api/categories/public`
  - `GET /api/products/public`
  - `GET /api/testimonials/public`
  - `GET /api/site-settings/public`

  Admin/auth endpoints:
  - `GET /api/auth/bootstrap`
  - `POST /api/auth/login`

  Protected CMS endpoints:
  - `GET/POST/PUT/DELETE /api/categories`
  - `GET/POST/PUT/DELETE /api/products`
  - `GET/POST/PUT/DELETE /api/testimonials`
  - `GET /api/site-settings`
  - `PUT /api/site-settings/:key`

  Use `Authorization: Bearer <token>` for protected routes.
  
