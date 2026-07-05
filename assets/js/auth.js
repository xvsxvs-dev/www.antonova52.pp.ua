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
    <div style="
      position:fixed;
      inset:0;
      background:rgba(0,0,0,0.6);
      display:flex;
      align-items:center;
      justify-content:center;
      z-index:9999;
    ">
      <div style="background:white;padding:20px;border-radius:10px;width:300px;">
        <h3>Login</h3>

        <input id="phoneInput" style="width:100%" />
        <button onclick="sendCode()" style="width:100%;margin-top:10px;">Send code</button>

        <div id="codeBox" style="display:none;margin-top:10px;">
          <input id="codeInput" style="width:100%" />
          <button onclick="verifyCode()" style="width:100%;margin-top:10px;">Verify</button>
        </div>
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