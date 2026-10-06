const state = {
  rosters: [],
  activeRoster: 0,
  selected: null,
  mode: localStorage.getItem("tv_mode") || "mobile",
  currentPage: "setup",
  listening: false,
  recognition: null,
  referenceData: {rules:[], stratagems:[]},
  detachmentStratagems: [],
  detachmentStratagemLoadKey: "",
  detachmentStratagemLoading: false,
  scoreTurn: Math.min(5, Math.max(1, Number(localStorage.getItem("tv_score_turn") || 1))),
  unitBrowserSourceId: localStorage.getItem("tv_unit_browser_source") || "all",
  lastDiceRoll: null,
  showDiceOrder: false
};

const $ = (id) => document.getElementById(id);
const els = {
  welcome: $("welcome"),
  voiceDock: $("voiceDock"),
  fileInput: $("fileInput"),
  importButton: $("importButton"),
  fullDataButton: $("fullDataButton"),
  clearRoster: $("clearRoster"),
  searchInput: $("searchInput"),
  resultList: $("resultList"),
  rosterTabs: $("rosterTabs"),
  rosterBrowser: $("rosterBrowser"),
  backToRosterButton: $("backToRosterButton"),
  battleShockToggle: $("battleShockToggle"),
  oncePerGameToggle: $("oncePerGameToggle"),
  voiceSearchWrap: $("voiceSearchWrap"),
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
  appNav: $("appNav"),
  navMoreButton: $("navMoreButton"),
  navMoreMenu: $("navMoreMenu"),
  pageDatasheets: $("pageDatasheets"),
  pageScore: $("pageScore"),
  pageDice: $("pageDice"),
  pageStrats: $("pageStrats"),
  pageRules: $("pageRules"),
  pageSetup: $("pageSetup"),
  dataRosterSummary: $("dataRosterSummary"),
  fullDataArmySection: $("fullDataArmySection"),
  datasheetResultsShell: $("datasheetResultsShell"),
  myScoreValue: $("myScoreValue"),
  oppScoreValue: $("oppScoreValue"),
  p1PrimaryTurn: $("p1PrimaryTurn"),
  p1SecondaryTurn: $("p1SecondaryTurn"),
  p2PrimaryTurn: $("p2PrimaryTurn"),
  p2SecondaryTurn: $("p2SecondaryTurn"),
  p1PrimaryTotal: $("p1PrimaryTotal"),
  p1SecondaryTotal: $("p1SecondaryTotal"),
  p2PrimaryTotal: $("p2PrimaryTotal"),
  p2SecondaryTotal: $("p2SecondaryTotal"),
  scoreTurnLabel1: $("scoreTurnLabel1"),
  scoreTurnLabel2: $("scoreTurnLabel2"),
  diceCount: $("diceCount"),
  diceTarget: $("diceTarget"),
  rollDiceButton: $("rollDiceButton"),
  diceSummary: $("diceSummary"),
  diceResults: $("diceResults"),
  diceOrder: $("diceOrder"),
  rerollMissesButton: $("rerollMissesButton"),
  rerollAllButton: $("rerollAllButton"),
  toggleDiceOrderButton: $("toggleDiceOrderButton"),
  stratSearch: $("stratSearch"),
  stratResults: $("stratResults"),
  coreRuleSearch: $("coreRuleSearch"),
  coreRuleResults: $("coreRuleResults"),
  setupChooseArmies: $("setupChooseArmies"),
  resetMatchButton: $("resetMatchButton"),
  toast: $("toast"),
  firstRunModal: $("firstRunModal"),
  firstRunContinue: $("firstRunContinue"),
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
  renderAll();
  renderMatchTools();
  restoreSetupChecks();
  switchPage(state.currentPage, {silent:true});
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js").catch(() => {});
}

function bindEvents() {
  els.importButton?.addEventListener("click", () => els.fileInput.click());
  els.fileInput?.addEventListener("change", handleFiles);
  els.fullDataButton?.addEventListener("click", loadFull40kData);
  els.clearRoster.addEventListener("click", clearRosters);
  els.searchInput.addEventListener("input", () => {
    state.selected = null;
    renderDetail(null);
    renderResults(els.searchInput.value);
  });
  els.modeToggle.addEventListener("click", toggleMode);
  els.focusButton?.addEventListener("click", toggleFocusMode);
  els.backToRosterButton?.addEventListener("click", backToRosterBrowser);
  els.battleShockToggle?.addEventListener("click", () => toggleStatus("Battle-shocked"));
  els.oncePerGameToggle?.addEventListener("click", () => toggleStatus("Once-per-game used"));
  els.pinButton.addEventListener("click", toggleSelectedPin);
  els.cpDown?.addEventListener("click", () => adjustCP(-1));
  els.cpUp?.addEventListener("click", () => adjustCP(1));
  els.turnToggle?.addEventListener("click", toggleTurn);
  document.querySelectorAll("[data-page-target]").forEach(button => {
    button.addEventListener("click", () => switchPage(button.dataset.pageTarget));
  });
  els.navMoreButton?.addEventListener("click", () => {
    const open = els.navMoreMenu?.classList.toggle("hidden") === false;
    els.navMoreButton.setAttribute("aria-expanded", open ? "true" : "false");
  });
  document.addEventListener("click", event => {
    if (!els.navMoreMenu || !els.navMoreButton) return;
    if (!els.navMoreMenu.contains(event.target) && !els.navMoreButton.contains(event.target)) {
      els.navMoreMenu.classList.add("hidden");
      els.navMoreButton.setAttribute("aria-expanded", "false");
    }
  });
  document.querySelectorAll("[data-score-change]").forEach(button => {
    button.addEventListener("click", () => adjustTurnScore(
      Number(button.dataset.scorePlayer),
      button.dataset.scoreType,
      Number(button.dataset.scoreChange)
    ));
  });
  document.querySelectorAll("[data-score-turn]").forEach(button => {
    button.addEventListener("click", () => setScoreTurn(Number(button.dataset.scoreTurn)));
  });
  document.querySelectorAll("[data-dice-count]").forEach(button => {
    button.addEventListener("click", () => rollDice(
      Number(button.dataset.diceCount),
      Number(els.diceTarget?.value || 0) || null
    ));
  });
  els.rollDiceButton?.addEventListener("click", () => rollDice(
    Number(els.diceCount?.value || 1),
    Number(els.diceTarget?.value || 0) || null
  ));
  els.rerollMissesButton?.addEventListener("click", rerollMisses);
  els.rerollAllButton?.addEventListener("click", rerollEverything);
  els.toggleDiceOrderButton?.addEventListener("click", toggleDiceOrder);
  els.stratSearch?.addEventListener("input", () => renderStratagems(els.stratSearch.value));
  els.coreRuleSearch?.addEventListener("input", () => renderCoreRules(els.coreRuleSearch.value));
  els.setupChooseArmies?.addEventListener("click", openArmyPicker);
  els.resetMatchButton?.addEventListener("click", resetMatchState);
  document.querySelectorAll("[data-setup-check]").forEach(input => {
    input.addEventListener("change", persistSetupChecks);
  });
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
  els.firstRunContinue?.addEventListener("click", () => {
    dismissFirstRun();
    switchPage("setup");
  });
  els.voiceShortlistClose?.addEventListener("click", closeVoiceShortlist);
  els.voiceShortlistModal?.addEventListener("click", event => {
    if (event.target === els.voiceShortlistModal) closeVoiceShortlist();
  });
  if (els.talkButton) {
    ["pointerdown", "touchstart"].forEach(evt => els.talkButton.addEventListener(evt, startListening, {passive:false}));
    ["pointerup", "pointercancel", "pointerleave", "touchend"].forEach(evt => els.talkButton.addEventListener(evt, stopListening, {passive:false}));
  }
}

function showFirstRunIfNeeded() {
  if (!els.firstRunModal) return;
  const seen = localStorage.getItem("tv_beta_notice_seen_v1") === "1";
  if (!seen) els.firstRunModal.classList.remove("hidden");
}

function dismissFirstRun() {
  localStorage.setItem("tv_beta_notice_seen_v1", "1");
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
      state.detachmentStratagemLoadKey = "";
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

function extractSelectedDetachments(root) {
  const found = [];

  for (const force of root?.forces || []) {
    const faction = force.catalogueName || force.name || "";

    function walk(value) {
      if (!value || typeof value !== "object") return;
      if (Array.isArray(value)) {
        value.forEach(walk);
        return;
      }

      const count = Number(value.number);
      const selected = !Number.isFinite(count) || count > 0;
      const group = String(value.group || value.entryGroupName || "");

      if (
        selected &&
        /detachment/i.test(group) &&
        value.name &&
        !/^detachment$/i.test(String(value.name).trim())
      ) {
        found.push({
          name:String(value.name).trim(),
          faction
        });
      }

      for (const child of value.selections || []) walk(child);
    }

    walk(force.selections || []);
  }

  return dedupeBy(found, item => normalize(item.faction + "|" + item.name));
}

function parseRosterFile(text, fileName) {
  let raw;
  try { raw = JSON.parse(text); }
  catch { throw new Error("New Recruit JSON export expected."); }

  if (!raw?.roster) {
    throw new Error("This does not look like a New Recruit list JSON export.");
  }

  const root = raw.roster;
  const units = [];
  for (const force of root.forces || []) {
    for (const selection of force.selections || []) {
      const unit = parseNewRecruitSelection(selection);
      if (unit) units.push(unit);
    }
  }

  if (!units.length) throw new Error("No units were found in this New Recruit list.");

  const pts = (root.costs || []).find(c => String(c.name).toLowerCase() === "pts")?.value;
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
    name: root.name || fileName.replace(/\.[^.]+$/, ""),
    faction: (root.forces || [])[0]?.catalogueName || (root.forces || [])[0]?.name || "New Recruit list",
    source: "new-recruit",
    points: pts ?? null,
    detachments: extractSelectedDetachments(root),
    units: dedupeBy(units, u => u.id || u.name),
    referenceData: extractReferenceData(root, fileName),
    importedAt: Date.now()
  };
}

