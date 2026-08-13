const path = require('path');
const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const { body, validationResult } = require('express-validator');

const users = require('./src/users');
const auctions = require('./src/auctions');
const forms = require('./src/forms');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    store: new SQLiteStore({ db: 'sessions.db', dir: path.join(__dirname, 'data') }),
    secret: process.env.SESSION_SECRET || 'container-auction-dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 },
  })
);

// Attach current user to every request/view
app.use((req, res, next) => {
  res.locals.currentUser = req.session.userId ? users.findById(req.session.userId) : null;
  res.locals.flash = req.session.flash || null;
  delete req.session.flash;
  next();
});

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    req.session.flash = { type: 'error', message: 'Please sign in to continue.' };
    return res.redirect('/login?next=' + encodeURIComponent(req.originalUrl));
  }
  next();
}

function setFlash(req, type, message) {
  req.session.flash = { type, message };
}

// ---------- Public pages ----------

app.get('/', (req, res) => {
  const { category, q, sort } = req.query;
  const liveAuctions = auctions.listAuctions({ status: 'live', category, q, sort });
  const endingSoon = auctions.listAuctions({ status: 'live', sort: 'ending_soon' }).slice(0, 4);
  res.render('home', {
    title: 'Container Auctions — Bid on Sealed Storage Sections',
    liveAuctions,
    endingSoon,
    categories: auctions.getCategories(),
    query: { category: category || '', q: q || '', sort: sort || 'ending_soon' },
  });
});

app.get('/auctions/:id', (req, res) => {
  const auction = auctions.getAuction(req.params.id);
  if (!auction) return res.status(404).render('404', { title: 'Not Found' });
  const bidHistory = auctions.getBidHistory(auction.id);
  const watching = req.session.userId ? auctions.isWatching(req.session.userId, auction.id) : false;
  const minBid =
    auction.bid_count === 0 ? auction.starting_price : auction.current_price + auction.bid_increment;
  res.render('auction-detail', {
    title: auction.title,
    auction,
    bidHistory,
    watching,
    minBid,
  });
});

app.post('/auctions/:id/bid', requireAuth, (req, res) => {
  const auctionId = req.params.id;
  const amount = parseInt(req.body.amount, 10);
  try {
    auctions.placeBid(auctionId, req.session.userId, amount);
    setFlash(req, 'success', 'Your bid was placed successfully!');
  } catch (err) {
    if (err instanceof auctions.BidError) {
      setFlash(req, 'error', err.message);
    } else {
      console.error(err);
      setFlash(req, 'error', 'Something went wrong placing your bid.');
    }
  }
  res.redirect('/auctions/' + auctionId);
});

app.post('/auctions/:id/watch', requireAuth, (req, res) => {
  auctions.toggleWatch(req.session.userId, req.params.id);
  res.redirect('/auctions/' + req.params.id);
});

// ---------- Auth ----------

app.get('/register', (req, res) => {
  res.render('register', { title: 'Create Account', errors: [], form: {} });
});

app.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters.'),
    body('email').isEmail().withMessage('Enter a valid email.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (users.findByEmail(req.body.email || '')) {
      errors.errors.push({ msg: 'An account with that email already exists.' });
    }
    if (!errors.isEmpty()) {
      return res.render('register', { title: 'Create Account', errors: errors.array(), form: req.body });
    }
    const user = users.createUser({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: ['seller', 'facility'].includes(req.body.role) ? req.body.role : 'bidder',
    });
    req.session.userId = user.id;
    setFlash(req, 'success', `Welcome to Container Auctions, ${user.name}!`);
    res.redirect('/');
  }
);

app.get('/login', (req, res) => {
  res.render('login', { title: 'Sign In', error: null, next: req.query.next || '/' });
});

