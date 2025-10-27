const jwt = require('jsonwebtoken');

// Utility function to generate a JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token valid for 30 days
  });
};

// This is called after Passport successfully authenticates the user
const googleCallback = (req, res) => {
  try {
    // 'req.user' is attached by Passport from the 'done(null, user)' call
    const user = req.user;
    
    // Generate a JWT for our user
    const token = generateToken(user._id);

    // We can't send the token in the response body because it's a redirect.
    // Instead, we redirect back to the client and pass the token as a URL query.
    // The client-side (React) will need to read this from the URL and save it.
    
    // A better way: Send user data and token in a script that sets localStorage and closes.
    // For simplicity, we'll redirect with a query.
    
    const userJson = JSON.stringify(user);

    // Redirect back to the client app
    res.redirect(`${process.env.CLIENT_URL}?token=${token}&user=${encodeURIComponent(userJson)}`);

  } catch (err) {
    console.error(err);
    res.redirect(`${process.env.CLIENT_URL}/login?error=true`);
  }
};

module.exports = {
  googleCallback,
};