const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/api/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user exists
                let user = await User.findOne({ googleId: profile.id });

                if (user) {
                    return done(null, user);
                }

                // Check if user exists by email (to merge accounts)
                user = await User.findOne({ email: profile.emails[0].value });

                if (user) {
                    // Link Google ID to existing email account
                    user.googleId = profile.id;
                    user.avatar = profile.photos[0].value;
                    await user.save();
                    return done(null, user);
                }

                // Create new user
                user = await User.create({
                    googleId: profile.id,
                    username: profile.displayName.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000), // Generate unique username
                    email: profile.emails[0].value,
                    avatar: profile.photos[0].value,
                });

                done(null, user);
            } catch (error) {
                console.error(error);
                done(error, null);
            }
        }
    )
);

module.exports = passport;
