
-- This makes sure that foreign_key constraints are observed and that errors will be thrown for violations
PRAGMA foreign_keys=ON;

BEGIN TRANSACTION;

-- Create your tables with SQL commands here (watch out for slight syntactical differences with SQLite vs MySQL)

-- Table: users
-- Stores both organiser and attendee credentials
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('attendee', 'organiser'))
);

-- Add default organiser user (plain text password for coursework only)
INSERT INTO users (username, password, role)
VALUES ('admin', 'Password1', 'organiser');

--  Email accounts (linked to user_id)
CREATE TABLE IF NOT EXISTS email_accounts (
    email_account_id INTEGER PRIMARY KEY AUTOINCREMENT,
    email_address TEXT NOT NULL,
    user_id  INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Table: events
-- Core event information including ticketing and publication status
CREATE TABLE IF NOT EXISTS events (
    event_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    event_date TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    published_at TEXT,
    ticket_count_full INTEGER DEFAULT 0,
    ticket_count_concession INTEGER DEFAULT 0,
    price_full REAL DEFAULT 0,
    price_concession REAL DEFAULT 0,
    is_published INTEGER DEFAULT 0,
    is_featured INTEGER DEFAULT 0
);



-- Table: bookings
-- Tracks ticket purchases per user per event
CREATE TABLE bookings (
  booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  ticket_type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  FOREIGN KEY (event_id) REFERENCES events(event_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Table: site_settings
-- Contains a single row defining site title and description
CREATE TABLE IF NOT EXISTS site_settings (
    site_name TEXT,
    site_description TEXT
);

-- Seed: default site name and description
INSERT INTO site_settings (site_name, site_description) VALUES (
    'Event Title',
    'Descriptive title to attract event attendees'
);

-- Insert default data (if necessary here)

COMMIT;