function collectSelectionCategories(node) {
  const names = [];

  function walk(value) {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }

    for (const category of value.categories || []) {
      const name = String(category?.name || "").trim();
      if (name) names.push(name);
    }

    for (const category of value.categoryLinks || []) {
      const name = String(category?.name || "").trim();
      if (name) names.push(name);
    }

    for (const child of value.selections || []) walk(child);
  }

  walk(node);
  return dedupeBy(names, value => normalize(value));
}

function collectBSDataCategories(node) {
  const names = [];

  function walk(value) {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }

    for (const category of value.categoryLinks || []) {
      const name = String(category?.name || "").trim();
      if (name) names.push(name);
    }

    for (const child of value.selectionEntries || []) walk(child);
    for (const child of value.selectionEntryGroups || []) walk(child);
  }

  walk(node);
  return dedupeBy(names, value => normalize(value));
}

function parseNewRecruitSelection(selection) {
  const allProfiles = collectProfiles(selection);
  const unitProfiles = allProfiles.filter(p => p?.typeName === "Unit");
  if (!unitProfiles.length) return null;

  const primaryUnitProfile =
    unitProfiles.find(p => normalize(p.name) === normalize(selection.name)) ||
    unitProfiles[0];

  const weapons = mergeWeaponProfiles(
    collectWeaponProfiles(selection).map(({profile, quantity}) => ({
      ...profileToDisplay(profile),
      quantity
    }))
  );

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
  const categories = collectSelectionCategories(selection);

  return {
    id: selection.id || primaryUnitProfile.id || name,
    name,
    type: "Unit",
    categories,
    stats,
    rules: abilities,
    profiles: weapons,
    searchText: normalize([
      name,
      primaryUnitProfile.name,
      weapons.map(w => w.name),
      abilities.map(a => a.name)
    ].flat().join(" "))
  };
}

function collectWeaponProfiles(node) {
  const found = [];

  function walk(value, inheritedQuantity = 1) {
    if (!value || typeof value !== "object") return;

    if (Array.isArray(value)) {
      value.forEach(item => walk(item, inheritedQuantity));
      return;
    }

    const rawNumber = Number(value.number);
    if (Number.isFinite(rawNumber) && rawNumber <= 0) return;

    const quantity = Number.isFinite(rawNumber) && rawNumber > 0
      ? rawNumber
      : inheritedQuantity;

    if (Array.isArray(value.profiles)) {
      value.profiles.forEach(profile => {
        if (!profile || typeof profile !== "object") return;
        if (profile.typeName === "Ranged Weapons" || profile.typeName === "Melee Weapons") {
          found.push({profile, quantity: Math.max(1, quantity || 1)});
        }
      });
    }

    if (Array.isArray(value.selections)) {
      value.selections.forEach(child => walk(child, quantity));
    }
  }

  walk(node, 1);
  return found;
}

function mergeWeaponProfiles(profiles) {
  const merged = new Map();

  for (const profile of profiles || []) {
    const key = normalize(
      (profile.type || "") + "|" +
      (profile.name || "") + "|" +
      JSON.stringify(profile.values || [])
    );

    if (!merged.has(key)) {
      merged.set(key, {...profile, quantity: Number(profile.quantity) || 1});
    } else {
      const existing = merged.get(key);
      existing.quantity += Number(profile.quantity) || 1;
    }
  }

  return [...merged.values()];
}

function collectProfiles(node) {
  const found = [];
  function walk(value) {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }
    if (Number.isFinite(Number(value.number)) && Number(value.number) <= 0) return;
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
    if (Number.isFinite(Number(value.number)) && Number(value.number) <= 0) return;
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

const CORE_STRATAGEM_QUICKREF = [
  {name:"Command Re-Roll", category:"Core stratagem", text:"Any phase, just after making an eligible roll for a friendly unit or model: re-roll that roll."},
  {name:"Epic Challenge", category:"Core stratagem", text:"Fight phase, after a friendly Character is selected to fight: one Character model's melee weapons gain Precision for the phase."},
  {name:"Insane Bravery", category:"Core stratagem", text:"Command phase, before a Battle-shock roll: that roll automatically succeeds. Once per battle."},
  {name:"Explosives", category:"Core stratagem", text:"Your Shooting phase: an eligible Explosives/Grenades unit can attempt to inflict mortal wounds on a nearby visible enemy."},
  {name:"Crushing Impact", category:"Core stratagem", text:"Your Charge phase after a Monster/Vehicle charges: roll against an engaged enemy to inflict mortal wounds, with some risk to your own unit."},
  {name:"Rapid Ingress", category:"Core stratagem", text:"End of the opponent's Movement phase: an eligible unit in Strategic Reserves can make an ingress move."},
  {name:"Fire Overwatch", category:"Core stratagem", text:"End of the opponent's Movement phase: an eligible unit can shoot using the Snap Shooting rules."},
  {name:"Smokescreen", category:"Core stratagem", text:"Start of the opponent's Shooting phase: a friendly Smoke unit can help itself or obscured units gain the benefit of cover."},
  {name:"Heroic Intervention", category:"Core stratagem", text:"End of the opponent's Charge phase: an eligible friendly unit can make a restricted charge."},
  {name:"Counteroffensive", category:"Core stratagem", text:"Opponent's Fight phase, after an enemy resolves attacks: an eligible friendly unit gains Fights First and must fight next."}
];

const CORE_RULE_QUICKREF = [
  {name:"Hit Roll", category:"Making attacks", text:"Roll one D6 per attack. An unmodified 1 fails; an unmodified 6 is a Critical Hit; otherwise compare the roll with the weapon's BS or WS."},
  {name:"Wound Roll", category:"Making attacks", text:"Compare Strength to Toughness: 2+ at double or more, 3+ if greater, 4+ if equal, 5+ if lower, 6+ at half or less."},
  {name:"Saving Throw", category:"Making attacks", text:"The defending player makes a save for each successful wound, modified by the attacking weapon's AP as applicable."},
  {name:"Battle-shock", category:"Command phase", text:"Battle-shocked units have reduced battlefield effectiveness, including losing normal Objective Control and restrictions on stratagems/actions."},
  {name:"Command Phase", category:"Battle round", text:"Start the turn, gain Command Points as applicable, resolve Battle-shock and Command abilities, then continue to Movement."},
  {name:"Movement Phase", category:"Battle round", text:"Move eligible units, resolve Reinforcements or ingress effects, then finish the phase."},
  {name:"Shooting Phase", category:"Battle round", text:"Select eligible units to shoot, choose targets and resolve attacks."},
  {name:"Charge Phase", category:"Battle round", text:"Eligible units can declare charges, make charge rolls and complete charge moves."},
  {name:"Fight Phase", category:"Battle round", text:"Eligible units fight in the appropriate order, resolving melee attacks and related moves."},
  {name:"Strategic Reserves", category:"Reserves", text:"Units placed in Strategic Reserves can arrive later subject to the battle round and positioning restrictions that apply."},
  {name:"Deep Strike", category:"Core ability", text:"A unit with Deep Strike can be set up in Reserves and later arrive using the distance restrictions in the rule."},
  {name:"Cover", category:"Terrain", text:"The Benefit of Cover improves a model's protection against eligible ranged attacks according to the core terrain rules."}
];

function extractReferenceData(root, sourceName = "Imported roster") {
  const rules = [];
  const stratagems = [];
  const seenRules = new Set();
  const seenStrats = new Set();

  function addRule(name, text, category = "Rule") {
    const cleanName = cleanRuleText(name || "").trim();
    const cleanText = cleanRuleText(text || "").trim();
    if (!cleanName || !cleanText) return;
    const key = normalize(cleanName + "|" + cleanText);
    if (seenRules.has(key)) return;
    seenRules.add(key);
    rules.push({name:cleanName, text:cleanText, category, source:sourceName});
  }

  function addStrat(name, text, category = "Stratagem") {
    const cleanName = cleanRuleText(name || "").trim();
    const cleanText = cleanRuleText(text || "").trim();
    if (!cleanName || !cleanText) return;
    const key = normalize(cleanName + "|" + cleanText);
    if (seenStrats.has(key)) return;
    seenStrats.add(key);
    stratagems.push({name:cleanName, text:cleanText, category, source:sourceName});
  }

  function walk(value) {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }

    for (const rule of value.rules || []) {
      if (!rule || rule.hidden) continue;
      addRule(rule.name, rule.description, "Rule");
    }

    for (const profile of value.profiles || []) {
      if (!profile || profile.hidden) continue;
      const type = String(profile.typeName || "");
      const text = (profile.characteristics || [])
        .map(c => {
          const val = characteristicValue(c);
          return val ? (c.name && c.name !== "Description" ? c.name + ": " : "") + val : "";
        })
        .filter(Boolean)
        .join("\n");

      if (/stratagem/i.test(type)) addStrat(profile.name, text, type);
      else if (/rule|ability/i.test(type) && text) addRule(profile.name, text, type);
    }

    for (const child of Object.values(value)) {
      if (child && typeof child === "object") walk(child);
    }
  }

  walk(root);
  return {rules, stratagems};
}

