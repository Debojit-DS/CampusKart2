# CampusKart — Product Requirements Document (PRD)

## 1. Overview

CampusKart is a campus-only peer-to-peer marketplace designed for college students to buy, sell, and trade items within their institution. It combines a corkboard-style listing feed with real-time messaging, offer negotiation, and admin moderation — all restricted to verified institutional email domains.

---

## 2. Architecture

### Development
```
┌─────────────────┐     localhost:5173      ┌──────────────────┐     localhost:5000      ┌──────────────┐
│   Browser       │ ───────────────────────▶ │   Vite Dev       │ ──────────────────────▶ │   Express    │
│                 │                          │   Server         │                        │   + TS       │
│                 │ ◀─────────────────────── │   (proxy /api)   │ ◀───────────────────── │   Prisma     │
└─────────────────┘                          └──────────────────┘                        └──────────────┘
                                                                                                   │
                                                                                              SQL / WS
                                                                                                   │
                                                                                        ┌──────────────┐
                                                                                        │   Neon DB    │
                                                                                        │ PostgreSQL   │
                                                                                        └──────────────┘
```

### Production
```
┌─────────────────┐          HTTPS/API         ┌──────────────────┐       SQL/WS        ┌──────────────┐
 │   Browser       │ ────────────────────────▶ │   Render        │ ──────────────────▶ │   Neon DB    │
 │  (Vercel)       │                           │  Express + TS    │                    │ PostgreSQL   │
 │                 │ ◀──────────────────────── │  Socket.IO       │ ◀───────────────── │              │
 └─────────────────┘                           └──────────────────┘                    └──────────────┘
```

### Frontend
- **Type:** Vanilla JavaScript SPA (no framework)
- **Bundler/Dev Server:** Vite 6 on `localhost:5173`
- **Routing:** Hash-based (`#/...`)
- **Real-time:** Socket.IO client 4.8
- **State:** In-memory reactive store + `localStorage` persistence
- **Styling:** Custom CSS with CSS variables / theme tokens
- **Dev Proxy:** Vite proxies `/api/*` and `/socket.io/*` to backend on port 5000
- **Deployment:** Vercel (static build with rewrites)

### Backend
- **Runtime:** Node.js
- **Language:** TypeScript 5.7
- **Framework:** Express 4
- **ORM:** Prisma 5.22
- **Database:** PostgreSQL (Neon)
- **Real-time:** Socket.IO 4.8
- **Auth:** JWT access + refresh tokens + HTTP-only cookies
- **Email:** Nodemailer (Gmail SMTP / console fallback)
- **Media:** Cloudinary v2
- **Security:** Helmet, CORS, rate limiting, content moderation
- **Validation:** Zod
- **Testing:** Vitest + Supertest
- **Linting:** ESLint 9 + TypeScript ESLint
- **Deployment:** Render or Docker + nginx

---

## 3. User Roles

| Role | Description | Capabilities |
|------|-------------|--------------|
| **Student** | Verified campus student | Browse listings, create listings, message sellers, make offers, bookmark, rate, report |
| **Admin** | Campus administrator | Full access + user management, listing moderation, report resolution, analytics dashboard |

---

## 4. Authentication & Authorization

### Features
- **Institutional Email Signup:** Only emails from registered campus domains (`@heritageit.edu.in`) are allowed
- **Auto Institution Resolution:** Institution is automatically resolved from the email domain during signup
- **6-Digit Email Verification:** OTP sent to email; 15-minute expiry; required before full access
- **Login:** Email + password; returns JWT access token + HTTP-only refresh token cookie
- **Token Refresh:** Automatic silent refresh using HTTP-only cookie when access token expires
- **Logout:** Increments `tokenVersion` to globally revoke all refresh tokens
- **Password Reset:** Email-based reset token flow with 1-hour expiry
- **Email Verification Gate:** Unverified users cannot create conversations, send messages, create listings, or make offers
- **Campus Isolation:** Multi-tenant architecture; users only see data from their own institution
- **Ownership Checks:** Listing update/delete restricted to seller or admin only
- **Rate Limiting:** General API (300 requests/15 min), auth endpoints (50 requests/15 min)

