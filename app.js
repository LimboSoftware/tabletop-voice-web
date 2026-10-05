const state = {
  rosters: [],
  activeRoster: 0,
  selected: null,
  mode: localStorage.getItem("tv_mode") || "mobile",
  listening: false,
  recognition: null
};

const $ = (id) => document.getElementById(id);
const els = {
  welcome: $("welcome"),
  workspace: $("workspace"),
  voiceDock: $("voiceDock"),
  fileInput: $("fileInput"),
  importButton: $("importButton"),
  welcomeImport: $("welcomeImport"),
  loadDemo: $("loadDemo"),
  fullDataButton: $("fullDataButton"),
  fullDataWelcome: $("fullDataWelcome"),
  clearRoster: $("clearRoster"),
  searchInput: $("searchInput"),
  resultList: $("resultList"),
  rosterTabs: $("rosterTabs"),
  rosterTitle: $("rosterTitle"),
  emptyDetail: $("emptyDetail"),
  detailCard: $("detailCard"),
  detailType: $("detailType"),
  detailName: $("detailName"),
  detailStats: $("detailStats"),
  detailSections: $("detailSections"),
  talkButton: $("talkButton"),
  voiceStatus: $("voiceStatus"),
  voiceHint: $("voiceHint"),
  modeToggle: $("modeToggle"),
  pinButton: $("pinButton"),
  toast: $("toast")
};

function boot() {
  applyMode();
  restore();
  bindEvents();
  setupSpeech();
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js").catch(() => {});
}

function bindEvents() {
  els.importButton.addEventListener("click", () => els.fileInput.click());
  els.welcomeImport.addEventListener("click", () => els.fileInput.click());
  els.fileInput.addEventListener("change", handleFiles);
  els.loadDemo.addEventListener("click", loadDemo);
  els.fullDataButton?.addEventListener("click", loadFull40kData);
  els.fullDataWelcome?.addEventListener("click", loadFull40kData);
  els.clearRoster.addEventListener("click", clearRosters);
  els.searchInput.addEventListener("input", () => renderResults(els.searchInput.value));
  els.modeToggle.addEventListener("click", toggleMode);
  els.pinButton.addEventListener("click", () => toast("Pinned items are coming during beta."));
  ["pointerdown", "touchstart"].forEach(evt => els.talkButton.addEventListener(evt, startListening, {passive:false}));
  ["pointerup", "pointercancel", "pointerleave", "touchend"].forEach(evt => els.talkButton.addEventListener(evt, stopListening, {passive:false}));
}

async function handleFiles(event) {
  const files = [...event.target.files];
  if (!files.length) return;
  for (const file of files) {
    try {
      const text = await file.text();
      const roster = parseRosterFile(text, file.name);
      state.rosters.push(roster);
      state.activeRoster = state.rosters.length - 1;
      persist();
      showApp();
      renderAll();
      toast(`Imported ${roster.name}`);
    } catch (err) {
      console.error(err);
      toast(`Could not import ${file.name}`);
    }
  }
  els.fileInput.value = "";
}

function parseRosterFile(text, fileName) {
  let raw;
  try { raw = JSON.parse(text); }
  catch { throw new Error("New Recruit JSON export expected."); }

  if (!raw?.roster) {
    throw new Error("This does not look like a New Recruit roster JSON export.");
  }

  const root = raw.roster;
  const units = [];
  for (const force of root.forces || []) {
    for (const selection of force.selections || []) {
      const unit = parseNewRecruitSelection(selection);
      if (unit) units.push(unit);
    }
  }

  if (!units.length) throw new Error("No units were found in this New Recruit roster.");

  const pts = (root.costs || []).find(c => String(c.name).toLowerCase() === "pts")?.value;
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
    name: root.name || fileName.replace(/\.[^.]+$/, ""),
    faction: (root.forces || [])[0]?.catalogueName || (root.forces || [])[0]?.name || "New Recruit roster",
    source: "new-recruit",
    points: pts ?? null,
    units: dedupeBy(units, u => u.id || u.name),
    importedAt: Date.now()
  };
}

