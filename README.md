# Node Auth Starter

A small Node.js project with three pages:

- **Home (`/`)** — landing page with links to sign up / log in
- **Sign up (`/signup`)** — create an account with an email and password
- **Login (`/login`)** — log in with your email and password
- **Dashboard (`/dashboard`)** — a protected page only visible once logged in

Accounts are stored in a MySQL database configured via environment
variables. The app will create the `users` table automatically the first
time it runs, but the MySQL *database* itself must exist beforehand.
Passwords are hashed with `bcrypt` before being saved — the plain-text
password is never stored.

## Tech stack

- [Express](https://expressjs.com/) — web server and routing
- [EJS](https://ejs.co/) — simple HTML templates
- [mysql2](https://github.com/sidorares/node-mysql2) — MySQL client (using promise pool)
- [dotenv](https://www.npmjs.com/package/dotenv) — load `.env` file into `process.env`
- [bcryptjs](https://www.npmjs.com/package/bcryptjs) — password hashing
- [express-session](https://www.npmjs.com/package/express-session) — login sessions (cookies)

## Project structure

```
node-auth-app/
├── server.js          # Express app and routes
├── db.js               # MySQL connection (reads env) + users table setup
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

3. Copy the example environment file and edit values for your MySQL server:

  ```bash
  cp .env.example .env
  # then edit .env to set DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, etc.
  ```

4. Ensure the MySQL database named in `DB_NAME` exists. The app will create
  the `users` table but not the database itself. Create it with:

  ```sql
  CREATE DATABASE `your_db_name` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ```

5. Start the server:

  ```bash
  npm start
  ```

3. Start the server:

   ```bash
   npm start
   ```

4. Open your browser to:

   ```
   http://localhost:3000
   ```

The app reads MySQL connection values from environment variables (see
`.env.example`). The `users` table is created automatically on startup
if it does not exist.

## How it works

- **Sign up**: submits the form to `POST /signup`. The server checks the
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
  Set `SESSION_SECRET` in your `.env` before deploying.
- This project does **not** send real verification emails — "email
  authentication" here means the email address is used as the account's
  identifier/username. Adding email verification (e.g. with a service
  like Nodemailer + a confirmation link) would be a natural next step.
- For production, set `cookie.secure = true` in the session config
  (requires HTTPS) and consider a more persistent session store.
 - If your MySQL host requires TLS/SSL, add connection options in `db.js`
   (I can add an example if you need it).

## Environment variables

- `DB_HOST` — MySQL host
- `DB_PORT` — MySQL port (default `3306`)
- `DB_USER` — MySQL user
- `DB_PASSWORD` — MySQL password
- `DB_NAME` — MySQL database name
- `PORT` — port the app listens on (default `3000`)
- `SESSION_SECRET` — secret for express-session
