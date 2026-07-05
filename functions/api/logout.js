export async function onRequest({ request, env }) {

  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(/session=([^;]+)/);

  const headers = new Headers({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });

  if (!match) {
    return Response.json({ ok: true }, { headers });
  }

  const sessionId = match[1];

  // видаляємо сесію
  await env.SESSIONS.delete(sessionId);

  // очищаємо cookie
  headers.append(
    "Set-Cookie",
    "session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax"
  );

  return new Response(JSON.stringify({ ok: true }), {
    headers
  });
}