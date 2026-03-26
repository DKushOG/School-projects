# CM2040: Event Manager Application

This is a web-based event management application built for the CM2040: Databases, Networks and the Web coursework module. It allows organisers to publish events and attendees to browse and book them. The application is built using Node.js, Express, EJS templates, and SQLite.

---

## Setup Instructions

1. **Install all dependencies**  
npm install

2. **Build the database schema**  
npm run build-db
npm run build-db-win (windows)

3. **Start the application**  
npm start

4. **Clear database (optional)**
npm run clean-db
npm run clean-db-win (windows)

---

## Admin Login (for testing)

- **Username:** `admin`  
- **Password:** `Password1`

---

## Dependencies Used

The following Node.js packages are listed in `package.json`:

- `express` – for server routing
- `ejs` – for server-side templating
- `express-session` – for handling user sessions
- `bcrypt` – for password hashing
- `dotenv` – for managing environment variables
- `sqlite3` – for database interaction

No other third-party libraries are used outside this list.

---

## Additional Notes

- Bootstrap 5 is used for all styling in this project via CDN. Version:
`https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css.` 
- An internet connection is required to load Bootstrap styles from the CDN.
