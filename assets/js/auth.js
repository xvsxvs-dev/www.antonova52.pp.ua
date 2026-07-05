let currentPhone = null;

// перевірка сесії
async function checkAuth() {
  const res = await fetch("/api/me");
  return await res.json();
}

// LOGIN MODAL
function showLoginModal() {
  const modal = document.createElement("div");
  modal.id = "loginModal";
  modal.innerHTML = `
    <div style="position:fixed;top:0;left:0;right:0;bottom:0;
      background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;">

      <div style="background:#fff;padding:20px;border-radius:10px;width:300px;">
        <h3>Вхід</h3>

        <input id="phoneInput" placeholder="+380..." style="width:100%;padding:8px;" />
        <button onclick="sendCode()" style="margin-top:10px;width:100%;">Отримати код</button>

        <div id="codeBox" style="display:none;margin-top:15px;">
          <input id="codeInput" placeholder="Код" style="width:100%;padding:8px;" />
          <button onclick="verifyCode()" style="margin-top:10px;width:100%;">Увійти</button>
        </div>

        <button onclick="closeLogin()" style="margin-top:10px;">Закрити</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

// CLOSE MODAL
function closeLogin() {
  document.getElementById("loginModal")?.remove();
}

// SEND CODE
async function sendCode() {
  const phone = document.getElementById("phoneInput").value;
  currentPhone = phone;

  const res = await fetch("/api/login", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ phone })
  });

  const data = await res.json();

  if (data.ok) {
    document.getElementById("codeBox").style.display = "block";
    alert("Код відправлено в Telegram");
  } else {
    alert("Доступ заборонено");
  }
}

// VERIFY CODE
async function verifyCode() {
  const code = document.getElementById("codeInput").value;

  const res = await fetch("/api/verify", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      phone: currentPhone,
      code
    })
  });

  const data = await res.json();

  if (data.ok) {
    location.reload();
  } else {
    alert("Невірний код");
  }
}

// LOGOUT
async function logout() {
  await fetch("/api/logout");
  location.reload();
}