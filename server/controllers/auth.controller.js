const jwt = require('jsonwebtoken');

// Utility function to generate a JWT for our application
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    console.error("CRITICAL ERROR: JWT_SECRET is not defined!");
    throw new Error("JWT Secret is missing"); // Prevent token generation without secret
  }
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token will be valid for 30 days
  });
};

// This function is called ONLY AFTER Passport successfully authenticates the user
const googleCallback = (req, res) => {
  try {
    // Passport attaches the authenticated user object (from our DB) to req.user
    if (!req.user) {
      console.error("Error in googleCallback: req.user is missing after passport auth.");
      // Redirect to client login page with a generic error
      return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
    }

    const user = req.user;

    // Generate our application's JWT for this user
    const token = generateToken(user._id);

    // Prepare user data to send back to the client (remove sensitive fields if any)
    const userJson = JSON.stringify({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
      about: user.about
      // DO NOT send back googleId or other sensitive info
    });

    // Redirect the user's browser back to the CLIENT application (Vercel URL)
    // Pass the token and user data as URL query parameters
    res.redirect(`${process.env.CLIENT_URL}?token=${token}&user=${encodeURIComponent(userJson)}`);

  } catch (err) {
    console.error("Error in googleCallback controller:", err);
    // Redirect to client login page with a generic error
    res.redirect(`${process.env.CLIENT_URL}/login?error=server_error`);
  }
};

module.exports = {
  googleCallback,
};
