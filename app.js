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
  fullDataButton: $("fullDataButton"),
  fullDataWelcome: $("fullDataWelcome"),
  clearRoster: $("clearRoster"),
  searchInput: $("searchInput"),
  resultList: $("resultList"),
  rosterTabs: $("rosterTabs"),
  activeArmySelector: $("activeArmySelector"),
  quickLists: $("quickLists"),
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
  focusButton: $("focusButton"),
  pinButton: $("pinButton"),
  destroyedButton: $("destroyedButton"),
  roundDown: $("roundDown"),
  roundUp: $("roundUp"),
  roundValue: $("roundValue"),
  cpDown: $("cpDown"),
  cpUp: $("cpUp"),
  cpValue: $("cpValue"),
  turnToggle: $("turnToggle"),
  armyPickerButton: $("armyPickerButton"),
  armyPickerModal: $("armyPickerModal"),
  armyPickerClose: $("armyPickerClose"),
  armyPickerAll: $("armyPickerAll"),
  armyPickerClear: $("armyPickerClear"),
  activeArmySummary: $("activeArmySummary"),
  armyPickerList: $("armyPickerList"),
  toast: $("toast"),
  firstRunModal: $("firstRunModal"),
  firstRunFullData: $("firstRunFullData"),
  firstRunImport: $("firstRunImport"),
  voiceShortlistModal: $("voiceShortlistModal"),
  voiceShortlistClose: $("voiceShortlistClose"),
  voiceShortlistResults: $("voiceShortlistResults"),
  voiceHeardText: $("voiceHeardText")
};

function boot() {
  applyMode();
  restore();
  bindEvents();
  showFirstRunIfNeeded();
  setupSpeech();
  renderMatchTools();
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js").catch(() => {});
}

function bindEvents() {
  els.importButton.addEventListener("click", () => els.fileInput.click());
  els.welcomeImport.addEventListener("click", () => els.fileInput.click());
  els.fileInput.addEventListener("change", handleFiles);
  els.fullDataButton?.addEventListener("click", loadFull40kData);
  els.fullDataWelcome?.addEventListener("click", loadFull40kData);
  els.clearRoster.addEventListener("click", clearRosters);
  els.searchInput.addEventListener("input", () => renderResults(els.searchInput.value));
  els.modeToggle.addEventListener("click", toggleMode);
  els.focusButton?.addEventListener("click", toggleFocusMode);
  els.pinButton.addEventListener("click", toggleSelectedPin);
  els.destroyedButton?.addEventListener("click", toggleDestroyed);
  els.roundDown?.addEventListener("click", () => adjustRound(-1));
  els.roundUp?.addEventListener("click", () => adjustRound(1));
  els.cpDown?.addEventListener("click", () => adjustCP(-1));
  els.cpUp?.addEventListener("click", () => adjustCP(1));
  els.turnToggle?.addEventListener("click", toggleTurn);
  els.armyPickerButton?.addEventListener("click", openArmyPicker);
  els.armyPickerClose?.addEventListener("click", closeArmyPicker);
  els.armyPickerModal?.addEventListener("click", event => {
    if (event.target === els.armyPickerModal) closeArmyPicker();
  });
  els.armyPickerAll?.addEventListener("click", () => {
    setActiveSearchScopeIds(getAvailableSearchScopes().map(scope => scope.id));
    renderActiveArmySelector();
    renderArmyPicker();
    renderResults(els.searchInput.value);
  });
  els.armyPickerClear?.addEventListener("click", () => {
    setActiveSearchScopeIds([]);
    renderActiveArmySelector();
    renderArmyPicker();
    renderResults(els.searchInput.value);
  });
  els.firstRunFullData?.addEventListener("click", () => {
    dismissFirstRun();
    loadFull40kData();
  });
  els.firstRunImport?.addEventListener("click", () => {
    dismissFirstRun();
    els.fileInput.click();
  });
  els.voiceShortlistClose?.addEventListener("click", closeVoiceShortlist);
  els.voiceShortlistModal?.addEventListener("click", event => {
    if (event.target === els.voiceShortlistModal) closeVoiceShortlist();
  });
  ["pointerdown", "touchstart"].forEach(evt => els.talkButton.addEventListener(evt, startListening, {passive:false}));
  ["pointerup", "pointercancel", "pointerleave", "touchend"].forEach(evt => els.talkButton.addEventListener(evt, stopListening, {passive:false}));
}

function showFirstRunIfNeeded() {
  if (!els.firstRunModal) return;
  const seen = localStorage.getItem("tv_first_run_seen") === "1";
  if (!seen) els.firstRunModal.classList.remove("hidden");
}

