# CampusKart — Frontend Product Requirements Document (PRD)

**Version:** 1.0
**Source:** Reverse-engineered from 6 Stitch-exported HTML/CSS screens ("CampusKart Corkboard" design system)
**Scope:** Strictly frontend. No backend logic is specified, but every data-bearing UI element is mapped to a named data contract and endpoint stub so a backend can be dropped in later with minimal frontend rework.
**Intended audience:** An autonomous coding agent (e.g. Kilocode, Plotcode, Antigravity, or a human frontend engineer) building this UI from scratch in a modern framework.

---

## 0. How to use this document

1. Section 1–2 give you the design system (tokens, typography, components) — implement this first as a shared theme/library.
2. Section 3 gives the sitemap and routing — scaffold routes before building pages.
3. Section 4 documents shared components used across ≥2 screens — build these as reusable components.
4. Section 5 gives an exhaustive, element-by-element spec for each of the 6 designed screens.
5. Section 6 covers cross-cutting UI states (loading/empty/error/responsive) that were only partially shown in the static exports but must exist in a real app.
6. Section 7–8 define the data contracts and REST API shape the frontend should code against (using mocked/local data until backend is ready), so wiring up a real backend later is a drop-in swap, not a rewrite.
7. Section 9 gives recommended frontend architecture.
8. Section 10 lists screens/flows that are **implied by the UI but not in the provided exports** (e.g. Profile, Notifications, Create Listing, Search Results) — these must be designed/built to spec-match the existing design system so the app doesn't feel incomplete.
9. Section 11–12 cover accessibility and acceptance criteria.

---

## 1. Product Overview

**Name:** CampusKart
**Tagline:** "Someone in your college already has what you need."
**Pitch:** A campus-only, peer-to-peer marketplace where students buy, sell, and trade items (textbooks, electronics, furniture, cycles, stationery, etc.) with other verified students at their own college. No platform payment handling — buyers and sellers negotiate and meet in person at fixed, safe campus pickup spots.

**Core value props (from marketing copy, must be preserved verbatim where used as UI copy):**
- Verified Students Only — sign-up requires a college (`.edu`) email.
- No Platform Money Handling — cash/Venmo/Zelle in person, platform never touches money.
- Fixed Campus Pickup Spots — safety by meeting in known, populated campus locations.

**Primary user flows:**
1. Discover → Browse/Filter the feed → Open a listing → Message the seller or make an offer → Negotiate in chat → Meet up.
2. Post → (implied, see §10) Create a listing → It appears on the corkboard feed.
3. Onboard → Sign up with college email → Verify → Login → Land on Home Feed.

---

## 2. Design System ("CampusKart Corkboard")

### 2.1 Concept / Visual Philosophy
> "A hostel corridor noticeboard brought to life. Dark, warm, low-glare, and tactile."

Implement these visual rules as reusable primitives/utilities, not one-off styles:

