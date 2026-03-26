const express = require('express');
const router = express.Router();
const { requireAttendeeLogin } = require('../middleware');

// Enforce attendee authentication for all attendee routes
router.use(requireAttendeeLogin);

/**
 * @route   GET /attendee/
 * @desc    Display all published events to logged-in attendees
 * @access  Private
 */

router.get('/', (req, res, next) => {
    const query = `SELECT event_id, title, event_date, description, ticket_count_full, ticket_count_concession, price_full, price_concession
        FROM events
        WHERE is_published = 1`;

    global.db.all(query, [], (err, events) => {
        if (err) return next(err);

        global.db.get("SELECT * FROM site_settings LIMIT 1", (err, siteInfo) => {
            if (err) return res.status(500).send("Error fetching site settings");
            res.render("attendee/attendee-home", {
                site: siteInfo,
                user: req.session.user,
                events
            });
        });
    });
});


/**
 * @route   GET /attendee/my-bookings
 * @desc    Display list of ticket bookings made by the logged-in attendee
 * @access  Private
 */
router.get('/my-bookings', (req, res, next) => {
    const userId = req.session.user?.user_id;

    if (!userId) return res.redirect('/');

    const query = `
    SELECT 
        e.title,
        e.event_date,
        b.ticket_type,
        SUM(b.quantity) AS total,
        CASE b.ticket_type
            WHEN 'full' THEN e.ticket_count_full - (
                SELECT IFNULL(SUM(quantity), 0)
                FROM bookings
                WHERE event_id = e.event_id AND ticket_type = 'full'
            )
            WHEN 'concession' THEN e.ticket_count_concession - (
                SELECT IFNULL(SUM(quantity), 0)
                FROM bookings
                WHERE event_id = e.event_id AND ticket_type = 'concession'
            )
        END AS tickets_remaining
        FROM bookings b
        JOIN events e ON e.event_id = b.event_id
        WHERE b.user_id = ?
        GROUP BY e.title, b.ticket_type
    `;

    global.db.all(query, [userId], (err, bookings) => {
        if (err) return next(err);

        global.db.get("SELECT * FROM site_settings LIMIT 1", (err, siteInfo) => {
            if (err) return res.status(500).send("Error fetching site settings");
            res.render('attendee/attendee-bookings', {
                bookings,
                user: req.session.user,
                site: siteInfo
            });
        });
    });
});


/**
 * @route   GET /attendee/event/:eventId
 * @desc    Render event details and booking form for a specific event
 * @access  Private
 */
router.get('/event/:eventId', (req, res, next) => {
    const eventId = req.params.eventId;
    const query = "SELECT * FROM events WHERE event_id = ?";

    global.db.get(query, [eventId], (err, event) => {
        if (err) return next(err);
        if (!event) return res.status(404).send("Event not found");

        global.db.get("SELECT * FROM site_settings LIMIT 1", (err, siteInfo) => {
            if (err) return res.status(500).send("Error fetching site settings");

            res.render('attendee/events', {
                event,
                error: null,
                success: null,
                previous: null,
                user: req.session.user,
                site: siteInfo
            });
        });
    });
});


/**
 * @route   POST /attendee/event/:eventId
 * @desc    Process ticket booking for a selected event and ticket type
 * @access  Private
 * @input   req.body.ticket_type ('regular' or 'vip'), req.body.quantity
 * @output  Redirects to /attendee/confirmation on success, or re-renders form on failure
 */
router.post('/event/:eventId', (req, res, next) => {
    const eventId = req.params.eventId;
    const quantity = parseInt(req.body.quantity);
    const ticketType = req.body.ticket_type;

    if (!['full', 'concession'].includes(ticketType)) {
    return res.status(400).send("Invalid ticket type.");
    }

    const column = ticketType === 'full' ? 'ticket_count_full' : 'ticket_count_concession';

    const query = `
        UPDATE events
        SET ${column} = ${column} - ?
        WHERE event_id = ? AND ${column} >= ?
    `;

    global.db.run(query, [quantity, eventId, quantity], function (err) {
        if (err) return next(err);

        if (this.changes === 0) {
            // Not enough tickets, show error on same page
            global.db.get("SELECT * FROM events WHERE event_id = ?", [eventId], (err, event) => {
                if (err) return next(err);
                if (!event) return res.status(404).send("Event not found");

                res.render('attendee/events', {
                    event,
                    error: "Not enough tickets available.",
                    success: null,
                    previous: { ticket_type: ticketType, quantity }
                });
            });
        } 
        else {
            // Booking successful, redirect to confirmation page
            const userId = req.session.user?.user_id;

            if (!userId) {
                return res.status(401).send("Not logged in");
            }

            const insertQuery = `INSERT INTO bookings (event_id, user_id, ticket_type, quantity) VALUES (?, ?, ?, ?)`;
            global.db.run(insertQuery, [eventId, userId, ticketType, quantity], function (err) {
                if (err) return next(err);
                res.redirect(`/attendee/confirmation?qty=${quantity}&type=${ticketType}`);
            });
        }
    });
});

/**
 * @route   GET /attendee/confirmation
 * @desc    Show booking confirmation summary
 * @access  Private
 * @input   Query string: qty (Number), type (String)
 */
router.get('/confirmation', (req, res) => {
    const { qty, type } = req.query;

    res.render('attendee/confirmation', {
        qty,
        type
    });
});

module.exports = router;