### Endpoints
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/v1/auth/signup` | Create account |
| POST | `/api/v1/auth/verify-email` | Verify email with OTP |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/logout` | Logout |
| POST | `/api/v1/auth/forgot-password` | Request password reset |
| POST | `/api/v1/auth/reset-password` | Reset password |

---

## 5. Core Features

### 5.1 Landing Page
- Marketing hero section with value proposition
- 3-step "How It Works" guide
- Trust/testimonial cards
- CTAs to sign up or log in
- Admin login shortcut

### 5.2 User Feed (Corkboard)
- Masonry-style listing cards with deterministic random rotation
- Category chip bar for quick filtering
- Filter drawer: price range, condition, sort (newest/price asc/price desc)
- Full-text search across title, description, pickup location
- Skeleton loaders during data fetch
- Empty state messaging

### 5.3 Listings
| Feature | Description |
|---------|-------------|
| **Create Listing** | Two types: "Selling an Item" (with images, condition, price) or "Wanted Request" (no photos/condition) |
| **Image Upload** | File picker + URL paste via Cloudinary signed uploads |
| **Listing Detail** | Image gallery with thumbnail swap and full-screen lightbox, seller card, description, similar listings strip |
| **Edit/Update** | Seller or admin can update listing details |
| **Mark as Sold** | Auto-rejects all pending offers |
| **Soft Delete** | Status → `removed` |
| **View Tracking** | View count per listing |
| **Bookmark** | Save listings for later |
| **Category Tags** | Hierarchical categories (parent + children) |
| **Pickup Spots** | Predefined campus-safe meetup locations |

### 5.4 Messaging & Negotiation
| Feature | Description |
|---------|-------------|
| **Conversation List** | Two-pane inbox with unread badges and last-message preview |
| **Real-time Chat** | Socket.IO-powered live messaging |
| **Message Types** | Text, image attachments, location sharing, offer cards, system messages |
| **Typing Indicators** | Live typing presence in conversation |
| **Quick Actions** | "Make an offer", "Share pickup spot" pills |
| **Offer System** | Make offer → Accept/Reject/Counter with multi-turn negotiation chains |
| **Inline Offer Cards** | Offer cards with status pills and action buttons in chat |

### 5.5 Profile & Social
| Feature | Description |
|---------|-------------|
| **Own Profile** | Avatar, name, department, year, rating, active/sold listing tabs, edit profile modal |
| **Public Profiles** | View other users' profiles with verified badge |
| **Edit Profile** | Avatar upload (Cloudinary), update name, department, year |
| **Ratings** | Post-transaction 1–5 star ratings with optional comments |
| **Rating Aggregates** | Average rating and total count displayed on profiles |
| **Leaderboard** | Top 10 sellers, most helpful students, trending categories |

### 5.6 Bookmarks & Wishlist
| Feature | Description |
|---------|-------------|
| **Bookmarks** | Bookmark/unbookmark listings from detail page |
| **Saved Listings** | Masonry grid of saved listings |
| **Wishlist** | Saved search keywords (optionally category-scoped) for alerts |

### 5.7 Notifications
| Feature | Description |
|---------|-------------|
| **In-app Feed** | Notification list with type-based icons |
| **Unread Badge** | Count in top navigation |
| **Mark Read** | Single or mark-all-read |
| **Click Navigation** | Jump to relevant conversation/listing |
| **Types** | `new_offer`, `new_message`, `offer_accepted`, `offer_rejected`, `price_drop`, `system` |

### 5.8 Admin Dashboard
| Feature | Description |
|---------|-------------|
| **Analytics** | Total users, active/sold listings, 7d/30d signups, top 5 categories, most active users |
| **User Management** | View all users, suspend/ban/reactivate with reason, search, sort |
| **Listing Management** | View all listings, remove listings with reason |
| **Report Management** | View reports, resolve/dismiss with notes |
| **Moderation Audit Log** | Every admin action creates a `ModerationAction` record |

