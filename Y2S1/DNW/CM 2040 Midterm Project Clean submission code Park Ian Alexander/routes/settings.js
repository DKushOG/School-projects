const express = require('express');
const router = express.Router();
const { requireOrganiserLogin } = require('../middleware');

// Enforce organiser authentication for settings routes
router.use(requireOrganiserLogin);

/**
 * @route   GET /settings/
 * @desc    Render the site settings form with current site name and description
 * @access  Private (organiser only)
 */
router.get('/', (req, res, next) => {
    const query = "SELECT * FROM site_settings LIMIT 1";

    global.db.get(query, [], (err, row) => {
        if (err) return next(err);
        res.render('organiser/site-settings', {
            settings: row,
            siteInfo: row,              // Provide settings as siteInfo
            user: req.session.user      // Provide logged-in user to navbar
        });
    });
});

/**
 * @route   POST /settings/
 * @desc    Update site name and description based on submitted form values
 * @access  Private (organiser only)
 * @input   req.body.site_name, req.body.site_description
 * @output  Redirects to organiser home page after update
 */
router.post('/', (req, res, next) => {
    const { site_name, site_description } = req.body;
    const query = `
        UPDATE site_settings
        SET site_name = ?, site_description = ?
    `;
    global.db.run(query, [site_name, site_description], function(err) {
        if (err) return next(err);
        res.redirect('/organiser');
    });
});

module.exports = router;
