const express = require('express');
const router = express.Router();
const { requireOrganiserLogin } = require('../middleware');

// Enforce organiser authentication for all organiser routes
router.use(requireOrganiserLogin);

/**
 * @route   GET /organiser/
 * @desc    Display published and draft events for the organiser
 * @access  Private
 */
router.get('/', (req, res, next) => {
  global.db.get('SELECT site_name, site_description FROM site_settings', (err, siteRow) => {
    if (err) return next(err);

    const publishedQuery = `
      SELECT *
      FROM events
      WHERE is_published = 1
    `;
    
      global.db.all(publishedQuery, [], (err, publishedEvents) => {

        global.db.all('SELECT * FROM events WHERE is_published = 0', (err, draftEvents) => {
          if (err) return next(err);

          res.render('organiser/organiser-home', {
            siteInfo: {
              name: siteRow.site_name,
              description: siteRow.site_description
            },
            published: publishedEvents,
            drafts: draftEvents,
            user: req.session.user
          });
        });
      });
  });
});

/**
 * @route   GET /organiser/add
 * @desc    Render form to create a new event
 * @access  Private
 */
router.get('/add', (req, res, next) => {
  global.db.get('SELECT site_name, site_description FROM site_settings', (err, siteRow) => {
    if (err) return next(err);

    res.render('organiser/edit-event', {
      siteInfo: {
        name: siteRow.site_name,
        description: siteRow.site_description
      },
      user: req.session.user,
      event: {
        title: '',
        description: '',
        event_date: '',
        ticket_count_full: 0,
        price_full: 0,
        ticket_count_concession: 0,
        price_concession: 0,
        is_published: 0
      },
      isEdit: false
    });
  });
});

/**
 * @route   POST /organiser/add
 * @desc    Handle submission to create a new event
 * @access  Private
 * @input   req.body with event fields
 * @output  Redirects to organiser dashboard or returns form with error
 */
router.post('/add', requireOrganiserLogin, (req, res, next) => {
  const {
    title,
    description,
    event_date,
    ticket_count_full,
    price_full,
    ticket_count_concession,
    price_concession,
    is_featured
  } = req.body;

  const isFeatured = is_featured === 'on' ? 1 : 0;

  function insertEvent() {
    const insertQuery = `
     INSERT INTO events (
        title, description, event_date,
        ticket_count_full, price_full,
        ticket_count_concession, price_concession,
        is_featured, is_published
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
    `;
    global.db.run(
      insertQuery,[
        title, description, event_date,
        ticket_count_full, price_full,
        ticket_count_concession, price_concession,
        isFeatured
      ],
      function (err) {
        if (err) return next(err);
        res.redirect('/organiser');
      }
    );
  }

  // Prevent multiple featured events
  if (isFeatured) {
    const checkQuery = `SELECT event_id FROM events WHERE is_featured = 1`;
    global.db.get(checkQuery, [], (err, row) => {
      if (err) return next(err);
      if (row) {
        global.db.get('SELECT site_name, site_description FROM site_settings', (err, siteRow) => {
          if (err) return next(err);

          return res.render('organiser/edit-event', {
            siteInfo: {
              name: siteRow.site_name,
              description: siteRow.site_description
            },
            user: req.session.user,
            event: {
              title,
              description,
              event_date,
              ticket_count_full,
              price_full,
              ticket_count_concession,
              price_concession,
              is_featured: isFeatured
            },
            isEdit: false,
            error: "Another event is already marked as featured. Please unfeature it first."
          });
        });

      } 
      else {
        insertEvent(); 
      }
    });
  } 
  else {
    insertEvent();
  }
});

/**
 * @route   GET /organiser/edit/:eventId
 * @desc    Render edit form for an existing event
 * @access  Private
 * @input   :eventId param
 * @output  Edit event form or 404 if not found
 */
router.get('/edit/:eventId', (req, res, next) => {
  const query = "SELECT * FROM events WHERE event_id = ?";
  global.db.get(query, [req.params.eventId], (err, row) => {
    if (err) return next(err);
    if (!row) return res.status(404).send("Event not found");
    global.db.get('SELECT site_name, site_description FROM site_settings', (err, siteRow) => {
      if (err) return next(err);

      res.render('organiser/edit-event', {
        siteInfo: {
          name: siteRow.site_name,
          description: siteRow.site_description
        },
        user: req.session.user,
        event: row,
        isEdit: true
      });
    });
  });
});

/**
 * @route   POST /organiser/edit/:eventId
 * @desc    Handle event updates including ticket numbers and feature flag
 * @access  Private
 * @input   req.body with updated event data
 */
