/**
 * users.js
 * These are example routes for user management
 * This shows how to correctly structure your routes for the project
 * and the suggested pattern for retrieving data by executing queries
 *
 * NB. it's better NOT to use arrow functions for callbacks with the SQLite library
* 
 */

const express = require("express");
const router = express.Router();

/**
 * @route   GET /list-users
 * @desc    Retrieve and return a list of all users as JSON
 * @access  Possibly Admin (or internal testing use)
 */
router.get("/list-users", (req, res, next) => {
    // Define the query
    query = "SELECT * FROM users"

    // Execute the query and render the page with the results
    global.db.all(query, 
        function (err, rows) {
            if (err) {
                next(err); //send the error on to the error handler
            } else {
                res.json(rows); // render page as simple json
            }
        }
    );
});

/**
 * @route   GET /add-user
 * @desc    Render a form for creating a new user
 * @access  Public (if testing), or restricted in production
 */
router.get("/add-user", (req, res) => {
    res.render("auth/add-user.ejs");
});

/**
 * @route   POST /add-user
 * @desc    Insert a new user into the database using form data
 * @access  Public (if testing), or restricted in production
 * @input   req.body.user_name
 * @output  Confirmation message with new user ID
 */
router.post("/add-user", (req, res, next) => {
    // Define the query
    query = "INSERT INTO users (user_name) VALUES( ? );"
    query_parameters = [req.body.user_name]
    
    // Execute the query and send a confirmation message
    global.db.run(query, query_parameters,
        function (err) {
            if (err) {
                next(err); //send the error on to the error handler
            } else {
                res.send(`New data inserted @ id ${this.lastID}!`);
                next();
            }
        }
    );
});

// Export the router object so index.js can access it
module.exports = router;

/**
 * @route   GET /logout
 * @desc    Destroy user session and log out
 * @access  Private (logged-in users only)
 */
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log("Logout error:", err);
            return res.status(500).send("Could not log out.");
        }

        // Redirect based on user role if needed
        res.redirect('/');
    });
});