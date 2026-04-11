require("dotenv").config();

const express = require("express");
const session = require("express-session");
const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;
const axios = require("axios");

const app = express();

const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL;

// ===== SESJA =====
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

// ===== PASSPORT =====
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: `${BASE_URL}/auth/discord/callback`,
    scope: ["identify", "email", "guilds.join"],
  },
  (accessToken, refreshToken, profile, done) => {
    profile.accessToken = accessToken;
    return done(null, profile);
  }
));

// ===== FUNKCJA DODANIA NA SERWER =====
async function joinGuild(userId, accessToken) {
  await axios.put(
    `https://discord.com/api/guilds/${process.env.DISCORD_GUILD_ID}/members/${userId}`,
    { access_token: accessToken },
    {
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
}

// ===== STRONA GŁÓWNA =====
app.get("/", (req, res) => {
  res.send(`
    <h1>ZenCloud</h1>
    <a href="/auth/discord">Zaloguj przez Discord</a>
  `);
});

// ===== LOGOWANIE DISCORD =====
app.get("/auth/discord",
  passport.authenticate("discord")
);

// ===== CALLBACK =====
app.get("/auth/discord/callback",
  passport.authenticate("discord", { failureRedirect: "/" }),
  async (req, res) => {
    try {
      await joinGuild(req.user.id, req.user.accessToken);
    } catch (e) {
      console.log("Nie udało się dodać do serwera:", e.message);
    }
    res.redirect("/panel");
  }
);

// ===== PANEL =====
app.get("/panel", (req, res) => {
  if (!req.isAuthenticated()) return res.redirect("/");

  res.send(`
    <h2>Panel użytkownika</h2>
    <p>Witaj ${req.user.username}#${req.user.discriminator}</p>
    <ul>
      <li>💰 Portfel</li>
      <li>🛒 Sklep</li>
      <li>⚙️ Konto</li>
    </ul>
    <a href="/logout">Wyloguj</a>
  `);
});

// ===== WYLOGUJ =====
app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

// ===== START =====
app.listen(PORT, () => {
  console.log(`ZenCloud działa na ${BASE_URL}`);
});
