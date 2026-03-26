/**
* index.js
* This is your main app entry point
*/

/**
 * @desc  Main Express app entry point
 * @usage Sets up middleware, session, database connection, routes, and view engine
 */
const express = require('express');
const bcrypt = require('bcrypt'); // set up bcrypt for login
const app = express();
const port = 3000;

/**
 * @desc  Configure express-session middleware
 * @usage Used to persist user session data across requests
 */
const session = require('express-session'); 

app.use(session({
    secret: 'cm2040-secret',
    resave: false,
    saveUninitialized: true
}));

app.use(express.urlencoded({ extended: true })); 
app.set('view engine', 'ejs'); // set the app to use ejs for rendering
app.use(express.static(__dirname + '/public')); // set location of static files

/**
 * @desc  Automatically fetch site settings for use in views (via res.locals)
 * @scope Runs before all route handlers
 */
app.use((req, res, next) => {
    const query = "SELECT * FROM site_settings LIMIT 1";
    global.db.get(query, [], (err, row) => {
        if (err) return next(err);
        res.locals.site = {
            name: row?.site_name || 'Event Site',
            description: row?.site_description || ''
        };
        next();
    });
});

/**
 * @desc  Connect to SQLite database and enable foreign key constraints
 * @error Exits process if DB connection fails
 */
const sqlite3 = require('sqlite3').verbose();
global.db = new sqlite3.Database('./database.db',function(err){
    if(err){
        console.error(err);
        process.exit(1); // bail out we can't connect to the DB
    } else {
        console.log("Database connected");
        global.db.run("PRAGMA foreign_keys=ON"); // tell SQLite to pay attention to foreign key constraints
    }
});

/**
 * @route   GET /
 * @desc    Load homepage with site info, featured event, and (if logged in) all published events
 * @access  Public or Private (features vary based on session)
 */
app.get('/', (req, res) => {
    const user = req.session.user;

    // Fetch site settings
    const siteQuery = `SELECT * FROM site_settings LIMIT 1`;
    db.get(siteQuery, [], (err, siteRow) => {
    if (err) return next(err);

  // FIX: Normalize the keys to match what home.ejs expects
    const site = {
    name: siteRow?.site_name || 'Event Site',
    description: siteRow?.site_description || ''
    };


        // Fetch featured event (1 max)
        const featuredQuery = `
            SELECT 
                e.*,
                e.ticket_count_full - IFNULL(SUM(CASE WHEN b.ticket_type = 'full' THEN b.quantity ELSE 0 END), 0) AS full_tickets_remaining,
                e.ticket_count_concession - IFNULL(SUM(CASE WHEN b.ticket_type = 'concession' THEN b.quantity ELSE 0 END), 0) AS concession_tickets_remaining
            FROM events e
            LEFT JOIN bookings b ON e.event_id = b.event_id
            WHERE e.is_featured = 1 AND e.is_published = 1
            GROUP BY e.event_id
            LIMIT 1
        `;

        global.db.get(featuredQuery, [], (err, featuredEvent) => {
            if (err) {
                console.error("Failed to load featured event:", err);
                return res.status(500).send("Unable to load featured event.");
            }

            if (user && (user.role === 'attendee' || user.role === 'organiser')) {
            // Fetch all published events
            const eventsQuery = `
                SELECT 
                    e.*,
                    e.ticket_count_full - IFNULL(SUM(CASE WHEN b.ticket_type = 'full' THEN b.quantity ELSE 0 END), 0) AS full_tickets_remaining,
                    e.ticket_count_concession - IFNULL(SUM(CASE WHEN b.ticket_type = 'concession' THEN b.quantity ELSE 0 END), 0) AS concession_tickets_remaining
                FROM events e
                LEFT JOIN bookings b ON e.event_id = b.event_id
                WHERE e.is_published = 1
                GROUP BY e.event_id
            `;

            global.db.all(eventsQuery, [], (err, allEvents) => {
                if (err) {
                    console.error("Failed to load events:", err);
                    return res.status(500).send("Unable to load events.");
                }

                res.render('home', {
                    site,
                    user,
                    featured: featuredEvent,
                    events: allEvents
                });
            });
            } 
            else {
                // Anonymous view
                res.render('home', {
                    site,
                    user,
                    featured: featuredEvent,
                    events: []
                });
            }

        });
    });
});

// Add all the route handlers in usersRoutes to the app under the path /users
const usersRoutes = require('./routes/users');
app.use('/users', usersRoutes);

const organiserRoutes = require('./routes/organiser');
app.use('/organiser', organiserRoutes);

const settingsRoutes = require('./routes/settings'); 
app.use('/settings', settingsRoutes); // Mounts /settings path

const attendeeRoutes = require('./routes/attendee');
app.use('/attendee', attendeeRoutes);

// GET: Login page
app.get('/login', (req, res) => {
    res.render('index', { error: null });
});

/**
 * @route   GET /login
 * @desc    Render login form
 * @access  Public
 */
app.post('/login', (req, res, next) => {
    const { username, password } = req.body;

    const query = `SELECT * FROM users WHERE username = ?`;
    global.db.get(query, [username], async (err, user) => {
        if (err) return next(err);
        if (!user) {
            return res.render('index', { error: 'Invalid credentials' });
        }

        let isValid = false;

        if (user.role === 'organiser') {
            // Organiser login with plaintext password (e.g., 'Password1')
            isValid = (user.password === password);
        } 
        else if (user.role === 'attendee') {
            // Attendee login with hashed password
            isValid = await bcrypt.compare(password, user.password);
        }

        if (!isValid) {
            return res.render('index', { error: 'Invalid credentials' });
        }

        req.session.user = user;

        if (user.role === 'organiser') {
            return res.redirect('/organiser');
        } 
        else if (user.role === 'attendee') {
            return res.redirect('/attendee');
        } 
        else {
            return res.status(403).send("Unknown role");
        }
    });
});

// Route: logout
const usersRouter = require('./routes/users');
app.use('/', usersRouter);

/**
 * @route   GET /register
 * @desc    Render registration form for new attendees
 * @access  Public
 */
app.get('/register', (req, res) => {
    res.render('auth/register', { error: null });
});

/**
 * @route   POST /register
 * @desc    Register a new attendee with hashed password, mount users, organiser, settings, and attendee routes
 * @access  Public
 * @usage   e.g. /users/list-users, /organiser/, /settings/, /attendee/
 */

app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const hashed = await bcrypt.hash(password, 10);
        const sql = "INSERT INTO users (username, password, role) VALUES (?, ?, 'attendee')";

        global.db.run(sql, [username, hashed], function(err) {
            if (err) {
                return res.render('auth/register', { error: 'Username already taken.' });
            }
            res.redirect('/'); // Redirect to login after successful registration
        });
    } catch (err) {
        res.render('auth/register', { error: 'Registration failed. Please try again.' });
    }
});

/**
 * @desc    Start listening for HTTP requests
 * @port    3000
 */
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
