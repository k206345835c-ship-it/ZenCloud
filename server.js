require('dotenv').config();

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const path = require('path');

const app = express();

const PORT = process.env.PORT || 3000;

// ====== SESSION ======
app.use(session({
    secret: process.env.SESSION_SECRET || 'zencloud_secret',
    resave: false,
    saveUninitialized: false
}));

// ====== PASSPORT ======
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: process.env.DISCORD_CALLBACK_URL,
    scope: ['identify', 'email']
}, (accessToken, refreshToken, profile, done) => {
    process.nextTick(() => done(null, profile));
}));

// ====== STATIC FILES ======
app.use(express.static(path.join(__dirname, 'public')));

// ====== AUTH ROUTES ======
app.get('/auth/discord', passport.authenticate('discord'));

app.get('/auth/discord/callback',
    passport.authenticate('discord', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/');
    }
);

app.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});

// ====== API USER ======
app.get('/api/user', (req, res) => {
    if (!req.user) return res.json(null);

    res.json({
        username: req.user.username,
        avatar: `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.png`,
        id: req.user.id
    });
});

// ====== START SERVER ======
app.listen(PORT, () => {
    const url = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
    console.log("ZenCloud działa na " + url);
});
