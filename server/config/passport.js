const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user.model');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Find if user already exists
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // User exists, just pass them along
          return done(null, user);
        }

        // User doesn't exist, create a new one
        const newUser = new User({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          profilePic: profile.photos[0].value.replace('s96-c', 's400-c'), // Get higher res image
          about: 'Hi! I am using Chatflix.'
        });

        await newUser.save();
        return done(null, newUser);
      } catch (err) {
        console.error(err);
        return done(err, null);
      }
    }
  )
);

// We are using JWTs, so we don't need to serialize/deserialize user