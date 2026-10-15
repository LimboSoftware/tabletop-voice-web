const SECURITY_HEADERS = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": "camera=(self), microphone=(self), geolocation=(), payment=(), usb=(), serial=(), bluetooth=(), browsing-topics=()",
  "Content-Security-Policy": "default-src 'self'; script-src 'self' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https://api.github.com https://raw.githubusercontent.com https://0.peerjs.com wss://0.peerjs.com; media-src 'self' blob:; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-src https://e92be93e.sibforms.com; frame-ancestors 'none'; manifest-src 'self'; upgrade-insecure-requests"
};

const APP_GAME_ROUTES = new Map([
  ["/40k","/40k"],
  ["/aos","/aos"],
  ["/horus-heresy","/horus-heresy"],
  ["/heresy","/horus-heresy"],
  ["/kill-team","/kill-team"],
  ["/necromunda","/necromunda"],
  ["/legions-imperialis","/legions-imperialis"],
  ["/grimdark-future","/grimdark-future"],
  ["/grimdark","/grimdark-future"],
  ["/grimdark-firefight","/grimdark-firefight"],
  ["/gff","/grimdark-firefight"],
  ["/grimdark-star-quest","/grimdark-star-quest"],
  ["/star-quest","/grimdark-star-quest"],
  ["/warfleets","/warfleets"],
  ["/opr-warfleets","/warfleets"],
  ["/age-of-fantasy","/age-of-fantasy"],
  ["/aof","/age-of-fantasy"],
  ["/age-of-fantasy-skirmish","/age-of-fantasy-skirmish"],
  ["/aof-skirmish","/age-of-fantasy-skirmish"],
  ["/age-of-fantasy-regiments","/age-of-fantasy-regiments"],
  ["/aof-regiments","/age-of-fantasy-regiments"],
  ["/age-of-fantasy-quest","/age-of-fantasy-quest"],
  ["/aof-quest","/age-of-fantasy-quest"]
]);

function normalizedAppRoute(pathname = "/") {
  if (pathname === "/") return "/";
  return String(pathname || "/").replace(/\/+$/, "") || "/";
}

const OPR_TTS_URL = "https://army-forge.onepagerules.com/api/tts";
const OPR_COMMON_RULES_URL = "https://army-forge.onepagerules.com/api/rules/common";
const OPR_ARMY_BOOKS_URL = "https://army-forge.onepagerules.com/api/army-books";

const OPR_GAME_SYSTEM_IDS = {
  gf:2,
  "2":2,
  "grimdark-future":2,
  gff:3,
  "3":3,
  "grimdark-future-firefight":3,
  aof:4,
  "4":4,
  "age-of-fantasy":4,
  aofs:5,
  "5":5,
  "age-of-fantasy-skirmish":5,
  aofr:6,
  "6":6,
  "age-of-fantasy-regiments":6,
  aofq:7,
  "7":7,
  "age-of-fantasy-quest":7,
  aofqai:8,
  "8":8,
  "age-of-fantasy-quest-ai":8,
  gfsq:9,
  "9":9,
  "grimdark-future-star-quest":9,
  gfsqai:10,
  "10":10,
  "grimdark-future-star-quest-ai":10
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers:{
      "Content-Type":"application/json; charset=utf-8",
      "Cache-Control":"no-store",
      ...SECURITY_HEADERS
    }
  });
}

