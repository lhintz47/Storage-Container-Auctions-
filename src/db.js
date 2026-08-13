const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'auctions.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'bidder',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS auctions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  facility TEXT NOT NULL,
  container_code TEXT NOT NULL,
  section_number INTEGER NOT NULL DEFAULT 1,
  section_size TEXT NOT NULL DEFAULT '10ft x 8ft',
  location TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General Goods',
  image_seed TEXT NOT NULL,
  starting_price INTEGER NOT NULL,
  current_price INTEGER NOT NULL,
  bid_increment INTEGER NOT NULL DEFAULT 5,
  reserve_price INTEGER,
  bid_count INTEGER NOT NULL DEFAULT 0,
  seller_id INTEGER NOT NULL,
  winner_id INTEGER,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'live',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (seller_id) REFERENCES users(id),
  FOREIGN KEY (winner_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS bids (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  auction_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (auction_id) REFERENCES auctions(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS watchlist (
  user_id INTEGER NOT NULL,
  auction_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, auction_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (auction_id) REFERENCES auctions(id)
);

CREATE INDEX IF NOT EXISTS idx_bids_auction ON bids(auction_id);
CREATE INDEX IF NOT EXISTS idx_auctions_status ON auctions(status);
`);

function closeExpiredAuctions() {
  const now = new Date().toISOString();
  const expired = db.prepare(`SELECT * FROM auctions WHERE status = 'live' AND end_time <= ?`).all(now);
  const closeStmt = db.prepare(`UPDATE auctions SET status = ?, winner_id = ? WHERE id = ?`);
  for (const a of expired) {
    const topBid = db.prepare(`SELECT * FROM bids WHERE auction_id = ? ORDER BY amount DESC, created_at ASC LIMIT 1`).get(a.id);
    if (topBid && (!a.reserve_price || topBid.amount >= a.reserve_price)) {
      closeStmt.run('sold', topBid.user_id, a.id);
    } else {
      closeStmt.run('ended', null, a.id);
    }
  }
}

function seed() {
  const userCount = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
  if (userCount === 0) {
    const insertUser = db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)');
    const pass = bcrypt.hashSync('password123', 10);
    insertUser.run('Dockside Auctions', 'seller@containerbid.com', pass, 'seller');
    insertUser.run('Jane Bidder', 'jane@example.com', pass, 'bidder');
    insertUser.run('Mike Reseller', 'mike@example.com', pass, 'bidder');
  }

  const auctionCount = db.prepare('SELECT COUNT(*) AS c FROM auctions').get().c;
  if (auctionCount === 0) {
    const seller = db.prepare("SELECT id FROM users WHERE role = 'seller' LIMIT 1").get();
    const insertAuction = db.prepare(`
      INSERT INTO auctions
        (title, description, facility, container_code, section_number, location, category, image_seed,
         starting_price, current_price, bid_increment, reserve_price, seller_id, start_time, end_time, status)
      VALUES (@title, @description, @facility, @container_code, @section_number, @location, @category, @image_seed,
              @starting_price, @current_price, @bid_increment, @reserve_price, @seller_id, @start_time, @end_time, @status)
    `);

    const now = Date.now();
    const hrs = (h) => new Date(now + h * 3600 * 1000).toISOString();
    const hrsAgo = (h) => new Date(now - h * 3600 * 1000).toISOString();

    const listings = [
      {
        title: 'Section 3 — Sealed Furniture & Appliances',
        description: 'Sealed section from an abandoned commercial storage contract. Manifest suggests office furniture, a mini-fridge, and boxed electronics. Sold as-is, no entry until auction close.',
        facility: 'Port of Long Beach Overflow Yard',
        container_code: 'MSCU-774102-3',
        section_number: 3,
        location: 'Long Beach, CA',
        category: 'Furniture & Appliances',
        image_seed: 'furniture',
        starting_price: 5000,
        bid_increment: 500,
        reserve_price: 15000,
        end_offset: 26,
      },
      {
        title: 'Section 1 — Mixed Tools & Hardware',
        description: 'Front section of a contractor-leased container. Visible through the door crack: power tool cases, coiled cabling, and stacked hardware bins.',
        facility: 'Harbor Freight Storage Depot',
        container_code: 'TCLU-220987-1',
        section_number: 1,
        location: 'Houston, TX',
        category: 'Tools & Equipment',
        image_seed: 'tools',
        starting_price: 3000,
        bid_increment: 250,
        reserve_price: 8000,
        end_offset: 8,
      },
      {
        title: 'Section 2 — Unclaimed Retail Overstock',
        description: 'Unclaimed freight from a retail distributor. Boxes are labeled but unverified — inventory sheet not included. Buyer assumes all risk.',
        facility: 'Gulf Coast Freight Terminal',
        container_code: 'HLXU-556230-2',
        section_number: 2,
        location: 'Mobile, AL',
        category: 'Retail Overstock',
        image_seed: 'retail',
        starting_price: 2000,
        bid_increment: 200,
        reserve_price: null,
        end_offset: 3,
      },
      {
        title: 'Section 4 — Vintage Automotive Parts',
        description: 'Rear section packed floor to ceiling with what appears to be classic car parts — chrome bumpers, an engine block under tarp, and several crates.',
        facility: 'Route 40 Self-Storage & Freight',
        container_code: 'CMAU-903341-4',
        section_number: 4,
        location: 'Denver, CO',
        category: 'Automotive',
        image_seed: 'auto',
        starting_price: 7500,
        bid_increment: 500,
        reserve_price: 20000,
        end_offset: 52,
      },
      {
        title: 'Section 1 — Sporting Goods & Outdoor Gear',
        description: 'Bikes, kayak paddles, and what looks like a folded tent visible near the doors. Rest of section is boxed and unknown.',
        facility: 'Cascade Container Storage',
        container_code: 'OOLU-118765-1',
        section_number: 1,
        location: 'Portland, OR',
        category: 'Sporting Goods',
        image_seed: 'sports',
        starting_price: 1500,
        bid_increment: 150,
        reserve_price: null,
        end_offset: -2, // already ended, for demo
      },
      {
        title: 'Section 2 — Sealed Estate Liquidation Lot',
        description: 'Estate liquidation section, fully sealed at auction. Family requested no inventory disclosure. High-value rumor lot — bid at your own risk.',
        facility: 'Midwest Container Auctions',
        container_code: 'EGHU-441098-2',
        section_number: 2,
        location: 'Chicago, IL',
        category: 'Estate Lot',
        image_seed: 'estate',
        starting_price: 10000,
        bid_increment: 1000,
        reserve_price: 30000,
        end_offset: 14,
      },
    ];

    for (const l of listings) {
      const start_time = hrsAgo(6);
      const end_time = l.end_offset >= 0 ? hrs(l.end_offset) : hrsAgo(-l.end_offset);
      const status = l.end_offset < 0 ? 'ended' : 'live';
      insertAuction.run({
        title: l.title,
        description: l.description,
        facility: l.facility,
        container_code: l.container_code,
        section_number: l.section_number,
        location: l.location,
        category: l.category,
        image_seed: l.image_seed,
        starting_price: l.starting_price,
        current_price: l.starting_price,
        bid_increment: l.bid_increment,
        reserve_price: l.reserve_price,
        seller_id: seller.id,
        start_time,
        end_time,
        status,
      });
    }
  }
}

seed();
closeExpiredAuctions();

module.exports = { db, closeExpiredAuctions };
