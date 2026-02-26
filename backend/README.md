# Backend Authentication API

A Node.js/Express REST API with JavaScript (ES Modules) that provides JWT-based authentication against MongoDB Atlas. Runs on port **8080** and exposes auth endpoints under `/api/auth`.

## Project Structure

```
backend/
├── .env                    # Environment variables
├── .gitignore
├── package.json            # Dependencies & scripts
└── src/
    ├── index.js            # Entry point — Express app, DB connect, route mounting
    ├── config/
    │   └── db.js           # Mongoose connection helper
    ├── controllers/
    │   └── auth.js         # Auth handler functions (register, login, getMe)
    ├── models/
    │   └── User.js         # User schema & model
    ├── middleware/
    │   └── auth.js         # JWT verification middleware
    └── routes/
        └── auth.js         # Route definitions — maps endpoints to controllers
```

## Configuration

The `.env` file contains three variables:

| Variable     | Purpose                                                  |
| ------------ | -------------------------------------------------------- |
| `MONGO_URI`  | MongoDB Atlas connection string (you need to fill this in) |
| `PORT`       | Server port (defaults to `8080`)                         |
| `JWT_SECRET` | Secret key used to sign/verify JWT tokens                |

## Scripts

| Command         | What it does                                  |
| --------------- | --------------------------------------------- |
| `npm run dev`   | Starts the server with hot-reload via `node --watch` |
| `npm start`     | Runs the server from `src/index.js`           |

## Entry Point — `src/index.js`

- Loads environment variables via `dotenv/config`
- Creates an Express app with JSON body parsing
- Enables CORS for `http://localhost:3000` (the frontend origin)
- Mounts auth routes at `/api/auth`
- Exposes a `GET /health` endpoint that returns `{ status: "ok" }`
- Connects to MongoDB, then starts listening on the configured port
- If the DB connection fails, logs the error and exits with code 1

## Database Connection — `src/config/db.js`

Exports a single `connectDB()` async function that:

- Reads `MONGO_URI` from `process.env`
- Throws an error if it's missing
- Calls `mongoose.connect(uri)` and logs "MongoDB connected" on success

## User Model — `src/models/User.js`

### Schema Fields

| Field       | Type   | Constraints                        |
| ----------- | ------ | ---------------------------------- |
| `email`     | String | Required, unique, lowercased, trimmed |
| `password`  | String | Required, min length 6             |
| `createdAt` | Date   | Defaults to `Date.now`             |

### Pre-save Hook

Before saving, if the `password` field was modified, it hashes the password using bcryptjs with 10 salt rounds.

### Instance Method — `comparePassword(candidate)`

Takes a plaintext password string and returns a `Promise<boolean>` by comparing it against the stored hash using `bcrypt.compare`.

## Auth Middleware — `src/middleware/auth.js`

Protects routes that require authentication.

1. Reads the `Authorization` header
2. If missing or doesn't start with `"Bearer "`, responds with `401 — No token provided`
3. Extracts the token after `"Bearer "`
4. Verifies it using `jwt.verify()` with `JWT_SECRET`
5. On success: attaches the decoded payload (`{ id, email }`) to `req.user` and calls `next()`
6. On failure: responds with `401 — Invalid or expired token`

Attaches the decoded payload as `req.user` with shape `{ id, email }`.

## Routes — `src/routes/auth.js`

Thin route definitions that map endpoints to controller functions. All routes are mounted at `/api/auth`.

```
POST /register  →  register()
POST /login     →  login()
GET  /me        →  authenticate middleware  →  getMe()
```

## Controllers — `src/controllers/auth.js`

Contains the handler logic, separated from route wiring.

### `register(req, res)`

Creates a new user account.

**Request body:** `{ email, password }`

**Flow:**

1. Validates that both `email` and `password` are present → `400` if not
2. Validates password is at least 6 characters → `400` if not
3. Checks if a user with that email already exists → `409` if duplicate
4. Creates the user (password is auto-hashed by the pre-save hook)
5. Signs a JWT with `{ id, email }` that expires in 7 days
6. Returns `201` with `{ token, user: { id, email } }`

### `login(req, res)`

Authenticates an existing user.

**Request body:** `{ email, password }`

**Flow:**

1. Validates that both fields are present → `400` if not
2. Looks up user by email (lowercased) → `401 — Invalid email or password` if not found
3. Compares password using `user.comparePassword()` → `401` if mismatch
4. Signs a JWT with `{ id, email }`, expires in 7 days
5. Returns `200` with `{ token, user: { id, email } }`

### `getMe(req, res)`

Returns the current authenticated user. Protected by the `authenticate` middleware.

**Headers required:** `Authorization: Bearer <token>`

**Response:** `{ user: { id, email } }`

## JWT Token Details

- **Signing algorithm:** HS256 (jsonwebtoken default)
- **Payload:** `{ id: string, email: string }`
- **Expiry:** 7 days
- **Secret:** read from `JWT_SECRET` in `.env`

## Error Response Format

All error responses follow a consistent shape:

```json
{ "message": "Human-readable error description" }
```

| Status | When                                   |
| ------ | -------------------------------------- |
| `400`  | Missing fields or validation failure   |
| `401`  | Bad credentials or invalid/expired token |
| `409`  | Email already registered               |
| `500`  | Unexpected server error                |

## Dependencies

`express`, `mongoose`, `jsonwebtoken`, `bcryptjs`, `cors`, `dotenv`

## Getting Started

1. Fill in `MONGO_URI` in `.env` with your MongoDB Atlas connection string
2. Run `npm install` from the `backend/` folder
3. Run `npm run dev`
4. The server starts at `http://localhost:8080`
5. Test with `GET http://localhost:8080/health` to confirm it's running