function buildReferenceData(documents) {
  const combined = {rules:[], stratagems:[]};
  const ruleSeen = new Set();
  const stratSeen = new Set();

  for (const doc of documents || []) {
    const extracted = extractReferenceData(doc.data, doc.name);
    for (const rule of extracted.rules) {
      if (doc.name === "Warhammer 40,000.json") {
        const key = normalize(rule.name + "|" + rule.text);
        if (!ruleSeen.has(key)) {
          ruleSeen.add(key);
          combined.rules.push(rule);
        }
      }
    }
    for (const strat of extracted.stratagems) {
      const key = normalize(strat.name + "|" + strat.text);
      if (!stratSeen.has(key)) {
        stratSeen.add(key);
        combined.stratagems.push(strat);
      }
    }
  }

  return combined;
}

const GDC_11E_RAW = "https://raw.githubusercontent.com/game-datacards/datasources/refs/heads/main/11th/gdc/";
const gdcFactionCache = new Map();

function englishText(value) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") return value.en || Object.values(value).find(item => typeof item === "string") || "";
  return "";
}

function getImportedDetachmentRequests() {
  const requests = [];

  for (const roster of state.rosters) {
    if (roster.source !== "new-recruit") continue;

    for (const detachment of roster.detachments || []) {
      requests.push({
        name:detachment.name,
        faction:detachment.faction || roster.faction || "",
        rosterName:roster.name
      });
    }
  }

  return dedupeBy(requests, item => normalize(item.faction + "|" + item.name));
}

function gdcFactionSlugCandidates(factionName = "") {
  const parts = String(factionName)
    .split(/\s+-\s+/)
    .map(part => part.trim())
    .filter(Boolean);

  const leaf = parts.at(-1) || String(factionName).trim();
  const normal = normalize(leaf);
  const compact = normal.replace(/\s+/g, "");

  const aliases = {
    "adeptus astartes":"spacemarines",
    "space marines":"spacemarines",
    "adeptus custodes":"adeptuscustodes",
    "adepta sororitas":"adeptasororitas",
    "sisters of battle":"adeptasororitas",
    "adeptus mechanicus":"adeptusmechanicus",
    "astra militarum":"astramilitarum",
    "imperial guard":"astramilitarum",
    "chaos space marines":"chaosspacemarines",
    "genestealer cults":"genestealercults",
    "leagues of votann":"votann",
    "tau empire":"tau",
    "t au empire":"tau",
    "world eaters":"worldeaters",
    "thousand sons":"thousandsons",
    "death guard":"deathguard",
    "emperors children":"emperorschildren",
    "emperor s children":"emperorschildren",
    "grey knights":"greyknights",
    "imperial knights":"imperialknights",
    "chaos knights":"chaosknights",
    "black templars":"blacktemplars",
    "blood angels":"bloodangels",
    "dark angels":"darkangels",
    "space wolves":"spacewolves",
    "craftworlds":"aeldari",
    "asuryani":"aeldari"
  };

  const candidates = [
    aliases[normal],
    compact,
    normalize(String(factionName)).replace(/\s+/g, "")
  ].filter(Boolean);

  return [...new Set(candidates)];
}

async function fetchGdcFactionData(factionName, wantedDetachments = []) {
  const cacheKey = normalize(factionName);
  const cached = gdcFactionCache.get(cacheKey);
  if (cached) return cached;

  const wanted = new Set(wantedDetachments.map(name => normalize(name)));

  for (const slug of gdcFactionSlugCandidates(factionName)) {
    try {
      const response = await fetch(GDC_11E_RAW + encodeURIComponent(slug) + ".json");
      if (!response.ok) continue;

      const data = await response.json();
      const availableNames = new Set([
        ...(data.detachments || []).map(item => normalize(englishText(item.name))),
        ...(data.stratagems || []).map(item => normalize(englishText(item.detachment || item.detachment_name)))
      ].filter(Boolean));

      if (wanted.size && ![...wanted].some(name => availableNames.has(name))) continue;

      gdcFactionCache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.warn("Could not load detachment reference", slug, error);
    }
  }

  gdcFactionCache.set(cacheKey, null);
  return null;
}

function detachmentStratagemToReference(stratagem, request) {
  const name = englishText(stratagem.name) || "Stratagem";
  const when = englishText(stratagem.when);
  const target = englishText(stratagem.target);
  const effect = englishText(stratagem.effect);
  const restrictions = englishText(stratagem.restrictions || stratagem.restriction);

  const text = [
    when ? "WHEN: " + when : "",
    target ? "TARGET: " + target : "",
    effect ? "EFFECT: " + effect : "",
    restrictions ? "RESTRICTIONS: " + restrictions : ""
  ].filter(Boolean).join("\n");

  const cost = stratagem.cost != null ? stratagem.cost + "CP" : "";
  const type = englishText(stratagem.type) || stratagem.type || "";
  const category = [request.name, cost, type].filter(Boolean).join(" · ");

  return {
    name,
    text,
    category,
    detachment:request.name,
    rosterName:request.rosterName,
    source:"Game Datacards 11e"
  };
}

async function ensureDetachmentStratagems() {
  const requests = getImportedDetachmentRequests();
  const key = requests
    .map(item => normalize(item.faction + "|" + item.name))
    .sort()
    .join("::");

  if (key === state.detachmentStratagemLoadKey || state.detachmentStratagemLoading) return;

  state.detachmentStratagemLoadKey = key;
  state.detachmentStratagemLoading = true;
  state.detachmentStratagems = [];

  if (!requests.length) {
    state.detachmentStratagemLoading = false;
    return;
  }

  const byFaction = new Map();
  for (const request of requests) {
    const key = normalize(request.faction);
    if (!byFaction.has(key)) byFaction.set(key, []);
    byFaction.get(key).push(request);
  }

  const collected = [];

  for (const factionRequests of byFaction.values()) {
    const faction = factionRequests[0]?.faction || "";
    const data = await fetchGdcFactionData(faction, factionRequests.map(item => item.name));
    if (!data) continue;

    for (const request of factionRequests) {
      const detachmentName = normalize(request.name);
      const detachment = (data.detachments || []).find(item =>
        normalize(englishText(item.name)) === detachmentName
      );

      const matches = (data.stratagems || []).filter(stratagem => {
        const nameMatch = normalize(englishText(stratagem.detachment || stratagem.detachment_name)) === detachmentName;
        const idMatch = detachment?.id && stratagem.detachment_id === detachment.id;
        return nameMatch || idMatch;
      });

      for (const stratagem of matches) {
        collected.push(detachmentStratagemToReference(stratagem, request));
      }
    }
  }

  state.detachmentStratagems = dedupeBy(
    collected,
    item => normalize(item.detachment + "|" + item.name + "|" + item.text)
  );
  state.detachmentStratagemLoading = false;

  if (state.currentPage === "strats") {
    renderStratagems(els.stratSearch?.value || "");
  }
}

function renderDetachmentSummary() {
  const requests = getImportedDetachmentRequests();
  const importedLists = state.rosters.filter(roster => roster.source === "new-recruit");

  if (!requests.length) {
    if (importedLists.some(roster => !Array.isArray(roster.detachments))) {
      return '<div class="detachment-summary"><small class="detachment-loading">Re-import older New Recruit lists once to load their detachment stratagems.</small></div>';
    }
    return "";
  }

  return `
    <div class="detachment-summary">
      <span class="detachment-summary-label">IMPORTED DETACHMENTS</span>
      <div class="detachment-summary-chips">
        ${requests.map(item => `
          <span class="detachment-summary-chip">
            <strong>${escapeHtml(item.name)}</strong>
            <small>${escapeHtml(item.rosterName)}</small>
          </span>`).join("")}
      </div>
      ${state.detachmentStratagemLoading ? '<small class="detachment-loading">Loading detachment stratagems…</small>' : ""}
    </div>`;
}

function getCombinedReferenceData() {
  const rules = [...CORE_RULE_QUICKREF];
  const stratagems = [...CORE_STRATAGEM_QUICKREF];
  const seenRules = new Set(rules.map(item => normalize(item.name + "|" + item.text)));
  const seenStrats = new Set(stratagems.map(item => normalize(item.name + "|" + item.text)));

  const sources = [
    {data:state.referenceData, coreOnly:false},
    ...state.rosters
      .filter(r => r.referenceData)
      .map(r => ({data:r.referenceData, coreOnly:r.source === "new-recruit"}))
  ];

  for (const source of sources) {
    for (const rule of source.data?.rules || []) {
      if (source.coreOnly && !isCoreRule(rule)) continue;
      const key = normalize(rule.name + "|" + rule.text);
      if (!seenRules.has(key)) {
        seenRules.add(key);
        rules.push(rule);
      }
    }
    for (const strat of source.data?.stratagems || []) {
      const key = normalize(strat.name + "|" + strat.text);
      if (!seenStrats.has(key)) {
        seenStrats.add(key);
        stratagems.push(strat);
      }
    }
  }

  return {rules, stratagems};
}

