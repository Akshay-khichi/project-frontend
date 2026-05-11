# EduVault Frontend

Premium student learning platform — secure notes & PYQ viewer with Razorpay premium access.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS (custom design tokens) |
| Animation | Framer Motion |
| Routing | React Router v6 |
| HTTP | Axios (with JWT refresh interceptor) |
| State | Zustand (persisted auth + subscription) |
| Server State | TanStack React Query v5 |
| PDF Viewer | pdfjs-dist (canvas renderer) |
| Payments | Razorpay Web SDK |

---

## Project Structure

```
src/
├── api/
│   └── axios.js              # Axios instance, interceptors, all API methods
├── components/
│   ├── admin/
│   │   └── ContentUploadForm.jsx   # Shared upload form (Notes + PYQs)
│   ├── common/
│   │   ├── Navbar.jsx
│   │   └── SkeletonCard.jsx
│   ├── premium/
│   │   └── PremiumLock.jsx         # Reusable blur+lock overlay
│   └── security/
│       ├── SecurePDFViewer.jsx     # Canvas-based PDF viewer with watermark
│       └── DevToolsDetector.jsx    # DevTools open detection overlay
├── hooks/
│   └── useSecurityGuards.js        # Right-click, keyboard shortcut blocking
├── pages/
│   ├── Landing.jsx
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Notes.jsx               # Notes list with filters + PremiumLock
│   ├── NoteDetail.jsx          # Signed URL fetch + SecurePDFViewer
│   ├── PYQs.jsx                # PYQ list — all premium locked
│   ├── PYQDetail.jsx           # PYQ viewer — premium gate
│   ├── Premium.jsx             # Razorpay checkout + plan selection
│   └── admin/
│       ├── AdminDashboard.jsx  # Analytics overview
│       ├── AdminNotes.jsx      # CRUD table for notes
│       ├── AdminPYQs.jsx       # CRUD table for PYQs
│       └── AdminUsers.jsx      # User role + status management
├── routes/
│   └── ProtectedRoute.jsx      # ProtectedRoute, AdminRoute, GuestRoute
├── store/
│   └── useStore.js             # Zustand: user, token, subscription, hasAccess()
├── App.jsx                     # Route config + bootstrap session
├── main.jsx                    # React entry point
└── index.css                   # Tailwind + design tokens + security CSS
```

---

## Security Implementations

### 1. No Download Button
- PDF rendered to `<canvas>` via `pdfjs-dist` — no `<a href>` or download trigger anywhere
- File URLs never exposed in frontend state

### 2. Signed URL Only
- On "Open Viewer" click → `GET /notes/:id/view-url` → backend verifies JWT + subscription
- Signed URL has 15-min TTL — expires before sharing is useful

### 3. Right-Click Disabled
- `document.addEventListener('contextmenu', e => e.preventDefault())` in `useSecurityGuards`

### 4. Keyboard Shortcuts Blocked
- `Ctrl+S`, `Ctrl+P`, `Ctrl+U`, `F12`, `Ctrl+Shift+I/J/C` blocked via keydown capture listener

### 5. Text Selection Disabled
- PDF canvas: `user-select: none`, `pointer-events: none`
- `select-none` class applied globally on PDF container

### 6. Watermark Overlay
- Canvas-based watermark drawn **after** each PDF page render
- Pattern: `email | EduVault | date` repeated in diagonal grid
- Baked into canvas pixels — cannot be removed by hiding a DOM element

### 7. Premium Content Lock UI
- `PremiumLock` component wraps content with CSS `blur(8px)` + lock overlay
- Three variants: `card`, `inline`, `page`
- Links to `/premium` for upgrade

### 8. DevTools Detection
- Window dimension diff detection (>160px offset = devtools open)
- Shows full-screen warning overlay when detected

---

## Access Control Logic

```js
// In useStore.js
hasAccess(unitNumber) {
  if (unitNumber === null) return isPremiumUser()  // PYQs always premium
  if (unitNumber <= 2)     return true              // Unit 1 & 2 free
  return isPremiumUser()                            // Unit 3+ premium
}
```

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit VITE_API_URL to point to your backend

# 3. Start dev server
npm run dev

# 4. Build for production
npm run build
```

---

## Backend Expected API Contracts

### Auth
- `GET  /auth/me`           → `{ user, accessToken, subscription }`
- `POST /auth/login`        → `{ user, accessToken, subscription }`
- `POST /auth/refresh`      → `{ accessToken }` (reads HttpOnly cookie)
- `POST /auth/logout`       → clears cookie

### Notes
- `GET  /notes`             → `{ notes, totalPages }` (query: search, branch, semester, subject, sort, page, limit)
- `GET  /notes/:id`         → `{ note }`
- `GET  /notes/:id/view-url`→ `{ url }` — **signed URL, auth + subscription verified**
- `POST /notes`             → multipart/form-data with PDF file
- `PUT  /notes/:id`         → update metadata
- `DELETE /notes/:id`       → soft delete

### PYQs — same pattern as Notes + `year`, `examType` fields

### Premium
- `GET  /premium/plans`      → `{ plans }`
- `POST /premium/create-order` → `{ orderId, amount, currency, keyId }`
- `POST /premium/verify`     → `{ subscription: { status, expiry, plan } }`

### Analytics (admin)
- `GET  /analytics/overview`  → `{ totalUsers, totalDownloads, totalNotes, totalPYQs, premiumUsers, activeUsers24h, newUsersToday, downloadsToday, revenueThisMonth }`
- `GET  /analytics/top-content` → `{ content: [{ _id, title, type, subject, downloadCount }] }`
