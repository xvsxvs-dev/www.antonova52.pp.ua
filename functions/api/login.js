export async function onRequest({ request, env }) {
  const body = await request.json().catch(() => null);

  if (!body?.phone) {
    return Response.json({ ok: false, error: "NO_PHONE" }, { status: 400 });
  }

  const phone = body.phone.replace(/\s/g, "");

  // 1. перевіряємо чи користувач дозволений
  const user = await env.USERS.get(phone, "json");

  if (!user || user.enabled !== true) {
    return Response.json({ ok: false, error: "NOT_ALLOWED" }, { status: 403 });
  }

  // 2. генеруємо код
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // 3. зберігаємо код на 5 хв
  await env.CODES.put(phone, JSON.stringify({
    code,
    created: Date.now()
  }), { expirationTtl: 300 });

  // 4. відправка в Telegram
  await sendTelegram(env, user.chatId, `Ваш код входу: ${code}`);

  return Response.json({ ok: true });
}


// helper
async function sendTelegram(env, chatId, text) {
  if (!chatId) return;

  await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text
    })
  });
}