const express = require("express");
const session = require("express-session");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: "zencloud-secret",
  resave: false,
  saveUninitialized: true
}));

// <<< TO JEST NAJWAŻNIEJSZE
app.use(express.static(path.join(__dirname, "public")));

// Strona główna
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("ZenCloud działa na porcie " + PORT));