app.post('/login', (req, res) => {
  const { email, password, next } = req.body;
  const user = users.findByEmail(email || '');
  if (!user || !users.verifyPassword(user, password || '')) {
    return res.render('login', { title: 'Sign In', error: 'Invalid email or password.', next: next || '/' });
  }
  req.session.userId = user.id;
  setFlash(req, 'success', `Welcome back, ${user.name}!`);
  res.redirect(next && next.startsWith('/') ? next : '/');
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

// ---------- Dashboard ----------

app.get('/dashboard', requireAuth, (req, res) => {
  const myBids = auctions.getUserBids(req.session.userId);
  const watchlist = auctions.getWatchlist(req.session.userId);
  const myListings = auctions.getUserListings(req.session.userId);
  res.render('dashboard', { title: 'My Dashboard', myBids, watchlist, myListings });
});

// ---------- Sell / create listing ----------

app.get('/sell', requireAuth, (req, res) => {
  res.render('sell', { title: 'List a Container Section', errors: [], form: {} });
});

app.post(
  '/sell',
  requireAuth,
  [
    body('title').trim().isLength({ min: 5 }).withMessage('Title must be at least 5 characters.'),
    body('description').trim().isLength({ min: 20 }).withMessage('Description must be at least 20 characters.'),
    body('facility').trim().notEmpty().withMessage('Facility name is required.'),
    body('container_code').trim().notEmpty().withMessage('Container code is required.'),
    body('location').trim().notEmpty().withMessage('Location is required.'),
    body('category').trim().notEmpty().withMessage('Category is required.'),
    body('starting_price').isInt({ min: 1 }).withMessage('Starting price must be a positive number.'),
    body('bid_increment').isInt({ min: 1 }).withMessage('Bid increment must be a positive number.'),
    body('duration_hours').isInt({ min: 1, max: 720 }).withMessage('Duration must be between 1 and 720 hours.'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('sell', { title: 'List a Container Section', errors: errors.array(), form: req.body });
    }
    const id = auctions.createAuction(req.session.userId, {
      title: req.body.title,
      description: req.body.description,
      facility: req.body.facility,
      container_code: req.body.container_code,
      section_number: parseInt(req.body.section_number, 10) || 1,
      location: req.body.location,
      category: req.body.category,
      image_seed: req.body.image_seed,
      starting_price: parseInt(req.body.starting_price, 10),
      bid_increment: parseInt(req.body.bid_increment, 10),
      reserve_price: req.body.reserve_price ? parseInt(req.body.reserve_price, 10) : null,
      duration_hours: parseInt(req.body.duration_hours, 10),
    });
    setFlash(req, 'success', 'Your container section is now live for auction!');
    res.redirect('/auctions/' + id);
  }
);

// ---------- Forms (role-gated: bidder / seller / facility) ----------

app.get('/forms', requireAuth, (req, res) => {
  res.render('forms-list', {
    title: 'Forms',
    myForms: forms.getFormsForRole(res.locals.currentUser.role),
  });
});

app.get('/forms/:id', requireAuth, (req, res) => {
  const form = forms.getForm(req.params.id);
  if (!form) return res.status(404).render('404', { title: 'Not Found' });
  if (!forms.canAccess(form, res.locals.currentUser.role)) {
    setFlash(req, 'error', "That form isn't available for your account type.");
    return res.redirect('/forms');
  }
  res.render('form-detail', { title: form.title, form });
});

// ---------- API (for live countdown / price polling) ----------

app.get('/api/auctions/:id/status', (req, res) => {
  const auction = auctions.getAuction(req.params.id);
  if (!auction) return res.status(404).json({ error: 'not found' });
  res.json({
    id: auction.id,
    status: auction.status,
    current_price: auction.current_price,
    bid_count: auction.bid_count,
    end_time: auction.end_time,
  });
});

app.use((req, res) => {
  res.status(404).render('404', { title: 'Not Found' });
});

app.listen(PORT, () => {
  console.log(`Container Auctions running at http://localhost:${PORT}`);
});
