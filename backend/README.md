# Backend (Express + Postgres)

Setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL`.
2. Install dependencies:

```powershell
cd backend; npm install
```

3. Initialize DB (run `init.sql` against your Postgres instance):

```powershell
psql $env:DATABASE_URL -f init.sql
```

4. Start server:

```powershell
npm run dev
```

API endpoints:
- `GET /products` (optional `?search=...`)
- `GET /products/:id`
- `POST /products` body: `{ name, description, price }`
- `PUT /products/:id` body: `{ name, description, price }`
- `DELETE /products/:id`

Security & production notes:
- The server applies `init.sql` on startup; for production consider switching to a migration tool (Prisma Migrate or node-pg-migrate).
- Provide `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` via environment variables for admin seeding.
- Configure `ALLOWED_ORIGINS` (comma-separated) to restrict CORS in production.
- Consider running the service behind HTTPS and storing secrets in a secure vault.