router.post('/edit/:eventId', (req, res, next) => {
  const eventId = req.params.eventId;
  const {
    title,
    description,
    event_date,
    ticket_count_full,
    price_full,
    ticket_count_concession,
    price_concession
  } = req.body;

  const isFeatured = req.body.is_featured === 'on' ? 1 : 0;

  const updateEvent = () => {
    const updateQuery = `
      UPDATE events 
      SET title = ?, description = ?, event_date = ?, ticket_count_full = ?, price_full = ?, ticket_count_concession = ?, price_concession = ?, is_featured = ?
      WHERE event_id = ?
    `;
    const values = [title, description, event_date, ticket_count_full, price_full, ticket_count_concession, price_concession, isFeatured, eventId];

    global.db.run(updateQuery, values, function (err) {
      if (err) return next(err);
      res.redirect('/organiser');
    });
  };

  // If user marked this as featured, send a message that they need to unset others first
  if (isFeatured) {
  // Check if any other event is already featured (excluding current one)
  const checkQuery = `SELECT event_id FROM events WHERE is_featured = 1 AND event_id != ?`;
  global.db.get(checkQuery, [eventId], (err, existing) => {
    if (err) return next(err);
    if (existing) {
      // Return the user back to the edit form with error message
      global.db.get('SELECT site_name, site_description FROM site_settings', (err, siteRow) => {
      if (err) return next(err);

          return res.render('organiser/edit-event', {
            siteInfo: {
              name: siteRow.site_name,
              description: siteRow.site_description
            },
            user: req.session.user,
            event: {
              ...req.body,
              event_id: eventId
            },
            isEdit: true,
            error: "Another event is already marked as featured. Please unfeature it first."
          });
      });
    }
    else {
      updateEvent(); // safe to proceed
    }
  });
  } 
  else {
    updateEvent();
  }
});

/**
 * @route   POST /organiser/publish/:eventId
 * @desc    Mark an event as published and set the publication date
 * @access  Private
 */
router.post('/publish/:eventId', (req, res, next) => {
  const query = `
    UPDATE events 
    SET is_published = 1, published_at = datetime('now')
    WHERE event_id = ?
  `;
  global.db.run(query, [req.params.eventId], function (err) {
    if (err) return next(err);
    res.redirect('/organiser');
  });
});

// Delete an event
router.post('/delete/:eventId', (req, res, next) => {
  global.db.run("DELETE FROM events WHERE event_id = ?", [req.params.eventId], function (err) {
    if (err) return next(err);
    res.redirect('/organiser');
  });
});

// Toggle event as featured
router.post('/toggle-feature/:eventId', (req, res, next) => {
  const eventId = req.params.eventId;

  const query = `SELECT is_featured FROM events WHERE event_id = ?`;
  global.db.get(query, [eventId], (err, row) => {
    if (err) return next(err);
    if (!row) return res.status(404).send("Event not found.");

    if (row.is_featured) {
      // Unfeature the event
      const update = `UPDATE events SET is_featured = 0 WHERE event_id = ?`;
      global.db.run(update, [eventId], err => {
        if (err) return next(err);
        return res.redirect('/organiser');
      });
    } 
    else {
      // Check if another featured event exists
      const check = `SELECT event_id FROM events WHERE is_featured = 1`;
      global.db.get(check, [], (err, existing) => {
        if (err) return next(err);

        if (existing) {
          // Reload organiser-home with error
          global.db.get('SELECT site_name, site_description FROM site_settings', (err, siteRow) => {
            if (err) return next(err);

            global.db.all('SELECT * FROM events WHERE is_published = 1', (err, publishedEvents) => {
              if (err) return next(err);

              global.db.all('SELECT * FROM events WHERE is_published = 0', (err, draftEvents) => {
                if (err) return next(err);

                return res.render('organiser/organiser-home', {
                  siteInfo: {
                    name: siteRow.site_name,
                    description: siteRow.site_description
                  },
                  published: publishedEvents,
                  drafts: draftEvents,
                  error: "Another event is already marked as featured. Please unfeature it first.",
                  user: req.session.user
                });
              });
            });
          });
        } 
        else {
          // Feature the new event
          const feature = `UPDATE events SET is_featured = 1 WHERE event_id = ?`;
          global.db.run(feature, [eventId], err => {
            if (err) return next(err);
            return res.redirect('/organiser');
          });
        }
      });
    }
  });
});


/**
 * @route   GET /organiser/bookings/:eventId
 * @desc    Show all ticket bookings for a specific event with remaining availability
 * @access  Private
 * @input   :eventId param
 * @output  Render organiser-bookings page
 */
router.get('/bookings/:eventId', requireOrganiserLogin, (req, res, next) => {
    const eventId = req.params.eventId;

    const sql = `
      SELECT 
        b.*,
        u.username,
        e.title AS event_name,
        e.ticket_count_full - (
          SELECT IFNULL(SUM(quantity), 0) FROM bookings 
          WHERE event_id = e.event_id AND ticket_type = 'full'
        ) AS remaining_full,
        e.ticket_count_concession - (
          SELECT IFNULL(SUM(quantity), 0) FROM bookings 
          WHERE event_id = e.event_id AND ticket_type = 'concession'
        ) AS remaining_concession
      FROM bookings b
      JOIN users u ON b.user_id = u.user_id
      JOIN events e ON b.event_id = e.event_id
      WHERE b.event_id = ?
    `;

  global.db.all(sql, [eventId], (err, bookings) => {
    if (err) return next(err);

    global.db.get('SELECT site_name, site_description FROM site_settings', (err, siteRow) => {
      if (err) return next(err);

      res.render('organiser/organiser-bookings', {
          bookings,
          siteInfo: {
              name: siteRow.site_name,
              description: siteRow.site_description
          },
          user: req.session.user
      });
    });
  });
});


module.exports = router;