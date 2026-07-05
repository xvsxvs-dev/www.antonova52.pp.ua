export async function onRequest() {
  return Response.json({
    ok: true,
    message: "API works 🚀"
  });
}