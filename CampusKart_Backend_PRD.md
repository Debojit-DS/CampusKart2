# CampusKart — Backend Product Requirements Document (PRD)

**Version:** 1.0
**Source:** Derived from `CampusKart-Project-Summary.pdf` (product vision) and `CampusKart_Frontend_PRD.md` (data contracts, API surface, and screen-by-screen requirements)
**Scope:** Strictly backend — API, database, auth, real-time, storage, notifications, admin, and AI-assist services. This document intentionally reuses the **exact type names and field names** defined in the Frontend PRD §7 so the two documents can be handed to independent engineers (or agents) and still integrate without a translation layer.
**Intended audience:** A backend engineer or autonomous coding agent building the CampusKart API from scratch.

---

## 0. How to use this document

1. Section 1–2 give the product recap and guiding principles — read first, they explain *why* several schema/endpoint decisions were made.
2. Section 3 is the recommended stack and high-level architecture.
3. Section 4 is the full database schema — build this first, it's the foundation everything else sits on.
4. Section 5 covers auth & campus verification, the product's core trust mechanism.
5. Section 6 is the complete REST API spec (request/response bodies), a strict superset of Frontend PRD §8.
6. Section 7 covers real-time chat & negotiation (Socket.IO event contract).
7. Section 8 covers file/image upload and the AI-assist features (image quality check, price suggestion, description generator).
8. Section 9 covers notifications (in-app + push).
9. Section 10 covers admin/moderation.
10. Section 11 covers the "extra features" from the product summary (wishlist, ratings, badges, leaderboard, exchange mode, QR codes, heatmap, price-drop alerts).
11. Section 12 covers security, privacy, and abuse-prevention.
12. Section 13 covers non-functional requirements, deployment, and environment config.
13. Section 14 is a build-order checklist / MVP cut line for a hackathon timeline.

---

## 1. Product Recap (for backend context)

CampusKart is a **campus-only** peer-to-peer marketplace. Two user types (buyer, seller — the same account can be both). Core loop: a verified student lists an item → other verified students from the **same campus** browse/search/filter → a buyer messages the seller or makes a formal offer → they negotiate in-app → they agree a price → they meet at a **fixed, named pickup spot** on campus → cash/UPI changes hands **outside the platform** → seller marks the listing sold.

Backend must enforce three product-critical rules everywhere data crosses a campus boundary:

1. **Campus isolation.** A user only ever sees listings, categories-in-use, and other users from their own `campusId`. This is not a UI filter — it must be enforced in every query and every authorization check server-side.
2. **No payments.** The backend never stores payment credentials, never integrates a payment gateway, and never handles money. `Offer`/negotiation is a *price agreement* mechanism only.
3. **No precise location.** The backend never stores or exposes GPS coordinates for users or meetups. Only free-text/enumerated `pickupLocation` strings (from a per-campus curated list) are ever persisted.

---

## 2. Guiding Principles

- **Contract-first with the frontend.** Section 4 (schema) and Section 6 (API) mirror Frontend PRD §7/§8 field-for-field. Where the backend needs additional fields (e.g. `passwordHash`, `reportCount`), they are additive and never rename/remove a field the frontend already depends on.
- **Campus as a first-class tenant boundary**, not just a foreign key to filter by convenience. Every list/search endpoint implicitly scopes to `req.user.campusId` server-side, even if the frontend forgets to pass it.
- **Soft state over hard deletes.** Listings, users, and messages are soft-deleted/status-flagged (`removed`, `banned`, etc.) rather than hard-deleted, so chat history, ratings, and reports remain consistent and auditable.
- **Idempotent, resumable negotiation.** Every accept/reject/counter action creates a new `Offer` row (chained via `parentOfferId`) rather than mutating one row — this matches Frontend PRD §5.6's explicit requirement for a *history* of offers, not a single mutable card.
- **MVP-friendly, scale-later.** Recommendations favor a single Postgres database and a monolithic Node/Express API for hackathon velocity, with clear seams (service layer, event-driven notification dispatch) to split into workers/microservices later without a rewrite.

---

## 3. Recommended Stack & Architecture

Matches the "Suggested Tool" table in the project summary (§15), made concrete:

| Layer | Choice | Notes |
|---|---|---|
| Runtime / API framework | **Node.js + Express** (or Fastify) | REST API, TypeScript strongly recommended so §4/§6 types are shared with frontend via a `types` package. |
| Database | **PostgreSQL** | Relational integrity matters here (offer chains, ratings, reports, campus isolation via FK constraints). Use Prisma or Drizzle as the ORM/query builder. MongoDB is viable but loses easy referential integrity for the negotiation chain and reporting joins — Postgres is the stronger default. |
| Real-time chat | **Socket.IO** (server) over the same Node process, backed by a Redis adapter once horizontally scaled | See §7. |
| Image/file storage | **Cloudinary** | Listing photos, avatars, chat image attachments. Backend only stores the resulting URLs, never raw binary in Postgres. |
| Auth | **Firebase Auth or Clerk** for credential storage + session/JWT issuance, **or** a self-rolled `bcrypt` + JWT flow if avoiding a third-party dependency for a hackathon. This PRD specs the self-rolled flow as the default (simplest to reason about end-to-end) and calls out the Firebase/Clerk swap points. |
| Push notifications | **Firebase Cloud Messaging (FCM)** | For mobile/web push; in-app notifications are always stored in Postgres regardless of push delivery. |
| AI-assist features | **A hosted multimodal LLM API** (e.g. via the Anthropic API) for image-quality checking, price suggestion, and description generation — see §8.4. Backend wraps these as internal endpoints so the frontend never calls a third-party AI API directly. |
| Hosting | **Render** (API + Postgres + Redis) or **Railway**; **Vercel** for the frontend only (per Frontend PRD). | |
| Background jobs | **A simple queue** (BullMQ on Redis, or `node-cron` for hackathon scope) | Price-drop alerts, wishlist-match notifications, report-count aggregation, session/offer expiry. |

