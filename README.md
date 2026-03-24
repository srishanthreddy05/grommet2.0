# Grommet — Next.js E-Commerce

Full-featured e-commerce store built with **Next.js 14**, **Firebase Realtime Database**, **Cloudinary**, and **Google Auth**. Cart redirects to WhatsApp for orders.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 (App Router) |
| Database | Firebase Realtime Database |
| Auth | Firebase Auth (Google) |
| Images | Cloudinary |
| Styling | Tailwind CSS |
| Checkout | WhatsApp redirect |
| Hosting | Vercel (recommended) |

---

## Setup Instructions

### 1. Clone & Install

```bash
git clone <your-repo>
cd storefront
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable **Realtime Database** → Start in test mode
4. Enable **Authentication** → Sign-in method → Google
5. Copy your config keys

### 3. Cloudinary Setup

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Go to Settings → Upload → Add upload preset
3. Name it `grommet_products`, set to **Unsigned**
4. Note your **Cloud Name**

### 4. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_DATABASE_URL=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...

NEXT_PUBLIC_WHATSAPP_NUMBER=917075074352

NEXT_PUBLIC_ADMIN_EMAIL=youremail@gmail.com
```

### 5. Firebase Database Rules

In Firebase Console → Realtime Database → Rules:

```json
{
  "rules": {
    "products": { ".read": true, ".write": "auth != null && root.child('users').child(auth.uid).child('isAdmin').val() === true" },
    "categories": { ".read": true, ".write": "auth != null && root.child('users').child(auth.uid).child('isAdmin').val() === true" },
    "orders": { ".read": "auth != null && root.child('users').child(auth.uid).child('isAdmin').val() === true", ".write": true },
    "reviews": { ".read": true, ".write": "auth != null && root.child('users').child(auth.uid).child('isAdmin').val() === true" },
    "settings": { ".read": true, ".write": "auth != null && root.child('users').child(auth.uid).child('isAdmin').val() === true" },
    "users": { ".read": "auth != null && root.child('users').child(auth.uid).child('isAdmin').val() === true", "$uid": { ".write": "auth != null && auth.uid === $uid" } }
  }
}
```

### 6. Run Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 7. First Admin Setup

1. Run the app
2. Sign in with Google using your **admin email** (set in `.env.local`)
3. You'll automatically get admin access
4. Go to `/admin` to manage products & orders

---

## Project Structure

```
storefront/
├── app/
│   ├── page.tsx                  # Homepage
│   ├── layout.tsx                # Root layout
│   ├── globals.css
│   ├── auth/page.tsx             # Login page
│   ├── product/[slug]/page.tsx   # Product detail
│   ├── collections/[slug]/page.tsx # Collection page
│   └── admin/
│       ├── layout.tsx            # Admin layout + auth guard
│       ├── page.tsx              # Dashboard
│       ├── products/page.tsx     # Product CRUD
│       ├── orders/page.tsx       # Order management
│       └── settings/page.tsx     # Site settings
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── home/
│   │   ├── HeroSection.tsx
│   │   ├── CategoryGrid.tsx
│   │   ├── ProductRow.tsx
│   │   ├── MarqueeStrip.tsx
│   │   ├── BestsellerSection.tsx
│   │   ├── ReviewSection.tsx
│   │   ├── IllustrationGifts.tsx
│   │   ├── DMSection.tsx
│   │   └── EmailSubscribe.tsx
│   ├── product/
│   │   └── ProductCard.tsx
│   └── cart/
│       └── CartDrawer.tsx
├── lib/
│   ├── firebase.ts               # Firebase init
│   ├── db.ts                     # Database helpers
│   ├── auth-context.tsx          # Auth provider
│   └── cart-context.tsx          # Cart + WhatsApp checkout
└── types/
    └── index.ts                  # TypeScript types
```

---

## How WhatsApp Checkout Works

1. Customer adds products to cart
2. Clicks **"Checkout via WhatsApp"**
3. App formats a message with all items + total
4. Order is saved to Firebase with status `pending`
5. WhatsApp opens with pre-filled message to your number
6. You confirm manually and update status in Admin → Orders

---

## How to Add Products (Admin)

1. Go to `/admin/products`
2. Click **"Add Product"**
3. Upload images (goes to Cloudinary)
4. Fill in name, slug, price, category
5. Toggle **Featured** to show on homepage
6. Click **Create Product**

---

## Customization

| What | Where |
|------|-------|
| Store name | `components/layout/Navbar.tsx` + `Footer.tsx` |
| Nav links | `components/layout/Navbar.tsx` → `navLinks` |
| Hero text | `components/home/HeroSection.tsx` |
| Review text | `components/home/ReviewSection.tsx` |
| WhatsApp number | `.env.local` → `NEXT_PUBLIC_WHATSAPP_NUMBER` |
| Brand colors | `tailwind.config.ts` → `colors.brand` |

---

## Deploy to Vercel

```bash
npm run build   # Test build locally first
```

Then push to GitHub and import in [vercel.com](https://vercel.com). Add all `.env.local` variables in Vercel → Project → Settings → Environment Variables.
