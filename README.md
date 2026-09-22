# Ridgeline Rentals — Car Rental Booking Platform

A full-stack car rental platform: a React (Vite + React Router) client talking
to an Express API with JWT auth and an admin back office. The data layer is
in-memory but written as an async repository (`server/src/data/store.js`), so
swapping in Postgres/Mongo later means rewriting that one file — no controller
or route code changes.

## Project structure

```
car-rental-platform/
├── server/                     Express API
│   └── src/
│       ├── index.js            App entry, mounts routes, seeds admin user
│       ├── data/
│       │   ├── store.js        Repository layer (Users/Cars/Bookings)
│       │   ├── seed.cars.js    Starter fleet
│       │   └── extras.js       Shared pricing constants
│       ├── routes/              auth / cars / bookings / admin
│       ├── controllers/         Request handlers per route file
│       ├── middleware/          JWT auth guard, admin guard, error handler
│       └── utils/                jwt.js, password.js (bcrypt)
│
└── client/                     React app
    └── src/
        ├── main.jsx             Router + AuthProvider bootstrap
        ├── App.jsx               Route tree (all pages wired here)
        ├── context/AuthContext.jsx
        ├── services/             api.js + one file per resource (cars, bookings, admin, auth)
        ├── components/           Navbar, Footer, CarCard, CarGlyph, route guards
        ├── pages/                 Home, Search, Car details, Checkout, Confirmation,
        │                          Login, Signup, My bookings, Profile, 404
        └── pages/admin/           Admin layout, Dashboard, Fleet, Bookings, Analytics
```

## Pages

**Public:** Home (search hero), Search results (filters + sort), Car details, Login, Signup
**Authenticated:** Checkout, Confirmation, My bookings, Profile
**Admin only:** Dashboard, Fleet (CRUD), All bookings, Analytics
**Host (any logged-in user):** My cars (list/edit your own vehicle), Booking requests (approve/decline + message renters)

Route protection is handled by `ProtectedRoute` (must be logged in) and
`AdminRoute` (must be an admin) wrapping the relevant `<Route>` elements in
`App.jsx`.

## Host marketplace (peer-to-peer listings)

Any logged-in user can list their own car — no special signup or admin
approval needed. This is deliberately **capability-based, not role-based**:
there's no separate "owner" account type. The same account can rent fleet
cars as a customer and list their own car as a host, exactly like
Turo/Airbnb. Permission checks happen per-resource (`car.ownerId === user.id`
gates editing/deleting a listing and responding to its bookings), not via a
`role` field — `role` stays reserved for `user` vs `admin`.

**How it differs from booking a fleet car:**
- Fleet cars (`source: "fleet"`, `ownerId: null`) confirm instantly, as before.
- Owner-listed cars (`source: "owner"`) go to **`pending`** status on booking —
  the host must approve or decline from `/host/bookings` before it becomes
  `confirmed`. The checkout page and confirmation screen both reflect this
  ("Send request" instead of "Confirm booking").
- Every booking on an owner-listed car gets a **message thread**
  (`MessageThread.jsx`, reused on both the renter's My Bookings page and the
  host's Booking Requests page) so the two sides can coordinate pickup
  details, ask questions, etc. Access to a thread is enforced server-side:
  only the renter, the car's owner, or an admin can read or post to it.

**New endpoints:** `GET/POST /api/owner/cars`, `PATCH/DELETE /api/owner/cars/:id`,
`GET /api/owner/bookings`, `PATCH /api/owner/bookings/:id/approve|decline`,
plus `GET /api/bookings/:id` and `POST /api/bookings/:id/messages` on the
existing bookings router.

**Known limitation:** there's no date-overlap check between bookings on the
same owner-listed car yet (fleet cars don't need one since availability is a
simple status flag) — a real implementation should reject overlapping
pending/confirmed bookings for the same car and date range.

## Car photos

Both hosts (their own listings) and admins (the core fleet) can attach a real
photo to a car — it replaces the generated SVG glyph everywhere that car
appears (search grid, details page, checkout summary, admin/host tables)
once uploaded; cars without a photo keep showing the glyph.

- **Storage:** plain disk storage via `multer`
  (`server/src/middleware/upload.middleware.js`) — files land in
  `server/uploads/cars/`, served back out at `/uploads/cars/<file>` via
  `express.static`. No database or cloud bucket needed for local dev; the
  Vite proxy forwards `/uploads/*` to the API in the same way it already
  does for `/api/*`.
- **Validation:** JPEG/PNG/WebP only, 5MB max, enforced server-side
  (`fileFilter` + `limits` on the multer instance) — a rejected upload
  returns a normal JSON error, not a raw multer stack trace.
- **Endpoints:** `POST /api/owner/cars/:id/image` (must own the listing) and
  `POST /api/admin/cars/:id/image` (admin-only), both `multipart/form-data`
  with a single `image` field. Uploading again replaces the file and
  deletes the old one from disk (`deleteCarImageFile`).
- **Client:** `apiUpload()` in `services/api.js` is a second fetch path
  alongside the JSON `api` helper — it sends a raw `FormData` body with no
  `Content-Type` header so the browser sets the multipart boundary itself.
  `PhotoUploadButton.jsx` wraps a hidden file input; `CarThumb.jsx` renders
  the photo-or-glyph fallback anywhere a small thumbnail is needed.
- **Known limitation:** files live on the server's local disk, so they
  won't survive a redeploy on most hosting platforms (Heroku, most
  serverless targets) — swap `multer.diskStorage` for `multer-s3` or a
  Cloudinary/S3 upload step before deploying somewhere without a persistent
  filesystem.

