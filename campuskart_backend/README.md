# CampusKart Backend

CampusKart campus-only P2P marketplace — Node.js + Express + TypeScript + Prisma + PostgreSQL + Socket.IO

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ (running locally or remote)
- (Optional) Redis — for Socket.IO horizontal scaling

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/campuskart?schema=public"
JWT_ACCESS_SECRET="generate-a-random-secret"
JWT_REFRESH_SECRET="generate-another-random-secret"
```

### 3. Create the database

```bash
createdb -U postgres campuskart
```

Or via psql:

```sql
CREATE DATABASE campuskart;
```

### 4. Run migrations

```bash
npx prisma migrate dev
```

### 5. Seed the database

```bash
npm run prisma:seed
```

This creates:
- 1 institution (State Institute of Technology)
- 6 categories + subcategories
- 8 pickup spots
- 7 demo users (all with password: `password123`)
- 8 listings with images
- 3 conversations with messages
- 2 offers (counter-offer chain)
- 4 notifications
- Bookmarks, badges, etc.

### 6. Start the development server

```bash
npm run dev
```

API runs at `http://localhost:5000`

## Demo Login

| Email | Password |
|---|---|
| alex.chen@campus.edu | password123 |
| rohit.s@campus.edu | password123 |
| priya.p@campus.edu | password123 |

## API Endpoints

### Auth
- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/verify-email`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`

### Institutions
- `GET /api/v1/institutions?emailDomain=`
- `GET /api/v1/institutions/:id/pickup-spots`
- `GET /api/v1/institutions/:id/departments`

### Categories
- `GET /api/v1/categories`

### Listings
- `GET /api/v1/listings` — campus-scoped feed with filters
- `GET /api/v1/listings/:id`
- `GET /api/v1/listings/:id/similar`
- `GET /api/v1/listings/mine`
- `POST /api/v1/listings`
- `PATCH /api/v1/listings/:id`
- `DELETE /api/v1/listings/:id`
- `POST /api/v1/listings/:id/bookmark`
- `DELETE /api/v1/listings/:id/bookmark`

### Conversations & Messages
- `GET /api/v1/conversations`
- `GET /api/v1/conversations/:id`
- `POST /api/v1/conversations`
- `POST /api/v1/conversations/:id/messages`
- `PATCH /api/v1/conversations/:id/read`

### Offers
- `POST /api/v1/conversations/:conversationId/offers`
- `PATCH /api/v1/offers/:id`

### Notifications
- `GET /api/v1/notifications`
- `GET /api/v1/notifications/unread-count`
- `PATCH /api/v1/notifications/:id/read`
- `PATCH /api/v1/notifications/read-all`

### Users
- `GET /api/v1/users/:id`
- `PATCH /api/v1/users/me`
- `GET /api/v1/users/me/badges`
- `POST /api/v1/users/listings/:id/ratings`

### Reports
- `POST /api/v1/reports`

### Wishlist
- `GET /api/v1/wishlist`
- `POST /api/v1/wishlist`
- `DELETE /api/v1/wishlist/:id`

### Media
- `POST /api/v1/media/sign-upload`
- `POST /api/v1/media/check-quality`

### Admin
- `GET /api/v1/admin/users`
- `PATCH /api/v1/admin/users/:id`
- `GET /api/v1/admin/listings`
- `PATCH /api/v1/admin/listings/:id`
- `GET /api/v1/admin/reports`
- `PATCH /api/v1/admin/reports/:id`
- `GET /api/v1/admin/analytics`

### Campus
- `GET /api/v1/campuses/me/leaderboard`
- `GET /api/v1/campuses/me/trends`
- `GET /api/v1/campuses/me/heatmap`

## Project Structure

```
campuskart_backend/
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed data
├── src/
│   ├── index.ts          # Entry point
│   ├── routes/           # API route handlers
│   ├── services/         # Business logic (Socket.IO, notifications)
│   ├── middleware/       # Auth, error handling
│   └── utils/            # JWT, helpers
├── .env                  # Environment variables
├── package.json
└── tsconfig.json
```

## Socket.IO Events

| Event | Direction | Description |
|---|---|---|
| `conversation:join` | Client → Server | Join a conversation room |
| `conversation:leave` | Client → Server | Leave a conversation room |
| `presence:typing` | Client → Server | Typing indicator |
| `message:new` | Server → Client | New message in conversation |
| `offer:updated` | Server → Client | Offer status changed |
| `conversation:updated` | Server → Client | Conversation preview updated |
| `notification:new` | Server → Client | New notification |
