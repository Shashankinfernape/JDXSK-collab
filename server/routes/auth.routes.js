const express = require('express');
const passport = require('passport');
const authController = require('../controllers/auth.controller');
const router = express.Router();

// @desc    Auth with Google
// @route   GET /api/auth/google
router.get('/google', passport.authenticate('google', { 
  scope: [
    'profile', 
    'email', 
    'https://www.googleapis.com/auth/drive.file' // Request Drive scope at login
  ] 
}));

// @desc    Google auth callback
// @route   GET /api/auth/google/callback
router.get(
  '/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${process.env.CLIENT_URL}/login`, // Redirect to login on fail
    session: false // We are using JWTs, not sessions
  }),
  authController.googleCallback
);

module.exports = router;