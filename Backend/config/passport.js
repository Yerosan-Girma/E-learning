const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { pool } = require('./db');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (error) {
    done(error, null);
  }
});

// Only configure Google Strategy if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [profile.emails[0].value]
          );

          if (result.rows.length > 0) {
            // User exists, return the user
            return done(null, result.rows[0]);
          }

          // Create new user
          const newUser = await pool.query(
            `INSERT INTO users (full_name, email, password_hash, role, status) 
             VALUES ($1, $2, $3, $4, 'active') 
             RETURNING *`,
            [
              profile.displayName || profile.name.givenName + ' ' + profile.name.familyName,
              profile.emails[0].value,
              '', // Empty password for OAuth users
              'student', // Default role for OAuth users
            ]
          );

          done(null, newUser.rows[0]);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
} else {
  console.warn('Google OAuth credentials not configured. Google login will be disabled.');
}

module.exports = passport;
