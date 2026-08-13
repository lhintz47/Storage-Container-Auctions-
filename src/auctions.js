const { db, closeExpiredAuctions } = require('./db');

function listAuctions({ status = 'live', category, q, sort = 'ending_soon' } = {}) {
  closeExpiredAuctions();
  let sql = 'SELECT * FROM auctions WHERE 1=1';
  const params = [];
  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }
  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }
  if (q) {
    sql += ' AND (title LIKE ? OR description LIKE ? OR location LIKE ?)';
    const like = `%${q}%`;
    params.push(like, like, like);
  }
  if (sort === 'ending_soon') sql += ' ORDER BY end_time ASC';
  else if (sort === 'price_low') sql += ' ORDER BY current_price ASC';
  else if (sort === 'price_high') sql += ' ORDER BY current_price DESC';
  else if (sort === 'newest') sql += ' ORDER BY created_at DESC';
  return db.prepare(sql).all(...params);
}

function getAuction(id) {
  closeExpiredAuctions();
  return db.prepare('SELECT * FROM auctions WHERE id = ?').get(id);
}

function getBidHistory(auctionId) {
  return db
    .prepare(
      `SELECT bids.id, bids.amount, bids.created_at, users.name AS bidder_name
       FROM bids JOIN users ON users.id = bids.user_id
       WHERE bids.auction_id = ? ORDER BY bids.amount DESC, bids.created_at ASC`
    )
    .all(auctionId);
}

function getCategories() {
  return db.prepare('SELECT DISTINCT category FROM auctions ORDER BY category').all().map((r) => r.category);
}

class BidError extends Error {}

function placeBid(auctionId, userId, amount) {
  const auction = db.prepare('SELECT * FROM auctions WHERE id = ?').get(auctionId);
  if (!auction) throw new BidError('Auction not found.');
  if (auction.status !== 'live') throw new BidError('This auction is no longer accepting bids.');
  if (new Date(auction.end_time).getTime() <= Date.now()) {
    closeExpiredAuctions();
    throw new BidError('This auction just closed.');
  }
  if (auction.seller_id === userId) throw new BidError('Sellers cannot bid on their own listings.');

  const minBid =
    auction.bid_count === 0 ? auction.starting_price : auction.current_price + auction.bid_increment;
  if (!Number.isInteger(amount) || amount < minBid) {
    throw new BidError(`Bid must be at least $${minBid.toLocaleString()}.`);
  }

  const tx = db.transaction(() => {
    db.prepare('INSERT INTO bids (auction_id, user_id, amount) VALUES (?, ?, ?)').run(
      auctionId,
      userId,
      amount
    );
    db.prepare(
      'UPDATE auctions SET current_price = ?, bid_count = bid_count + 1 WHERE id = ?'
    ).run(amount, auctionId);
  });
  tx();

  return db.prepare('SELECT * FROM auctions WHERE id = ?').get(auctionId);
}

function isWatching(userId, auctionId) {
  if (!userId) return false;
  return !!db.prepare('SELECT 1 FROM watchlist WHERE user_id = ? AND auction_id = ?').get(userId, auctionId);
}

function toggleWatch(userId, auctionId) {
  const existing = db.prepare('SELECT 1 FROM watchlist WHERE user_id = ? AND auction_id = ?').get(userId, auctionId);
  if (existing) {
    db.prepare('DELETE FROM watchlist WHERE user_id = ? AND auction_id = ?').run(userId, auctionId);
    return false;
  }
  db.prepare('INSERT INTO watchlist (user_id, auction_id) VALUES (?, ?)').run(userId, auctionId);
  return true;
}

function getWatchlist(userId) {
  closeExpiredAuctions();
  return db
    .prepare(
      `SELECT auctions.* FROM auctions
       JOIN watchlist ON watchlist.auction_id = auctions.id
       WHERE watchlist.user_id = ? ORDER BY auctions.end_time ASC`
    )
    .all(userId);
}

function getUserBids(userId) {
  closeExpiredAuctions();
  return db
    .prepare(
      `SELECT auctions.*, MAX(bids.amount) AS my_max_bid
       FROM bids JOIN auctions ON auctions.id = bids.auction_id
       WHERE bids.user_id = ? GROUP BY auctions.id ORDER BY auctions.end_time ASC`
    )
    .all(userId);
}

function getUserListings(userId) {
  closeExpiredAuctions();
  return db.prepare('SELECT * FROM auctions WHERE seller_id = ? ORDER BY created_at DESC').all(userId);
}

function createAuction(sellerId, data) {
  const start_time = new Date().toISOString();
  const end_time = new Date(Date.now() + data.duration_hours * 3600 * 1000).toISOString();
  const info = db
    .prepare(
      `INSERT INTO auctions
        (title, description, facility, container_code, section_number, location, category, image_seed,
         starting_price, current_price, bid_increment, reserve_price, seller_id, start_time, end_time, status)
       VALUES (@title, @description, @facility, @container_code, @section_number, @location, @category, @image_seed,
               @starting_price, @starting_price, @bid_increment, @reserve_price, @seller_id, @start_time, @end_time, 'live')`
    )
    .run({
      title: data.title,
      description: data.description,
      facility: data.facility,
      container_code: data.container_code,
      section_number: data.section_number,
      location: data.location,
      category: data.category,
      image_seed: data.image_seed || data.category.toLowerCase().replace(/[^a-z]/g, ''),
      starting_price: data.starting_price,
      bid_increment: data.bid_increment,
      reserve_price: data.reserve_price || null,
      seller_id: sellerId,
      start_time,
      end_time,
    });
  return info.lastInsertRowid;
}

module.exports = {
  listAuctions,
  getAuction,
  getBidHistory,
  getCategories,
  placeBid,
  BidError,
  isWatching,
  toggleWatch,
  getWatchlist,
  getUserBids,
  getUserListings,
  createAuction,
};
