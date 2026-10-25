const headers = {
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
};

function unavailablePage(): string {
  return `<!doctype html><html lang="sk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Stavuno</title></head><body><main><h1>Portál nie je dostupný</h1><p>Požiadajte majstra o nový QR kód.</p></main></body></html>`;
}

Deno.serve((request) => {
  if (request.method !== "GET")
    return new Response("Method not allowed", { status: 405 });

  const requestUrl = new URL(request.url);
  const publicUrl = Deno.env.get("WORKER_PORTAL_PUBLIC_URL");
  if (!publicUrl)
    return new Response(unavailablePage(), { status: 503, headers });

  try {
    const destination = new URL(publicUrl);
    const token = requestUrl.searchParams.get("token");
    if (token) destination.searchParams.set("token", token);
    return Response.redirect(destination, 302);
  } catch {
    return new Response(unavailablePage(), { status: 503, headers });
  }
});
