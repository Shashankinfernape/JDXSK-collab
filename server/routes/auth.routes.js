const express = require('express');
const passport = require('passport');
const authController = require('../controllers/auth.controller');
const router = express.Router();

// Route 1: Initiate Google Login
// When the client redirects here, Passport starts the Google OAuth flow.
// GET /api/auth/google
router.get('/google', passport.authenticate('google', {
  scope: [
    'profile', // Request basic profile info (name, photo)
    'email',   // Request email address
    'https://www.googleapis.com/auth/drive.file' // Scope needed for Google Drive backup later
  ],
  session: false // We are not using server sessions, using JWT instead
}));

// Route 2: Google Callback
// Google redirects the user back HERE after they approve login.
// GET /api/auth/google/callback
router.get(
  '/google/callback',
  // Passport middleware tries to authenticate using the code Google provides
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=true`, // Redirect back to client login on failure
    session: false // Still no sessions needed
  }),
  // If passport.authenticate succeeds, it attaches 'req.user'
  // Then, it calls our controller function to handle the success
  authController.googleCallback
);

module.exports = router;