function dismissFirstRun() {
  localStorage.setItem("tv_first_run_seen", "1");
  els.firstRunModal?.classList.add("hidden");
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
      activateRosterSearchScopes(roster);
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
    activateRosterSearchScopes(roster);
    state.selected = null;
    els.searchInput.value = "";
    persist();
    renderAll();
    renderDetail(null);
    toast("Loaded " + roster.units.length + " 40K unit entries");
    setTimeout(openArmyPicker, 150);
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

function armyNameFromSource(sourceName = "") {
  let name = String(sourceName || "").replace(/\.json$/i, "").trim();
  name = name.replace(/^(imperium|chaos|xenos)\s*-\s*/i, "");
  name = name.replace(/^library\s*-\s*/i, "");

  const parts = name.split(/\s+-\s+/).map(part => part.trim()).filter(Boolean);
  const deduped = [];
  for (const part of parts) {
    if (!deduped.length || normalize(deduped[deduped.length - 1]) !== normalize(part)) deduped.push(part);
  }

  return deduped.join(" — ") || name || "Unknown army";
}

function armyIdFromSource(sourceName = "") {
  return "bsdata:" + String(sourceName || "").replace(/\.json$/i, "").trim();
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
        source:sourceName,
        armyId:armyIdFromSource(sourceName),
        armyName:armyNameFromSource(sourceName),
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
    armyId:armyIdFromSource(sourceName),
    armyName:armyNameFromSource(sourceName),
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
  renderActiveArmySelector();
  renderArmyPicker();
  renderTabs();
  const roster = state.rosters[state.activeRoster];
  els.rosterTitle.textContent = roster.name;
  renderQuickLists();
  renderResults(els.searchInput.value);
}

function getAvailableSearchScopes() {
  const scopes = [];

  state.rosters.forEach((roster, rosterIndex) => {
    if (roster.source === "bsdata") {
      const groups = new Map();

      for (const unit of roster.units || []) {
        const sourceName = unit.source || "Unknown army";
        if (/^library\s*-/i.test(String(sourceName))) continue;

        const id = unit.armyId || armyIdFromSource(sourceName);
        const label = unit.armyName || armyNameFromSource(sourceName);

        if (!groups.has(id)) {
          groups.set(id, {
            id,
            label,
            subLabel: "Full 40K data",
            roster,
            rosterIndex,
            units: []
          });
        }
        groups.get(id).units.push(unit);
      }

      scopes.push(...[...groups.values()].sort((a,b) => a.label.localeCompare(b.label)));
      return;
    }

    scopes.push({
      id: "roster:" + roster.id,
      label: roster.name,
      subLabel: roster.faction || "Imported roster",
      roster,
      rosterIndex,
      units: roster.units || []
    });
  });

  return scopes;
}

function getActiveSearchScopeIds() {
  const scopes = getAvailableSearchScopes();
  const validIds = new Set(scopes.map(scope => scope.id));

  try {
    const raw = localStorage.getItem("tv_active_search_scopes");
    if (raw !== null) {
      const stored = JSON.parse(raw);
      if (Array.isArray(stored)) return stored.filter(id => validIds.has(id));
    }

    // Migrate the old roster-level setting. "Full 40K Data" previously meant
    // the whole catalogue, so migrate that roster to all of its army scopes.
    const legacyRaw = localStorage.getItem("tv_active_search_rosters");
    if (legacyRaw !== null) {
      const legacy = JSON.parse(legacyRaw);
      if (Array.isArray(legacy)) {
        const migrated = scopes
          .filter(scope => legacy.includes(scope.roster.id))
          .map(scope => scope.id);
        if (migrated.length) {
          setActiveSearchScopeIds(migrated);
          return migrated;
        }
      }
    }
  } catch {}

  // First use: keep imported lists active and keep the full-data experience
  // working until the user narrows it with Choose armies.
  return scopes.map(scope => scope.id);
}

function setActiveSearchScopeIds(ids) {
  const validIds = new Set(getAvailableSearchScopes().map(scope => scope.id));
  const clean = [...new Set((ids || []).filter(id => validIds.has(id)))];
  try {
    localStorage.setItem("tv_active_search_scopes", JSON.stringify(clean));
  } catch {}
}

function setSearchScopeActive(scopeId, active) {
  const current = new Set(getActiveSearchScopeIds());
  if (active) current.add(scopeId);
  else current.delete(scopeId);
  setActiveSearchScopeIds([...current]);
}

function activateRosterSearchScopes(roster) {
  if (!roster) return;
  const existing = new Set(getActiveSearchScopeIds());

  if (roster.source === "bsdata") {
    const sources = new Set((roster.units || []).map(unit => unit.armyId || armyIdFromSource(unit.source || "")));
    sources.forEach(id => existing.add(id));
  } else {
    existing.add("roster:" + roster.id);
  }

  setActiveSearchScopeIds([...existing]);
}

function getSearchCollections() {
  const active = new Set(getActiveSearchScopeIds());
  return getAvailableSearchScopes().filter(scope => active.has(scope.id));
}

function openArmyPicker() {
  renderArmyPicker();
  els.armyPickerModal?.classList.remove("hidden");
}

function closeArmyPicker() {
  els.armyPickerModal?.classList.add("hidden");
}

function renderArmyPicker() {
  if (!els.armyPickerList) return;

  const scopes = getAvailableSearchScopes();
  if (!scopes.length) {
    els.armyPickerList.innerHTML = '<p class="army-picker-empty">No armies loaded yet. Load full 40K data or import a New Recruit roster first.</p>';
    return;
  }

  const activeIds = new Set(getActiveSearchScopeIds());

  els.armyPickerList.innerHTML = scopes.map(scope => {
    const active = activeIds.has(scope.id);
    return `
      <label class="army-picker-row${active ? " active" : ""}">
        <input type="checkbox" data-army-scope-id="${escapeHtml(scope.id)}" ${active ? "checked" : ""}>
        <span class="army-picker-box" aria-hidden="true">${active ? "✓" : ""}</span>
        <span class="army-picker-copy">
          <strong>${escapeHtml(scope.label)}</strong>
          <small>${escapeHtml(scope.subLabel)} · ${scope.units.length} entries</small>
        </span>
      </label>`;
  }).join("");

  els.armyPickerList.querySelectorAll("[data-army-scope-id]").forEach(input => {
    input.addEventListener("change", () => {
      setSearchScopeActive(input.dataset.armyScopeId, input.checked);
      renderArmyPicker();
      renderActiveArmySelector();
      renderResults(els.searchInput.value);
    });
  });
}

function renderActiveArmySelector() {
  if (!els.activeArmySelector) return;

  const scopes = getAvailableSearchScopes();
  const activeIds = new Set(getActiveSearchScopeIds());
  const activeScopes = scopes.filter(scope => activeIds.has(scope.id));

  if (els.activeArmySummary) {
    els.activeArmySummary.textContent = activeScopes.length
      ? activeScopes.length + " of " + scopes.length + " armies included in voice/text search"
      : "No armies selected — choose armies to enable search";
  }

  if (!scopes.length) {
    els.activeArmySelector.innerHTML = '<span class="active-army-empty">No armies loaded</span>';
    return;
  }

  if (!activeScopes.length) {
    els.activeArmySelector.innerHTML = '<button class="active-army-empty-button" type="button">No armies selected — choose armies</button>';
    els.activeArmySelector.querySelector("button")?.addEventListener("click", openArmyPicker);
    return;
  }

  const visible = activeScopes.slice(0, 4);
  const extra = activeScopes.length - visible.length;

  els.activeArmySelector.innerHTML =
    visible.map(scope => `<span class="active-army-chip">${escapeHtml(scope.label)}</span>`).join("") +
    (extra > 0 ? `<button class="active-army-more" type="button">+${extra} more</button>` : "");

  els.activeArmySelector.querySelector(".active-army-more")?.addEventListener("click", openArmyPicker);
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
  const currentRoster = state.rosters[state.activeRoster];
  if (!currentRoster) return;

  const q = normalize(query);
  let results = [];
  const collections = getSearchCollections();

  if (q) {
    for (const collection of collections) {
      for (const unit of collection.units || []) {
        const score = scoreMatch(unit, q);
        if (score > 0) results.push({
          unit,
          roster: collection.roster,
          rosterIndex: collection.rosterIndex,
          scopeLabel: collection.label,
          score
        });
      }
    }
    results.sort((a,b) => b.score - a.score || a.unit.name.localeCompare(b.unit.name));
  } else if (currentRoster.source === "bsdata") {
    const currentCollections = collections.filter(collection => collection.rosterIndex === state.activeRoster);
    results = currentCollections.flatMap(collection =>
      (collection.units || []).map(unit => ({
        unit,
        roster: collection.roster,
        rosterIndex: collection.rosterIndex,
        scopeLabel: collection.label,
        score: 0
      }))
    );
  } else {
    results = (currentRoster.units || []).map(unit => ({
      unit,
      roster: currentRoster,
      rosterIndex: state.activeRoster,
      scopeLabel: currentRoster.name,
      score: 0
    }));
  }

  els.resultList.innerHTML = "";
  results.slice(0, 100).forEach(result => {
    const {unit, roster, rosterIndex, scopeLabel} = result;
    const button = document.createElement("button");
    button.className = "result-item" + (state.selected?.id === unit.id && state.activeRoster === rosterIndex ? " active" : "");
    button.classList.toggle("destroyed", isUnitDestroyedInRoster(unit, rosterIndex));
    button.innerHTML = `
      <strong>${escapeHtml(unit.name)}</strong>
      <small>${escapeHtml(unit.type || "Unit")}${q ? ` · <span class="result-roster">${escapeHtml(scopeLabel)}</span>` : ""}${isUnitDestroyedInRoster(unit, rosterIndex) ? " · DESTROYED" : ""}</small>`;
    button.addEventListener("click", () => selectUnitFromRoster(unit, rosterIndex));
    els.resultList.appendChild(button);
  });

  if (!results.length) {
    els.resultList.innerHTML = collections.length
      ? '<div class="result-item"><small>No matching entries in the selected armies.</small></div>'
      : '<div class="result-item"><small>No armies selected. Choose armies above to enable search.</small></div>';
  }
}

function isUnitDestroyedInRoster(unit, rosterIndex) {
  const roster = state.rosters[rosterIndex];
  if (!roster || !unit) return false;
  return localStorage.getItem("tv_destroyed_" + roster.id + "_" + unit.id) === "1";
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
  rememberRecentUnit(unit);
  renderQuickLists();
  renderResults(els.searchInput.value);
  renderDetail(unit);
}

function selectUnitFromRoster(unit, rosterIndex) {
  if (Number.isInteger(rosterIndex) && rosterIndex >= 0 && rosterIndex < state.rosters.length) {
    state.activeRoster = rosterIndex;
  }
  selectUnit(unit);
  renderActiveArmySelector();
  renderTabs();
  const roster = state.rosters[state.activeRoster];
  if (roster) els.rosterTitle.textContent = roster.name;
  persist();
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
  updatePinButton();
  updateDestroyedButton();

  els.detailStats.innerHTML = unit.stats.length
    ? unit.stats.map(stat => `
        <div class="stat">
          <span>${escapeHtml(stat.label)}</span>
          <strong>${escapeHtml(stat.value)}</strong>
        </div>`).join("")
    : '<div class="stat"><span>PROFILE</span><strong>Imported</strong></div>';

  const sections = [];
  const statuses = renderStatusSection(unit);
  if (statuses) sections.push(statuses);
  const woundTracker = renderWoundTracker(unit);
  if (woundTracker) sections.push(woundTracker);

  if (unit.profiles?.length) {
    sections.push(renderWeaponSection(unit.profiles));
  }

  if (unit.rules?.length) {
    sections.push(renderPhaseControls(unit.rules));
    sections.push(renderAbilitySection(unit.rules));
  }

  els.detailSections.innerHTML = sections.join("") ||
    '<section class="detail-section"><div class="empty-section">No additional profiles were found in this entry.</div></section>';
  bindDynamicDetailControls();
}

const STATUS_OPTIONS = ["Advanced","Fell Back","Charged","Battle-shocked","In Reserve","Once-per-game used"];

function statusKey(unit = state.selected) {
  const roster = state.rosters[state.activeRoster];
  return roster && unit ? "tv_status_" + roster.id + "_" + unit.id : null;
}

function getStatuses(unit = state.selected) {
  const key = statusKey(unit);
  if (!key) return [];
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function toggleStatus(status) {
  if (!state.selected) return;
  const key = statusKey(state.selected);
  if (!key) return;
  const statuses = new Set(getStatuses(state.selected));
  if (statuses.has(status)) statuses.delete(status);
  else statuses.add(status);
  localStorage.setItem(key, JSON.stringify([...statuses]));
  renderDetail(state.selected);
}

function renderStatusSection(unit) {
  const active = new Set(getStatuses(unit));
  return `
    <section class="detail-section status-section">
      <div class="section-heading-row"><h3>Status</h3></div>
      <div class="status-tags">
        ${STATUS_OPTIONS.map(status => `
          <button type="button" class="status-tag${active.has(status) ? " active" : ""}" data-status="${escapeHtml(status)}">
            ${active.has(status) ? "✓ " : ""}${escapeHtml(status)}
          </button>`).join("")}
      </div>
    </section>`;
}

const PHASES = ["All","Command","Movement","Shooting","Charge","Fight"];

function getActivePhase() {
  return localStorage.getItem("tv_phase_filter") || "All";
}

function setActivePhase(phase) {
  localStorage.setItem("tv_phase_filter", PHASES.includes(phase) ? phase : "All");
  if (state.selected) renderDetail(state.selected);
}

function inferRulePhase(rule) {
  const text = normalize((rule?.name || "") + " " + (rule?.text || ""));
  if (/command phase|command step/.test(text)) return "Command";
  if (/movement phase|normal move|advance move|fall back|set up on the battlefield|reserves/.test(text)) return "Movement";
  if (/shooting phase|selected to shoot|ranged attack|shoot/.test(text)) return "Shooting";
  if (/charge phase|declares a charge|charge move/.test(text)) return "Charge";
  if (/fight phase|selected to fight|pile in|consolidation|melee attack/.test(text)) return "Fight";
  return "All";
}

function renderPhaseControls(rules) {
  const active = getActivePhase();
  const counts = Object.fromEntries(PHASES.map(p => [p, 0]));
  for (const rule of rules || []) {
    counts.All++;
    const phase = inferRulePhase(rule);
    if (phase !== "All") counts[phase]++;
  }
  return `
    <section class="detail-section phase-filter-section">
      <div class="section-heading-row"><h3>Phase filter</h3></div>
      <div class="phase-filter">
        ${PHASES.map(phase => `
          <button type="button" class="phase-button${active === phase ? " active" : ""}" data-phase="${phase}">
            ${phase}${counts[phase] ? ` <span>${counts[phase]}</span>` : ""}
          </button>`).join("")}
      </div>
    </section>`;
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
  const activePhase = getActivePhase();
  const visibleRules = activePhase === "All"
    ? rules
    : rules.filter(rule => inferRulePhase(rule) === activePhase);

  return `
    <section class="detail-section ability-section">
      <div class="section-heading-row">
        <h3>Abilities & rules</h3>
        <span class="section-count">${visibleRules.length}</span>
      </div>
      <div class="ability-list">
        ${visibleRules.length ? visibleRules.map(rule => {
          const summary = summariseRule(rule.name || "Rule", rule.text || "");
          return `
            <article class="ability-card compact-rule">
              <h4>${escapeHtml(cleanRuleText(rule.name || "Rule"))}</h4>
              ${summary ? `<p class="ability-summary">${escapeHtml(summary)}</p>` : ""}
            </article>`;
        }).join("") : '<div class="empty-section">No abilities matched this phase.</div>'}
      </div>
    </section>`;
}

function summariseRule(name = "", text = "") {
  const cleanName = normalize(cleanRuleText(name));
  const cleaned = cleanRuleText(text);

  const known = [
    [/^blast$/, "Gain +1 Attack for every 5 models in the target unit."],
    [/^lethal hits$/, "Critical Hits automatically wound the target."],
    [/^sustained hits (\d+|d\d+)$/, match => "Critical Hits score " + match[1] + " extra hit" + (match[1] === "1" ? "" : "s") + "."],
    [/^devastating wounds$/, "Critical Wounds inflict mortal wounds equal to the weapon's Damage."],
    [/^twin linked$/, "Re-roll the Wound roll."],
    [/^assault$/, "This weapon can be fired after the unit Advances."],
    [/^pistol$/, "This weapon can be fired while the unit is within Engagement Range."],
    [/^ignores cover$/, "Targets cannot benefit from Cover against this weapon."],
    [/^indirect fire$/, "Can target units not visible to the attacker, with the normal Indirect Fire penalties."],
    [/^hazardous$/, "After attacking, take a Hazardous test for each Hazardous weapon used."],
    [/^torrent$/, "Attacks automatically hit."],
    [/^lance$/, "If this unit charged, add 1 to the Wound roll."],
    [/^melta (\d+)$/, match => "At half range, add " + match[1] + " to Damage."],
    [/^rapid fire (\d+)$/, match => "At half range, gain " + match[1] + " extra Attack" + (match[1] === "1" ? "" : "s") + "."],
    [/^anti (.+) (\d\+)$/, match => "Against " + titleCase(match[1]) + ", unmodified " + match[2] + " Wound rolls are Critical Wounds."],
    [/^deadly demise d3$/, "When destroyed, roll a D6; on a 6, nearby units suffer D3 mortal wounds."],
    [/^deadly demise (\d+)$/, match => "When destroyed, roll a D6; on a 6, nearby units suffer " + match[1] + " mortal wounds."],
    [/^stealth$/, "Enemy ranged attacks against this unit suffer -1 to Hit."],
    [/^deep strike$/, "This unit can be set up in Reserves and arrive more than 9\" from enemy models."],
    [/^fights first$/, "This unit fights in the Fights First step."],
    [/^scouts (\d+\")$/, match => "Before the battle starts, this unit can make a " + match[1] + " Scout move."],
    [/^feel no pain (\d\+)$/, match => "Each time this model would lose a wound, ignore it on a " + match[1] + "."]
  ];

  for (const [pattern, summary] of known) {
    const match = cleanName.match(pattern);
    if (match) return typeof summary === "function" ? summary(match) : summary;
  }

  const withoutNotes = cleaned
    .replace(/\*{0,3}Example:?[\s\S]*$/i, "")
    .replace(/Designer'?s Note:?[\s\S]*$/i, "")
    .replace(/This ability always takes the form[^.]*\.\s*/i, "")
    .replace(/See [^.]+\.\s*/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!withoutNotes) return "";

  const sentences = withoutNotes.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [withoutNotes];

  const useful = sentences
    .map(x => x.trim())
    .filter(Boolean)
    .filter(x => !/^example\b/i.test(x))
    .filter(x => !/^designer'?s note\b/i.test(x));

  let summary = useful[0] || withoutNotes;

  if (summary.length > 190 && useful.length > 1) {
    summary = useful.slice(0, 2).join(" ");
  }

  summary = summary
    .replace(/^Each time /i, "")
    .replace(/^While /i, "While ")
    .replace(/^At the start of /i, "At the start of ")
    .replace(/\s+/g, " ")
    .trim();

  if (summary.length > 240) {
    summary = summary.slice(0, 237).replace(/\s+\S*$/, "") + "…";
  }

  return summary;
}

function titleCase(value = "") {
  return String(value)
    .split(/\s+/)
    .map(word => word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : "")
    .join(" ");
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

function getMatchState() {
  try {
    return {
      round: Math.min(5, Math.max(1, Number(localStorage.getItem("tv_match_round") || 1))),
      cp: Math.max(0, Number(localStorage.getItem("tv_match_cp") || 0)),
      turn: localStorage.getItem("tv_match_turn") || "your"
    };
  } catch {
    return {round:1, cp:0, turn:"your"};
  }
}

function renderMatchTools() {
  const match = getMatchState();
  if (els.roundValue) els.roundValue.textContent = String(match.round);
  if (els.cpValue) els.cpValue.textContent = String(match.cp);
  if (els.turnToggle) {
    els.turnToggle.textContent = match.turn === "your" ? "Your turn" : "Opponent turn";
    els.turnToggle.classList.toggle("opponent", match.turn === "opponent");
  }
}

function adjustRound(delta) {
  const match = getMatchState();
  const next = Math.min(5, Math.max(1, match.round + delta));
  localStorage.setItem("tv_match_round", String(next));
  renderMatchTools();
  toast("Battle round " + next);
}

function adjustCP(delta) {
  const match = getMatchState();
  const next = Math.max(0, match.cp + delta);
  localStorage.setItem("tv_match_cp", String(next));
  renderMatchTools();
}

function toggleTurn() {
  const match = getMatchState();
  const next = match.turn === "your" ? "opponent" : "your";
  localStorage.setItem("tv_match_turn", next);
  renderMatchTools();
  toast(next === "your" ? "Your turn" : "Opponent turn");
}

function destroyedKey(unit = state.selected) {
  const roster = state.rosters[state.activeRoster];
  return roster && unit ? "tv_destroyed_" + roster.id + "_" + unit.id : null;
}

function isDestroyed(unit = state.selected) {
  const key = destroyedKey(unit);
  return key ? localStorage.getItem(key) === "1" : false;
}

function toggleDestroyed() {
  if (!state.selected) return;
  const key = destroyedKey(state.selected);
  if (!key) return;
  const next = !isDestroyed(state.selected);
  localStorage.setItem(key, next ? "1" : "0");
  updateDestroyedButton();
  renderResults(els.searchInput.value);
  toast(next ? state.selected.name + " marked destroyed" : state.selected.name + " restored");
}

function updateDestroyedButton() {
  if (!els.destroyedButton) return;
  const destroyed = state.selected ? isDestroyed(state.selected) : false;
  els.destroyedButton.textContent = destroyed ? "Destroyed ✓" : "Destroyed";
  els.destroyedButton.classList.toggle("danger-active", destroyed);
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
  recognition.maxAlternatives = 5;
  recognition.lang = navigator.language || "en-GB";

  recognition.onresult = (event) => {
    let interim = "";
    let finalAlternatives = null;

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      if (result.isFinal) {
        finalAlternatives = Array.from(result)
          .slice(0, 5)
          .map(alt => ({
            transcript: String(alt.transcript || "").trim(),
            confidence: Number.isFinite(alt.confidence) ? alt.confidence : 0
          }))
          .filter(alt => alt.transcript);
      } else {
        interim += result[0]?.transcript || "";
      }
    }

    if (interim) {
      els.voiceHint.textContent = interim;
      els.searchInput.value = interim;
      renderResults(interim);
    }

    if (finalAlternatives?.length) {
      const primary = finalAlternatives[0].transcript;
      els.voiceHint.textContent = primary;
      els.searchInput.value = primary;
      renderResults(primary);
      chooseBestVoiceMatch(finalAlternatives);
    }
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

  closeVoiceShortlist();

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

function voiceAliasKey(rosterId, unitId) {
  return "tv_voice_alias_" + rosterId + "_" + unitId;
}

function getVoiceAliases(rosterId, unitId) {
  try {
    const value = JSON.parse(localStorage.getItem(voiceAliasKey(rosterId, unitId)) || "[]");
    return Array.isArray(value) ? value.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function saveVoiceAlias(rosterId, unitId, phrase) {
  const cleaned = String(phrase || "").trim();
  if (!cleaned) return;
  const aliases = getVoiceAliases(rosterId, unitId);
  if (!aliases.some(alias => normalize(alias) === normalize(cleaned))) aliases.unshift(cleaned);
  localStorage.setItem(voiceAliasKey(rosterId, unitId), JSON.stringify(aliases.slice(0, 8)));
}

function voiceNormalize(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[’']/g, "")
    .replace(/&/g, " and ")
    .replace(/\bmk\s*(\d+)\b/g, " mark $1 ")
    .replace(/\bii\b/g, " 2 ")
    .replace(/\biii\b/g, " 3 ")
    .replace(/\biv\b/g, " 4 ")
    .replace(/\bv\b/g, " 5 ")
    .replace(/ph/g, "f")
    .replace(/qu/g, "k")
    .replace(/x/g, "ks")
    .replace(/c(?=[aou])/g, "k")
    .replace(/c(?=[eiy])/g, "s")
    .replace(/ae|oe/g, "e")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function speechSoundNormalize(value) {
  return voiceNormalize(value)
    // Common speech-to-text equivalents for unusual tabletop/fantasy spellings.
    .replace(/korps|corps|korp|corp|core/g, "kor")
    .replace(/krieg|kreig|kreeg|creeg|creek|creed/g, "krig")
    .replace(/draigo|drago/g, "drago")
    .replace(/c'tan|ctan/g, "ktan")
    .replace(/t'au|tau/g, "tau")
    .replace(/aeldari|eldari/g, "eldari")
    .replace(/drukhari|drukari|drukari/g, "drukari")
    .replace(/\s+/g, " ")
    .trim();
}

function speechCompact(value) {
  return speechSoundNormalize(value)
    .replace(/\b(the|of|and|a|an)\b/g, " ")
    .replace(/\s+/g, "")
    .trim();
}

function prefixCoverage(spoken, candidate) {
  const q = speechCompact(spoken);
  const n = speechCompact(candidate);
  if (!q || !n) return 0;
  if (q === n) return 1;

  const min = Math.min(q.length, n.length);
  let same = 0;
  while (same < min && q[same] === n[same]) same++;

  const coverage = same / Math.max(1, q.length);
  const candidateCoverage = same / Math.max(1, n.length);

  // Prefer a transcript that accurately covers the beginning of a longer,
  // unusual unit name over a different unit sharing only its first word.
  if (coverage >= .9 && q.length >= 6) {
    return Math.min(1, .88 + candidateCoverage * .12);
  }
  return coverage * .75 + candidateCoverage * .25;
}

function phoneticWords(value) {
  return speechSoundNormalize(value)
    .replace(/\b(the|of|and|a|an)\b/g, " ")
    .replace(/\bkh/g, "k")
    .replace(/\bgh/g, "g")
    .replace(/tion\b/g, "shun")
    .replace(/sion\b/g, "zhun")
    .replace(/ck/g, "k")
    .replace(/dg/g, "j")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function phoneticSkeleton(value) {
  return phoneticWords(value)
    .replace(/[aeiouy]/g, "")
    .replace(/(.)\1+/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function phraseVariants(value) {
  const words = phoneticWords(value).split(" ").filter(Boolean);
  const variants = new Set();

  if (!words.length) return [];

  variants.add(words.join(" "));
  variants.add(words.join(""));

  for (let size = 1; size <= Math.min(4, words.length); size++) {
    for (let start = 0; start + size <= words.length; start++) {
      const slice = words.slice(start, start + size);
      variants.add(slice.join(" "));
      variants.add(slice.join(""));
    }
  }

  return [...variants];
}

function bestVariantSimilarity(a, b) {
  const aa = phraseVariants(a);
  const bb = phraseVariants(b);
  let best = 0;

  for (const av of aa) {
    for (const bv of bb) {
      if (!av || !bv) continue;
      if (av === bv) return 1;

      const edit = stringSimilarity(av, bv);
      best = Math.max(best, edit);

      const short = av.length <= bv.length ? av : bv;
      const long = av.length <= bv.length ? bv : av;
      if (short.length >= 5 && long.startsWith(short)) best = Math.max(best, .94);
    }
  }

  return best;
}

function levenshtein(a, b) {
  a = String(a || "");
  b = String(b || "");
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const prev = Array.from({length:b.length + 1}, (_, i) => i);
  const curr = new Array(b.length + 1);

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        curr[j - 1] + 1,
        prev[j] + 1,
        prev[j - 1] + cost
      );
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j];
  }

  return prev[b.length];
}

function stringSimilarity(a, b) {
  a = String(a || "");
  b = String(b || "");
  const longest = Math.max(a.length, b.length);
  if (!longest) return 1;
  return 1 - levenshtein(a, b) / longest;
}

function tokenSimilarity(a, b) {
  const aa = new Set(voiceNormalize(a).split(" ").filter(Boolean));
  const bb = new Set(voiceNormalize(b).split(" ").filter(Boolean));
  if (!aa.size || !bb.size) return 0;

  let intersection = 0;
  for (const word of aa) if (bb.has(word)) intersection++;
  const union = new Set([...aa, ...bb]).size;
  return union ? intersection / union : 0;
}

function scoreVoicePhrase(spoken, candidate) {
  const q = voiceNormalize(spoken);
  const n = voiceNormalize(candidate);
  if (!q || !n) return 0;
  if (q === n) return 1;

  let score = 0;

  if (n.startsWith(q) || q.startsWith(n)) score = Math.max(score, .88);
  if (n.includes(q) || q.includes(n)) score = Math.max(score, .82);

  const edit = stringSimilarity(q, n);
  const tokens = tokenSimilarity(q, n);
  const phonetic = stringSimilarity(phoneticSkeleton(q), phoneticSkeleton(n));
  const partialPhonetic = bestVariantSimilarity(q, n);
  const soundEdit = stringSimilarity(speechCompact(q), speechCompact(n));
  const prefix = prefixCoverage(q, n);

  score = Math.max(
    score,
    edit * .78,
    phonetic * .78,
    tokens * .72,
    partialPhonetic * .9,
    soundEdit * .96,
    prefix * .99,
    edit * .20 + phonetic * .18 + tokens * .10 + partialPhonetic * .16 + soundEdit * .20 + prefix * .16
  );

  const qWords = phoneticWords(q).split(" ").filter(Boolean);
  const nWords = phoneticWords(n).split(" ").filter(Boolean);

  if (qWords.length === 1 && nWords.includes(qWords[0])) score = Math.max(score, .86);

  // Speech engines often merge two fantasy words into one ordinary-looking word:
  // "death korps" -> "deathcore". Give joined neighbouring words a strong chance.
  const qJoined = qWords.join("");
  for (let i = 0; i < nWords.length; i++) {
    const one = nWords[i];
    const two = (nWords[i] || "") + (nWords[i + 1] || "");
    const three = two + (nWords[i + 2] || "");
    for (const chunk of [one, two, three]) {
      if (!chunk || qJoined.length < 5) continue;
      const similarity = stringSimilarity(qJoined, chunk);
      if (similarity >= .72) score = Math.max(score, similarity * .98);
    }
  }

  const qSoundWords = speechSoundNormalize(q).split(" ").filter(Boolean);
  const nSoundWords = speechSoundNormalize(n).split(" ").filter(Boolean);
  const sharedSoundWords = qSoundWords.filter(word => nSoundWords.includes(word));

  if (qSoundWords.length >= 2 && sharedSoundWords.length === 1 && sharedSoundWords[0].length <= 6) {
    score = Math.min(score, .72);
  }

  return Math.max(0, Math.min(1, score));
}

function rankVoiceCandidates(alternatives) {
  const results = new Map();

  for (const collection of getSearchCollections()) {
    const {roster, rosterIndex} = collection;
    for (const unit of collection.units || []) {
      const aliases = getVoiceAliases(roster.id, unit.id);
      const candidates = [unit.name, ...aliases];
      let bestScore = 0;
      let bestTranscript = alternatives[0]?.transcript || "";
      let matchedAlias = false;

      alternatives.forEach((alt, altIndex) => {
        const confidenceBoost = Math.max(0, Math.min(.05, (alt.confidence || 0) * .05));
        candidates.forEach((candidate, candidateIndex) => {
          let score = scoreVoicePhrase(alt.transcript, candidate);
          if (candidateIndex > 0 && voiceNormalize(alt.transcript) === voiceNormalize(candidate)) score = 1;
          score += confidenceBoost - altIndex * .012;
          if (score > bestScore) {
            bestScore = score;
            bestTranscript = alt.transcript;
            matchedAlias = candidateIndex > 0;
          }
        });
      });

      const key = roster.id + "::" + unit.id;
      results.set(key, {
        unit,
        roster,
        rosterIndex,
        score: Math.min(1, bestScore),
        transcript: bestTranscript,
        matchedAlias
      });
    }
  }

  return [...results.values()]
    .sort((a,b) => b.score - a.score || a.unit.name.localeCompare(b.unit.name));
}

function chooseBestVoiceMatch(input) {
  if (!state.rosters.length) return;

  const alternatives = Array.isArray(input)
    ? input
    : [{transcript:String(input || ""), confidence:0}];

  const primary = alternatives[0]?.transcript?.trim() || "";
  const q = normalize(primary);

  if (q && handleVoiceCommand(q)) {
    els.voiceHint.textContent = primary;
    return;
  }

  const ranked = rankVoiceCandidates(alternatives);
  const top = ranked[0];
  const second = ranked[1];
  const margin = top ? top.score - (second?.score || 0) : 0;

  if (!top || top.score < .34) {
    els.voiceHint.textContent = "No confident unit match";
    toast("I couldn't confidently match that unit. Try again or type part of the name.");
    return;
  }

  const primaryTopScore = scoreVoicePhrase(primary, top.unit.name);
  const strongSoundMatch =
    speechCompact(primary).length >= 6 &&
    (prefixCoverage(primary, top.unit.name) >= .90 ||
     stringSimilarity(speechCompact(primary), speechCompact(top.unit.name)) >= .90);

  const decisive =
    top.score >= .97 ||
    (strongSoundMatch && top.score >= .90 && margin >= .08) ||
    (primaryTopScore >= .92 && top.score >= .92 && margin >= .12) ||
    (top.matchedAlias && top.score >= .88);

  if (decisive) {
    closeVoiceShortlist();
    selectUnitFromRoster(top.unit, top.rosterIndex);
    els.voiceHint.textContent = top.unit.name;
    return;
  }

  showVoiceShortlist(primary, ranked.slice(0, 5));
}

function showVoiceShortlist(heard, ranked) {
  if (!els.voiceShortlistModal || !els.voiceShortlistResults) return;

  state.voiceShortlist = ranked;
  state.voiceHeard = heard;

  els.voiceHeardText.textContent = heard ? `I heard: “${heard}”` : "I wasn't certain what you said.";
  els.voiceShortlistResults.innerHTML = ranked.map((item, index) => {
    const percent = Math.round(item.score * 100);
    return `
      <div class="voice-shortlist-item">
        <button type="button" class="voice-choice" data-voice-choice="${index}">
          <span class="voice-rank">${index + 1}</span>
          <span class="voice-choice-copy">
            <strong>${escapeHtml(item.unit.name)}</strong>
            <small>${escapeHtml(item.unit.armyName || item.roster.name)}</small>
          </span>
          <span class="voice-match-score">${percent}%</span>
        </button>
        <button type="button" class="voice-teach" data-voice-teach="${index}" title="Remember what was heard as an alias for this unit">Teach</button>
      </div>`;
  }).join("");

  els.voiceShortlistResults.querySelectorAll("[data-voice-choice]").forEach(button => {
    button.addEventListener("click", () => chooseVoiceShortlist(Number(button.dataset.voiceChoice), false));
  });
  els.voiceShortlistResults.querySelectorAll("[data-voice-teach]").forEach(button => {
    button.addEventListener("click", () => chooseVoiceShortlist(Number(button.dataset.voiceTeach), true));
  });

  els.voiceShortlistModal.classList.remove("hidden");
  els.voiceShortlistResults.querySelector("[data-voice-choice]")?.focus();
}

function chooseVoiceShortlist(index, teach) {
  const item = state.voiceShortlist?.[index];
  if (!item) return;

  if (teach && state.voiceHeard) {
    saveVoiceAlias(item.roster.id, item.unit.id, state.voiceHeard);
    toast(`Voice alias learned for ${item.unit.name}`);
  }

  closeVoiceShortlist();
  selectUnitFromRoster(item.unit, item.rosterIndex);
  els.voiceHint.textContent = item.unit.name;
}

function closeVoiceShortlist() {
  els.voiceShortlistModal?.classList.add("hidden");
  state.voiceShortlist = null;
  state.voiceHeard = "";
}

function handleVoiceCommand(q) {
  if (!state.selected && !/next|previous|back/.test(q)) return false;

  if (/^(show )?(weapons?|guns?|melee|ranged)$/.test(q)) {
    scrollToDetailSection(".weapon-section");
    return true;
  }
  const phaseMatch = q.match(/^(?:show )?(command|movement|shooting|charge|fight) phase$/);
  if (phaseMatch) {
    setActivePhase(titleCase(phaseMatch[1]));
    scrollToDetailSection(".ability-section");
    return true;
  }
  if (/^(show )?(all abilities|all rules)$/.test(q)) {
    setActivePhase("All");
    return true;
  }
  if (/^(show )?(abilities|ability|rules?)$/.test(q)) {
    scrollToDetailSection(".ability-section");
    return true;
  }
  if (/^(show )?(wounds?|health)$/.test(q)) {
    scrollToDetailSection(".wound-tracker");
    return true;
  }
  if (/^(next|next unit)$/.test(q)) {
    moveSelection(1);
    return true;
  }
  if (/^(previous|previous unit|back)$/.test(q)) {
    moveSelection(-1);
    return true;
  }
  if (/^(pin|pin unit|favourite|favorite)$/.test(q)) {
    toggleSelectedPin();
    return true;
  }
  if (/^(reset wounds|full health|heal fully)$/.test(q)) {
    resetWounds();
    return true;
  }
  if (/^(destroyed|mark destroyed|unit destroyed)$/.test(q)) {
    toggleDestroyed();
    return true;
  }
  if (/^(your turn|my turn)$/.test(q)) {
    localStorage.setItem("tv_match_turn", "your");
    renderMatchTools();
    return true;
  }
  if (/^(opponent turn|their turn)$/.test(q)) {
    localStorage.setItem("tv_match_turn", "opponent");
    renderMatchTools();
    return true;
  }
  if (/^(next round|round up)$/.test(q)) {
    adjustRound(1);
    return true;
  }
  if (/^(previous round|round down)$/.test(q)) {
    adjustRound(-1);
    return true;
  }

  const damageMatch = q.match(/^(?:take|lose|minus) (\d+) wounds?$/);
  if (damageMatch) {
    adjustWounds(-Number(damageMatch[1]));
    return true;
  }

  const cpMatch = q.match(/^(?:set )?cp (\d+)$/);
  if (cpMatch) {
    localStorage.setItem("tv_match_cp", String(Number(cpMatch[1])));
    renderMatchTools();
    return true;
  }

  const healMatch = q.match(/^(?:heal|gain|plus) (\d+) wounds?$/);
  if (healMatch) {
    adjustWounds(Number(healMatch[1]));
    return true;
  }

  return false;
}

function scrollToDetailSection(selector) {
  document.querySelector(selector)?.scrollIntoView({behavior:"smooth", block:"start"});
}

function moveSelection(direction) {
  const roster = state.rosters[state.activeRoster];
  if (!roster?.units?.length) return;
  const current = state.selected ? roster.units.findIndex(u => u.id === state.selected.id) : -1;
  const next = current < 0 ? 0 : (current + direction + roster.units.length) % roster.units.length;
  selectUnit(roster.units[next]);
}

function rosterStorageKey(prefix) {
  const roster = state.rosters[state.activeRoster];
  return roster ? "tv_" + prefix + "_" + roster.id : null;
}

function getStoredIds(prefix) {
  const key = rosterStorageKey(prefix);
  if (!key) return [];
  try { return JSON.parse(localStorage.getItem(key) || "[]"); }
  catch { return []; }
}

function setStoredIds(prefix, ids) {
  const key = rosterStorageKey(prefix);
  if (!key) return;
  try { localStorage.setItem(key, JSON.stringify(ids)); } catch {}
}

function rememberRecentUnit(unit) {
  const ids = getStoredIds("recent").filter(id => id !== unit.id);
  ids.unshift(unit.id);
  setStoredIds("recent", ids.slice(0, 5));
}

function toggleSelectedPin() {
  if (!state.selected) return;
  const ids = getStoredIds("pins");
  const index = ids.indexOf(state.selected.id);
  if (index >= 0) {
    ids.splice(index, 1);
    toast("Unpinned " + state.selected.name);
  } else {
    ids.unshift(state.selected.id);
    toast("Pinned " + state.selected.name);
  }
  setStoredIds("pins", ids.slice(0, 12));
  updatePinButton();
  renderQuickLists();
}

function updatePinButton() {
  if (!els.pinButton) return;
  if (!state.selected) {
    els.pinButton.textContent = "Pin";
    return;
  }
  const pinned = getStoredIds("pins").includes(state.selected.id);
  els.pinButton.textContent = pinned ? "Pinned" : "Pin";
  els.pinButton.classList.toggle("active", pinned);
}

function renderQuickLists() {
  if (!els.quickLists) return;
  const roster = state.rosters[state.activeRoster];
  if (!roster) {
    els.quickLists.innerHTML = "";
    return;
  }

  const byId = new Map(roster.units.map(unit => [unit.id, unit]));
  const pinned = getStoredIds("pins").map(id => byId.get(id)).filter(Boolean);
  const recent = getStoredIds("recent").map(id => byId.get(id)).filter(Boolean);

  const group = (label, units, icon) => units.length ? `
    <div class="quick-group">
      <span class="quick-label">${icon} ${label}</span>
      <div class="quick-chips">
        ${units.map(unit => `<button class="quick-chip" data-unit-id="${escapeHtml(unit.id)}">${escapeHtml(unit.name)}</button>`).join("")}
      </div>
    </div>` : "";

  els.quickLists.innerHTML =
    group("Pinned", pinned, "★") +
    group("Recent", recent, "↺");

  els.quickLists.querySelectorAll("[data-unit-id]").forEach(button => {
    button.addEventListener("click", () => {
      const unit = byId.get(button.dataset.unitId);
      if (unit) selectUnit(unit);
    });
  });
}

function getMaxWounds(unit) {
  const stat = (unit?.stats || []).find(s => normalize(s.label) === "w");
  const value = stat ? parseInt(String(stat.value), 10) : NaN;
  return Number.isFinite(value) && value > 0 ? value : null;
}

function woundKey(unit = state.selected) {
  const roster = state.rosters[state.activeRoster];
  return roster && unit ? "tv_wounds_" + roster.id + "_" + unit.id : null;
}

function getCurrentWounds(unit = state.selected) {
  const max = getMaxWounds(unit);
  if (!max) return null;
  const key = woundKey(unit);
  const stored = key ? Number(localStorage.getItem(key)) : NaN;
  return Number.isFinite(stored) ? Math.max(0, Math.min(max, stored)) : max;
}

function setCurrentWounds(value, unit = state.selected) {
  const max = getMaxWounds(unit);
  const key = woundKey(unit);
  if (!max || !key) return;
  localStorage.setItem(key, String(Math.max(0, Math.min(max, value))));
}

function adjustWounds(delta) {
  if (!state.selected) return;
  const current = getCurrentWounds();
  if (current == null) {
    toast("No numeric Wounds stat found for this unit.");
    return;
  }
  setCurrentWounds(current + delta);
  renderDetail(state.selected);
}

function resetWounds() {
  if (!state.selected) return;
  const max = getMaxWounds(state.selected);
  if (!max) return;
  setCurrentWounds(max);
  renderDetail(state.selected);
  toast("Wounds reset");
}

function renderWoundTracker(unit) {
  const max = getMaxWounds(unit);
  if (!max) return "";
  const current = getCurrentWounds(unit);

  return `
    <section class="detail-section wound-tracker">
      <div class="section-heading-row">
        <h3>Wounds</h3>
        <span class="section-count">${current}/${max}</span>
      </div>
      <div class="wound-controls">
        <button type="button" class="wound-button" data-wound-change="-1">−</button>
        <div class="wound-value">
          <strong>${current}</strong>
          <span>/ ${max}</span>
        </div>
        <button type="button" class="wound-button" data-wound-change="1">+</button>
        <button type="button" class="ghost-button compact wound-reset">Reset</button>
      </div>
    </section>`;
}

function bindDynamicDetailControls() {
  document.querySelectorAll("[data-status]").forEach(button => {
    button.addEventListener("click", () => toggleStatus(button.dataset.status));
  });
  document.querySelectorAll("[data-phase]").forEach(button => {
    button.addEventListener("click", () => setActivePhase(button.dataset.phase));
  });
  document.querySelectorAll("[data-wound-change]").forEach(button => {
    button.addEventListener("click", () => adjustWounds(Number(button.dataset.woundChange)));
  });
  document.querySelector(".wound-reset")?.addEventListener("click", resetWounds);
}

function toggleFocusMode() {
  document.body.classList.toggle("focus-mode");
  const active = document.body.classList.contains("focus-mode");
  if (els.focusButton) els.focusButton.textContent = active ? "Exit focus" : "Focus";
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
  localStorage.removeItem("tv_active_search_rosters");
  localStorage.removeItem("tv_active_search_scopes");
  hideApp();
  toast("Imported rosters removed");
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