function renderReferenceCards(items, container, query = "") {
  if (!container) return;
  const q = normalize(query);
  const filtered = (items || [])
    .filter(item => !q || normalize(item.name + " " + item.text + " " + (item.category || "")).includes(q))
    .slice(0, 80);

  container.innerHTML = filtered.length
    ? filtered.map(item => `
        <article class="reference-card">
          <div class="reference-card-heading">
            <h3>${escapeHtml(item.name)}</h3>
            ${item.category ? `<span>${escapeHtml(item.category)}</span>` : ""}
          </div>
          <div class="reference-card-text">${formatRuleText(item.text)}</div>
        </article>`).join("")
    : '<div class="empty-section">No matching reference found.</div>';
}

function renderStratagems(query = "", options = {}) {
  if (!els.stratResults) return;

  const data = getCombinedReferenceData();
  const combined = dedupeBy(
    [...state.detachmentStratagems, ...data.stratagems],
    item => normalize((item.detachment || "") + "|" + item.name + "|" + item.text)
  );

  const scratch = document.createElement("div");
  renderReferenceCards(combined, scratch, query);

  els.stratResults.innerHTML =
    renderDetachmentSummary() +
    scratch.innerHTML;

  if (!options.skipLoad) ensureDetachmentStratagems();
}

function renderCoreRules(query = "") {
  const data = getCombinedReferenceData();
  renderReferenceCards(data.rules, els.coreRuleResults, query);
}

const BSDATA_REPO = "BSData/wh40k-11e";
const BSDATA_BRANCH = "main";
const BSDATA_API = "https://api.github.com/repos/" + BSDATA_REPO + "/contents?ref=" + BSDATA_BRANCH;
const BSDATA_RAW = "https://raw.githubusercontent.com/" + BSDATA_REPO + "/refs/heads/" + BSDATA_BRANCH + "/";

async function loadFull40kData() {
  if (state.fullDataLoading) return;
  state.fullDataLoading = true;
  setFullDataButtons(true, "Importing armies…");
  toast("Importing all armies…");

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
    state.referenceData = buildReferenceData(documents);
    const roster = buildFull40kRoster(documents);
    roster.referenceData = state.referenceData;

    if (!roster.units.length) throw new Error("The army data downloaded but no unit entries could be resolved.");

    const oldIndex = state.rosters.findIndex(r => r.id === "bsdata-full-40k");
    if (oldIndex >= 0) state.rosters.splice(oldIndex, 1);

    state.rosters.push(roster);
    state.activeRoster = state.rosters.length - 1;
    state.selected = null;
    els.searchInput.value = "";
    persist();
    renderAll();
    renderDetail(null);
    toast("Imported " + roster.units.length + " datasheet entries");
    setTimeout(openArmyPicker, 150);
  } catch (error) {
    console.error(error);
    toast(error.message || "Could not import all armies.");
  } finally {
    state.fullDataLoading = false;
    setFullDataButtons(false, state.rosters.some(r => r.source === "bsdata") ? "Refresh all armies" : "Import all armies");
  }
}

