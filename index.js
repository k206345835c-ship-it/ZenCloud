const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// === Sesje ===
app.use(session({
  secret: 'zencloud-secret-key',
  resave: false,
  saveUninitialized: true
}));

// === Statyczne pliki frontend ===
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));

// === Strona główna ===
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// === Dashboard (tylko dla zalogowanych) ===
app.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// === API status ===
app.get('/api/status', (req, res) => {
  res.json({ status: 'ZenCloud działa prawidłowo!' });
});

// === Login Discord (symulacja dla testów) ===
app.get('/api/login', (req, res) => {
  // w praktyce tu podłączysz Discord OAuth2
  req.session.user = { username: 'DiscordUser' };
  res.redirect('/dashboard');
});

// === Wyloguj ===
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// === Start serwera ===
app.listen(PORT, () => {
  console.log(`ZenCloud działa na porcie ${PORT}`);
});