## AI features

Four AI-powered pieces, each with a real LLM path and a local rule-based
fallback in the same function (`server/src/services/ai.service.js`) — the
app works with zero setup, and gets smarter the moment you add a key.

- **Chat assistant** ("Riley") — floating widget, bottom-right on every page.
  Answers questions about the fleet, pricing, and locations, grounded in the
  live car catalog so it never recommends a car that isn't actually in stock.
- **Natural-language search** — the "Ask AI" box on the home page turns a
  free-text query like *"electric car under $80 near downtown"* into
  structured filters and jumps straight to filtered results.
- **AI-written blurbs** — a one-sentence pitch per car, generated on first
  view and cached in memory, shown on the car details page.
- **Personalized recommendations** — a "Recommended for you" row on the home
  page. Logged-in users with booking history get picks reasoned from their
  past bookings; guests and new users get featured cars.

**To enable real LLM output:** set `ANTHROPIC_API_KEY` (and optionally
`ANTHROPIC_MODEL`) in `server/.env`, then restart the server. Leave it blank
and everything still works — chat gives sensible canned-but-contextual
replies, search parsing uses keyword/regex matching, blurbs use a template,
and recommendations use a type-frequency heuristic. Check `GET /api/ai/status`
to see which mode is active.

**Failure handling:** every LLM call is wrapped in try/catch — if the API
errors, times out, or returns malformed JSON, the request transparently
falls back to the local implementation instead of failing the request.

## Running it locally

Requires Node 18+. Two terminals:

```bash
# Terminal 1 — API on :4000
cd server
cp .env.example .env
npm install
npm run dev

# Terminal 2 — client on :5173
cd client
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api/*` to the server, so no CORS
setup is needed in dev.

**Demo admin login:** `admin@ridgeline.dev` / `admin1234` (seeded on server boot).
Sign up as a normal user to try the customer booking flow.

## How auth works

1. Signup/login hits `/api/auth/*`, server hashes/verifies password with
   `bcryptjs` and returns a JWT (`jsonwebtoken`, signed with `JWT_SECRET`,
   carrying a unique `jti`).
2. Client stores the token in `localStorage` and attaches it as
   `Authorization: Bearer <token>` on every authenticated request
   (`services/api.js`).
3. `requireAuth` middleware verifies the token, checks it hasn't been
   revoked (see below), and loads the user; `requireAdmin` additionally
   checks `role === "admin"`.
4. On the client, `AuthContext` re-hydrates the session on page load by
   calling `/api/auth/me` with the stored token.
5. Logging out calls `POST /api/auth/logout`, which revokes that token's
   `jti` server-side (`utils/jwt.js`) — so a copied/leaked token stops
   working immediately instead of staying valid until it naturally expires.

## Security

This started as a demo and has had real hardening layered in as the app
grew. What's actually in place, and what's still a deployment-time gap —
stated plainly rather than glossed over:

**In place:**
- **Password hashing** — `bcryptjs`, salted, never stored or logged in plaintext.
- **Password policy** — signup requires 10+ characters with a letter and a
  number (`middleware/validate.js`); enforced server-side, not just in the UI.
- **Account lockout** — 5 failed logins for one email locks that email out
  for 15 minutes (`utils/loginAttempts.js`), independent of IP — this is
  what stops an attacker spreading login attempts across many IPs to dodge
  the rate limiter below.
- **Rate limiting** — a general cap across `/api/*`, a stricter one on
  `/api/auth/login` and `/api/auth/signup`, and another on `/api/ai/*`
  (`middleware/rateLimit.middleware.js`) — the AI limit also protects
  against runaway Anthropic API spend, not just abuse.
- **JWT revocation** — logout actually invalidates the token server-side
  (`jti` + an in-memory revoked-token set), not just a client-side delete.
