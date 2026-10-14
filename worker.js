const SECURITY_HEADERS = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": "camera=(self), microphone=(self), geolocation=(), payment=(), usb=(), serial=(), bluetooth=(), browsing-topics=()",
  "Content-Security-Policy": "default-src 'self'; script-src 'self' https://cdnjs.cloudflare.com https://cdnjs.buymeacoffee.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https://cdn.buymeacoffee.com https://img.buymeacoffee.com; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://api.github.com https://raw.githubusercontent.com https://0.peerjs.com wss://0.peerjs.com https://cdnjs.buymeacoffee.com https://cdn.buymeacoffee.com https://www.buymeacoffee.com; media-src 'self' blob:; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; manifest-src 'self'; upgrade-insecure-requests"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...SECURITY_HEADERS
    }
  });
}

function validEmail(value) {
  const email = String(value || "").trim();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function handleSubscribe(request, env) {
  if (request.method !== "POST") {
    return json({error:"Method not allowed."}, 405);
  }

  if (!env.BREVO_API_KEY) {
    return json({error:"Updates signup is not configured yet."}, 503);
  }

  const requestUrl = new URL(request.url);
  const origin = request.headers.get("Origin");
  if (origin && origin !== requestUrl.origin) {
    return json({error:"Request not allowed."}, 403);
  }

  const length = Number(request.headers.get("Content-Length") || 0);
  if (length > 4096) {
    return json({error:"Request too large."}, 413);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({error:"Invalid request."}, 400);
  }

  // Honeypot: bots filling hidden fields get a generic success without
  // generating confirmation mail.
  if (String(body?.company || "").trim()) {
    return json({ok:true});
  }

  const email = String(body?.email || "").trim().toLowerCase();
  if (!validEmail(email)) {
    return json({error:"Enter a valid email address."}, 400);
  }

  const brevoResponse = await fetch("https://api.brevo.com/v3/contacts/doubleOptinConfirmation", {
    method:"POST",
    headers:{
      "Accept":"application/json",
      "Content-Type":"application/json",
      "api-key":env.BREVO_API_KEY
    },
    body:JSON.stringify({
      email,
      includeListIds:[3],
      templateId:1,
      redirectionUrl:requestUrl.origin + "/?subscribed=1",
      contactPixelTrackingConsent:false
    })
  });

  if (brevoResponse.ok) {
    return json({ok:true});
  }

  let providerMessage = "";
  try {
    const problem = await brevoResponse.json();
    providerMessage = String(problem?.message || "");
  } catch {}

  console.error("Brevo signup failed", brevoResponse.status, providerMessage);

  const safeProviderMessage = providerMessage
    .replace(/[\r\n]+/g, " ")
    .replace(/api[- ]?key[^,.]*/ig, "API credential")
    .trim()
    .slice(0, 220);

  return json(
    {error:brevoResponse.status === 401 || brevoResponse.status === 403
      ? "Brevo rejected the API request. Check the API key and Brevo IP-security settings."
      : safeProviderMessage
        ? "Brevo: " + safeProviderMessage
        : "Could not send the confirmation email. Please try again."},
    502
  );
}

function addSecurityHeaders(response) {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(name, value);
  }

  if (response.headers.get("Content-Type")?.includes("text/html")) {
    headers.set("Cache-Control", "no-cache");
  }

  return new Response(response.body, {
    status:response.status,
    statusText:response.statusText,
    headers
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/subscribe") {
      return handleSubscribe(request, env);
    }

    const response = await env.ASSETS.fetch(request);
    return addSecurityHeaders(response);
  }
};
