const SECURITY_HEADERS = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": "camera=(self), microphone=(self), geolocation=(), payment=(), usb=(), serial=(), bluetooth=(), browsing-topics=()",
  "Content-Security-Policy": "default-src 'self'; script-src 'self' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https://api.github.com https://raw.githubusercontent.com https://0.peerjs.com wss://0.peerjs.com; media-src 'self' blob:; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-src https://e92be93e.sibforms.com; frame-ancestors 'none'; manifest-src 'self'; upgrade-insecure-requests"
};

const OPR_TTS_URL = "https://army-forge.onepagerules.com/api/tts";
const OPR_COMMON_RULES_URL = "https://army-forge.onepagerules.com/api/rules/common";
const OPR_ARMY_BOOKS_URL = "https://army-forge.onepagerules.com/api/army-books";

const OPR_GAME_SYSTEM_IDS = {
  gf:2,
  gff:3,
  aof:4,
  aofs:5,
  aofr:6
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

  const gameSystem = String(army.gameSystem || "").toLowerCase();
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

    const response = await env.ASSETS.fetch(request);
    return addSecurityHeaders(response);
  }
};