- **Access control / ownership checks** — every mutation checks who's
  asking, not just whether they're logged in: `car.ownerId === user.id`
  gates a host's own listings and their bookings, `requireAdmin` gates the
  fleet/admin routes, and booking-message access checks renter/owner/admin
  before returning or accepting a message.
- **Mass-assignment protection** — `PATCH` endpoints for cars strip
  `ownerId`/`ownerName`/`source` from the request body before applying it,
  so a crafted request can't reassign a listing's ownership or relabel it
  as fleet inventory (this was an actual hole in an earlier version of this
  build — a `PATCH` handler that merges `req.body` straight into a record
  is a mass-assignment vulnerability if any field in that record is
  security-relevant).
- **Input validation** — required fields, string length caps, enum checks
  (vehicle type/location), and number ranges enforced server-side on
  signup, login, car creation, bookings, and messages
  (`middleware/validate.js`), independent of whatever the client happens to send.
- **Input sanitization** — free-text fields (car names, booking messages)
  strip angle brackets and control characters before being stored
  (`utils/sanitize.js`) — defense in depth against stored-XSS, on top of
  React already escaping text nodes on render.
- **Encryption at rest** — booking message text is encrypted with
  AES-256-GCM before being stored (`utils/crypto.js`,
  `utils/messageCrypto.js`) and decrypted only when returned to someone
  authorized to read that booking.
- **Security headers** — `helmet()` on every response (CSP, `X-Frame-Options`,
  `X-Content-Type-Options`, etc.), with a narrowly-scoped CORP exception
  just for `/uploads` so car photos still load cross-origin in production.
- **CORS lockdown** — only `CLIENT_ORIGIN` is allowed, with an explicit
  method/header allowlist rather than reflecting any origin.
- **Body size limits** — JSON bodies capped at 100KB; image uploads capped
  at 5MB and restricted to JPEG/PNG/WebP (see the Car photos section above).
- **Fail-fast startup** — the server refuses to start without `JWT_SECRET`
  set, and warns loudly if it's short or if `ENCRYPTION_KEY` is missing,
  instead of silently running with weak/undefined secrets.
- **No user enumeration** — login returns the same "Invalid email or
  password" whether the email doesn't exist or the password is wrong.

**Known gaps — not covered by this codebase, and worth knowing before
calling this production-ready:**
- **TLS/HTTPS termination.** This app speaks plain HTTP; encryption in
  transit has to be handled by a reverse proxy (Nginx, Caddy) or the
  hosting platform in front of it (Render, Fly, a load balancer with a
  cert). Nothing here does that for you.
- **Token storage in `localStorage`.** Simple and works well with a bearer-
  token API, but it means an XSS bug anywhere in the app could exfiltrate
  a live session token. The more locked-down alternative is an `httpOnly`
  cookie + CSRF token pair — meaningfully more secure, but a real refactor
  (cookie parsing, `SameSite` config, CSRF middleware, `credentials:
  "include"` on every fetch) that wasn't in scope here. Worth doing before
  this handles real user data.
- **In-memory everything.** Rate limits, login lockouts, and JWT revocation
  all live in process memory — they reset on restart and don't share state
  across multiple server instances. Fine for one process; needs Redis (or
  similar) behind a load balancer.
- **No refresh-token rotation, no 2FA, no password-reset flow.** All
  reasonable next steps depending on how far this goes.
- **No dependency/vulnerability scanning wired in** (e.g. `npm audit` in
  CI, Snyk/Dependabot) and no structured security audit log beyond
  `morgan`'s request log and a couple of `console.warn` calls on startup.

This is structured to drop in real infra as it grows: swap the JWT secret
handling for a proper secrets manager, move the in-memory rate-limit/lockout
state to Redis, add refresh tokens, or replace `bcryptjs` checks with an
identity provider — none of that requires touching the middleware boundary
these controllers already respect.

## Pricing logic

Both the client (for instant UI feedback) and the server (as the source of
truth) compute: `days × car.price + extras × days`, then 8% tax. The server
**recomputes total from scratch** in `bookings.controller.js` rather than
trusting a total sent from the client — never trust client-calculated prices
for a real charge.

## Extending this

- **Real database:** implement `UsersRepo` / `CarsRepo` / `BookingsRepo` in
  `store.js` against Postgres (e.g. via Prisma) — the function signatures are
  already async and already shaped like queries.
- **Payments:** add a `POST /api/bookings` step that creates a Stripe
  PaymentIntent before writing the booking record.
- **Images:** cars currently render as generated SVG glyphs (`CarGlyph.jsx`)
  instead of stock photos — swap in real fleet photography by adding an
  `imageUrl` field to the car model and a `<img>` fallback.
- **Search:** filtering happens in the repository layer already, so adding
  full-text search or geolocation-based hub lookup is a `store.js` change,
  not a client rewrite.
