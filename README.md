# Mythic Games

A full-stack digital game storefront — Steam-style marketplace with cart, checkout, eSewa payment integration, invoice/receipt generation, and a full admin dashboard.

## Architecture

```
mythic-games/
├── backend/           Express 5 + PostgreSQL REST API
├── frontend/          React 19 + Vite + Tailwind CSS v4 SPA
├── docker-compose.yml Full stack container setup
└── .github/workflows/ CI/CD pipeline
```

**Backend stack:** Node.js, Express 5, PostgreSQL 16, JWT auth, Winston logging, eSewa payment gateway, PDFKit invoices  
**Frontend stack:** React 19, Vite 8, Tailwind CSS v4, Zustand, React Query, Framer Motion, Recharts

---

## Setup

### Prerequisites

- Node.js 20+
- PostgreSQL 16+

### Local Development

```bash
# 1. Clone
git clone https://github.com/SafferStha/Mythic-Games.git
cd Mythic-Games

# 2. Backend setup
cd backend
cp .env.example .env
# Edit .env — set DB credentials and JWT secrets (see Environment Variables)
npm install
npm run dev

# 3. Frontend setup (new terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

App runs at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Health check: http://localhost:5000/health

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: 5000) |
| `NODE_ENV` | No | `development` / `production` |
| `DB_HOST` | Yes | PostgreSQL host |
| `DB_PORT` | No | PostgreSQL port (default: 5432) |
| `DB_NAME` | Yes | Database name |
| `DB_USER` | Yes | Database user |
| `DB_PASSWORD` | Yes | Database password |
| `DB_SSL` | No | `true` for cloud databases |
| `JWT_SECRET` | **Yes** | Access token secret (min 32 chars) |
| `JWT_REFRESH_SECRET` | **Yes** | Refresh token secret (min 32 chars) |
| `JWT_EXPIRES_IN` | No | Access token TTL (default: 15m) |
| `JWT_REFRESH_EXPIRES_IN` | No | Refresh TTL (default: 7d) |
| `CORS_ORIGIN` | No | Allowed frontend origins (comma-separated) |
| `FRONTEND_URL` | No | Frontend base URL (for eSewa redirects) |
| `CART_TAX_RATE` | No | VAT rate (default: 0.13 = 13%) |
| `ESEWA_MERCHANT_CODE` | No | eSewa merchant code (default: EPAYTEST) |
| `ESEWA_SECRET_KEY` | No | eSewa HMAC secret |
| `ESEWA_PAYMENT_URL` | No | eSewa payment form URL |
| `ESEWA_VERIFICATION_URL` | No | eSewa verification API URL |
| `ESEWA_SUCCESS_URL` | No | Payment success callback URL |
| `ESEWA_FAILURE_URL` | No | Payment failure callback URL |

Generate strong secrets:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### Frontend (`frontend/.env.local`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL (default: http://localhost:5000) |
| `VITE_APP_NAME` | App display name |

---

## Database Migrations

Migrations run automatically on server start. They are idempotent — safe to run multiple times.

```bash
# View migration status
cd backend && node -e "require('./src/database/migrations').runMigrations().then(() => process.exit(0))"
```

Migration files in `backend/src/database/schema/`:
- `001_auth.js` — users, admins, refresh_tokens
- `002_catalog.js` — categories, games
- `003_commerce.js` — carts, cart_items, orders, order_items
- `004_payments.js` — payments, invoices, receipts
- `005_admin.js` — admin_logs

---

## Running Tests

### Backend (Jest + Supertest)

```bash
cd backend
npm test                # Run all tests
npm run test:coverage   # Run with coverage report
npm run test:watch      # Watch mode
```

Test suites:
- `tests/unit/authService.test.js` — auth service logic
- `tests/unit/cartService.test.js` — cart service logic
- `tests/integration/auth.test.js` — auth API endpoints (register, login, refresh, logout)
- `tests/integration/cart.test.js` — cart API endpoints (add, update, remove, clear)
- `tests/integration/checkout.test.js` — checkout flow + stock validation
- `tests/integration/payment.test.js` — eSewa initiate, success/failure callbacks, verify
- `tests/integration/admin.test.js` — admin panel endpoints + role guard
- `tests/integration/orders.test.js` — user order history + single order fetch
- `tests/integration/invoice.test.js` — invoice fetch + ownership enforcement

**Target coverage: 70%+ lines**

### Frontend (Vitest + React Testing Library)

```bash
cd frontend
npm test               # Run all tests
npm run test:coverage  # With coverage
npm run test:watch     # Watch mode
```

---

## Deployment

### Docker (Recommended)

```bash
# 1. Copy and fill env file
cp backend/.env.example backend/.env
# Set all production values

# 2. Build and start all services
docker compose up -d --build

# 3. Check health
curl http://localhost:5000/health
```

Services:
- `postgres` — PostgreSQL 16 on internal network
- `backend` — Node.js API on port 5000
- `frontend` — Nginx serving built React app on port 80

### Manual Deployment

```bash
# Backend
cd backend
npm install --only=production
NODE_ENV=production node server.js

