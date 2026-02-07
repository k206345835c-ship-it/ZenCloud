<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ZenCloud Hosting</title>

<style>
body {
    margin: 0;
    font-family: Arial, sans-serif;
    background: #0f172a;
    color: white;
}

header {
    background: #020617;
    padding: 20px;
    text-align: center;
    font-size: 26px;
    font-weight: bold;
    color: #38bdf8;
}

.container {
    text-align: center;
    padding: 60px 20px;
}

h1 {
    font-size: 40px;
    margin-bottom: 20px;
}

p {
    color: #94a3b8;
    font-size: 18px;
}

.buttons {
    margin-top: 40px;
}

.btn {
    padding: 14px 28px;
    margin: 10px;
    border-radius: 8px;
    border: none;
    font-size: 16px;
    cursor: pointer;
    transition: 0.3s;
}

.btn-login {
    background: #5865F2;
    color: white;
}

.btn-login:hover {
    background: #4752c4;
}

.btn-dashboard {
    background: #38bdf8;
    color: black;
}

.btn-dashboard:hover {
    background: #0ea5e9;
}

footer {
    margin-top: 80px;
    text-align: center;
    font-size: 14px;
    color: #64748b;
}
</style>

</head>
<body>

<header>
☁️ ZenCloud Hosting
</header>

<div class="container">

<h1>Hosting Botów Discord i Serwerów Minecraft</h1>

<p>
Twórz i zarządzaj swoimi usługami hostingowymi w jednym panelu.
</p>

<div class="buttons">

<button class="btn btn-login" onclick="loginDiscord()">
Zaloguj przez Discord
</button>

<button class="btn btn-dashboard" onclick="openDashboard()">
Dashboard
</button>

</div>

</div>

<footer>
© 2026 ZenCloud Hosting
</footer>

<script>
function loginDiscord() {
    window.location.href = "/api/login";
}

function openDashboard() {
    window.location.href = "/dashboard";
}
</script>

</body>
</html>
