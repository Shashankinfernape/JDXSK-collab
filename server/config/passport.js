const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user.model');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // This is the EXACT URL Google will redirect back to after login
      // It MUST use the SERVER_URL environment variable
      callbackURL: `${process.env.SERVER_URL}/api/auth/google/callback`,
    },
    // This function runs after Google successfully authenticates the user
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists in our database
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // User exists, pass them along
          // We pass null for error, and the user object
          return done(null, user);
        } else {
          // User doesn't exist, create a new user record
          const newUser = new User({
            googleId: profile.id,
            name: profile.displayName,
            // Ensure email exists and take the first one
            email: profile.emails && profile.emails[0] ? profile.emails[0].value : '',
            // Ensure photo exists and take the first one, request higher resolution
            profilePic: profile.photos && profile.photos[0] ? profile.photos[0].value.replace('s96-c', 's400-c') : '',
            about: 'Hi! I am using Chatflix.' // Default 'about' status
          });

          await newUser.save(); // Save the new user to MongoDB
          // Pass the newly created user along
          return done(null, newUser);
        }
      } catch (err) {
        console.error("Passport Strategy Error:", err);
        // Pass the error to Passport
        return done(err, null);
      }
    }
  )
);

// Note: We are using JWT, so serializeUser and deserializeUser are not needed.
// Passport's job is just to verify the user with Google and find/create them in our DB.
