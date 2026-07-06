const Auth = {
  loggedIn: false,
  protectedPage: false,
  content: null,
  overlay: null,
  phone: null
};

// session verification
async function checkAuth() {
  const res = await fetch("/api/me");
  const data = await res.json();

  Auth.loggedIn = data.loggedIn;
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
  Auth.phone = phone;

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
  const code = document.getElementById("codeInput").value.trim();

  const res = await fetch("/api/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      phone: Auth.phone,
      code
    })
  });

  const data = await res.json();

  if (!data.ok) {
    document.getElementById("authMessage").innerText = "Невірний код";
    return;
  }

  document.getElementById("authMessage").innerText = "Успішний вхід...";

  setTimeout(async () => {
    // close modal window
    closeLogin();

    // update Auth state
    await checkAuth();

    // update UI
    refreshUI();
  }, 500);
}

// LOGOUT
async function logout() {
  await fetch("/api/logout");

  await checkAuth();

  refreshUI();
}

// cancel login
async function cancelLogin() {
  closeLogin();
  
  const redirectPattern = /^\/(statute|reports|protocols-board|protocols-general)(\.html|\/|$)/;

  if (redirectPattern.test(window.location.pathname)) {
    window.location.replace("/");
  }
}

async function initProtectedPage(contentId, overlayId) {
  Auth.protectedPage = true;
  Auth.content = document.getElementById(contentId);
  Auth.overlay = document.getElementById(overlayId);

  await checkAuth();

  refreshUI();
}

async function initPublicPage() {
  Auth.protectedPage = false;

  await checkAuth();

  refreshUI();
}

function refreshUI() {
  updateButton();

  if (!Auth.protectedPage)
    return;

  if (Auth.loggedIn) {
    Auth.content.classList.remove("auth-locked");
    Auth.overlay.style.display = "none";

    closeLogin();
  }
  else {
    Auth.content.classList.add("auth-locked");
    Auth.overlay.style.display = "block";

    showLoginModal();
  }
}

function updateButton() {
  const btn = document.getElementById("authButton");

  if (!btn)
    return;

  if (Auth.loggedIn) {
    btn.innerHTML = '<a href="#" onclick="logout();return false;">Вихід</a>';
  }
  else {
    if (Auth.protectedPage) {
      btn.innerHTML = "";
    }
    else {
      btn.innerHTML = '<a href="#" onclick="showLoginModal();return false;">Вхід</a>';
    }
  }
}