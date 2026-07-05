export async function onRequest({ request, env }) {

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const body = await request.json().catch(() => null);

  if (!body?.phone || !body?.code) {
    return Response.json(
      { ok: false, error: "MISSING_DATA" },
      { status: 400, headers: corsHeaders }
    );
  }

  const phone = body.phone.replace(/\s/g, "");
  const code = body.code.replace(/\s/g, "");

  // 1. перевіряємо код
  const saved = await env.CODES.get(phone, "json");

  if (!saved) {
    return Response.json(
      { ok: false, error: "NO_CODE" },
      { status: 400, headers: corsHeaders }
    );
  }

  if (saved.code !== code) {
    return Response.json(
      { ok: false, error: "INVALID_CODE" },
      { status: 403, headers: corsHeaders }
    );
  }

  // 2. створюємо сесію
  const sessionId = crypto.randomUUID();

  await env.SESSIONS.put(sessionId, JSON.stringify({
    phone,
    created: Date.now()
  }), {
    expirationTtl: 60 * 60 * 24 * 3 // 3 дні
  });

  // 3. видаляємо код (одноразовий)
  await env.CODES.delete(phone);

  // 4. cookie
  const headers = new Headers(corsHeaders);

  headers.append(
    "Set-Cookie",
    `session=${sessionId}; Path=/; Max-Age=${60 * 60 * 24 * 3}; HttpOnly; SameSite=Lax`
  );

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers
  });
}