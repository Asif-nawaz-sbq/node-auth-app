# Node Auth Starter

A small Node.js project with three pages:

- **Home (`/`)** — landing page with links to sign up / log in
- **Sign up (`/signup`)** — create an account with an email and password
- **Login (`/login`)** — log in with your email and password
- **Dashboard (`/dashboard`)** — a protected page only visible once logged in

Accounts are stored in a local SQLite database file (`database.sqlite`),
which is created automatically the first time you run the app. Passwords
are hashed with `bcrypt` before being saved — the plain-text password is
never stored.

## Tech stack

- [Express](https://expressjs.com/) — web server and routing
- [EJS](https://ejs.co/) — simple HTML templates
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) — embedded database
- [bcryptjs](https://www.npmjs.com/package/bcryptjs) — password hashing
- [express-session](https://www.npmjs.com/package/express-session) — login sessions (cookies)

## Project structure

```
node-auth-app/
├── server.js          # Express app and routes
├── db.js               # SQLite connection + users table setup
├── package.json
├── views/
│   ├── index.ejs        # Home page
│   ├── signup.ejs        # Sign up form
│   ├── login.ejs          # Login form
│   ├── dashboard.ejs       # Protected page after login
│   └── partials/
│       ├── header.ejs
│       └── footer.ejs
└── public/
    └── style.css        # Styling for all pages
```

## Setup

1. Make sure you have [Node.js](https://nodejs.org/) installed (v18 or later recommended).
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the server:

   ```bash
   npm start
   ```

4. Open your browser to:

   ```
   http://localhost:3000
   ```

The first time you run the app, a `database.sqlite` file will be created
automatically in the project folder — this is where user accounts are stored.

## How it works

- **Sign up**: submits the form to `POST /signup`. The server checks the
  email isn't already used, hashes the password with bcrypt, and inserts
  a new row into the `users` table. The new user is then logged in automatically.
- **Login**: submits the form to `POST /login`. The server looks up the
  user by email and compares the submitted password against the stored
  hash using `bcrypt.compareSync`.
- **Sessions**: on successful sign up / login, `req.session.userId` and
  `req.session.userEmail` are set. A signed cookie keeps the session alive
  between requests.
- **Dashboard**: the `/dashboard` route is protected by a `requireLogin`
  middleware that redirects to `/login` if there's no active session.
- **Logout**: `POST /logout` destroys the session.

## Notes for going further

- Change the `session secret` in `server.js` to a long random string
  before deploying anywhere (and load it from an environment variable).
- This project does **not** send real verification emails — "email
  authentication" here means the email address is used as the account's
  identifier/username. Adding email verification (e.g. with a service
  like Nodemailer + a confirmation link) would be a natural next step.
- For production, set `cookie.secure = true` in the session config
  (requires HTTPS) and consider a more persistent session store.
