# Speckle

Speckle lets kitchen & design specifiers turn affiliate product links into
trackable specifications. Paste a product link from an affiliated
distributor, Speckle pulls the product name, description and photo, and
generates a unique UTM-tagged link that attributes any resulting sale back
to the designer.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## What's here

- **Header & menu** are always visible. The dropdown shows **Log in**
  (`/login`) when signed out; once signed in it shows **My account** and
  **Log out** instead.
- **Log in / sign up** (`/login`) — new users pick **Designer** or
  **Distributor** and fill out the matching sign-up form; returning users
  log in with email + password.
- **Start a new specification** (`/specify`, designers only) — paste a
  product URL, fetch its Open Graph metadata via `POST /api/fetch-product`,
  edit the pulled fields, and generate a UTM link (`utm_source=speckle`,
  `utm_medium=affiliate`, `utm_campaign=<project slug>`,
  `utm_content=<referral code>`). Prompts you to log in if you're signed
  out, or explains why it's unavailable if you're signed in as a
  distributor.
- **My Projects** (`/projects`) — saved specifications and their links,
  scoped to the signed-in designer.
- **Favourites** (`/favourites`) — starred specifications.
- **My account** (`/account`) — only accessible once signed in; edit your
  profile, and designers see their referral code.

## Accounts

- **Designers** sign up with first name, last name, company name, address
  (street / province / country / postal code), email, and a password.
- **Distributors** sign up with company name, primary contact name, email,
  address, and a password.
- Referral codes are generated once at sign-up for designers and used to
  attribute UTM links back to them.

Users and saved specifications are currently persisted to `localStorage` —
there's no real backend yet. Passwords are hashed (SHA-256 + per-user salt)
before being stored, but this is still a client-only simulation: anyone
with access to the browser's dev tools can read the local user store. This
is fine for prototyping, but **do not treat this as production-grade
authentication** — a real backend with server-side auth is needed before
launch.

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS v4.