### 5.9 Reporting & Moderation
| Feature | Description |
|---------|-------------|
| **Report Listings/Users** | Reason enum: spam, fake_item, wrong_price, inappropriate, scam, duplicate, other |
| **Report Count** | Increments on reported user |
| **Profanity Filter** | Client + server-side blocklist |
| **Contact Info Detection** | Phone numbers, email addresses, external domains flagged |
| **External Link Warnings** | Soft warning when external links detected in messages |

### 5.10 Static Pages
| Page | Content |
|------|---------|
| `/about` | About CampusKart |
| `/safety` | Campus safety rules and recommended meetup spots |
| `/reports` | Community guidelines and prohibited items |
| `/privacy` | Privacy policy |

### 5.11 Performance & Caching
| Feature | Description |
|---------|-------------|
| **API Response Cache** | In-memory GET cache with 60s TTL in `apiService.js` |
| **Cache Invalidation** | Automatic invalidation on all mutating endpoints |
| **Parallel Data Loading** | Feed page loads independent data streams concurrently |
| **Vite Dev Optimization** | `fs.strict: false` and optimized dependency inclusion |

---

## 6. Database Schema

### Core Entities

| Model | Purpose |
|-------|---------|
| **Institution** | Campus tenant; name, email domains, departments, active flag |
| **User** | Student accounts; email, password hash, avatar, verification status, campus, department, year, ratings, role, status, report count, FCM token, token version |
| **Category** | Hierarchical categories (parent/children); slug + label |
| **PickupSpot** | Campus-specific safe meetup locations |
| **Listing** | Core marketplace entity; type (item/wanted), title, description, price, currency, condition, category, pickup location, seller, campus, status, view count |
| **ListingImage** | Multiple images per listing with sort order |
| **Conversation** | Chat thread between buyer and seller for a listing |
| **Message** | Chat messages; types: text, image, location, offer, system |
| **Offer** | Price negotiation; amount, currency, status, parent offer for counter chains, expiry |
| **ConversationRead** | Read receipt tracking per user per conversation |
| **Notification** | User notifications with payload JSON |
| **Bookmark** | Junction table for saved listings |
| **WishlistItem** | Saved search keywords |
| **Rating** | Post-transaction ratings (1–5 stars + comment) |
| **Report** | Reports against listings or users |
| **Badge** | Achievement badges |
| **UserBadge** | Junction table for earned badges |
| **ModerationAction** | Admin audit log |
| **ListingView** | View tracking per user per listing |

---

## 7. Integrations

| Integration | Purpose |
|-------------|---------|
| **Cloudinary** | Signed image uploads for listings, avatars, and chat attachments |
| **Nodemailer / Gmail SMTP** | Verification codes and password reset emails |
| **Firebase Cloud Messaging (FCM)** | Push notifications for messages, offers, price drops |
| **Socket.IO** | Real-time messaging, offer updates, notifications, typing indicators |

---

## 8. Security & Privacy

| Feature | Implementation |
|---------|---------------|
| **Helmet** | Security headers |
| **CORS** | Origin whitelist with dynamic `F_URL` parsing |
| **Rate Limiting** | 300/15min general, 50/15min auth |
| **Content Moderation** | Profanity blocklist + contact info detection |
| **HTTP-only Cookies** | Refresh tokens |
| **Token Versioning** | Global refresh revocation on logout |
| **Password Hashing** | bcrypt (12 rounds) |
| **Zod Validation** | All write endpoints |
| **Trust Proxy** | Accurate IP tracking behind Render reverse proxy |

---

## 9. Testing

| Suite | Tests |
|-------|-------|
| **Unit** | `moderation.test.ts` — profanity/contact detection |
| **Unit** | `campus-isolation.test.ts` — cross-campus data isolation |
| **Integration** | `auth.test.ts` — signup, login, verify, refresh |
| **Integration** | `listings.test.ts` — CRUD, bookmarks, similar listings |
| **Integration** | `conversations.test.ts` — create conversation, send message, get history |
| **API Route** | Vitest-based route tests |

**Total: 28+ passing tests**

---

## 10. Deployment