function setFullDataButtons(disabled, label) {
  [els.fullDataButton].filter(Boolean).forEach(button => {
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
        categories:[],
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
  const categories = collectBSDataCategories(node);

  return {
    id:"bsdata-" + (node.id || link.id || normalize(displayName)),
    name:displayName || unitProfile?.name || node.name || "Unit",
    type:"Unit",
    source:sourceName,
    categories,
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

function setVoicePrompt(page = state.currentPage) {
  if (!els.voiceHint) return;

  const prompts = {
    datasheets: "Say a unit name, e.g. “Death Korps of Krieg”",
    score: "T" + state.scoreTurn + ": say “Player 1 add 5 primary”",
    dice: "Say “Roll 60 dice hitting on 4 plus”",
    strats: "Say a stratagem name",
    rules: "Say a core rule"
  };

  els.voiceHint.textContent = prompts[page] || "Hold to talk";
}

function switchPage(page, options = {}) {
  const valid = ["setup","datasheets","score","dice","strats","rules","guide"];
  if (!valid.includes(page)) page = "setup";

  state.currentPage = page;
  localStorage.setItem("tv_page", page);

  document.querySelectorAll(".app-page").forEach(section => {
    section.classList.toggle("hidden", section.dataset.page !== page);
  });

  document.querySelectorAll("[data-page-target]").forEach(button => {
    button.classList.toggle("active", button.dataset.pageTarget === page);
  });
  els.navMoreButton?.classList.toggle("active", page === "guide");

  els.navMoreMenu?.classList.add("hidden");
  els.navMoreButton?.setAttribute("aria-expanded", "false");

  if (page === "strats") renderStratagems(els.stratSearch?.value || "");
  if (page === "rules") renderCoreRules(els.coreRuleSearch?.value || "");
  if (page === "setup") renderDataSummary();
  if (page === "score") renderScoreboard();
  if (page === "dice") renderDiceState();
  if (page === "datasheets") {
    renderTabs();
    renderQuickLists();
    updateRosterBrowserVisibility();
  }

  const voiceEnabled = ["datasheets","score","dice","strats","rules"].includes(page);
  els.voiceDock?.classList.toggle("hidden", !voiceEnabled);
  els.voiceSearchWrap?.classList.toggle("hidden", page !== "datasheets");
  setVoicePrompt(page);

  if (!options.silent) window.scrollTo({top:0, behavior:"smooth"});
}

function showApp() {
  const voiceEnabled = ["datasheets","score","dice","strats","rules"].includes(state.currentPage);
  els.voiceDock?.classList.toggle("hidden", !voiceEnabled);
}

function hideApp() {
  switchPage("setup", {silent:true});
}

function renderDataSummary() {
  const importedLists = state.rosters.filter(roster => roster.source === "new-recruit");
  const hasFullData = state.rosters.some(roster => roster.source === "bsdata");

  els.fullDataArmySection?.classList.toggle("hidden", !hasFullData);

  if (els.fullDataButton) {
    els.fullDataButton.textContent = hasFullData ? "Refresh all armies" : "Import all armies";
  }

  if (!els.dataRosterSummary) return;

  if (!importedLists.length) {
    els.dataRosterSummary.innerHTML = '<p class="muted-copy">No New Recruit lists loaded yet.</p>';
    return;
  }

  els.dataRosterSummary.innerHTML = importedLists.map(roster => `
    <div class="data-summary-row">
      <div>
        <strong>${escapeHtml(roster.name)}</strong>
        <small>New Recruit list · ${roster.units?.length || 0} units${roster.points != null ? " · " + escapeHtml(roster.points) + " pts" : ""}</small>
      </div>
    </div>`).join("");
}

function renderAll() {
  showApp();
  renderActiveArmySelector();
  renderArmyPicker();
  renderDataSummary();
  renderTabs();
  renderQuickLists();

  const roster = state.rosters[state.activeRoster];
  if (roster && els.rosterTitle) els.rosterTitle.textContent = roster.name;

  if (!roster) {
    if (els.rosterTitle) els.rosterTitle.textContent = "No data loaded";
    if (els.resultList) els.resultList.innerHTML = "";
    els.datasheetResultsShell?.classList.add("hidden");
    renderDetail(null);
  } else if (normalize(els.searchInput?.value || "")) {
    renderResults(els.searchInput.value);
  } else {
    els.datasheetResultsShell?.classList.add("hidden");
    updateRosterBrowserVisibility();
  }

  renderStratagems(els.stratSearch?.value || "");
  renderCoreRules(els.coreRuleSearch?.value || "");
}

function getAvailableSearchScopes() {
  const scopes = [];

  state.rosters.forEach((roster, rosterIndex) => {
    if (roster.source !== "bsdata") return;

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
          subLabel:"All-armies dataset",
          roster,
          rosterIndex,
          units:[]
        });
      }
      groups.get(id).units.push(unit);
    }

    scopes.push(...[...groups.values()].sort((a,b) => a.label.localeCompare(b.label)));
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
  } catch {}

  return [];
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
  if (!roster || roster.source !== "bsdata") return;
  const existing = new Set(getActiveSearchScopeIds());
  const sources = new Set((roster.units || []).map(unit => unit.armyId || armyIdFromSource(unit.source || "")));
  sources.forEach(id => existing.add(id));
  setActiveSearchScopeIds([...existing]);
}

function getSearchCollections() {
  const collections = [];

  state.rosters.forEach((roster, rosterIndex) => {
    if (roster.source === "new-recruit") {
      collections.push({
        id:"roster:" + roster.id,
        label:roster.name,
        subLabel:roster.faction || "New Recruit list",
        roster,
        rosterIndex,
        units:roster.units || []
      });
    }
  });

  const active = new Set(getActiveSearchScopeIds());
  collections.push(...getAvailableSearchScopes().filter(scope => active.has(scope.id)));
  return collections;
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
    els.armyPickerList.innerHTML = '<p class="army-picker-empty">Import all armies first, then choose which factions should be searched.</p>';
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
          <small>${scope.units.length} entries</small>
        </span>
      </label>`;
  }).join("");

  els.armyPickerList.querySelectorAll("[data-army-scope-id]").forEach(input => {
    input.addEventListener("change", () => {
      setSearchScopeActive(input.dataset.armyScopeId, input.checked);
      renderArmyPicker();
      renderActiveArmySelector();
      renderTabs();
      renderQuickLists();
      updateRosterBrowserVisibility();
      renderResults(els.searchInput?.value || "");
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
      ? activeScopes.length + " of " + scopes.length + " all-armies factions included in datasheet search"
      : "No all-armies factions selected";
  }

  if (!scopes.length) {
    els.activeArmySelector.innerHTML = "";
    return;
  }

  if (!activeScopes.length) {
    els.activeArmySelector.innerHTML = '<button class="active-army-empty-button" type="button">No armies selected — choose armies</button>';
    els.activeArmySelector.querySelector("button")?.addEventListener("click", openArmyPicker);
    return;
  }

  const visible = activeScopes.slice(0, 5);
  const extra = activeScopes.length - visible.length;

  els.activeArmySelector.innerHTML =
    visible.map(scope => `<span class="active-army-chip">${escapeHtml(scope.label)}</span>`).join("") +
    (extra > 0 ? `<button class="active-army-more" type="button">+${extra} more</button>` : "");

  els.activeArmySelector.querySelector(".active-army-more")?.addEventListener("click", openArmyPicker);
}

function getImportedRosterEntries() {
  return state.rosters
    .map((roster, index) => ({roster, index}))
    .filter(item => item.roster.source === "new-recruit");
}

function getUnitBrowserSources() {
  const sources = [];

  for (const {roster, index} of getImportedRosterEntries()) {
    sources.push({
      id:"roster:" + roster.id,
      label:roster.name,
      subLabel:(roster.points != null ? roster.points + " pts · " : "") + "New Recruit",
      kind:"new-recruit",
      entries:(roster.units || []).map(unit => ({
        unit,
        rosterIndex:index,
        sourceLabel:roster.name,
        sourceKind:"new-recruit"
      }))
    });
  }

  const activeScopes = new Set(getActiveSearchScopeIds());
  for (const scope of getAvailableSearchScopes()) {
    if (!activeScopes.has(scope.id)) continue;

    sources.push({
      id:"army:" + scope.id,
      label:scope.label,
      subLabel:"Whole army",
      kind:"whole-army",
      entries:(scope.units || []).map(unit => ({
        unit,
        rosterIndex:scope.rosterIndex,
        sourceLabel:scope.label,
        sourceKind:"whole-army"
      }))
    });
  }

  if (!sources.length) return [];

  const allEntries = [];
  const seen = new Set();

  // Prefer New Recruit versions where a unit exists in both a list and a whole-army source.
  const sourceRank = source => source.kind === "new-recruit" ? 0 : 1;
  for (const source of [...sources].sort((a,b) => sourceRank(a) - sourceRank(b))) {
    for (const entry of source.entries) {
      const key = normalize(entry.unit.name);
      if (seen.has(key)) continue;
      seen.add(key);
      allEntries.push(entry);
    }
  }

  return [{
    id:"all",
    label:"All data",
    subLabel:allEntries.length + " units",
    kind:"all",
    entries:allEntries
  }, ...sources];
}

function getActiveUnitBrowserSource() {
  const sources = getUnitBrowserSources();
  if (!sources.length) return null;

  let source = sources.find(item => item.id === state.unitBrowserSourceId);
  if (!source) {
    source = sources[0];
    state.unitBrowserSourceId = source.id;
    localStorage.setItem("tv_unit_browser_source", source.id);
  }
  return source;
}

function setUnitBrowserSource(sourceId) {
  const source = getUnitBrowserSources().find(item => item.id === sourceId);
  if (!source) return;

  state.unitBrowserSourceId = source.id;
  localStorage.setItem("tv_unit_browser_source", source.id);
  state.selected = null;

  if (source.kind === "new-recruit" && source.entries[0]) {
    state.activeRoster = source.entries[0].rosterIndex;
  } else if (source.kind === "whole-army" && source.entries[0]) {
    state.activeRoster = source.entries[0].rosterIndex;
  }

  if (els.searchInput) els.searchInput.value = "";
  els.datasheetResultsShell?.classList.add("hidden");
  renderDetail(null);
  renderTabs();
  renderQuickLists();
  updateRosterBrowserVisibility();
  persist();
}

function getUnitBrowserGroup(unit) {
  const categories = new Set((unit.categories || []).map(category => normalize(category)));

  if (categories.has("character") || categories.has("epic hero")) return "Characters";
  if (categories.has("battleline")) return "Battleline";
  if (categories.has("dedicated transport")) return "Transports";
  if (categories.has("vehicle")) return "Vehicles";
  if (categories.has("monster")) return "Monsters";
  if (
    categories.has("mounted") ||
    categories.has("beast") ||
    categories.has("swarm") ||
    categories.has("drone") ||
    categories.has("aircraft") ||
    categories.has("cavalry")
  ) return "Fast / Mounted";
  if (categories.has("infantry")) return "Infantry";
  if (categories.has("fortification")) return "Fortifications";
  return "Other units";
}

function updateRosterBrowserVisibility() {
  if (!els.rosterBrowser) return;
  const hasSources = getUnitBrowserSources().length > 0;
  const show =
    state.currentPage === "datasheets" &&
    hasSources &&
    !state.selected &&
    !normalize(els.searchInput?.value || "");

  els.rosterBrowser.classList.toggle("hidden", !show);
}

function renderTabs() {
  if (!els.rosterTabs) return;

  const sources = getUnitBrowserSources();
  els.rosterTabs.innerHTML = "";

  if (!sources.length) {
    updateRosterBrowserVisibility();
    return;
  }

  const active = getActiveUnitBrowserSource();

  for (const source of sources) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "roster-tab" + (source.id === active?.id ? " active" : "");
    button.innerHTML = `
      <strong>${escapeHtml(source.label)}</strong>
      <small>${escapeHtml(source.subLabel || "")}</small>`;
    button.addEventListener("click", () => setUnitBrowserSource(source.id));
    els.rosterTabs.appendChild(button);
  }

  updateRosterBrowserVisibility();
}

function renderResults(query = "") {
  const q = normalize(query);

  if (!q) {
    if (els.resultList) els.resultList.innerHTML = "";
    els.datasheetResultsShell?.classList.add("hidden");
    renderDetail(null);
    updateRosterBrowserVisibility();
    return;
  }

  els.rosterBrowser?.classList.add("hidden");
  const collections = getSearchCollections();
  const results = [];

  for (const collection of collections) {
    for (const unit of collection.units || []) {
      const score = scoreMatch(unit, q);
      if (score > 0) results.push({
        unit,
        roster:collection.roster,
        rosterIndex:collection.rosterIndex,
        scopeLabel:collection.label,
        score
      });
    }
  }

  results.sort((a,b) => b.score - a.score || a.unit.name.localeCompare(b.unit.name));
  els.datasheetResultsShell?.classList.remove("hidden");
  if (!els.resultList) return;

  els.resultList.innerHTML = "";
  results.slice(0, 80).forEach(result => {
    const {unit, rosterIndex, scopeLabel} = result;
    const button = document.createElement("button");
    button.className = "result-item" + (state.selected?.id === unit.id && state.activeRoster === rosterIndex ? " active" : "");
    button.innerHTML = `
      <strong>${escapeHtml(unit.name)}</strong>
      <small>${escapeHtml(unit.type || "Unit")} · <span class="result-roster">${escapeHtml(scopeLabel)}</span></small>`;
    button.addEventListener("click", () => selectUnitFromRoster(unit, rosterIndex));
    els.resultList.appendChild(button);
  });

  if (!results.length) {
    els.resultList.innerHTML = collections.length
      ? '<div class="result-item"><small>No matching datasheets in the selected armies.</small></div>'
      : '<div class="result-item"><small>No armies are active for search. Go to Setup and choose armies.</small></div>';
  }
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
  els.rosterBrowser?.classList.add("hidden");
  els.datasheetResultsShell?.classList.add("hidden");
  if (els.resultList) els.resultList.innerHTML = "";
  renderDetail(unit);
}

function selectUnitFromRoster(unit, rosterIndex) {
  if (Number.isInteger(rosterIndex) && rosterIndex >= 0 && rosterIndex < state.rosters.length) {
    state.activeRoster = rosterIndex;
  }

  switchPage("datasheets", {silent:true});
  selectUnit(unit);
  renderActiveArmySelector();
  renderTabs();

  const roster = state.rosters[state.activeRoster];
  if (roster && els.rosterTitle) els.rosterTitle.textContent = roster.name;
  persist();
}

function renderDetail(unit) {
  if (!unit) {
    els.emptyDetail?.classList.add("hidden");
    els.detailCard?.classList.add("hidden");
    return;
  }

  els.emptyDetail.classList.add("hidden");
  els.detailCard.classList.remove("hidden");
  els.detailType.textContent = (unit.type || "Unit").toUpperCase();
  els.detailName.textContent = unit.name;
  els.backToRosterButton?.classList.toggle("hidden", getUnitBrowserSources().length === 0);
  updateUnitTopStatuses(unit);
  updatePinButton();

  const statOrder = ["m","t","sv","w","ld","oc","insv"];
  const statMap = new Map((unit.stats || []).map(stat => [normalize(stat.label), stat]));
  let displayStats = statOrder.map(key => statMap.get(key)).filter(Boolean);

  if (!displayStats.length) {
    displayStats = (unit.stats || [])
      .filter(stat => !/crusade|blackstone|commendation|logistics|enhancement|detachment|pts|points/i.test(stat.label))
      .slice(0, 7);
  }

  els.detailStats.innerHTML = displayStats.length
    ? displayStats.map(stat => `
        <div class="stat">
          <span>${escapeHtml(stat.label)}</span>
          <strong>${escapeHtml(stat.value)}</strong>
        </div>`).join("")
    : "";

  const sections = [];

  if (unit.profiles?.length) {
    const rangedWeapons = unit.profiles.filter(profile => profile.type === "Ranged Weapons");
    const meleeWeapons = unit.profiles.filter(profile => profile.type === "Melee Weapons");
    const otherWeapons = unit.profiles.filter(profile =>
      profile.type !== "Ranged Weapons" && profile.type !== "Melee Weapons"
    );

    if (rangedWeapons.length) sections.push(renderWeaponSection(rangedWeapons, "Ranged weapons"));
    if (meleeWeapons.length) sections.push(renderWeaponSection(meleeWeapons, "Melee weapons"));
    if (otherWeapons.length) sections.push(renderWeaponSection(otherWeapons, "Weapons"));
  }

  if (unit.rules?.length) {
    sections.push(renderPhaseControls(unit.rules));
    sections.push(renderAbilitySection(unit.rules));
  }

  els.detailSections.innerHTML = sections.join("") ||
    '<section class="detail-section"><div class="empty-section">No additional profiles were found in this entry.</div></section>';
  bindDynamicDetailControls();
}

const STATUS_OPTIONS = ["Battle-shocked","Once-per-game used"];

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

function updateUnitTopStatuses(unit = state.selected) {
  const active = new Set(unit ? getStatuses(unit) : []);
  const battleShocked = active.has("Battle-shocked");
  const onceUsed = active.has("Once-per-game used");

  if (els.battleShockToggle) {
    els.battleShockToggle.classList.toggle("active", battleShocked);
    els.battleShockToggle.setAttribute("aria-pressed", battleShocked ? "true" : "false");
    els.battleShockToggle.textContent = battleShocked ? "✓ Battle-shocked" : "Battle-shocked";
  }

  if (els.oncePerGameToggle) {
    els.oncePerGameToggle.classList.toggle("active", onceUsed);
    els.oncePerGameToggle.setAttribute("aria-pressed", onceUsed ? "true" : "false");
    els.oncePerGameToggle.textContent = onceUsed ? "✓ Once-per-game used" : "Once-per-game used";
  }
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
  const uniqueRules = (rules || []).filter(rule => !isCoreRule(rule));
  if (!uniqueRules.length) return "";

  const active = getActivePhase();
  const counts = Object.fromEntries(PHASES.map(p => [p, 0]));
  for (const rule of uniqueRules) {
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

function renderWeaponSection(profiles, title = "Weapons") {
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
      quantity: Number.isFinite(Number(profile.quantity)) ? Math.max(1, Number(profile.quantity)) : null,
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
        <h3>${escapeHtml(title)}</h3>
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
              <tr class="weapon-row">
                <td class="weapon-name">
                  <div class="weapon-title-line">
                    ${row.quantity != null ? `<span class="weapon-quantity">${row.quantity}×</span>` : ""}
                    <strong>${escapeHtml(row.name)}</strong>
                  </div>
                </td>
                ${row.values.map((value, index) => `
                  <td data-label="${escapeHtml(columns[index])}" class="${index === 6 ? "weapon-keywords" : ""}">
                    ${escapeHtml(value)}
                  </td>`).join("")}
              </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </section>`;
}

function isCoreRule(rule) {
  const name = normalize(cleanRuleText(rule?.name || ""));

  const corePatterns = [
    /^assault$/,
    /^pistol$/,
    /^heavy$/,
    /^torrent$/,
    /^blast$/,
    /^lethal hits$/,
    /^sustained hits(?: \d+| d\d+)?$/,
    /^devastating wounds$/,
    /^hazardous$/,
    /^twin linked$/,
    /^ignores cover$/,
    /^indirect fire$/,
    /^lance$/,
    /^melta(?: \d+| d\d+)?$/,
    /^rapid fire(?: \d+| d\d+)?$/,
    /^anti .+ \d+$/,
    /^precision$/,
    /^extra attacks$/,
    /^psychic$/,
    /^one shot$/,
    /^deadly demise(?: \d+| d\d+)?$/,
    /^deep strike$/,
    /^fights first$/,
    /^scouts? \d+$/,
    /^stealth$/,
    /^feel no pain \d+$/,
    /^leader$/,
    /^lone operative$/,
    /^infiltrators$/,
    /^damaged .+ wounds? remaining$/,
    /^core .+$/,
    /^weapon ability .+$/
  ];

  return corePatterns.some(pattern => pattern.test(name));
}

function cleanUniqueRuleText(text = "") {
  return cleanRuleText(text)
    .replace(/\n?\s*Example:?[\s\S]*$/i, "")
    .replace(/\n?\s*Designer'?s Note:?[\s\S]*$/i, "")
    .replace(/\n?\s*Designer'?s Commentary:?[\s\S]*$/i, "")
    .trim();
}

function renderAbilitySection(rules) {
  const activePhase = getActivePhase();
  const uniqueRules = (rules || []).filter(rule => !isCoreRule(rule));
  if (!uniqueRules.length) return "";
  const visibleRules = activePhase === "All"
    ? uniqueRules
    : uniqueRules.filter(rule => inferRulePhase(rule) === activePhase);

  return `
    <section class="detail-section ability-section">
      <div class="section-heading-row">
        <h3>Unique abilities & rules</h3>
        <span class="section-count">${visibleRules.length}</span>
      </div>
      <div class="ability-list">
        ${visibleRules.length ? visibleRules.map(rule => {
          const text = cleanUniqueRuleText(rule.text || "");
          return `
            <article class="ability-card unique-rule-card">
              <h4>${escapeHtml(cleanRuleText(rule.name || "Rule"))}</h4>
              ${text ? `<div class="ability-text unique-rule-text">${formatRuleText(text)}</div>` : ""}
            </article>`;
        }).join("") : '<div class="empty-section">No unique abilities matched this phase.</div>'}
      </div>
    </section>`;
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

  const lines = cleaned.split("\n").map(line => line.trim());
  const html = [];
  let paragraph = [];
  let bullets = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    html.push(`<p>${paragraph.map(line => escapeHtml(line)).join("<br>")}</p>`);
    paragraph = [];
  };

  const flushBullets = () => {
    if (!bullets.length) return;
    html.push(`<ul>${bullets.map(line => `<li>${escapeHtml(line)}</li>`).join("")}</ul>`);
    bullets = [];
  };

  for (const line of lines) {
    if (!line) {
      flushParagraph();
      flushBullets();
      continue;
    }

    if (/^[■•*-]\s*/.test(line)) {
      flushParagraph();
      bullets.push(line.replace(/^[■•*-]\s*/, ""));
      continue;
    }

    flushBullets();
    paragraph.push(line);
  }

  flushParagraph();
  flushBullets();
  return html.join("");
}

function getMatchState() {
  try {
    return {
      cp: Math.max(0, Number(localStorage.getItem("tv_match_cp") || 0)),
      turn: localStorage.getItem("tv_match_turn") || "your"
    };
  } catch {
    return {cp:0, turn:"your"};
  }
}

const SCORE_ROUND_CAP = 15;
const SCORE_GAME_CAP = 45;

function getScoreState() {
  const emptyTurn = () => ({
    p1:{primary:0,secondary:0},
    p2:{primary:0,secondary:0}
  });

  const fallback = {
    turns: {"1":emptyTurn(),"2":emptyTurn(),"3":emptyTurn(),"4":emptyTurn(),"5":emptyTurn()}
  };

  try {
    const saved = JSON.parse(localStorage.getItem("tv_score_state") || "null");
    if (!saved?.turns) return fallback;

    for (const turn of ["1","2","3","4","5"]) {
      if (!saved.turns[turn]) saved.turns[turn] = emptyTurn();
      if (!saved.turns[turn].p1) saved.turns[turn].p1 = {primary:0,secondary:0};
      if (!saved.turns[turn].p2) saved.turns[turn].p2 = {primary:0,secondary:0};
    }

    return {turns:saved.turns};
  } catch {
    return fallback;
  }
}

function saveScoreState(score) {
  localStorage.setItem("tv_score_state", JSON.stringify(score));
}

function scoreCategoryTotal(score, player, type) {
  return [1,2,3,4,5].reduce((sum, turn) => {
    return sum + Math.max(0, Number(score.turns?.[turn]?.["p"+player]?.[type] || 0));
  }, 0);
}

function renderScoreboard() {
  const score = getScoreState();
  const turn = String(state.scoreTurn);
  const current = score.turns[turn];

  document.querySelectorAll("[data-score-turn]").forEach(button => {
    button.classList.toggle("active", Number(button.dataset.scoreTurn) === state.scoreTurn);
  });

  if (els.scoreTurnLabel1) els.scoreTurnLabel1.textContent = "Turn " + state.scoreTurn;
  if (els.scoreTurnLabel2) els.scoreTurnLabel2.textContent = "Turn " + state.scoreTurn;

  const setText = (el, value) => { if (el) el.textContent = String(value); };
  setText(els.p1PrimaryTurn, current?.p1?.primary || 0);
  setText(els.p1SecondaryTurn, current?.p1?.secondary || 0);
  setText(els.p2PrimaryTurn, current?.p2?.primary || 0);
  setText(els.p2SecondaryTurn, current?.p2?.secondary || 0);

  const totals = {
    p1Primary:scoreCategoryTotal(score,1,"primary"),
    p1Secondary:scoreCategoryTotal(score,1,"secondary"),
    p2Primary:scoreCategoryTotal(score,2,"primary"),
    p2Secondary:scoreCategoryTotal(score,2,"secondary")
  };

  setText(els.p1PrimaryTotal, totals.p1Primary);
  setText(els.p1SecondaryTotal, totals.p1Secondary);
  setText(els.p2PrimaryTotal, totals.p2Primary);
  setText(els.p2SecondaryTotal, totals.p2Secondary);
  setText(els.myScoreValue, totals.p1Primary + totals.p1Secondary);
  setText(els.oppScoreValue, totals.p2Primary + totals.p2Secondary);

  renderMatchTools();
}

function setScoreTurn(turn) {
  state.scoreTurn = Math.min(5, Math.max(1, Number(turn) || 1));
  localStorage.setItem("tv_score_turn", String(state.scoreTurn));
  renderScoreboard();
  setVoicePrompt("score");
}

function adjustTurnScore(player, type, delta) {
  if (![1,2].includes(Number(player)) || !["primary","secondary"].includes(type)) return;

  const score = getScoreState();
  const playerKey = "p" + player;
  const turn = String(state.scoreTurn);
  const current = Math.max(0, Number(score.turns[turn][playerKey][type] || 0));
  const gameTotal = scoreCategoryTotal(score, player, type);

  let next = Math.max(0, current + delta);

  if (delta > 0) {
    const roundRoom = Math.max(0, SCORE_ROUND_CAP - current);
    const gameRoom = Math.max(0, SCORE_GAME_CAP - gameTotal);
    const allowed = Math.min(delta, roundRoom, gameRoom);
    next = current + allowed;

    if (allowed < delta) {
      toast(
        gameRoom <= roundRoom
          ? type + " is capped at " + SCORE_GAME_CAP + " VP for the game."
          : type + " is capped at " + SCORE_ROUND_CAP + " VP in a battle round."
      );
    }
  }

  score.turns[turn][playerKey][type] = next;
  saveScoreState(score);
  renderScoreboard();
}

function renderMatchTools() {
  const match = getMatchState();
  if (els.cpValue) els.cpValue.textContent = String(match.cp);
  if (els.turnToggle) {
    els.turnToggle.textContent = match.turn === "your" ? "Player 1 turn" : "Player 2 turn";
    els.turnToggle.classList.toggle("opponent", match.turn === "opponent");
  }
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
}

function resetMatchState() {
  if (!confirm("Reset scoring, CP, turn and Guide checklist?")) return;

  ["tv_match_cp","tv_match_turn","tv_score_state","tv_score_turn"].forEach(key => localStorage.removeItem(key));
  state.scoreTurn = 1;
  document.querySelectorAll("[data-setup-check]").forEach(input => input.checked = false);
  persistSetupChecks();
  renderScoreboard();
  toast("Match reset");
}

function setSetupCheck(name, checked = true) {
  const input = document.querySelector(`[data-setup-check="${name}"]`);
  if (!input) return;
  input.checked = checked;
  persistSetupChecks();
  switchPage("guide");
}

function persistSetupChecks() {
  const state = {};
  document.querySelectorAll("[data-setup-check]").forEach(input => {
    state[input.dataset.setupCheck] = !!input.checked;
  });
  localStorage.setItem("tv_setup_checks", JSON.stringify(state));
}

function restoreSetupChecks() {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem("tv_setup_checks") || "{}"); } catch {}
  document.querySelectorAll("[data-setup-check]").forEach(input => {
    input.checked = !!saved[input.dataset.setupCheck];
  });
}

