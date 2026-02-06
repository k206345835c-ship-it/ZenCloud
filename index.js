const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serwowanie statycznego frontendu
app.use(express.static(__dirname));

// Endpoint API dla statusu
app.get('/api/status', (req, res) => {
  res.json({ status: 'ZenCloud działa prawidłowo!' });
});

// Wszystkie inne żądania kierujemy na index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`ZenCloud działa na porcie ${PORT}`);
});
