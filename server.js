require('dotenv').config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;
const path = require("path");
const fs = require("fs");

const app = express();

// ====== PLIKI ======
const USERS_FILE = "./data/users.json";
const SERVERS_FILE = "./data/servers.json";
const DISCOUNTS_FILE = "./data/discounts.json";
const WALLET_FILE = "./data/wallet.json";

for (const file of [USERS_FILE, SERVERS_FILE, DISCOUNTS_FILE, WALLET_FILE]) {
  if (!fs.existsSync(file)) fs.writeFileSync(file, "[]");
}

// ====== MIDDLEWARE ======
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || "zencloud_secret",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, "public")));

// ====== PASSPORT DISCORD ======
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

const DOMAIN = process.env.DOMAIN || "http://localhost:8080";

passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: `${DOMAIN}/auth/discord/callback`,
    scope: ["identify", "email"]
  },
  (accessToken, refreshToken, profile, done) => done(null, profile)
));

// ====== FUNKCJE POMOCNICZE ======
function readJSON(file) { return JSON.parse(fs.readFileSync(file)); }
function writeJSON(file, data) { fs.writeFileSync(file, JSON.stringify(data, null, 2)); }

function isOwner(discordId) {
  // ID właścicieli panelu
  return ["1238570679465410571","1458082666980179981"].includes(discordId);
}

// ====== ROUTES ======

// --- REGISTER / LOGIN EMAIL ---
app.post("/api/register", (req,res)=>{
  const {email,password,username}=req.body;
  const users = readJSON(USERS_FILE);
  if(users.find(u=>u.email===email)) return res.json({error:"Email zajęty"});
  users.push({email,password,username});
  writeJSON(USERS_FILE,users);
  res.json({success:true});
});

app.post("/api/login", (req,res)=>{
  const {email,password}=req.body;
  const users = readJSON(USERS_FILE);
  const user = users.find(u=>u.email===email && u.password===password);
  if(!user) return res.json({error:"Błędne dane"});
  req.session.user = {email: user.email, username: user.username};
  res.json({success:true});
});

// --- DISCORD LOGIN ---
app.get("/auth/discord", passport.authenticate("discord"));
app.get("/auth/discord/callback",
  passport.authenticate("discord", { failureRedirect: "/" }),
  (req,res)=>{
    req.session.user = { discordId: req.user.id, username: req.user.username };
    res.redirect("/dashboard");
  }
);

// --- GET USER INFO ---
app.get("/api/user",(req,res)=>{
  res.json({user:req.session.user||null});
});

// --- OWNER DISCOUNTS ---
app.get("/api/discounts", (req,res)=>{
  if(!req.session.user || !isOwner(req.session.user.discordId)) return res.json([]);
  res.json(readJSON(DISCOUNTS_FILE));
});

app.post("/api/discounts", (req,res)=>{
  if(!req.session.user || !isOwner(req.session.user.discordId)) return res.status(403).json({error:"Brak dostępu"});
  const discounts = readJSON(DISCOUNTS_FILE);
  discounts.push(req.body);
  writeJSON(DISCOUNTS_FILE, discounts);
  res.json({success:true});
});

// --- WALLET ---
app.get("/api/wallet",(req,res)=>{
  if(!req.session.user) return res.json({balance:0});
  const wallets = readJSON(WALLET_FILE);
  const w = wallets.find(w=>w.discordId===req.session.user.discordId) || {balance:0};
  res.json(w);
});

app.post("/api/wallet",(req,res)=>{
  if(!req.session.user || !isOwner(req.session.user.discordId)) return res.status(403).json({error:"Brak dostępu"});
  const wallets = readJSON(WALLET_FILE);
  let w = wallets.find(w=>w.discordId===req.session.user.discordId);
  if(!w){ w={discordId:req.session.user.discordId,balance:0}; wallets.push(w);}
  w.balance=req.body.balance;
  writeJSON(WALLET_FILE,wallets);
  res.json({success:true});
});

// --- START SERVER ---
const PORT = process.env.PORT||8080;
app.listen(PORT,"0.0.0.0",()=>console.log(`ZenCloud działa na porcie ${PORT}`));