function randomD6() {
  if (window.crypto?.getRandomValues) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return (array[0] % 6) + 1;
  }
  return Math.floor(Math.random() * 6) + 1;
}

function renderDiceState() {
  const last = state.lastDiceRoll;

  if (!last) {
    if (els.diceSummary) els.diceSummary.textContent = "Ready to roll.";
    if (els.diceResults) els.diceResults.innerHTML = "";
    if (els.diceOrder) els.diceOrder.innerHTML = "";
    els.diceOrder?.classList.add("hidden");
    if (els.toggleDiceOrderButton) els.toggleDiceOrderButton.textContent = "Show order";
    return;
  }

  const counts = [1,2,3,4,5,6].map(value => ({
    value,
    count:last.rolls.filter(roll => roll === value).length
  }));

  const successes = last.target
    ? last.rolls.filter(value => value >= last.target).length
    : null;

  if (els.diceSummary) {
    els.diceSummary.innerHTML = last.target
      ? `<strong>${successes} / ${last.rolls.length} ${escapeHtml((last.label || "successes").toLowerCase())}</strong><span>${escapeHtml(last.label || "Target")} on ${last.target}+</span>`
      : `<strong>${last.rolls.length} dice rolled</strong><span>Total ${last.rolls.reduce((a,b) => a+b,0)}</span>`;
  }

  if (els.diceResults) {
    els.diceResults.innerHTML = counts.map(item => `
      <div class="die-count-card die-${item.value}">
        <span class="die-face">${item.value}</span>
        <strong>×${item.count}</strong>
      </div>`).join("");
  }

  if (els.diceOrder) {
    els.diceOrder.innerHTML = last.rolls.map(value => `<span class="die-result die-${value}">${value}</span>`).join("");
    els.diceOrder.classList.toggle("hidden", !state.showDiceOrder);
  }

  if (els.toggleDiceOrderButton) {
    els.toggleDiceOrderButton.textContent = state.showDiceOrder ? "Hide order" : "Show order";
  }
}

