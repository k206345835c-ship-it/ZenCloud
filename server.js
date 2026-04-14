const express = require("express");
const session = require("express-session");
const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;

const app = express();

const PORT = process.env.PORT || 3000;

// ===== SESSION =====
app.use(session({
    secret: "zencloudthebest",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// ===== PASSPORT =====
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: "https://zencloud.net.pl/auth/discord/callback",
    scope: ["identify", "guilds", "guilds.join"]
},
(accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

// ===== ROUTES =====
app.get("/", (req, res) => {
    if (req.isAuthenticated()) {
        res.send(`
            <h1>Zalogowany jako ${req.user.username}#${req.user.discriminator}</h1>
            <img src="https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.png" width="120"/>
            <br/><br/>
            <a href="/logout">Wyloguj</a>
        `);
    } else {
        res.send(`
            <h1>ZenCloud Panel</h1>
            <a href="/auth/discord">Zaloguj przez Discord</a>
        `);
    }
});

app.get("/auth/discord",
    passport.authenticate("discord")
);

app.get("/auth/discord/callback",
    passport.authenticate("discord", { failureRedirect: "/" }),
    (req, res) => {
        res.redirect("/");
    }
);

app.get("/logout", (req, res) => {
    req.logout(() => {
        res.redirect("/");
    });
});

// ===== START =====
app.listen(PORT, () => {
    console.log("ZenCloud działa na porcie " + PORT);
});