**High-level architecture:**

```
[Frontend (Next.js/Vercel)]
        |
        |  HTTPS (REST) + WSS (Socket.IO)
        v
[API Gateway / Express App] --- Auth middleware (JWT, campus check)
        |
        +--> [Listings Service]      --> Postgres
        +--> [Users/Profile Service] --> Postgres
        +--> [Messaging Service]     --> Postgres + Socket.IO + Redis pub/sub
        +--> [Offers/Negotiation]    --> Postgres
        +--> [Notifications Service] --> Postgres + FCM
        +--> [Admin/Moderation]      --> Postgres
        +--> [AI-Assist Service]     --> External LLM API (server-side only)
        +--> [Media Service]         --> Cloudinary
        +--> [Background Jobs]       --> Redis Queue --> Postgres/FCM
```

---

## 4. Database Schema

All tables include `created_at` / `updated_at` timestamps (omitted below for brevity except where semantically important). All IDs are UUIDs unless noted. This schema is a **direct implementation** of Frontend PRD §7's TypeScript interfaces, plus the backend-only fields those interfaces intentionally omit (marked 🔒 backend-only).

### 4.1 `institutions` (Frontend `Institution`)
```sql
CREATE TABLE institutions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  email_domains TEXT[] NOT NULL,        -- e.g. {'heritageit.edu.in'}
  departments   TEXT[] NOT NULL DEFAULT '{}',
  is_active     BOOLEAN NOT NULL DEFAULT true,  -- 🔒 admin can disable an institution
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_institutions_domains ON institutions USING GIN (email_domains);
```
This is the **campus tenant table**. Signup resolves `email domain -> institution.id`; that becomes `users.campus_id` and is inherited by every listing the user creates.

### 4.2 `users` (Frontend `User`)
```sql
CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name         TEXT NOT NULL,
  email             CITEXT UNIQUE NOT NULL,
  password_hash     TEXT NOT NULL,                -- 🔒 never exposed via API
  avatar_url        TEXT,
  is_verified       BOOLEAN NOT NULL DEFAULT false, -- email verification, not identity/KYC
  campus_id         UUID NOT NULL REFERENCES institutions(id),
  department        TEXT,
  year_of_study     SMALLINT CHECK (year_of_study BETWEEN 1 AND 6), -- extended to cover grad/PhD per Frontend §5.3
  joined_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  rating_average    NUMERIC(2,1) DEFAULT 0,        -- denormalized, recomputed on new rating
  rating_count      INT DEFAULT 0,
  role              TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student','admin')), -- 🔒
  status            TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','banned')), -- 🔒
  report_count      INT NOT NULL DEFAULT 0,        -- 🔒 denormalized for admin sort
  fcm_token         TEXT,                          -- 🔒 push notification target
  last_active_at    TIMESTAMPTZ                    -- 🔒 for "trending"/analytics
);
CREATE INDEX idx_users_campus ON users(campus_id);
```

### 4.3 `categories` (Frontend `Category`)
```sql
CREATE TABLE categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug       TEXT UNIQUE NOT NULL,
  label      TEXT NOT NULL,
  parent_id  UUID REFERENCES categories(id)
);
```
Seed with the taxonomy from the project summary §5: `Academic`, `Hostel`, `Electronics`, `Sports`, `Others` as top-level, with subcategories (e.g. Academic → Lab Coats, Drawing Kits, Calculators, Books & Notes) as children via `parent_id`. This satisfies Frontend Listing Detail's `categoryTop • categorySub` eyebrow label.

### 4.4 `pickup_spots` 🔒 (backend addition, not in Frontend §7 as a distinct entity — currently modeled there as free text `pickupLocation`)
```sql
CREATE TABLE pickup_spots (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campus_id   UUID NOT NULL REFERENCES institutions(id),
  label       TEXT NOT NULL,      -- e.g. "Library Gate", "Hostel C", "Main Gate"
  is_active   BOOLEAN NOT NULL DEFAULT true
);
```
**Why this exists even though the frontend types a listing's pickup location as free text:** the project summary (§11, §17.1) explicitly calls for a **fixed, curated list of pickup spots per campus** rather than free text or GPS, as the core safety mechanism. Backend implementation: `GET /campuses/:id/pickup-spots` returns this list; the frontend's `Listing.pickupLocation` field is populated by **storing the spot's `label` string** at listing-creation time (kept as a string on `listings` for frontend simplicity and to preserve history if a spot is later renamed/deactivated), while `pickup_spot_id` is also stored 🔒 for admin analytics (§11.6 Campus Heatmap).

