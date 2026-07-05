export async function onRequest({ request, env }) {

  const cookie = request.headers.get("Cookie") || "";
  const sessionMatch = cookie.match(/session=([^;]+)/);

  if (!sessionMatch) {
    return Response.json({ loggedIn: false });
  }

  const sessionId = sessionMatch[1];

  const session = await env.SESSIONS.get(sessionId, "json");

  if (!session) {
    return Response.json({ loggedIn: false });
  }

  return Response.json({
    loggedIn: true,
    phone: session.phone
  });
}