function rollDice(count = 1, target = null, label = "") {
  count = Math.max(1, Math.min(200, Number(count) || 1));
  target = target ? Math.min(6, Math.max(2, Number(target))) : null;

  if (els.diceCount) els.diceCount.value = String(count);
  if (els.diceTarget) els.diceTarget.value = target ? String(target) : "";

  state.lastDiceRoll = {
    rolls:Array.from({length:count}, randomD6),
    target,
    label
  };

  renderDiceState();
}

function rerollMisses() {
  const last = state.lastDiceRoll;
  if (!last?.rolls?.length) {
    toast("Roll some dice first.");
    return;
  }
  if (!last.target) {
    toast("Set a target first so misses are defined.");
    return;
  }

  last.rolls = last.rolls.map(value => value < last.target ? randomD6() : value);
  renderDiceState();
}

function rerollEverything() {
  const last = state.lastDiceRoll;
  if (!last?.rolls?.length) {
    toast("Roll some dice first.");
    return;
  }

  last.rolls = last.rolls.map(() => randomD6());
  renderDiceState();
}

function toggleDiceOrder() {
  state.showDiceOrder = !state.showDiceOrder;
  renderDiceState();
}

function parseSpokenNumber(value) {
  const q = normalize(value);
  if (!q) return null;

  const direct = Number(q);
  if (Number.isFinite(direct)) return direct;

  const values = {
    zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,
    eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,
    seventeen:17,eighteen:18,nineteen:19,twenty:20,
    thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90
  };

  let total = 0;
  let current = 0;
  let sawNumber = false;

  for (const token of q.split(" ").filter(token => token !== "and")) {
    if (token === "hundred") {
      current = Math.max(1, current) * 100;
      sawNumber = true;
      continue;
    }

    if (!(token in values)) return null;
    current += values[token];
    sawNumber = true;
  }

  total += current;
  return sawNumber ? total : null;
}