### 4.5 `listings` (Frontend `Listing`)
```sql
CREATE TYPE listing_type      AS ENUM ('item','wanted');
CREATE TYPE listing_condition AS ENUM ('new','like_new','good','fair','used');
CREATE TYPE listing_status    AS ENUM ('active','sold','reserved','removed');

CREATE TABLE listings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type              listing_type NOT NULL DEFAULT 'item',
  title             TEXT NOT NULL,
  description       TEXT NOT NULL,
  price             NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  currency          TEXT NOT NULL DEFAULT 'INR',   -- ISO 4217
  is_negotiable     BOOLEAN NOT NULL DEFAULT true, -- surfaced on Listing Detail per project summary §6
  condition         listing_condition,             -- nullable for 'wanted' type
  category_top_id   UUID REFERENCES categories(id),
  category_sub_id   UUID REFERENCES categories(id),
  pickup_location   TEXT NOT NULL,                 -- denormalized label, see §4.4
  pickup_spot_id    UUID REFERENCES pickup_spots(id), -- 🔒
  seller_id         UUID NOT NULL REFERENCES users(id),
  campus_id         UUID NOT NULL REFERENCES institutions(id), -- inherited from seller at creation
  status            listing_status NOT NULL DEFAULT 'active',
  is_urgent         BOOLEAN NOT NULL DEFAULT false, -- "Urgent Sale Badge", project summary §14
  exchange_only     BOOLEAN NOT NULL DEFAULT false, -- "Exchange Mode", project summary §14
  exchange_for      TEXT,                           -- free text, e.g. "keyboard for calculator"
  view_count        INT NOT NULL DEFAULT 0,         -- 🔒 for "Campus Trends"/analytics
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_listings_campus_status ON listings(campus_id, status);
CREATE INDEX idx_listings_category ON listings(category_top_id);
CREATE INDEX idx_listings_search ON listings USING GIN (to_tsvector('english', title || ' ' || description));
```

### 4.6 `listing_images` (Frontend `ListingImage`)
```sql
CREATE TABLE listing_images (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  alt_text    TEXT,
  sort_order  INT NOT NULL DEFAULT 0,
  quality_flag TEXT CHECK (quality_flag IN ('ok','blurry','dark','unclear')) -- 🔒 AI Image Quality Checker result, §8.4
);
```

