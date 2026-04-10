function showTab(id) {
    document.querySelectorAll('.tab').forEach(t => t.style.display = 'none')
    document.getElementById(id).style.display = 'block'
}

async function loadUser() {
    const res = await fetch('/api/user')
    const data = await res.json()

    if (!data) return

    document.getElementById('loginBox').style.display = 'none'
    document.getElementById('panel').style.display = 'block'

    document.getElementById('userInfo').innerText = data.user.username
    document.getElementById('creditInfo').innerText = "Kredyty: " + data.credits
    document.getElementById('creditAmount').innerText = data.credits

    // ADMIN
    const admins = ["1238570679465410571", "1458082666980179981"]
    if (admins.includes(data.user.id)) {
        document.getElementById('adminTab').style.display = 'block'
    }
}

async function addCredits() {
    const uid = document.getElementById('uid').value
    const amount = document.getElementById('amount').value

    await fetch('/api/add-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uid, amount })
    })

    alert("Dodano kredyty")
}

loadUser()
