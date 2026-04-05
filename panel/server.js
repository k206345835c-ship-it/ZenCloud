// server.js
const express = require("express");
const session = require("express-session");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 8080;

// === Ścieżki do plików danych ===
const DATA_DIR = path.join(__dirname, "data");
const DISCOUNTS = path.join(DATA_DIR, "discounts.json");

// === Middleware ===
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(session({
  secret: "supersecretkey",
  resave: false,
  saveUninitialized: true,
}));

// === Funkcje pomocnicze ===
function read(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const data = fs.readFileSync(filePath, "utf8");
  return JSON.parse(data || "[]");
}

function save(filePath, data) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function isAdmin(user) {
  // Przykładowa funkcja sprawdzająca admina
  return user && user.role === "admin";
}

// === Endpoints ===

// Strona główna
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// API zniżek
app.get("/api/discounts", (req, res) => {
  res.json(read(DISCOUNTS));
});

app.post("/api/discounts/add", (req, res) => {
  if (!isAdmin(req.session.user)) return res.sendStatus(403);
  const d = read(DISCOUNTS);
  d.push(req.body);
  save(DISCOUNTS, d);
  res.json({ ok: true });
});

app.post("/api/discounts/remove", (req, res) => {
  if (!isAdmin(req.session.user)) return res.sendStatus(403);
  let d = read(DISCOUNTS);
  d = d.filter(item => item.id !== req.body.id);
  save(DISCOUNTS, d);
  res.json({ ok: true });
});

// Przykładowy login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  // Tu wstaw własną logikę logowania
  if (username === "admin" && password === "admin") {
    req.session.user = { username, role: "admin" };
    return res.json({ ok: true });
  }
  res.status(401).json({ ok: false });
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

// === Start serwera ===
app.listen(PORT, () => {
  console.log(`ZenCloud działa na http://localhost:${PORT}`);
});
