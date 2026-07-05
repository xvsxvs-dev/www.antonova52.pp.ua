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
        <input type="tel" id="phoneInput" placeholder="+380..." maxlength="13"/>
        <button onclick="sendCode()">Отримати код</button>
      </div>

      <div id="step2" style="display:none;">
        <input id="codeInput" inputmode="numeric" placeholder="Код з Telegram" />
        <button onclick="verifyCode()">Увійти</button>
      </div>

      <div>
        <button id="cancelBtn" onclick="cancelLogin()">Не хочу</button>
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
    document.getElementById("step1").style.display = "none";
    document.getElementById("step2").style.display = "block";

    document.getElementById("authSubtitle").innerText =
      "Ми надіслали код у Telegram";

    document.getElementById("authMessage").innerText =
      "Введіть 6-значний код";
  } else {
    document.getElementById("authMessage").innerText =
      "Цей номер не має доступу";
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
    document.getElementById("authMessage").innerText =
      "Успішний вхід...";

    setTimeout(() => {
      // closeLogin();
      // initAuthProtection();
      closeLogin();
      location.reload();
    }, 500);
  } else {
    document.getElementById("authMessage").innerText =
      "Невірний код";
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

  if (window.location.pathname === "/statute" ||
    window.location.pathname === "/reports" ||
    window.location.pathname === "/protocols-board" ||
    window.location.pathname === "/protocols-general") {
    window.location.replace("/");
  } else {
    location.reload();
  }
}

// LOGOUT
async function cancelLogin() {
  closeLogin();
  
  if (window.location.pathname === "/statute" ||
    window.location.pathname === "/reports" ||
    window.location.pathname === "/protocols-board" ||
    window.location.pathname === "/protocols-general") {
    window.location.replace("/");
  }
}

async function updateAuthButton(protectedPage = false) {

    const auth = await checkAuth();

    const btn = document.getElementById("authButton");
    if (!btn) return;

    if (auth.loggedIn) {
        btn.innerHTML = '<a href="#" onclick="logout();return false;">Вихід</a>';
    } else {

        if (protectedPage) {
            btn.innerHTML = "";
        } else {
            btn.innerHTML = '<a href="#" onclick="showLoginModal();return false;">Вхід</a>';
        }

    }
}

setInterval(initAuthProtection, 30000);