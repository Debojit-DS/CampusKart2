# CampusKart — Frontend Application

> **"Someone in your college already has what you need."**
> A campus-only, peer-to-peer marketplace where students buy, sell, and trade items with other verified students at their own college.

---

## 🎨 Updated Design System & Features

- **Typography**: Unified with **Inter** font (`Inter:wght@300..900`) for clean, modern, high-legibility display and body typography, paired with **JetBrains Mono** for pricing and badges.
- **Vibrant Violet Contrast Palette**:
  - Primary Accent: `#8B5CF6` (Violet 500) / `#7C3AED` (Violet 600)
  - Secondary/Glow: `rgba(139, 92, 246, 0.35)`
  - Elevated surfaces with deep violet undertones in dark mode and clean lavender tints in light mode.
- **🌓 Light Mode & Dark Mode Switcher**:
  - Instant theme toggle button (Sun ☀️ / Moon 🌙) located directly in the top navigation bar.
  - Persistent preference stored in `localStorage` with flicker-free initialization.
- **🇮🇳 Indian Rupee (INR — ₹) Currency**:
  - All default listings, search filters, offer modals, price chips, and chat negotiation cards now default to INR (`₹`).
  - Standard Indian number formatting (e.g. `₹850`, `₹4,200`, `₹12,500`).

---

## 🚀 How to Run

### Option 1: Double-click `start.bat`
Double-click `start.bat` in Windows Explorer. It starts the local HTTP server on `http://localhost:3000/` and automatically launches your web browser.

### Option 2: PowerShell
Run the PowerShell script:
```powershell
.\start_server.ps1
```

### Option 3: Direct File
Open `index.html` directly in any modern browser.

---

## 🗺️ Implemented Routes

- `/` — Marketing Landing Page (Hero, live student count, trust pillars, testimonial)
- `/login` — Login Screen (with show/hide password toggle)
- `/signup` — Student Registration (with institutional email domain validation)
- `/verify-email` — 6-digit campus verification screen
- `/forgot-password` — Password recovery flow
- `/feed` / `/home` — Masonry Corkboard Feed with photo and "Wanted" request cards
- `/category/:categorySlug` — Category Filtered Feed (Academic, Hostel, Electronics, Cycles, Stationery)
- `/search?q=...` — Live search results across title, description, category, and pickup spots
- `/listing/:listingId` — Item Detail Page with photo gallery, lightbox zoom, seller card, and buyer/seller action panels
- `/listing/new` — Post a new listing with photo upload/URL preview and INR pricing
- `/messages` & `/messages/:conversationId` — Responsive split-view chat with inline multi-turn negotiation offer cards
- `/profile` & `/profile/:userId` — User Profile with active listings and sold archive
- `/saved` — Watchlist of bookmarked notices
- `/notifications` — Activity inbox with deep links
- `/about`, `/safety`, `/reports`, `/privacy` — Campus safety & community documentation