function parseNewRecruitSelection(selection) {
  const allProfiles = collectProfiles(selection);
  const unitProfiles = allProfiles.filter(p => p?.typeName === "Unit");
  if (!unitProfiles.length) return null;

  const primaryUnitProfile =
    unitProfiles.find(p => normalize(p.name) === normalize(selection.name)) ||
    unitProfiles[0];

  const weapons = allProfiles
    .filter(p => p?.typeName === "Ranged Weapons" || p?.typeName === "Melee Weapons")
    .map(profileToDisplay);

  const abilityProfiles = allProfiles
    .filter(p => p?.typeName === "Abilities")
    .map(p => ({
      name: p.name || "Ability",
      text: characteristicValue((p.characteristics || [])[0])
    }));

  const rules = collectRules(selection);
  const abilities = dedupeBy([...abilityProfiles, ...rules], r => normalize(r.name + "|" + r.text));

  const stats = (primaryUnitProfile.characteristics || []).map(c => ({
    label: c.name || "",
    value: characteristicValue(c)
  })).filter(x => x.label && x.value !== "");

  const pts = (selection.costs || []).find(c => String(c.name).toLowerCase() === "pts")?.value;
  if (pts != null) stats.push({label:"Pts", value:String(pts)});

  const name = selection.name || primaryUnitProfile.name || "Unit";
  return {
    id: selection.id || primaryUnitProfile.id || name,
    name,
    type: "Unit",
    stats,
    rules: abilities,
    profiles: dedupeBy(weapons, p => normalize(p.name + "|" + JSON.stringify(p.values))),
    searchText: normalize([
      name,
      primaryUnitProfile.name,
      weapons.map(w => w.name),
      abilities.map(a => a.name)
    ].flat().join(" "))
  };
}

function collectProfiles(node) {
  const found = [];
  function walk(value) {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }
    if (Array.isArray(value.profiles)) {
      value.profiles.forEach(p => {
        if (p && typeof p === "object") found.push(p);
      });
    }
    if (Array.isArray(value.selections)) value.selections.forEach(walk);
  }
  walk(node);
  return found;
}

function collectRules(node) {
  const found = [];
  function walk(value) {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }
    for (const rule of value.rules || []) {
      if (!rule || rule.hidden) continue;
      found.push({name: rule.name || "Rule", text: rule.description || ""});
    }
    if (Array.isArray(value.selections)) value.selections.forEach(walk);
  }
  walk(node);
  return dedupeBy(found, r => normalize(r.name + "|" + r.text));
}

function characteristicValue(characteristic) {
  if (!characteristic || typeof characteristic !== "object") return "";
  const value = characteristic.$text ?? characteristic.value ?? characteristic.characteristic ?? "";
  return value == null ? "" : String(value);
}

function profileToDisplay(profile) {
  return {
    name: profile.name || "Profile",
    type: profile.typeName || "",
    values: (profile.characteristics || []).map(c => ({
      label: c.name || "",
      value: characteristicValue(c)
    })).filter(x => x.label)
  };
}

const BSDATA_REPO = "BSData/wh40k-11e";
const BSDATA_BRANCH = "main";
const BSDATA_API = "https://api.github.com/repos/" + BSDATA_REPO + "/contents?ref=" + BSDATA_BRANCH;
const BSDATA_RAW = "https://raw.githubusercontent.com/" + BSDATA_REPO + "/refs/heads/" + BSDATA_BRANCH + "/";

async function loadFull40kData() {
  if (state.fullDataLoading) return;
  state.fullDataLoading = true;
  setFullDataButtons(true, "Loading 40K…");
  toast("Fetching current 40K data from BSData…");

  try {
    const listingResponse = await fetch(BSDATA_API, {headers:{"Accept":"application/vnd.github+json"}});
    if (!listingResponse.ok) throw new Error("Could not read the BSData file list.");
    const listing = await listingResponse.json();

    const files = listing
      .filter(item => item.type === "file" && item.name.endsWith(".json"))
      .filter(item => !item.name.startsWith("Library - Astartes Heresy Legends"))
      .map(item => item.name);

    const documents = [];
    const concurrency = 6;
    let cursor = 0;

    async function worker() {
      while (cursor < files.length) {
        const index = cursor++;
        const name = files[index];
        setFullDataButtons(true, "Loading " + (index + 1) + "/" + files.length);
        const url = BSDATA_RAW + encodeURIComponent(name).replace(/%2F/g, "/");
        const response = await fetch(url);
        if (!response.ok) continue;
        try {
          documents.push({name, data: await response.json()});
        } catch (error) {
          console.warn("Skipped invalid BSData JSON", name, error);
        }
      }
    }

    await Promise.all(Array.from({length:concurrency}, worker));
    const roster = buildFull40kRoster(documents);

    if (!roster.units.length) throw new Error("The BSData files downloaded but no unit entries could be resolved.");

    const oldIndex = state.rosters.findIndex(r => r.id === "bsdata-full-40k");
    if (oldIndex >= 0) state.rosters.splice(oldIndex, 1);

    state.rosters.push(roster);
    state.activeRoster = state.rosters.length - 1;
    state.selected = null;
    els.searchInput.value = "";
    persist();
    renderAll();
    renderDetail(null);
    toast("Loaded " + roster.units.length + " 40K unit entries");
  } catch (error) {
    console.error(error);
    toast(error.message || "Could not load full 40K data.");
  } finally {
    state.fullDataLoading = false;
    setFullDataButtons(false, "Load full 40K data");
  }
}