# Frontend — build
cd frontend
VITE_API_URL=https://api.yourdomain.com node ./node_modules/vite/bin/vite.js build
# Serve dist/ with nginx or any static host
```

### Cloud Platforms

The backend can be deployed to:
- **Railway** — connect PostgreSQL + backend as a service
- **Render** — web service + managed PostgreSQL
- **Fly.io** — Dockerfile deployment with persistent volumes

The frontend can be deployed to:
- **Vercel** — `VITE_API_URL` as environment variable
- **Netlify** — same approach
- **Cloudflare Pages** — build command: `node ./node_modules/vite/bin/vite.js build`

---

## API Routes

All API routes are prefixed with `/api`.

### Auth — `/api/auth`

| Method | Path | Description |
|---|---|---|
| `POST` | `/register` | Register new user |
| `POST` | `/login` | Login (user or admin) |
| `POST` | `/refresh` | Refresh access token (from httpOnly cookie) |
| `POST` | `/logout` | Logout + revoke refresh token |

### Cart — `/api/cart` *(auth required)*

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Get active cart with totals |
| `POST` | `/add` | Add game to cart |
| `PATCH` | `/update/:cartItemId` | Update item quantity |
| `DELETE` | `/remove/:cartItemId` | Remove one item |
| `DELETE` | `/clear` | Clear all items |

### Checkout — `/api/checkout` *(auth required)*

| Method | Path | Description |
|---|---|---|
| `POST` | `/` | Convert cart to order (returns `payment_pending: true`) |

### Payments — `/api/payment`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/esewa/initiate` | Required | Create signed eSewa payment |
| `GET` | `/esewa/success` | Public | eSewa success callback |
| `GET` | `/esewa/failure` | Public | eSewa failure callback |
| `POST` | `/esewa/verify` | Required | Manual payment verification |

### Orders — `/api/orders` *(auth required)*

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | List user orders |
| `GET` | `/:id` | Get single order |

### Admin — `/api/admin` *(admin role required)*

| Resource | Methods | Description |
|---|---|---|
| `/dashboard` | GET | Overview stats |
| `/games` | GET, POST | List, create games |
| `/games/:id` | GET, PATCH, DELETE | Read, update, soft-delete game |
| `/categories` | GET, POST, PATCH/:id, DELETE/:id | Category CRUD |
| `/orders` | GET, GET/:id | Order listing |
| `/orders/:id/status` | PATCH | Update order status |
| `/payments` | GET, GET/:id | Payment listing |
| `/payments/:id/verify` | POST | Manual payment verification |
| `/users` | GET, GET/:id | User listing |
| `/users/:id/status` | PATCH | Update user status |
| `/users/:id/role` | PATCH | Update user role *(super_admin only)* |
| `/invoices` | GET, GET/:id, POST/:orderId/regenerate | Invoice management |
| `/receipts` | GET, GET/:id, POST/:paymentId/regenerate | Receipt management |
| `/analytics/overview` | GET | Revenue, orders, users, games stats |
| `/analytics/sales` | GET | Monthly sales + top games |
| `/analytics/orders` | GET | Order analytics |
| `/analytics/users` | GET | User analytics |

### Health

```
GET /health
→ { status: "ok", database: "connected", uptime: 123.4, version: "1.0.0", env: "production" }
```

---

## Logs

Production logs are written to `backend/logs/` with daily rotation:

```
logs/
├── app-YYYY-MM-DD.log      All info+ events (JSON)
├── error-YYYY-MM-DD.log    Error events with stack traces
├── payment-YYYY-MM-DD.log  eSewa gateway events
└── admin-YYYY-MM-DD.log    Admin mutations
```

Logs rotate daily, compress after 1 day, and are retained for 30 days.

---

## Production Checklist

### Security

- [ ] `JWT_SECRET` and `JWT_REFRESH_SECRET` set to random 48-byte hex secrets
- [ ] `NODE_ENV=production`
- [ ] `CORS_ORIGIN` set to exact production frontend URL (no trailing slash)
- [ ] `FRONTEND_URL` set to production frontend URL
- [ ] eSewa live merchant credentials configured (replace sandbox values)
- [ ] `DB_SSL=true` for cloud-managed databases
- [ ] HTTPS configured (nginx reverse proxy or platform TLS)

### Reliability

- [ ] All tests passing: `npm test` (backend) + `npm test` (frontend)
- [ ] `/health` returning `{ status: "ok", database: "connected" }`
- [ ] Graceful shutdown confirmed (send SIGTERM, verify in-flight requests complete)
- [ ] DB connection pool configured for expected load
- [ ] Log files rotating correctly under `backend/logs/`

### Deployment Validation

- [ ] Docker images build without warnings: `docker compose build`
- [ ] `docker compose up -d` starts all three services healthy
- [ ] DB migrations run cleanly on fresh instance
- [ ] Daily database backups enabled (pg_dump or platform-level)

### Observability

- [ ] `X-Correlation-ID` header present in all API responses
- [ ] Payment logs capturing all gateway events in `logs/payment-*.log`
- [ ] Admin audit logs recording all mutations in `logs/admin-*.log`
- [ ] Error logs capturing stack traces in `logs/error-*.log`
