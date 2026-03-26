/**
 * @function requireOrganiserLogin
 * @desc    Middleware to restrict access to organiser-only routes
 * @usage   Used in /organiser and /settings routes
 * @redirect Redirects to home if unauthorised
 */
function requireOrganiserLogin(req, res, next) {
    if (!req.session || !req.session.user || req.session.user.role !== 'organiser') {
        return res.redirect('/');
    }
    next();
}

/**
 * @function requireAttendeeLogin
 * @desc    Middleware to restrict access to attendee-only routes
 * @usage   Used in /attendee routes
 * @redirect Redirects to home if unauthorised
 */
function requireAttendeeLogin(req, res, next) {
    if (!req.session || !req.session.user || req.session.user.role !== 'attendee') {
        return res.redirect('/');
    }
    next();
}

// Export modules for use in the routes
module.exports = {
    requireOrganiserLogin,
    requireAttendeeLogin
};