function setupSpeech() {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) {
    if (els.voiceHint) els.voiceHint.textContent = "Voice recognition unavailable in this browser";
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
            transcript:String(alt.transcript || "").trim(),
            confidence:Number.isFinite(alt.confidence) ? alt.confidence : 0
          }))
          .filter(alt => alt.transcript);
      } else {
        interim += result[0]?.transcript || "";
      }
    }

    if (interim && els.voiceHint) els.voiceHint.textContent = interim;

    if (finalAlternatives?.length) {
      const primary = finalAlternatives[0].transcript;
      if (els.voiceHint) els.voiceHint.textContent = primary;
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
  els.talkButton?.classList.toggle("listening", active);
  if (els.voiceStatus) els.voiceStatus.textContent = active ? "Listening…" : "Ready";
  if (!active && els.voiceHint && !els.voiceHint.textContent.trim()) els.voiceHint.textContent = "Hold to talk";
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
  const alternatives = Array.isArray(input)
    ? input
    : [{transcript:String(input || ""), confidence:0}];

  const primary = alternatives[0]?.transcript?.trim() || "";
  const q = normalize(primary);
  if (!q) return;

  if (state.currentPage === "score") {
    if (!handleScoreVoice(q)) toast("Scoring voice only accepts Player 1/2 Primary or Secondary score changes.");
    return;
  }

  if (state.currentPage === "dice") {
    if (!handleDiceVoice(q)) toast("Try “roll 60 dice hitting on 4” or “reroll all misses”.");
    return;
  }

  if (state.currentPage === "strats") {
    const query = primary.replace(/^(find|search|show)\s+(stratagem|stratagems|strat|strats)\s+/i, "");
    if (els.stratSearch) els.stratSearch.value = query;
    renderStratagems(query);
    return;
  }

  if (state.currentPage === "rules") {
    const query = primary.replace(/^(find|search|show)\s+(core rule|core rules|rule|rules)\s+/i, "");
    if (els.coreRuleSearch) els.coreRuleSearch.value = query;
    renderCoreRules(query);
    return;
  }

  if (state.currentPage !== "datasheets") return;

  if (handleDatasheetVoiceCommand(q)) return;

  if (!state.rosters.length) {
    toast("Go to Setup and import data first.");
    return;
  }

  if (els.searchInput) els.searchInput.value = primary;
  renderResults(primary);

  const ranked = rankVoiceCandidates(alternatives);
  const top = ranked[0];
  const second = ranked[1];
  const margin = top ? top.score - (second?.score || 0) : 0;

  if (!top || top.score < .34) {
    if (els.voiceHint) els.voiceHint.textContent = "No confident datasheet match";
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
    if (els.voiceHint) els.voiceHint.textContent = top.unit.name;
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

function handleDatasheetVoiceCommand(q) {
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

  return false;
}

function extractVoiceAmount(q) {
  const cleaned = q
    .replace(/\bplayer\s+(?:1|2|one|two)\b/g, " ")
    .replace(/\bp[12]\b/g, " ")
    .replace(/\b(primary|secondary|points?|vp)\b/g, " ")
    .replace(/\b(add|added|plus|score|scores|scored|give|gives|gets?|increase|remove|removed|subtract|minus|take|takes|reduce|from|to|for|off)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const numeric = cleaned.match(/\b(\d+)\b/);
  if (numeric) return Number(numeric[1]);

  const tokens = cleaned.split(" ").filter(Boolean);
  for (let length = Math.min(4, tokens.length); length >= 1; length--) {
    for (let i = 0; i <= tokens.length - length; i++) {
      const value = parseSpokenNumber(tokens.slice(i, i + length).join(" "));
      if (value != null) return value;
    }
  }

  return null;
}

function handleScoreVoice(q) {
  const action = /\b(remove|removed|subtract|minus|take|takes|reduce)\b/.test(q) ? -1 :
    /\b(add|added|plus|score|scores|scored|give|gives|gets?|increase)\b/.test(q) ? 1 : 0;

  const player = /\b(player 1|player one|p1)\b/.test(q) ? 1 :
    /\b(player 2|player two|p2|opponent)\b/.test(q) ? 2 : null;

  const type = /\bprimary\b/.test(q) ? "primary" :
    /\bsecondary\b/.test(q) ? "secondary" : null;

  const amount = extractVoiceAmount(q);
  if (!action || !player || !type || !amount) return false;

  adjustTurnScore(player, type, action * amount);
  toast(
    "T" + state.scoreTurn + " · Player " + player + " " +
    (action > 0 ? "+" : "−") + amount + " " + type
  );
  setVoicePrompt("score");
  return true;
}

function parseDiceTarget(value) {
  const cleaned = normalize(String(value || ""))
    .replace(/\b(plus|or better|or higher|higher|up)\b/g, " ")
    .replace(/\b([2-6])s\b/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

  const number = parseSpokenNumber(cleaned);
  if (!number) return null;
  return Math.min(6, Math.max(2, number));
}

function handleDiceVoice(q) {
  if (/^(?:reroll|re roll) (?:all )?misses$/.test(q)) {
    rerollMisses();
    setVoicePrompt("dice");
    return true;
  }

  if (/^(?:reroll|re roll) (?:all|everything)$/.test(q)) {
    rerollEverything();
    setVoicePrompt("dice");
    return true;
  }

  if (!q.startsWith("roll ")) return false;

  const body = q.slice(5).trim();
  const modeMatch = body.match(/\b(hitting|hit|wounding|wound|saving|save|succeeding|success|successes)\b/);

  let countPart = modeMatch ? body.slice(0, modeMatch.index) : body;
  countPart = countPart
    .replace(/\b(dice|die|d6|d6s)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const count = parseSpokenNumber(countPart);
  if (!count) return false;

  let verb = "";
  let target = null;

  if (modeMatch) {
    verb = modeMatch[1];
    const tail = body.slice(modeMatch.index + modeMatch[0].length);
    const targetMatch = tail.match(/\b(?:on|at)\s+(.+?)(?=\s+(?:and|with|reroll|re roll)\b|$)/);
    if (targetMatch) target = parseDiceTarget(targetMatch[1]);
  }

  const labelMap = {
    hitting:"Hits", hit:"Hits",
    wounding:"Wounds", wound:"Wounds",
    saving:"Saves", save:"Saves",
    succeeding:"Successes", success:"Successes", successes:"Successes"
  };

  rollDice(count, target, labelMap[verb] || "");

  if (/\b(?:reroll|re roll) (?:all )?misses\b/.test(q)) rerollMisses();
  else if (/\b(?:reroll|re roll) (?:all|everything)\b/.test(q)) rerollEverything();

  setVoicePrompt("dice");
  return true;
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

  const source = getActiveUnitBrowserSource();
  if (!source) {
    els.quickLists.innerHTML = "";
    updateRosterBrowserVisibility();
    return;
  }

  const groupOrder = [
    "Characters",
    "Battleline",
    "Infantry",
    "Fast / Mounted",
    "Vehicles",
    "Monsters",
    "Transports",
    "Fortifications",
    "Other units"
  ];

  const groups = new Map(groupOrder.map(name => [name, []]));

  source.entries.forEach((entry, entryIndex) => {
    const group = getUnitBrowserGroup(entry.unit);
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push({...entry, entryIndex});
  });

  const html = [];

  const needsCategoryRefresh = source.entries.some(entry =>
    entry.sourceKind === "new-recruit" && !(entry.unit.categories || []).length
  );

  if (needsCategoryRefresh) {
    html.push(
      '<div class="roster-refresh-note">Re-import any older New Recruit lists once to populate their unit categories.</div>'
    );
  }

  for (const groupName of groupOrder) {
    const entries = groups.get(groupName) || [];
    if (!entries.length) continue;

    entries.sort((a,b) => a.unit.name.localeCompare(b.unit.name));

    html.push(`
      <section class="roster-unit-group">
        <div class="roster-unit-group-heading">
          <h3>${escapeHtml(groupName)}</h3>
          <span>${entries.length}</span>
        </div>
        <div class="roster-unit-grid">
          ${entries.map(entry => {
            const pts = (entry.unit.stats || []).find(stat => normalize(stat.label) === "pts")?.value;
            return `
              <button class="roster-unit-button" type="button" data-entry-index="${entry.entryIndex}">
                <span class="roster-unit-copy">
                  <strong>${escapeHtml(entry.unit.name)}</strong>
                  ${source.kind === "all" ? `<small>${escapeHtml(entry.sourceLabel)}</small>` : ""}
                </span>
                ${pts != null ? `<small class="roster-unit-points">${escapeHtml(pts)} pts</small>` : ""}
              </button>`;
          }).join("")}
        </div>
      </section>`);
  }

  els.quickLists.innerHTML = html.join("") ||
    '<div class="empty-section">No units were found in this data source.</div>';

  els.quickLists.querySelectorAll("[data-entry-index]").forEach(button => {
    button.addEventListener("click", () => {
      const entry = source.entries[Number(button.dataset.entryIndex)];
      if (entry) selectUnitFromRoster(entry.unit, entry.rosterIndex);
    });
  });

  updateRosterBrowserVisibility();
}

function backToRosterBrowser() {
  if (!getUnitBrowserSources().length) return;

  state.selected = null;
  if (els.searchInput) els.searchInput.value = "";
  els.datasheetResultsShell?.classList.add("hidden");
  renderDetail(null);
  renderTabs();
  renderQuickLists();
  updateRosterBrowserVisibility();
  setVoicePrompt("datasheets");
  window.scrollTo({top:0, behavior:"smooth"});
}

function bindDynamicDetailControls() {
  document.querySelectorAll("[data-phase]").forEach(button => {
    button.addEventListener("click", () => setActivePhase(button.dataset.phase));
  });
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
  if (!confirm("Remove all loaded New Recruit lists and all-armies data from this device?")) return;
  state.rosters = [];
  state.activeRoster = 0;
  state.selected = null;
  state.referenceData = {rules:[], stratagems:[]};
  state.detachmentStratagems = [];
  state.detachmentStratagemLoadKey = "";
  localStorage.removeItem("tv_rosters");
  localStorage.removeItem("tv_activeRoster");
  localStorage.removeItem("tv_active_search_rosters");
  localStorage.removeItem("tv_active_search_scopes");
  if (els.searchInput) els.searchInput.value = "";
  els.datasheetResultsShell?.classList.add("hidden");
  renderAll();
  switchPage("setup", {silent:true});
  toast("Loaded game data cleared");
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
