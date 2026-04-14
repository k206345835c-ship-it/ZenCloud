require("dotenv").config();

const express = require("express");
const session = require("express-session");
const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;
const path = require("path");

const app = express();

app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/auth/discord/callback`,
      scope: ["identify", "email"],
    },
    (accessToken, refreshToken, profile, done) => {
      process.nextTick(() => done(null, profile));
    }
  )
);

// ROUTES

app.get("/", (req, res) => {
  if (!req.user) {
    return res.send(`
      <h1>ZenCloud</h1>
      <a href="/auth/discord">Zaloguj się przez Discord</a>
    `);
  }

  res.send(`
    <h1>Witaj ${req.user.username}</h1>
    <img src="https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.png" width="100"/>
    <br/><br/>
    <a href="/logout">Wyloguj</a>
  `);
});

app.get(
  "/auth/discord",
  passport.authenticate("discord")
);

app.get(
  "/auth/discord/callback",
  passport.authenticate("discord", {
    failureRedirect: "/",
  }),
  (req, res) => {
    res.redirect("/");
  }
);

app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

// RENDER PORT FIX
app.listen(process.env.PORT, "0.0.0.0", () => {
  console.log("ZenCloud działa na porcie " + process.env.PORT);
});