- **The Corkboard:** Primary listing feed is a **masonry grid** (CSS columns, not CSS grid) where each card has a small, fixed random-looking rotation between **-1.5deg and +1.5deg**. Rotation values should be deterministic per-item (e.g. hashed from item ID) so they don't reshuffle on re-render, not truly random on every paint.
- **Pin dot:** Every card has an 8px circular "pin" (`.pin-dot`) centered on its top edge, half overlapping the card top border, with an inset+drop shadow to look like a physical pushpin. Pin color is usually `primary` (#E8B93F/#ffd677 depending on screen) but varies (see §5.3 hero collage: rust/teal/primary-container pins used as color-coding).
- **Price tag:** Every price is rendered in a small dark chip using monospace font (JetBrains Mono / IBM Plex Mono), with a tiny dot bullet before the number, and on some surfaces a **notch/flag clip-path** (`clip-path: polygon(...)`) that makes the tag look like a cut price tag with a punched hole on the left edge.
- **Highlighter accent:** `primary` (yellow, #E8B93F / #ffd677) is the **only** color used for primary CTAs and active/selected states. Do not introduce other accent colors for buttons.
- **Tactile decorations:** Small pieces of "tape" (skewed/rotated low-opacity rectangles) and corkboard pin dots appear on cards, auth panels, and the negotiation card to reinforce the noticeboard metaphor. These are pure decoration — implement as absolutely-positioned pseudo-elements or small `<div>`s, never semantic content.
- **Grayscale-on-hover images:** Product photography is desaturated ~20% by default and returns to full color on hover (`grayscale-[20%]` → `group-hover:grayscale-0`), reinforcing a "moody until you look closer" feel.

### 2.2 Color Tokens

> ⚠️ **Note on inconsistency in source files:** The 6 exported screens do not use fully identical color values — some (Home Feed, Product Detail, Chat) use a lighter primary (`#ffd677`) and lighter on-surface (`#ebe1d4`/`#F1ECE1`), while the canonical `DESIGN.md` spec (and the Landing page) defines a slightly different primary (`#E8B93F`) and on-surface (`#F1ECE1`). **Treat `DESIGN.md`'s values below as the single source of truth** for a production build, and reconcile screen-level drift during implementation (the deltas are minor luminance tweaks, not different colors).

Implement as a Tailwind theme extension (or CSS custom properties) exactly as follows:

| Token | Hex | Usage |
|---|---|---|
| `surface` | `#15130F` | Base app background, header/nav background |
| `surface-bright` | `#1E1B16` | Cards, elevated panels, login/signup card background |
| `surface-container` | `#2B2620` (`#231f17` variant seen in some screens) | Borders, chip backgrounds, dividers |
| `surface-container-lowest` | `#110e07` | Filter bar background, deepest recess |
| `surface-container-low` | `#1f1b13` | Footer background, section background |
| `surface-container-high` | `#2e2921` | Active nav item bg, hover states, step-card bg |
| `surface-container-highest` | `#39342b` | Avatar placeholder bg, step icon bg |
| `surface-dim` | `#17130b` | — |
| `surface-variant` | `#39342b` | Chat bubble borders |
| `background` | `#17130b` | `<body>` background |
| `on-surface` | `#F1ECE1` | Primary text |
| `on-surface-variant` | `#A69C8A` | Secondary/muted text, placeholders, meta text |
| `on-background` | `#ebe1d4` | Body text on background surfaces |
| `primary` | `#E8B93F` | Brand yellow — CTAs, links, active states, price accents |
| `primary-container` | `#e8b93f` | Hover state / alt-primary surfaces |
| `on-primary` | `#3f2e00` | Text/icons on primary-colored buttons |
| `on-primary-container` | `#634a00` | Text on primary-container surfaces |
| `success` / `success-teal` | `#4C9A8C` | Verified badge, success icon accents, "good" trust indicators |
| `error` / `error-rust` | `#C1613F` | Reject actions, destructive accents, decorative pin |
| `info` | `#5E7CE2` | Reserved for informational accents (not heavily used in current screens) |
| `outline` | `#9a8f7b` | Borders on hover, pin-dot fill |
| `outline-variant` | `#4e4635` | Subtle dividers |
| `inverse-surface` / `inverse-on-surface` | `#ebe1d4` / `#353027` | Reserved for toasts/tooltips (not shown but should exist) |

Secondary/tertiary palette tokens (`secondary`, `tertiary`, and their `-container`/`on-*` pairs, `*-fixed*` variants) exist in the design tokens but are **not visibly used** in any of the 6 screens. Wire them into the theme for completeness/future use, but do not invent new UI with them without design sign-off.

### 2.3 Typography

| Token | Font family | Size / Line-height / Weight | Usage |
|---|---|---|---|
| `display-lg` | Libre Caslon Text (serif) | 48px / 56px / 700 | Page hero titles (Landing hero H1, Listing title H1, Login H1) |
| `display-md` | Libre Caslon Text | 36px / 44px / 600 | Section headers ("How it starts", "Similar Listings", Sign Up H1) |
| `headline-sm` | Libre Caslon Text | 24px / 32px / 600 | Card titles, seller name, step titles, "Messages" header |
| `body-lg` | IBM Plex Sans | 18px / 28px / 400 | Hero subcopy, testimonial quote |
| `body-md` | IBM Plex Sans | 16px / 24px / 400 | Default body copy, form labels' paired input text, descriptions |
| `utility-label` | JetBrains Mono | 14px / 20px / 500 / letter-spacing 0.05em | All-caps labels, filter chips, badges, timestamps, form field labels |
| `price-tag` | JetBrains Mono | 16px / 16px / 700 | Every price display |

Font imports required (Google Fonts): `IBM Plex Sans` (400,500,600,700), `JetBrains Mono` (400,500,700,800), `Libre Caslon Text` (400,700, italic 400), `Material Symbols Outlined` (icon font, weight axis 100–700, fill axis 0–1).

> Two font-family names appear in `DESIGN.md` metadata (`Fraunces` for display, `IBM Plex Mono` for utility) that **do not match** what the actual HTML/CSS loads (`Libre Caslon Text` and `JetBrains Mono`). **Build against the fonts actually loaded in the HTML** (Libre Caslon Text / IBM Plex Sans / JetBrains Mono) since that reflects the real rendered UI.

### 2.4 Shape, Spacing, Elevation

- **Border radius scale:** `sm: 2px`, `DEFAULT: 4px`, `md: 6px`, `lg: 8px`, `xl: 12px`, `full: 9999px`. Most cards/buttons/inputs use `DEFAULT`/`sm` (sharp, "paper" edges) — avoid the rounded-corner "app-like" look; this product intentionally reads as flat printed cards, not soft UI.
- **Spacing unit:** 4px base unit. **Gutter:** 16px. **Mobile margin:** 16px. **Desktop margin:** 32px. Use these as the only horizontal page padding values (`px-margin-mobile` / `md:px-margin-desktop`).
- **Elevation:** No large drop shadows/blur — use small, tight, warm-toned box-shadows only (e.g. `0 4px 12px rgba(0,0,0,0.3)` for cards, `0 2px 8px rgba(0,0,0,0.4)` for sticky headers). Never use colored glows except a subtle primary-tinted focus ring on inputs.

### 2.5 Iconography
- Icon set: **Material Symbols Outlined** (Google), loaded with variable axes so weight/fill can be toggled per-icon (e.g. `verified` icon uses `FILL 1` to render solid while everything else stays outlined).
- Standard header icon set (always in this order, right to left): `notifications`, `chat`, `bookmark` (hidden below `sm` breakpoint in some screens), `person`.
- Never mix in a second icon library.

### 2.6 Motion
- Buttons/interactive elements: `active:scale-95` (or `98%` for large CTAs) + `transition-all duration-150 ease-in-out`.
- Cards: `hover:-translate-y-1 transition-transform duration-300` (subtle lift).
- Images: `transition-all duration-300` for the grayscale→color hover effect.
- Loading indicator (infinite scroll / async fetch): 3 dots, `bg-primary rounded-full`, `animate-bounce`, staggered `animation-delay` at 0s/0.2s/0.4s.

---

## 3. Information Architecture & Routing

| Route | Screen | Auth required | Source |
|---|---|---|---|
| `/` | Marketing Landing Page | No | Provided (page: "CampusKart - Your College Marketplace") |
| `/login` | Login | No | Provided |
| `/signup` | Sign Up | No | Provided |
| `/feed` (or `/home`) | Home Feed / Corkboard | Yes | Provided (page: "CampusKart - Home Feed") |
| `/listing/:listingId` | Listing Detail | Yes | Provided (page: "CampusKart - Engineering Drawing Kit") |
| `/messages` | Messages inbox (empty/list state) | Yes | Provided (page: "CampusKart - Chat & Negotiation", list-only state) |
| `/messages/:conversationId` | Messages + active thread | Yes | Provided (same page, thread-open state) |
| `/category/:categorySlug` | Filtered feed by category | Yes | **Inferred** — reuse Home Feed layout with active filter chip pre-selected (see §10) |
| `/search?q=` | Search results | Yes | **Inferred** — reuse Home Feed layout, header search bar drives it (see §10) |
| `/listing/new` | Create/Post listing | Yes | **Inferred** (see §10) |
| `/profile` / `/profile/:userId` | User profile | Yes | **Inferred** (see §10) |
| `/notifications` | Notifications panel/page | Yes | **Inferred** (see §10) |
| `/saved` | Bookmarked/saved listings | Yes | **Inferred** (see §10) |

**Redirect rules:**
- Unauthenticated user hitting any "Yes" route → redirect to `/login`, then back to the originally requested route after successful auth.
- Authenticated user hitting `/`, `/login`, or `/signup` → redirect to `/feed`.

---

## 4. Shared / Global Components

Build these once, reuse everywhere. Each entry lists **props**, **states**, and **which screens use it**.

### 4.1 `TopNavBar`
Sticky header, `h-16`, `bg-surface`, bottom border `border-surface-container`, `z-50`.

- **Left:** Brand wordmark "CampusKart" (`display-md`, `text-primary`), links to `/feed` if authenticated else `/`.
- **Center-left (desktop only, `hidden md:flex`):** Category nav links — `Academic`, `Hostel`, `Electronics` (static list observed; extend to the full category taxonomy in §7.3). Active link gets `text-primary border-b-2 border-primary`.
- **Right:**
  - Search input (`hidden sm:block` / `hidden md:flex` depending on screen) — pill or rectangular input with leading `search` icon, placeholder `"Search campus..."`. On submit (Enter) or debounce, navigate to `/search?q=...`.
  - Icon button: `notifications` → `/notifications`. Should show an unread-count badge dot when count > 0.
  - Icon button: `chat` → `/messages`. Should show unread-count badge when count > 0 (see Messages screen "3 Unread" chip pattern for reference styling).
  - Icon button: `bookmark` (hidden below `sm`) → `/saved`.
  - Icon button: `person` → `/profile` if authenticated, `/login` if not.
- **Props:** `activeCategory?: string`, `unreadNotifications: number`, `unreadMessages: number`, `searchDefaultValue?: string`, `isAuthenticated: boolean`.
- **Used on:** Home Feed, Listing Detail, Landing, Messages. **Not used on:** Login, Sign Up (these screens intentionally suppress nav/footer — "transactional, so TopNavBar/Footer are suppressed").

### 4.2 `Footer`
`bg-surface-container-low`, top border, `py-8`, flex row (column on mobile) with 3 zones: brand label ("CampusKart"), link list (`About`, `Safety`, `Reports`, `Privacy` — all currently `href="#"`, wire to real routes/pages later), and copyright text `© {currentYear} CampusKart. Built for the community.` (compute year dynamically, don't hardcode 2024).
- **Used on:** Home Feed, Listing Detail, Landing. **Not used on:** Login, Sign Up, Messages (full-height app-shell screen, footer would break the layout).

### 4.3 `ListingCard` (Corkboard card)
The atomic unit of the marketplace. Two visual variants:

**Variant A — Photo card** (most listings):
- Container: `bg-surface-bright`, `border border-surface-container`, `rounded-sm`, padding `p-3`/`p-4`, fixed small rotation, `card-shadow`, hover lift + cursor pointer, click → `/listing/:id`.
- Pin dot (top-center, absolute).
- Image area: `object-cover`, `grayscale-[20%]` → full color on hover, rounded, variable aspect ratio (masonry — height is NOT fixed across cards, by design).
- Price tag chip: absolute top-right of the image, dark chip, bullet + price value with currency symbol driven by listing's currency (`$` or `₹` — **currency must be a per-listing/per-campus field, not hardcoded**, see §7).
- Title (`headline-sm`, `text-primary`).
- Meta row: condition badge (`utility-label`, values: `New`, `Like New`, `Good`, `Fair`, `Used`) + location (`location_on` icon + pickup location string).
- Description snippet, `line-clamp-2` or `3` depending on card, `on-surface-variant`.

**Variant B — "Wanted" text card** (no photo, e.g. "Looking for: Calc 101 Textbook"):
- Solid `bg-primary` card (inverted — dark text `text-surface` on yellow), same rotation/pin treatment.
- Title, body copy, divider line, poster name (`person` icon), and an inline `Message` button (secondary/ghost styled against the yellow background) that opens/starts a conversation directly from the feed.
- This is a **listing type**, not just a style — model it as `listingType: 'item' | 'wanted'` (see §7.2).

**Props:** `listing: Listing`, `rotationSeed?: number`, `onClick`, `onMessageClick` (wanted-card only).

**Used on:** Home Feed (masonry grid), Listing Detail ("Similar Listings" — a denser 4-col grid variant with square image and smaller price chip, still same card DNA), Landing hero (decorative, non-interactive "collage" instances).

### 4.4 `PriceTag`
Standalone component so the notch/clip-path styling is consistent everywhere prices appear (cards, listing detail hero image, chat thread header, negotiation offer card).
- Props: `amount: number`, `currency: 'USD' | 'INR' | string`, `variant: 'chip' | 'notch' | 'large'`.
- Render currency symbol from currency code (don't hardcode `$`); format amount with locale-aware thousands separators, no decimals for whole numbers.

### 4.5 `FilterChipBar`
Horizontal scrollable (`overflow-x-auto`, scrollbar hidden) row of pill/rect chips: `All Items` (default active, filled `bg-primary`), category chips (`Academic`, `Hostel`, `Electronics`, `Cycles`, `Stationery`, …, outlined style when inactive), and a trailing `Filters` chip with a `tune` icon that opens an (inferred, see §10.5) filter drawer/modal (price range, condition, distance/location, sort).
- Props: `categories: Category[]`, `activeCategory: string`, `onChange(category)`, `onOpenFilters()`.
- **Used on:** Home Feed (and any `/category/:slug`, `/search` reuse).

### 4.6 `ConditionBadge`
Small pill, `bg-surface-container`, `utility-label`, values: `New | Like New | Good | Fair | Used`. Centralize the enum + label mapping (see §7.2) so copy stays consistent.

### 4.7 `Avatar` + `VerifiedBadge`
Circular image, fallback initial-letter placeholder (`bg-surface-container-high`, centered single-letter text) when no photo. `VerifiedBadge` is a small filled `verified` icon in `success-teal`, shown next to a user's name wherever their identity is asserted (listing detail seller card, testimonial card, chat).

### 4.8 Buttons (canonical variants — implement as a single `Button` component with variants, not ad hoc classes)
- **Primary/Filled:** `bg-primary text-on-primary` (or `text-surface` depending on screen — standardize on `on-primary` token), bold, `active:scale-95/98`. Used for: submit forms, "Message Seller", "Accept" offer, main feed filter chip.
- **Outlined:** `border border-on-surface-variant`, transparent bg, hover `bg-surface-container-high`. Used for: "Make an Offer", "Counter" (negotiation), secondary actions.
- **Ghost/Icon-only:** transparent, hover background tint. Used for: nav icons, bookmark toggle.
- **Destructive-tinted:** `text-error`, hover `bg-error/20`. Used for: "Reject" in negotiation card only — do not use error color for generic secondary actions.

### 4.9 `NegotiationOfferCard`
Inline card that appears **within a chat thread** (not a modal) when a price offer is made. `bg-surface-bright`, rounded-xl, decorative "tape" strip, rotated slightly, contains: label "New Offer from {name}", large offered price (`price-tag`, 3xl), original price for reference (struck-through style not currently applied but recommended), and 3 actions: **Reject** (destructive-tinted), **Counter** (outlined — opens an amount input, see §5.6 interaction spec), **Accept** (primary filled).
- Props: `offer: Offer`, `onAccept`, `onReject`, `onCounter(amount)`.

### 4.10 Form primitives (`TextInput`, `PasswordInput`, `Select`)
- Consistent style across Login/Sign Up: `bg-surface`, `border border-surface-container`, `focus:border-primary focus:ring-1 focus:ring-primary`, left-inset icon for email/password fields, `utility-label` styled floating/top label.
- `PasswordInput` currently has **no show/hide toggle** in the provided design — flag this as a UX gap and add an eye-icon toggle button (standard pattern, does not conflict with visual design) since it's a basic usability/accessibility expectation.

---

## 5. Screen-by-Screen Specification

For every screen: **Route, Layout, Component tree, Element-by-element spec, Data needed, Interactions, Responsive behavior, Empty/loading/error states.**

### 5.1 Landing Page — `/` ("CampusKart - Your College Marketplace")

**Purpose:** Public marketing page for unauthenticated visitors; converts to sign-up.

**Layout (top to bottom):**
1. `TopNavBar` (public variant — same component, but if `isAuthenticated=false`, "Sign up with your college email" style CTA can optionally replace the search bar on mobile; on desktop keep nav as-is).
2. **Hero section** — 2-column grid (`lg:grid-cols-2`), stacks on mobile:
   - Left: H1 (`display-lg`): *"Someone in your college already has what you need."* Subcopy (`body-lg`, muted): *"Buy and sell with students from your own campus. A trusted marketplace built by the community, for the community."* Primary CTA button with clip-path "tag" shape: *"Sign up with your college email"* → routes to `/signup`. Below CTA: stacked avatar group (3 overlapping circular avatars) + social-proof text *"Join {activeUserCount}+ students already trading"* — **`activeUserCount` must be a live/dynamic number from backend, not hardcoded "2,400"**.
   - Right (hidden below `lg`): decorative **absolute-positioned collage** of 3 example `ListingCard`-style panels at different rotations/z-indexes (Chemistry Lab Coat $15, City Commuter Bike $85, Memory Foam Topper) — these are **non-interactive marketing decoration**, not live data; may be hardcoded illustrative content or pulled from a "featured listings" pool.
3. **"How it starts" section** — `bg-surface-container-low`, centered H2 (`display-md`), 3-column step grid (stacks to 1 col on mobile), each step: large ghost number (`01`/`02`/`03`), circular icon badge, `headline-sm` title, `body-md` description:
   - **01 Verify Identity** — badge icon — "Sign up using your official .edu email address to ensure you're connecting with real students from your campus."
   - **02 Post or Browse** — add_photo_alternate icon — "Snap a photo of your item, set a price, and pin it to the digital corkboard. Or browse what your peers are offering."
   - **03 Meet on Campus** — handshake icon — "Chat securely in-app and agree to meet at safe, designated campus locations to complete the exchange."
4. **"Built for trust, inherently safe" section** — 2-column: left = H2 + intro paragraph + 3-item checklist (icon + bold uppercase label + description): *Verified Students Only*, *No Platform Money Handling*, *Fixed Campus Pickup Spots*; right = a rotated testimonial card (avatar + verified badge + name + "Joined {term}" + centered italic quote + 5-star row). **Testimonial content should be data-driven** (pull from a `testimonials`/reviews source), not hardcoded copy, once backend exists.
5. `Footer`.

**Responsive:** Hero collage hidden below `lg`. Step grid and trust-section collapse to 1 column on mobile. Search bar in nav hidden below `md`.

**Data needed:** `activeUserCount` (int), featured testimonial (`{avatarUrl, name, isVerified, joinedLabel, quote, rating}`), optionally featured/example listings for the hero collage.

### 5.2 Login — `/login` ("CampusKart - Login")

**Layout:** Full-viewport centered single card, no TopNavBar/Footer (transactional screen). Background has a subtle corkboard dot-pattern (`radial-gradient` repeating dots) — implement as a CSS background utility, not an image.

**Card contents:**
- Faux corkboard pin decoration (absolute circle, top-center, overlapping the card's top edge).
- H1 (`display-lg`, `text-primary`): "Welcome back". Subcopy: "Access your CampusKart account".
- Form (`POST`):
  - **College Email** field — label `College Email`, `mail` icon, `type=email`, `placeholder="student@college.edu"`, `required`.
  - **Password** field — label row with **"Forgot?"** link right-aligned (→ `/forgot-password`, see §10.6), `lock` icon, `type=password`, `required`. *(Add show/hide toggle per §4.10 gap note.)*
  - Submit button, full width, primary filled, label "Log in" + `arrow_forward` icon, `type=submit`.
- Footer link: "New here? **Create an account**" → `/signup`.
- Decorative rotated "tape" rectangle bottom-right of the card (pure decoration).

**Interactions:**
- Client-side validation: valid email format, non-empty password, before submit.
- On submit: call auth endpoint (§8.1). Show inline field errors for invalid credentials; do not reveal whether the email vs password was wrong (standard security practice).
- Loading state: disable button, show spinner in place of/next to label, prevent double-submit.
- Success: redirect to the originally-requested protected route or `/feed`.

**Data needed:** none beyond form input. **Error states:** invalid credentials, unverified account (should redirect/prompt toward an email-verification flow — see §10.7), network error (toast/inline banner), rate-limited.

### 5.3 Sign Up — `/signup` ("CampusKart - Sign Up")

**Layout:** Full-viewport centered card over a **photographic** corkboard-texture background image at low opacity (differs from Login's CSS-pattern background — both are acceptable corkboard treatments, keep as designed per screen). No TopNavBar/Footer.

**Card contents:**
- Decorative pin (this one uses `error`/`error-container` red-ish coloring rather than neutral — purely a visual variation, no semantic meaning).
- H1 (`display-md`): "Join your campus community". Subcopy: "Sign in with your college to connect, trade, and discover."
- Form fields, in order:
  1. **College email** — helper text below: *"Must use your official .edu email to verify your student status."* — **this is a hard validation rule**: reject non-`.edu`/institutional domains client-side (with server-side re-validation), and ideally validate against a **known-institution domain allowlist** fetched from backend (see §7.3 `Campus`/`Institution` entity) so the platform can map an email domain → campus community automatically.
  2. **Full name** — plain text input.
  3. **Password** — plain text input (add show/hide toggle + a password-strength hint per standard practice; not shown in the static design but required for a real signup flow).
  4. **Department** — `<select>`, options observed: `Computer Science`, `Electrical`, `Mechanical`, `Civil` — **treat this list as illustrative only**; source the real list per-institution from backend once available (§7.3), don't hardcode 4 departments for all colleges.
  5. **Year** — `<select>`, options: `First Year`…`Fourth Year` — extend enum to cover grad/PhD students if the target campuses need it (flag as a product decision, not purely a frontend one).
- Submit button: "Create account" + `arrow_forward` icon.
- Footer link: "Already have an account? **Log in here**" → `/login`.

**Interactions:** Same validation/loading/error pattern as Login, plus:
- After successful submit, the product's stated flow ("Verify Identity") implies an **email verification step** must follow (send verification link/code) before the account is fully active — this is not shown in the static export but is required by the "Verify Identity" step described on the Landing page. See §10.7 for the recommended verification screen.

**Data needed:** `institutions` list (for department/domain validation), or accept freeform department string as an MVP fallback.

### 5.4 Home Feed — `/feed` ("CampusKart - Home Feed")

**Purpose:** Primary authenticated landing screen; the "corkboard" browsing experience.

**Layout (top to bottom):**
1. `TopNavBar` (authenticated variant, nav links `Academic/Hostel/Electronics` shown, none marked "active" by default on the unfiltered feed).
2. `FilterChipBar` — sticky just below the header (`sticky top-16 z-40`), horizontally scrollable on mobile, `bg-surface-container-lowest`.
3. **Masonry corkboard grid** — CSS multi-column layout:
   - 1 column on mobile, 2 at `sm`, 3 at `lg`, 4 at `xl`. `column-gap: 24px`, items `break-inside: avoid`, `margin-bottom: 24px`.
   - Populated with `ListingCard` (Variant A and B mixed, per real data — the export shows 5 example cards: Drafting Board & Kit $45, Mini Fridge (45L) $60, "Looking for: Calc 101 Textbook" (wanted card), Casio FX-991EX $25, City Commuter Bike $85).
   - Infinite scroll / paginated load: on reaching scroll bottom, fetch next page and append; show the 3-dot bounce loading indicator while fetching, and it must be removed/replaced by an end-of-results message when no more pages exist (not shown in static export — must be built, see §6).
4. `Footer`.

**Interactions:**
- Clicking a chip filters the grid by category (client re-fetch with `category` query param) and sets that chip to the active/filled style, deactivating `All Items`.
- Clicking `Filters` opens a filter drawer/modal (see §10.5 — not in the static export, must be designed to match this system: dark surface, primary-accented controls, price range slider, condition multi-select, distance/location, sort-by).
- Clicking a card navigates to `/listing/:id`.
- Clicking "Message" on a wanted-card opens the compose flow directly to that poster (either navigates to `/messages/:newOrExistingConversationId` or opens a lightweight compose modal — recommend direct navigation to messages for consistency with the rest of the app).
- Search bar in header, when used from this screen, should filter/re-query the same feed rather than navigating away (or navigate to `/search?q=` — pick one pattern and apply consistently; recommend in-place filtering for a feed the user is already viewing, and `/search` route only when initiated from other screens).

**Data needed:** paginated `Listing[]`, `Category[]` for the chip bar, current filter/sort state.

**Empty states (not shown, required):** "No listings match these filters yet — be the first to post!" with a CTA to `/listing/new` and/or a `clear filters` action.

### 5.5 Listing Detail — `/listing/:listingId` ("CampusKart - Engineering Drawing Kit")

**Layout:** `TopNavBar` (with the relevant top-level category — e.g. `Academic` — shown as active via `border-b-2 border-primary`), then a 12-column grid (stacks to 1 column on mobile):

**Left column (7/12): Photo gallery**
- Large hero image, `aspect-[4/3]`, rounded, bordered, slight rotation (`masonry-chaos`), pin dot centered on top edge, absolute price tag (notched, top-right, currency-aware).
- Horizontal thumbnail strip below (scrollable, hidden scrollbar): each thumbnail `24x24` (96px), bordered, the active one has `border-primary opacity-100`, inactive ones `opacity-70 hover:opacity-100`. **Clicking a thumbnail swaps the hero image** (not implemented as separate pages — client-side state only).
- All images should support **pinch-zoom / lightbox on click** on the hero image (standard e-commerce pattern; not shown in static export but expected UX, flag as an enhancement).

**Right column (5/12): Details & actions**
- Eyebrow label (`utility-label`, uppercase, `text-primary`): `{TopCategory} • {SubCategory}` (e.g. "Academic • Drawing Tools").
- H1 (`display-lg`): listing title.
- Meta row: condition badge (icon `new_releases` + label) • "Posted {relativeTime} ago" (compute from `createdAt`, don't hardcode "2 days ago").
- Divider.
- **Seller card:** avatar (circular, bordered), name + `VerifiedBadge` if seller is verified, subtitle (e.g. "3rd Year Mech" — derived from seller's department+year), the whole card rotated slightly for the corkboard aesthetic. Clicking should navigate to `/profile/:sellerId` (see §10.4).
- **Pickup Point:** icon + "Pickup Point" label + address/location string (e.g. "Library Gate (Evenings)").
- Divider.
- **Description:** rich text/markdown-lite rendering supporting paragraphs and bullet lists (the example includes an itemized "Includes:" list) — sanitize any user-generated HTML.
- **Action panel** (sticky to bottom on mobile, static/inline on desktop):
  1. Primary button, full width: "Message Seller" (`chat` icon) → opens/starts a conversation and routes to `/messages/:conversationId`.
  2. Secondary row: outlined "Make an Offer" button (`local_offer` icon) — opens an offer-amount input (inline expandable or modal; recommend a small modal with a numeric input pre-filled with the listing price, and an optional message) that, on submit, creates a new `Offer` and routes into the chat thread showing the `NegotiationOfferCard`.
  3. Icon-only outlined button: `bookmark_border` (toggles to filled `bookmark` + `text-primary` when saved) — saves/unsaves the listing for the current user (no navigation).
- **If the current user is the listing's owner:** replace the buyer action panel with owner actions — Edit listing, Mark as Sold, Delete — **not shown in the static export**, must be built (see §10.4 gap note) since a real marketplace needs seller-side controls on their own listing page.

**Similar Listings strip** (bottom of page): H2 "Similar Listings", 2-col (mobile) / 4-col (desktop) grid of denser `ListingCard` variant (square image, smaller price chip bottom-right of image using semi-transparent backdrop-blur chip style rather than the solid notch style — this is a distinct sub-variant, implement as `ListingCard variant="compact"`).

`Footer` at the very bottom.

**Data needed:** full `Listing` object incl. images array, seller `User`, category path, `isBookmarkedByCurrentUser`, `isOwnedByCurrentUser`, related/similar listings (recommend: same category, excluding current listing, ranked by recency or similarity).

**Error state:** listing not found / removed → friendly 404-style message with a "Back to Feed" CTA, styled consistent with the design system (not a generic browser 404).

### 5.6 Messages / Chat & Negotiation — `/messages`, `/messages/:conversationId` ("CampusKart - Chat & Negotiation")

**Layout:** Full-height app-shell below the `TopNavBar` (`h-[calc(100vh-64px)]`, no page-level Footer — this screen owns the remaining viewport), split into two panes on desktop; on mobile, list and thread are two separate full-screen views navigated between (standard responsive messaging-app pattern — the desktop split view cannot reasonably be squeezed onto mobile).

**Left pane — Conversation list (`w-1/3`, `min-w-[320px]`, `max-w-[400px]`):**
- Header: "Messages" (`headline-sm`) + unread-count chip (e.g. "3 Unread", rotated slightly, `bg-primary`). Chip only renders when unread count > 0; hide entirely at 0.
- Scrollable list of conversation rows, each showing: listing thumbnail (small, rotated, rounded), unread-dot indicator on the thumbnail if unread, listing title (bold if unread), relative timestamp, last-message preview (prefixed with sender — `"You: ..."` if the current user sent it, otherwise the other participant's first name).
- **Active/selected conversation** gets a distinct style: `bg-surface-container-high`, left accent border (`border-l-4 border-primary`).
- Click a row → loads that conversation into the right pane (desktop) or navigates full-screen to it (mobile).

**Right pane — Active thread:**
- **Thread header** (`h-20`): listing thumbnail (small square, rotated, pin-dot), listing title, "Selling to: **{buyerName}**" (or "Buying from" — label must flip based on whether the current user is the seller or buyer in this thread) + pickup location, and the current/listed price rendered as a distinctive tag shape top-right of the header.
- **Message canvas:** scrollable, subtle dot-grid background texture (`radial-gradient` dots), date separators ("Today" style pill, centered), and two message bubble alignments:
  - Incoming (left-aligned): small circular avatar-initial + bubble, `bg-surface-container`, rounded with a flattened corner on the tail side, timestamp below-left.
  - Outgoing/"you" (right-aligned, `self-end`): bubble only (no avatar), `bg-surface-container-high`, timestamp below-right.
  - Both bubble variants have a tiny fixed rotation for the corkboard-note feel.
- **Inline negotiation:** when an `Offer` exists in the thread, render the `NegotiationOfferCard` (§4.9) inline in the message flow at its correct chronological position, not floated separately. Support a **history of multiple offers/counters** in one thread (accept/reject/counter should each produce a new message-timeline entry, not just mutate one card in place) — this is important for a real negotiation feature and isn't fully explorable from a single static screenshot.
- **Composer** (bottom, sticky within this pane):
  - Row of quick-action pill buttons above the input: "Make an offer" (`local_offer` icon — opens the offer-amount input, same component used from the Listing Detail page) and "Share location" (`location_on` icon — inserts/attaches the user's chosen pickup point, or opens a location picker).
  - Text input row: leading `add_circle` icon (attachment picker — image upload, since "snap a photo" is core to the product), auto-growing `<textarea>` (min 40px, max 120px, `Enter` to send / `Shift+Enter` for newline — standard chat convention, not explicitly shown but required), trailing `send` icon button (primary-filled, circular/rounded).

**Empty states (required, not in static export):**
- No conversations yet → friendly empty state in the list pane ("No messages yet — start browsing to find something you like" + CTA to `/feed`).
- List pane populated but no conversation selected (desktop only) → placeholder state in the right pane prompting the user to pick a conversation.

**Data needed:** `Conversation[]` (with denormalized listing + counterpart-user summary + last message + unread count), full `Message[]` + `Offer[]` timeline for the open conversation, real-time or polling update mechanism for new messages (recommend WebSocket/subscription once backend exists; frontend should be built against an abstraction — e.g. a `useConversation(id)` hook — that can be backed by polling now and swapped for sockets later without changing components).

---

## 6. Cross-Cutting States (apply to every screen with async/dynamic data)

These are **not fully shown** in the static Stitch exports (which mostly depict a single "happy path" snapshot) but are mandatory for a working product:

- **Loading:** Use the 3-dot bounce pattern (§2.6) for feed/list loading. Use skeleton placeholders (matching card shapes, `surface-container` blocks with pulse animation) for initial page load of Feed/Listing Detail, rather than a blank screen.
- **Empty:** Every list-based screen (Feed with filters, Messages, Saved, Notifications, Search results) needs a designed empty state consistent with the tone-of-voice already established (short, friendly, action-oriented copy + a single CTA).
- **Error:** Network/API failures should show an inline retry affordance (not a generic browser alert). Form screens (Login/Sign Up/Offer/Message compose) need field-level and form-level error message styling using the `error`/`error-container` tokens already defined.
- **Offline:** Recommend a lightweight top banner ("You're offline — messages will send once you're back online") since the chat/negotiation feature implies real-time expectations.
- **Responsive breakpoints:** Follow Tailwind defaults already used throughout: `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`. Mobile-first; every screen must degrade gracefully to a single-column phone layout, including the Messages split-view (§5.6).

---

## 7. Data Contracts (frontend-facing types)

These are the shapes the frontend should build its components and mock data against. Field names are suggestions for backend alignment, not a mandate — but changing them later means updating every component prop, so agree on this shape with backend engineers before implementation.

### 7.1 `User`
```ts
interface User {
  id: string;
  fullName: string;
  email: string;          // must be a verified institutional email
  avatarUrl?: string;
  isVerified: boolean;
  campusId: string;       // FK -> Institution
  department?: string;
  yearOfStudy?: 1 | 2 | 3 | 4 | 5; // extend as needed for grad students
  joinedAt: string;        // ISO date, used for "Joined Fall 2023"-style labels
  ratingAverage?: number;  // for profile/testimonial star display
  ratingCount?: number;
}
```

### 7.2 `Listing`
```ts
type ListingCondition = 'new' | 'like_new' | 'good' | 'fair' | 'used';
type ListingType = 'item' | 'wanted';
type ListingStatus = 'active' | 'sold' | 'reserved' | 'removed';

interface ListingImage { id: string; url: string; altText?: string; sortOrder: number; }

interface Listing {
  id: string;
  type: ListingType;
  title: string;
  description: string;         // supports paragraphs + bullet lists
  price: number;
  currency: string;            // ISO 4217, e.g. "USD" | "INR" — never hardcode symbol
  condition?: ListingCondition; // omit/optional for 'wanted' type
  categoryTop: string;         // e.g. "Academic"
  categorySub?: string;        // e.g. "Drawing Tools"
  pickupLocation: string;      // free text, e.g. "Library Gate (Evenings)"
  images: ListingImage[];      // empty for 'wanted' type
  sellerId: string;            // FK -> User
  campusId: string;            // FK -> Institution (listings are campus-scoped)
  status: ListingStatus;
  createdAt: string;           // ISO date
  updatedAt: string;
}
```

### 7.3 `Category` / `Institution`
```ts
interface Category { id: string; slug: string; label: string; parentId?: string; }
interface Institution {
  id: string;
  name: string;
  emailDomains: string[];   // e.g. ["heritageit.edu.in"], used to validate signup email
  departments: string[];    // per-institution department list, NOT hardcoded globally
}
```

### 7.4 `Conversation` / `Message` / `Offer`
```ts
interface Conversation {
  id: string;
  listingId: string;
  participantIds: [string, string]; // buyer + seller
  lastMessagePreview: string;
  lastMessageAt: string;
  unreadCountForCurrentUser: number;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  type: 'text' | 'offer' | 'location' | 'image' | 'system';
  text?: string;
  offerId?: string;     // present when type === 'offer'
  imageUrl?: string;
  createdAt: string;
}

type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'countered' | 'expired';

interface Offer {
  id: string;
  conversationId: string;
  listingId: string;
  proposedById: string;
  amount: number;
  currency: string;
  status: OfferStatus;
  parentOfferId?: string; // for counter-offer chains
  createdAt: string;
}
```

### 7.5 `Notification`
```ts
type NotificationType = 'new_message' | 'new_offer' | 'offer_accepted' | 'offer_rejected' | 'listing_saved_price_drop' | 'system';
interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  payload: Record<string, unknown>; // shape depends on type, e.g. { conversationId } or { listingId }
  isRead: boolean;
  createdAt: string;
}
```

---

## 8. Expected API Surface (for frontend-backend sync)

Build the frontend against these REST-ish endpoint expectations using a mocked data layer (e.g. MSW, JSON fixtures, or an in-memory store) so swapping in the real backend later only means pointing a base URL / removing the mock layer, not rewriting components.

| Method | Endpoint | Purpose | Used by screen(s) |
|---|---|---|---|
| POST | `/auth/signup` | Create account (college email, name, password, department, year) | Sign Up |
| POST | `/auth/verify-email` | Confirm verification code/link | (Inferred, §10.7) |
| POST | `/auth/login` | Email+password login, returns session/token | Login |
| POST | `/auth/logout` | End session | Global (profile menu) |
| POST | `/auth/forgot-password` / `/auth/reset-password` | Password recovery | (Inferred, §10.6) |
| GET | `/institutions?emailDomain=` | Resolve institution from email domain for signup validation | Sign Up |
| GET | `/listings?category=&search=&cursor=&sort=` | Paginated feed | Home Feed, Search, Category |
| GET | `/listings/:id` | Single listing detail | Listing Detail |
| GET | `/listings/:id/similar` | Similar listings strip | Listing Detail |
| POST | `/listings` | Create listing | Create Listing (§10.3) |
| PATCH | `/listings/:id` | Edit / mark sold | Listing Detail (owner view, §10.4) |
| DELETE | `/listings/:id` | Remove listing | Listing Detail (owner view) |
| POST | `/listings/:id/bookmark` / `DELETE .../bookmark` | Save/unsave | Listing Detail, Feed |
| GET | `/categories` | Category taxonomy for filter chips + nav | Global nav, Feed |
| GET | `/conversations` | Inbox list | Messages |
| GET | `/conversations/:id` | Thread messages + offers | Messages |
| POST | `/conversations` | Start a new conversation (from listing or wanted-card "Message") | Listing Detail, Feed (wanted card) |
| POST | `/conversations/:id/messages` | Send a message | Messages |
| POST | `/conversations/:id/offers` | Make an offer | Listing Detail, Messages |
| PATCH | `/offers/:id` | Accept / reject / counter | Messages (`NegotiationOfferCard`) |
| GET | `/notifications` | Notification list | Notifications (§10.9) |
| PATCH | `/notifications/:id/read` | Mark read | Notifications, header badge |
| GET | `/users/:id` | Public profile | Profile (§10.4) |
| PATCH | `/users/me` | Edit own profile | Profile |

**Real-time consideration:** Messages screen should be designed to consume a subscription (WebSocket/SSE) or short-poll interval for new messages/offer-status changes; keep the data-fetching logic behind a hook/service abstraction (§9) so this can change without touching UI components.

---

## 9. Recommended Frontend Architecture

*(Framework-agnostic guidance; assumes a React + Tailwind stack since the exports are already Tailwind-based, but the structure generalizes.)*

- **Styling:** Port the Tailwind config block found in every exported screen (colors, borderRadius, spacing, fontFamily, fontSize extensions) into a single shared `tailwind.config` — do not duplicate it per page as the raw exports do. Reconcile the color-token drift noted in §2.2 into one canonical palette.
- **Component structure:**
  ```
  /components
    /ui          -> Button, TextInput, Select, Avatar, Badge, PriceTag, Chip
    /listing     -> ListingCard, ListingCardCompact, ListingGallery, ListingActionPanel
    /messaging   -> ConversationListItem, MessageBubble, NegotiationOfferCard, Composer
    /layout      -> TopNavBar, Footer, PageShell
  /pages (or /routes)
    Landing, Login, SignUp, Feed, ListingDetail, Messages, ...
  /hooks
    useListings, useListing, useConversations, useConversation, useAuth, useNotifications
  /types
    (the interfaces from §7)
  /mocks
    fixture data + a thin fetch-layer mock (MSW recommended) matching §8's endpoints
  ```
- **State management:** Server state (listings, conversations, messages) → a query/cache library (e.g. TanStack Query) keyed by the endpoints in §8, so pagination/invalidation/optimistic updates (e.g. optimistic message send, optimistic bookmark toggle) are handled consistently. Local/UI state (active filter chip, gallery thumbnail selection, composer draft text) → local component state, no need for global state for these.
- **Auth:** Route guards based on §3's auth table; store session token in memory + httpOnly cookie strategy (decided with backend later) rather than `localStorage` for anything sensitive.
- **Rotation/decoration determinism:** Implement the card rotation (§2.1) as a pure function of the listing's `id` (e.g. hash → range map to `-1.5deg..1.5deg`) so it's stable across re-renders/pagination rather than re-randomizing and causing visual "jitter."
- **Currency/date formatting:** Centralize via `Intl.NumberFormat`/`Intl.RelativeTimeFormat` utilities — do not hardcode `$`/`₹` symbols or "2 days ago" strings anywhere in components (both appear hardcoded in the raw exports and must be fixed during build).

---

## 10. Gaps: Screens Implied by the UI but Not Included in the Provided Exports

The 6 exported screens are not a complete application — several nav icons, buttons, and product-flow steps point at destinations that were never designed. A coding agent building "the whole product" must create these, matching the design system in §2 exactly (same tokens, same corkboard/pin/price-tag motifs), even though no pixel reference exists yet. Flagging them explicitly rather than silently inventing undocumented screens:

1. **§10.1 Search Results** (`/search?q=`) — reuse Home Feed's grid/chip-bar layout; header shows the query and a result count; empty state for no matches.
2. **§10.2 Category Browse** (`/category/:slug`) — same as Feed with the relevant chip pre-activated; likely does not need a separate screen file, just a Feed variant.
3. **§10.3 Create/Post Listing** (`/listing/new`) — critical missing flow (Landing page literally instructs users to "Snap a photo... set a price... pin it to the digital corkboard," but no such form was exported). Needs: multi-image upload with drag/drop, title, description (rich-ish text), price + currency, condition select, category/sub-category select, pickup location input, and a listing-type toggle (`item` vs `wanted`) that changes the form (wanted posts skip images/condition).
4. **§10.4 User Profile** (`/profile`, `/profile/:userId`) — own-profile (edit name/photo/department, view own active/sold listings, ratings received) vs. public profile (view another student's active listings + rating, "Message" CTA). Also covers the "owner view" of Listing Detail (Edit/Mark Sold/Delete) referenced in §5.5.
5. **§10.5 Filters Drawer/Modal** — triggered by the `Filters` chip on Feed: price range, condition multi-select, distance/location, sort-by (newest, price asc/desc, nearest).
6. **§10.6 Forgot/Reset Password** — triggered by "Forgot?" link on Login.
7. **§10.7 Email Verification** — required by the product's "Verify Identity" promise; a simple "check your inbox" + code-entry or magic-link confirmation screen, styled like Login/Sign Up (centered card, no nav/footer).
8. **§10.8 Saved/Bookmarked Listings** (`/saved`) — triggered by the header `bookmark` icon; same grid as Feed, filtered to the current user's saved items, with an empty state.
9. **§10.9 Notifications** (`/notifications`) — triggered by the header `notifications` icon; a list of `Notification` items (new message, new offer, offer accepted/rejected, etc.), each deep-linking to the relevant conversation/listing, with read/unread visual states matching the "3 Unread" chip pattern already established in Messages.
10. **§10.10 Static/legal pages** — `About`, `Safety`, `Reports`, `Privacy` are linked from the Footer on every marketing-adjacent page but currently point to `href="#"`. These need real content pages (simple centered markdown-style layout, reuse `TopNavBar`/`Footer`).

---

## 11. Accessibility Notes

- All icon-only buttons (nav icons, bookmark toggle, thumbnail selectors) need `aria-label`s — a couple of exported screens already do this (`aria-label="Notifications"` etc.) inconsistently; apply it uniformly.
- Color contrast: verify `on-surface-variant` (#A69C8A) against `surface`/`surface-bright` backgrounds meets WCAG AA for body text at the sizes used; if not, consider a slightly lighter muted-text token for body copy while keeping it for pure metadata/labels.
- Form inputs must have properly associated `<label for>` (already present in Login/Sign Up — keep this pattern everywhere new forms are added, e.g. Create Listing, Offer amount input).
- Chat message list should use `aria-live="polite"` for incoming messages so screen readers announce new messages without disrupting focus.
- Ensure the masonry grid and rotated-card visual treatment does not rely on rotation/transform alone to convey meaning — rotation is decorative only, never semantic (already true in the source; keep it that way).
- Respect `prefers-reduced-motion` — disable the bounce/hover-lift/translate animations for users who request reduced motion.

---

## 12. Acceptance Criteria / QA Checklist

A build is considered spec-complete when:

- [ ] All 6 provided screens are pixel-close (layout, spacing, type scale, color tokens) to the Stitch exports, reconciled per the canonical palette in §2.2.
- [ ] Shared components (§4) are implemented once and reused across all screens listed as consumers — no duplicated one-off markup per page.
- [ ] Currency and relative-time strings are computed, not hardcoded (`$45` / `₹500` / `"2 days ago"` must come from real data + formatting utilities).
- [ ] Card rotation is deterministic per listing, not re-randomized on re-render.
- [ ] Routing table in §3 is implemented with correct auth guards and redirect-after-login behavior.
- [ ] Every list/async screen has loading, empty, and error states (§6), even though the static exports only show the happy path.
- [ ] Messaging screen supports a real multi-turn offer/counter-offer history (§5.6), not just a single static offer card.
- [ ] All gap screens in §10 exist (even as a first-pass MVP) so no nav icon or CTA in the shipped app is a dead link.
- [ ] Frontend data layer is built against the types (§7) and endpoint shape (§8) so backend integration is a configuration change, not a rewrite.
- [ ] Accessibility items in §11 are addressed.
- [ ] Responsive behavior verified at `sm/md/lg/xl` breakpoints on every screen, including the Messages split-view collapsing to single-pane on mobile.

---

*End of document.*
