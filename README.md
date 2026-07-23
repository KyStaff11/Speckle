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

- **Start a new specification** (`/specify`) — paste a product URL, fetch
  its Open Graph metadata via `POST /api/fetch-product`, edit the pulled
  fields, and generate a UTM link (`utm_source=speckle`, `utm_medium=affiliate`,
  `utm_campaign=<project slug>`, `utm_content=<referral code>`).
- **My Projects** (`/projects`) — saved specifications and their links.
- **Favourites** (`/favourites`) — starred specifications.
- **My account** (`/account`) — designer name, email, and referral code
  embedded in every generated link.

Accounts and saved specifications are currently persisted to
`localStorage` — there's no backend/auth yet, so data is per-browser only.

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS v4.