### 4.7 `conversations` / `messages` / `offers` (Frontend `Conversation` / `Message` / `Offer`)
```sql
CREATE TABLE conversations (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id     UUID NOT NULL REFERENCES listings(id),
  buyer_id       UUID NOT NULL REFERENCES users(id),
  seller_id      UUID NOT NULL REFERENCES users(id),
  last_message_preview TEXT,
  last_message_at      TIMESTAMPTZ,
  UNIQUE (listing_id, buyer_id)   -- one thread per buyer per listing
);

CREATE TYPE message_type AS ENUM ('text','offer','location','image','system');

CREATE TABLE messages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id        UUID NOT NULL REFERENCES users(id),
  type             message_type NOT NULL DEFAULT 'text',
  text             TEXT,
  offer_id         UUID,             -- FK added after offers table (circular), see below
  image_url        TEXT,
  location_label   TEXT,             -- for type='location', a pickup_spots.label snapshot
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TYPE offer_status AS ENUM ('pending','accepted','rejected','countered','expired');

CREATE TABLE offers (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  listing_id       UUID NOT NULL REFERENCES listings(id),
  proposed_by_id   UUID NOT NULL REFERENCES users(id),
  amount           NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  currency         TEXT NOT NULL DEFAULT 'INR',
  status           offer_status NOT NULL DEFAULT 'pending',
  parent_offer_id  UUID REFERENCES offers(id),   -- counter-offer chain
  expires_at       TIMESTAMPTZ,                  -- 🔒 optional auto-expiry (e.g. 48h), background job marks 'expired'
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE messages ADD CONSTRAINT fk_messages_offer FOREIGN KEY (offer_id) REFERENCES offers(id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX idx_offers_conversation ON offers(conversation_id);
```
**Unread tracking:** rather than a stored per-user counter on `conversations` (Frontend's `unreadCountForCurrentUser` is a *derived* field the API computes at read time), add:
```sql
CREATE TABLE conversation_reads (
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id),
  last_read_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (conversation_id, user_id)
);
```
`unreadCountForCurrentUser` = `COUNT(messages WHERE conversation_id = X AND created_at > conversation_reads.last_read_at AND sender_id != current_user)`.

### 4.8 `notifications` (Frontend `Notification`)
```sql
CREATE TYPE notification_type AS ENUM (
  'new_message','new_offer','offer_accepted','offer_rejected',
  'listing_saved_price_drop','wishlist_match','achievement_unlocked','system'
);

CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id),
  type        notification_type NOT NULL,
  payload     JSONB NOT NULL DEFAULT '{}',   -- e.g. {"conversationId": "..."} or {"listingId": "..."}
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);
```

### 4.9 Supporting tables for "extra features" (project summary §14) — see §11 for the endpoints that use them

```sql
-- Bookmarks / Saved listings
CREATE TABLE bookmarks (
  user_id     UUID NOT NULL REFERENCES users(id),
  listing_id  UUID NOT NULL REFERENCES listings(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, listing_id)
);

-- Wishlist (structured, distinct from bookmarks — a wishlist item may not exist as a listing yet)
CREATE TABLE wishlist_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id),
  keyword      TEXT NOT NULL,          -- e.g. "Calc 101 Textbook"
  category_id  UUID REFERENCES categories(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ratings (buyer <-> seller, post-transaction)
CREATE TABLE ratings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id   UUID NOT NULL REFERENCES listings(id),
  rater_id     UUID NOT NULL REFERENCES users(id),
  ratee_id     UUID NOT NULL REFERENCES users(id),
  stars        SMALLINT NOT NULL CHECK (stars BETWEEN 1 AND 5),
  comment      TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (listing_id, rater_id)
);

-- Reports (moderation, project summary §12)
CREATE TYPE report_reason AS ENUM ('spam','fake_item','wrong_price','inappropriate','scam','duplicate','other');
CREATE TYPE report_status AS ENUM ('open','reviewing','resolved','dismissed');

CREATE TABLE reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id     UUID NOT NULL REFERENCES users(id),
  listing_id      UUID REFERENCES listings(id),
  reported_user_id UUID REFERENCES users(id),
  reason          report_reason NOT NULL,
  details         TEXT,
  status          report_status NOT NULL DEFAULT 'open',
  resolved_by     UUID REFERENCES users(id),   -- admin
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Achievement badges (gamification)
CREATE TABLE badges (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,   -- 'first_sale','trusted_seller','ten_deals'
  label         TEXT NOT NULL,
  description   TEXT NOT NULL
);
CREATE TABLE user_badges (
  user_id     UUID NOT NULL REFERENCES users(id),
  badge_id    UUID NOT NULL REFERENCES badges(id),
  awarded_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, badge_id)
);

-- Admin moderation actions log
CREATE TABLE moderation_actions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id     UUID NOT NULL REFERENCES users(id),
  action       TEXT NOT NULL,        -- 'warn_user','ban_user','remove_listing','resolve_report'
  target_type  TEXT NOT NULL,        -- 'user' | 'listing' | 'report'
  target_id    UUID NOT NULL,
  reason       TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 5. Authentication & Campus Verification

This is the product's core trust mechanism (project summary §4, §17.2) and must be treated as a first-class backend concern, not an afterthought.

### 5.1 Flow
1. **Signup** — `POST /auth/signup` with `{ email, fullName, password, department, yearOfStudy }`.
   - Extract the domain from `email`; look up `institutions WHERE email_domains @> ARRAY[domain]`.
   - If no match → `400 { error: "UNSUPPORTED_INSTITUTION" }` (frontend should offer a "request your campus" fallback — out of scope for MVP, log the attempt).
   - Hash password with `bcrypt` (cost factor 12).
   - Create `users` row with `is_verified = false`, `campus_id` from the resolved institution.
   - Generate a verification token (JWT or random 6-digit code, 15 min expiry), store hashed, email it (or log to console for hackathon demo — flag as a config toggle `EMAIL_PROVIDER=console|smtp`).
2. **Verify email** — `POST /auth/verify-email { email, code }` → sets `is_verified = true`. Unverified users can log in but get a `403 { error: "EMAIL_NOT_VERIFIED" }` on any write action (listing creation, messaging, offers) until verified — read-only browsing is allowed pre-verification so the funnel doesn't feel like a dead end.
3. **Login** — `POST /auth/login { email, password }` → verify hash, issue a short-lived **access JWT** (15 min) + long-lived **refresh token** (httpOnly cookie, 30 days). Do not reveal whether email or password was the failing factor (matches Frontend PRD §5.2's stated requirement).
4. **Session refresh** — `POST /auth/refresh` (reads refresh cookie) → new access JWT.
5. **Logout** — `POST /auth/logout` → revoke refresh token (store a revocation list or rotate a `token_version` column on `users`).
6. **Forgot/reset password** — `POST /auth/forgot-password { email }` → emails a reset link/token; `POST /auth/reset-password { token, newPassword }`.

### 5.2 JWT payload
```json
{ "sub": "user-uuid", "campusId": "institution-uuid", "role": "student", "tokenVersion": 3, "iat": ..., "exp": ... }
```
`campusId` is embedded in the token so **every downstream query can scope by it without an extra DB lookup**, and so a stale token can't leak cross-campus data even if `users.campus_id` were ever changed.

### 5.3 Authorization middleware
- `requireAuth` — validates JWT, attaches `req.user = { id, campusId, role }`.
- `requireVerified` — 403s unverified users on write routes.
- `requireCampusMatch(resourceCampusId)` — used on any single-resource fetch (e.g. `GET /listings/:id`) to 404 (not 403 — don't leak existence) if the resource's `campus_id !== req.user.campusId`.
- `requireOwnership(resourceOwnerId)` — used on edit/delete/mark-sold routes.
- `requireAdmin` — for §10 admin routes.

### 5.4 Swap points for Firebase Auth / Clerk
If the team prefers a managed provider instead of the self-rolled flow above: replace §5.1 steps 1–3 with the provider's signup/login SDK calls, keep the **institution-domain resolution and `campus_id` assignment as a post-signup webhook/hook** (Firebase: Cloud Function on user-create; Clerk: `user.created` webhook), and keep JWT verification middleware but validate the provider's token instead of a self-issued one. All downstream schema/endpoints in this document are unaffected either way.

---

## 6. REST API Specification

Base path: `/api/v1`. All authenticated routes require `Authorization: Bearer <accessToken>`. All list endpoints are campus-scoped server-side automatically (§5.3) — the frontend never needs to pass `campusId` explicitly.

This section is a strict superset of Frontend PRD §8; every endpoint listed there is specified in full below, plus the additional endpoints needed for §11's extra features.

### 6.1 Auth
| Method | Endpoint | Body | Response |
|---|---|---|---|
| POST | `/auth/signup` | `{email, fullName, password, department, yearOfStudy}` | `201 {userId, message}` |
| POST | `/auth/verify-email` | `{email, code}` | `200 {verified: true}` |
| POST | `/auth/login` | `{email, password}` | `200 {accessToken, user: User}` + refresh cookie |
| POST | `/auth/refresh` | (cookie) | `200 {accessToken}` |
| POST | `/auth/logout` | — | `204` |
| POST | `/auth/forgot-password` | `{email}` | `202` (always, to avoid email enumeration) |
| POST | `/auth/reset-password` | `{token, newPassword}` | `200` |

### 6.2 Institutions
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/institutions?emailDomain=` | Resolve institution for signup domain validation (public) |
| GET | `/institutions/:id/pickup-spots` | Curated pickup-spot list for the listing form and location-picker |
| GET | `/institutions/:id/departments` | Department list for signup dropdown |

### 6.3 Listings
| Method | Endpoint | Notes |
|---|---|---|
| GET | `/listings?category=&search=&cursor=&sort=&condition=&minPrice=&maxPrice=&status=` | Cursor-paginated, campus-scoped. `sort ∈ {newest, price_asc, price_desc}`. Default `status=active`. Powers Home Feed, Search, Category. |
| GET | `/listings/:id` | 404 if wrong campus or `status=removed`. Increments `view_count` (fire-and-forget). |
| GET | `/listings/:id/similar` | Same `category_top_id`, `status=active`, excludes self, ranked by recency, limit 8. |
| POST | `/listings` | Body matches `Listing` minus server-set fields; requires `requireVerified`. `campus_id` and `seller_id` forced from `req.user` (never trust client-supplied values here). |
| PATCH | `/listings/:id` | Owner-only. Used for edit and for `{status: "sold"}` (Mark Sold). Marking sold triggers: reject all other `pending` offers on the listing, notify interested wishlist/price-drop watchers is NOT applicable (item is gone), award `first_sale`/`ten_deals` badges if thresholds met (§11.5). |
| DELETE | `/listings/:id` | Owner-only, soft delete → `status='removed'`. |
| POST | `/listings/:id/bookmark` | Idempotent insert into `bookmarks`. |
| DELETE | `/listings/:id/bookmark` | Idempotent delete. |
| GET | `/listings/mine` | Current user's own listings (for Profile §11.2/owner Listing Detail view). |

**Request body for `POST /listings`:**
```json
{
  "type": "item",
  "title": "Engineering Drawing Kit",
  "description": "Includes...",
  "price": 500,
  "currency": "INR",
  "isNegotiable": true,
  "condition": "excellent",
  "categoryTopId": "uuid",
  "categorySubId": "uuid",
  "pickupSpotId": "uuid",
  "imageUrls": ["https://res.cloudinary.com/..."],
  "isUrgent": false,
  "exchangeOnly": false,
  "exchangeFor": null
}
```
Note: `condition` enum in this doc's schema is `new|like_new|good|fair|used` per Frontend §7.2; the project summary's example card uses "Excellent" as display copy — **reconcile by mapping `like_new` → displayed as "Excellent"/"Like New" per campus copy preference**, keep the underlying enum stable. Flagging this drift explicitly rather than silently picking one, same convention as Frontend PRD §2.2's color-token note.

### 6.4 Categories
| Method | Endpoint |
|---|---|
| GET | `/categories` — full tree (top-level + children via `parentId`), cached aggressively (changes rarely). |

### 6.5 Conversations, Messages, Offers
| Method | Endpoint | Notes |
|---|---|---|
| GET | `/conversations` | List for current user, both as buyer and seller, sorted by `last_message_at desc`, with computed `unreadCountForCurrentUser` per §4.7. |
| GET | `/conversations/:id` | Full `Message[]` + inline `Offer[]` (joined so the frontend can render `NegotiationOfferCard` at the correct chronological position — see §7.3 for exact join shape). 403 if `req.user.id` is not a participant. |
| POST | `/conversations` | `{listingId}` — finds-or-creates the thread for `(listingId, buyerId=req.user.id)`. If `req.user.id === listing.sellerId`, reject with `400 {error: "CANNOT_MESSAGE_OWN_LISTING"}`. |
| POST | `/conversations/:id/messages` | `{type: "text", text}` or `{type:"image", imageUrl}` or `{type:"location", locationLabel}` — see §7 for why this is also exposed as a Socket.IO event. |
| POST | `/conversations/:id/offers` | `{amount, currency}` — creates `offers` row `status='pending'`, plus a `messages` row `type='offer', offer_id=...` in the same DB transaction. |
| PATCH | `/offers/:id` | `{action: "accept" \| "reject" \| "counter", amount?}`. `accept`/`reject` update `status` on the *existing* offer and insert a `system` message; `counter` sets the old offer's status to `countered` and **creates a new `offers` row** with `parent_offer_id` pointing at it (chain, not mutation — matches Frontend §5.6/§7.4). Only the *other* participant (not the proposer) may act on a pending offer. |
| PATCH | `/conversations/:id/read` | Upserts `conversation_reads.last_read_at = now()` for `req.user.id`. Called by frontend when a thread is opened/focused. |

### 6.6 Notifications
| Method | Endpoint |
|---|---|
| GET | `/notifications?cursor=` |
| PATCH | `/notifications/:id/read` |
| PATCH | `/notifications/read-all` |
| GET | `/notifications/unread-count` — cheap endpoint for the header badge, or derive from the socket-pushed count (§7.4). |

### 6.7 Users / Profile
| Method | Endpoint | Notes |
|---|---|---|
| GET | `/users/:id` | Public profile: name, avatar, `isVerified`, department, year, `ratingAverage`, `ratingCount`, active listing count, badges. Never exposes `email`. |
| PATCH | `/users/me` | Edit own name/avatar/department/year/`fcmToken`. |
| GET | `/users/me/badges` | For profile screen. |
| POST | `/listings/:id/ratings` | `{stars, comment?}` — rate the counterpart after a `sold` transaction; `ratee_id` derived server-side from the listing/conversation, not client-supplied (prevents rating spoofing). Recomputes `users.rating_average`/`rating_count`. |

### 6.8 Reports
| Method | Endpoint |
|---|---|
| POST | `/reports` — `{listingId?, reportedUserId?, reason, details?}`. |

### 6.9 Wishlist
| Method | Endpoint |
|---|---|
| GET | `/wishlist` |
| POST | `/wishlist` — `{keyword, categoryId?}` |
| DELETE | `/wishlist/:id` |

Background job matches new listings against active wishlist keywords (simple `ILIKE`/trigram similarity on title, or a scheduled full-text query) and fires a `wishlist_match` notification (§4.8, §9).

### 6.10 Leaderboard & Trends
| Method | Endpoint |
|---|---|
| GET | `/campuses/me/leaderboard?type=top_sellers\|most_helpful` | Ranks by `sold` listing count / rating within the user's own campus only — never cross-campus, keeps the "friendly competition" scoped to a community people actually recognize. |
| GET | `/campuses/me/trends` | Most-viewed/most-listed categories in the trailing 7 days, for "Campus Trends". |
| GET | `/campuses/me/heatmap` | Aggregated count of `sold` listings grouped by `pickup_spot_id`, for "Campus Heatmap". |

---

## 7. Real-Time Chat & Negotiation (Socket.IO)

REST endpoints in §6.5 are the source of truth and work standalone (poll-friendly, matches Frontend PRD §8's note that the frontend should be built against a hook abstraction that can be "polling now, sockets later"). Socket.IO is layered on top purely for push delivery so the frontend doesn't have to poll.

### 7.1 Connection
Client connects with the access JWT as an auth handshake param: `io(url, { auth: { token } })`. Server verifies the token, joins the socket to a room per user (`user:{userId}`) and a room per open conversation (`conversation:{id}`) on demand.

### 7.2 Events (server → client)
| Event | Payload | Fired when |
|---|---|---|
| `message:new` | `Message` (full row, camelCased) | A `POST /conversations/:id/messages` (or offer creation, which also inserts a message) succeeds — broadcast to `conversation:{id}` room. |
| `offer:updated` | `Offer` | Any `PATCH /offers/:id` action. |
| `conversation:updated` | `{conversationId, lastMessagePreview, lastMessageAt}` | On any new message, broadcast to `user:{buyerId}` and `user:{sellerId}` rooms so the inbox list updates live without opening the thread. |
| `notification:new` | `Notification` | Any notification insert (§9) for a currently-connected user. |
| `presence:typing` | `{conversationId, userId}` | Optional — "X is typing" indicator, ephemeral, not persisted. |

### 7.3 Why messages carry offers inline
`GET /conversations/:id` response shape:
```json
{
  "conversation": { "id": "...", "listingId": "...", "buyerId": "...", "sellerId": "..." },
  "messages": [
    { "id": "m1", "type": "text", "text": "Hi, is this still available?", "senderId": "...", "createdAt": "..." },
    { "id": "m2", "type": "offer", "offerId": "o1", "senderId": "...", "createdAt": "...",
      "offer": { "id": "o1", "amount": 700, "currency": "INR", "status": "countered", "parentOfferId": null } },
    { "id": "m3", "type": "offer", "offerId": "o2", "senderId": "...", "createdAt": "...",
      "offer": { "id": "o2", "amount": 800, "currency": "INR", "status": "pending", "parentOfferId": "o1" } }
  ]
}
```
The nested `offer` object on `type='offer'` messages is a convenience join so the frontend can render `NegotiationOfferCard` inline in correct chronological order (Frontend PRD §5.6/§4.9) without a second round-trip.

### 7.4 Delivery guarantee & offline handling
Socket events are **best-effort push only** — every event they carry is also retrievable via the REST endpoints, so a client that reconnects after being offline should re-`GET /conversations/:id` (or `/notifications`) rather than rely on missed socket events. This matches Frontend PRD §6's offline-banner requirement ("messages will send once you're back online") — the frontend should queue outbound `POST /conversations/:id/messages` calls and retry on reconnect; the backend needs no special handling beyond normal idempotency (client can send a client-generated `clientMessageId` for de-duplication if retried — add `client_message_id UNIQUE` column if this becomes a real requirement post-MVP).

---

## 8. Media Upload & AI-Assist Services

### 8.1 Upload flow
1. Frontend requests a signed upload — `POST /media/sign-upload {folder: "listings"|"avatars"|"chat"}` → backend returns a short-lived Cloudinary signed-upload payload (`{signature, timestamp, apiKey, cloudName, folder}`). Backend never proxies the binary itself (keeps the API stateless and fast).
2. Frontend uploads directly to Cloudinary using that signature.
3. Frontend sends the resulting `secure_url` back in `POST /listings` (`imageUrls`) or `POST /conversations/:id/messages` (`imageUrl`).
4. Backend never trusts a client-supplied Cloudinary URL blindly for listing creation — validate the URL's host is the project's configured Cloudinary cloud name before persisting, to prevent hot-linking arbitrary/abusive external images.

### 8.2 AI Image Quality Checker (project summary §14)
`POST /media/check-quality {imageUrl}` → backend calls a vision-capable LLM API with the image and a fixed prompt asking it to classify `ok | blurry | dark | unclear` and return a one-line reason. Response:
```json
{ "quality": "blurry", "message": "This photo looks a bit blurry — a clearer shot helps buyers trust the listing." }
```
Called client-side **before** the listing is submitted (non-blocking warning, not a hard block — a blurry photo shouldn't prevent a legitimate hackathon-week listing). Store `listing_images.quality_flag` for admin analytics on listing quality trends.

### 8.3 AI Price Suggestion
`POST /listings/price-suggestion {categoryTopId, categorySubId?, condition, title}` → backend queries recent `sold`/`active` listings in the same campus + category + similar condition, computes a price range (simple percentile stats, no AI needed if there's enough data), and **falls back to an LLM call** (given the title/category/condition and general market knowledge) when there's insufficient local data (e.g. a brand-new campus with few listings). Response: `{ "suggestedMin": 400, "suggestedMax": 650, "basis": "local" | "estimated" }`.

### 8.4 AI Description Generator
`POST /listings/generate-description {imageUrls, title, categoryTopId}` → backend sends the image(s) + title + category to a vision LLM with a prompt to write a concise, honest 2–4 sentence marketplace description plus a bullet "Includes:" list if multiple items are visible. Returned as a suggestion the user can edit before submitting — never auto-posted without user review.

**Shared implementation note:** all three AI-assist endpoints are server-side wrappers around a single internal `AiAssistService` so the API key for the underlying LLM provider is never exposed to the client, requests can be rate-limited per-user (prevent abuse/cost blowout), and the provider can be swapped without touching route handlers.

---

## 9. Notifications

### 9.1 Triggers → notification type mapping
| Event | `notification_type` | Recipient |
|---|---|---|
| New message in a thread (recipient not actively viewing it) | `new_message` | Other participant |
| New offer created | `new_offer` | Listing seller (if buyer offered) or buyer (if seller countered) |
| Offer accepted | `offer_accepted` | The other participant |
| Offer rejected | `offer_rejected` | The other participant |
| Price drop on a bookmarked listing | `listing_saved_price_drop` | All users who bookmarked that listing |
| New listing matches a wishlist keyword | `wishlist_match` | Wishlist owner |
| Badge threshold reached | `achievement_unlocked` | The user |

### 9.2 Delivery
Every trigger: (1) insert a `notifications` row, (2) emit `notification:new` over the user's socket room if connected, (3) if the user has an `fcm_token` and is not currently connected (or per user preference, always), send an FCM push with a short title/body derived from `type`+`payload`. Push copy should never include sensitive info (e.g. exact offer amount is fine per product's own chat transparency model; but never include a pickup spot in a push notification body shown on a lock screen — keep that in-app only, minor privacy hardening beyond what's explicitly required but consistent with §12 principles).

### 9.3 Price-drop job
Background job (or a synchronous check inside `PATCH /listings/:id` when `price` decreases): find all `bookmarks` for that listing, insert one `listing_saved_price_drop` notification per bookmarking user, batched to avoid N+1 query patterns.

---

## 10. Admin Panel API (project summary §13)

All routes under `/admin`, gated by `requireAdmin`. Admin accounts are `users.role = 'admin'`, set manually via a seed script or a protected one-time bootstrap endpoint — never self-serve signup.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/admin/users?status=&search=&sort=` | Browse/search all users on the admin's own campus (admins are campus-scoped too, unless a `super_admin` sub-role is added for cross-campus platform operators). |
| PATCH | `/admin/users/:id` | `{status: "suspended"\|"banned"\|"active"}` — logs a `moderation_actions` row. |
| GET | `/admin/listings?status=&reported=true` | Browse/moderate listings, filterable to only reported ones. |
| PATCH | `/admin/listings/:id` | Force-remove a listing (`status='removed'`), logs a `moderation_actions` row. |
| GET | `/admin/reports?status=` | Queue of open reports. |
| PATCH | `/admin/reports/:id` | `{status: "resolved"\|"dismissed", resolutionNote?}` |
| GET | `/admin/analytics` | Dashboard numbers: recent signups (7/30d), total active listings, total users, most active users (by listing/message count), popular categories, sold-vs-active ratio — matches project summary §13's explicit list. |

Every mutating admin action is written to `moderation_actions` (§4.9) for auditability — this is a trust-and-safety product feature (project summary §17.5's "proper moderation system"), not just internal bookkeeping.

---

## 11. Extra / Gamification Features — Backend Mapping

Maps every item in project summary §14 to a concrete backend mechanism, since several are gamification/growth features with no natural home in the core CRUD flow above.

| Feature | Backend mechanism |
|---|---|
| Wishlist | §6.9 + matching job. |
| Recently Viewed | 🔒 New table `listing_views(user_id, listing_id, viewed_at)`, capped/deduped per user (keep last 50); `GET /listings/recently-viewed`. |
| Ratings | §6.7, `ratings` table. |
| Verified Seller Badge | Derived from `users.is_verified`, no extra table — already core to auth. |
| Seller Profile | §6.7 `GET /users/:id`, aggregates listings/ratings/badges. |
| Search | `GET /listings?search=` using the Postgres full-text index (§4.5); upgrade path to a dedicated search service (e.g. Meilisearch/Typesense) if fuzzy/typo-tolerant search becomes a priority post-MVP. |
| QR Code per Listing | No new backend data needed — QR encodes the canonical listing URL (`https://campuskart.app/listing/:id`); generate client-side or via a trivial `GET /listings/:id/qrcode.png` convenience endpoint using a QR-gen library server-side if the frontend prefers not to embed one. |
| Campus Heatmap | §6.10. |
| AI Image Quality Checker | §8.2. |
| AI Price Suggestion | §8.3. |
| AI Description Generator | §8.4. |
| Similar Listings | §6.3 `/listings/:id/similar`. |
| Smart Recommendations | MVP: same as Similar Listings personalized by `listing_views` history (category affinity). Post-MVP: proper collaborative filtering — flag as a stretch goal, not core path. |
| Notifications | §9. |
| Price Drop Alerts | §9.3. |
| Exchange Mode | `listings.exchange_only` / `exchange_for` (§4.5) — no separate matching engine for MVP; surfaced as a filter (`GET /listings?exchangeOnly=true`) and a badge, matching is manual via chat like any other listing. |
| Urgent Sale Badge | `listings.is_urgent` (§4.5), settable at creation/edit, purely a display flag (no auto-expiry logic needed for MVP). |
| Campus Leaderboard | §6.10. |
| Achievement Badges | §4.9 `badges`/`user_badges`. Award logic lives in the same transaction as the triggering event (e.g. `first_sale` awarded inside `PATCH /listings/:id {status:'sold'}` handler when it's the seller's first sold listing) rather than a separate polling job, so it's immediate and simple. |
| Campus Trends | §6.10. |
| Dark Mode | Pure frontend concern, no backend involvement. |

---

## 12. Security, Privacy & Abuse Prevention

- **Campus isolation is enforced at the query layer**, not just via JWT claims — every Prisma/SQL query for listings/users/categories includes a `WHERE campus_id = $1` clause sourced from `req.user.campusId`, never from a client-supplied parameter. Write a shared query-builder helper so this can't be forgotten on a new endpoint.
- **No GPS, ever.** No endpoint accepts or returns latitude/longitude for a user or a meetup. `pickup_spots` are curated, named, campus-approved locations only (project summary §11, §17.1).
- **No payment data.** No card/UPI-ID fields anywhere in the schema. This is a deliberate scope boundary, not an oversight — reject any future feature request to add one without a full compliance review.
- **Rate limiting:** per-IP and per-user limits on `/auth/*` (prevent credential stuffing), `/reports` (prevent report-flooding as a harassment vector), `/media/sign-upload`, and all `/*ai-assist*` endpoints (cost control).
- **Content moderation on chat/listings:** run listing descriptions and chat text through a lightweight profanity/abuse filter before persisting (or asynchronously, flagging for review) — not explicitly requested by the product doc but a baseline expectation for any P2P messaging surface between students.
- **Contact-info leakage:** per Frontend PRD §17.4 (Suggested Improvements #4), the backend should optionally scan outgoing chat `text` messages for phone-number/external-contact patterns and prompt a soft warning client-side (`{warning: "Consider keeping contact in-app until you're comfortable"}`) rather than hard-blocking — this is a nudge, not a filter, since false positives (e.g. someone typing a price like "9000") would be too disruptive if blocking.
- **PII minimization:** `GET /users/:id` (public profile) never returns `email`; `GET /conversations/:id` never returns the counterpart's email either — all contact happens through in-app chat by design.
- **Audit logging:** all admin mutating actions logged (§10); consider extending to security-sensitive user actions (password reset, email change) with a lightweight `auth_events` table if this becomes a compliance requirement later.
- **Input validation:** every POST/PATCH body validated with a schema library (Zod/Joi) mirroring the TypeScript types, rejecting unknown fields to prevent mass-assignment vulnerabilities (e.g. a client should never be able to set `sellerId` or `campusId` directly on listing creation).

---

## 13. Non-Functional Requirements & Deployment

- **Performance targets (hackathon-appropriate, not enterprise SLAs):** feed pagination P95 < 300ms with campus-scale data (hundreds to low-thousands of listings); chat message delivery over sockets < 200ms same-region.
- **Pagination:** cursor-based (`created_at` + `id` composite cursor) on all list endpoints, not offset-based, so infinite scroll (Frontend §5.4) doesn't degrade or produce duplicate/skipped items as new listings are inserted mid-scroll.
- **Environment config** (`.env`):
  ```
  DATABASE_URL=
  JWT_ACCESS_SECRET=
  JWT_REFRESH_SECRET=
  CLOUDINARY_CLOUD_NAME=
  CLOUDINARY_API_KEY=
  CLOUDINARY_API_SECRET=
  FCM_SERVER_KEY=
  AI_ASSIST_API_KEY=
  REDIS_URL=
  EMAIL_PROVIDER=console|smtp
  SMTP_HOST= / SMTP_USER= / SMTP_PASS=   (if EMAIL_PROVIDER=smtp)
  ```
- **Migrations:** Prisma Migrate (or Drizzle Kit) — never hand-edit schema in production; every schema change in this document should correspond to a numbered migration file.
- **Testing priorities for a hackathon timeline (highest value first):** (1) campus-isolation queries — a cross-campus data leak is the single worst possible bug for this product's trust model, (2) offer/counter-offer chain integrity, (3) auth/verification flow, (4) everything else.
- **Deployment:** Render (or Railway) web service for the Express+Socket.IO app, managed Postgres add-on, managed Redis add-on (for Socket.IO adapter + BullMQ). CORS locked to the deployed frontend origin(s) only.

---

## 14. Build-Order Checklist (MVP cut line)

Ordered so that at every stage, the frontend (already built per its own PRD) has something real to integrate against, starting from the screens marked highest-priority there.

1. **Institutions + Auth** (§4.1–4.2, §5) — unblocks Login/Sign Up screens.
2. **Categories + Pickup Spots** seed data (§4.3–4.4) — static reference data the rest depends on.
3. **Listings CRUD + feed/search/filter** (§4.5–4.6, §6.3) — unblocks Home Feed, Listing Detail, Category/Search.
4. **Conversations/Messages/Offers over REST** (§4.7, §6.5) — unblocks Messages screen at a functional (polling) level.
5. **Socket.IO layer** (§7) — upgrades Messages from polling to real-time; not required for a first demo-able build.
6. **Notifications** (§4.8, §9) — unblocks header badges.
7. **Bookmarks + basic profile** (§4.9 `bookmarks`, §6.7) — unblocks Saved and Profile screens.
8. **Admin panel** (§10) — required for the product's own "behind the scenes" pitch but can trail the student-facing app by a day.
9. **Reports + ratings + badges + leaderboard + trends/heatmap** (§11) — genuine differentiators for judging but correctly sequenced last since the core buy/sell/negotiate loop has no hard dependency on them.
10. **AI-assist endpoints** (§8.2–8.4) — highest "wow factor per hour of work" for a hackathon judge, but built last since they're additive to a listing form that must already work without them.

---

*End of document.*
