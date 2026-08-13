# Container Auctions

An online auction platform for bidding on sealed 10' x 8' sections of shipping containers — think storage-unit auctions, but by the container section.

## Features

- Browse live auctions with search, category filter, and sorting
- Auction detail pages with live countdown timers, bid history, and minimum-bid enforcement
- User accounts (bidders and sellers) with sessions
- Real bidding logic: increment enforcement, reserve prices, auto-closing on expiry, winner assignment
- Sellers can list new container sections for auction
- Personal dashboard: your bids, watchlist, and listings
- Watchlist (star/unstar auctions)
- Procedurally generated placeholder art per listing (no external image dependencies)

## Stack

Node.js, Express, EJS templates, better-sqlite3, express-session (SQLite-backed store), bcryptjs, express-validator. No build step, no external services.

## Running locally

```bash
npm install
npm start
```

Visit http://localhost:3000

The SQLite database is created automatically at `data/auctions.db` and seeded with demo listings and accounts on first run:

- `seller@containerbid.com` / `password123` (seller)
- `jane@example.com` / `password123` (bidder)
- `mike@example.com` / `password123` (bidder)

## Project structure

```
server.js          Express app & routes
src/db.js           SQLite schema, seed data, auto-close logic
src/auctions.js      Auction/bid/watchlist queries
src/users.js         Auth helpers
views/               EJS templates
public/              CSS, client-side countdown JS
```