function setFullDataButtons(disabled, label) {
  [els.fullDataButton, els.fullDataWelcome].filter(Boolean).forEach(button => {
    button.disabled = disabled;
    button.textContent = label;
  });
}

function buildFull40kRoster(documents) {
  const idMap = new Map();
  const links = [];

  function indexNode(node, sourceName) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach(item => indexNode(item, sourceName));
      return;
    }

    if (node.id) {
      if (!idMap.has(node.id)) idMap.set(node.id, {node, sourceName});
    }

    if (Array.isArray(node.entryLinks)) {
      for (const link of node.entryLinks) {
        if (link?.type === "selectionEntry" && link?.targetId && link?.name) {
          links.push({link, sourceName});
        }
      }
    }

    for (const [key, value] of Object.entries(node)) {
      if (key === "entryLinks") continue;
      if (value && typeof value === "object") indexNode(value, sourceName);
    }
  }

  documents.forEach(doc => indexNode(doc.data, doc.name));

  const units = [];
  for (const {link, sourceName} of links) {
    if (shouldSkipCatalogueEntry(link.name)) continue;
    const resolved = idMap.get(link.targetId)?.node;
    if (!resolved) {
      units.push({
        id:"bsdata-link-" + link.id,
        name:link.name,
        type:"Reference",
        stats:costStats(link),
        rules:[],
        profiles:[],
        searchText:normalize(link.name + " " + sourceName)
      });
      continue;
    }

    const unit = parseBSDataUnit(resolved, link.name, sourceName, link);
    if (unit) units.push(unit);
  }

  const bestByName = new Map();
  for (const unit of units) {
    const key = normalize(unit.name);
    const existing = bestByName.get(key);
    const quality = unit.stats.length * 3 + unit.profiles.length * 2 + unit.rules.length;
    const oldQuality = existing ? existing.stats.length * 3 + existing.profiles.length * 2 + existing.rules.length : -1;
    if (!existing || quality > oldQuality) bestByName.set(key, unit);
  }

  return {
    id:"bsdata-full-40k",
    name:"Full 40K Data",
    faction:"BSData / Warhammer 40,000 11th Edition",
    source:"bsdata",
    importedAt:Date.now(),
    units:[...bestByName.values()].sort((a,b) => a.name.localeCompare(b.name))
  };
}

function parseBSDataUnit(node, displayName, sourceName, link) {
  const profiles = [];
  const rules = [];

  function walk(value) {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }

    if (value.typeName && Array.isArray(value.characteristics)) profiles.push(value);

    for (const rule of value.rules || []) {
      if (!rule || rule.hidden) continue;
      rules.push({name:rule.name || "Rule", text:rule.description || ""});
    }

    for (const child of Object.values(value)) {
      if (child && typeof child === "object") walk(child);
    }
  }
  walk(node);

  const unitProfile =
    profiles.find(p => p.typeName === "Unit" && normalize(p.name) === normalize(displayName)) ||
    profiles.find(p => p.typeName === "Unit");

  const stats = unitProfile
    ? (unitProfile.characteristics || []).map(c => ({label:c.name || "", value:characteristicValue(c)})).filter(x => x.label)
    : costStats(node).length ? costStats(node) : costStats(link);

  const weaponProfiles = profiles
    .filter(p => p.typeName === "Ranged Weapons" || p.typeName === "Melee Weapons")
    .map(profileToDisplay);

  const abilityProfiles = profiles
    .filter(p => p.typeName === "Abilities")
    .map(p => ({name:p.name || "Ability", text:characteristicValue((p.characteristics || [])[0])}));

  const allRules = dedupeBy([...abilityProfiles, ...rules], r => normalize(r.name + "|" + r.text));

  return {
    id:"bsdata-" + (node.id || link.id || normalize(displayName)),
    name:displayName || unitProfile?.name || node.name || "Unit",
    type:"Unit",
    source:sourceName,
    stats,
    profiles:dedupeBy(weaponProfiles, p => normalize(p.name + "|" + JSON.stringify(p.values))),
    rules:allRules,
    searchText:normalize([
      displayName,
      node.name,
      sourceName.replace(/\.json$/,""),
      weaponProfiles.map(w => w.name),
      allRules.map(r => r.name)
    ].flat().join(" "))
  };
}