| Environment | Service | URL / Config |
|-------------|---------|--------------|
| **Frontend (dev)** | Vite Dev Server | `http://localhost:5173` |
| **Backend (dev)** | Express + TS | `http://localhost:5000` |
| **Frontend (prod)** | Vercel | `https://campuskart.vercel.app` |
| **Backend (prod)** | Render | `https://campuskart-g07o.onrender.com` |
| **Database** | Neon PostgreSQL | `ep-old-truth-azlq8zp6-pooler.c-3.ap-southeast-1.aws.neon.tech` |
| **Container** | Docker + nginx | `docker-compose.yml` + `nginx.conf` |

### Dev Scripts
| Command | Purpose |
|---------|---------|
| `npm run dev` (root) | Start backend with tsx watch |
| `cd campuskart && npm run dev` | Start Vite frontend dev server |
| `cd campuskart_backend && npm run dev` | Start backend directly |
| `npm run test` | Run vitest tests |

---

## 11. Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Student | `alex.chen@heritageit.edu.in` | `password123` |
| Admin | `admin@heritageit.edu.in` | `admin123` |

---

## 12. Known Limitations

1. **Redis not deployed:** Socket.IO runs in single-process mode; horizontal scaling requires Redis adapter
2. **Frontend mock seed:** `mockSeed.js` exists alongside real API; may mask API failures if not managed
3. **Vercel rewrites:** Frontend relies on Vercel `rewrites` to proxy `/api/*` to Render backend
4. **FCM not configured:** Push notification service is implemented but `FCM_SERVER_KEY` is empty
5. **In-memory cache:** API response cache is per-instance and not shared across server processes

---

## 13. Feature Connectivity Map

```
LandingPage
  ├─► LoginPage ──► FeedPage
  ├─► SignUpPage ──► VerifyEmailPage ──► FeedPage
  └─► Admin login ──► AdminPage

FeedPage
  ├─► Category chips ──► filtered FeedPage
  ├─► Filter drawer ──► filtered FeedPage
  ├─► Search ──► filtered FeedPage
  └─► ListingCard ──► ListingDetailPage

ListingDetailPage
  ├─► "Message Seller" ──► MessagesPage
  ├─► "Make Offer" ──► MessagesPage (offer flow)
  ├─► Bookmark ──► SavedPage
  └─► Similar listings ──► ListingDetailPage

MessagesPage
  ├─► Conversation list ──► active chat
  ├─► Send message ──► real-time via Socket.IO
  ├─► Make offer ──► Offer flow ──► real-time update
  └─► Share location ──► location message

ProfilePage
  ├─► Edit profile ──► modal
  ├─► Active listings ──► ListingDetailPage
  └─► "Post Listing" ──► CreateListingPage

CreateListingPage
  ├─► Category dropdown ──► GET /api/v1/categories
  ├─► Image upload ──► Cloudinary
  └─► Submit ──► POST /api/v1/listings ──► ListingDetailPage

AdminPage
  ├─► Analytics ──► GET /api/v1/admin/analytics
  ├─► Users tab ──► GET/PATCH /api/v1/admin/users
  ├─► Listings tab ──► GET/PATCH /api/v1/admin/listings
  └─► Reports tab ──► GET/PATCH /api/v1/admin/reports

NotificationsPage
  ├─► Notification list ──► GET /api/v1/notifications
  ├─► Mark read ──► PATCH /api/v1/notifications/:id/read
  └─► Click ──► navigate to conversation/listing

LeaderboardPage
  ├─► Top sellers ──► GET /api/v1/campuses/me/leaderboard
  ├─► Most helpful ──► GET /api/v1/campuses/me/leaderboard
  └─► Trending categories ──► GET /api/v1/campuses/me/trends

SavedPage
  └─► Bookmarked listings ──► GET /api/v1/listings/bookmarks

WishlistPage
  ├─► Add keyword ──► POST /api/v1/wishlist
  └─► Remove keyword ──► DELETE /api/v1/wishlist/:id
```

---

*Document generated from codebase analysis. Last updated: 2026-09-22*
