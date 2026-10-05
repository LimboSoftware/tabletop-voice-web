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
  catch {
    throw new Error("This beta currently expects a JSON roster export.");
  }

  const root = raw.roster || raw;
  const name = root.name || raw.name || fileName.replace(/\.[^.]+$/, "");
  const faction = pickString(root, ["faction", "factionName", "catalogueName"]) || "Imported roster";
  const units = extractEntities(root);

  if (!units.length) throw new Error("No unit-like entries found.");

  return {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
    name,
    faction,
    units,
    importedAt: Date.now()
  };
}

function extractEntities(root) {
  const found = [];
  const seen = new Set();

  function walk(node, path = []) {
    if (!node || typeof node !== "object") return;
    const name = pickString(node, ["name", "customName"]);
    const type = pickString(node, ["type", "selectionType", "kind", "category"]);
    const stats = extractStats(node);
    const rules = extractRules(node);
    const profiles = extractProfiles(node);

    const looksLikeUnit =
      name &&
      name.length < 120 &&
      (/(unit|model|character|vehicle|monster)/i.test(type || "") || stats.length >= 3 || profiles.length > 0);

    if (looksLikeUnit) {
      const key = `${path.join("/")}/${name}`;
      if (!seen.has(key)) {
        seen.add(key);
        found.push({
          id: key,
          name,
          type: type || "Unit",
          stats,
          rules,
          profiles,
          searchText: normalize([name, type, rules.map(r => r.name), profiles.map(p => p.name)].flat().join(" "))
        });
      }
    }

    if (Array.isArray(node)) {
      node.forEach((item, i) => walk(item, path.concat(i)));
    } else {
      Object.entries(node).forEach(([k, v]) => {
        if (typeof v === "object") walk(v, path.concat(k));
      });
    }
  }

  walk(root);
  return found.sort((a,b) => a.name.localeCompare(b.name));
}

function extractStats(node) {
  const stats = [];
  const candidates = [node.characteristics, node.stats, node.profile, node.attributes].filter(Boolean);

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      for (const item of candidate) {
        if (item && typeof item === "object") {
          const label = pickString(item, ["name", "typeName", "label"]);
          const value = pickString(item, ["value", "characteristic", "current"]);
          if (label && value && String(value).length < 30) stats.push({label, value});
        }
      }
    } else if (candidate && typeof candidate === "object") {
      for (const [label, value] of Object.entries(candidate)) {
        if (["string","number"].includes(typeof value) && String(value).length < 30) stats.push({label, value:String(value)});
      }
    }
  }

  return dedupeBy(stats, x => `${x.label}:${x.value}`).slice(0, 12);
}

function extractRules(node) {
  const rules = [];
  const candidates = [node.rules, node.abilities, node.specialRules].filter(Boolean);
  for (const candidate of candidates) {
    const list = Array.isArray(candidate) ? candidate : Object.values(candidate || {});
    for (const item of list) {
      if (typeof item === "string") rules.push({name:item, text:""});
      else if (item && typeof item === "object") {
        const name = pickString(item, ["name", "title", "typeName"]);
        const text = pickString(item, ["description", "text", "value"]);
        if (name || text) rules.push({name:name || "Ability", text:text || ""});
      }
    }
  }
  return dedupeBy(rules, x => `${x.name}:${x.text}`).slice(0, 30);
}

function extractProfiles(node) {
  const profiles = [];
  const candidates = [node.profiles, node.weapons, node.profileInfo].filter(Boolean);
  for (const candidate of candidates) {
    const list = Array.isArray(candidate) ? candidate : Object.values(candidate || {});
    for (const item of list) {
      if (!item || typeof item !== "object") continue;
      const name = pickString(item, ["name", "typeName", "title"]);
      if (!name) continue;
      const values = extractStats(item);
      profiles.push({name, values});
    }
  }
  return dedupeBy(profiles, x => x.name).slice(0, 40);
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
    ? unit.stats.map(stat => `<div class="stat"><span>${escapeHtml(stat.label)}</span><strong>${escapeHtml(stat.value)}</strong></div>`).join("")
    : '<div class="stat"><span>PROFILE</span><strong>Imported</strong></div>';

  const sections = [];
  if (unit.profiles.length) {
    sections.push(`<section class="detail-section"><h3>Profiles / weapons</h3>${unit.profiles.map(profile => {
      const values = profile.values.slice(0,5);
      return `<div class="profile-row"><strong>${escapeHtml(profile.name)}</strong>${values.map(v => `<span><small>${escapeHtml(v.label)}</small><br>${escapeHtml(v.value)}</span>`).join("")}</div>`;
    }).join("")}</section>`);
  }
  if (unit.rules.length) {
    sections.push(`<section class="detail-section"><h3>Abilities / rules</h3>${unit.rules.map(rule => `<div class="rule-text"><strong>${escapeHtml(rule.name)}</strong>${rule.text ? `: ${escapeHtml(rule.text)}` : ""}</div>`).join("")}</section>`);
  }
  els.detailSections.innerHTML = sections.join("") || '<section class="detail-section"><p class="rule-text">No additional profiles were found in this imported entry.</p></section>';
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
  localStorage.setItem("tv_rosters", JSON.stringify(state.rosters));
  localStorage.setItem("tv_activeRoster", String(state.activeRoster));
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