function costStats(node) {
  const costs = node?.costs || [];
  return costs
    .filter(c => c?.name && c?.value != null)
    .map(c => ({label:c.name, value:String(c.value)}));
}

function shouldSkipCatalogueEntry(name) {
  return /^(detachment|battle size|force disposition|show\/hide options|battle focus|army roster)$/i.test(String(name).trim());
}

function pickString(obj, keys) {
  for (const key of keys) {
    const value = obj?.[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return "";
}

function dedupeBy(list, fn) {
  const seen = new Set();
  return list.filter(item => {
    const key = fn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalize(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function showApp() {
  els.welcome.classList.add("hidden");
  els.workspace.classList.remove("hidden");
  els.voiceDock.classList.remove("hidden");
}

function hideApp() {
  els.welcome.classList.remove("hidden");
  els.workspace.classList.add("hidden");
  els.voiceDock.classList.add("hidden");
}

function renderAll() {
  if (!state.rosters.length) return hideApp();
  showApp();
  renderTabs();
  const roster = state.rosters[state.activeRoster];
  els.rosterTitle.textContent = roster.name;
  renderResults(els.searchInput.value);
}

function renderTabs() {
  els.rosterTabs.innerHTML = "";
  state.rosters.forEach((roster, index) => {
    const button = document.createElement("button");
    button.className = "roster-tab" + (index === state.activeRoster ? " active" : "");
    button.textContent = roster.name;
    button.addEventListener("click", () => {
      state.activeRoster = index;
      state.selected = null;
      els.searchInput.value = "";
      renderAll();
      renderDetail(null);
      persist();
    });
    els.rosterTabs.appendChild(button);
  });
}

function renderResults(query = "") {
  const roster = state.rosters[state.activeRoster];
  if (!roster) return;
  const q = normalize(query);
  let units = roster.units;
  if (q) {
    units = units
      .map(unit => ({unit, score: scoreMatch(unit, q)}))
      .filter(x => x.score > 0)
      .sort((a,b) => b.score - a.score)
      .map(x => x.unit);
  }
  els.resultList.innerHTML = "";
  units.slice(0, 80).forEach(unit => {
    const button = document.createElement("button");
    button.className = "result-item" + (state.selected?.id === unit.id ? " active" : "");
    button.innerHTML = `<strong>${escapeHtml(unit.name)}</strong><small>${escapeHtml(unit.type || "Unit")}</small>`;
    button.addEventListener("click", () => selectUnit(unit));
    els.resultList.appendChild(button);
  });
  if (!units.length) els.resultList.innerHTML = '<div class="result-item"><small>No matching roster entries.</small></div>';
}

function scoreMatch(unit, q) {
  const name = normalize(unit.name);
  if (name === q) return 100;
  if (name.startsWith(q)) return 80;
  if (name.includes(q)) return 65;
  const words = q.split(" ");
  const hits = words.filter(w => unit.searchText.includes(w)).length;
  return hits ? 20 + hits * 10 : 0;
}

function selectUnit(unit) {
  state.selected = unit;
  renderResults(els.searchInput.value);
  renderDetail(unit);
}

function renderDetail(unit) {
  if (!unit) {
    els.emptyDetail.classList.remove("hidden");
    els.detailCard.classList.add("hidden");
    return;
  }

  els.emptyDetail.classList.add("hidden");
  els.detailCard.classList.remove("hidden");
  els.detailType.textContent = (unit.type || "Unit").toUpperCase();
  els.detailName.textContent = unit.name;

  els.detailStats.innerHTML = unit.stats.length
    ? unit.stats.map(stat => `
        <div class="stat">
          <span>${escapeHtml(stat.label)}</span>
          <strong>${escapeHtml(stat.value)}</strong>
        </div>`).join("")
    : '<div class="stat"><span>PROFILE</span><strong>Imported</strong></div>';

  const sections = [];

  if (unit.profiles?.length) {
    sections.push(renderWeaponSection(unit.profiles));
  }

  if (unit.rules?.length) {
    sections.push(renderAbilitySection(unit.rules));
  }

  els.detailSections.innerHTML = sections.join("") ||
    '<section class="detail-section"><div class="empty-section">No additional profiles were found in this entry.</div></section>';
}

function renderWeaponSection(profiles) {
  const columns = ["Range", "A", "BS/WS", "S", "AP", "D", "Keywords"];

  const rows = profiles.map(profile => {
    const values = new Map(
      (profile.values || []).map(item => [String(item.label || "").toLowerCase(), item.value ?? ""])
    );

    const get = label => {
      const direct = values.get(label.toLowerCase());
      return direct !== undefined && direct !== "" ? direct : "—";
    };

    const skill = get("BS") !== "—" ? get("BS") : get("WS");

    return {
      name: profile.name || "Weapon",
      type: profile.type || "",
      values: [
        get("Range"),
        get("A"),
        skill,
        get("S"),
        get("AP"),
        get("D"),
        get("Keywords")
      ]
    };
  });

  return `
    <section class="detail-section weapon-section">
      <div class="section-heading-row">
        <h3>Weapons</h3>
        <span class="section-count">${rows.length}</span>
      </div>
      <div class="weapon-table-wrap">
        <table class="weapon-table">
          <thead>
            <tr>
              <th class="weapon-name-column">Weapon</th>
              ${columns.map(column => `<th>${escapeHtml(column)}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${rows.map(row => `
              <tr>
                <td class="weapon-name">
                  <strong>${escapeHtml(row.name)}</strong>
                  ${row.type ? `<small>${escapeHtml(row.type.replace(" Weapons", ""))}</small>` : ""}
                </td>
                ${row.values.map((value, index) => `
                  <td class="${index === 6 ? "weapon-keywords" : ""}">
                    ${escapeHtml(value)}
                  </td>`).join("")}
              </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </section>`;
}

function renderAbilitySection(rules) {
  return `
    <section class="detail-section ability-section">
      <div class="section-heading-row">
        <h3>Abilities & rules</h3>
        <span class="section-count">${rules.length}</span>
      </div>
      <div class="ability-list">
        ${rules.map(rule => `
          <article class="ability-card">
            <h4>${escapeHtml(cleanRuleText(rule.name || "Rule"))}</h4>
            ${rule.text ? `<div class="ability-text">${formatRuleText(rule.text)}</div>` : ""}
          </article>`).join("")}
      </div>
    </section>`;
}

function cleanRuleText(text = "") {
  return String(text)
    .replace(/\^\^/g, "")
    .replace(/\*\*/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function formatRuleText(text = "") {
  const cleaned = cleanRuleText(text);
  if (!cleaned) return "";

  return cleaned
    .split(/\n{2,}/)
    .map(block => {
      const lines = block.split("\n").map(line => line.trim()).filter(Boolean);
      const bulletLines = lines.filter(line => /^[■•*-]\s*/.test(line));

      if (bulletLines.length === lines.length && lines.length) {
        return `<ul>${lines.map(line => `<li>${escapeHtml(line.replace(/^[■•*-]\s*/, ""))}</li>`).join("")}</ul>`;
      }

      return `<p>${lines.map(line => escapeHtml(line)).join("<br>")}</p>`;
    })
    .join("");
}

function setupSpeech() {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) {
    els.voiceHint.textContent = "Voice recognition unavailable in this browser";
    return;
  }
  const recognition = new Recognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = navigator.language || "en-GB";
  recognition.onresult = (event) => {
    let transcript = "";
    for (let i = event.resultIndex; i < event.results.length; i++) transcript += event.results[i][0].transcript;
    els.voiceHint.textContent = transcript || "Listening…";
    els.searchInput.value = transcript;
    renderResults(transcript);
    if (event.results[event.results.length - 1].isFinal) chooseBestVoiceMatch(transcript);
  };
  recognition.onend = () => setListening(false);
  recognition.onerror = (event) => {
    setListening(false);
    if (event.error !== "aborted") toast(`Voice: ${event.error}`);
  };
  state.recognition = recognition;
}

function startListening(event) {
  event.preventDefault();
  if (!state.recognition || state.listening) {
    if (!state.recognition) toast("Voice recognition is not supported by this browser.");
    return;
  }
  try {
    state.recognition.start();
    setListening(true);
  } catch {}
}

function stopListening(event) {
  event.preventDefault();
  if (!state.recognition || !state.listening) return;
  try { state.recognition.stop(); } catch {}
}

function setListening(active) {
  state.listening = active;
  els.talkButton.classList.toggle("listening", active);
  els.voiceStatus.textContent = active ? "Listening…" : "Ready";
  if (!active && !els.voiceHint.textContent.trim()) els.voiceHint.textContent = "Hold to talk";
}

function chooseBestVoiceMatch(transcript) {
  const roster = state.rosters[state.activeRoster];
  if (!roster) return;
  const q = normalize(transcript);
  const ranked = roster.units.map(unit => ({unit, score:scoreMatch(unit,q)})).sort((a,b) => b.score-a.score);
  if (ranked[0]?.score > 0) {
    selectUnit(ranked[0].unit);
    els.voiceHint.textContent = ranked[0].unit.name;
  }
}

function toggleMode() {
  state.mode = state.mode === "mobile" ? "table" : "mobile";
  localStorage.setItem("tv_mode", state.mode);
  applyMode();
}

function applyMode() {
  document.body.classList.toggle("table-mode", state.mode === "table");
  els.modeToggle.textContent = state.mode === "table" ? "Mobile mode" : "Table mode";
}

function persist() {
  const persistentRosters = state.rosters.filter(r => r.source !== "bsdata");
  try {
    localStorage.setItem("tv_rosters", JSON.stringify(persistentRosters));
    const active = state.rosters[state.activeRoster];
    const persistentIndex = active ? persistentRosters.findIndex(r => r.id === active.id) : 0;
    localStorage.setItem("tv_activeRoster", String(Math.max(0, persistentIndex)));
  } catch (error) {
    console.warn("Could not persist rosters", error);
    toast("Roster loaded, but this browser could not save it locally.");
  }
}

function restore() {
  try {
    state.rosters = JSON.parse(localStorage.getItem("tv_rosters") || "[]");
    state.activeRoster = Math.min(Number(localStorage.getItem("tv_activeRoster") || 0), Math.max(0, state.rosters.length - 1));
  } catch {
    state.rosters = [];
  }
  if (state.rosters.length) renderAll();
}

function clearRosters() {
  if (!confirm("Remove imported rosters from this device?")) return;
  state.rosters = [];
  state.activeRoster = 0;
  state.selected = null;
  localStorage.removeItem("tv_rosters");
  localStorage.removeItem("tv_activeRoster");
  hideApp();
  toast("Imported rosters removed");
}

function loadDemo() {
  state.rosters = [{
    id:"demo",
    name:"Demo Strike Force",
    faction:"Demo",
    importedAt:Date.now(),
    units:[
      {
        id:"demo/ember-guard", name:"Ember Guard", type:"Unit",
        stats:[{label:"M",value:'6"'},{label:"T",value:"4"},{label:"Sv",value:"3+"},{label:"W",value:"2"},{label:"Ld",value:"6+"},{label:"OC",value:"1"}],
        profiles:[
          {name:"Thermal carbine",values:[{label:"Range",value:'18"'},{label:"A",value:"2"},{label:"BS",value:"3+"},{label:"S",value:"8"},{label:"AP",value:"-3"}]},
          {name:"Combat blade",values:[{label:"Range",value:"Melee"},{label:"A",value:"3"},{label:"WS",value:"3+"},{label:"S",value:"4"},{label:"AP",value:"-1"}]}
        ],
        rules:[{name:"Target lock",text:"Demo rule text used only to show the interface."}],
        searchText:"ember guard thermal carbine combat blade target lock"
      },
      {
        id:"demo/iron-beast", name:"Iron Beast", type:"Vehicle",
        stats:[{label:"M",value:'10"'},{label:"T",value:"10"},{label:"Sv",value:"2+"},{label:"W",value:"12"},{label:"Ld",value:"6+"},{label:"OC",value:"3"}],
        profiles:[{name:"Heavy accelerator",values:[{label:"Range",value:'36"'},{label:"A",value:"4"},{label:"BS",value:"3+"},{label:"S",value:"10"},{label:"AP",value:"-2"}]}],
        rules:[{name:"Armoured hull",text:"Demo ability."}],
        searchText:"iron beast vehicle heavy accelerator armoured hull"
      }
    ]
  }];
  state.activeRoster = 0;
  persist();
  renderAll();
  toast("Loaded demo roster");
}

function toast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => els.toast.classList.remove("show"), 2200);
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  })[char]);
}

boot();