async function fetchOptionalJson(url) {
  try {
    const response = await fetch(url, {
      headers:{"Accept":"application/json"}
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Optional upstream request failed", url, error);
    return null;
  }
}

async function loadOprArmy(id) {
  if (!/^[A-Za-z0-9_-]+$/.test(id)) {
    return jsonResponse({error:"Invalid Army Forge share id."}, 400);
  }

  let response;
  try {
    response = await fetch(OPR_TTS_URL + "?id=" + encodeURIComponent(id), {
      headers:{"Accept":"application/json"}
    });
  } catch (error) {
    console.error("Army Forge request failed", error);
    return jsonResponse({error:"Could not reach Army Forge."}, 502);
  }

  if (!response.ok) {
    return jsonResponse({
      error:response.status === 404
        ? "Army Forge could not find that shared list. Make sure you used Share as Link."
        : "Army Forge returned " + response.status + "."
    }, 502);
  }

  let army;
  try {
    army = await response.json();
  } catch {
    return jsonResponse({error:"Army Forge returned an unreadable list."}, 502);
  }

  if (!army || !Array.isArray(army.units)) {
    return jsonResponse({error:"Army Forge returned an incomplete list."}, 502);
  }

  const gameSystem = String(
    army.gameSystem ||
    army.gameSystemKey ||
    army.gameSystemSlug ||
    army.gameSystemId ||
    ""
  ).toLowerCase();
  const gameSystemId = OPR_GAME_SYSTEM_IDS[gameSystem];

  let commonRules = [];
  if (gameSystemId) {
    const common = await fetchOptionalJson(OPR_COMMON_RULES_URL + "/" + gameSystemId);
    if (Array.isArray(common?.rules)) commonRules = common.rules;
  }

  const existingRules = Array.isArray(army.specialRules) ? army.specialRules : [];
  const seenRuleIds = new Set(existingRules.map(rule => String(rule?.id || "")).filter(Boolean));
  const specialRules = [...existingRules];

  for (const rule of commonRules) {
    const idValue = String(rule?.id || "");
    if (!idValue || seenRuleIds.has(idValue)) continue;
    seenRuleIds.add(idValue);
    specialRules.push(rule);
  }

  const armyIds = [...new Set(
    army.units.map(unit => String(unit?.armyId || "")).filter(Boolean)
  )];

  const books = gameSystemId
    ? await Promise.all(armyIds.map(armyId =>
        fetchOptionalJson(
          OPR_ARMY_BOOKS_URL + "/" + encodeURIComponent(armyId) +
          "?gameSystem=" + gameSystemId
        )
      ))
    : [];

  const armyNames = [];
  const spells = [];
  const seenSpell = new Set();

  for (const book of books.filter(Boolean)) {
    if (book?.name && !armyNames.includes(String(book.name))) {
      armyNames.push(String(book.name));
    }

    for (const spell of book?.spells || []) {
      const key = String(spell?.id || spell?.name || "");
      if (!key || seenSpell.has(key)) continue;
      seenSpell.add(key);
      spells.push({
        id:spell.id,
        name:spell.name,
        threshold:spell.threshold,
        effect:spell.effect
      });
    }
  }

  return jsonResponse({
    ...army,
    specialRules,
    armyNames,
    spells
  });
}


function validGyrinxGangUrl(value = "") {
  let url;
  try {
    url = new URL(String(value || "").trim());
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase();
  if (!["gyrinx.app","www.gyrinx.app"].includes(host)) return null;
  if (url.protocol !== "https:") return null;

  // Current Necromunda N26 share pages. Keep this deliberately narrow:
  // this endpoint is a proxy, not a general-purpose URL fetcher.
  if (!/^\/n26\/gangs\/[A-Za-z0-9_-]+\/?$/.test(url.pathname)) return null;

  url.search = "";
  url.hash = "";
  return url;
}

async function fetchGyrinxGangPage(rawUrl) {
  let target = validGyrinxGangUrl(rawUrl);
  if (!target) {
    return jsonResponse({
      error:"Paste a public Gyrinx N26 gang link, e.g. https://gyrinx.app/n26/gangs/…/"
    }, 400);
  }

  let response;
  for (let redirects = 0; redirects < 3; redirects++) {
    try {
      response = await fetch(target.toString(), {
        redirect:"manual",
        headers:{
          "Accept":"text/html,application/xhtml+xml",
          "User-Agent":"TabletopVoice/1.0 (+https://tabletopvoice.app)"
        }
      });
    } catch (error) {
      console.error("Gyrinx request failed", error);
      return jsonResponse({error:"Could not reach Gyrinx."}, 502);
    }

    if (![301,302,303,307,308].includes(response.status)) break;

    const location = response.headers.get("Location");
    if (!location) break;
    const redirected = new URL(location, target);
    target = validGyrinxGangUrl(redirected.toString());
    if (!target) {
      return jsonResponse({error:"Gyrinx redirected outside the supported gang page."}, 502);
    }
  }

  if (!response?.ok) {
    return jsonResponse({
      error:response?.status === 404
        ? "Gyrinx could not find that public gang."
        : "Gyrinx returned " + (response?.status || "an error") + "."
    }, 502);
  }

  const contentType = String(response.headers.get("Content-Type") || "");
  if (!contentType.includes("text/html")) {
    return jsonResponse({error:"Gyrinx returned an unexpected response."}, 502);
  }

  const html = await response.text();
  if (!html || html.length > 2_000_000) {
    return jsonResponse({error:"The Gyrinx gang page was empty or too large to import."}, 502);
  }

  if (!html.includes("n26-gang-sheet") && !html.includes("model-")) {
    return jsonResponse({
      error:"That Gyrinx page did not contain a readable N26 gang sheet. Make sure the gang is public."
    }, 422);
  }

  return jsonResponse({
    url:target.toString(),
    html
  });
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

    if (url.pathname === "/api/opr-army") {
      if (request.method !== "GET") {
        return jsonResponse({error:"Method not allowed."}, 405);
      }
      return loadOprArmy(String(url.searchParams.get("id") || "").trim());
    }

    if (url.pathname === "/api/gyrinx-gang") {
      if (request.method !== "GET") {
        return jsonResponse({error:"Method not allowed."}, 405);
      }
      return fetchGyrinxGangPage(String(url.searchParams.get("url") || "").trim());
    }

    if (request.method === "GET" || request.method === "HEAD") {
      const route = normalizedAppRoute(url.pathname);
      const canonical = APP_GAME_ROUTES.get(route);

      if (canonical) {
        if (route !== canonical || url.pathname !== route) {
          const destination = new URL(request.url);
          destination.pathname = canonical;
          return addSecurityHeaders(Response.redirect(destination.toString(), 308));
        }

        const shellUrl = new URL("/index.html", url);
        const shellRequest = new Request(shellUrl.toString(), {
          method:request.method,
          headers:request.headers
        });
        const shell = await env.ASSETS.fetch(shellRequest);
        return addSecurityHeaders(shell);
      }
    }

    const response = await env.ASSETS.fetch(request);
    return addSecurityHeaders(response);
  }
};
