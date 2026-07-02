# Nestor

A full-stack real estate listing platform built with React, TypeScript, Express, and PostgreSQL.

## Features

- 🔍 **Browse Properties** — Filter by location, type, category, and price range
- 📄 **Property Details** — Full-page view with image carousel, owner contact, and stats
- 🏠 **List Property** — Authenticated users can post properties with image uploads
- 💚 **Favourites** — Save properties to your favourites list
- 📱 **Responsive** — Works on desktop, tablet, and mobile
- 🌙 **Glassmorphism UI** — Modern dark-themed design
- 🔄 **Network Error Handling** — Graceful fallbacks and retry support

## Tech Stack

### Frontend
- React 19 + TypeScript
- Vite
- Tailwind CSS
- React Router DOM v7
- Zustand (state management)
- React Hot Toast (notifications)
- Axios

### Backend
- Express.js + TypeScript
- PostgreSQL (via `pg`)
- JSON Web Tokens (JWT)
- Multer (image uploads)
- bcryptjs (password hashing)

## Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL

### 1. Clone & Install

```bash
git clone https://github.com/Nyctophilia58/Nestor.git
cd Nestor
```

### 2. Database Setup

Create a PostgreSQL database and run the schema (you'll find table creation scripts in the project).

### 3. Environment Variables

Create `.env` in the `backend/` folder:

```bash
PORT=5000
JWT_SECRET=your_secret_key_here

# Database (individual)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nestor
DB_USER=postgres
DB_PASSWORD=your_password

# OR use a single connection string (e.g., Render)
DATABASE_URL=postgresql://user:pass@host:5432/db
```

Create `.env` in the `frontend/` folder (optional — defaults to localhost):

```bash
VITE_API_URL=http://localhost:5000/api
```

### 4. Run the Backend

```bash
cd backend
npm install
npm run dev
```

### 5. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173`.

---

## API Documentation

The backend exposes a REST API at `/api`. See [`backend/requests.rest`](./backend/requests.rest) for all available endpoints.

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/register` | POST | ❌ | Create account |
| `/api/auth/login` | POST | ❌ | Log in |
| `/api/properties` | GET | ❌ | List properties (with filters, pagination) |
| `/api/properties/:id` | GET | ❌ | Get single property |
| `/api/properties` | POST | ✅ | Create a property |
| `/api/properties/:id` | PUT | ✅ | Update your property |
| `/api/properties/:id` | DELETE | ✅ | Delete your property |
| `/api/properties/mine` | GET | ✅ | Get my listings |
| `/api/properties/favourites` | GET | ✅ | Get favourite properties |
| `/api/properties/:id/favourite` | POST | ✅ | Add to favourites |
| `/api/properties/:id/favourite` | DELETE | ✅ | Remove from favourites |
| `/api/upload` | POST | ✅ | Upload images (multipart/form-data) |

---

## Deployment

### Frontend — Vercel

1. Push code to GitHub
2. Import project into [Vercel](https://vercel.com)
3. Set environment variable:
   - `VITE_API_URL` = `https://your-render-url.onrender.com/api`
4. Deploy

### Backend — Render

1. Push code to GitHub
2. Create a [Render](https://render.com) Web Service
3. Connect your repo
4. Set environment variables:
   - `DATABASE_URL` — your PostgreSQL connection string
   - `JWT_SECRET` — a secure random string
   - `CORS_ORIGIN` — your Vercel frontend URL (e.g., `https://your-app.vercel.app`)
5. Build command: `npm install && npm run build`
6. Start command: `npm start`
7. Deploy

---

## Project Structure

```
Nestor/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/        # Auth, error handling
│   │   ├── routes/            # API route definitions
│   │   ├── config/            # DB pool, upload config
│   │   └── server.ts          # Entry point
│   ├── requests.rest          # REST Client test requests
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page-level components
│   │   ├── store/             # Zustand stores (auth, favourites)
│   │   ├── lib/               # API client setup
│   │   └── types/             # TypeScript interfaces
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

---

## Scripts

### Backend
| Command | Description |
|---------|-------------|
| `npm run dev` | Run with hot reload (nodemon + ts-node) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled output |

### Frontend
| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

---

## Environment Variables Summary

### Backend
| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 3000) | ❌ |
| `JWT_SECRET` | Secret for JWT signing | ✅ |
| `DATABASE_URL` | Full PostgreSQL connection string | OR individual DB vars |
| `CORS_ORIGIN` | URL(s) allowed by CORS (comma-separated) | ✅ (prod) |
| `BASE_URL` | Your backend URL (for upload links) | ❌ |
| `DB_HOST` | PostgreSQL host | ✅ (dev) |
| `DB_PORT` | PostgreSQL port | ✅ (dev) |
| `DB_NAME` | PostgreSQL database name | ✅ (dev) |
| `DB_USER` | PostgreSQL username | ✅ (dev) |
| `DB_PASSWORD` | PostgreSQL password | ✅ (dev) |

### Frontend
| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API base URL | ❌ (defaults to localhost) |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/awesome`)
3. Commit your changes (`git commit -am 'Add awesome feature'`)
4. Push to the branch (`git push origin feature/awesome`)
5. Open a Pull Request

---

## License

MIT
