// server.js
// A small Express app with:
//   - a home page ("/")
//   - a sign up page ("/signup") that creates a user (email + password)
//   - a login page ("/login") that checks email + password against the DB
//   - a protected dashboard ("/dashboard") for logged-in users
//   - a logout route ("/logout")
//
// Passwords are hashed with bcrypt before being stored - never store
// plain-text passwords. Sessions (via express-session) keep the user
// logged in across page loads using a cookie.

const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config();
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// ---- View engine ----
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ---- Middleware ----
app.use(express.urlencoded({ extended: true })); // parse form submissions
app.use(express.static(path.join(__dirname, 'public'))); // serve CSS, etc.

app.use(session({
  secret: 'replace-this-with-a-real-secret-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 2 // 2 hours
  }
}));

// Make the logged-in user's email available to all templates
app.use((req, res, next) => {
  res.locals.userEmail = req.session.userEmail || null;
  next();
});

// ---- Helper: require login ----
function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
}

// ---- Routes ----

// Front page
app.get('/', (req, res) => {
  res.render('index');
});

// Sign up - show form
app.get('/signup', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.render('signup', { error: null, email: '' });
});

// Sign up - handle form submission
app.post('/signup', async (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const password = req.body.password || '';
  const confirmPassword = req.body.confirmPassword || '';

  // Basic validation
  if (!email || !password || !confirmPassword) {
    return res.render('signup', { error: 'Please fill in all fields.', email });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return res.render('signup', { error: 'Please enter a valid email address.', email });
  }

  if (password.length < 6) {
    return res.render('signup', { error: 'Password must be at least 6 characters.', email });
  }

  if (password !== confirmPassword) {
    return res.render('signup', { error: 'Passwords do not match.', email });
  }

  // Check if the email is already registered
  const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email]);
  if (existingUser) {
    return res.render('signup', { error: 'An account with that email already exists.', email });
  }

  // Hash the password and save the new user
  const passwordHash = bcrypt.hashSync(password, 10);
  const result = await db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, passwordHash]);

  // Log the new user in automatically
  req.session.userId = result.insertId;
  req.session.userEmail = email;

  res.redirect('/dashboard');
});

// Login - show form
app.get('/login', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.render('login', { error: null, email: '' });
});

// Login - handle form submission
app.post('/login', async (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const password = req.body.password || '';

  if (!email || !password) {
    return res.render('login', { error: 'Please enter your email and password.', email });
  }

  const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);

  // Use the same error message whether the email or password is wrong,
  // so we don't reveal which emails are registered.
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.render('login', { error: 'Incorrect email or password.', email });
  }

  req.session.userId = user.id;
  req.session.userEmail = user.email;

  res.redirect('/dashboard');
});

// Dashboard - only for logged-in users
app.get('/dashboard', requireLogin, async (req, res) => {
  const user = await db
    .get('SELECT email, created_at FROM users WHERE id = ?', [req.session.userId]);

  res.render('dashboard', { user });
});

// Logout
app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
