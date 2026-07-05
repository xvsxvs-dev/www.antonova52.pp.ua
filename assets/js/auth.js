let currentPhone = null;

// перевірка сесії
async function checkAuth() {
  const res = await fetch("/api/me");
  return await res.json();
}

// LOGIN MODAL
function showLoginModal() {
  if (document.getElementById("loginModal")) return;

  const container = document.getElementById("loginModalContainer");

  const modal = document.createElement("div");
  modal.id = "loginModal";

  modal.innerHTML = `
  <div class="auth-backdrop">
    <div class="auth-card">

      <h2>Вхід в систему</h2>
      <p id="authSubtitle">Введіть номер телефону</p>

      <div id="step1">
        <input id="phoneInput" placeholder="+380..." />
        <button onclick="sendCode()">Отримати код</button>
      </div>

      <div id="step2" style="display:none;">
        <input id="codeInput" placeholder="Код з Telegram" />
        <button onclick="verifyCode()">Увійти</button>
      </div>

      <p id="authMessage"></p>

    </div>
  </div>
  `;

  container.appendChild(modal);
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

async function initAuthProtection() {
  if (!auth.loggedIn) {
    content.classList.add("auth-locked");
    document.body.classList.add("auth-active"); // 🔥 FIX

    overlay.style.display = "block";

    showLoginModal();
  } else {
    content.classList.remove("auth-locked");
    document.body.classList.remove("auth-active"); // 🔥 FIX

    overlay.style.display = "none";
  }
}

// LOGOUT
async function logout() {
  await fetch("/api/logout");
  location.reload();
}

setInterval(initAuthProtection, 30000);