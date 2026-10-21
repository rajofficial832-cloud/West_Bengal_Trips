# Travel App Backend

Express + Mongoose REST API backed by MongoDB Atlas. Serves auth, itineraries, cart, and orders for the travel booking app.

## Tech stack

- **Runtime:** Node.js, Express 4
- **Database:** MongoDB Atlas via Mongoose 8
- **Auth:** JWT (`jsonwebtoken`) + password hashing (`bcryptjs`)
- **Dev tooling:** `nodemon` for auto-restart, `dotenv` for environment config

## Project structure

```
backend/
├── .env                  # local secrets (gitignored) — create from .env.example
├── .env.example           # template for required environment variables
├── package.json
└── src/
    ├── app.js             # Express app: middleware, route mounting, error handling
    ├── server.js           # entry point: loads env, connects DB, starts listening
    ├── config/
    │   └── db.js           # mongoose.connect() wrapper
    ├── models/
    │   ├── User.js         # name, email (unique), passwordHash
    │   ├── Itinerary.js     # trip catalog entry
    │   ├── CartEntry.js     # one user's cart line item
    │   └── Order.js         # a placed order (items, total, status)
    ├── controllers/
    │   ├── authController.js
    │   ├── itineraryController.js
    │   ├── cartController.js
    │   └── orderController.js
    ├── routes/
    │   ├── auth.js
    │   ├── itineraries.js
    │   ├── cart.js
    │   └── orders.js
    ├── middleware/
    │   └── auth.js          # verifies JWT, sets req.userId
    ├── utils/
    │   └── asyncHandler.js  # wraps async route handlers for error propagation
    └── seed/
        ├── itineraries.json # the 6 seed trips
        └── seedItineraries.js
```

## Environment variables (`.env`)

| Variable | Description |
|---|---|
| `PORT` | Port the API listens on (default `4000`) |
| `MONGODB_URI` | MongoDB Atlas connection string, including the database name (e.g. `.../travel-app?...`) |
| `JWT_SECRET` | Random secret used to sign/verify JWTs — keep this private, never commit it |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |

Copy `.env.example` to `.env` and fill in real values before running anything. `.env` is gitignored.

## Setup & running

```powershell
cd App/backend
npm install
npm run seed   # one-time (or whenever seed data changes): loads itineraries.json into Atlas
npm run dev     # starts the API with nodemon (auto-restart on file changes)
```

Other scripts:
- `npm start` — runs once with plain `node` (no auto-restart), useful as a final sanity check.

On successful start you should see:
```
MongoDB connected
API listening on port 4000
```

## Database

- **Provider:** MongoDB Atlas (free shared cluster)
- **Database name:** `travel-app` (set via the path in `MONGODB_URI`)
- **Collections** (created automatically by Mongoose on first write):
  - `users` — one document per account
  - `itineraries` — the trip catalog, populated by `npm run seed`
  - `cartentries` — one document per (user, itinerary) pair in a user's active cart
  - `orders` — one document per placed order, with an embedded `items` array

### Schemas

**User**
| Field | Type | Notes |
|---|---|---|
| `name` | String | required |
| `email` | String | required, unique, lowercase |
| `passwordHash` | String | bcrypt hash; never returned in API responses |

**Itinerary**
| Field | Type | Notes |
|---|---|---|
| `id` | String | required, unique — external slug used in the API (not the Mongo `_id`) |
| `title`, `location`, `description`, `image` | String | |
| `durationDays`, `basePricePerPerson` | Number | |
| `highlights` | String[] | |

**CartEntry**
| Field | Type | Notes |
|---|---|---|
| `userId` | ObjectId → User | required |
| `itineraryId` | String | required |
| `groupSize` | Number | required, min 1 |
| `travelDate` | String (ISO date) | required |

Unique compound index on `(userId, itineraryId)` — adding the same itinerary again updates the existing entry instead of duplicating it.

**Order**
| Field | Type | Notes |
|---|---|---|
| `userId` | ObjectId → User | required |
| `items` | Array of `{ itineraryId, groupSize, travelDate, itemTotal }` | snapshot taken at checkout time |
| `total` | Number | sum of `itemTotal` |
| `status` | `'active' \| 'cancelled'` | default `active` |
| `createdAt` / `updatedAt` | Date | via `timestamps: true` |

## Authentication

- `POST /api/auth/signup` and `POST /api/auth/login` return `{ token, user }`.
- `token` is a JWT signed with `JWT_SECRET`, containing the user's Mongo `_id` as `sub`, expiring after `JWT_EXPIRES_IN`.
- Protected routes (cart, orders) require header `Authorization: Bearer <token>`, verified by [`middleware/auth.js`](src/middleware/auth.js), which attaches `req.userId`.
- Passwords are hashed with `bcryptjs` (10 salt rounds) — plaintext passwords are never stored.
- `reset-password` is **demo-only**: it changes a password given just an email, with no ownership verification (no email link, no current-password check). This mirrors the original local-only app's behavior but is **not safe for production** — a real implementation would require an emailed reset token.

## API endpoints

Base URL: `http://localhost:4000/api` (or `http://<your-LAN-IP>:4000/api` for device testing)

### Health
| Method | Path | Auth |
|---|---|---|
| GET | `/health` | No |

### Auth
| Method | Path | Auth | Body |
|---|---|---|---|
| POST | `/auth/signup` | No | `{ name, email, password }` |
| POST | `/auth/login` | No | `{ email, password }` |
| POST | `/auth/reset-password` | No | `{ email, newPassword }` |

### Itineraries
| Method | Path | Auth |
|---|---|---|
| GET | `/itineraries` | No |
| GET | `/itineraries/:id` | No |

### Cart (requires `Authorization: Bearer <token>`)
| Method | Path | Body |
|---|---|---|
| GET | `/cart` | — |
| POST | `/cart` | `{ itineraryId, groupSize, travelDate }` (upsert) |
| PATCH | `/cart/:itineraryId` | `{ groupSize }` |
| DELETE | `/cart/:itineraryId` | — |
| DELETE | `/cart` | — (clears entire cart) |

### Orders (requires `Authorization: Bearer <token>`)
| Method | Path | Body |
|---|---|---|
| GET | `/orders` | — |
| POST | `/orders` | — (builds an order from the user's current server-side cart, then clears the cart) |
| PATCH | `/orders/:id/cancel` | — |

## Error handling

- Unknown routes return `404 { "message": "Not found." }`.
- Validation/auth failures return `400`/`401`/`404`/`409` with a `{ "message": "..." }` body.
- Unhandled errors are caught by the final error-handling middleware in [`app.js`](src/app.js) and return `500 { "message": "..." }` without leaking stack traces to the client (full error is logged server-side via `console.error`).

## Security notes

- CORS is open (`cors()` with no restrictions) for local development — tighten this (allowed origins) before any production deployment.
- `EXPO_PUBLIC_*` variables on the frontend are compiled into the client bundle in plain text — never put secrets there; this backend's `.env` is the only place secrets should live.
- Rotate `JWT_SECRET` and your MongoDB Atlas credentials if either is ever accidentally committed or shared.
