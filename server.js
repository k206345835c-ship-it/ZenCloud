require('dotenv').config()
const express = require('express')
const session = require('express-session')
const passport = require('passport')
const DiscordStrategy = require('passport-discord').Strategy
const fs = require('fs')
const path = require('path')
const { v4: uuidv4 } = require('uuid')

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())

// ===== JSON "BAZA"
const dbPath = path.join(__dirname, 'data.json')
if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ users: [], credits: {} }, null, 2))
}

function readDB() {
    return JSON.parse(fs.readFileSync(dbPath))
}

function writeDB(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
}

// ===== DISCORD LOGIN
passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((obj, done) => done(null, obj))

passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: process.env.DISCORD_CALLBACK_URL,
    scope: ['identify', 'email']
}, (accessToken, refreshToken, profile, done) => {
    const db = readDB()
    let user = db.users.find(u => u.id === profile.id)

    if (!user) {
        user = {
            id: profile.id,
            username: profile.username,
        }
        db.users.push(user)
        db.credits[profile.id] = 0
        writeDB(db)
    }

    return done(null, user)
}))

// ===== ROUTES
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'))
})

app.get('/auth/discord', passport.authenticate('discord'))
app.get('/auth/discord/callback',
    passport.authenticate('discord', { failureRedirect: '/' }),
    (req, res) => res.redirect('/')
)

app.get('/api/user', (req, res) => {
    if (!req.user) return res.json(null)
    const db = readDB()
    res.json({
        user: req.user,
        credits: db.credits[req.user.id] || 0
    })
})

// ===== DODAWANIE KREDYTÓW (ADMIN)
const ADMINS = ["1238570679465410571", "1458082666980179981"]

app.post('/api/add-credits', (req, res) => {
    if (!req.user || !ADMINS.includes(req.user.id))
        return res.status(403).send("Brak dostępu")

    const { userId, amount } = req.body
    const db = readDB()
    db.credits[userId] = (db.credits[userId] || 0) + Number(amount)
    writeDB(db)

    res.send("Dodano kredyty")
})

const PORT = 8080
app.listen(PORT, () => {
    console.log("ZenCloud działa na porcie " + PORT)
})
