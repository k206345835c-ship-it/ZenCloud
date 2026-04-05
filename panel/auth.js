const express = require('express');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;

const router = express.Router();

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new DiscordStrategy({
    clientID: '1238570679465410571',
    clientSecret: '3Mhj-0MR6gmNg6AO8yisZTFXYgY1_rlS',
    callbackURL: 'http://localhost:3000/auth/discord/callback',
    scope: ['identify', 'email']
}, (accessToken, refreshToken, profile, done) => done(null, profile)));

router.get('/discord', passport.authenticate('discord'));
router.get('/discord/callback',
    passport.authenticate('discord', { failureRedirect: '/' }),
    (req, res) => res.redirect('/')
);

module.exports = router;
