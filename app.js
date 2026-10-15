const state = {
  rosters: [],
  activeRoster: 0,
  selected: null,
  selectedRosterId: null,
  mode: localStorage.getItem("tv_mode") || "mobile",
  gameSystem: localStorage.getItem("tv_game_system") || "",
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
  showDiceOrder: false,
  sharePeer: null,
  shareConnection: null,
  shareScanner: null,
  pendingSharedRoster: null,
  dndFocusedActionId: ""
};

const $ = (id) => document.getElementById(id);
const els = {
  welcome: $("welcome"),
  voiceDock: $("voiceDock"),
  fileInput: $("fileInput"),
  importButton: $("importButton"),
  fullDataButton: $("fullDataButton"),
  oprShareInput: $("oprShareInput"),
  oprImportButton: $("oprImportButton"),
  oprImportStatus: $("oprImportStatus"),
  liCommunityImportCard: $("liCommunityImportCard"),
  liCommunityInput: $("liCommunityInput"),
  liCommunityImportButton: $("liCommunityImportButton"),
  liCommunityFileButton: $("liCommunityFileButton"),
  liCommunityFileInput: $("liCommunityFileInput"),
  liCommunityImportStatus: $("liCommunityImportStatus"),
  necromundaImportCard: $("necromundaImportCard"),
  necromundaShareInput: $("necromundaShareInput"),
  necromundaImportButton: $("necromundaImportButton"),
  necromundaImportStatus: $("necromundaImportStatus"),
  dndBeyondImportCard: $("dndBeyondImportCard"),
  dndBeyondInput: $("dndBeyondInput"),
  dndBeyondImportButton: $("dndBeyondImportButton"),
  dndBeyondFileButton: $("dndBeyondFileButton"),
  dndBeyondFileInput: $("dndBeyondFileInput"),
  dndBeyondImportStatus: $("dndBeyondImportStatus"),
  clearRoster: $("clearRoster"),
  searchInput: $("searchInput"),
  resultList: $("resultList"),
  rosterTabs: $("rosterTabs"),
  rosterBrowser: $("rosterBrowser"),
  unitBrowserCp: $("unitBrowserCp"),
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
  linkedUnitButton: $("linkedUnitButton"),
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
  pageArmyRules: $("pageArmyRules"),
  pageRules: $("pageRules"),
  pageShare: $("pageShare"),
  pageUpdates: $("pageUpdates"),
  pageSettings: $("pageSettings"),
  gameSystemModal: $("gameSystemModal"),
  gameSystemClose: $("gameSystemClose"),
  gameSystemCatalogue: $("gameSystemCatalogue"),
  settingsGameSystemCatalogue: $("settingsGameSystemCatalogue"),
  settingsCurrentGame: $("settingsCurrentGame"),
  newRecruitImportCard: $("newRecruitImportCard"),
  newRecruitImportLabel: $("newRecruitImportLabel"),
  newRecruitImportTitle: $("newRecruitImportTitle"),
  newRecruitImportCopy: $("newRecruitImportCopy"),
  fullDataImportCard: $("fullDataImportCard"),
  oprImportCard: $("oprImportCard"),
  stratSourceTabs: $("stratSourceTabs"),
  stratPageContent: $("stratPageContent"),
  armyRuleSourceTabs: $("armyRuleSourceTabs"),
  armyRulePageContent: $("armyRulePageContent"),
  shareRosterSelect: $("shareRosterSelect"),
  removeShareRosterButton: $("removeShareRosterButton"),
  createAppShareButton: $("createAppShareButton"),
  appShareQrPanel: $("appShareQrPanel"),
  appShareQrCode: $("appShareQrCode"),
  appShareStatus: $("appShareStatus"),
  scanOpponentQrButton: $("scanOpponentQrButton"),
  opponentQrScanner: $("opponentQrScanner"),
  opponentShareLink: $("opponentShareLink"),
  connectOpponentLinkButton: $("connectOpponentLinkButton"),
  opponentReceiveStatus: $("opponentReceiveStatus"),
  opponentReceiveActions: $("opponentReceiveActions"),
  openReceivedUnitsButton: $("openReceivedUnitsButton"),
  openReceivedStratsButton: $("openReceivedStratsButton"),
  openReceivedRulesButton: $("openReceivedRulesButton"),
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
  scoreResetButton: $("scoreResetButton"),
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
  coreRulesImportButton: $("coreRulesImportButton"),
  coreRulesImportStatus: $("coreRulesImportStatus"),
  setupChooseArmies: $("setupChooseArmies"),
  setupCurrentGame: $("setupCurrentGame"),
  setupChangeGameButton: $("setupChangeGameButton"),
  resetGameButton: $("resetGameButton"),
  resetMatchButton: $("resetMatchButton"),
  toast: $("toast"),
  firstRunModal: $("firstRunModal"),
  firstRunContinue: $("firstRunContinue"),
  voiceShortlistModal: $("voiceShortlistModal"),
  voiceShortlistClose: $("voiceShortlistClose"),
  voiceShortlistResults: $("voiceShortlistResults"),
  voiceHeardText: $("voiceHeardText")
};


async function enforcePortraitOrientation() {
  try {
    if (screen.orientation?.lock) {
      await screen.orientation.lock("portrait-primary");
    }
  } catch {
    // Browser tabs often refuse orientation locks; installed PWAs generally allow them.
  }
}


function boot() {
  applyMode();
  enforcePortraitOrientation();
  renderGameSystemCatalogues();
  bindEvents();
  setupSpeech();

  try {
    restore();
    applyGameSystemRoute();
    applyGameSystemUi();
    renderAll();
    renderMatchTools();
    restoreSetupChecks();
    switchPage(state.currentPage, {silent:true});
    handleShareUrlOnBoot();
    handlePendingRosterTransferOnBoot();
    showEntryModalIfNeeded();
  } catch (error) {
    console.error("Tabletop Voice startup render failed", error);
    toast("Some saved data could not be rendered. Controls are still available.");
    switchPage("setup", {silent:true});
    showEntryModalIfNeeded();
  }

  if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
}

function bindEvents() {
  document.addEventListener("pointerdown", enforcePortraitOrientation, {once:true});
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) enforcePortraitOrientation();
  });

  els.importButton?.addEventListener("click", () => els.fileInput.click());
  els.fileInput?.addEventListener("change", handleFiles);
  els.fullDataButton?.addEventListener("click", loadFull40kData);
  els.oprImportButton?.addEventListener("click", loadOprArmyForgeList);
  els.liCommunityImportButton?.addEventListener("click", () => importLiCommunityPayload(els.liCommunityInput?.value || "", "paste"));
  els.liCommunityFileButton?.addEventListener("click", () => els.liCommunityFileInput?.click());
  els.liCommunityFileInput?.addEventListener("change", handleLiCommunityFile);
  els.necromundaImportButton?.addEventListener("click", loadGyrinxGang);
  els.dndBeyondImportButton?.addEventListener("click", loadDndBeyondCharacter);
  els.dndBeyondFileButton?.addEventListener("click", () => els.dndBeyondFileInput?.click());
  els.dndBeyondFileInput?.addEventListener("change", handleDndBeyondJsonFile);
  els.dndBeyondInput?.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      loadDndBeyondCharacter();
    }
  });
  els.necromundaShareInput?.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      loadGyrinxGang();
    }
  });
  els.liCommunityInput?.addEventListener("keydown", event => {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      importLiCommunityPayload(els.liCommunityInput?.value || "", "paste");
    }
  });
  els.oprShareInput?.addEventListener("keydown", event => {
    const isTextarea = event.currentTarget?.tagName === "TEXTAREA";
    const submit = event.key === "Enter" && (!isTextarea || event.ctrlKey || event.metaKey);
    if (submit) {
      event.preventDefault();
      loadOprArmyForgeList();
    }
  });
  document.addEventListener("click", event => {
    const providerTab = event.target.closest("[data-game-provider-tab]");
    if (providerTab) {
      const catalogue = providerTab.closest(".game-catalogue");
      if (catalogue) setGameCatalogueProvider(catalogue, providerTab.dataset.gameProviderTab);
      return;
    }

    const gameChoice = event.target.closest("[data-game-system-choice]");
    if (gameChoice && !gameChoice.disabled) {
      const fromChooser = Boolean(gameChoice.closest("#gameSystemModal"));
      setGameSystem(gameChoice.dataset.gameSystemChoice, {fromChooser});
    }
  });
  els.clearRoster.addEventListener("click", clearRosters);
  els.searchInput.addEventListener("input", () => {
    state.selected = null;
    renderDetail(null);
    renderResults(els.searchInput.value);
  });
  els.modeToggle?.addEventListener("click", toggleMode);
  els.focusButton?.addEventListener("click", toggleFocusMode);
  els.linkedUnitButton?.addEventListener("click", cycleLinkedUnit);
  els.backToRosterButton?.addEventListener("click", handleDatasheetBack);
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
  els.scoreResetButton?.addEventListener("click", resetScores);
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
  els.coreRulesImportButton?.addEventListener("click", loadCoreRulesData);
  els.createAppShareButton?.addEventListener("click", createAppShareQr);
  els.removeShareRosterButton?.addEventListener("click", removeSelectedShareRoster);
  els.scanOpponentQrButton?.addEventListener("click", startOpponentQrScanner);
  els.openReceivedUnitsButton?.addEventListener("click", () => switchPage("datasheets"));
  els.openReceivedStratsButton?.addEventListener("click", () => switchPage("strats"));
  els.openReceivedRulesButton?.addEventListener("click", () => switchPage("army-rules"));
  els.connectOpponentLinkButton?.addEventListener("click", () => {
    const value = els.opponentShareLink?.value?.trim();
    if (value) connectOpponentShareLink(value);
  });
  els.setupChooseArmies?.addEventListener("click", openArmyPicker);
  els.setupChangeGameButton?.addEventListener("click", openGameSystemChooser);
  els.gameSystemClose?.addEventListener("click", () => {
    if (!state.gameSystem) return;
    els.gameSystemModal?.classList.add("hidden");
  });
  els.resetGameButton?.addEventListener("click", resetGame);
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
  window.addEventListener("popstate", handleBrowserBack);
}

const TRANSFER_DB_NAME = "tabletop-voice-transfer-v1";
const TRANSFER_DB_STORE = "handoffs";
const TRANSFER_DB_KEY = "latest";

function openRosterTransferDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(TRANSFER_DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(TRANSFER_DB_STORE)) {
        db.createObjectStore(TRANSFER_DB_STORE);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Could not open transfer storage."));
  });
}

async function readPendingRosterTransfer() {
  const db = await openRosterTransferDb();

  const payload = await new Promise((resolve, reject) => {
    const tx = db.transaction(TRANSFER_DB_STORE, "readonly");
    const request = tx.objectStore(TRANSFER_DB_STORE).get(TRANSFER_DB_KEY);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error || new Error("Could not read transferred rosters."));
  });

  db.close();
  return payload;
}

async function clearPendingRosterTransfer() {
  const db = await openRosterTransferDb();

  await new Promise((resolve, reject) => {
    const tx = db.transaction(TRANSFER_DB_STORE, "readwrite");
    tx.objectStore(TRANSFER_DB_STORE).delete(TRANSFER_DB_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error("Could not clear transferred rosters."));
    tx.onabort = () => reject(tx.error || new Error("Could not clear transferred rosters."));
  });

  db.close();
}

function transferBase64ToBytes(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function handlePendingRosterTransferOnBoot() {
  const url = new URL(location.href);
  if (!url.searchParams.has("transfer")) return;

  try {
    const bundle = await readPendingRosterTransfer();
    if (!bundle?.files?.length) {
      toast("No transferred roster was waiting to import.");
      url.searchParams.delete("transfer");
      history.replaceState(history.state || {}, "", url.pathname + url.search + url.hash);
      return;
    }

    let imported = 0;
    let lastRoster = null;

    for (const item of bundle.files) {
      const parts = item.encoding === "base64"
        ? [transferBase64ToBytes(item.payload || "")]
        : [String(item.payload || "")];

      const file = new File(parts, item.name || ("transferred." + (item.format || "json")), {
        type:item.mime || "application/octet-stream"
      });

      const roster = await parseRosterUpload(file);
      const importedGame = inferRosterGameSystem(roster);

      if (state.gameSystem && importedGame !== state.gameSystem) {
        throw new Error(
          "This looks like a " + gameSystemDisplayName(importedGame) +
          " list. Switch game system in Settings before importing it."
        );
      }

      const existingIndex = state.rosters.findIndex(existing =>
        existing.source === "new-recruit" &&
        normalize(existing.name) === normalize(roster.name) &&
        normalize(existing.faction) === normalize(roster.faction)
      );

      if (existingIndex >= 0) {
        state.rosters.splice(existingIndex, 1, roster);
        state.activeRoster = existingIndex;
      } else {
        state.rosters.push(roster);
        state.activeRoster = state.rosters.length - 1;
      }

      imported++;
      lastRoster = roster;
    }

    if (lastRoster) {
      state.unitBrowserSourceId = "roster:" + lastRoster.id;
      localStorage.setItem("tv_unit_browser_source", state.unitBrowserSourceId);
    }

    state.detachmentStratagemLoadKey = "";
    persist();
    renderAll();
    switchPage("datasheets", {silent:true});
    await clearPendingRosterTransfer();

    url.searchParams.delete("transfer");
    history.replaceState(history.state || {}, "", url.pathname + url.search + url.hash);

    toast(
      imported === 1
        ? "Roster imported automatically"
        : imported + " rosters imported automatically"
    );
  } catch (error) {
    console.error("Automatic roster transfer import failed", error);
    toast("Transfer received, but automatic import failed. Use the downloaded backup from Roster Transfer.");
  }
}

const GAME_PROVIDERS = [
  {
    id:"gw",
    name:"Games Workshop",
    systems:[
      {id:"40k", name:"Warhammer 40,000", detail:"New Recruit, 40K references, scoring and table tools", available:true},
      {id:"aos", name:"Warhammer Age of Sigmar", detail:"AoS 4th · New Recruit roster support", available:true, beta:true},
      {id:"heresy", name:"Warhammer: The Horus Heresy", detail:"3rd Edition · New Recruit roster support", available:true, beta:true},
      {id:"old-world", name:"Warhammer: The Old World", detail:"Planned", available:false},
      {id:"kill-team", name:"Kill Team", detail:"2024 · New Recruit roster support", available:true, beta:true},
      {id:"necromunda", name:"Necromunda", detail:"N26 · Gyrinx shared gang", available:true, beta:true},
      {id:"warcry", name:"Warcry", detail:"Planned", available:false},
      {id:"underworlds", name:"Warhammer Underworlds", detail:"Planned", available:false},
      {id:"legions-imperialis", name:"Legions Imperialis", detail:"New Recruit · Legion Companion", available:true, beta:true},
      {id:"adeptus-titanicus", name:"Adeptus Titanicus", detail:"Planned", available:false},
      {id:"blood-bowl", name:"Blood Bowl", detail:"Planned", available:false},
      {id:"middle-earth", name:"Middle-earth Strategy Battle Game", detail:"Planned", available:false},
      {id:"warhammer-quest", name:"Warhammer Quest", detail:"Planned", available:false}
    ]
  },
  {
    id:"opr",
    name:"OnePageRules",
    systems:[
      {id:"grimdark", name:"Grimdark Future", detail:"Army Forge + New Recruit", available:true},
      {id:"grimdark-firefight", name:"Grimdark Future: Firefight", detail:"Army Forge + New Recruit", available:true},
      {id:"opr-star-quest", name:"Grimdark Future: Star Quest", detail:"Army Forge quest/campaign import", available:true, beta:true},
      {id:"opr-warfleets", name:"Grimdark Future: Warfleets", detail:"Army Forge · Share as Text", available:true, beta:true},
      {id:"aof", name:"Age of Fantasy", detail:"Army Forge + New Recruit", available:true},
      {id:"aof-skirmish", name:"Age of Fantasy: Skirmish", detail:"Army Forge + New Recruit", available:true},
      {id:"aof-regiments", name:"Age of Fantasy: Regiments", detail:"Army Forge + New Recruit", available:true},
      {id:"aof-quest", name:"Age of Fantasy: Quest", detail:"Army Forge quest/campaign import", available:true, beta:true}
    ]
  },
  {
    id:"dnd",
    name:"Dungeons & Dragons",
    systems:[
      {id:"dnd-5e", name:"D&D 5e", detail:"D&D Beyond characters · attacks, spells, slots and inventory", available:true, beta:true}
    ]
  },
  {
    id:"other",
    name:"Other",
    systems:[
      {id:"trench-crusade", name:"Trench Crusade", detail:"Planned", available:false}
    ]
  }
];

const GAME_SYSTEMS = Object.fromEntries(
  GAME_PROVIDERS.flatMap(provider =>
    provider.systems.map(system => [
      system.id,
      {...system, provider:provider.id, providerName:provider.name}
    ])
  )
);

const GAME_SYSTEM_PICKER_SEEN_KEY = "tv_game_system_picker_seen_v1";

const GAME_SYSTEM_ROUTES = {
  "40k":"/40k",
  aos:"/aos",
  heresy:"/horus-heresy",
  "kill-team":"/kill-team",
  necromunda:"/necromunda",
  "legions-imperialis":"/legions-imperialis",
  "dnd-5e":"/dnd",
  grimdark:"/grimdark-future",
  "grimdark-firefight":"/grimdark-firefight",
  "opr-star-quest":"/grimdark-star-quest",
  "opr-warfleets":"/warfleets",
  aof:"/age-of-fantasy",
  "aof-skirmish":"/age-of-fantasy-skirmish",
  "aof-regiments":"/age-of-fantasy-regiments",
  "aof-quest":"/age-of-fantasy-quest"
};

const GAME_ROUTE_ALIASES = {
  "/heresy":"heresy",
  "/grimdark":"grimdark",
  "/gff":"grimdark-firefight",
  "/star-quest":"opr-star-quest",
  "/opr-warfleets":"opr-warfleets",
  "/aof":"aof",
  "/aof-skirmish":"aof-skirmish",
  "/aof-regiments":"aof-regiments",
  "/aof-quest":"aof-quest",
  "/dnd-5e":"dnd-5e",
  "/dungeons-and-dragons":"dnd-5e"
};

const GAME_SYSTEM_BY_ROUTE = Object.fromEntries(
  Object.entries(GAME_SYSTEM_ROUTES).map(([gameSystem, route]) => [route, gameSystem])
);

function normalizedRoutePath(pathname = location.pathname) {
  const raw = String(pathname || "/");
  if (raw === "/") return "/";
  return raw.replace(/\/+$/, "") || "/";
}

function gameSystemFromPath(pathname = location.pathname) {
  const path = normalizedRoutePath(pathname);
  return GAME_SYSTEM_BY_ROUTE[path] || GAME_ROUTE_ALIASES[path] || "";
}

function gameRouteForSystem(gameSystem = state.gameSystem) {
  return GAME_SYSTEM_ROUTES[gameSystem] || "/";
}

function isRootGameChooserPath(pathname = location.pathname) {
  const path = normalizedRoutePath(pathname);
  return path === "/" || path === "/index.html";
}

function applyGameSystemRoute() {
  const routedSystem = gameSystemFromPath();
  if (!routedSystem || !GAME_SYSTEMS[routedSystem]?.available) return false;

  state.gameSystem = routedSystem;
  localStorage.setItem("tv_game_system", routedSystem);
  localStorage.setItem(GAME_SYSTEM_PICKER_SEEN_KEY, "1");
  ensureActiveRosterForGame();
  return true;
}

function syncGameSystemUrl(gameSystem = state.gameSystem) {
  const route = gameRouteForSystem(gameSystem);
  if (!route || normalizedRoutePath() === route) return;

  const url = new URL(location.href);
  url.pathname = route;
  history.replaceState({...history.state, tvView:"list"}, "", url.pathname + url.search + url.hash);
}

function currentGameName() {
  return GAME_SYSTEMS[state.gameSystem]?.name || "Choose a game";
}

function gameSystemDisplayName(gameSystem) {
  return GAME_SYSTEMS[gameSystem]?.name ||
    (gameSystem === "grimdark" ? "Grimdark Future" :
      gameSystem === "aos" ? "Warhammer Age of Sigmar" :
      gameSystem === "40k" ? "Warhammer 40,000" :
      "another game system");
}

const OPR_GAME_SYSTEM_KEYS = {
  gf:"grimdark",
  "2":"grimdark",
  "grimdark-future":"grimdark",
  gff:"grimdark-firefight",
  "3":"grimdark-firefight",
  "grimdark-future-firefight":"grimdark-firefight",
  aof:"aof",
  "4":"aof",
  "age-of-fantasy":"aof",
  aofs:"aof-skirmish",
  "5":"aof-skirmish",
  "age-of-fantasy-skirmish":"aof-skirmish",
  aofr:"aof-regiments",
  "6":"aof-regiments",
  "age-of-fantasy-regiments":"aof-regiments",
  aofq:"aof-quest",
  aofqai:"aof-quest",
  "7":"aof-quest",
  "8":"aof-quest",
  "age-of-fantasy-quest":"aof-quest",
  "age-of-fantasy-quest-ai":"aof-quest",
  gfsq:"opr-star-quest",
  gfsqai:"opr-star-quest",
  "9":"opr-star-quest",
  "10":"opr-star-quest",
  "grimdark-future-star-quest":"opr-star-quest",
  "grimdark-future-star-quest-ai":"opr-star-quest",
  gfwf:"opr-warfleets",
  "grimdark-future-warfleet":"opr-warfleets",
  "grimdark-future-warfleets":"opr-warfleets"
};

function oprGameSystemKey(code = "") {
  return OPR_GAME_SYSTEM_KEYS[String(code || "").toLowerCase()] || "";
}

function isOprMode(gameSystem = state.gameSystem) {
  return [
    "grimdark",
    "grimdark-firefight",
    "opr-star-quest",
    "opr-warfleets",
    "aof",
    "aof-skirmish",
    "aof-regiments",
    "aof-quest"
  ].includes(gameSystem);
}

function isOprFantasyMode(gameSystem = state.gameSystem) {
  return ["aof","aof-skirmish","aof-regiments","aof-quest"].includes(gameSystem);
}

function isOprQuestMode(gameSystem = state.gameSystem) {
  return gameSystem === "aof-quest" || gameSystem === "opr-star-quest";
}

function isWarfleetsMode(gameSystem = state.gameSystem) {
  return gameSystem === "opr-warfleets";
}

function isOprSkirmishMode(gameSystem = state.gameSystem) {
  return gameSystem === "grimdark-firefight" || gameSystem === "aof-skirmish";
}

function isGrimdarkMode() {
  return state.gameSystem === "grimdark";
}

function isAosMode() {
  return state.gameSystem === "aos";
}

function isHeresyMode(gameSystem = state.gameSystem) {
  return gameSystem === "heresy";
}

function isKillTeamMode(gameSystem = state.gameSystem) {
  return gameSystem === "kill-team";
}

function isLegionsImperialisMode(gameSystem = state.gameSystem) {
  return gameSystem === "legions-imperialis";
}

function isNecromundaMode(gameSystem = state.gameSystem) {
  return gameSystem === "necromunda";
}

function isDndMode(gameSystem = state.gameSystem) {
  return gameSystem === "dnd-5e";
}

function gameProviderForSystem(gameSystem = state.gameSystem) {
  return GAME_SYSTEMS[gameSystem]?.provider || "gw";
}

function gameSystemCardHtml(system) {
  const selected = state.gameSystem === system.id;
  const status = system.status ||
    (system.available
      ? (system.beta ? "BETA" : "AVAILABLE")
      : "TBC");

  if (!system.available) {
    return `
      <div class="game-system-option disabled" aria-disabled="true">
        <span class="game-system-status">${status}</span>
        <strong>${escapeHtml(system.name)}</strong>
        <small>${escapeHtml(system.detail || "Planned")}</small>
      </div>`;
  }

  return `
    <button
      class="game-system-option${selected ? " selected" : ""}"
      type="button"
      data-game-system-choice="${escapeHtml(system.id)}"
      aria-pressed="${selected ? "true" : "false"}">
      <span class="game-system-status live">${status}</span>
      <strong>${escapeHtml(system.name)}</strong>
      <small>${escapeHtml(system.detail || "")}</small>
    </button>`;
}

function renderGameSystemCatalogue(container, preferredProvider = null) {
  if (!container) return;

  const requested =
    preferredProvider ||
    container.dataset.activeProvider ||
    gameProviderForSystem();

  const provider = GAME_PROVIDERS.find(item => item.id === requested) || GAME_PROVIDERS[0];
  container.dataset.activeProvider = provider.id;

  container.innerHTML = `
    <div class="game-provider-tabs" role="tablist" aria-label="Game publishers">
      ${GAME_PROVIDERS.map(item => `
        <button
          type="button"
          role="tab"
          class="game-provider-tab${item.id === provider.id ? " active" : ""}"
          data-game-provider-tab="${escapeHtml(item.id)}"
          aria-selected="${item.id === provider.id ? "true" : "false"}">
          ${escapeHtml(item.name)}
        </button>`).join("")}
    </div>
    <div class="game-provider-heading">
      <span class="section-label">${escapeHtml(provider.name)}</span>
      <small>${provider.systems.filter(system => system.available).length} available now</small>
    </div>
    <div class="game-system-grid">
      ${provider.systems.map(gameSystemCardHtml).join("")}
    </div>`;
}

function renderGameSystemCatalogues(preferredProvider = null) {
  renderGameSystemCatalogue(els.gameSystemCatalogue, preferredProvider);
  renderGameSystemCatalogue(els.settingsGameSystemCatalogue, preferredProvider);
}

function setGameCatalogueProvider(container, providerId) {
  if (!GAME_PROVIDERS.some(provider => provider.id === providerId)) return;
  container.dataset.activeProvider = providerId;
  renderGameSystemCatalogue(container, providerId);
}

function openGameSystemChooser() {
  els.firstRunModal?.classList.add("hidden");
  renderGameSystemCatalogues(gameProviderForSystem());
  els.gameSystemClose?.classList.toggle("hidden", !state.gameSystem);
  els.gameSystemModal?.classList.remove("hidden");
}

function showEntryModalIfNeeded() {
  const params = new URLSearchParams(location.search);
  if (params.has("tvshare") || params.has("transfer")) {
    showFirstRunIfNeeded();
    return;
  }

  const pickerSeen = localStorage.getItem(GAME_SYSTEM_PICKER_SEEN_KEY) === "1";
  const rootChooser = isRootGameChooserPath();
  if (rootChooser || !state.gameSystem || !pickerSeen) {
    els.firstRunModal?.classList.add("hidden");
    els.gameSystemClose?.classList.toggle("hidden", rootChooser || !state.gameSystem);
    els.gameSystemModal?.classList.remove("hidden");
    return;
  }

  els.gameSystemModal?.classList.add("hidden");
  showFirstRunIfNeeded();
}

function inferUnitGameSystem(unit) {
  if (unit?.gameSystemKey && GAME_SYSTEMS[unit.gameSystemKey]) return unit.gameSystemKey;
  if (unit?.system === "aos") return "aos";
  if (unit?.system === "heresy") return "heresy";
  if (unit?.system === "kill-team") return "kill-team";
  if (unit?.system === "legions-imperialis") return "legions-imperialis";
  if (unit?.system === "necromunda") return "necromunda";
  if (unit?.system === "dnd") return "dnd-5e";
  if (unit?.system === "opr") return oprGameSystemKey(unit?.gameSystem) || "grimdark";
  if (unit?.system === "40k") return "40k";

  const labels = new Set((unit?.stats || []).map(stat => normalize(stat.label)));

  if (
    labels.has("move") &&
    labels.has("health") &&
    labels.has("save") &&
    labels.has("control")
  ) {
    return "aos";
  }

  if (labels.has("quality") && (labels.has("defense") || labels.has("defence"))) {
    return "grimdark";
  }

  return "40k";
}

function inferRosterGameSystem(roster) {
  if (!roster) return "";
  if (roster.gameSystemKey) return roster.gameSystemKey;

  if (roster.source === "opr") {
    return oprGameSystemKey(roster.gameSystem) || "opr-other";
  }

  if (roster.source === "bsdata") return "40k";
  if (roster.source === "dndbeyond") return "dnd-5e";

  const metadata = normalize([
    roster.faction,
    roster.name,
    roster.gameName,
    roster.gameSystem,
    roster.gameSystemName
  ].filter(Boolean).join(" "));

  if (metadata.includes("age of sigmar")) return "aos";
  if (
    metadata.includes("kill team") ||
    metadata.includes("c521 ad27 44df f959")
  ) return "kill-team";
  if (
    metadata.includes("legions imperialis") ||
    metadata.includes("sys 9498 516a 178a 3f4f")
  ) return "legions-imperialis";
  if (
    metadata.includes("horus heresy") ||
    metadata.includes("age of darkness") ||
    metadata.includes("sys 9fe4 1dc3 b7c2 73cf")
  ) return "heresy";
  if (metadata.includes("age of fantasy quest")) return "aof-quest";
  if (metadata.includes("age of fantasy regiments")) return "aof-regiments";
  if (metadata.includes("age of fantasy skirmish")) return "aof-skirmish";
  if (metadata.includes("age of fantasy")) return "aof";
  if (metadata.includes("grimdark future star quest")) return "opr-star-quest";
  if (metadata.includes("grimdark future firefight")) return "grimdark-firefight";
  if (metadata.includes("grimdark future")) return "grimdark";

  const counts = {aos:0, grimdark:0, "40k":0};
  for (const unit of roster.units || []) {
    const system = inferUnitGameSystem(unit);
    if (counts[system] != null) counts[system]++;
  }

  const best = Object.entries(counts).sort((a,b) => b[1] - a[1])[0];
  return best?.[1] ? best[0] : "40k";
}

function rosterMatchesSelectedGame(roster) {
  if (!state.gameSystem) return true;
  return inferRosterGameSystem(roster) === state.gameSystem;
}

function ensureActiveRosterForGame() {
  if (!state.gameSystem) return;
  const current = state.rosters[state.activeRoster];
  if (current && rosterMatchesSelectedGame(current)) return;

  const index = state.rosters.findIndex(roster => rosterMatchesSelectedGame(roster));
  state.activeRoster = index >= 0 ? index : 0;
}

function setGameSystem(gameSystem, options = {}) {
  if (!GAME_SYSTEMS[gameSystem]?.available) return;

  state.gameSystem = gameSystem;
  localStorage.setItem("tv_game_system", gameSystem);
  if (!options.fromRoute) syncGameSystemUrl(gameSystem);
  if (options.fromChooser) {
    localStorage.setItem(GAME_SYSTEM_PICKER_SEEN_KEY, "1");
  }
  state.selected = null;
  state.selectedRosterId = null;
  state.unitBrowserSourceId = "all";
  localStorage.setItem("tv_unit_browser_source", "all");
  ensureActiveRosterForGame();

  els.gameSystemModal?.classList.add("hidden");
  renderGameSystemCatalogues(gameProviderForSystem(gameSystem));
  applyGameSystemUi();
  renderAll();

  if (state.currentPage === "strats" || state.currentPage === "score" || state.currentPage === "rules") {
    switchPage("setup", {silent:true});
  } else if (!options.fromChooser) {
    switchPage("setup");
  }

  if (options.fromChooser) {
    switchPage("setup", {silent:true});
    showFirstRunIfNeeded();
  } else {
    toast("Switched to " + currentGameName());
  }
}

function applyGameSystemUi() {
  const grimdark = isGrimdarkMode();
  const opr = isOprMode();
  const aos = isAosMode();
  const heresy = isHeresyMode();
  const killTeam = isKillTeamMode();
  const legionsImperialis = isLegionsImperialisMode();
  const necromunda = isNecromundaMode();
  const dnd = isDndMode();
  const fortyK = state.gameSystem === "40k";

  document.body.classList.toggle("game-grimdark", grimdark);
  document.body.classList.toggle("game-opr", opr);
  document.body.classList.toggle("game-aos", aos);
  document.body.classList.toggle("game-heresy", heresy);
  document.body.classList.toggle("game-kill-team", killTeam);
  document.body.classList.toggle("game-legions-imperialis", legionsImperialis);
  document.body.classList.toggle("game-necromunda", necromunda);
  document.body.classList.toggle("game-dnd", dnd);
  document.body.classList.toggle("game-40k", fortyK);
  document.title = state.gameSystem
    ? currentGameName() + " | Tabletop Voice"
    : "Tabletop Voice";

  if (els.settingsCurrentGame) {
    els.settingsCurrentGame.textContent = currentGameName();
  }
  if (els.setupCurrentGame) {
    els.setupCurrentGame.textContent = currentGameName();
  }

  renderGameSystemCatalogues(gameProviderForSystem());

  // The all-armies/community reference loader is currently 40K-specific.
  if (els.fullDataImportCard) els.fullDataImportCard.classList.toggle("hidden", !fortyK);
  // Army Forge is the primary current-data source for supported OPR games.
  if (els.oprImportCard) els.oprImportCard.classList.toggle("hidden", !opr);
  if (els.liCommunityImportCard) els.liCommunityImportCard.classList.toggle("hidden", !legionsImperialis);
  if (els.necromundaImportCard) els.necromundaImportCard.classList.toggle("hidden", !necromunda);
  if (els.dndBeyondImportCard) els.dndBeyondImportCard.classList.toggle("hidden", !dnd);

  if (els.fullDataArmySection) {
    const hasFullData = fortyK && state.rosters.some(roster => roster.source === "bsdata");
    els.fullDataArmySection.classList.toggle("hidden", !hasFullData);
  }

  if (els.newRecruitImportLabel) {
    els.newRecruitImportLabel.textContent = "NEW RECRUIT";
  }
  if (els.newRecruitImportTitle) {
    els.newRecruitImportTitle.textContent = "Import list";
  }
  if (els.newRecruitImportCard) {
    els.newRecruitImportCard.classList.toggle(
      "hidden",
      isOprQuestMode() || isWarfleetsMode() || necromunda || dnd
    );
  }

  if (els.oprImportCard) {
    const label = els.oprImportCard.querySelector(".section-label");
    const title = els.oprImportCard.querySelector("h2");
    const copy = els.oprImportCard.querySelector("p");

    if (label) label.textContent = "ARMY FORGE";
    if (title) title.textContent = isWarfleetsMode() ? "Import Warfleets fleet" : "Import shared list";
    if (copy) {
      copy.innerHTML = isWarfleetsMode()
        ? 'In Warfleets choose <strong>Share as Text</strong>, copy the full fleet block, then paste it below.'
        : 'In Army Forge choose <strong>Share as Link</strong>, then paste that shared roster link below.';
    }
  }

  if (els.oprShareInput) {
    els.oprShareInput.placeholder = isWarfleetsMode()
      ? "Paste the full GFWF Share as Text fleet here…"
      : "Paste Army Forge share link…";
    els.oprShareInput.setAttribute(
      "aria-label",
      isWarfleetsMode() ? "Warfleets Share as Text fleet" : "Army Forge shared list link"
    );
  }

  if (els.oprImportButton) {
    els.oprImportButton.textContent = isWarfleetsMode() ? "Import Warfleets fleet" : "Import OPR list";
  }

  if (els.oprImportStatus && !els.oprImportStatus.dataset.busy) {
    els.oprImportStatus.textContent = isWarfleetsMode()
      ? "Paste the complete ++ … [GFWF …pts] ++ fleet text."
      : currentGameName() + " · Army Forge";
  }

  if (els.newRecruitImportCopy) {
    els.newRecruitImportCopy.textContent = opr
      ? "If you use New Recruit for " + currentGameName() + ", export the roster as JSON, ROS or ROSZ. Army Forge share links are also supported below."
      : aos
        ? "Export your Age of Sigmar 4th edition roster from New Recruit, then choose the JSON, ROS or ROSZ file here."
        : heresy
          ? "Export your Horus Heresy 3rd Edition roster from New Recruit, then choose the JSON, ROS or ROSZ file here."
          : killTeam
            ? "Export your Kill Team 2024 roster from New Recruit, then choose the JSON, ROS or ROSZ file here."
            : legionsImperialis
              ? "Export your Legions Imperialis roster from New Recruit, then choose the JSON, ROS or ROSZ file here."
              : "Export your Warhammer 40,000 roster from New Recruit, then choose the JSON, ROS, ROSZ or TXT file here.";
  }
  if (els.importButton) {
    els.importButton.textContent = "Choose New Recruit file";
  }
  if (els.fileInput) {
    els.fileInput.accept = fortyK
      ? ".json,.ros,.rosz,.txt,application/json,text/plain,application/xml,text/xml,application/zip"
      : ".json,.ros,.rosz,application/json,application/xml,text/xml,application/zip";
  }

  const setupHeroTitle = els.welcome?.querySelector(".setup-hero h1");
  if (setupHeroTitle) {
    setupHeroTitle.textContent = dnd ? "Load your character." : "Load your army.";
  }

  const setupHero = els.welcome?.querySelector(".setup-hero .lede");
  if (setupHero) {
    setupHero.textContent = opr
      ? isWarfleetsMode()
        ? "Paste your Army Forge Warfleets fleet and use ship, weapon and system lookup at the table."
        : isOprQuestMode()
          ? "Import your " + currentGameName() + " heroes from an Army Forge shared campaign/list and use Tabletop Voice at the table."
          : "Import your " + currentGameName() + " force from Army Forge or New Recruit, then use Tabletop Voice at the table."
      : aos
        ? "Import your Age of Sigmar army from New Recruit, then use Tabletop Voice for warscroll lookup at the table."
        : heresy
          ? "Import your Horus Heresy army from New Recruit for profiles, weapons, reactions, wargear and rules at the table."
          : killTeam
            ? "Import your Kill Team from New Recruit for operative profiles, weapons, abilities and team rules at the table."
            : legionsImperialis
              ? "Import your Legions Imperialis army from New Recruit or Legion Companion for detachment profiles, weapons and formation rules at the table."
              : necromunda
                ? "Import a current Necromunda N26 gang from a public Gyrinx share link for fighter profiles, weapons, skills, gear and campaign state."
                : dnd
                  ? "Import a D&D Beyond character, then use voice for attacks and spells while Tabletop Voice tracks slots, action economy and inventory."
                  : "Bring in your New Recruit lists, or load the wider dataset when you need broader 40K lookup at the table.";
  }

  updateGameContextUi();
}

function showFirstRunIfNeeded() {
  if (!els.firstRunModal) return;
  if (new URLSearchParams(location.search).has("tvshare")) return;
  const seen = localStorage.getItem("tv_beta_notice_seen_v2") === "1";
  if (!seen) els.firstRunModal.classList.remove("hidden");
}

function dismissFirstRun() {
  localStorage.setItem("tv_beta_notice_seen_v2", "1");
  els.firstRunModal?.classList.add("hidden");
}

async function handleFiles(event) {
  const files = [...event.target.files];
  if (!files.length) return;

  for (const file of files) {
    try {
      const roster = await parseRosterUpload(file);
      const importedGame = inferRosterGameSystem(roster);

      if (state.gameSystem && importedGame !== state.gameSystem) {
        throw new Error(
          "This looks like a " + gameSystemDisplayName(importedGame) +
          " list. Switch game system in Settings before importing it."
        );
      }

      const existingIndex = state.rosters.findIndex(existing =>
        existing.source === "new-recruit" &&
        normalize(existing.name) === normalize(roster.name) &&
        normalize(existing.faction) === normalize(roster.faction)
      );

      if (existingIndex >= 0) {
        state.rosters.splice(existingIndex, 1, roster);
        state.activeRoster = existingIndex;
      } else {
        state.rosters.push(roster);
        state.activeRoster = state.rosters.length - 1;
      }

      state.detachmentStratagemLoadKey = "";
      activateRosterSearchScopes(roster);
      persist();
      showApp();
      renderAll();
      toast(`Imported ${roster.name}`);
    } catch (err) {
      console.error(err);
      toast(err?.message ? `Could not import ${file.name}: ${err.message}` : `Could not import ${file.name}`);
    }
  }

  els.fileInput.value = "";
}

const OPR_GAME_NAMES = {
  gf:"Grimdark Future",
  gff:"Grimdark Future: Firefight",
  aof:"Age of Fantasy",
  aofs:"Age of Fantasy: Skirmish",
  aofr:"Age of Fantasy: Regiments",
  aofq:"Age of Fantasy: Quest",
  aofqai:"Age of Fantasy: Quest",
  gfsq:"Grimdark Future: Star Quest",
  gfsqai:"Grimdark Future: Star Quest",
  "age-of-fantasy-regiments":"Age of Fantasy: Regiments",
  "age-of-fantasy-quest":"Age of Fantasy: Quest",
  "age-of-fantasy-quest-ai":"Age of Fantasy: Quest",
  "grimdark-future-star-quest":"Grimdark Future: Star Quest",
  "grimdark-future-star-quest-ai":"Grimdark Future: Star Quest",
  gfwf:"Grimdark Future: Warfleets",
  "grimdark-future-warfleet":"Grimdark Future: Warfleets",
  "grimdark-future-warfleets":"Grimdark Future: Warfleets"
};

function oprGameName(code = "") {
  const key = String(code || "").toLowerCase();
  const systemKey = oprGameSystemKey(key);
  return OPR_GAME_NAMES[key] || GAME_SYSTEMS[systemKey]?.name || (key ? key.toUpperCase() : "OnePageRules");
}

function extractOprArmyId(value = "") {
  const trimmed = String(value || "").trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    const id =
      url.searchParams.get("id") ||
      url.searchParams.get("listId") ||
      url.searchParams.get("shareId");
    if (id && /^[A-Za-z0-9_-]+$/.test(id)) return id;

    const segments = url.pathname.split("/").filter(Boolean);
    const tail = segments.at(-1) || "";
    return /^[A-Za-z0-9_-]{8,}$/.test(tail) ? tail : null;
  } catch {
    return /^[A-Za-z0-9_-]+$/.test(trimmed) ? trimmed : null;
  }
}

function oprRuleLabel(rule = {}) {
  if (rule.label) return String(rule.label);
  const name = String(rule.name || "Rule");
  const rating = rule.rating;
  return rating !== undefined && rating !== null && rating !== ""
    ? name + "(" + rating + ")"
    : name;
}

function buildOprRuleLookup(data) {
  const byId = new Map();
  const byName = new Map();

  for (const rule of data?.specialRules || []) {
    if (!rule || !rule.name) continue;
    if (rule.id) byId.set(String(rule.id), rule);
    byName.set(normalize(rule.name), rule);
  }

  return {byId, byName};
}

function resolveOprRule(rule, lookup, category = "Special rule") {
  if (!rule?.name) return null;

  const definition =
    (rule.id && lookup.byId.get(String(rule.id))) ||
    lookup.byName.get(normalize(rule.name)) ||
    null;

  const rating = rule.rating;
  let text = String(definition?.description || rule.description || "").trim();
  if (rating !== undefined && rating !== null && rating !== "") {
    text = text.replace(/\bX\b/g, String(rating));
  }

  return {
    name:oprRuleLabel(rule),
    text,
    category
  };
}

function collectOprUnitRuleRefs(unit) {
  const refs = [...(unit?.rules || [])];

  for (const item of unit?.items || []) {
    refs.push(...(item?.content || []));
  }

  for (const selected of unit?.selectedUpgrades || []) {
    for (const gain of selected?.option?.gains || []) {
      if (gain?.type === "ArmyBookRule") refs.push(gain);
      if (gain?.type === "ArmyBookItem") refs.push(...(gain.content || []));
    }
  }

  return dedupeBy(
    refs.filter(rule => rule?.name),
    rule => normalize(oprRuleLabel(rule))
  );
}

function oprWeaponKey(weapon = {}) {
  return normalize([
    weapon.name,
    weapon.range,
    weapon.attacks,
    (weapon.specialRules || []).map(oprRuleLabel).join("|")
  ].join("|"));
}

function oprUnitTotalCost(unit) {
  let total = Number(unit?.totalCost ?? unit?.cost ?? 0) || 0;
  if (unit?.totalCost != null) return total;

  for (const selected of unit?.selectedUpgrades || []) {
    const option = selected?.option;
    if (!option) continue;

    const matched = Array.isArray(option.costs)
      ? option.costs.find(entry => String(entry?.unitId || "") === String(unit?.id || ""))
      : null;

    const add = Number(matched?.cost ?? option.cost ?? 0);
    if (Number.isFinite(add)) total += add;
  }

  return total;
}

function mergeOprLoadouts(units) {
  const merged = new Map();

  for (const unit of units || []) {
    for (const weapon of unit?.loadout || unit?.weapons || []) {
      if (!weapon?.name) continue;
      const key = oprWeaponKey(weapon);
      if (!merged.has(key)) {
        merged.set(key, {...weapon, count:Number(weapon.count || 1)});
      } else {
        const current = merged.get(key);
        current.count = Number(current.count || 0) + Number(weapon.count || 1);
      }
    }
  }

  return [...merged.values()];
}

function collapseOprCombinedUnits(units = []) {
  const raw = Array.isArray(units) ? units : [];
  const roots = raw.filter(unit => !unit?.joinToUnit);
  const used = new Set();
  const output = [];

  for (const root of roots) {
    const group = [root];
    used.add(root.selectionId || root);

    if (root.combined && root.selectionId) {
      for (const candidate of raw) {
        if (candidate?.joinToUnit === root.selectionId) {
          group.push(candidate);
          used.add(candidate.selectionId || candidate);
        }
      }
    }

    if (group.length === 1) {
      output.push(root);
      continue;
    }

    output.push({
      ...root,
      size:group.reduce((sum, unit) => sum + Number(unit.size || 0), 0),
      cost:group.reduce((sum, unit) => sum + oprUnitTotalCost(unit), 0),
      totalCost:group.reduce((sum, unit) => sum + oprUnitTotalCost(unit), 0),
      rules:dedupeBy(group.flatMap(unit => unit.rules || []), rule => normalize(oprRuleLabel(rule))),
      items:group.flatMap(unit => unit.items || []),
      selectedUpgrades:group.flatMap(unit => unit.selectedUpgrades || []),
      loadout:mergeOprLoadouts(group),
      notes:group.map(unit => String(unit.notes || "").trim()).filter(Boolean).join("\n")
    });
  }

  for (const unit of raw) {
    const key = unit?.selectionId || unit;
    if (!used.has(key)) output.push(unit);
  }

  return output;
}

function buildOprWeaponProfile(weapon) {
  const special = (weapon?.specialRules || [])
    .map(oprRuleLabel)
    .filter(Boolean)
    .join(", ");

  const range = Number(weapon?.range || 0);

  return {
    name:String(weapon?.name || "Weapon"),
    type:"OPR Weapon",
    system:"opr",
    quantity:Math.max(1, Number(weapon?.count || 1)),
    values:[
      {label:"Range", value:range > 0 ? range + '\"' : "Melee"},
      {label:"A", value:String(Number(weapon?.attacks || 0) || "—")},
      {label:"Special", value:special || "—"}
    ]
  };
}

function buildOprUnit(rawUnit, data, index) {
  const lookup = buildOprRuleLookup(data);
  const ruleRefs = collectOprUnitRuleRefs(rawUnit);
  const rules = ruleRefs
    .map(rule => resolveOprRule(rule, lookup))
    .filter(Boolean);

  if (rawUnit?.notes) {
    rules.push({name:"Notes", text:String(rawUnit.notes), category:"Notes"});
  }

  const hero = ruleRefs.some(rule => normalize(rule.name) === "hero");
  const displayName = String(rawUnit?.customName || rawUnit?.name || rawUnit?.genericName || "Unit");
  const baseName = String(rawUnit?.name || rawUnit?.genericName || "");

  return {
    id:"opr-" + String(rawUnit?.selectionId || rawUnit?.id || index),
    name:displayName,
    type:"OPR Unit",
    system:"opr",
    gameSystem:String(data?.gameSystem || ""),
    gameSystemKey:oprGameSystemKey(data?.gameSystem),
    categories:hero ? ["Hero"] : [],
    stats:[
      {label:"Quality", value:Number(rawUnit?.quality) ? rawUnit.quality + "+" : "—"},
      {label:"Defence", value:Number(rawUnit?.defense) ? rawUnit.defense + "+" : "—"},
      {label:"Models", value:String(Number(rawUnit?.size || 1))},
      {label:"Pts", value:String(oprUnitTotalCost(rawUnit))}
    ],
    rules:dedupeBy(rules, rule => normalize(rule.name + "|" + rule.text)),
    profiles:mergeOprLoadouts([rawUnit]).map(buildOprWeaponProfile),
    searchText:normalize([
      displayName,
      baseName,
      rawUnit?.genericName,
      ruleRefs.map(oprRuleLabel),
      (rawUnit?.loadout || rawUnit?.weapons || []).map(weapon => [
        weapon.name,
        (weapon.specialRules || []).map(oprRuleLabel)
      ])
    ].flat(3).join(" "))
  };
}

function buildOprArmyRules(data) {
  const lookup = buildOprRuleLookup(data);
  const refs = [];

  for (const unit of data?.units || []) {
    refs.push(...collectOprUnitRuleRefs(unit));
    for (const weapon of unit?.loadout || unit?.weapons || []) {
      refs.push(...(weapon?.specialRules || []));
    }
  }

  const rules = dedupeBy(
    refs
      .map(rule => resolveOprRule(rule, lookup))
      .filter(rule => rule?.name && rule?.text),
    rule => normalize(rule.name + "|" + rule.text)
  );

  for (const spell of data?.spells || []) {
    if (!spell?.name || !spell?.effect) continue;
    rules.push({
      name:String(spell.name),
      text:String(spell.effect),
      category:spell.threshold != null ? "Spell · " + spell.threshold + "+" : "Spell"
    });
  }

  return dedupeBy(rules, rule => normalize(rule.name + "|" + rule.text));
}

function buildOprRoster(data, armyId) {
  if (!data || !Array.isArray(data.units) || !data.units.length) {
    throw new Error("Army Forge returned no units for this shared list.");
  }

  const rawGameCode = String(
    data.gameSystem ||
    data.gameSystemKey ||
    data.gameSystemSlug ||
    data.gameSystemId ||
    ""
  ).toLowerCase();
  const resolvedGameSystemKey = oprGameSystemKey(rawGameCode) || "opr-other";

  const collapsed = collapseOprCombinedUnits(data.units);
  const units = collapsed.map((unit, index) => {
    const built = buildOprUnit(unit, data, index);
    built.gameSystem = rawGameCode;
    built.gameSystemKey = resolvedGameSystemKey;
    return built;
  });
  const factionNames = Array.isArray(data.armyNames)
    ? data.armyNames.filter(Boolean)
    : [];

  return {
    id:crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
    externalId:String(armyId),
    name:String(data.name || factionNames[0] || "OnePageRules army"),
    faction:factionNames.join(" + ") || "OnePageRules",
    source:"opr",
    gameSystemKey:resolvedGameSystemKey,
    importFormat:"army-forge-link",
    gameSystem:rawGameCode,
    gameName:GAME_SYSTEMS[resolvedGameSystemKey]?.name || oprGameName(rawGameCode),
    points:Number.isFinite(Number(data.listPoints)) ? Number(data.listPoints) : null,
    units,
    armyRules:buildOprArmyRules(data),
    referenceData:{rules:[], stratagems:[]},
    importedAt:Date.now()
  };
}


function splitWarfleetsList(value = "") {
  return String(value || "")
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);
}

function parseWarfleetsWeaponBlock(block = "") {
  const profiles = [];
  const text = String(block || "").trim();
  if (!text) return profiles;

  const weaponPattern = /\[([A-Z])\]\s*([^()]+?)\s*\(\s*Ran\s*([^/),]+?)\s*\/\s*Att\s*(\d+)\s*\/\s*Str\s*(-?\d+)(?:\s*,\s*([^)]+))?\s*\)/gi;
  let match;

  while ((match = weaponPattern.exec(text))) {
    profiles.push({
      name:match[2].trim(),
      type:"Warfleets Weapon",
      system:"warfleet",
      quantity:1,
      values:[
        {label:"Facing", value:match[1].toUpperCase()},
        {label:"Range", value:match[3].trim()},
        {label:"A", value:match[4]},
        {label:"Str", value:match[5]},
        {label:"Special", value:String(match[6] || "").trim() || "—"}
      ]
    });
  }

  return profiles;
}

function parseWarfleetsTurret(text = "") {
  const match = String(text || "").match(
    /(?:\[T\]\s*)?Turret\s*\(\s*Ran\s*([^/),]+?)\s*\/\s*Att\s*(\d+)\s*\/\s*Str\s*(-?\d+)(?:\s*,\s*([^)]+))?\s*\)/i
  );
  if (!match) return null;

  return {
    name:"Turret",
    type:"Warfleets Weapon",
    system:"warfleet",
    quantity:1,
    values:[
      {label:"Facing", value:"T"},
      {label:"Range", value:match[1].trim()},
      {label:"A", value:match[2]},
      {label:"Str", value:match[3]},
      {label:"Special", value:String(match[4] || "").trim() || "—"}
    ]
  };
}

function warfleetsRuleEntries(names = [], category = "Special rule") {
  return dedupeBy(
    (names || [])
      .map(name => String(name || "").trim())
      .filter(Boolean)
      .map(name => ({name, text:"", category})),
    rule => normalize(rule.name)
  );
}

function parseWarfleetsModelLine(line, index) {
  const cleaned = String(line || "")
    .replace(/[“”]/g, '"')
    .replace(/\u00a0/g, " ")
    .trim();

  if (!cleaned || /^\+\+/.test(cleaned)) return null;

  const match = cleaned.match(
    /^(.+?)(?:\s*\[([^\]]+)\])?\s*\|\s*Mov\s*([0-9.]+)"?\s+Cru\s*([0-9.]+)"?\s+Eva\s*(\d+\+?)\s+Tou\s*(\d+\+?)\s*\|\s*(\d+)\s*pts?\s*(?:\|\s*(.*))?$/i
  );
  if (!match) return null;

  const name = match[1].trim();
  const classText = String(match[2] || "").trim();
  const remainder = String(match[8] || "").trim();

  const weaponsMatch = remainder.match(/\bWeapons\s*:/i);
  const systemsMatch = remainder.match(/\bSystems\s*:/i);
  const turretMatch = remainder.match(/(?:\[T\]\s*)?Turret\s*\(/i);
  const weaponsIndex = weaponsMatch?.index ?? -1;
  const systemsIndex = systemsMatch?.index ?? -1;

  let prefixEnd = remainder.length;
  for (const candidate of [turretMatch?.index, weaponsIndex, systemsIndex]) {
    if (Number.isInteger(candidate) && candidate >= 0) prefixEnd = Math.min(prefixEnd, candidate);
  }

  const prefixRules = splitWarfleetsList(
    remainder.slice(0, prefixEnd).replace(/[,\s]+$/, "")
  );

  let weaponBlock = "";
  if (weaponsIndex >= 0) {
    const start = weaponsIndex + weaponsMatch[0].length;
    const end = systemsIndex > weaponsIndex ? systemsIndex : remainder.length;
    weaponBlock = remainder.slice(start, end).trim();
  }

  let systems = [];
  if (systemsIndex >= 0) {
    const start = systemsIndex + systemsMatch[0].length;
    systems = splitWarfleetsList(remainder.slice(start));
  }

  const turret = parseWarfleetsTurret(remainder);
  const profiles = [
    ...(turret ? [turret] : []),
    ...parseWarfleetsWeaponBlock(weaponBlock)
  ];

  const classParts = classText.split(/\s+/).filter(Boolean);
  const slotValue = classParts.length && /^\d+$/.test(classParts.at(-1))
    ? classParts.pop()
    : "";
  const hullClass = classParts.join(" ");
  const squadron = /squadron/i.test(name) || /squadron/i.test(classText);

  const rules = [
    ...warfleetsRuleEntries(prefixRules, "Special rule"),
    ...warfleetsRuleEntries(systems, "System")
  ];

  return {
    id:"gfwf-" + index + "-" + normalize(name).replace(/\s+/g, "-"),
    name,
    type:squadron ? "Warfleets Squadron" : "Warfleets Ship",
    system:"warfleet",
    gameSystem:"gfwf",
    gameSystemKey:"opr-warfleets",
    categories:[
      squadron ? "Squadron" : "Ship",
      hullClass || classText
    ].filter(Boolean),
    stats:[
      {label:"Move", value:match[3] + '"'},
      {label:"Cruise", value:match[4] + '"'},
      {label:"Evasion", value:match[5]},
      {label:"Toughness", value:match[6]},
      ...(slotValue ? [{label:"Upgrades", value:slotValue}] : []),
      {label:"Pts", value:match[7]}
    ],
    rules,
    profiles,
    warfleets:{
      hullClass:hullClass || classText,
      upgradeSlots:slotValue ? Number(slotValue) : null,
      systems,
      specialRules:prefixRules
    },
    searchText:normalize([
      name,
      hullClass,
      prefixRules,
      systems,
      profiles.map(profile => [
        profile.name,
        (profile.values || []).map(value => value.value)
      ])
    ].flat(4).join(" "))
  };
}

function parseWarfleetsShareText(text) {
  const normalizedText = String(text || "")
    .replace(/\r/g, "")
    .replace(/[“”]/g, '"')
    .replace(/\u00a0/g, " ")
    .trim();

  if (!/\[\s*GFWF\b/i.test(normalizedText)) {
    throw new Error("This does not look like a Warfleets Share as Text export.");
  }

  const lines = normalizedText
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);

  const headerLine = lines.find(line => /\[\s*GFWF\b/i.test(line)) || "";
  const pointsMatch = headerLine.match(/\[\s*GFWF\s+(\d+)\s*pts?\s*\]/i);
  const points = pointsMatch ? Number(pointsMatch[1]) : null;

  const headerBody = headerLine
    .replace(/^\+\+\s*/, "")
    .replace(/\s*\[\s*GFWF\b.*$/i, "")
    .replace(/\s*\+\+\s*$/, "")
    .trim();

  const withoutVersion = headerBody.replace(/\s*\(v?[\d.]+\)\s*$/i, "").trim();
  const divider = withoutVersion.lastIndexOf(" - ");
  const listName = divider >= 0 ? withoutVersion.slice(0, divider).trim() : withoutVersion;
  const faction = divider >= 0
    ? withoutVersion.slice(divider + 3).trim()
    : "Grimdark Future: Warfleets";

  const modelLines = lines.filter(line => line !== headerLine);
  const units = modelLines
    .map((line, index) => parseWarfleetsModelLine(line, index))
    .filter(Boolean);

  if (!units.length) {
    throw new Error(
      "The GFWF header was found, but no ships or squadrons could be read. Copy the complete Army Forge Share as Text output."
    );
  }

  const totalFromModels = units.reduce((sum, unit) => {
    const stat = (unit.stats || []).find(item => normalize(item.label) === "pts");
    return sum + (Number(stat?.value) || 0);
  }, 0);

  const armyRules = dedupeBy(
    units.flatMap(unit => unit.rules || []),
    rule => normalize((rule.category || "") + "|" + rule.name)
  );

  return {
    id:crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
    externalId:null,
    name:listName || "Warfleets fleet",
    faction:faction || "Grimdark Future: Warfleets",
    source:"opr",
    gameSystemKey:"opr-warfleets",
    importFormat:"army-forge-text",
    gameSystem:"gfwf",
    gameName:"Grimdark Future: Warfleets",
    points:Number.isFinite(points) ? points : totalFromModels,
    units,
    armyRules,
    referenceData:{rules:[], stratagems:[]},
    importedAt:Date.now()
  };
}


async function loadOprArmyForgeList() {
  const rawInput = String(els.oprShareInput?.value || "").trim();
  const warfleetsText = /\[\s*GFWF\b/i.test(rawInput);

  if (isWarfleetsMode() || warfleetsText) {
    try {
      const roster = parseWarfleetsShareText(rawInput);

      if (state.gameSystem && state.gameSystem !== "opr-warfleets") {
        throw new Error(
          "This is a Grimdark Future: Warfleets fleet. Switch game system in Settings before importing it."
        );
      }

      const existingIndex = state.rosters.findIndex(existing =>
        existing.source === "opr" &&
        existing.gameSystemKey === "opr-warfleets" &&
        normalize(existing.name) === normalize(roster.name) &&
        normalize(existing.faction) === normalize(roster.faction)
      );

      if (existingIndex >= 0) {
        state.rosters.splice(existingIndex, 1, roster);
        state.activeRoster = existingIndex;
      } else {
        state.rosters.push(roster);
        state.activeRoster = state.rosters.length - 1;
      }

      state.unitBrowserSourceId = "roster:" + roster.id;
      localStorage.setItem("tv_unit_browser_source", state.unitBrowserSourceId);
      state.selected = null;
      state.selectedRosterId = null;

      persist();
      renderAll();
      switchPage("datasheets", {silent:true});

      if (els.oprShareInput) els.oprShareInput.value = "";
      if (els.oprImportStatus) {
        els.oprImportStatus.dataset.busy = "";
        els.oprImportStatus.textContent =
          "Imported " + roster.units.length + " ships/squadrons" +
          (roster.points != null ? " · " + roster.points + " pts" : "");
      }
      toast("Imported " + roster.name);
      return;
    } catch (error) {
      console.error("Warfleets import failed", error);
      if (els.oprImportStatus) {
        els.oprImportStatus.dataset.busy = "";
        els.oprImportStatus.textContent = error.message || "Could not import this Warfleets fleet.";
      }
      toast(error.message || "Could not import Warfleets fleet.");
      return;
    }
  }

  const armyId = extractOprArmyId(rawInput);
  if (!armyId) {
    if (els.oprImportStatus) {
      els.oprImportStatus.textContent = "Paste an Army Forge Share as Link URL first.";
    }
    toast("Paste a valid Army Forge share link.");
    return;
  }

  const button = els.oprImportButton;
  if (button) {
    button.disabled = true;
    button.textContent = "Importing…";
  }
  if (els.oprImportStatus) {
    els.oprImportStatus.dataset.busy = "1";
    els.oprImportStatus.textContent = "Loading the shared list from Army Forge…";
  }

  try {
    const response = await fetch("./api/opr-army?id=" + encodeURIComponent(armyId), {
      headers:{"Accept":"application/json"}
    });

    let data = {};
    try { data = await response.json(); } catch {}

    if (!response.ok) {
      throw new Error(data.error || "Could not load that Army Forge list.");
    }

    const gameCode = String(
      data.gameSystem ||
      data.gameSystemKey ||
      data.gameSystemSlug ||
      data.gameSystemId ||
      ""
    ).toLowerCase();
    const importedGame = oprGameSystemKey(gameCode);
    const supportedOprGames = [
      "grimdark",
      "grimdark-firefight",
      "aof",
      "aof-skirmish",
      "aof-regiments",
      "aof-quest",
      "opr-star-quest"
    ];

    if (!supportedOprGames.includes(importedGame)) {
      throw new Error("This Army Forge game is not supported yet.");
    }

    if (state.gameSystem && importedGame !== state.gameSystem) {
      throw new Error(
        "This is a " + gameSystemDisplayName(importedGame) +
        " list. Switch game system in Settings before importing it."
      );
    }

    const roster = buildOprRoster(data, armyId);
    const existingIndex = state.rosters.findIndex(existing =>
      existing.source === "opr" && existing.externalId === armyId
    );

    if (existingIndex >= 0) {
      state.rosters.splice(existingIndex, 1, roster);
      state.activeRoster = existingIndex;
    } else {
      state.rosters.push(roster);
      state.activeRoster = state.rosters.length - 1;
    }

    state.unitBrowserSourceId = "roster:" + roster.id;
    localStorage.setItem("tv_unit_browser_source", state.unitBrowserSourceId);
    state.selected = null;
    state.selectedRosterId = null;

    persist();
    renderAll();
    switchPage("datasheets", {silent:true});

    if (els.oprShareInput) els.oprShareInput.value = "";
    if (els.oprImportStatus) {
      els.oprImportStatus.dataset.busy = "";
      els.oprImportStatus.textContent =
        "Imported " + roster.units.length + " units · " + roster.gameName +
        (roster.points != null ? " · " + roster.points + " pts" : "");
    }
    toast("Imported " + roster.name);
  } catch (error) {
    console.error("OPR import failed", error);
    if (els.oprImportStatus) {
      els.oprImportStatus.dataset.busy = "";
      els.oprImportStatus.textContent = error.message || "Could not import this Army Forge list.";
    }
    toast(error.message || "Could not import OPR list.");
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "Import OPR list";
    }
  }
}


let liCommunityReferencePromise = null;

function liCommunityNameKey(value = "") {
  return normalize(
    String(value || "")
      .replace(/\b(detachment|squadron|talon|battery)\b/gi, " ")
      .replace(/\s+/g, " ")
  );
}

async function loadLiCommunityReference() {
  if (liCommunityReferencePromise) return liCommunityReferencePromise;

  liCommunityReferencePromise = Promise.all([
    fetch("./li-community-units-weapons.json").then(response => {
      if (!response.ok) throw new Error("Could not load the Legions unit reference.");
      return response.json();
    }),
    fetch("./li-community-detachments.json").then(response => {
      if (!response.ok) throw new Error("Could not load the Legions detachment reference.");
      return response.json();
    }),
    fetch("./li-community-formations.json").then(response => {
      if (!response.ok) throw new Error("Could not load the Legions formation reference.");
      return response.json();
    })
  ]).then(([unitWeaponData, detachmentData, formationData]) => {
    const units = unitWeaponData.units || [];
    const weapons = unitWeaponData.weapons || [];
    const detachments = detachmentData.detachments || [];
    const formations = formationData.formations || [];

    const detachmentByName = new Map();
    const detachmentByLooseName = new Map();
    for (const detachment of detachments) {
      const exactKey = normalize(detachment.name);
      const looseKey = liCommunityNameKey(detachment.name);
      if (exactKey && !detachmentByName.has(exactKey)) detachmentByName.set(exactKey, detachment);
      if (looseKey && !detachmentByLooseName.has(looseKey)) detachmentByLooseName.set(looseKey, detachment);
    }

    const formationByName = new Map();
    for (const formation of formations) {
      const key = normalize(formation.name);
      if (key && !formationByName.has(key)) formationByName.set(key, formation);
    }

    return {
      units,
      weapons,
      detachments,
      formations,
      unitById:new Map(units.map(unit => [String(unit.id), unit])),
      weaponById:new Map(weapons.map(weapon => [String(weapon.id), weapon])),
      weaponByName:new Map(weapons.map(weapon => [normalize(weapon.name), weapon])),
      detachmentById:new Map(detachments.map(detachment => [String(detachment.id), detachment])),
      detachmentByName,
      detachmentByLooseName,
      formationById:new Map(formations.map(formation => [String(formation.id), formation])),
      formationByName
    };
  }).catch(error => {
    liCommunityReferencePromise = null;
    throw error;
  });

  return liCommunityReferencePromise;
}

function findLiCommunityDetachment(reference, id, name) {
  const idCandidates = [
    id,
    typeof id === "object" ? id?.id : null,
    typeof id === "object" ? id?.data_id : null
  ].filter(value => value !== null && value !== undefined && value !== "");

  for (const candidate of idCandidates) {
    const exact = reference.detachmentById.get(String(candidate));
    if (exact) return exact;
  }

  const exactName = reference.detachmentByName.get(normalize(name || ""));
  if (exactName) return exactName;

  const loose = reference.detachmentByLooseName.get(liCommunityNameKey(name || ""));
  if (loose) return loose;

  const key = liCommunityNameKey(name || "");
  if (!key) return null;

  const candidates = reference.detachments.filter(detachment => {
    const detKey = liCommunityNameKey(detachment.name);
    return detKey.includes(key) || key.includes(detKey);
  });

  return candidates.length === 1 ? candidates[0] : null;
}

function findLiCommunityFormation(reference, id, name) {
  if (id !== null && id !== undefined && id !== "") {
    const exact = reference.formationById.get(String(id));
    if (exact) return exact;
  }

  const key = normalize(name || "");
  if (!key) return null;

  const exact = reference.formationByName.get(key);
  if (exact) return exact;

  const candidates = reference.formations.filter(formation => {
    const formKey = normalize(formation.name);
    return formKey.includes(key) || key.includes(formKey);
  });

  return candidates.length === 1 ? candidates[0] : null;
}

function liCommunityTraitText(traits = []) {
  return (traits || []).map(trait => {
    if (!trait?.name) return "";
    return trait.value !== null && trait.value !== undefined && trait.value !== ""
      ? trait.name + " (" + trait.value + ")"
      : trait.name;
  }).filter(Boolean).join(", ");
}

function liCommunityWeaponProfile(weapon) {
  const profiles = [];

  for (const profile of weapon?.profiles || []) {
    profiles.push({
      name:weapon.name || "Weapon",
      type:"Weapon",
      system:"legions-imperialis",
      quantity:1,
      values:[
        {label:"Range", value:profile.range ?? "—"},
        {label:"Dice", value:profile.dice ?? "—"},
        {
          label:"To Hit",
          value:profile.toHit === null || profile.toHit === undefined
            ? "—"
            : String(profile.toHit).endsWith("+")
              ? String(profile.toHit)
              : String(profile.toHit) + "+"
        },
        {
          label:"AP",
          value:typeof profile.ap === "number"
            ? (profile.ap === 0 ? "0" : "-" + profile.ap)
            : profile.ap ?? "—"
        },
        {label:"Traits", value:liCommunityTraitText(profile.traits) || "—"}
      ]
    });
  }

  return profiles;
}

function liCommunityUnitProfile(unit) {
  return {
    name:unit.name || "Model",
    values:[
      {label:"Move", value:unit.move ?? "—"},
      {
        label:"Sv",
        value:unit.sv === null || unit.sv === undefined
          ? "—"
          : String(unit.sv).endsWith("+")
            ? String(unit.sv)
            : String(unit.sv) + "+"
      },
      {
        label:"CAF",
        value:unit.caf === null || unit.caf === undefined
          ? "—"
          : Number(unit.caf) > 0 && !String(unit.caf).startsWith("+")
            ? "+" + unit.caf
            : String(unit.caf)
      },
      {
        label:"Morale",
        value:unit.morale === null || unit.morale === undefined
          ? "—"
          : String(unit.morale).endsWith("+")
            ? String(unit.morale)
            : String(unit.morale) + "+"
      },
      {label:"W", value:unit.w ?? "—"}
    ]
  };
}

function liCommunitySelectionText(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    return value.map(liCommunitySelectionText).filter(Boolean).join(", ");
  }

  const parts = [];
  for (const [key, item] of Object.entries(value)) {
    if (["id","slot_id","formation_id","formationId","detachmentId","data_id"].includes(key)) continue;
    const text = liCommunitySelectionText(item);
    if (text) parts.push(key + ": " + text);
  }
  return parts.join("; ");
}

function matchLiCommunityWeapon(reference, name) {
  const key = normalize(String(name || "")
    .replace(/^(turret|hull|sponson|sponsons|pintle|arm|main|wing)\s*:\s*/i, "")
    .replace(/\bmounted\b/gi, " ")
    .replace(/\s+/g, " ")
  );
  if (!key || key === "none") return null;

  const exact = reference.weaponByName.get(key);
  if (exact) return exact;

  const candidates = reference.weapons.filter(weapon => {
    const weaponKey = normalize(weapon.name.replace(/\bmounted\b/gi, " "));
    return weaponKey === key || weaponKey.includes(key) || key.includes(weaponKey);
  });

  return candidates.length === 1 ? candidates[0] : null;
}

function buildLiCommunityUnit(raw, reference, index) {
  const refDetachment = findLiCommunityDetachment(reference, raw.id, raw.name);
  const mainUnitIds = [...(refDetachment?.mainUnit || [])];
  let selectedUnitIds = [...(raw.selectedUnitRefs || [])];

  if (!selectedUnitIds.length && refDetachment?.upgradeOptions?.length && raw.notes?.length) {
    const noteText = normalize(raw.notes.join(" "));
    for (const upgrade of refDetachment.upgradeOptions) {
      const upgradeKey = normalize(upgrade.name || "");
      if (upgradeKey && noteText.includes(upgradeKey) && upgrade.unitRef != null) {
        selectedUnitIds.push(upgrade.unitRef);
        continue;
      }

      const meaningfulWords = upgradeKey
        .split(" ")
        .filter(word => word.length > 4 && !["additional","models","model"].includes(word));
      if (
        meaningfulWords.length &&
        meaningfulWords.every(word => noteText.includes(word)) &&
        upgrade.unitRef != null
      ) {
        selectedUnitIds.push(upgrade.unitRef);
      }
    }
  }

  const relatedFallback = selectedUnitIds.length
    ? selectedUnitIds
    : (refDetachment?.relatedUnit || []);

  const refUnitIds = dedupeBy(
    [...mainUnitIds, ...relatedFallback],
    value => String(value)
  );

  const refUnits = refUnitIds
    .map(id => reference.unitById.get(String(id)))
    .filter(Boolean);

  const profiles = refUnits.map(liCommunityUnitProfile);

  const weaponIds = new Set(
    refUnits.flatMap(unit => unit.weapons || []).map(id => String(id))
  );

  for (const selectedWeapon of raw.selectedWeapons || []) {
    const match = matchLiCommunityWeapon(reference, selectedWeapon);
    if (match) weaponIds.add(String(match.id));
  }

  const weapons = [...weaponIds]
    .map(id => reference.weaponById.get(String(id)))
    .filter(Boolean)
    .flatMap(liCommunityWeaponProfile);

  const rules = [];
  for (const unit of refUnits) {
    for (const rule of unit.rules || []) {
      const ruleName = rule.value !== null && rule.value !== undefined && rule.value !== ""
        ? rule.name + " (" + rule.value + ")"
        : rule.name;
      rules.push({name:ruleName, text:"", category:"Special Rule"});
    }
  }

  for (const note of raw.notes || []) {
    if (!note) continue;
    rules.push({
      name:"Selected configuration",
      text:String(note),
      category:"Loadout"
    });
  }

  const primary = profiles[0]?.values || [];
  const stats = primary.map(item => ({...item}));
  if (raw.points !== null && raw.points !== undefined && raw.points !== "") {
    stats.push({label:"Pts", value:String(raw.points)});
  }

  const categories = dedupeBy([
    raw.slotType,
    ...(refDetachment?.types || []),
    ...refUnits.map(unit => unit.unitType)
  ].filter(Boolean), value => normalize(value));

  const name = raw.name || refDetachment?.name || "Detachment";

  return {
    id:"li-community-" + index + "-" + normalize(name).replace(/\s+/g, "-"),
    externalId:raw.id ?? null,
    name,
    type:"Detachment",
    system:"legions-imperialis",
    gameSystemKey:"legions-imperialis",
    categories,
    stats,
    rules:dedupeBy(rules, rule => normalize(rule.category + "|" + rule.name + "|" + rule.text)),
    profiles:dedupeBy(
      weapons,
      profile => normalize(profile.name + "|" + JSON.stringify(profile.values || []))
    ),
    legionsImperialisProfiles:profiles,
    liCommunity:{
      source:raw.source || "",
      formation:raw.formationName || "",
      slotType:raw.slotType || "",
      size:raw.size ?? null,
      points:raw.points ?? null,
      referenceDetachmentId:refDetachment?.id ?? null,
      notes:raw.notes || []
    },
    searchText:normalize([
      name,
      raw.formationName,
      raw.slotType,
      categories,
      profiles.map(profile => profile.name),
      weapons.map(profile => profile.name),
      rules.map(rule => rule.name),
      raw.notes
    ].flat(4).join(" "))
  };
}

function liCommunityFormationRules(reference, formations = []) {
  const rules = [];

  for (const formation of formations || []) {
    const refFormation = findLiCommunityFormation(
      reference,
      formation.dataId ?? formation.data_id ?? formation.id,
      formation.name
    );
    if (!refFormation) continue;

    for (const rule of refFormation.rules || []) {
      if (!rule?.name || !rule?.text) continue;
      rules.push({
        name:rule.name,
        text:rule.text,
        category:"Formation Rule",
        source:formation.nickname
          ? formation.nickname + " — " + refFormation.name
          : refFormation.name
      });
    }
  }

  return dedupeBy(
    rules,
    rule => normalize(rule.source + "|" + rule.name + "|" + rule.text)
  );
}

function liBuilderSlotPoints(list, detachment) {
  const slotId = detachment.slot_id;
  const upgrades = (list.upgrades || []).find(entry => entry.slot_id === slotId)?.upgrades || [];
  const loadouts = (list.loadouts || []).find(entry => entry.slot_id === slotId)?.loadouts || [];

  const upgradePoints = upgrades.reduce((sum, upgrade) =>
    sum + (Number(upgrade.cost) || 0) +
      (list.gamemode === "titandeath" ? (Number(upgrade.td_ek) || 0) : 0), 0);

  const loadoutPoints = loadouts.reduce((sum, loadout) => {
    const perModel = (loadout.weapons || []).reduce((weaponSum, weapon) =>
      weaponSum + (Number(weapon.cost) || 0), 0);
    return sum + perModel * (Number(loadout.number) || 0);
  }, 0);

  return (Number(detachment.cost) || 0) + upgradePoints + loadoutPoints;
}

function liBuilderSlotSize(list, detachment) {
  const upgrades = (list.upgrades || []).find(entry => entry.slot_id === detachment.slot_id)?.upgrades || [];
  return (Number(detachment.size) || 0) +
    upgrades.reduce((sum, upgrade) => sum + (Number(upgrade.size) || 0), 0);
}

function liBuilderSlotNotes(list, detachment) {
  const notes = [];
  const selectedWeapons = [];
  const selectedUnitRefs = [];
  const upgrades = (list.upgrades || []).find(entry => entry.slot_id === detachment.slot_id)?.upgrades || [];
  const loadouts = (list.loadouts || []).find(entry => entry.slot_id === detachment.slot_id)?.loadouts || [];

  for (const upgrade of upgrades) {
    const count = Number(upgrade.number) || 0;
    if (upgrade.unit_ref !== null && upgrade.unit_ref !== undefined) {
      selectedUnitRefs.push(upgrade.unit_ref);
    }
    notes.push(
      (count ? count + " × " : "") +
      (upgrade.name || "Upgrade") +
      (Number(upgrade.cost) ? " · " + upgrade.cost + " pts" : "")
    );
  }

  for (const loadout of loadouts) {
    const count = Number(loadout.number) || 0;
    const weapons = (loadout.weapons || []).map(weapon => {
      if (weapon.weapon && normalize(weapon.weapon) !== "none") selectedWeapons.push(weapon.weapon);
      return (weapon.location ? weapon.location + ": " : "") +
        (weapon.weapon || "") +
        (Number(weapon.cost) ? " · " + weapon.cost + " pts" : "");
    }).filter(Boolean);

    if (weapons.length) {
      notes.push((count ? count + " × " : "") + weapons.join(", "));
    }
  }

  return {
    notes,
    selectedWeapons,
    selectedUnitRefs:dedupeBy(selectedUnitRefs, value => String(value))
  };
}

function normalizeLiBuilderJsonList(rawList, reference, sourceName = "Legion Companion") {
  const list = rawList || {};
  const formationMap = new Map(
    (list.formations || []).map(formation => [String(formation.id), formation])
  );

  const rawDetachments = [];
  for (const detachment of list.detachments || []) {
    if (!detachment || !detachment.id || !detachment.name) continue;
    const formation = formationMap.get(String(detachment.formation_id)) || {};
    const config = liBuilderSlotNotes(list, detachment);

    rawDetachments.push({
      id:detachment.id,
      name:detachment.name,
      slotType:detachment.slot_type || "",
      formationName:formation.name || "",
      size:liBuilderSlotSize(list, detachment),
      points:liBuilderSlotPoints(list, detachment),
      notes:config.notes,
      selectedWeapons:config.selectedWeapons,
      selectedUnitRefs:config.selectedUnitRefs,
      source:sourceName
    });
  }

  if (!rawDetachments.length) {
    throw new Error("No Legions Imperialis detachments were found in this JSON export.");
  }

  const units = rawDetachments.map((detachment, index) =>
    buildLiCommunityUnit(detachment, reference, index)
  );

  const formations = (list.formations || [])
    .filter(formation => formation?.name)
    .map(formation => ({
      id:formation.id,
      dataId:formation.data_id,
      name:formation.name,
      nickname:formation.nickname || "",
      faction:formation.faction || null,
      subfaction:formation.subfaction || null
    }));

  const factionCounts = {};
  for (const unit of units) {
    const refDetachment = reference.detachmentById.get(String(unit.liCommunity.referenceDetachmentId));
    if (!refDetachment?.faction) continue;
    factionCounts[refDetachment.faction] = (factionCounts[refDetachment.faction] || 0) + 1;
  }
  const inferredFaction = Object.entries(factionCounts).sort((a,b) => b[1] - a[1])[0]?.[0];

  const totalPoints = rawDetachments.reduce((sum, detachment) =>
    sum + (Number(detachment.points) || 0), 0);

  return {
    id:crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
    name:list.name || sourceName + " list",
    faction:list.faction || inferredFaction || "Legions Imperialis",
    source:"li-community",
    communitySource:sourceName,
    gameSystemKey:"legions-imperialis",
    importFormat:"companion-json",
    points:totalPoints || Number(list.points) || null,
    units,
    armyRules:liCommunityFormationRules(reference, formations),
    formations,
    referenceData:{rules:[], stratagems:[]},
    importedAt:Date.now()
  };
}

function cleanLiCommunityLine(line = "") {
  return String(line)
    .replace(/\r/g, "")
    .replace(/^\s*[-*•]\s*/, "")
    .replace(/\*\*/g, "")
    .replace(/__/g, "")
    .replace(/\u00a0/g, " ")
    .trim();
}

function parseLiCommunityText(text, reference) {
  const rawText = String(text || "").trim();
  if (!rawText) throw new Error("Paste a Legion Companion export first.");

  const sourceName = "Legion Companion";

  const lines = rawText.split("\n");
  const slotNamePattern = "(HQ|CORE|SUPPORT|TRANSPORT|VANGUARD|LIGHT\\s+ARMOU?R|BATTLE\\s+TANK|HEAVY\\s+ARMOU?R|ARTILLERY|BASTION|AIR\\s+SUPPORT|KNIGHT|TITAN|DEDICATED)";
  const slotPatternWithSize = new RegExp(
    "^" + slotNamePattern + "\\s*:\\s*(.+?)\\s*\\((\\d+)\\)\\s*(?:[-–—,]\\s*)?(\\d+)\\s*pts?\\b",
    "i"
  );
  const slotPattern = new RegExp(
    "^" + slotNamePattern + "\\s*:\\s*(.+?)\\s*(?:[-–—,]\\s*)?(\\d+)\\s*pts?\\b",
    "i"
  );

  let currentFormation = null;
  let currentDetachment = null;
  const formations = [];
  const rawDetachments = [];
  let rosterName = "";
  let declaredTotal = null;

  function pushFormation(name) {
    const cleanName = String(name || "")
      .replace(/^formation\s*:\s*/i, "")
      .trim();
    const refFormation = findLiCommunityFormation(reference, null, cleanName);
    if (!refFormation) return false;

    currentFormation = {
      id:"text-formation-" + formations.length,
      dataId:refFormation.id,
      name:refFormation.name,
      nickname:normalize(cleanName) === normalize(refFormation.name) ? "" : cleanName
    };
    formations.push(currentFormation);
    currentDetachment = null;
    return true;
  }

  for (const originalLine of lines) {
    const line = cleanLiCommunityLine(originalLine);
    if (!line) continue;

    if (/^(compulsory|optional|choice|additional|detachments?|upgrades?|loadouts?)$/i.test(line)) {
      continue;
    }
    if (/^(formation strength|breakpoint)\s*:/i.test(line)) continue;
    if (/^[-─═_]{4,}$/.test(line)) continue;
    if (/^generated by legion companion$/i.test(line) || /^legioncompanion\.app$/i.test(line)) continue;

    const companionHeader = line.match(/^(.+?)\s+(\d+)\s*\/\s*(\d+)\s*pts?\s*$/i);
    if (companionHeader && !rosterName) {
      rosterName = companionHeader[1].trim();
      declaredTotal = Number(companionHeader[2]);
      continue;
    }

    const sizedDetachmentMatch = line.match(slotPatternWithSize);
    const detachmentMatch = sizedDetachmentMatch || line.match(slotPattern);
    if (detachmentMatch) {
      const hasSize = Boolean(sizedDetachmentMatch);
      const name = detachmentMatch[2].trim();
      const refDetachment = findLiCommunityDetachment(reference, null, name);
      currentDetachment = {
        id:refDetachment?.id ?? null,
        name:refDetachment?.name || name,
        slotType:detachmentMatch[1].replace(/\s+/g, " ").trim(),
        formationName:currentFormation?.name || "",
        size:hasSize ? Number(detachmentMatch[3]) : refDetachment?.baseSize ?? null,
        points:Number(detachmentMatch[hasSize ? 4 : 3]),
        notes:[],
        selectedWeapons:[],
        source:sourceName
      };

      const detachmentSuffix = line.match(/\s+->\s+(.+)$/);
      if (detachmentSuffix?.[1]) currentDetachment.notes.push(detachmentSuffix[1].trim());

      rawDetachments.push(currentDetachment);
      continue;
    }

    const pointsLine = line.match(/^(.*?)\s*(?::|,|\s[-–—]\s)\s*(\d+)\s*pts?\b/i);
    if (pointsLine) {
      const possibleName = pointsLine[1].trim();
      if (pushFormation(possibleName)) continue;

      if (/^(total|list total)/i.test(possibleName)) {
        declaredTotal = Number(pointsLine[2]);
        continue;
      }

      if (currentDetachment) {
        currentDetachment.notes.push(line);
        continue;
      }

      if (!rosterName && !/^(allies|main faction)/i.test(possibleName)) {
        rosterName = possibleName;
        declaredTotal = Number(pointsLine[2]);
      }
      continue;
    }

    const inlineTotal = line.match(/^(.+?)\s+(\d+)\s*pts?\s*$/i);
    if (inlineTotal && !currentDetachment && !rosterName) {
      rosterName = inlineTotal[1].trim();
      declaredTotal = Number(inlineTotal[2]);
      continue;
    }

    if (/^formation\s*:/i.test(line) && pushFormation(line)) continue;

    if (currentDetachment) {
      const weaponLine = line.match(/^x?(\d+)\s+([^:]+):\s*(.+?)(?:\s+\d+\s*pts?)?$/i);
      if (weaponLine) {
        const weaponText = weaponLine[3].trim();
        currentDetachment.selectedWeapons.push(
          ...weaponText.split(/,\s*/).map(value => value.trim()).filter(Boolean)
        );
      } else {
        const possibleWeapon = line
          .replace(/^x\d+\s+/i, "")
          .replace(/^[^:]{1,30}:\s*/, "")
          .replace(/\s*\(\+?\d+\s*pts?\)\s*$/i, "")
          .trim();
        if (matchLiCommunityWeapon(reference, possibleWeapon)) {
          currentDetachment.selectedWeapons.push(possibleWeapon);
        }
      }

      currentDetachment.notes.push(line);
      continue;
    }

    if (!rosterName &&
        !/^(gamemode|faction|allegiance|game size|formations|total|allies|generated by)/i.test(line) &&
        line.length < 100) {
      rosterName = line;
    }
  }

  if (!rawDetachments.length) {
    throw new Error(
      "No detachments were found. In Legion Companion, use Export as Text or JSON and import that export here."
    );
  }

  const units = rawDetachments.map((detachment, index) =>
    buildLiCommunityUnit(detachment, reference, index)
  );

  const factionCounts = {};
  for (const raw of rawDetachments) {
    const refDetachment = findLiCommunityDetachment(reference, raw.id, raw.name);
    if (!refDetachment?.faction) continue;
    factionCounts[refDetachment.faction] = (factionCounts[refDetachment.faction] || 0) + 1;
  }
  const faction = Object.entries(factionCounts).sort((a,b) => b[1] - a[1])[0]?.[0] || "Legions Imperialis";
  const summedPoints = rawDetachments.reduce((sum, detachment) => sum + (Number(detachment.points) || 0), 0);

  return {
    id:crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
    name:rosterName || sourceName + " list",
    faction,
    source:"li-community",
    communitySource:sourceName,
    gameSystemKey:"legions-imperialis",
    importFormat:"companion-text",
    points:declaredTotal || summedPoints || null,
    units,
    armyRules:liCommunityFormationRules(reference, formations),
    formations,
    referenceData:{rules:[], stratagems:[]},
    importedAt:Date.now()
  };
}

function liCommunityUnwrapJson(value) {
  let current = value;

  for (let depth = 0; depth < 5; depth++) {
    if (typeof current === "string") {
      try {
        current = JSON.parse(current);
        continue;
      } catch {
        return current;
      }
    }

    if (!current || typeof current !== "object" || Array.isArray(current)) return current;

    const directList = Array.isArray(current.formations) && Array.isArray(current.detachments);
    if (directList) return current;

    const next = ["list","army","roster","data","payload"]
      .map(key => current[key])
      .find(item => item && (typeof item === "object" || typeof item === "string"));

    if (!next) return current;
    current = next;
  }

  return current;
}

function liCompanionValue(object, keys, fallback = null) {
  for (const key of keys) {
    if (object?.[key] !== undefined && object?.[key] !== null && object?.[key] !== "") {
      return object[key];
    }
  }
  return fallback;
}

function normalizeLiCompanionJson(root, reference) {
  const formations = [];
  const rawDetachments = [];
  const seenObjects = new Set();

  function walk(node, context = {}) {
    if (!node || typeof node !== "object") return;
    if (seenObjects.has(node)) return;
    seenObjects.add(node);

    if (Array.isArray(node)) {
      for (const item of node) walk(item, context);
      return;
    }

    const name = liCompanionValue(node, ["name","detachmentName","unitName","title"], "");
    const possibleId = liCompanionValue(node, ["detachmentId","detachment_id","dataId","data_id","unitId","unit_id","id"], null);
    const refDetachment = findLiCommunityDetachment(reference, possibleId, name);

    const likelyFormation = name && (
      /formation/i.test(String(liCompanionValue(node, ["type","kind","entityType"], ""))) ||
      Array.isArray(node.detachments) ||
      Array.isArray(node.slots)
    );
    const refFormation = likelyFormation
      ? findLiCommunityFormation(reference, liCompanionValue(node, ["dataId","data_id","formationId","formation_id","id"], null), name)
      : null;

    let nextContext = context;
    if (refFormation) {
      const formation = {
        id:liCompanionValue(node, ["id","formationId","formation_id"], "companion-formation-" + formations.length),
        dataId:refFormation.id,
        name:refFormation.name,
        nickname:liCompanionValue(node, ["nickname","customName"], "")
      };
      formations.push(formation);
      nextContext = {...context, formationName:refFormation.name};
    }

    const typeText = normalize(String(liCompanionValue(node, ["type","kind","entityType","slotType","slot_type"], "")));
    const hasDetachmentSignals =
      refDetachment &&
      (
        /detachment|unit/.test(typeText) ||
        node.size !== undefined ||
        node.modelCount !== undefined ||
        node.models !== undefined ||
        node.points !== undefined ||
        node.cost !== undefined ||
        node.loadout !== undefined ||
        node.loadouts !== undefined ||
        node.upgrades !== undefined ||
        node.weapons !== undefined
      );

    if (hasDetachmentSignals) {
      const notes = [];
      const selectedWeapons = [];
      const configValues = [
        node.upgrades,
        node.loadout,
        node.loadouts,
        node.equipment,
        node.weapons,
        node.options
      ].filter(value => value !== undefined && value !== null);

      for (const value of configValues) {
        const text = liCommunitySelectionText(value);
        if (text) notes.push(text);
      }

      function collectWeaponNames(value) {
        if (!value) return;
        if (typeof value === "string") {
          selectedWeapons.push(value);
          return;
        }
        if (Array.isArray(value)) {
          value.forEach(collectWeaponNames);
          return;
        }
        if (typeof value === "object") {
          const weaponName = liCompanionValue(value, ["weapon","weaponName","name"], "");
          if (weaponName && matchLiCommunityWeapon(reference, weaponName)) selectedWeapons.push(weaponName);
          for (const item of Object.values(value)) {
            if (item !== weaponName) collectWeaponNames(item);
          }
        }
      }
      collectWeaponNames(node.weapons);
      collectWeaponNames(node.loadout);
      collectWeaponNames(node.loadouts);

      rawDetachments.push({
        id:refDetachment.id,
        name:refDetachment.name,
        slotType:liCompanionValue(node, ["slotType","slot_type","category","role"], refDetachment.types?.[0] || ""),
        formationName:nextContext.formationName || "",
        size:Number(liCompanionValue(node, ["size","modelCount","model_count","models","count"], refDetachment.baseSize || 0)) || refDetachment.baseSize || null,
        points:Number(liCompanionValue(node, ["points","totalPoints","total_points","cost"], refDetachment.baseCost || 0)) || refDetachment.baseCost || null,
        notes:dedupeBy(notes, note => normalize(note)),
        selectedWeapons:dedupeBy(selectedWeapons, weapon => normalize(weapon)),
        source:"Legion Companion"
      });
      return;
    }

    for (const [key, value] of Object.entries(node)) {
      if (["reference","metadata","rules","weaponProfiles","datasheet"].includes(key)) continue;
      if (value && typeof value === "object") walk(value, nextContext);
    }
  }

  walk(root);

  const uniqueDetachments = dedupeBy(
    rawDetachments,
    detachment => [
      detachment.formationName,
      detachment.slotType,
      detachment.name,
      detachment.size,
      detachment.points,
      JSON.stringify(detachment.notes)
    ].map(normalize).join("|")
  );

  if (!uniqueDetachments.length) {
    throw new Error(
      "This JSON was readable, but I could not identify Legion Companion detachments. Try a fresh Legion Companion JSON export or Export as Text."
    );
  }

  const units = uniqueDetachments.map((detachment, index) =>
    buildLiCommunityUnit(detachment, reference, index)
  );
  const factionCounts = {};
  for (const detachment of uniqueDetachments) {
    const refDetachment = findLiCommunityDetachment(reference, detachment.id, detachment.name);
    if (!refDetachment?.faction) continue;
    factionCounts[refDetachment.faction] = (factionCounts[refDetachment.faction] || 0) + 1;
  }

  return {
    id:crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
    name:liCompanionValue(root, ["name","armyName","army_name","title"], "Legion Companion list"),
    faction:liCompanionValue(root, ["faction","mainFaction","main_faction"],
      Object.entries(factionCounts).sort((a,b) => b[1] - a[1])[0]?.[0] || "Legions Imperialis"),
    source:"li-community",
    communitySource:"Legion Companion",
    gameSystemKey:"legions-imperialis",
    importFormat:"companion-json",
    points:uniqueDetachments.reduce((sum, detachment) => sum + (Number(detachment.points) || 0), 0) || null,
    units,
    armyRules:liCommunityFormationRules(reference, formations),
    formations,
    referenceData:{rules:[], stratagems:[]},
    importedAt:Date.now()
  };
}

async function parseLiCommunityPayload(payload) {
  const reference = await loadLiCommunityReference();
  const text = String(payload || "").trim();
  if (!text) throw new Error("Paste or choose a Legion Companion export first.");

  if (/^[\[{]/.test(text)) {
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error("The JSON export could not be read.");
    }

    const unwrapped = liCommunityUnwrapJson(parsed);
    if (unwrapped && Array.isArray(unwrapped.formations) && Array.isArray(unwrapped.detachments)) {
      return normalizeLiBuilderJsonList(unwrapped, reference, "Legion Companion");
    }

    return normalizeLiCompanionJson(unwrapped, reference);
  }

  return parseLiCommunityText(text, reference);
}

async function importLiCommunityPayload(payload, origin = "paste") {
  if (!isLegionsImperialisMode()) {
    toast("Switch to Legions Imperialis before importing this list.");
    return;
  }

  const button = els.liCommunityImportButton;
  if (button) {
    button.disabled = true;
    button.textContent = "Importing…";
  }
  if (els.liCommunityImportStatus) {
    els.liCommunityImportStatus.dataset.busy = "1";
    els.liCommunityImportStatus.textContent = "Reading list and matching detachments…";
  }

  try {
    const roster = await parseLiCommunityPayload(payload);
    const existingIndex = state.rosters.findIndex(existing =>
      existing.source === "li-community" &&
      normalize(existing.communitySource) === normalize(roster.communitySource) &&
      normalize(existing.name) === normalize(roster.name) &&
      normalize(existing.faction) === normalize(roster.faction)
    );

    if (existingIndex >= 0) {
      state.rosters.splice(existingIndex, 1, roster);
      state.activeRoster = existingIndex;
    } else {
      state.rosters.push(roster);
      state.activeRoster = state.rosters.length - 1;
    }

    state.unitBrowserSourceId = "roster:" + roster.id;
    localStorage.setItem("tv_unit_browser_source", state.unitBrowserSourceId);
    state.selected = null;
    state.selectedRosterId = null;

    persist();
    renderAll();
    switchPage("datasheets", {silent:true});

    if (origin === "paste" && els.liCommunityInput) els.liCommunityInput.value = "";
    if (els.liCommunityImportStatus) {
      els.liCommunityImportStatus.dataset.busy = "";
      els.liCommunityImportStatus.textContent =
        "Imported " + roster.units.length + " detachments · " +
        roster.communitySource +
        (roster.points != null ? " · " + roster.points + " pts" : "");
    }
    toast("Imported " + roster.name);
  } catch (error) {
    console.error("Legions community import failed", error);
    if (els.liCommunityImportStatus) {
      els.liCommunityImportStatus.dataset.busy = "";
      els.liCommunityImportStatus.textContent =
        error.message || "Could not import this Legions Imperialis list.";
    }
    toast(error.message || "Could not import this Legions Imperialis list.");
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "Import pasted list";
    }
  }
}

async function handleLiCommunityFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    await importLiCommunityPayload(text, "file");
  } finally {
    event.target.value = "";
  }
}



function cleanGyrinxText(value = "") {
  return String(value || "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanGyrinxWeaponName(value = "") {
  return cleanGyrinxText(value)
    .replace(/^[+\-–—]\s*/, "")
    .replace(/\s+—\s+\d+\s*(?:cr|¢)\b.*$/i, "")
    .replace(/\s+\(\+?\d+\s*(?:cr|¢)\)\s*$/i, "")
    .replace(/\s+\d+\s*(?:cr|¢)\s*$/i, "")
    .trim();
}

function splitGyrinxNames(value = "") {
  return cleanGyrinxText(value)
    .split(/\s*,\s*/)
    .map(item => item.trim())
    .filter(item =>
      item &&
      !/^choose\b/i.test(item) &&
      !/^add\b/i.test(item)
    );
}

function parseGyrinxFighterStats(cardRoot) {
  const allowed = new Set([
    "m","ws","bs","s","t","w","i","a","ld","cl","wil","int",
    "fr","sd","rr","hp","hnd",
    "front toughness","side toughness","rear toughness","hit points","handling"
  ]);
  const stats = [];
  let typeLine = "";
  let xp = "";

  for (const table of cardRoot.querySelectorAll("table")) {
    const firstHeading = cleanGyrinxText(table.querySelector("th")?.textContent);
    if (normalize(firstHeading) === "weapons") continue;

    const rows = [...table.querySelectorAll("tr")];
    for (let index = 0; index < rows.length - 1; index++) {
      const headingCells = [...rows[index].querySelectorAll("th")];
      if (!headingCells.length) continue;

      const valueCells = [...rows[index + 1].querySelectorAll("td")];
      if (!valueCells.length) continue;

      const headings = headingCells.map(cell => cleanGyrinxText(cell.textContent));
      const values = valueCells.map(cell => cleanGyrinxText(cell.textContent));
      if (!headings.some(label => allowed.has(normalize(label)))) continue;

      for (let cellIndex = 0; cellIndex < Math.min(headings.length, values.length); cellIndex++) {
        const label = headings[cellIndex];
        const value = values[cellIndex];
        const key = normalize(label);
        if (!label || !value) continue;

        if (allowed.has(key)) {
          if (!stats.some(stat => normalize(stat.label) === key)) {
            stats.push({label, value});
          }
        } else if (key === "type") {
          typeLine = value;
        } else if (key === "xp") {
          xp = value;
        }
      }

      index++;
    }
  }

  return {stats, typeLine, xp};
}

function parseGyrinxWeapons(cardRoot) {
  const profiles = [];
  const gear = [];

  const weaponTable = [...cardRoot.querySelectorAll("table")].find(table =>
    normalize(cleanGyrinxText(table.querySelector("th")?.textContent)) === "weapons"
  );
  if (!weaponTable) return {profiles, gear};

  const headingCells = [...weaponTable.querySelectorAll("thead th")];
  const columns = headingCells.slice(1).map(cell => cleanGyrinxText(cell.textContent));
  let pendingWeapon = "";
  let lastProfile = null;

  for (const row of weaponTable.querySelectorAll("tbody tr")) {
    const cells = [...row.querySelectorAll("td")];
    if (!cells.length) continue;

    const firstText = cleanGyrinxText(cells[0].textContent);
    const allText = cleanGyrinxText(row.textContent);

    if (cells.length === 1 || cells[0].colSpan > 1) {
      if (!allText) continue;

      if (/^\+/.test(allText)) {
        gear.push(cleanGyrinxWeaponName(allText));
        continue;
      }

      if (lastProfile && !firstText) {
        const trait = cleanGyrinxText(cells.at(-1)?.textContent);
        if (trait) {
          const existing = lastProfile.values.find(value => normalize(value.label) === "traits");
          if (existing) existing.value = [existing.value, trait].filter(Boolean).join(", ");
          else lastProfile.values.push({label:"Traits", value:trait});
        }
        continue;
      }

      pendingWeapon = cleanGyrinxWeaponName(allText);
      continue;
    }

    if (!firstText) {
      const trait = cleanGyrinxText(cells.at(-1)?.textContent);
      if (trait && lastProfile) {
        const existing = lastProfile.values.find(value => normalize(value.label) === "traits");
        if (existing) existing.value = [existing.value, trait].filter(Boolean).join(", ");
        else lastProfile.values.push({label:"Traits", value:trait});
      }
      continue;
    }

    if (/^\+/.test(firstText)) {
      gear.push(cleanGyrinxWeaponName(firstText));
      continue;
    }

    const rawProfileName = cleanGyrinxWeaponName(firstText);
    const namedSubProfile = /^[\-–—]/.test(firstText.trim());
    const displayName = namedSubProfile && pendingWeapon
      ? pendingWeapon + " — " + rawProfileName
      : rawProfileName;

    const values = [];
    for (let index = 0; index < columns.length; index++) {
      const value = cleanGyrinxText(cells[index + 1]?.textContent);
      values.push({
        label:columns[index],
        value:value || "—"
      });
    }

    const hasStats = values.some(value => value.value !== "—");
    if (!hasStats) {
      pendingWeapon = rawProfileName;
      continue;
    }

    lastProfile = {
      name:displayName || pendingWeapon || "Weapon",
      type:"Necromunda Weapon",
      system:"necromunda",
      quantity:1,
      values
    };
    profiles.push(lastProfile);

    if (!namedSubProfile) pendingWeapon = rawProfileName;
  }

  return {
    profiles:dedupeBy(
      profiles,
      profile => normalize(profile.name + "|" + JSON.stringify(profile.values || []))
    ),
    gear:dedupeBy(gear.filter(Boolean), value => normalize(value))
  };
}

function parseGyrinxDetailRows(cardRoot) {
  const rules = [];
  const gear = [];
  const counters = [];

  const detailLists = [...cardRoot.querySelectorAll("dl")];
  for (const list of detailLists) {
    const terms = [...list.querySelectorAll(":scope > dt")];
    for (const term of terms) {
      let description = term.nextElementSibling;
      while (description && description.tagName !== "DD") {
        description = description.nextElementSibling;
      }
      if (!description) continue;

      const label = cleanGyrinxText(term.textContent);
      const value = cleanGyrinxText(description.textContent);
      if (!label || !value) continue;

      const key = normalize(label);
      if ([
        "skills",
        "rules",
        "powers",
        "psyker",
        "advancements",
        "lasting injuries",
        "lasting injury",
        "lasting damage"
      ].includes(key)) {
        const category = key === "skills"
          ? "Skill"
          : ["powers","psyker"].includes(key)
            ? "Power"
            : key === "advancements"
              ? "Advancement"
              : key.startsWith("lasting")
                ? "Injury / Damage"
                : "Rule";
        for (const name of splitGyrinxNames(value)) {
          rules.push({name, text:"", category});
        }
        continue;
      }

      if (
        key === "gear" ||
        key.includes("equipment") ||
        key.includes("wargear") ||
        key.includes("armour") ||
        key.includes("gear")
      ) {
        gear.push(...splitGyrinxNames(value));
        continue;
      }

      if (!/^(type|xp)$/i.test(label)) {
        counters.push({label, value});
      }
    }
  }

  return {
    rules:dedupeBy(rules, rule => normalize(rule.category + "|" + rule.name)),
    gear:dedupeBy(gear, value => normalize(value)),
    counters:dedupeBy(counters, counter => normalize(counter.label + "|" + counter.value))
  };
}

function gyrinxFighterCategories(profileName = "", typeLine = "", status = "") {
  const text = normalize([profileName, typeLine, status].filter(Boolean).join(" "));
  const categories = [];

  const tests = [
    ["leader","Leader"],
    ["champion","Champion"],
    ["juve","Juve"],
    ["prospect","Prospect"],
    ["ganger","Ganger"],
    ["hanger on","Hanger-on"],
    ["hanger-on","Hanger-on"],
    ["brute","Brute"],
    ["vehicle","Vehicle"],
    ["exotic beast","Pet"],
    ["pet","Pet"]
  ];

  for (const [needle, category] of tests) {
    if (text.includes(normalize(needle))) categories.push(category);
  }

  return dedupeBy(categories.length ? categories : ["Fighter"], value => normalize(value));
}

function parseGyrinxN26Fighter(header, index) {
  const cardRoot = header.parentElement;
  if (!cardRoot) return null;

  const id = String(header.id || "").replace(/^model-/, "") || String(index);
  const name = cleanGyrinxText(
    header.querySelector('[id^="n26-model-name-"]')?.textContent
  );
  if (!name) return null;

  const profileName = cleanGyrinxText(
    header.querySelector('[id^="n26-model-profile-name-"]')?.textContent
  );

  const headerText = cleanGyrinxText(header.textContent);
  const ratingMatch = headerText.match(/(\d+)\s*(?:cr|¢)\b/i);
  const statusCandidates = [
    "In Recovery",
    "Critically Injured",
    "Critically Damaged",
    "Ransomed",
    "Captured",
    "Dead",
    "Destroyed",
    "Active"
  ];
  const status = statusCandidates.find(candidate =>
    normalize(headerText).includes(normalize(candidate))
  ) || "";

  const statData = parseGyrinxFighterStats(cardRoot);
  const weaponData = parseGyrinxWeapons(cardRoot);
  const details = parseGyrinxDetailRows(cardRoot);

  const rules = [
    ...details.rules,
    ...details.gear.map(item => ({name:item, text:"", category:"Gear"})),
    ...weaponData.gear.map(item => ({name:item, text:"", category:"Weapon accessory"}))
  ];

  if (status && normalize(status) !== "active") {
    rules.unshift({name:status, text:"", category:"Status"});
  }

  const stats = [...statData.stats];
  if (ratingMatch) stats.push({label:"Rating", value:ratingMatch[1] + "cr"});

  const categories = gyrinxFighterCategories(
    profileName,
    statData.typeLine,
    status
  );

  return {
    id:"gyrinx-" + id,
    externalId:id,
    name,
    type:statData.typeLine || profileName || "Fighter",
    system:"necromunda",
    gameSystemKey:"necromunda",
    categories,
    stats,
    rules:dedupeBy(
      rules,
      rule => normalize(rule.category + "|" + rule.name + "|" + rule.text)
    ),
    profiles:weaponData.profiles,
    necromunda:{
      profileName,
      typeLine:statData.typeLine,
      rating:ratingMatch ? Number(ratingMatch[1]) : null,
      xp:statData.xp,
      status,
      counters:details.counters,
      gear:dedupeBy(
        [...details.gear, ...weaponData.gear],
        value => normalize(value)
      )
    },
    searchText:normalize([
      name,
      profileName,
      statData.typeLine,
      status,
      categories,
      statData.stats.map(stat => [stat.label, stat.value]),
      weaponData.profiles.map(profile => profile.name),
      rules.map(rule => rule.name),
      details.counters.map(counter => [counter.label, counter.value])
    ].flat(4).join(" "))
  };
}

function parseGyrinxCampaignState(sheet) {
  const root = sheet.querySelector("#n26-campaign-state");
  if (!root) return null;

  const heading = cleanGyrinxText(root.querySelector("h2")?.textContent);
  const name = heading
    .replace(/^Campaign\s*[·•:–—-]?\s*/i, "")
    .trim() || "Campaign";

  const rows = [];
  for (const term of root.querySelectorAll("dl dt")) {
    const row = term.parentElement;
    const description = row?.querySelector(":scope > dd") || term.nextElementSibling;
    const label = cleanGyrinxText(term.textContent);
    const value = cleanGyrinxText(description?.textContent);
    if (!label || !value) continue;
    rows.push({label, value});
  }

  const boonSection = [...root.querySelectorAll("section")].find(section =>
    normalize(cleanGyrinxText(section.querySelector("h3")?.textContent)) === "boons"
  );
  const boons = boonSection
    ? cleanGyrinxText(boonSection.textContent).replace(/^Boons\s*/i, "").trim()
    : "";

  return {
    name,
    rows:dedupeBy(rows, row => normalize(row.label + "|" + row.value)),
    boons
  };
}

function parseGyrinxGangRules(sheet, cardRoots) {
  const rules = [];

  for (const term of sheet.querySelectorAll("dt")) {
    if (cardRoots.some(root => root.contains(term))) continue;
    if (normalize(cleanGyrinxText(term.textContent)) !== "rules") continue;

    let description = term.nextElementSibling;
    while (description && description.tagName !== "DD") {
      description = description.nextElementSibling;
    }
    if (!description) continue;

    for (const name of splitGyrinxNames(description.textContent)) {
      rules.push({name, text:"", category:"Gang Rule"});
    }
  }

  return dedupeBy(rules, rule => normalize(rule.name));
}

function parseGyrinxN26GangHtml(html, sourceUrl = "") {
  const doc = new DOMParser().parseFromString(String(html || ""), "text/html");
  const sheet = doc.querySelector("#n26-gang-sheet");
  if (!sheet) {
    throw new Error("This Gyrinx page did not contain a readable N26 gang.");
  }

  const headers = [...sheet.querySelectorAll('[id^="model-"]')];
  const units = headers
    .map((header, index) => parseGyrinxN26Fighter(header, index))
    .filter(Boolean);

  if (!units.length) {
    throw new Error("The Gyrinx gang was found, but no fighter cards could be read.");
  }

  const cardRoots = headers.map(header => header.parentElement).filter(Boolean);
  const pageText = cleanGyrinxText(sheet.textContent);
  const heading = sheet.querySelector("h1");
  const name = cleanGyrinxText(heading?.textContent) ||
    cleanGyrinxText(doc.title).replace(/\s*[|–—-]\s*Gyrinx.*$/i, "") ||
    "Necromunda gang";
  const headerGangType = cleanGyrinxText(
    heading?.parentElement?.querySelector("p.text-muted")?.textContent
  );

  const ratingMatch = pageText.match(/\bRating\s+(\d+)\b/i);
  const creditsMatch = pageText.match(/\bCredits\s+(\d+)\b/i);
  const wealthMatch = pageText.match(/\bWealth\s+(\d+)\b/i);

  const profileWords = units
    .map(unit => unit.necromunda?.profileName || "")
    .join(" ");
  const gangNames = [
    "Goliath","Escher","Orlock","Van Saar","Cawdor","Delaque",
    "Palanite Enforcers","Corpse Grinder Cult","Genestealer Cult",
    "Chaos Cult","Venators","Underhive Outcasts","Outcasts",
    "Ash Waste Nomads","Ironhead Squat Prospectors","Slave Ogryns",
    "Malstrain","Spyre Hunters"
  ];
  const gangType = headerGangType || gangNames.find(type =>
    normalize(profileWords).includes(normalize(type))
  ) || "Necromunda";

  const campaign = parseGyrinxCampaignState(sheet);
  const gangRules = parseGyrinxGangRules(sheet, cardRoots);
  const campaignRules = campaign
    ? [
        {name:"Campaign", text:campaign.name, category:"Campaign"},
        ...campaign.rows.map(row => ({
          name:row.label,
          text:row.value,
          category:"Campaign"
        })),
        ...(campaign.boons
          ? [{name:"Boons", text:campaign.boons, category:"Campaign"}]
          : [])
      ]
    : [];

  return {
    id:crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
    name,
    faction:gangType,
    source:"gyrinx",
    gameSystemKey:"necromunda",
    importFormat:"gyrinx-share",
    points:null,
    units,
    armyRules:dedupeBy(
      [...gangRules, ...campaignRules],
      rule => normalize(rule.category + "|" + rule.name + "|" + rule.text)
    ),
    referenceData:{rules:[], stratagems:[]},
    importedAt:Date.now(),
    necromunda:{
      rating:ratingMatch ? Number(ratingMatch[1]) : null,
      credits:creditsMatch ? Number(creditsMatch[1]) : null,
      wealth:wealthMatch ? Number(wealthMatch[1]) : null,
      campaign,
      sourceUrl
    }
  };
}

async function loadGyrinxGang() {
  const value = String(els.necromundaShareInput?.value || "").trim();
  if (!value) {
    if (els.necromundaImportStatus) {
      els.necromundaImportStatus.textContent = "Paste a public Gyrinx N26 gang link first.";
    }
    toast("Paste a Gyrinx gang link.");
    return;
  }

  if (!isNecromundaMode()) {
    toast("Switch to Necromunda before importing this gang.");
    return;
  }

  const button = els.necromundaImportButton;
  if (button) {
    button.disabled = true;
    button.textContent = "Importing…";
  }
  if (els.necromundaImportStatus) {
    els.necromundaImportStatus.dataset.busy = "1";
    els.necromundaImportStatus.textContent = "Loading the public gang from Gyrinx…";
  }

  try {
    const response = await fetch("./api/gyrinx-gang?url=" + encodeURIComponent(value));
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || "Could not import this Gyrinx gang.");
    }

    const roster = parseGyrinxN26GangHtml(payload.html, payload.url || value);
    const existingIndex = state.rosters.findIndex(existing =>
      existing.source === "gyrinx" &&
      (
        (existing.necromunda?.sourceUrl && existing.necromunda.sourceUrl === roster.necromunda.sourceUrl) ||
        (
          normalize(existing.name) === normalize(roster.name) &&
          normalize(existing.faction) === normalize(roster.faction)
        )
      )
    );

    if (existingIndex >= 0) {
      state.rosters.splice(existingIndex, 1, roster);
      state.activeRoster = existingIndex;
    } else {
      state.rosters.push(roster);
      state.activeRoster = state.rosters.length - 1;
    }

    state.unitBrowserSourceId = "roster:" + roster.id;
    localStorage.setItem("tv_unit_browser_source", state.unitBrowserSourceId);
    state.selected = null;
    state.selectedRosterId = null;

    persist();
    renderAll();
    switchPage("datasheets", {silent:true});

    if (els.necromundaShareInput) els.necromundaShareInput.value = "";
    if (els.necromundaImportStatus) {
      els.necromundaImportStatus.dataset.busy = "";
      els.necromundaImportStatus.textContent =
        "Imported " + roster.units.length + " fighters" +
        (roster.necromunda.rating != null ? " · Rating " + roster.necromunda.rating : "") +
        (roster.necromunda.campaign?.name ? " · " + roster.necromunda.campaign.name : "");
    }
    toast("Imported " + roster.name);
  } catch (error) {
    console.error("Gyrinx import failed", error);
    if (els.necromundaImportStatus) {
      els.necromundaImportStatus.dataset.busy = "";
      els.necromundaImportStatus.textContent =
        error.message || "Could not import this Gyrinx gang.";
    }
    toast(error.message || "Could not import this Gyrinx gang.");
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "Import Gyrinx gang";
    }
  }
}



const DND_ABILITY_IDS = {
  1:"str",
  2:"dex",
  3:"con",
  4:"int",
  5:"wis",
  6:"cha"
};

const DND_ABILITY_LABELS = {
  str:"STR",
  dex:"DEX",
  con:"CON",
  int:"INT",
  wis:"WIS",
  cha:"CHA"
};

function dndIsRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function dndNumber(value, fallback = null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function dndPlainText(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const doc = new DOMParser().parseFromString(raw, "text/html");
  return String(doc.body?.textContent || raw)
    .replace(/\s+/g, " ")
    .trim();
}

function dndModifier(score) {
  return Math.floor((Number(score || 10) - 10) / 2);
}

function dndSigned(value) {
  const number = Number(value || 0);
  return number >= 0 ? "+" + number : String(number);
}

function dndProficiencyBonus(level) {
  return Math.floor((Math.max(1, Number(level || 1)) - 1) / 4) + 2;
}

function dndBucketEntries(value) {
  if (Array.isArray(value)) {
    return value
      .filter(dndIsRecord)
      .map(item => ({item, source:""}));
  }
  if (!dndIsRecord(value)) return [];

  return Object.entries(value).flatMap(([source, list]) =>
    Array.isArray(list)
      ? list.filter(dndIsRecord).map(item => ({item, source}))
      : []
  );
}

function dndAbilityScores(root) {
  const scores = {str:10,dex:10,con:10,int:10,wis:10,cha:10};
  const base = Array.isArray(root?.stats) ? root.stats : [];
  const bonus = Array.isArray(root?.bonusStats) ? root.bonusStats : [];
  const override = Array.isArray(root?.overrideStats) ? root.overrideStats : [];

  for (const stat of base) {
    const id = dndNumber(stat?.id ?? stat?.statId ?? stat?.abilityId, 0);
    const key = DND_ABILITY_IDS[id];
    if (!key) continue;

    const baseValue = dndNumber(stat?.value ?? stat?.score ?? stat?.total, scores[key]) ?? scores[key];
    const bonusStat = bonus.find(item =>
      dndNumber(item?.id ?? item?.statId ?? item?.abilityId, 0) === id
    );
    const overrideStat = override.find(item =>
      dndNumber(item?.id ?? item?.statId ?? item?.abilityId, 0) === id
    );

    const bonusValue = dndNumber(bonusStat?.value ?? bonusStat?.score ?? bonusStat?.total, 0) || 0;
    const overrideValue = dndNumber(overrideStat?.value ?? overrideStat?.score ?? overrideStat?.total, 0) || 0;
    scores[key] = overrideValue > 0 ? overrideValue : baseValue + bonusValue;
  }

  for (const {item:modifier} of dndBucketEntries(root?.modifiers)) {
    const subtype = normalize(modifier?.subType || modifier?.subtype || "").replace(/\s+/g, "-");
    const map = {
      "strength-score":"str",
      "dexterity-score":"dex",
      "constitution-score":"con",
      "intelligence-score":"int",
      "wisdom-score":"wis",
      "charisma-score":"cha"
    };
    const key = map[subtype];
    if (!key) continue;

    const value = dndNumber(modifier?.value, 0) || 0;
    const type = normalize(modifier?.type);
    if (type === "bonus") scores[key] += value;
    if (type === "set" && value > scores[key]) scores[key] = value;
  }

  return scores;
}

function dndActivationLabel(value) {
  const activation = dndIsRecord(value?.activation) ? value.activation : value;
  const raw = activation?.activationType ?? activation?.type ?? null;
  if (typeof raw === "string") {
    const key = normalize(raw);
    if (key.includes("bonus")) return "Bonus Action";
    if (key.includes("reaction")) return "Reaction";
    if (key.includes("action")) return "Action";
    if (key.includes("minute")) return "Minute";
    if (key.includes("hour")) return "Hour";
    if (key.includes("special")) return "Special";
  }

  return ({
    0:"No Action",
    1:"Action",
    2:"Action",
    3:"Bonus Action",
    4:"Reaction",
    5:"Action",
    6:"Minute",
    7:"Hour",
    8:"Special"
  })[Number(raw)] || "Action";
}

function dndRangeLabel(value) {
  const range = dndIsRecord(value?.range) ? value.range : value;
  if (!range) return "";

  if (typeof range === "number") return range + " ft.";
  if (typeof range === "string") return range;

  const normal =
    dndNumber(range.range, null) ??
    dndNumber(range.distance, null) ??
    dndNumber(range.rangeValue?.amount, null) ??
    dndNumber(range.amount, null);
  const longRange = dndNumber(range.longRange, null);
  const origin = String(range.origin || range.rangeType || "").trim();

  if (normal != null && longRange != null) return normal + "/" + longRange + " ft.";
  if (normal != null) return normal + " ft.";
  return origin;
}

function dndDurationLabel(value) {
  const duration = dndIsRecord(value?.duration) ? value.duration : value;
  if (!duration) return "";
  if (typeof duration === "string") return duration;

  const amount = dndNumber(duration.durationInterval ?? duration.amount, null);
  const unit = String(duration.durationUnit || duration.unit || "").trim();
  if (amount != null && unit) {
    return amount + " " + unit + (amount === 1 ? "" : "s");
  }
  return String(duration.durationType || duration.type || "").trim();
}

function dndDiceExpression(value, depth = 0) {
  if (depth > 5 || value == null) return "";

  if (typeof value === "string") {
    const match = value.match(/\b(\d+d\d+(?:\s*[+-]\s*\d+)?)\b/i);
    return match ? match[1].replace(/\s+/g, "") : "";
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = dndDiceExpression(item, depth + 1);
      if (found) return found;
    }
    return "";
  }

  if (!dndIsRecord(value)) return "";

  const direct = [
    value.diceString,
    value.damageDiceString,
    value.die?.diceString,
    value.dice?.diceString,
    value.damage?.diceString
  ];
  for (const candidate of direct) {
    const found = dndDiceExpression(candidate, depth + 1);
    if (found) return found;
  }

  const count = dndNumber(value.diceCount ?? value.count, null);
  const sides = dndNumber(value.diceValue ?? value.sides ?? value.dieSize, null);
  const fixed = dndNumber(value.fixedValue ?? value.bonus, 0) || 0;
  if (count && sides && sides >= 2) {
    return count + "d" + sides + (fixed ? (fixed > 0 ? "+" : "") + fixed : "");
  }

  for (const key of ["damage","dice","damageDice","damageEffect","healing","healingDice","tempHpDice","value"]) {
    const found = dndDiceExpression(value[key], depth + 1);
    if (found) return found;
  }

  return "";
}

function dndDamageType(value) {
  if (!value) return "";
  const direct = value.damageType || value?.definition?.damageType;
  if (typeof direct === "string") return direct;
  if (dndIsRecord(direct) && direct.name) return String(direct.name);
  return "";
}

function dndAbilityFromId(value, fallback = "cha") {
  return DND_ABILITY_IDS[dndNumber(value, 0)] || fallback;
}

function dndSpellAbility(root, spell, definition, scores) {
  const direct =
    spell?.spellCastingAbilityId ??
    spell?.spellcastingAbilityId ??
    definition?.spellCastingAbilityId ??
    definition?.spellcastingAbilityId;

  if (DND_ABILITY_IDS[dndNumber(direct, 0)]) {
    return dndAbilityFromId(direct);
  }

  const casterClasses = (root?.classes || []).filter(item =>
    dndIsRecord(item) && dndIsRecord(item.definition)
  );
  const best = casterClasses
    .map(item => dndNumber(item.definition.spellCastingAbilityId, 0))
    .find(id => DND_ABILITY_IDS[id]);

  if (best) return dndAbilityFromId(best);
  return Object.entries(scores)
    .sort((a,b) => dndModifier(b[1]) - dndModifier(a[1]))[0]?.[0] || "cha";
}

function dndClassSummary(root) {
  const classes = Array.isArray(root?.classes) ? root.classes : [];
  const names = [];
  let level = 0;

  for (const item of classes) {
    if (!dndIsRecord(item)) continue;
    const className = String(item.definition?.name || item.name || "Adventurer").trim();
    const subclassName = String(item.subclassDefinition?.name || "").trim();
    const classLevel = Math.max(0, dndNumber(item.level, 0) || 0);
    level += classLevel;
    names.push((subclassName ? subclassName + " " : "") + className + " " + classLevel);
  }

  return {
    level:level || Math.max(1, dndNumber(root?.level, 1) || 1),
    label:names.filter(Boolean).join(" / ") || "Adventurer"
  };
}

function dndArmorClass(root, scores) {
  const explicit =
    dndNumber(root?.armorClass, null) ??
    dndNumber(root?.ac, null) ??
    dndNumber(root?.overrideArmorClass, null);
  if (explicit != null && explicit > 0) return explicit;

  const dex = dndModifier(scores.dex);
  let ac = 10 + dex;
  let shield = 0;

  for (const item of root?.inventory || []) {
    if (!dndIsRecord(item) || item.equipped === false) continue;
    const definition = dndIsRecord(item.definition) ? item.definition : {};
    const descriptor = normalize([
      definition.name,
      definition.type,
      definition.filterType,
      definition.subType
    ].filter(Boolean).join(" "));

    if (descriptor.includes("shield")) {
      shield += dndNumber(definition.grantedArmorClass ?? definition.acBonus, 2) || 2;
      continue;
    }

    const base = dndNumber(definition.armorClass, null);
    if (base == null || !descriptor.includes("armor")) continue;

    const dexBonus = descriptor.includes("heavy")
      ? 0
      : descriptor.includes("medium")
        ? Math.min(2, dex)
        : dex;
    ac = Math.max(ac, base + dexBonus);
  }

  return ac + shield;
}

function dndMagicBonus(name) {
  const match = String(name || "").match(/\+(\d+)/);
  return match ? Number(match[1]) : 0;
}

function dndWeaponAbility(definition, scores) {
  const descriptor = normalize([
    definition?.type,
    definition?.filterType,
    definition?.subType,
    ...(definition?.properties || []).map(item => item?.name || "")
  ].join(" "));
  const ranged = Number(definition?.attackType) === 2 || descriptor.includes("ranged");
  const finesse = descriptor.includes("finesse");
  if (finesse) {
    return dndModifier(scores.dex) > dndModifier(scores.str) ? "dex" : "str";
  }
  return ranged ? "dex" : "str";
}

function dndParseActions(root, scores, proficiencyBonus) {
  const actions = [];

  for (const {item:action, source} of dndBucketEntries(root?.actions)) {
    const definition = dndIsRecord(action.definition) ? action.definition : action;
    const name = String(definition.name || action.name || "").trim();
    if (!name) continue;

    const ability = dndAbilityFromId(
      action.abilityModifierStatId ?? definition.abilityModifierStatId,
      Number(action.attackTypeRange ?? definition.attackTypeRange) === 2 ? "dex" : "str"
    );
    const explicitToHit =
      dndNumber(action.fixedToHit, null) ??
      dndNumber(action.toHit, null) ??
      dndNumber(definition.fixedToHit, null) ??
      dndNumber(definition.toHit, null);
    const toHit = explicitToHit != null
      ? explicitToHit
      : dndModifier(scores[ability]) + (action.isProficient === false ? 0 : proficiencyBonus);

    const dice = dndDiceExpression(action.dice) || dndDiceExpression(definition.dice) || dndDiceExpression(action);
    const bonus = dndNumber(action.value ?? definition.value, 0) || 0;
    const damage = dice
      ? dice + (bonus && !/[+-]\d+$/.test(dice) ? (bonus > 0 ? "+" : "") + bonus : "")
      : "";

    if (!action.displayAsAttack && !dice && explicitToHit == null && !definition.displayAsAttack) {
      continue;
    }

    actions.push({
      id:"ddb-action-" + String(action.id || definition.id || actions.length + 1),
      name,
      kind:"attack",
      activation:dndActivationLabel(action.activation || definition.activation || action),
      range:dndRangeLabel(action.range || definition.range),
      toHit,
      damage,
      damageType:dndDamageType(action) || dndDamageType(definition),
      description:dndPlainText(definition.snippet || definition.description || action.snippet || action.description),
      source:source || "Action",
      derived:false
    });
  }

  const existing = new Set(actions.map(action => normalize(action.name)));
  for (const [index, item] of (root?.inventory || []).entries()) {
    if (!dndIsRecord(item) || item.equipped === false) continue;
    const definition = dndIsRecord(item.definition) ? item.definition : {};
    const name = String(definition.name || item.name || "").trim();
    if (!name || existing.has(normalize(name))) continue;

    const descriptor = normalize([
      definition.type,
      definition.filterType,
      definition.subType
    ].filter(Boolean).join(" "));
    const dice = dndDiceExpression(definition.damage);
    const isWeapon =
      descriptor.includes("weapon") ||
      Number(definition.attackType || 0) > 0 ||
      Boolean(dice);
    if (!isWeapon || !dice) continue;

    const ability = dndWeaponAbility(definition, scores);
    const magic = dndMagicBonus(name);
    const abilityBonus = dndModifier(scores[ability]);
    const range = typeof definition.range === "number"
      ? definition.range + (definition.longRange ? "/" + definition.longRange : "") + " ft."
      : dndRangeLabel(definition.range);

    actions.push({
      id:"ddb-item-attack-" + String(item.id || definition.id || index + 1),
      name,
      kind:"attack",
      activation:"Action",
      range,
      toHit:abilityBonus + proficiencyBonus + magic,
      damage:dice + ((abilityBonus + magic)
        ? (abilityBonus + magic > 0 ? "+" : "") + (abilityBonus + magic)
        : ""),
      damageType:String(definition.damageType || ""),
      description:dndPlainText(definition.snippet || definition.description),
      source:"Equipped weapon",
      derived:true
    });
  }

  return dedupeBy(actions, item => normalize(item.kind + "|" + item.name + "|" + item.damage + "|" + item.toHit));
}

function dndSpellRecords(root) {
  const rows = [...dndBucketEntries(root?.spells).map(entry => entry.item)];

  for (const group of root?.classSpells || []) {
    if (!dndIsRecord(group)) continue;
    for (const key of ["spells","alwaysPreparedSpells","alwaysKnownSpells","cantrips"]) {
      for (const spell of group[key] || []) {
        if (dndIsRecord(spell)) rows.push(spell);
      }
    }
  }

  return dedupeBy(
    rows,
    spell => {
      const definition = dndIsRecord(spell.definition) ? spell.definition : spell;
      return String(definition.id || spell.definitionId || "") + "|" + normalize(definition.name || spell.name || "");
    }
  );
}

function dndParseSpells(root, scores, proficiencyBonus) {
  return dndSpellRecords(root).map((spell, index) => {
    const definition = dndIsRecord(spell.definition) ? spell.definition : spell;
    const name = String(definition.name || spell.name || "Spell").trim();
    const ability = dndSpellAbility(root, spell, definition, scores);
    const spellAttack = dndModifier(scores[ability]) + proficiencyBonus;
    const level = Math.max(0, dndNumber(definition.level ?? spell.level, 0) || 0);
    const requiresAttackRoll = Boolean(definition.requiresAttackRoll || spell.requiresAttackRoll || definition.attackType);
    const requiresSavingThrow = Boolean(definition.requiresSavingThrow || spell.requiresSavingThrow || definition.saveDcAbilityId);
    const saveAbility = DND_ABILITY_IDS[dndNumber(definition.saveDcAbilityId ?? spell.saveDcAbilityId, 0)] || "";
    const damage = dndDiceExpression(definition.damageEffect || spell.damageEffect || definition.modifiers || definition.description);

    const components = (definition.components || [])
      .map(value => ({1:"V",2:"S",3:"M"})[Number(value)])
      .filter(Boolean)
      .join(", ");

    return {
      id:"ddb-spell-" + String(spell.id || definition.id || spell.definitionId || index + 1),
      name,
      kind:"spell",
      level,
      school:String(definition.school?.name || definition.school || "").trim(),
      activation:dndActivationLabel(spell.activation || definition.activation || spell),
      range:dndRangeLabel(spell.range || definition.range),
      duration:dndDurationLabel(definition.duration || spell.duration),
      concentration:Boolean(definition.concentration || spell.concentration),
      ritual:Boolean(definition.ritual || spell.castOnlyAsRitual),
      prepared:Boolean(spell.prepared || spell.alwaysPrepared || spell.baseLevelAtWill || level === 0),
      usesSpellSlot:level > 0 && spell.usesSpellSlot !== false && !spell.baseLevelAtWill,
      toHit:requiresAttackRoll ? spellAttack : null,
      saveDc:requiresSavingThrow ? 8 + spellAttack : null,
      saveAbility,
      damage,
      damageType:dndDamageType(definition),
      components,
      description:dndPlainText(definition.snippet || definition.description || spell.additionalDescription),
      source:"Spell"
    };
  }).filter(spell => spell.name);
}

function dndSpellSlots(root) {
  const merged = new Map();
  for (const slot of [...(root?.spellSlots || []), ...(root?.pactMagic || [])]) {
    if (!dndIsRecord(slot)) continue;
    const level = dndNumber(slot.level, 0) || 0;
    if (level < 1) continue;
    const max = Math.max(0, dndNumber(slot.available, 0) || 0);
    const used = Math.max(0, dndNumber(slot.used, 0) || 0);
    const existing = merged.get(level) || {level,max:0,used:0};
    existing.max += max;
    existing.used += used;
    merged.set(level, existing);
  }
  return [...merged.values()].sort((a,b) => a.level - b.level);
}

function dndInventory(root) {
  return (root?.inventory || [])
    .filter(dndIsRecord)
    .map((item, index) => {
      const definition = dndIsRecord(item.definition) ? item.definition : {};
      return {
        id:"ddb-inventory-" + String(item.id || definition.id || index + 1),
        name:String(definition.name || item.name || "Item").trim(),
        quantity:Math.max(0, dndNumber(item.quantity, 1) || 1),
        equipped:Boolean(item.equipped),
        type:String(definition.type || definition.filterType || definition.subType || "").trim(),
        description:dndPlainText(definition.snippet || "")
      };
    })
    .filter(item => item.name);
}

function dndFeatureRules(root) {
  const rules = [];

  const add = (value, category) => {
    if (!dndIsRecord(value)) return;
    const definition = dndIsRecord(value.definition) ? value.definition : value;
    const name = String(definition.name || value.name || "").trim();
    const text = dndPlainText(definition.snippet || definition.description || value.description);
    if (!name) return;
    rules.push({name, text, category, source:"D&D Beyond"});
  };

  for (const trait of root?.race?.racialTraits || []) add(trait, "Species trait");
  for (const feat of root?.feats || []) add(feat, "Feat");
  for (const cls of root?.classes || []) {
    const className = String(cls?.definition?.name || "Class");
    for (const feature of cls?.classFeatures || []) add(feature, className);
  }

  return dedupeBy(rules, item => normalize(item.category + "|" + item.name + "|" + item.text));
}

function parseDndBeyondCharacterPayload(payload, sourceUrl = "") {
  if (!dndIsRecord(payload)) throw new Error("This D&D Beyond JSON was not readable.");
  if (payload.success === false) {
    throw new Error(
      dndPlainText(payload.data?.serverMessage || payload.message) ||
      "D&D Beyond did not return this character. Make sure its privacy is Public."
    );
  }

  const root = dndIsRecord(payload.data) ? payload.data : payload;
  if (!dndIsRecord(root) || !root.name) {
    throw new Error("This does not look like D&D Beyond character-service JSON.");
  }

  const characterId = String(root.id || "").trim();
  const classes = dndClassSummary(root);
  const scores = dndAbilityScores(root);
  const proficiencyBonus = dndProficiencyBonus(classes.level);
  const ac = dndArmorClass(root, scores);
  const overrideHp = dndNumber(root.overrideHitPoints, 0) || 0;
  const constitutionHp = dndModifier(scores.con) * classes.level;
  const maxHp = Math.max(
    1,
    overrideHp > 0
      ? overrideHp
      : (dndNumber(root.baseHitPoints, 1) || 1) +
        constitutionHp +
        (dndNumber(root.bonusHitPoints, 0) || 0)
  );
  const removedHp = Math.max(0, dndNumber(root.removedHitPoints, 0) || 0);
  const tempHp = Math.max(0, dndNumber(root.temporaryHitPoints, 0) || 0);
  const currentHp = Math.max(0, maxHp - removedHp);
  const speed =
    dndNumber(root.speed, null) ??
    dndNumber(root.race?.weightSpeeds?.normal?.walk, null) ??
    30;

  const attacks = dndParseActions(root, scores, proficiencyBonus);
  const spells = dndParseSpells(root, scores, proficiencyBonus);
  const spellSlots = dndSpellSlots(root);
  const inventory = dndInventory(root);
  const features = dndFeatureRules(root);

  const character = {
    id:"dnd-" + (characterId || normalize(root.name).replace(/\s+/g, "-")),
    externalId:characterId,
    name:String(root.name || "D&D Character"),
    type:"Character",
    system:"dnd",
    gameSystemKey:"dnd-5e",
    categories:dedupeBy([
      String(root.race?.fullName || root.race?.baseName || "").trim(),
      classes.label
    ].filter(Boolean), value => normalize(value)),
    stats:[
      {label:"HP", value:currentHp + "/" + maxHp + (tempHp ? " +" + tempHp : "")},
      {label:"AC", value:String(ac)},
      {label:"Speed", value:String(speed) + " ft."},
      {label:"Init", value:dndSigned(dndModifier(scores.dex))},
      {label:"PB", value:dndSigned(proficiencyBonus)},
      {label:"Level", value:String(classes.level)}
    ],
    profiles:[],
    rules:features,
    dnd:{
      level:classes.level,
      classes:classes.label,
      race:String(root.race?.fullName || root.race?.baseName || "").trim(),
      scores,
      proficiencyBonus,
      maxHp,
      currentHp,
      tempHp,
      ac,
      speed,
      attacks,
      spells,
      spellSlots,
      inventory
    },
    searchText:normalize([
      root.name,
      classes.label,
      root.race?.fullName,
      attacks.map(item => item.name),
      spells.map(item => item.name),
      inventory.map(item => item.name),
      features.map(item => item.name)
    ].flat(3).join(" "))
  };

  return {
    id:crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
    name:character.name,
    faction:classes.label,
    source:"dndbeyond",
    gameSystemKey:"dnd-5e",
    importFormat:sourceUrl ? "ddb-public" : "json",
    points:null,
    units:[character],
    armyRules:features,
    referenceData:{rules:[], stratagems:[]},
    importedAt:Date.now(),
    dnd:{
      characterId,
      sourceUrl
    }
  };
}

function extractDndBeyondCharacterId(value = "") {
  const text = String(value || "").trim();
  if (/^\d{1,20}$/.test(text)) return text;

  try {
    const url = new URL(text);
    if (!["dndbeyond.com","www.dndbeyond.com","ddb.ac","www.ddb.ac"].includes(url.hostname.toLowerCase())) return "";
    const match = url.pathname.match(/\/characters\/(\d{1,20})(?:\/|$)/i);
    return match?.[1] || "";
  } catch {
    return "";
  }
}

function saveImportedDndRoster(roster) {
  const existingIndex = state.rosters.findIndex(existing =>
    existing.source === "dndbeyond" &&
    (
      (roster.dnd?.characterId && existing.dnd?.characterId === roster.dnd.characterId) ||
      normalize(existing.name) === normalize(roster.name)
    )
  );

  if (existingIndex >= 0) {
    const oldId = state.rosters[existingIndex].id;
    roster.id = oldId;
    state.rosters.splice(existingIndex, 1, roster);
    state.activeRoster = existingIndex;
  } else {
    state.rosters.push(roster);
    state.activeRoster = state.rosters.length - 1;
  }

  state.unitBrowserSourceId = "roster:" + roster.id;
  localStorage.setItem("tv_unit_browser_source", state.unitBrowserSourceId);
  state.selected = roster.units[0] || null;
  state.selectedRosterId = roster.id;
  state.dndFocusedActionId = "";

  persist();
  renderAll();
  switchPage("datasheets", {silent:true});
  if (state.selected) renderDetail(state.selected);
}

async function loadDndBeyondCharacter() {
  const value = String(els.dndBeyondInput?.value || "").trim();
  const characterId = extractDndBeyondCharacterId(value);

  if (!isDndMode()) {
    toast("Switch to D&D 5e before importing a character.");
    return;
  }
  if (!characterId) {
    if (els.dndBeyondImportStatus) {
      els.dndBeyondImportStatus.textContent = "Paste a D&D Beyond character link or numeric character ID.";
    }
    toast("Paste a D&D Beyond character link or ID.");
    return;
  }

  const button = els.dndBeyondImportButton;
  if (button) {
    button.disabled = true;
    button.textContent = "Importing…";
  }
  if (els.dndBeyondImportStatus) {
    els.dndBeyondImportStatus.dataset.busy = "1";
    els.dndBeyondImportStatus.textContent = "Loading the public character from D&D Beyond…";
  }

  try {
    const response = await fetch("/api/dndbeyond-character?id=" + encodeURIComponent(characterId));
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "Could not import this D&D Beyond character.");

    const sourceUrl = "https://www.dndbeyond.com/characters/" + characterId;
    const roster = parseDndBeyondCharacterPayload(payload, sourceUrl);
    saveImportedDndRoster(roster);

    if (els.dndBeyondInput) els.dndBeyondInput.value = "";
    if (els.dndBeyondImportStatus) {
      els.dndBeyondImportStatus.dataset.busy = "";
      els.dndBeyondImportStatus.textContent =
        "Imported " + roster.name + " · " + roster.faction;
    }
    toast("Imported " + roster.name);
  } catch (error) {
    console.error("D&D Beyond import failed", error);
    if (els.dndBeyondImportStatus) {
      els.dndBeyondImportStatus.dataset.busy = "";
      els.dndBeyondImportStatus.textContent =
        error.message || "Could not import this D&D Beyond character.";
    }
    toast(error.message || "Could not import this D&D Beyond character.");
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "Import D&D Beyond character";
    }
  }
}

async function handleDndBeyondJsonFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const payload = JSON.parse(await file.text());
    const roster = parseDndBeyondCharacterPayload(payload, "");
    saveImportedDndRoster(roster);

    if (els.dndBeyondImportStatus) {
      els.dndBeyondImportStatus.textContent =
        "Imported " + roster.name + " from JSON · " + roster.faction;
    }
    toast("Imported " + roster.name);
  } catch (error) {
    console.error("D&D Beyond JSON import failed", error);
    if (els.dndBeyondImportStatus) {
      els.dndBeyondImportStatus.textContent =
        error.message || "Could not import this D&D Beyond JSON.";
    }
    toast(error.message || "Could not import this D&D Beyond JSON.");
  } finally {
    if (els.dndBeyondFileInput) els.dndBeyondFileInput.value = "";
  }
}

function rosterSourceSummary(roster) {
  if (roster?.source === "dndbeyond") {
    return "D&D 5e · D&D Beyond · " +
      (roster.importFormat === "json" ? "JSON" : "Public character");
  }

  if (roster?.source === "gyrinx") {
    return "Necromunda · Gyrinx · N26";
  }

  if (roster?.source === "opr") {
    return "OnePageRules · " + (roster.gameName || oprGameName(roster.gameSystem)) + " · Army Forge";
  }

  if (roster?.source === "li-community") {
    return "Legions Imperialis · " + (roster.communitySource || "Community Builder") + " · " +
      String(roster?.importFormat || "import").toUpperCase();
  }

  const game = inferRosterGameSystem(roster);
  const prefix = roster?.sharedFromOpponent ? "Opponent share · " : "";
  return prefix +
    gameSystemDisplayName(game) +
    " · New Recruit · " +
    String(roster?.importFormat || "json").toUpperCase();
}

function fileExtension(name = "") {
  const match = String(name).toLowerCase().match(/\.([^.]+)$/);
  return match ? match[1] : "";
}

async function parseRosterUpload(file) {
  const ext = fileExtension(file.name);

  if (ext === "json") {
    return parseRosterFile(await file.text(), file.name);
  }

  if (ext === "ros") {
    return parseRosRosterFile(await file.text(), file.name);
  }

  if (ext === "rosz") {
    if (typeof fflate === "undefined") {
      throw new Error("ROSZ support could not load. Check your connection and refresh.");
    }

    const archive = fflate.unzipSync(new Uint8Array(await file.arrayBuffer()));
    const entryName = Object.keys(archive).find(name => /\.ros$/i.test(name));
    if (!entryName) throw new Error("This ROSZ file does not contain a .ros roster.");

    return parseRosRosterFile(fflate.strFromU8(archive[entryName]), file.name);
  }

  if (ext === "txt") {
    if (state.gameSystem && state.gameSystem !== "40k") {
      throw new Error(
        "TXT import is currently supported for Warhammer 40,000 only. " +
        "For " + currentGameName() + ", export JSON, ROS or ROSZ from New Recruit."
      );
    }
    return parseTextRosterFile(await file.text(), file.name);
  }

  throw new Error("Supported formats are JSON, ROS, ROSZ and TXT.");
}

function xmlDirectChildren(element, localName) {
  return [...(element?.children || [])].filter(child => child.localName === localName);
}

function xmlContainerChildren(element, containerName, childName) {
  const container = xmlDirectChildren(element, containerName)[0];
  return container ? xmlDirectChildren(container, childName) : [];
}

function xmlAttributes(element) {
  const out = {};
  for (const attr of element?.attributes || []) out[attr.name] = attr.value;
  return out;
}

function xmlCostToObject(element) {
  return {
    ...xmlAttributes(element),
    name:element.getAttribute("name") || "",
    value:element.getAttribute("value") || "0"
  };
}

function xmlCategoryToObject(element) {
  return {
    ...xmlAttributes(element),
    name:element.getAttribute("name") || "",
    primary:element.getAttribute("primary") === "true"
  };
}

function xmlRuleToObject(element) {
  const description = xmlDirectChildren(element, "description")[0];
  return {
    ...xmlAttributes(element),
    name:element.getAttribute("name") || "",
    hidden:element.getAttribute("hidden") === "true",
    description:description?.textContent || ""
  };
}

function xmlProfileToObject(element) {
  return {
    ...xmlAttributes(element),
    name:element.getAttribute("name") || "",
    typeName:element.getAttribute("typeName") || "",
    hidden:element.getAttribute("hidden") === "true",
    characteristics:xmlContainerChildren(element, "characteristics", "characteristic").map(characteristic => ({
      ...xmlAttributes(characteristic),
      name:characteristic.getAttribute("name") || "",
      $text:characteristic.textContent || ""
    }))
  };
}

function xmlSelectionToObject(element) {
  const numberRaw = element.getAttribute("number");
  return {
    ...xmlAttributes(element),
    id:element.getAttribute("id") || "",
    name:element.getAttribute("name") || "",
    type:element.getAttribute("type") || "",
    group:element.getAttribute("group") || "",
    number:numberRaw == null || numberRaw === "" ? 1 : Number(numberRaw),
    selections:xmlContainerChildren(element, "selections", "selection").map(xmlSelectionToObject),
    profiles:xmlContainerChildren(element, "profiles", "profile").map(xmlProfileToObject),
    rules:xmlContainerChildren(element, "rules", "rule").map(xmlRuleToObject),
    costs:xmlContainerChildren(element, "costs", "cost").map(xmlCostToObject),
    categories:xmlContainerChildren(element, "categories", "category").map(xmlCategoryToObject)
  };
}

function xmlForceToObject(element) {
  return {
    ...xmlAttributes(element),
    id:element.getAttribute("id") || "",
    name:element.getAttribute("name") || "",
    catalogueName:element.getAttribute("catalogueName") || element.getAttribute("name") || "",
    selections:xmlContainerChildren(element, "selections", "selection").map(xmlSelectionToObject),
    forces:xmlContainerChildren(element, "forces", "force").map(xmlForceToObject),
    profiles:xmlContainerChildren(element, "profiles", "profile").map(xmlProfileToObject),
    rules:xmlContainerChildren(element, "rules", "rule").map(xmlRuleToObject),
    costs:xmlContainerChildren(element, "costs", "cost").map(xmlCostToObject),
    categories:xmlContainerChildren(element, "categories", "category").map(xmlCategoryToObject)
  };
}

function parseRosRosterFile(text, fileName) {
  const doc = new DOMParser().parseFromString(String(text || ""), "application/xml");
  const parseError = doc.querySelector("parsererror");
  if (parseError) throw new Error("The ROS file could not be read as XML.");

  const rosterElement = doc.documentElement?.localName === "roster"
    ? doc.documentElement
    : doc.querySelector("roster");

  if (!rosterElement) throw new Error("This does not look like a New Recruit ROS export.");

  const root = {
    ...xmlAttributes(rosterElement),
    name:rosterElement.getAttribute("name") || fileName.replace(/\.[^.]+$/, ""),
    costs:xmlContainerChildren(rosterElement, "costs", "cost").map(xmlCostToObject),
    forces:xmlContainerChildren(rosterElement, "forces", "force").map(xmlForceToObject)
  };

  return buildRosterFromNewRecruitRoot(root, fileName, "ros");
}

function parseTextRosterFile(text, fileName) {
  const rawLines = String(text || "").replace(/\r/g, "").split("\n");
  const lines = rawLines.map(line => line.replace(/\s+$/g, ""));
  const firstNonEmpty = lines.find(line => line.trim()) || "";

  const rosterMatch = firstNonEmpty.match(/^(.+?)\s+\(([\d,]+)\s+Points?\)$/i);
  if (!rosterMatch) throw new Error("This does not look like a New Recruit TXT export.");

  const rosterName = rosterMatch[1].trim();
  const totalPoints = Number(rosterMatch[2].replace(/,/g, ""));

  const firstSectionIndex = lines.findIndex(line => /^[A-Z][A-Z0-9 /&'()-]+$/.test(line.trim()) && line.trim() === line.trim().toUpperCase());
  const headerLines = lines
    .slice(1, firstSectionIndex > 0 ? firstSectionIndex : Math.min(lines.length, 12))
    .map(line => line.trim())
    .filter(Boolean);

  const detachmentLineIndex = headerLines.findIndex(line => /\(\d+\s+Detachment Points?\)$/i.test(line));
  const detachmentLine = detachmentLineIndex >= 0 ? headerLines[detachmentLineIndex] : "";
  const faction =
    (detachmentLineIndex > 0 ? headerLines[detachmentLineIndex - 1] : "") ||
    headerLines[1] ||
    headerLines[0] ||
    "New Recruit list";

  const detachmentText = detachmentLine
    .replace(/\s+\(\d+\s+Detachment Points?\)$/i, "")
    .trim();

  const detachments = detachmentText
    ? detachmentText.split(/\s+and\s+/i).map(name => ({name:name.trim(), faction})).filter(item => item.name)
    : [];

  const sectionCategoryMap = {
    "CHARACTERS":["Character"],
    "BATTLELINE":["Battleline"],
    "DEDICATED TRANSPORTS":["Dedicated Transport"],
    "TRANSPORTS":["Dedicated Transport"],
    "INFANTRY":["Infantry"],
    "VEHICLES":["Vehicle"],
    "MONSTERS":["Monster"],
    "FORTIFICATIONS":["Fortification"]
  };

  const units = [];
  let currentSection = "";
  let currentUnit = null;

  const flushUnit = () => {
    if (!currentUnit) return;
    currentUnit.categories = dedupeBy(currentUnit.categories || [], value => normalize(value));
    currentUnit.searchText = normalize([
      currentUnit.name,
      ...(currentUnit.textLoadout || [])
    ].join(" "));
    units.push(currentUnit);
    currentUnit = null;
  };

  for (const originalLine of lines) {
    const trimmed = originalLine.trim();
    if (!trimmed) continue;

    if (/^[A-Z][A-Z0-9 /&'()-]+$/.test(trimmed) && trimmed === trimmed.toUpperCase()) {
      flushUnit();
      currentSection = trimmed;
      continue;
    }

    if (/^Attached unit\s+\d+$/i.test(trimmed)) {
      flushUnit();
      continue;
    }

    const unitMatch = originalLine.match(/^([^\s•◦].*?)\s+\(([\d,]+)\s+Points?\)$/i);
    if (unitMatch) {
      flushUnit();

      const points = Number(unitMatch[2].replace(/,/g, ""));
      const categories = [...(sectionCategoryMap[currentSection] || [])];

      currentUnit = {
        id:"txt-" + normalize(unitMatch[1]).replace(/\s+/g, "-") + "-" + units.length,
        name:unitMatch[1].trim(),
        type:"Unit",
        categories,
        stats:[{label:"Pts", value:String(points)}],
        rules:[],
        profiles:[],
        textLoadout:[],
        importFormat:"txt",
        limitedData:true,
        searchText:""
      };
      continue;
    }

    if (!currentUnit) continue;

    const attachedMatch = trimmed.match(/^•\s*Attached as:\s*([^()]+?)(?:\s*\(([^)]+)\))?$/i);
    if (attachedMatch) {
      const role = attachedMatch[2] || attachedMatch[1];
      if (role) currentUnit.categories.push(role.trim());
      currentUnit.textLoadout.push(trimmed.replace(/^•\s*/, ""));
      continue;
    }

    if (/^[•◦]/.test(trimmed)) {
      currentUnit.textLoadout.push(trimmed.replace(/^[•◦]\s*/, ""));
    }
  }

  flushUnit();

  if (!units.length) throw new Error("No units were found in this TXT export.");

  return {
    id:crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
    name:rosterName || fileName.replace(/\.[^.]+$/, ""),
    faction,
    source:"new-recruit",
    gameSystemKey:["40k","aos","grimdark"].includes(state.gameSystem) ? state.gameSystem : "40k",
    importFormat:"txt",
    detachmentParserVersion:4,
    points:Number.isFinite(totalPoints) ? totalPoints : null,
    detachments,
    selectedDetachmentStratagems:[],
    detachmentRules:[],
    armyRules:[],
    units,
    referenceData:{rules:[], stratagems:[]},
    importedAt:Date.now()
  };
}



function hasLegionsImperialisDetachmentProfile(selection) {
  return collectProfiles(selection).some(isLegionsImperialisDetachmentProfile);
}

function isLegionsImperialisDetachmentSelection(selection) {
  if (!selection || typeof selection !== "object") return false;
  if (normalize(selection.type) !== "unit") return false;
  if (normalize(selection.subType || selection.subtype || "") === "unit group") return false;
  return hasLegionsImperialisDetachmentProfile(selection);
}

function collectLegionsImperialisDetachmentSelections(selections = []) {
  const found = [];

  function walk(selection) {
    if (!selection || typeof selection !== "object") return;

    if (isLegionsImperialisDetachmentSelection(selection)) {
      found.push(selection);
      return;
    }

    for (const child of selection.selections || []) walk(child);
  }

  for (const selection of selections || []) walk(selection);
  return found;
}

function extractLegionsImperialisFormationRules(root) {
  const rules = [];

  function addRule(rule, source = "") {
    if (!rule || rule.hidden) return;
    const name = cleanRuleText(rule.name || "").trim();
    const text = cleanRuleText(rule.description || "").trim();
    if (!name || !text) return;
    rules.push({name, text, category:"Formation Rule", source});
  }

  function addProfile(profile, source = "") {
    if (!isLegionsImperialisRuleProfile(profile)) return;
    const rule = legionsImperialisRuleProfileToRule(profile);
    if (!rule?.name || !rule?.text) return;
    rules.push({...rule, category:"Formation Rule", source});
  }

  function walkWrapperSelection(selection, source = "") {
    if (!selection || typeof selection !== "object") return;
    if (isLegionsImperialisDetachmentSelection(selection)) return;

    for (const rule of selection.rules || []) addRule(rule, source);
    for (const profile of selection.profiles || []) addProfile(profile, source);
    for (const child of selection.selections || []) walkWrapperSelection(child, source);
  }

  for (const force of collectRosterForces(root?.forces || [])) {
    const source = force.name || force.catalogueName || "";
    for (const rule of force.rules || []) addRule(rule, source);
    for (const profile of force.profiles || []) addProfile(profile, source);
    for (const selection of force.selections || []) walkWrapperSelection(selection, source);
  }

  return dedupeBy(
    rules,
    item => normalize((item.category || "") + "|" + item.name + "|" + item.text + "|" + item.source)
  );
}

function collectKillTeamOperativeSelections(selections = []) {
  const found = [];

  function walk(selection) {
    if (!selection || typeof selection !== "object") return;

    const directOperative = (selection.profiles || []).some(isKillTeamOperativeProfile);
    if (directOperative) {
      found.push(selection);
      return;
    }

    for (const child of selection.selections || []) walk(child);
  }

  for (const selection of selections || []) walk(selection);
  return found;
}

function buildRosterFromNewRecruitRoot(root, fileName, importFormat = "json") {
  const units = [];
  const allForces = collectRosterForces(root?.forces || []);
  const metadataGameSystem = detectNewRecruitGameSystem(root, []);

  for (const force of allForces) {
    const selections = metadataGameSystem === "kill-team"
      ? collectKillTeamOperativeSelections(force.selections || [])
      : metadataGameSystem === "legions-imperialis"
        ? collectLegionsImperialisDetachmentSelections(force.selections || [])
        : (force.selections || []);

    for (const selection of selections) {
      const unit = parseNewRecruitSelection(selection);
      if (unit) units.push(unit);
    }
  }

  if (!units.length) throw new Error("No units were found in this New Recruit list.");

  const uniqueUnits = dedupeBy(units, unit => unit.id || unit.name);
  const gameSystemKey = detectNewRecruitGameSystem(root, uniqueUnits);

  if (gameSystemKey === "40k") resolveRosterAttachments(uniqueUnits);

  const pts = (root.costs || []).find(cost => isPointsCostName(cost.name))?.value;
  const firstFactionForce =
    allForces.find(force => String(force.catalogueName || "").trim()) ||
    allForces[0];

  const armyRules = gameSystemKey === "aos"
    ? extractAosRosterAbilities(root)
    : gameSystemKey === "heresy"
      ? extractHeresyArmyRules(root)
      : gameSystemKey === "kill-team"
        ? extractKillTeamRules(root)
        : gameSystemKey === "legions-imperialis"
          ? extractLegionsImperialisFormationRules(root)
          : gameSystemKey === "40k"
            ? [...extractArmyRules(root), ...extractForceDispositions(root)]
            : extractArmyRules(root);

  uniqueUnits.forEach(unit => {
    if (unit?.system === "opr") unit.gameSystemKey = gameSystemKey;
    if (gameSystemKey === "heresy") {
      unit.system = "heresy";
      unit.gameSystemKey = "heresy";
    }
    if (gameSystemKey === "kill-team") {
      unit.system = "kill-team";
      unit.gameSystemKey = "kill-team";
    }
    if (gameSystemKey === "legions-imperialis") {
      unit.system = "legions-imperialis";
      unit.gameSystemKey = "legions-imperialis";
    }
  });

  return {
    id:crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
    name:root.name || fileName.replace(/\.[^.]+$/, ""),
    faction:firstFactionForce?.catalogueName || firstFactionForce?.name || "New Recruit list",
    source:"new-recruit",
    gameSystemKey,
    gameSystemName:String(root?.gameSystemName || ""),
    importFormat,
    detachmentParserVersion:4,
    points:pts ?? null,
    detachments:gameSystemKey === "40k" ? extractSelectedDetachments(root) : [],
    selectedDetachmentStratagems:gameSystemKey === "40k" ? extractSelectedDetachmentStratagems(root) : [],
    detachmentRules:gameSystemKey === "40k" ? extractSelectedDetachmentRules(root) : [],
    armyRules,
    units:uniqueUnits,
    referenceData:gameSystemKey === "40k"
      ? extractReferenceData(root, fileName)
      : {rules:[], stratagems:[]},
    importedAt:Date.now()
  };
}

function collectRosterForces(forces = []) {
  const output = [];

  function walk(list) {
    for (const force of list || []) {
      if (!force || typeof force !== "object") continue;
      output.push(force);
      if (Array.isArray(force.forces) && force.forces.length) walk(force.forces);
    }
  }

  walk(forces);
  return output;
}

function detectNewRecruitGameSystem(root, units = []) {
  const systemName = normalize(
    root?.gameSystemName ||
    root?.gameSystem ||
    root?.gameSystemId ||
    ""
  );

  if (systemName.includes("age of sigmar")) return "aos";
  if (
    systemName.includes("kill team") ||
    systemName.includes("c521 ad27 44df f959")
  ) return "kill-team";
  if (
    systemName.includes("legions imperialis") ||
    systemName.includes("sys 9498 516a 178a 3f4f")
  ) return "legions-imperialis";
  if (
    systemName.includes("horus heresy") ||
    systemName.includes("age of darkness") ||
    systemName.includes("sys 9fe4 1dc3 b7c2 73cf")
  ) return "heresy";
  if (systemName.includes("age of fantasy quest")) return "aof-quest";
  if (systemName.includes("age of fantasy regiments")) return "aof-regiments";
  if (systemName.includes("age of fantasy skirmish")) return "aof-skirmish";
  if (systemName.includes("age of fantasy")) return "aof";
  if (systemName.includes("grimdark future star quest")) return "opr-star-quest";
  if (systemName.includes("grimdark future firefight")) return "grimdark-firefight";
  if (systemName.includes("grimdark future")) return "grimdark";
  if (
    systemName.includes("warhammer 40 000") ||
    systemName.includes("warhammer 40000") ||
    systemName === "40k"
  ) return "40k";

  const counts = {aos:0, grimdark:0, "40k":0};
  for (const unit of units) {
    const system = inferUnitGameSystem(unit);
    if (counts[system] != null) counts[system]++;
  }

  const best = Object.entries(counts).sort((a,b) => b[1] - a[1])[0];
  if (best?.[1] > 0) {
    if (best[0] === "grimdark" && isOprMode()) return state.gameSystem;
    return best[0];
  }

  return "40k";
}

function isAosAbilityProfile(profile) {
  return /^ability\s*\(/i.test(String(profile?.typeName || ""));
}

function aosAbilityProfileToRule(profile) {
  const values = new Map(
    (profile?.characteristics || []).map(item => [
      normalize(item?.name || ""),
      cleanRuleText(characteristicValue(item))
    ])
  );

  const ordered = [
    ["timing","Timing"],
    ["casting value","Casting Value"],
    ["chanting value","Chanting Value"],
    ["cost","Cost"],
    ["declare","Declare"],
    ["effect","Effect"],
    ["keywords","Keywords"],
    ["used by","Used By"]
  ];

  const fields = ordered
    .map(([key,label]) => ({label, value:String(values.get(key) || "").trim()}))
    .filter(field => field.value);

  const typeMatch = String(profile?.typeName || "").match(/Ability\s*\(([^)]+)\)/i);

  return {
    name:cleanRuleText(profile?.name || "Ability"),
    category:typeMatch?.[1] || "Ability",
    fields,
    text:fields.map(field => field.label + ": " + field.value).join("\n")
  };
}

function extractAosRosterAbilities(root) {
  const collected = [];

  function walkSelection(selection) {
    if (!selection || typeof selection !== "object") return;

    const isUnit =
      String(selection.type || "").toLowerCase() === "unit" ||
      (selection.profiles || []).some(profile => profile?.typeName === "Unit");

    if (isUnit) return;

    for (const profile of selection.profiles || []) {
      if (!isAosAbilityProfile(profile) || profile.hidden) continue;
      const rule = aosAbilityProfileToRule(profile);
      if (rule.name && rule.text) collected.push(rule);
    }

    for (const child of selection.selections || []) walkSelection(child);
  }

  for (const force of collectRosterForces(root?.forces || [])) {
    for (const selection of force.selections || []) walkSelection(selection);
  }

  return dedupeBy(
    collected,
    rule => normalize(rule.category + "|" + rule.name + "|" + rule.text)
  );
}

function splitCompositeDetachmentName(name = "") {
  const raw = String(name || "").trim();
  if (!raw) return [];
  const parts = raw.split(/\s+and\s+/i).map(part => part.trim()).filter(Boolean);
  return parts.length > 1 ? parts : [raw];
}

function isSelectedDetachmentNode(value) {
  if (!value || typeof value !== "object") return false;

  const count = Number(value.number);
  const selected = Number.isFinite(count) && count > 0;
  if (!selected) return false;

  const group = String(value.group || value.entryGroupName || "");
  const categories = [
    ...(value.categories || []),
    ...(value.categoryLinks || [])
  ].map(category => String(category?.name || ""));

  const hasDetachmentCost = (value.costs || []).some(cost =>
    /detachment points?/i.test(String(cost?.name || "")) &&
    Number(cost?.value || 0) > 0
  );

  return (
    /detachment/i.test(group) ||
    categories.some(name => /(?:^|\b)\d*\s*dp\s+detachment\b/i.test(name)) ||
    hasDetachmentCost
  );
}

function parseBundledStratagemText(rawText, fallbackName = "Stratagem") {
  const raw = String(rawText || "").replace(/\r/g, "").trim();
  if (!raw) return [];

  const headingRegex = /^#{2,6}\s+(.+)$/gm;
  const headings = [...raw.matchAll(headingRegex)];
  if (!headings.length) return [];

  const results = [];

  const addBlock = (name, body) => {
    let text = String(body || "").trim();
    if (!text) return;

    const lines = text.split("\n");
    let cost = "";

    while (lines.length && !lines[0].trim()) lines.shift();
    if (lines.length && /^\d+\s*CP$/i.test(lines[0].trim())) {
      cost = lines.shift().trim().replace(/\s+/g, "");
    }

    text = cleanRuleText(lines.join("\n"));
    if (!text) return;

    results.push({
      name:cleanRuleText(name || fallbackName),
      text,
      category:cost || "Stratagem",
      source:"Imported New Recruit"
    });
  };

  const preface = raw.slice(0, headings[0].index).trim();
  if (preface) addBlock(fallbackName, preface);

  headings.forEach((heading, index) => {
    const bodyStart = heading.index + heading[0].length;
    const bodyEnd = headings[index + 1]?.index ?? raw.length;
    addBlock(heading[1].trim(), raw.slice(bodyStart, bodyEnd));
  });

  return results;
}

function extractSelectedDetachmentStratagems(root) {
  const collected = [];

  function collectFromDetachmentNode(node, detachmentName) {
    function walk(value) {
      if (!value || typeof value !== "object") return;
      if (Array.isArray(value)) {
        value.forEach(walk);
        return;
      }

      for (const profile of value.profiles || []) {
        if (!profile || profile.hidden) continue;

        const type = String(profile.typeName || "");
        const rawText = (profile.characteristics || [])
          .map(characteristic => characteristicValue(characteristic))
          .filter(Boolean)
          .join("\n");

        const bundled = parseBundledStratagemText(rawText, profile.name || "Stratagem");

        if (bundled.length) {
          bundled.forEach(item => collected.push({...item, detachment:detachmentName}));
        } else if (/stratagem/i.test(type) && rawText) {
          collected.push({
            name:cleanRuleText(profile.name || "Stratagem"),
            text:cleanRuleText(rawText),
            category:type || "Stratagem",
            detachment:detachmentName,
            source:"Imported New Recruit"
          });
        }
      }

      for (const rule of value.rules || []) {
        if (!rule || rule.hidden || !rule.description) continue;
        const bundled = parseBundledStratagemText(rule.description, rule.name || "Stratagem");
        bundled.forEach(item => collected.push({...item, detachment:detachmentName}));
      }

      for (const child of value.selections || []) walk(child);
    }

    walk(node);
  }

  for (const force of collectRosterForces(root?.forces || [])) {
    function walk(value) {
      if (!value || typeof value !== "object") return;
      if (Array.isArray(value)) {
        value.forEach(walk);
        return;
      }

      if (
        isSelectedDetachmentNode(value) &&
        value.name &&
        !/^detachment$/i.test(String(value.name).trim())
      ) {
        collectFromDetachmentNode(value, String(value.name).trim());
      }

      for (const child of value.selections || []) walk(child);
    }

    walk(force.selections || []);
  }

  return dedupeBy(
    collected,
    item => normalize(item.name + "|" + item.text)
  );
}

function extractSelectedDetachments(root) {
  const found = [];

  for (const force of collectRosterForces(root?.forces || [])) {
    const faction = force.catalogueName || force.name || "";

    function walk(value) {
      if (!value || typeof value !== "object") return;
      if (Array.isArray(value)) {
        value.forEach(walk);
        return;
      }

      if (
        isSelectedDetachmentNode(value) &&
        value.name &&
        !/^detachment$/i.test(String(value.name).trim())
      ) {
        for (const name of splitCompositeDetachmentName(value.name)) {
          found.push({name, faction});
        }
      }

      for (const child of value.selections || []) walk(child);
    }

    walk(force.selections || []);
  }

  return dedupeBy(found, item => normalize(item.faction + "|" + item.name));
}


function extractSelectedDetachmentRules(root) {
  const collected = [];

  function collectFromDetachmentNode(node, detachmentName, sourceLabel) {
    function walk(value) {
      if (!value || typeof value !== "object") return;
      if (Array.isArray(value)) {
        value.forEach(walk);
        return;
      }

      for (const rule of value.rules || []) {
        if (!rule || rule.hidden || !rule.description) continue;

        const name = cleanRuleText(rule.name || "Detachment rule").trim();
        const text = cleanRuleText(rule.description || "").trim();
        if (!name || !text) continue;

        // Bundled detachment stratagem text is handled by the stratagem parser,
        // so do not duplicate it on the Army Rules page.
        if (parseBundledStratagemText(rule.description, rule.name || "Stratagem").length) continue;

        collected.push({
          name,
          text,
          category:"Detachment rule",
          detachment:detachmentName,
          source:sourceLabel || "Imported New Recruit"
        });
      }

      for (const profile of value.profiles || []) {
        if (!profile || profile.hidden) continue;

        const type = String(profile.typeName || "");
        const name = cleanRuleText(profile.name || "Detachment ability").trim();
        const rawText = (profile.characteristics || [])
          .map(characteristic => characteristicValue(characteristic))
          .filter(Boolean)
          .join("\n");
        const text = cleanRuleText(rawText).trim();

        if (!name || !text) continue;
        if (/stratagem/i.test(type) || /stratagem/i.test(name)) continue;
        if (parseBundledStratagemText(rawText, name).length) continue;
        if (!/abilit|detachment|rule/i.test(type)) continue;

        collected.push({
          name,
          text,
          category:"Detachment ability",
          detachment:detachmentName,
          source:sourceLabel || "Imported New Recruit"
        });
      }

      for (const child of value.selections || []) walk(child);
    }

    walk(node);
  }

  for (const force of collectRosterForces(root?.forces || [])) {
    const sourceLabel = force.catalogueName || force.name || "";

    function walk(value) {
      if (!value || typeof value !== "object") return;
      if (Array.isArray(value)) {
        value.forEach(walk);
        return;
      }

      if (
        isSelectedDetachmentNode(value) &&
        value.name &&
        !/^detachment$/i.test(String(value.name).trim())
      ) {
        collectFromDetachmentNode(value, String(value.name).trim(), sourceLabel);
      }

      for (const child of value.selections || []) walk(child);
    }

    walk(force.selections || []);
  }

  return dedupeBy(
    collected,
    item => normalize((item.detachment || "") + "|" + item.name + "|" + item.text)
  );
}



function extractKillTeamRules(root) {
  const rules = [...extractArmyRules(root)];

  function addProfile(profile, source = "") {
    if (!isKillTeamRuleProfile(profile)) return;
    const rule = killTeamRuleProfileToRule(profile);
    if (!rule?.name || !rule?.text) return;
    rules.push({...rule, source});
  }

  function addRule(rule, source = "") {
    if (!rule || rule.hidden) return;
    const name = cleanRuleText(rule.name || "").trim();
    const text = cleanRuleText(rule.description || "").trim();
    if (!name || !text) return;
    rules.push({name, text, category:"Team rule", source});
  }

  function hasOperativeProfile(selection) {
    return collectProfiles(selection).some(isKillTeamOperativeProfile);
  }

  function walkNonOperativeSelection(selection, source = "") {
    if (!selection || typeof selection !== "object") return;
    if (hasOperativeProfile(selection)) return;

    for (const profile of selection.profiles || []) addProfile(profile, source);
    for (const rule of selection.rules || []) addRule(rule, source);
    for (const child of selection.selections || []) walkNonOperativeSelection(child, source);
  }

  for (const force of collectRosterForces(root?.forces || [])) {
    const source = force.catalogueName || force.name || "";
    for (const profile of force.profiles || []) addProfile(profile, source);
    for (const rule of force.rules || []) addRule(rule, source);
    for (const selection of force.selections || []) walkNonOperativeSelection(selection, source);
  }

  return dedupeBy(
    rules,
    item => normalize((item.category || "") + "|" + item.name + "|" + item.text)
  );
}

function extractHeresyArmyRules(root) {
  const rules = [...extractArmyRules(root)];

  function addProfile(profile, source = "") {
    if (!isHeresyRuleProfile(profile)) return;
    const rule = heresyRuleProfileToRule(profile);
    if (!rule?.name || !rule?.text) return;
    rules.push({...rule, source});
  }

  function addRule(rule, source = "") {
    if (!rule || rule.hidden) return;
    const name = cleanRuleText(rule.name || "").trim();
    const text = cleanRuleText(rule.description || "").trim();
    if (!name || !text) return;
    rules.push({name, text, category:"Army rule", source});
  }

  function walkNonUnitSelection(selection, source = "") {
    if (!selection || typeof selection !== "object") return;
    if (normalize(selection.type) === "unit") return;

    for (const profile of selection.profiles || []) addProfile(profile, source);
    for (const rule of selection.rules || []) addRule(rule, source);
    for (const child of selection.selections || []) walkNonUnitSelection(child, source);
  }

  for (const force of collectRosterForces(root?.forces || [])) {
    const source = force.catalogueName || force.name || "";
    for (const profile of force.profiles || []) addProfile(profile, source);
    for (const selection of force.selections || []) walkNonUnitSelection(selection, source);
  }

  return dedupeBy(
    rules,
    item => normalize((item.category || "") + "|" + item.name + "|" + item.text)
  );
}

function extractForceDispositions(root) {
  const dispositions = [];

  for (const force of collectRosterForces(root?.forces || [])) {
    const source = force.catalogueName || force.name || "";

    function addDisposition(value) {
      const name = cleanRuleText(value || "").trim();
      if (!name || normalize(name) === "force disposition") return;

      dispositions.push({
        name:"Force Disposition",
        text:name,
        category:"Force Disposition",
        source
      });
    }

    function walk(value) {
      if (!value || typeof value !== "object") return;
      if (Array.isArray(value)) {
        value.forEach(walk);
        return;
      }

      const isDispositionContainer = normalize(value.name || "") === "force disposition";
      const isDispositionChoice = normalize(value.group || "") === "force disposition";

      if (isDispositionContainer) {
        for (const child of value.selections || []) {
          addDisposition(child?.name);
        }
      } else if (isDispositionChoice) {
        addDisposition(value.name);
      }

      for (const child of value.selections || []) walk(child);
    }

    walk(force.selections || []);
  }

  return dedupeBy(
    dispositions,
    item => normalize(item.name + "|" + item.text + "|" + item.source)
  );
}

function extractArmyRules(root) {
  const rules = [];

  for (const force of collectRosterForces(root?.forces || [])) {
    for (const rule of force.rules || []) {
      const name = cleanRuleText(rule?.name || "").trim();
      const text = cleanRuleText(rule?.description || "").trim();
      if (!name || !text || rule.hidden) continue;
      rules.push({
        name,
        text,
        category:"Army rule",
        source:force.catalogueName || force.name || ""
      });
    }
  }

  return dedupeBy(rules, item => normalize(item.name + "|" + item.text));
}

function parseRosterFile(text, fileName) {
  let raw;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error("This JSON file could not be read.");
  }

  if (!raw?.roster) {
    throw new Error("This does not look like a New Recruit JSON export.");
  }

  return buildRosterFromNewRecruitRoot(raw.roster, fileName, "json");
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


function collectSelectionIds(node) {
  const ids = [];

  function walk(value) {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }

    if (value.id) ids.push(String(value.id));
    for (const child of value.selections || []) walk(child);
  }

  walk(node);
  return [...new Set(ids)];
}

function normalizeUnitAssociations(associations = []) {
  return (associations || [])
    .filter(item => item && typeof item === "object")
    .map(item => ({
      type:String(item.type || ""),
      from:String(item.from || ""),
      to:String(item.to || ""),
      name:String(item.name || ""),
      action:String(item.action || "")
    }));
}

function resolveRosterAttachments(units = []) {
  const bySelectionId = new Map();

  for (const unit of units) {
    delete unit.attachedUnits;
    delete unit.attachedTo;
    delete unit.linkedUnitIds;

    for (const id of unit.selectionIds || []) {
      if (id) bySelectionId.set(String(id), unit);
    }
  }

  for (const bodyguard of units) {
    const linked = [{unit:bodyguard, order:0}];

    for (const association of bodyguard.incomingAssociations || []) {
      if (!/leading|supporting/i.test(association.name || "")) continue;

      const attached = bySelectionId.get(String(association.from || ""));
      if (!attached || attached === bodyguard) continue;

      const order = /leading/i.test(association.name || "") ? 1 : 2;
      linked.push({unit:attached, order});
    }

    const group = dedupeBy(
      linked.sort((a,b) => a.order - b.order).map(item => item.unit),
      item => item.id
    );

    if (group.length < 2) continue;

    const ids = group.map(item => item.id);
    for (const unit of group) {
      unit.linkedUnitIds = ids;
    }
  }

  return units;
}




function isLegionsImperialisDetachmentProfile(profile) {
  if (!profile || typeof profile !== "object") return false;
  if (normalize(profile.typeName || "") !== "detachment") return false;

  const labels = new Set(
    (profile.characteristics || []).map(item => normalize(item?.name || ""))
  );

  return labels.has("move") &&
    labels.has("sv") &&
    labels.has("caf") &&
    labels.has("morale") &&
    labels.has("w");
}

function isLegionsImperialisRuleProfile(profile) {
  return profile &&
    !profile.hidden &&
    normalize(profile.typeName || "") === "special rules";
}

function legionsImperialisRuleProfileToRule(profile) {
  const text = cleanRuleText(
    characteristicValue((profile.characteristics || [])[0])
  ).trim();

  if (!text) return null;

  return {
    name:String(profile.name || "Special Rule").trim(),
    text,
    category:"Special Rule"
  };
}

function isKillTeamOperativeProfile(profile) {
  if (!profile || typeof profile !== "object") return false;
  if (normalize(profile.typeName || "") !== "operative") return false;

  const labels = new Set(
    (profile.characteristics || []).map(item => normalize(item?.name || ""))
  );

  return labels.has("apl") &&
    labels.has("move") &&
    labels.has("save") &&
    labels.has("wounds");
}

function isKillTeamRuleProfile(profile) {
  if (!profile || profile.hidden) return false;
  return [
    "abilities",
    "equipment",
    "unique actions",
    "psychic power",
    "chapter tactics",
    "markerlight tokens"
  ].includes(normalize(profile.typeName || ""));
}

function killTeamRuleProfileToRule(profile) {
  const fields = (profile?.characteristics || [])
    .map(item => ({
      label:String(item?.name || "").trim(),
      value:cleanRuleText(characteristicValue(item)).trim()
    }))
    .filter(item => item.value);

  if (!fields.length) return null;

  return {
    name:String(profile.name || profile.typeName || "Rule").trim(),
    text:fields.map(item => item.value).join("\n\n"),
    category:String(profile.typeName || "Rule")
  };
}

function isHeresyUnitProfile(profile) {
  if (!profile || typeof profile !== "object") return false;
  const type = normalize(profile.typeName || "");
  const allowed = new Set([
    "profile",
    "vehicle",
    "knight",
    "ordinatus carriage",
    "ordinatus gun",
    "titan head",
    "titan carapace",
    "titan arms",
    "titan legs"
  ]);
  if (!allowed.has(type)) return false;

  const labels = new Set(
    (profile.characteristics || []).map(item => normalize(item?.name || ""))
  );

  if (type === "profile") {
    return labels.has("m") &&
      (labels.has("ws") || labels.has("bs")) &&
      (labels.has("sav") || labels.has("t") || labels.has("w"));
  }

  return labels.has("m") && labels.has("hp");
}

function heresyTypeCategories(profile) {
  const typeValue = (profile?.characteristics || [])
    .find(item => normalize(item?.name || "") === "type");

  const raw = characteristicValue(typeValue);
  if (!raw) return [];

  return dedupeBy(
    String(raw)
      .replace(/[()]/g, ",")
      .split(",")
      .map(value => value.trim())
      .filter(Boolean),
    value => normalize(value)
  );
}

function isHeresyRuleProfile(profile) {
  if (!profile || profile.hidden) return false;
  const type = normalize(profile.typeName || "");
  return [
    "wargear",
    "wargear item",
    "traits",
    "reaction",
    "reactions",
    "gambit",
    "detachment description",
    "psychic power",
    "cybertheurgic rite",
    "cybertheurgic rite:",
    "asset"
  ].includes(type);
}

function heresyRuleProfileToRule(profile) {
  const fields = (profile?.characteristics || [])
    .map(item => ({
      label:String(item?.name || "").trim(),
      value:cleanRuleText(characteristicValue(item)).trim()
    }))
    .filter(item => item.value);

  if (!fields.length) return null;

  const preferredText = fields
    .filter(item => !/^summary$/i.test(item.label))
    .map(item => item.label ? item.label + ": " + item.value : item.value)
    .join("\n\n");

  const summary = fields.find(item => /^summary$/i.test(item.label))?.value || "";

  return {
    name:String(profile.name || profile.typeName || "Rule"),
    text:preferredText || summary,
    category:String(profile.typeName || "Rule")
  };
}


function newRecruitSelectionPointTotal(selection) {
  let total = 0;

  function walk(node) {
    if (!node || typeof node !== "object") return;

    for (const cost of node.costs || []) {
      if (!isPointsCostName(cost?.name)) continue;
      const value = Number(cost?.value);
      if (Number.isFinite(value)) total += value;
    }

    for (const child of node.selections || []) walk(child);
  }

  walk(selection);
  return total;
}

function parseNewRecruitSelection(selection) {
  const allProfiles = collectProfiles(selection);
  const unitProfiles = allProfiles.filter(profile =>
    profile?.typeName === "Unit" ||
    isHeresyUnitProfile(profile) ||
    isKillTeamOperativeProfile(profile) ||
    isLegionsImperialisDetachmentProfile(profile)
  );
  if (!unitProfiles.length) return null;

  const primaryUnitProfile =
    unitProfiles.find(profile => normalize(profile.name) === normalize(selection.name)) ||
    unitProfiles[0];

  const heresyProfile = isHeresyUnitProfile(primaryUnitProfile);
  const killTeamProfile = isKillTeamOperativeProfile(primaryUnitProfile);
  const legionsImperialisProfile = isLegionsImperialisDetachmentProfile(primaryUnitProfile);
  const heresyComponents = unitProfiles
    .filter(profile => /^titan\s/i.test(String(profile?.typeName || "")))
    .map(profile => ({
      name:String(profile.name || profile.typeName || "Component").trim(),
      type:String(profile.typeName || ""),
      values:(profile.characteristics || []).map(characteristic => ({
        label:characteristic.name || "",
        value:characteristicValue(characteristic)
      })).filter(item => item.label && item.value !== "")
    }));

  const heresyModelProfiles = heresyProfile
    ? unitProfiles
        .filter(profile => !/^titan\s/i.test(String(profile?.typeName || "")))
        .map(profile => ({
          name:String(profile.name || selection.name || "Model").trim(),
          type:String(profile.typeName || ""),
          values:(profile.characteristics || []).map(characteristic => ({
            label:characteristic.name || "",
            value:characteristicValue(characteristic)
          })).filter(item => item.label && item.value !== "")
        }))
    : [];

  const legionsImperialisProfiles = legionsImperialisProfile
    ? unitProfiles.map(profile => ({
        name:String(profile.name || selection.name || "Detachment").trim(),
        values:(profile.characteristics || []).map(characteristic => ({
          label:characteristic.name || "",
          value:characteristicValue(characteristic)
        })).filter(item => item.label && item.value !== "")
      }))
    : [];

  const stats = (primaryUnitProfile.characteristics || []).map(characteristic => ({
    label:characteristic.name || "",
    value:characteristicValue(characteristic)
  })).filter(item => item.label && item.value !== "");

  const statLabels = new Set(stats.map(stat => normalize(stat.label)));
  const grimdarkProfile =
    statLabels.has("quality") &&
    (statLabels.has("defense") || statLabels.has("defence"));
  const aosProfile =
    statLabels.has("move") &&
    statLabels.has("health") &&
    statLabels.has("save") &&
    statLabels.has("control");

  const system = legionsImperialisProfile
    ? "legions-imperialis"
    : killTeamProfile
      ? "kill-team"
      : heresyProfile
      ? "heresy"
      : aosProfile
        ? "aos"
        : grimdarkProfile
          ? "opr"
          : "40k";

  const weapons = mergeWeaponProfiles(
    collectWeaponProfiles(selection).map(({profile, quantity}) => ({
      ...profileToDisplay(profile),
      quantity
    }))
  );

  const standardAbilityProfiles = system === "kill-team"
    ? []
    : allProfiles
        .filter(profile => profile?.typeName === "Abilities")
        .map(profile => ({
          name:profile.name || "Ability",
          text:characteristicValue((profile.characteristics || [])[0])
        }));

  const aosAbilityProfiles = system === "aos"
    ? allProfiles
        .filter(profile => isAosAbilityProfile(profile) && !profile.hidden)
        .map(aosAbilityProfileToRule)
    : [];

  const heresyProfileRules = system === "heresy"
    ? allProfiles
        .filter(isHeresyRuleProfile)
        .map(heresyRuleProfileToRule)
        .filter(Boolean)
    : [];

  const killTeamProfileRules = system === "kill-team"
    ? allProfiles
        .filter(isKillTeamRuleProfile)
        .map(killTeamRuleProfileToRule)
        .filter(Boolean)
    : [];

  const legionsImperialisProfileRules = system === "legions-imperialis"
    ? allProfiles
        .filter(isLegionsImperialisRuleProfile)
        .map(legionsImperialisRuleProfileToRule)
        .filter(Boolean)
    : [];

  const rules = collectRules(selection);
  const abilities = dedupeBy(
    [...standardAbilityProfiles, ...aosAbilityProfiles, ...heresyProfileRules, ...killTeamProfileRules, ...legionsImperialisProfileRules, ...rules],
    rule => normalize((rule.category || "") + "|" + rule.name + "|" + rule.text)
  );

  const directPts = (selection.costs || []).find(cost => isPointsCostName(cost.name))?.value;
  const pts = (system === "heresy" || system === "legions-imperialis")
    ? newRecruitSelectionPointTotal(selection)
    : directPts;
  if (pts != null && Number(pts) !== 0) stats.push({label:"Pts", value:String(pts)});

  const name = selection.name || primaryUnitProfile.name || "Unit";
  const categories = dedupeBy(
    [
      ...collectSelectionCategories(selection),
      ...(system === "heresy" ? heresyTypeCategories(primaryUnitProfile) : [])
    ],
    value => normalize(value)
  );

  return {
    id:selection.id || primaryUnitProfile.id || name,
    name,
    type:system === "legions-imperialis"
      ? "Detachment"
      : system === "kill-team"
        ? "Operative"
        : system === "heresy"
        ? (heresyComponents.length
            ? "Titan"
            : normalize(primaryUnitProfile.typeName) === "profile"
              ? "Unit"
              : primaryUnitProfile.typeName || "Unit")
        : "Unit",
    system,
    categories,
    stats,
    rules:abilities,
    profiles:weapons,
    heresyComponents,
    heresyModelProfiles,
    legionsImperialisProfiles,
    selectionIds:collectSelectionIds(selection),
    incomingAssociations:normalizeUnitAssociations(selection.incomingAssociations || []),
    outgoingAssociations:normalizeUnitAssociations(selection.associations || []),
    searchText:normalize([
      name,
      primaryUnitProfile.name,
      weapons.map(weapon => weapon.name),
      abilities.map(ability => ability.name),
      categories
    ].flat(3).join(" "))
  };
}

function isWeaponProfile(profile) {
  if (!profile || typeof profile !== "object") return false;

  const type = normalize(profile.typeName || "");
  if ([
    "ranged weapon",
    "ranged weapons",
    "melee weapon",
    "melee weapons",
    "weapons"
  ].includes(type)) return true;

  if (type === "weapon" || type.endsWith(" weapon")) {
    const labels = new Set(
      (profile.characteristics || []).map(item => normalize(item?.name || ""))
    );
    return labels.has("attacks") || labels.has("a") || labels.has("range");
  }

  return false;
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
        if (!isWeaponProfile(profile)) return;
        found.push({profile, quantity: Math.max(1, quantity || 1)});
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

    // BSData catalogue/game-system JSON can expose these collections either
    // directly (rules/profiles) or as sharedRules/sharedProfiles.
    for (const rule of [...(value.rules || []), ...(value.sharedRules || [])]) {
      if (!rule || rule.hidden) continue;
      addRule(rule.name, rule.description, "Rule");
    }

    for (const profile of [...(value.profiles || []), ...(value.sharedProfiles || [])]) {
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
let gdcFactionFileIndexPromise = null;

function englishText(value) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") return value.en || Object.values(value).find(item => typeof item === "string") || "";
  return "";
}

function getImportedDetachmentRequests() {
  const requests = [];

  for (const roster of state.rosters) {
    if (roster.source !== "new-recruit" || inferRosterGameSystem(roster) !== "40k") continue;

    for (const detachment of roster.detachments || []) {
      requests.push({
        name:detachment.name,
        faction:detachment.faction || roster.faction || "",
        rosterName:roster.name,
        rosterId:roster.id
      });
    }
  }

  return dedupeBy(requests, item => normalize(item.rosterId + "|" + item.faction + "|" + item.name));
}

function gdcFactionSlugCandidates(factionName = "") {
  const parts = String(factionName)
    .split(/\s+[-—–]\s+/)
    .map(part => part.trim())
    .filter(Boolean);

  const leaf = parts.at(-1) || String(factionName).trim();
  const normal = normalize(leaf);
  const compact = normal.replace(/\s+/g, "");

  const aliases = {
    "adeptus astartes":"space_marines",
    "space marines":"space_marines",
    "adeptus custodes":"adeptuscustodes",
    "adepta sororitas":"adeptasororitas",
    "sisters of battle":"adeptasororitas",
    "adeptus mechanicus":"adeptusmechanicus",
    "astra militarum":"astramilitarum",
    "imperial guard":"astramilitarum",
    "heretic astartes":"chaos_spacemarines",
    "chaos space marines":"chaos_spacemarines",
    "legiones daemonica":"chaosdaemons",
    "chaos daemons":"chaosdaemons",
    "genestealer cults":"gsc",
    "imperial agents":"agents",
    "agents of the imperium":"agents",
    "leagues of votann":"votann",
    "tau empire":"tau",
    "t au empire":"tau",
    "world eaters":"worldeaters",
    "thousand sons":"thousandsons",
    "death guard":"deathguard",
    "emperors children":"emperors_children",
    "emperor s children":"emperors_children",
    "grey knights":"greyknights",
    "imperial knights":"imperialknights",
    "chaos knights":"chaosknights",
    "black templars":"blacktemplar",
    "black templar":"blacktemplar",
    "blood angels":"bloodangels",
    "dark angels":"darkangels",
    "space wolves":"spacewolves",
    "imperial fists":"space_marines",
    "iron hands":"space_marines",
    "raven guard":"space_marines",
    "salamanders":"space_marines",
    "ultramarines":"space_marines",
    "white scars":"space_marines",
    "titanicus traitoris":"titan",
    "craftworlds":"aeldari",
    "asuryani":"aeldari",
    "aeldari":"aeldari",
    "drukhari":"drukhari",
    "necrons":"necrons",
    "orks":"orks",
    "tyranids":"tyranids",
    "adeptus titanicus":"titan"
  };

  return [...new Set([
    aliases[normal],
    compact,
    normal.replace(/\s+/g, "_"),
    normalize(String(factionName)).replace(/\s+/g, "")
  ].filter(Boolean))];
}

async function getGdcFactionFileIndex() {
  if (gdcFactionFileIndexPromise) return gdcFactionFileIndexPromise;

  gdcFactionFileIndexPromise = (async () => {
    try {
      const response = await fetch("https://api.github.com/repos/game-datacards/datasources/contents/11th/gdc?ref=main");
      if (!response.ok) return [];

      const listing = await response.json();
      return (Array.isArray(listing) ? listing : [])
        .filter(item => /\.json$/i.test(item?.name || "") && item.name !== "core.json")
        .map(item => ({
          name:item.name,
          slug:item.name.replace(/\.json$/i, ""),
          normalized:normalize(item.name.replace(/\.json$/i, ""))
        }));
    } catch (error) {
      console.warn("Could not load faction data index", error);
      return [];
    }
  })();

  return gdcFactionFileIndexPromise;
}

async function resolveGdcFactionSlugs(factionName = "") {
  const candidates = gdcFactionSlugCandidates(factionName);
  const index = await getGdcFactionFileIndex();

  const targetNames = new Set([
    normalize(factionName),
    ...String(factionName).split(/\s+[-—–]\s+/).map(part => normalize(part)),
    ...candidates.map(value => normalize(value))
  ].filter(Boolean));

  const indexedMatches = index
    .filter(item => targetNames.has(item.normalized))
    .map(item => item.slug);

  return [...new Set([...candidates, ...indexedMatches])];
}

async function fetchGdcFactionData(factionName, wantedDetachments = []) {
  const cacheKey = normalize(factionName);
  if (gdcFactionCache.has(cacheKey)) return gdcFactionCache.get(cacheKey);

  const wanted = new Set(wantedDetachments.map(name => normalize(name)).filter(Boolean));
  const slugs = await resolveGdcFactionSlugs(factionName);

  for (const slug of slugs) {
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
      console.warn("Could not load faction reference", slug, error);
    }
  }

  gdcFactionCache.set(cacheKey, null);
  return null;
}

function detachmentStratagemToReference(stratagem, request) {
  const name = cleanGdcText(stratagem.name) || "Stratagem";
  const when = cleanGdcText(stratagem.when);
  const target = cleanGdcText(stratagem.target);
  const effect = cleanGdcText(stratagem.effect);
  const restrictions = cleanGdcText(stratagem.restrictions || stratagem.restriction);

  const text = [
    when ? "WHEN: " + when : "",
    target ? "TARGET: " + target : "",
    effect ? "EFFECT: " + effect : "",
    restrictions ? "RESTRICTIONS: " + restrictions : ""
  ].filter(Boolean).join("\n");

  const cost = stratagem.cost != null ? stratagem.cost + "CP" : "";
  const type = cleanGdcText(stratagem.type) || "";
  const category = [cost, type].filter(Boolean).join(" · ");
  const phases = Array.isArray(stratagem.phase)
    ? stratagem.phase.map(value => normalize(value)).filter(Boolean)
    : [normalize(stratagem.phase)].filter(Boolean);

  return {
    name,
    text,
    category,
    phases,
    turn:normalize(stratagem.turn || ""),
    detachment:request.name,
    rosterName:request.rosterName,
    rosterId:request.rosterId || "",
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
  const importedLists = state.rosters.filter(roster =>
    roster.source === "new-recruit" && inferRosterGameSystem(roster) === "40k"
  );

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

async function getGdcFactionDataChain(factionName = "") {
  const datasets = [];
  const seen = new Set();

  let currentName = factionName;

  for (let depth = 0; depth < 3 && currentName; depth++) {
    const data = await fetchGdcFactionData(currentName, []);
    if (!data) break;

    const identity = normalize(data.id || data.name || currentName);
    if (seen.has(identity)) break;

    seen.add(identity);
    datasets.push(data);

    const parentName = String(data.parent_name || "").trim();
    if (!parentName || normalize(parentName) === normalize(currentName)) break;
    currentName = parentName;
  }

  return datasets;
}

function cleanGdcText(value) {
  return cleanRuleText(englishText(value));
}

function gdcArmyRulesToReferences(data, sourceLabel = "") {
  return (data?.rules?.army || []).map(card => {
    const name = englishText(card.name) || "Army rule";
    const text = (card.rules || [])
      .map(rule => {
        if (rule.type === "image") return "";
        const value = cleanGdcText(rule.text);
        if (!value || value === "-") return "";
        return value;
      })
      .filter(Boolean)
      .join("\n\n");

    return {
      name,
      text,
      category:"Army rule",
      source:sourceLabel || data?.name || ""
    };
  }).filter(item => item.text);
}

function gdcStratagemsToReferences(data, detachmentNames = null, sourceLabel = "") {
  const wanted = detachmentNames?.length
    ? new Set(detachmentNames.map(name => normalize(name)))
    : null;

  return (data?.stratagems || [])
    .filter(stratagem => {
      if (!wanted) return true;
      return wanted.has(normalize(englishText(stratagem.detachment || stratagem.detachment_name)));
    })
    .map(stratagem => {
      const detachment = englishText(stratagem.detachment || stratagem.detachment_name) || "Detachment";
      return detachmentStratagemToReference(stratagem, {
        name:detachment,
        rosterName:sourceLabel,
        rosterId:""
      });
    });
}

async function getUnitBrowserReferenceData(source) {
  if (!source) return {stratagems:[], armyRules:[], note:""};

  if (source.kind === "all") {
    const childSources = getUnitBrowserSources().filter(item => item.id !== "all");
    const results = await Promise.all(childSources.map(getUnitBrowserReferenceData));

    return {
      stratagems:dedupeBy(
        results.flatMap(item => item.stratagems || []),
        item => normalize((item.detachment || "") + "|" + item.name + "|" + item.text)
      ),
      armyRules:dedupeBy(
        results.flatMap(item => item.armyRules || []),
        item => normalize(item.name + "|" + item.text)
      ),
      note:""
    };
  }

  if (source.kind === "opr") {
    return {
      stratagems:[],
      armyRules:(source.roster?.armyRules || []).filter(rule => rule?.name),
      note:"OnePageRules list imported from Army Forge."
    };
  }

  if (source.kind === "gyrinx") {
    return {
      stratagems:[],
      armyRules:(source.roster?.armyRules || []).filter(rule => rule?.name),
      note:"Necromunda N26 gang imported from Gyrinx."
    };
  }

  if (source.kind === "dndbeyond") {
    return {
      stratagems:[],
      armyRules:(source.roster?.armyRules || []).filter(rule => rule?.name),
      note:"Character features imported from D&D Beyond."
    };
  }

  if (source.kind === "li-community") {
    return {
      stratagems:[],
      armyRules:(source.roster?.armyRules || []).filter(rule => rule?.name),
      note:"Legions Imperialis list imported from Legion Companion."
    };
  }

  if (source.kind === "new-recruit") {
    const roster = source.roster;
    const rosterGame = inferRosterGameSystem(roster);

    if (rosterGame === "aos") {
      return {
        stratagems:[],
        armyRules:(roster?.armyRules || []).filter(rule => rule?.name && rule?.text),
        note:"Age of Sigmar 4th edition list imported from New Recruit."
      };
    }

    if (rosterGame === "grimdark") {
      const armyRules = dedupeBy(
        [
          ...(roster?.referenceData?.rules || []),
          ...(roster?.units || []).flatMap(unit => unit.rules || [])
        ].filter(rule => rule?.name && rule?.text),
        rule => normalize(rule.name + "|" + rule.text)
      );

      return {
        stratagems:[],
        armyRules,
        note:"Grimdark Future list imported from New Recruit."
      };
    }

    if (rosterGame !== "40k") {
      return {
        stratagems:[],
        armyRules:(roster?.armyRules || []).filter(rule => rule?.name),
        note:gameSystemDisplayName(rosterGame) + " list imported from New Recruit."
      };
    }

    const localRules = (roster?.armyRules || []).filter(rule => rule?.name && rule?.text);
    const embeddedDetachmentRules = (roster?.detachmentRules || [])
      .filter(rule => rule?.name && rule?.text);

    const detachmentNames = (roster?.detachments || [])
      .flatMap(item => splitCompositeDetachmentName(item?.name || ""))
      .map(name => String(name || "").trim())
      .filter(Boolean);

    const datasets = await getGdcFactionDataChain(source.faction || roster?.faction || "");

    const externalStratagems = detachmentNames.length
      ? datasets.flatMap(data =>
          gdcStratagemsToReferences(data, detachmentNames, roster?.name || source.label)
        )
      : [];

    const foundExternalDetachments = new Set(
      externalStratagems.map(item => normalize(item.detachment || ""))
    );
    const missingExternalDetachments = detachmentNames.filter(
      name => !foundExternalDetachments.has(normalize(name))
    );

    const embeddedStratagems = (roster?.selectedDetachmentStratagems || [])
      .filter(item => item?.name && item?.text)
      .map(item => ({
        ...item,
        detachment:item.detachment || detachmentNames.join(" + ") || "Selected detachment"
      }));

    const stratagems = dedupeBy(
      [...embeddedStratagems, ...externalStratagems],
      item => normalize((item.detachment || "") + "|" + item.name + "|" + item.text)
    );

    const factionRules = localRules.length
      ? localRules
      : dedupeBy(
          datasets.flatMap(data => gdcArmyRulesToReferences(data, roster?.name || source.label)),
          item => normalize(item.name + "|" + item.text)
        );

    const armyRules = dedupeBy(
      [...factionRules, ...embeddedDetachmentRules],
      item => normalize((item.detachment || "") + "|" + item.name + "|" + item.text)
    );

    let note = "";
    if (!detachmentNames.length) {
      note = "No selected detachment was detected in this New Recruit list.";
    } else if (!datasets.length && !embeddedStratagems.length) {
      note = "No current faction reference data was found for this list.";
    } else if (missingExternalDetachments.length) {
      note = "Some selected detachments are not yet present in the current 11th-edition reference data: " +
        missingExternalDetachments.join(", ") +
        ". No older-edition stratagems will be shown.";
    } else if (!stratagems.length) {
      note = "The selected detachment was detected, but no matching current-edition stratagems were found.";
    } else if ((roster?.detachmentParserVersion || 0) < 4) {
      note = "Re-import this list once to pick up detachment rules, abilities and any embedded stratagems from the newer New Recruit export.";
    }

    return {stratagems, armyRules, note};
  }

  if (source.kind === "whole-army") {
    const datasets = await getGdcFactionDataChain(source.faction || source.label);

    return {
      stratagems:dedupeBy(
        datasets.flatMap(data => gdcStratagemsToReferences(data, null, source.label)),
        item => normalize((item.detachment || "") + "|" + item.name + "|" + item.text)
      ),
      armyRules:dedupeBy(
        datasets.flatMap(data => gdcArmyRulesToReferences(data, source.label)),
        item => normalize(item.name + "|" + item.text)
      ),
      note:datasets.length ? "" : "No current faction reference data was found for this army."
    };
  }

  return {stratagems:[], armyRules:[], note:""};
}

function getReferencePhaseTags(item) {
  const standard = ["command","movement","shooting","charge","fight"];
  const phases = (item?.phases || []).map(value => normalize(value)).filter(Boolean);
  const tags = phases.filter(value => standard.includes(value) || value === "any");

  if (tags.length) return [...new Set(tags)];

  const text = normalize(item?.text || "");
  const inferred = standard.filter(phase => text.includes(phase + " phase"));
  return inferred.length ? inferred : ["any"];
}

function renderBrowserReferenceCards(items, kind = "rule") {
  if (!items?.length) return '<div class="empty-section">None found.</div>';

  const ordered = [...items].sort((a,b) => {
    const da = normalize(a.detachment || "");
    const db = normalize(b.detachment || "");
    if (da !== db) return da.localeCompare(db);
    return String(a.name || "").localeCompare(String(b.name || ""));
  });

  let lastDetachment = "";

  return ordered.map(item => {
    const detachment = String(item.detachment || "").trim();
    const detachmentHeading =
      detachment && detachment !== lastDetachment
        ? `<div class="reference-detachment-heading">${escapeHtml(detachment)}</div>`
        : "";

    if (detachment) lastDetachment = detachment;

    const meta = item.category
      ? String(item.category)
          .split("·")
          .map(part => part.trim())
          .filter(Boolean)
          .join(" · ")
      : "";

    const phaseTags = kind === "stratagem" ? getReferencePhaseTags(item) : [];

    return `
      ${detachmentHeading}
      <details class="browser-inline-rule-details ${kind}" ${phaseTags.length ? `data-ref-phases="${escapeHtml(phaseTags.join(" "))}"` : ""}>
        <summary class="browser-inline-rule-summary">
          <span class="browser-inline-rule-title">
            <strong>${escapeHtml(item.name)}</strong>
            ${meta ? `<small>${escapeHtml(meta)}</small>` : ""}
          </span>
          <span class="browser-inline-rule-open" aria-hidden="true">＋</span>
        </summary>
        <article class="ability-card unique-rule-card browser-inline-rule ${kind}">
          ${item.text ? `<div class="ability-text unique-rule-text">${formatRuleText(item.text)}</div>` : ""}
        </article>
      </details>`;
  }).join("");
}

function renderStratagemPhaseTabs(items) {
  if (!items?.length) return "";

  const phases = [
    ["all","All"],
    ["command","Command"],
    ["movement","Movement"],
    ["shooting","Shooting"],
    ["charge","Charge"],
    ["fight","Fight"]
  ];

  return `
    <div class="strat-phase-tabs" role="tablist" aria-label="Filter stratagems by phase">
      ${phases.map(([value,label], index) => `
        <button type="button" class="${index === 0 ? "active" : ""}" data-strat-phase="${value}">
          ${label}
        </button>`).join("")}
    </div>`;
}

function renderUnitBrowserReferenceSection(title, items, kind) {
  return `
    <details class="roster-unit-group browser-reference-unit-group">
      <summary class="browser-reference-section-summary">
        <span>${escapeHtml(title)}</span>
        <strong>${items?.length || 0}</strong>
      </summary>
      <div class="browser-reference-section-body">
        ${kind === "stratagem" ? renderStratagemPhaseTabs(items) : ""}
        <div class="ability-list browser-reference-list">
          ${renderBrowserReferenceCards(items || [], kind)}
        </div>
      </div>
    </details>`;
}

function renderUnitBrowserReferences(source, data = null) {
  if (!source) return "";

  if (!data) {
    return `
      <div id="unitBrowserReferences" class="unit-browser-references">
        <div class="browser-reference-loading">Loading army references…</div>
      </div>`;
  }

  return `
    <div id="unitBrowserReferences" class="unit-browser-references">
      ${data.note ? `<div class="roster-refresh-note">${escapeHtml(data.note)}</div>` : ""}
      ${(source.kind === "opr" || inferRosterGameSystem(source.roster) !== "40k") ? "" : renderUnitBrowserReferenceSection("Stratagems", data.stratagems, "stratagem")}
      ${renderUnitBrowserReferenceSection(
        inferRosterGameSystem(source.roster) === "kill-team"
          ? "Team Rules"
          : inferRosterGameSystem(source.roster) === "legions-imperialis"
            ? "Formation Rules"
            : (source.kind === "opr" || ["grimdark","heresy"].includes(inferRosterGameSystem(source.roster)))
              ? "Rules"
              : "Army Rules",
        data.armyRules,
        "rule"
      )}
    </div>`;
}

function bindUnitBrowserReferenceControls(container) {
  if (!container) return;

  container.querySelectorAll("[data-strat-phase]").forEach(button => {
    button.addEventListener("click", () => {
      const phase = button.dataset.stratPhase || "all";

      container.querySelectorAll("[data-strat-phase]").forEach(other => {
        other.classList.toggle("active", other === button);
      });

      container.querySelectorAll(".browser-inline-rule-details.stratagem").forEach(card => {
        const tags = String(card.dataset.refPhases || "").split(/\s+/).filter(Boolean);
        const visible = phase === "all" || tags.includes(phase) || tags.includes("any");
        card.classList.toggle("phase-hidden", !visible);
      });

      container.querySelectorAll(".reference-detachment-heading").forEach(heading => {
        let next = heading.nextElementSibling;
        let hasVisible = false;

        while (next && !next.classList.contains("reference-detachment-heading")) {
          if (next.matches?.(".browser-inline-rule-details.stratagem") && !next.classList.contains("phase-hidden")) {
            hasVisible = true;
            break;
          }
          next = next.nextElementSibling;
        }

        heading.classList.toggle("phase-hidden", !hasVisible);
      });
    });
  });
}

async function refreshUnitBrowserReferences(sourceId) {
  const source = getUnitBrowserSources().find(item => item.id === sourceId);
  if (!source) return;

  const data = await getUnitBrowserReferenceData(source);
  const active = getActiveUnitBrowserSource();
  if (!active || active.id !== sourceId || state.selected) return;

  const container = document.getElementById("unitBrowserReferences");
  if (container) {
    container.outerHTML = renderUnitBrowserReferences(active, data);
    bindUnitBrowserReferenceControls(document.getElementById("unitBrowserReferences"));
  }
}

function getCombinedReferenceData() {
  const rules = [];
  const stratagems = [];
  const seenRules = new Set();
  const seenStrats = new Set();

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

function renderReferenceSourceTabs(container, kind) {
  if (!container) return;

  const sources = getUnitBrowserSources();
  const active = getActiveUnitBrowserSource();

  if (!sources.length) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = sources.map(source => `
    <button
      type="button"
      class="roster-tab${source.id === active?.id ? " active" : ""}"
      data-reference-source-id="${escapeHtml(source.id)}">
      <strong>${escapeHtml(source.label)}</strong>
      <small>${escapeHtml(source.subLabel || "")}</small>
    </button>`).join("");

  container.querySelectorAll("[data-reference-source-id]").forEach(button => {
    button.addEventListener("click", () => {
      setUnitBrowserSource(button.dataset.referenceSourceId);
    });
  });
}

async function renderSourceReferencePage(kind, query = "") {
  const isStratagem = kind === "stratagem";
  const tabs = isStratagem ? els.stratSourceTabs : els.armyRuleSourceTabs;
  const container = isStratagem ? els.stratPageContent : els.armyRulePageContent;

  renderReferenceSourceTabs(tabs, kind);
  if (!container) return;

  const source = getActiveUnitBrowserSource();

  if (!source) {
    container.innerHTML = '<div class="empty-section">Import a list or choose an army source first.</div>';
    return;
  }

  container.innerHTML = '<div class="browser-reference-loading">Loading ' +
    (isStratagem ? "stratagems" : "army rules") + '…</div>';

  const requestedSourceId = source.id;
  const data = await getUnitBrowserReferenceData(source);
  const current = getActiveUnitBrowserSource();

  if (!current || current.id !== requestedSourceId) return;

  const allItems = isStratagem ? data.stratagems : data.armyRules;
  const q = normalize(query);
  const items = q
    ? (allItems || []).filter(item =>
        normalize((item.name || "") + " " + (item.text || "") + " " + (item.detachment || "")).includes(q)
      )
    : allItems;

  container.innerHTML = `
    ${data.note ? `<div class="roster-refresh-note">${escapeHtml(data.note)}</div>` : ""}
    ${isStratagem ? renderStratagemPhaseTabs(items) : ""}
    <div class="ability-list browser-reference-list dedicated-reference-list">
      ${renderBrowserReferenceCards(items || [], isStratagem ? "stratagem" : "rule")}
    </div>`;

  bindUnitBrowserReferenceControls(container);
}

function renderStratagems(query = "") {
  return renderSourceReferencePage("stratagem", query);
}

function renderArmyRulesPage() {
  return renderSourceReferencePage("rule");
}

function renderCoreRules(query = "") {
  const data = getCombinedReferenceData();

  if (els.coreRulesImportButton) {
    els.coreRulesImportButton.textContent = state.referenceData?.rules?.length
      ? "Refresh core rules"
      : "Import core rules";
  }

  if (els.coreRulesImportStatus) {
    if (state.referenceData?.rules?.length) {
      els.coreRulesImportStatus.textContent =
        state.referenceData.rules.length + " reference entries loaded from the community dataset.";
    } else {
      els.coreRulesImportStatus.textContent =
        "No core-rule reference has been loaded yet. Imported roster files may still supply some keyword rules.";
    }
  }

  renderReferenceCards(data.rules, els.coreRuleResults, query);
}

const BSDATA_REPO = "BSData/wh40k-11e";
const BSDATA_BRANCH = "main";
const BSDATA_API = "https://api.github.com/repos/" + BSDATA_REPO + "/contents?ref=" + BSDATA_BRANCH;
const BSDATA_RAW = "https://raw.githubusercontent.com/" + BSDATA_REPO + "/refs/heads/" + BSDATA_BRANCH + "/";
const CORE_REFERENCE_STORAGE_KEY = "tv_core_reference_v1";

async function loadCoreRulesData() {
  if (!els.coreRulesImportButton) return;

  const button = els.coreRulesImportButton;
  button.disabled = true;
  button.textContent = "Importing core rules…";
  if (els.coreRulesImportStatus) {
    els.coreRulesImportStatus.textContent = "Loading current community reference data from BSData…";
  }

  try {
    const fileName = "Warhammer 40,000.json";
    const url = BSDATA_RAW + encodeURIComponent(fileName).replace(/%2F/g, "/");
    const response = await fetch(url);
    if (!response.ok) throw new Error("Could not download the core reference file.");

    const data = await response.json();
    const reference = buildReferenceData([{name:fileName, data}]);

    if (!reference.rules.length) {
      throw new Error("The reference file loaded, but no core rules could be read from it.");
    }

    state.referenceData = reference;
    localStorage.setItem(CORE_REFERENCE_STORAGE_KEY, JSON.stringify(reference));
    renderCoreRules(els.coreRuleSearch?.value || "");
    toast("Core rules imported");
  } catch (error) {
    console.error("Could not load core rules", error);
    if (els.coreRulesImportStatus) {
      els.coreRulesImportStatus.textContent =
        "Core rules were not loaded. You can retry later; no rules text is bundled with the app.";
    }
    toast(error.message || "Could not load core rules");
  } finally {
    button.disabled = false;
    button.textContent = state.referenceData?.rules?.length ? "Refresh core rules" : "Import core rules";
  }
}

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
    try {
      localStorage.setItem(CORE_REFERENCE_STORAGE_KEY, JSON.stringify(state.referenceData));
    } catch {}
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

function isPointsCostName(name = "") {
  const key = normalize(name);
  return ["pts","pt","point","points","point s"].includes(key);
}

function setVoicePrompt(page = state.currentPage) {
  if (!els.voiceHint) return;

  const prompts = {
    datasheets: isWarfleetsMode()
      ? "Say a ship or squadron name from your Warfleets fleet"
      : isKillTeamMode()
        ? "Say an operative name from your Kill Team"
        : isNecromundaMode()
          ? "Say a fighter name from your Necromunda gang"
          : isDndMode()
            ? "Say “attack longsword”, a spell name, or “add hempen rope”"
            : isLegionsImperialisMode()
          ? "Say a detachment name from your Legions Imperialis army"
          : isHeresyMode()
          ? "Say a unit name from your Horus Heresy army"
          : isOprMode()
          ? "Say a unit name from your " + currentGameName() + " list"
          : isAosMode()
        ? "Say a unit name, e.g. “Annihilators”"
        : "Say a unit name, e.g. “Death Korps of Krieg”",
    score: "T" + state.scoreTurn + ": say “Player 1 add 5 primary”",
    dice: "Say “Roll 6 dice hitting on 3”",
    strats: "Say a stratagem name",
    rules: "Say a core rule"
  };

  els.voiceHint.textContent = prompts[page] || "Hold to talk";
}

function switchPage(page, options = {}) {
  const valid = ["setup","datasheets","strats","army-rules","score","dice","rules","share","updates","settings","guide"];
  if (!valid.includes(page)) page = "setup";
  if (state.gameSystem !== "40k" && ["strats","score","rules"].includes(page)) page = "setup";
  if (page !== "share" && state.shareScanner) stopShareScanner();

  state.currentPage = page;
  localStorage.setItem("tv_page", page);

  document.querySelectorAll(".app-page").forEach(section => {
    section.classList.toggle("hidden", section.dataset.page !== page);
  });

  document.querySelectorAll("[data-page-target]").forEach(button => {
    button.classList.toggle("active", button.dataset.pageTarget === page);
  });
  els.navMoreButton?.classList.toggle("active", ["rules","share","updates","settings","guide"].includes(page));

  els.navMoreMenu?.classList.add("hidden");
  els.navMoreButton?.setAttribute("aria-expanded", "false");

  if (page === "strats") renderSourceReferencePage("stratagem");
  if (page === "army-rules") renderSourceReferencePage("rule");
  if (page === "rules") renderCoreRules(els.coreRuleSearch?.value || "");
  if (page === "share") renderSharePage();
  if (page === "setup") renderDataSummary();
  if (page === "settings") applyGameSystemUi();
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
  const importedLists = state.rosters.filter(roster =>
    isImportedRosterSource(roster) &&
    rosterMatchesSelectedGame(roster)
  );
  const hasFullData = state.gameSystem === "40k" && state.rosters.some(roster => roster.source === "bsdata");

  els.fullDataArmySection?.classList.toggle("hidden", !hasFullData);

  if (els.fullDataButton) {
    els.fullDataButton.textContent = hasFullData ? "Refresh all armies" : "Import all armies";
  }

  if (!els.dataRosterSummary) return;

  if (!importedLists.length) {
    els.dataRosterSummary.innerHTML = '<p class="muted-copy">No imported lists loaded yet.</p>';
    return;
  }

  els.dataRosterSummary.innerHTML = importedLists.map(roster => `
    <div class="data-summary-row removable-roster-row">
      <div>
        <strong>${escapeHtml(roster.name)}</strong>
        <small>${escapeHtml(rosterSourceSummary(roster))} · ${roster.units?.length || 0} ${escapeHtml(importedRosterUnitNoun())}${
          roster.source === "gyrinx" && roster.necromunda?.rating != null
            ? " · Rating " + escapeHtml(roster.necromunda.rating)
            : roster.points != null
              ? " · " + escapeHtml(roster.points) + " pts"
              : ""
        }</small>
      </div>
      <button
        class="remove-roster-button"
        type="button"
        data-remove-roster-id="${escapeHtml(roster.id)}"
        aria-label="Remove ${escapeHtml(roster.name)}"
        title="Remove this imported list">×</button>
    </div>`).join("");

  els.dataRosterSummary.querySelectorAll("[data-remove-roster-id]").forEach(button => {
    button.addEventListener("click", () => removeImportedRoster(button.dataset.removeRosterId));
  });
}

function removeImportedRoster(rosterId) {
  const index = state.rosters.findIndex(roster =>
    roster.id === rosterId && isImportedRosterSource(roster)
  );
  if (index < 0) return;

  const removed = state.rosters[index];
  state.rosters.splice(index, 1);

  // Clear CP and roster-specific UI state for the removed list.
  localStorage.removeItem(sourceCpStorageKey("roster:" + rosterId));
  for (const key of Object.keys(localStorage)) {
    if (
      key.includes(rosterId) &&
      (key.startsWith("tv_status_") || key.startsWith("tv_pins_") || key.startsWith("tv_recent_") || key.startsWith("tv_voice_alias") || key.startsWith("tv_dnd_state_"))
    ) {
      localStorage.removeItem(key);
    }
  }

  state.activeRoster = Math.min(state.activeRoster, Math.max(0, state.rosters.length - 1));
  state.selected = null;
  state.selectedRosterId = null;
  state.detachmentStratagemLoadKey = "";

  if (state.unitBrowserSourceId === "roster:" + rosterId) {
    state.unitBrowserSourceId = "all";
    localStorage.setItem("tv_unit_browser_source", "all");
  }

  persist();
  renderAll();
  renderMatchTools();
  toast("Removed " + removed.name);
}


function renderAll() {
  showApp();
  updateGameContextUi();
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

  renderCoreRules(els.coreRuleSearch?.value || "");
  renderMatchTools();
}

function getAvailableSearchScopes() {
  const scopes = [];
  if (state.gameSystem && state.gameSystem !== "40k") return scopes;

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
    if (["new-recruit","opr","dndbeyond"].includes(roster.source) && rosterMatchesSelectedGame(roster)) {
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

function isImportedRosterSource(roster) {
  return ["new-recruit","opr","li-community","gyrinx","dndbeyond"].includes(roster?.source);
}

function importedRosterUnitNoun() {
  if (isWarfleetsMode()) return "ships/squadrons";
  if (isKillTeamMode()) return "operatives";
  if (isNecromundaMode()) return "fighters";
  if (isLegionsImperialisMode()) return "detachments";
  if (isDndMode()) return "characters";
  return "units";
}

function getImportedRosterEntries() {
  return state.rosters
    .map((roster, index) => ({roster, index}))
    .filter(item =>
      isImportedRosterSource(item.roster) &&
      rosterMatchesSelectedGame(item.roster)
    );
}

function getUnitBrowserSources() {
  const sources = [];

  for (const {roster, index} of getImportedRosterEntries()) {
    const kind = roster.source === "opr"
      ? "opr"
      : roster.source === "gyrinx"
        ? "gyrinx"
        : roster.source === "li-community"
          ? "li-community"
          : roster.source === "dndbeyond"
            ? "dndbeyond"
            : "new-recruit";

    const necromundaRating = roster.source === "gyrinx" && roster.necromunda?.rating != null
      ? "Rating " + roster.necromunda.rating + " · "
      : "";
    const necromundaCampaign = roster.source === "gyrinx" && roster.necromunda?.campaign?.name
      ? roster.necromunda.campaign.name + " · "
      : "";

    sources.push({
      id:"roster:" + roster.id,
      label:roster.name,
      subLabel:necromundaRating + necromundaCampaign +
        (roster.points != null ? roster.points + " pts · " : "") +
        rosterSourceSummary(roster),
      kind,
      roster,
      faction:roster.faction || "",
      detachments:roster.detachments || [],
      entries:(roster.units || []).map(unit => ({
        unit,
        rosterIndex:index,
        sourceLabel:roster.name,
        sourceKind:kind
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
      faction:scope.label,
      scope,
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

  // Prefer imported-list versions where an entry also exists in a whole-army source.
  const sourceRank = source =>
    ["new-recruit","opr","gyrinx","li-community","dndbeyond"].includes(source.kind) ? 0 : 1;
  for (const source of [...sources].sort((a,b) => sourceRank(a) - sourceRank(b))) {
    for (const entry of source.entries) {
      const key = entry.unit.system === "warfleet"
        ? source.id + "|" + entry.unit.id
        : normalize(entry.unit.name);
      if (seen.has(key)) continue;
      seen.add(key);
      allEntries.push(entry);
    }
  }

  return [{
    id:"all",
    label:"All data",
    subLabel:allEntries.length + " " + importedRosterUnitNoun(),
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

  if ((source.kind === "new-recruit" || source.kind === "opr") && source.entries[0]) {
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
  renderMatchTools();

  if (state.currentPage === "strats") renderSourceReferencePage("stratagem");
  if (state.currentPage === "army-rules") renderSourceReferencePage("rule");

  persist();
}

function getUnitBrowserGroup(unit) {
  const categoryList = (unit.categories || []).map(category => normalize(category));
  const categories = new Set(categoryList);
  const hasPrefix = prefix => categoryList.some(category => category === prefix || category.startsWith(prefix + " "));

  if (unit?.system === "warfleet") {
    if (categories.has("squadron")) return "Squadrons";
    if (categories.has("heavy")) return "Heavy Ships";
    if (categories.has("medium")) return "Medium Ships";
    if (categories.has("light")) return "Light Ships";
    return "Ships";
  }

  if (unit?.system === "kill-team") {
    if (categories.has("leader")) return "Leaders";
    return "Operatives";
  }

  if (unit?.system === "necromunda") {
    if (categories.has("leader")) return "Leaders";
    if (categories.has("champion")) return "Champions";
    if (categories.has("juve") || categories.has("prospect")) return "Juves & Prospects";
    if (categories.has("ganger")) return "Gangers";
    if (categories.has("brute")) return "Brutes";
    if (categories.has("hanger on")) return "Hangers-on";
    if (categories.has("vehicle")) return "Vehicles";
    if (categories.has("pet")) return "Pets";
    return "Fighters";
  }

  if (unit?.system === "legions-imperialis") {
    if (categories.has("hq")) return "HQ";
    if (categories.has("core")) return "Core";
    if (categories.has("support")) return "Support";
    if (categories.has("vanguard")) return "Vanguard";
    if (categories.has("light armour")) return "Light Armour";
    if (categories.has("battle tank")) return "Battle Tank";
    if (categories.has("heavy armour")) return "Heavy Armour";
    if (categories.has("artillery")) return "Artillery";
    if (categories.has("bastion")) return "Bastion";
    if (categories.has("transport")) return "Transport";
    if (categories.has("air support")) return "Air Support";
    if (categories.has("knight") || hasPrefix("knight")) return "Knights";
    if (categories.has("titan") || hasPrefix("titan")) return "Titans";
    return "Other Detachments";
  }

  if (unit?.system === "heresy") {
    if (categories.has("high command") || hasPrefix("prime high command")) return "High Command";
    if (categories.has("command") || hasPrefix("prime command")) return "Command";
    if (categories.has("retinue") || hasPrefix("prime retinue")) return "Retinue";
    if (categories.has("troops") || categories.has("prime troops")) return "Troops";
    if (categories.has("elites") || categories.has("prime elites")) return "Elites";
    if (categories.has("recon") || categories.has("prime recon")) return "Recon";
    if (categories.has("fast attack") || categories.has("prime fast attack")) return "Fast Attack";
    if (categories.has("support") || categories.has("prime support")) return "Support";
    if (categories.has("heavy assault") || categories.has("prime heavy assault")) return "Heavy Assault";
    if (categories.has("armour") || categories.has("prime armour")) return "Armour";
    if (categories.has("war engine") || categories.has("war-engine") || categories.has("prime war engine") || categories.has("prime war-engine")) return "War Engines";
    if (categories.has("transport") || categories.has("heavy transport") || categories.has("prime heavy transport")) return "Transports";
    if (categories.has("lord of war") || categories.has("prime lord of war") || categories.has("warlord or lord of war")) return "Lords of War";
    return "Other units";
  }

  if (categories.has("character") || categories.has("epic hero") || categories.has("hero") || categories.has("heroes")) return "Characters";
  if (categories.has("battleline")) return "Battleline";
  if (categories.has("dedicated transport")) return "Transports";
  if (
    categories.has("vehicle") ||
    hasPrefix("vehicles") ||
    categories.has("war machine") ||
    categories.has("warmachine")
  ) return "Vehicles";
  if (categories.has("monster") || hasPrefix("monster")) return "Monsters";
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

function getLinkedRosterForUnit(unit) {
  if (!unit) return null;

  if (state.selectedRosterId) {
    const exact = state.rosters.find(roster =>
      roster.source === "new-recruit" &&
      roster.id === state.selectedRosterId &&
      (roster.units || []).some(item => item.id === unit.id)
    );
    if (exact) return exact;
  }

  return state.rosters.find(roster =>
    roster.source === "new-recruit" &&
    (roster.units || []).some(item => item.id === unit.id)
  ) || null;
}

function getLinkedUnits(unit) {
  if (!unit?.linkedUnitIds?.length) return [];

  const roster = getLinkedRosterForUnit(unit);
  if (!roster) return [];

  const byId = new Map((roster.units || []).map(item => [item.id, item]));
  return unit.linkedUnitIds.map(id => byId.get(id)).filter(Boolean);
}

function updateLinkedUnitButton(unit = state.selected) {
  if (!els.linkedUnitButton) return;

  const linked = getLinkedUnits(unit);
  if (linked.length < 2) {
    els.linkedUnitButton.classList.add("hidden");
    els.linkedUnitButton.textContent = "Attached";
    els.linkedUnitButton.removeAttribute("title");
    return;
  }

  const currentIndex = Math.max(0, linked.findIndex(item => item.id === unit.id));
  const next = linked[(currentIndex + 1) % linked.length];

  els.linkedUnitButton.classList.remove("hidden");
  els.linkedUnitButton.textContent = "Attached " + (currentIndex + 1) + "/" + linked.length;
  els.linkedUnitButton.title = "Next model/unit in this attached group: " + next.name;
}

function cycleLinkedUnit() {
  const linked = getLinkedUnits(state.selected);
  if (linked.length < 2) return;

  const currentIndex = linked.findIndex(item => item.id === state.selected?.id);
  const next = linked[(currentIndex + 1 + linked.length) % linked.length];

  selectUnit(next);
  updateLinkedUnitButton(next);
  requestAnimationFrame(() => window.scrollTo({top:0, behavior:"auto"}));
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
    state.selectedRosterId = state.rosters[rosterIndex]?.id || null;
  }

  switchPage("datasheets", {silent:true});
  enterDatasheetHistory();
  selectUnit(unit);
  renderActiveArmySelector();
  renderTabs();

  const roster = state.rosters[state.activeRoster];
  if (roster && els.rosterTitle) els.rosterTitle.textContent = roster.name;
  persist();
  requestAnimationFrame(() => window.scrollTo({top:0, behavior:"auto"}));
}

function findTextUnitReference(unit) {
  if (!unit || unit.importFormat !== "txt") return null;

  const roster =
    state.rosters.find(item => item.id === state.selectedRosterId) ||
    state.rosters[state.activeRoster];

  const faction = normalize(roster?.faction || "");
  const exact = [];

  for (const scope of getAvailableSearchScopes()) {
    for (const candidate of scope.units || []) {
      if (normalize(candidate.name) !== normalize(unit.name)) continue;

      const scopeName = normalize(scope.label || "");
      const factionBonus =
        faction && scopeName && (faction.includes(scopeName) || scopeName.includes(faction))
          ? 1
          : 0;

      exact.push({candidate, factionBonus});
    }
  }

  exact.sort((a,b) => b.factionBonus - a.factionBonus);
  return exact[0]?.candidate || null;
}

function mergeTextUnitReference(unit) {
  const reference = findTextUnitReference(unit);
  if (!reference) return unit;

  const importedPoints = (unit.stats || []).find(stat => normalize(stat.label) === "pts");
  const stats = (reference.stats || []).filter(stat => normalize(stat.label) !== "pts");
  if (importedPoints) stats.push(importedPoints);

  return {
    ...reference,
    id:unit.id,
    name:unit.name,
    categories:(reference.categories || []).length ? reference.categories : unit.categories,
    stats,
    textLoadout:unit.textLoadout || [],
    importFormat:"txt",
    limitedData:false,
    hydratedFromAllArmies:true
  };
}

function renderTextLoadoutSection(unit) {
  if (!unit?.textLoadout?.length) return "";

  return `
    <section class="detail-section text-loadout-section">
      <div class="section-heading-row">
        <h3>Imported loadout</h3>
        <span class="section-count">${unit.textLoadout.length}</span>
      </div>
      <div class="text-loadout-list">
        ${unit.textLoadout.map(item => `<div>${escapeHtml(item)}</div>`).join("")}
      </div>
    </section>`;
}

function getDisplayUnitKeywords(unit) {
  const unitName = normalize(unit?.name || "");

  return dedupeBy(
    (unit?.categories || [])
      .map(value => String(value || "").trim())
      .filter(Boolean)
      .filter(value => {
        const key = normalize(value);
        if (!key || key === unitName) return false;
        if (["unit","uncategorized","configuration","reference","illegal units"].includes(key)) return false;
        if (/^allies:/.test(key)) return false;
        return true;
      }),
    value => normalize(value)
  );
}

function renderUnitKeywordsSection(unit) {
  const keywords = getDisplayUnitKeywords(unit);
  if (!keywords.length) return "";

  const heading = unit?.system === "necromunda"
    ? "Fighter type"
    : unit?.system === "warfleet"
      ? "Ship type"
      : unit?.system === "legions-imperialis"
        ? "Detachment type"
        : "Unit keywords";

  return `
    <section class="detail-section unit-keywords-section">
      <div class="section-heading-row">
        <h3>${escapeHtml(heading)}</h3>
        <span class="section-count">${keywords.length}</span>
      </div>
      <div class="unit-keyword-chips">
        ${keywords.map(keyword => `<span>${escapeHtml(keyword)}</span>`).join("")}
      </div>
    </section>`;
}


function dndRosterForUnit(unit = state.selected) {
  if (!unit) return null;
  return state.rosters.find(roster =>
    roster.source === "dndbeyond" &&
    (roster.id === state.selectedRosterId || (roster.units || []).some(candidate => candidate.id === unit.id))
  ) || null;
}

function dndRuntimeKey(unit = state.selected) {
  const roster = dndRosterForUnit(unit);
  return roster ? "tv_dnd_state_" + roster.id : "";
}

function getDndRuntimeState(unit = state.selected) {
  const key = dndRuntimeKey(unit);
  let saved = {};
  try { saved = key ? JSON.parse(localStorage.getItem(key) || "{}") : {}; } catch {}
  return {
    economy:{
      action:Boolean(saved?.economy?.action),
      bonus:Boolean(saved?.economy?.bonus),
      reaction:Boolean(saved?.economy?.reaction)
    },
    slots:dndIsRecord(saved?.slots) ? {...saved.slots} : {},
    inventoryDeltas:dndIsRecord(saved?.inventoryDeltas) ? {...saved.inventoryDeltas} : {},
    lastRoll:dndIsRecord(saved?.lastRoll) ? saved.lastRoll : null
  };
}

function saveDndRuntimeState(unit, runtime) {
  const key = dndRuntimeKey(unit);
  if (key) localStorage.setItem(key, JSON.stringify(runtime));
}

function dndSlotUsed(unit, runtime, slot) {
  const saved = dndNumber(runtime?.slots?.[String(slot.level)], null);
  return saved != null ? Math.max(0, saved) : Math.max(0, Number(slot.used || 0));
}

function dndRemainingSlots(unit, runtime, slot) {
  return Math.max(0, Number(slot.max || 0) - dndSlotUsed(unit, runtime, slot));
}

function dndMergedInventory(unit, runtime = getDndRuntimeState(unit)) {
  const rows = new Map();
  for (const item of unit?.dnd?.inventory || []) {
    const key = normalize(item.name);
    if (!key) continue;
    const delta = dndNumber(runtime.inventoryDeltas?.[key]?.delta, 0) || 0;
    rows.set(key, {
      key,
      name:item.name,
      type:item.type || "",
      equipped:Boolean(item.equipped),
      imported:true,
      quantity:Math.max(0, Number(item.quantity || 0) + delta)
    });
  }
  for (const [key, change] of Object.entries(runtime.inventoryDeltas || {})) {
    if (rows.has(key)) continue;
    const quantity = Math.max(0, dndNumber(change?.delta, 0) || 0);
    if (!quantity) continue;
    rows.set(key, {
      key,
      name:String(change?.name || key),
      type:"Added in Tabletop Voice",
      equipped:false,
      imported:false,
      quantity
    });
  }
  return [...rows.values()].filter(item => item.quantity > 0).sort((a,b) => a.name.localeCompare(b.name));
}

function adjustDndInventory(unit, rawName, delta) {
  const name = String(rawName || "").trim();
  const key = normalize(name);
  if (!unit || !key || !delta) return false;
  const runtime = getDndRuntimeState(unit);
  const current = dndMergedInventory(unit, runtime).find(item => item.key === key);
  const imported = (unit.dnd?.inventory || []).find(item => normalize(item.name) === key);
  const base = Number(imported?.quantity || 0);
  const existingDelta = dndNumber(runtime.inventoryDeltas?.[key]?.delta, 0) || 0;
  const nextTotal = Math.max(0, base + existingDelta + delta);
  const nextDelta = nextTotal - base;
  runtime.inventoryDeltas[key] = {name:current?.name || imported?.name || name, delta:nextDelta};
  if (!nextDelta && imported) delete runtime.inventoryDeltas[key];
  if (!nextTotal && !imported) delete runtime.inventoryDeltas[key];
  saveDndRuntimeState(unit, runtime);
  return true;
}

function dndActionEconomyKey(action) {
  const activation = normalize(action?.activation || "");
  if (activation.includes("bonus")) return "bonus";
  if (activation.includes("reaction")) return "reaction";
  if (activation === "action" || activation.includes(" action")) return "action";
  return "";
}

function dndRollDie(sides) {
  const size = Math.max(2, Math.floor(Number(sides) || 6));
  if (window.crypto?.getRandomValues) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return (array[0] % size) + 1;
  }
  return Math.floor(Math.random() * size) + 1;
}

function dndRollExpression(expression) {
  const match = String(expression || "").replace(/\s+/g, "").match(/^(\d+)d(\d+)([+-]\d+)?$/i);
  if (!match) return null;
  const count = Math.min(100, Math.max(1, Number(match[1])));
  const sides = Math.max(2, Number(match[2]));
  const bonus = Number(match[3] || 0);
  const rolls = Array.from({length:count}, () => dndRollDie(sides));
  return {rolls, bonus, total:rolls.reduce((sum, value) => sum + value, 0) + bonus, expression:String(expression)};
}


function renderDndAbilityScores(unit) {
  const scores = unit?.dnd?.scores || {};
  return `
    <section class="detail-section dnd-ability-section">
      <div class="section-heading-row"><h3>Ability scores</h3></div>
      <div class="dnd-ability-grid">
        ${Object.entries(DND_ABILITY_LABELS).map(([key,label]) => `
          <div class="dnd-ability">
            <span>${label}</span>
            <strong>${escapeHtml(scores[key] ?? "—")}</strong>
            <small>${escapeHtml(dndSigned(dndModifier(scores[key] ?? 10)))}</small>
          </div>`).join("")}
      </div>
    </section>`;
}

function renderDndActionEconomy(unit) {
  const runtime = getDndRuntimeState(unit);
  const rows = [["action","Action"],["bonus","Bonus Action"],["reaction","Reaction"]];
  return `
    <section class="detail-section dnd-economy-section">
      <div class="section-heading-row">
        <h3>Action economy</h3>
        <button class="ghost-button compact" type="button" data-dnd-reset-turn>New turn</button>
      </div>
      <div class="dnd-economy-grid">
        ${rows.map(([key,label]) => `
          <button class="dnd-economy-button${runtime.economy[key] ? " used" : ""}"
            type="button" data-dnd-economy="${key}" aria-pressed="${runtime.economy[key] ? "true" : "false"}">
            <span>${escapeHtml(label)}</span>
            <strong>${runtime.economy[key] ? "USED" : "READY"}</strong>
          </button>`).join("")}
      </div>
    </section>`;
}

function renderDndSpellSlots(unit) {
  const slots = unit?.dnd?.spellSlots || [];
  if (!slots.length) return "";
  const runtime = getDndRuntimeState(unit);
  return `
    <section class="detail-section dnd-slot-section">
      <div class="section-heading-row"><h3>Spell slots</h3></div>
      <div class="dnd-slot-grid">
        ${slots.map(slot => {
          const used = dndSlotUsed(unit, runtime, slot);
          const remaining = Math.max(0, Number(slot.max || 0) - used);
          return `
            <div class="dnd-slot-card">
              <span>Level ${slot.level}</span>
              <strong>${remaining}/${slot.max}</strong>
              <div>
                <button type="button" data-dnd-slot-use="${slot.level}" aria-label="Use level ${slot.level} spell slot">−</button>
                <button type="button" data-dnd-slot-restore="${slot.level}" aria-label="Restore level ${slot.level} spell slot">+</button>
              </div>
            </div>`;
        }).join("")}
      </div>
    </section>`;
}

function dndActionMeta(action) {
  const items = [];
  if (action.activation) items.push(action.activation);
  if (action.kind === "spell") items.push(action.level ? "Level " + action.level : "Cantrip");
  if (action.range) items.push(action.range);
  if (action.toHit != null) items.push(dndSigned(action.toHit) + " to hit");
  if (action.saveDc != null) {
    items.push("DC " + action.saveDc + (action.saveAbility ? " " + String(action.saveAbility).toUpperCase() : "") + " save");
  }
  if (action.damage) items.push(action.damage + (action.damageType ? " " + action.damageType : ""));
  if (action.concentration) items.push("Concentration");
  if (action.ritual) items.push("Ritual");
  if (action.components) items.push(action.components);
  return items;
}

function renderDndActionCard(action, runtime, focused = false) {
  const last = runtime.lastRoll?.actionId === action.id ? runtime.lastRoll : null;
  const actionLabel = action.kind === "spell"
    ? action.level > 0 ? "SPELL · LEVEL " + action.level : "CANTRIP"
    : "ATTACK";
  const buttonLabel = action.kind === "spell"
    ? (action.toHit != null || action.damage ? "Cast / roll" : "Cast")
    : "Roll attack";
  return `
    <article class="dnd-action-card${focused ? " focused" : ""}" data-dnd-action-card="${escapeHtml(action.id)}">
      <div class="dnd-action-heading">
        <div><span>${escapeHtml(actionLabel)}</span><h4>${escapeHtml(action.name)}</h4></div>
        <button class="primary-button compact" type="button" data-dnd-use-action="${escapeHtml(action.id)}">${escapeHtml(buttonLabel)}</button>
      </div>
      <div class="dnd-action-meta">${dndActionMeta(action).map(item => `<span>${escapeHtml(item)}</span>`).join("")}</div>
      ${action.description ? `<div class="dnd-action-description">${escapeHtml(action.description)}</div>` : ""}
      ${action.derived ? `<small class="dnd-derived-note">Attack values derived from the imported equipped weapon.</small>` : ""}
      ${last ? `<div class="dnd-roll-result"><strong>${escapeHtml(last.summary || "")}</strong>${last.detail ? `<small>${escapeHtml(last.detail)}</small>` : ""}</div>` : ""}
    </article>`;
}

function renderDndActions(unit) {
  const attacks = unit?.dnd?.attacks || [];
  const spells = unit?.dnd?.spells || [];
  const runtime = getDndRuntimeState(unit);
  const focused = state.dndFocusedActionId;
  const sortFocused = list => [...list].sort((a,b) => {
    if (a.id === focused) return -1;
    if (b.id === focused) return 1;
    if ((a.level ?? 0) !== (b.level ?? 0)) return (a.level ?? 0) - (b.level ?? 0);
    return a.name.localeCompare(b.name);
  });
  return `
    ${attacks.length ? `<section class="detail-section dnd-actions-section">
      <div class="section-heading-row"><h3>Attacks</h3><span class="section-count">${attacks.length}</span></div>
      <div class="dnd-action-list">${sortFocused(attacks).map(action => renderDndActionCard(action, runtime, action.id === focused)).join("")}</div>
    </section>` : ""}
    ${spells.length ? `<section class="detail-section dnd-actions-section">
      <div class="section-heading-row"><h3>Spells</h3><span class="section-count">${spells.length}</span></div>
      <div class="dnd-action-list">${sortFocused(spells).map(action => renderDndActionCard(action, runtime, action.id === focused)).join("")}</div>
    </section>` : ""}`;
}

function renderDndInventory(unit) {
  const runtime = getDndRuntimeState(unit);
  const items = dndMergedInventory(unit, runtime);
  return `
    <section class="detail-section dnd-inventory-section">
      <div class="section-heading-row"><h3>Inventory</h3><span class="section-count">${items.length}</span></div>
      <div class="dnd-inventory-add">
        <input type="text" data-dnd-inventory-input autocomplete="off" placeholder="Add item, e.g. Hempen Rope">
        <button class="ghost-button compact" type="button" data-dnd-inventory-add>Add item</button>
      </div>
      <div class="dnd-inventory-list">
        ${items.length ? items.map(item => `
          <div class="dnd-inventory-row">
            <div><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.type || (item.equipped ? "Equipped" : "Item"))}${item.equipped ? " · Equipped" : ""}</small></div>
            <div class="dnd-inventory-quantity">
              <button type="button" data-dnd-inventory-minus="${escapeHtml(item.key)}" aria-label="Remove one ${escapeHtml(item.name)}">−</button>
              <strong>${item.quantity}</strong>
              <button type="button" data-dnd-inventory-plus="${escapeHtml(item.key)}" aria-label="Add one ${escapeHtml(item.name)}">+</button>
            </div>
          </div>`).join("") : '<div class="empty-section">No carried items.</div>'}
      </div>
    </section>`;
}

function renderDndCharacterSections(unit) {
  return [
    renderDndActionEconomy(unit),
    renderDndAbilityScores(unit),
    renderDndSpellSlots(unit),
    renderDndActions(unit),
    renderDndInventory(unit),
    renderUnitKeywordsSection(unit)
  ].filter(Boolean).join("");
}

function dndFindAction(unit, actionId) {
  return [...(unit?.dnd?.attacks || []), ...(unit?.dnd?.spells || [])]
    .find(action => String(action.id) === String(actionId)) || null;
}

function dndUseAction(unit, actionId) {
  const action = dndFindAction(unit, actionId);
  if (!action) return;
  const runtime = getDndRuntimeState(unit);

  if (action.kind === "spell" && action.level > 0 && action.usesSpellSlot !== false) {
    const eligible = (unit.dnd?.spellSlots || [])
      .filter(slot => slot.level >= action.level && dndRemainingSlots(unit, runtime, slot) > 0)
      .sort((a,b) => a.level - b.level);
    const slot = eligible[0];
    if (!slot) {
      toast("No level " + action.level + "+ spell slot is available.");
      return;
    }
    runtime.slots[String(slot.level)] = dndSlotUsed(unit, runtime, slot) + 1;
  }

  const economyKey = dndActionEconomyKey(action);
  if (economyKey) runtime.economy[economyKey] = true;

  let summary = action.kind === "spell" ? "Cast " + action.name : action.name;
  const details = [];
  if (action.toHit != null) {
    const d20 = dndRollDie(20);
    const total = d20 + Number(action.toHit || 0);
    summary = "Attack roll " + total;
    details.push("d20 " + d20 + " " + dndSigned(action.toHit));
  } else if (action.saveDc != null) {
    summary = "DC " + action.saveDc + (action.saveAbility ? " " + String(action.saveAbility).toUpperCase() : "") + " save";
  }
  if (action.damage) {
    const damage = dndRollExpression(action.damage);
    if (damage) {
      details.push("Damage " + damage.total + " (" + damage.rolls.join("+") +
        (damage.bonus ? (damage.bonus > 0 ? "+" : "") + damage.bonus : "") + ")" +
        (action.damageType ? " " + action.damageType : ""));
    }
  }
  runtime.lastRoll = {actionId:action.id, summary, detail:details.join(" · "), at:Date.now()};
  saveDndRuntimeState(unit, runtime);
  state.dndFocusedActionId = action.id;
  renderDetail(unit);
}

function bindDndDetailControls(unit = state.selected) {
  if (!unit || unit.system !== "dnd" || !els.detailSections) return;

  els.detailSections.querySelectorAll("[data-dnd-economy]").forEach(button => {
    button.addEventListener("click", () => {
      const runtime = getDndRuntimeState(unit);
      const key = button.dataset.dndEconomy;
      runtime.economy[key] = !runtime.economy[key];
      saveDndRuntimeState(unit, runtime);
      renderDetail(unit);
    });
  });

  els.detailSections.querySelector("[data-dnd-reset-turn]")?.addEventListener("click", () => {
    const runtime = getDndRuntimeState(unit);
    runtime.economy = {action:false, bonus:false, reaction:false};
    saveDndRuntimeState(unit, runtime);
    renderDetail(unit);
    toast("New turn — action economy reset");
  });

  els.detailSections.querySelectorAll("[data-dnd-slot-use]").forEach(button => {
    button.addEventListener("click", () => {
      const level = Number(button.dataset.dndSlotUse);
      const slot = (unit.dnd?.spellSlots || []).find(item => item.level === level);
      if (!slot) return;
      const runtime = getDndRuntimeState(unit);
      const used = dndSlotUsed(unit, runtime, slot);
      if (used >= slot.max) return toast("No level " + level + " slots remaining.");
      runtime.slots[String(level)] = used + 1;
      saveDndRuntimeState(unit, runtime);
      renderDetail(unit);
    });
  });

  els.detailSections.querySelectorAll("[data-dnd-slot-restore]").forEach(button => {
    button.addEventListener("click", () => {
      const level = Number(button.dataset.dndSlotRestore);
      const slot = (unit.dnd?.spellSlots || []).find(item => item.level === level);
      if (!slot) return;
      const runtime = getDndRuntimeState(unit);
      runtime.slots[String(level)] = Math.max(0, dndSlotUsed(unit, runtime, slot) - 1);
      saveDndRuntimeState(unit, runtime);
      renderDetail(unit);
    });
  });

  els.detailSections.querySelectorAll("[data-dnd-use-action]").forEach(button => {
    button.addEventListener("click", () => dndUseAction(unit, button.dataset.dndUseAction));
  });

  const addItem = () => {
    const input = els.detailSections.querySelector("[data-dnd-inventory-input]");
    const name = input?.value?.trim();
    if (!name) return;
    adjustDndInventory(unit, name, 1);
    renderDetail(unit);
    toast("Added " + name);
  };
  els.detailSections.querySelector("[data-dnd-inventory-add]")?.addEventListener("click", addItem);
  els.detailSections.querySelector("[data-dnd-inventory-input]")?.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      addItem();
    }
  });

  els.detailSections.querySelectorAll("[data-dnd-inventory-plus]").forEach(button => {
    button.addEventListener("click", () => {
      const item = dndMergedInventory(unit).find(row => row.key === button.dataset.dndInventoryPlus);
      if (!item) return;
      adjustDndInventory(unit, item.name, 1);
      renderDetail(unit);
    });
  });
  els.detailSections.querySelectorAll("[data-dnd-inventory-minus]").forEach(button => {
    button.addEventListener("click", () => {
      const item = dndMergedInventory(unit).find(row => row.key === button.dataset.dndInventoryMinus);
      if (!item) return;
      adjustDndInventory(unit, item.name, -1);
      renderDetail(unit);
    });
  });

  if (state.dndFocusedActionId) {
    requestAnimationFrame(() => {
      const card = [...els.detailSections.querySelectorAll("[data-dnd-action-card]")]
        .find(item => item.dataset.dndActionCard === state.dndFocusedActionId);
      card?.scrollIntoView({block:"center", behavior:"smooth"});
    });
  }
}

function renderDetail(unit) {
  updateGameContextUi(unit);

  if (!unit) {
    els.emptyDetail?.classList.add("hidden");
    els.detailCard?.classList.add("hidden");
    return;
  }

  const sourceUnit = unit;
  unit = mergeTextUnitReference(unit);

  els.emptyDetail.classList.add("hidden");
  els.detailCard.classList.remove("hidden");
  els.detailType.textContent = (unit.type || "Unit").toUpperCase();
  els.detailName.textContent = unit.name;
  els.backToRosterButton?.classList.toggle("hidden", getUnitBrowserSources().length === 0);
  updateUnitTopStatuses(sourceUnit);
  updateLinkedUnitButton(sourceUnit);
  updatePinButton();

  const necromundaVehicle = unit.system === "necromunda" &&
    (unit.categories || []).some(category => normalize(category) === "vehicle");

  const statOrder = unit.system === "dnd"
    ? ["hp","ac","speed","init","pb","level"]
    : unit.system === "necromunda"
    ? necromundaVehicle
      ? ["m","fr","front toughness","sd","side toughness","rr","rear toughness","hp","hit points","hnd","handling","cl"]
      : ["m","ws","bs","s","t","w","i","a","ld","cl","wil","int"]
    : unit.system === "legions-imperialis"
      ? ["move","sv","caf","morale","w"]
      : unit.system === "kill-team"
      ? ["apl","move","save","wounds"]
      : unit.system === "heresy"
      ? [
          "m","ws","bs","s","t","w","i","a","ld","cl","wp","in","sav","inv",
          "front armour","side armour","rear armour","front","rear",
          "primary armour","exposed armour","primary","exposed","hp",
          "transport capacity","transport","access points"
        ]
      : ["m","t","sv","w","ld","oc","insv"];
  const statMap = new Map((unit.stats || []).map(stat => [normalize(stat.label), stat]));
  let displayStats = statOrder.map(key => statMap.get(key)).filter(Boolean);

  if (!displayStats.length) {
    displayStats = (unit.stats || [])
      .filter(stat => !/crusade|blackstone|commendation|logistics|enhancement|detachment|pts|points/i.test(stat.label))
      .slice(0, 7);
  }

  if (
    unit.system === "heresy" &&
    (unit.heresyModelProfiles?.length > 1 || unit.heresyComponents?.length)
  ) {
    displayStats = [];
  }

  if (
    unit.system === "legions-imperialis" &&
    unit.legionsImperialisProfiles?.length > 1
  ) {
    displayStats = [];
  }

  els.detailStats?.classList.toggle("hidden", !displayStats.length);
  els.detailStats.innerHTML = displayStats.length
    ? displayStats.map(stat => `
        <div class="stat">
          <span>${escapeHtml(stat.label)}</span>
          <strong>${escapeHtml(stat.value)}</strong>
        </div>`).join("")
    : "";

  if (unit.system === "dnd") {
    els.detailSections.innerHTML = renderDndCharacterSections(unit);
    bindDndDetailControls(unit);
    return;
  }

  const sections = [];

  if (unit.system === "necromunda") {
    sections.push(renderNecromundaCampaignSection(unit));
  }

  if (unit.system === "legions-imperialis" && unit.legionsImperialisProfiles?.length > 1) {
    sections.push(renderLegionsImperialisProfileSection(unit.legionsImperialisProfiles));
  }

  if (unit.system === "heresy" && unit.heresyModelProfiles?.length > 1) {
    sections.push(renderHeresyModelProfileSection(unit.heresyModelProfiles));
  }

  if (unit.system === "heresy" && unit.heresyComponents?.length) {
    sections.push(renderHeresyComponentSection(unit.heresyComponents));
  }

  if (unit.profiles?.length) {
    const rangedWeapons = unit.profiles.filter(profile => normalize(profile.type || "").includes("ranged"));
    const meleeWeapons = unit.profiles.filter(profile => normalize(profile.type || "").includes("melee"));
    const otherWeapons = unit.profiles.filter(profile =>
      !normalize(profile.type || "").includes("ranged") &&
      !normalize(profile.type || "").includes("melee")
    );

    if (unit.system === "warfleet") {
      sections.push(renderWarfleetsWeaponSection(unit.profiles, "Weapons"));
    } else if (unit.system === "necromunda") {
      sections.push(renderNecromundaWeaponSection(unit.profiles, "Weapons"));
    } else if (unit.system === "legions-imperialis") {
      sections.push(renderLegionsImperialisWeaponSection(unit.profiles, "Weapons"));
    } else if (unit.system === "kill-team") {
      const ranged = unit.profiles.filter(profile => killTeamWeaponKind(profile) === "ranged");
      const melee = unit.profiles.filter(profile => killTeamWeaponKind(profile) === "melee");
      const unknown = unit.profiles.filter(profile => killTeamWeaponKind(profile) === "other");
      if (ranged.length) sections.push(renderKillTeamWeaponSection(ranged, "Ranged weapons"));
      if (melee.length) sections.push(renderKillTeamWeaponSection(melee, "Melee weapons"));
      if (unknown.length) sections.push(renderKillTeamWeaponSection(unknown, "Weapons"));
    } else if (unit.system === "heresy") {
      if (rangedWeapons.length) sections.push(renderHeresyWeaponSection(rangedWeapons, "Ranged weapons", "ranged"));
      if (meleeWeapons.length) sections.push(renderHeresyWeaponSection(meleeWeapons, "Melee weapons", "melee"));
      if (otherWeapons.length) sections.push(renderHeresyWeaponSection(otherWeapons, "Weapons", "other"));
    } else if (unit.system === "opr") {
      if (rangedWeapons.length) sections.push(renderOprWeaponSection(rangedWeapons, "Ranged weapons"));
      if (meleeWeapons.length) sections.push(renderOprWeaponSection(meleeWeapons, "Melee weapons"));
      if (otherWeapons.length) sections.push(renderOprWeaponSection(otherWeapons, "Weapons"));
    } else if (unit.system === "aos") {
      if (rangedWeapons.length) sections.push(renderAosWeaponSection(rangedWeapons, "Ranged weapons"));
      if (meleeWeapons.length) sections.push(renderAosWeaponSection(meleeWeapons, "Melee weapons"));
      if (otherWeapons.length) sections.push(renderAosWeaponSection(otherWeapons, "Weapons"));
    } else {
      const fortyKRanged = unit.profiles.filter(profile => profile.type === "Ranged Weapons");
      const fortyKMelee = unit.profiles.filter(profile => profile.type === "Melee Weapons");
      const fortyKOther = unit.profiles.filter(profile =>
        profile.type !== "Ranged Weapons" && profile.type !== "Melee Weapons"
      );

      if (fortyKRanged.length) sections.push(renderWeaponSection(fortyKRanged, "Ranged weapons"));
      if (fortyKMelee.length) sections.push(renderWeaponSection(fortyKMelee, "Melee weapons"));
      if (fortyKOther.length) sections.push(renderWeaponSection(fortyKOther, "Weapons"));
    }
  }

  if (unit.rules?.length) {
    sections.push(
      (unit.system === "opr" || unit.system === "warfleet")
        ? renderOprAbilitySection(unit.rules, unit.system === "warfleet" ? "Rules & systems" : "Special rules")
        : unit.system === "necromunda"
          ? renderOprAbilitySection(unit.rules, "Skills, rules & gear")
          : unit.system === "legions-imperialis"
            ? renderOprAbilitySection(unit.rules, "Special rules")
            : unit.system === "kill-team"
            ? renderOprAbilitySection(unit.rules, "Abilities, actions & equipment")
            : unit.system === "heresy"
            ? renderOprAbilitySection(unit.rules, "Wargear, reactions & rules")
            : unit.system === "aos"
          ? renderAosAbilitySection(unit.rules)
          : renderAbilitySection(unit.rules)
    );
  }

  if (sourceUnit.importFormat === "txt") {
    sections.push(renderTextLoadoutSection(sourceUnit));

    if (sourceUnit.limitedData && !unit.hydratedFromAllArmies) {
      sections.unshift(`
        <section class="detail-section text-import-notice">
          <div class="roster-refresh-note">
            TXT exports do not contain full datasheet stats or rules. Import the ROS, ROSZ or JSON version for full data, or use Import all armies to fill matching unit datasheets.
          </div>
        </section>`);
    }
  }

  sections.push(renderUnitKeywordsSection(unit));

  els.detailSections.innerHTML = sections.filter(Boolean).join("") ||
    '<section class="detail-section"><div class="empty-section">No additional profiles were found in this entry.</div></section>';
  bindDynamicDetailControls();
}

const STATUS_OPTIONS = ["Battle-shocked","Once-per-game used"];

function statusKey(unit = state.selected) {
  if (!unit) return null;
  const roster =
    state.rosters.find(item => item.id === state.selectedRosterId) ||
    state.rosters[state.activeRoster] ||
    state.rosters.find(item => (item.units || []).some(candidate => candidate.id === unit.id));

  return roster ? "tv_status_" + roster.id + "_" + unit.id : null;
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
  updateUnitTopStatuses(state.selected);
}

function updateUnitTopStatuses(unit = state.selected) {
  const non40k = state.gameSystem !== "40k" || (unit && unit.system !== "40k");
  els.battleShockToggle?.classList.toggle("hidden", non40k);
  els.oncePerGameToggle?.classList.toggle("hidden", non40k);

  const active = new Set(unit ? getStatuses(unit) : []);
  const battleShocked = active.has("Battle-shocked");
  const onceUsed = active.has("Once-per-game used");

  if (els.battleShockToggle) {
    els.battleShockToggle.classList.toggle("active", battleShocked);
    els.battleShockToggle.setAttribute("aria-pressed", battleShocked ? "true" : "false");
    els.battleShockToggle.textContent = "Battle-shocked";
  }

  if (els.oncePerGameToggle) {
    els.oncePerGameToggle.classList.toggle("active", onceUsed);
    els.oncePerGameToggle.setAttribute("aria-pressed", onceUsed ? "true" : "false");
    els.oncePerGameToggle.textContent = "Once-per-game used";
  }
}

function isCoreRule(rule) {
  const name = normalize(rule?.name || "");
  if (!name) return false;

  const coreNames = [
    "feel no pain",
    "fnp",
    "deep strike",
    "scouts",
    "scout",
    "infiltrators",
    "infiltrator",
    "stealth",
    "lone operative",
    "deadly demise",
    "fights first",
    "leader",
    "psyker",
    "hazardous",
    "pistol",
    "torrent",
    "blast",
    "rapid fire",
    "assault",
    "heavy",
    "lethal hits",
    "sustained hits",
    "devastating wounds",
    "precision",
    "indirect fire",
    "ignores cover",
    "anti infantry",
    "anti vehicle",
    "anti monster",
    "anti character",
    "anti fly",
    "twin linked",
    "extra attacks"
  ];

  return coreNames.some(core =>
    name === core ||
    name.startsWith(core + " ") ||
    name.startsWith(core + "-") ||
    name.startsWith(core + "(")
  );
}

function cleanUniqueRuleText(text = "") {
  return cleanRuleText(text)
    .replace(/\s+/g, " ")
    .trim();
}







function renderNecromundaCampaignSection(unit) {
  const data = unit?.necromunda || {};
  const rows = [
    ["Profile", data.profileName || data.typeLine || ""],
    ["Status", data.status || "Active"],
    ["XP", data.xp || ""],
    ["Rating", data.rating != null ? data.rating + "cr" : ""],
    ...(data.counters || []).map(counter => [counter.label, counter.value])
  ].filter(([,value]) => value !== null && value !== undefined && value !== "");

  if (!rows.length) return "";

  return '<section class="detail-section necromunda-campaign-section">' +
    '<div class="section-heading-row"><h3>Fighter status</h3></div>' +
    '<div class="necromunda-campaign-grid">' +
      rows.map(([label,value]) =>
        '<div class="necromunda-campaign-row">' +
          '<span>' + escapeHtml(label) + '</span>' +
          '<strong>' + escapeHtml(value) + '</strong>' +
        '</div>'
      ).join("") +
    '</div></section>';
}

function renderNecromundaWeaponSection(profiles, title = "Weapons") {
  const columns = ["SR","LR","Str","AP","L","Traits"];
  const aliases = {
    sr:["sr","short range"],
    lr:["lr","long range"],
    str:["str","strength"],
    ap:["ap","armour piercing","armor piercing"],
    l:["l","lethality"],
    traits:["traits","trait"]
  };

  function valueFor(values, column) {
    const choices = aliases[normalize(column)] || [normalize(column)];
    for (const choice of choices) {
      if (values.has(choice)) return values.get(choice);
    }
    return "—";
  }

  const rows = (profiles || []).map(profile => {
    const values = new Map(
      (profile.values || []).map(item => [normalize(item.label), item.value ?? ""])
    );
    return {
      name:profile.name || "Weapon",
      values:columns.map(column => valueFor(values, column) || "—")
    };
  });

  const head = columns.map(column => "<th>" + escapeHtml(column) + "</th>").join("");
  const body = rows.map(row => {
    const cells = row.values.map((value,index) =>
      '<td data-label="' + escapeHtml(columns[index]) + '" class="' +
      (index === 5 ? "necromunda-weapon-traits" : "weapon-number") + '">' +
      escapeHtml(value) + '</td>'
    ).join("");

    return '<tr class="weapon-row weapon-stat-row">' +
      '<td class="weapon-name"><strong>' + escapeHtml(row.name) + '</strong></td>' +
      cells +
      '</tr>';
  }).join("");

  return '<section class="detail-section weapon-section necromunda-weapon-section">' +
    '<div class="section-heading-row"><h3>' + escapeHtml(title) + '</h3>' +
    '<span class="section-count">' + rows.length + '</span></div>' +
    '<div class="weapon-table-wrap"><table class="weapon-table compact-weapon-table necromunda-weapon-table">' +
    '<thead><tr><th class="weapon-name-column">Weapon</th>' + head + '</tr></thead>' +
    '<tbody>' + body + '</tbody></table></div></section>';
}

function renderLegionsImperialisProfileSection(profiles = []) {
  const columns = ["Move","Sv","CAF","Morale","W"];
  const rows = (profiles || []).map(profile => {
    const values = new Map(
      (profile.values || []).map(item => [normalize(item.label), item.value ?? ""])
    );
    return {
      name:profile.name || "Model",
      values:columns.map(column => values.get(normalize(column)) || "—")
    };
  });

  const head = columns.map(column => "<th>" + escapeHtml(column) + "</th>").join("");
  const body = rows.map(row => {
    const cells = row.values.map((value,index) =>
      '<td data-label="' + escapeHtml(columns[index]) + '" class="weapon-number">' +
      escapeHtml(value) + '</td>'
    ).join("");

    return '<tr class="weapon-row weapon-stat-row">' +
      '<td class="weapon-name"><strong>' + escapeHtml(row.name) + '</strong></td>' +
      cells +
      '</tr>';
  }).join("");

  return '<section class="detail-section weapon-section legions-imperialis-profile-section">' +
    '<div class="section-heading-row"><h3>Detachment profiles</h3>' +
    '<span class="section-count">' + rows.length + '</span></div>' +
    '<div class="weapon-table-wrap"><table class="weapon-table compact-weapon-table legions-imperialis-profile-table">' +
    '<thead><tr><th class="weapon-name-column">Model</th>' + head + '</tr></thead>' +
    '<tbody>' + body + '</tbody></table></div></section>';
}

function renderLegionsImperialisWeaponSection(profiles, title = "Weapons") {
  const columns = ["Range","Dice","To Hit","AP","Traits"];
  const rows = (profiles || []).map(profile => {
    const values = new Map(
      (profile.values || []).map(item => [normalize(item.label), item.value ?? ""])
    );
    return {
      name:profile.name || "Weapon",
      quantity:Number.isFinite(Number(profile.quantity)) ? Math.max(1, Number(profile.quantity)) : null,
      values:columns.map(column => values.get(normalize(column)) || "—")
    };
  });

  const head = columns.map(column => "<th>" + escapeHtml(column) + "</th>").join("");
  const body = rows.map(row => {
    const cells = row.values.map((value,index) =>
      '<td data-label="' + escapeHtml(columns[index]) + '" class="' +
      (index === 4 ? "legions-imperialis-traits" : "weapon-number") + '">' +
      escapeHtml(value) + '</td>'
    ).join("");

    return '<tr class="weapon-row weapon-stat-row">' +
      '<td class="weapon-name"><div class="weapon-title-line">' +
      (row.quantity != null ? '<span class="weapon-quantity">' + row.quantity + '×</span>' : '') +
      '<strong>' + escapeHtml(row.name) + '</strong></div></td>' +
      cells +
      '</tr>';
  }).join("");

  return '<section class="detail-section weapon-section legions-imperialis-weapon-section">' +
    '<div class="section-heading-row"><h3>' + escapeHtml(title) + '</h3>' +
    '<span class="section-count">' + rows.length + '</span></div>' +
    '<div class="weapon-table-wrap"><table class="weapon-table compact-weapon-table legions-imperialis-weapon-table">' +
    '<thead><tr><th class="weapon-name-column">Weapon</th>' + head + '</tr></thead>' +
    '<tbody>' + body + '</tbody></table></div></section>';
}

function killTeamWeaponKind(profile = {}) {
  const name = String(profile.name || "").trim();
  if (name.startsWith("⌖")) return "ranged";
  if (name.startsWith("⚔")) return "melee";
  return "other";
}

function renderKillTeamWeaponSection(profiles, title = "Weapons") {
  const columns = ["ATK","HIT","DMG","WR"];

  const rows = (profiles || []).map(profile => {
    const values = new Map(
      (profile.values || []).map(item => [normalize(item.label), item.value ?? ""])
    );
    return {
      name:String(profile.name || "Weapon").replace(/^[⌖⚔]\s*/, ""),
      quantity:Number.isFinite(Number(profile.quantity)) ? Math.max(1, Number(profile.quantity)) : null,
      values:columns.map(column => values.get(normalize(column)) || "—")
    };
  });

  const head = columns.map(column => "<th>" + escapeHtml(column) + "</th>").join("");
  const body = rows.map(row => {
    const cells = row.values.map((value, index) =>
      '<td data-label="' + escapeHtml(columns[index]) + '" class="' +
      (index === 3 ? "kill-team-weapon-rules" : "weapon-number") + '">' +
      escapeHtml(value) + '</td>'
    ).join("");

    return '<tr class="weapon-row weapon-stat-row">' +
      '<td class="weapon-name"><div class="weapon-title-line">' +
      (row.quantity != null ? '<span class="weapon-quantity">' + row.quantity + '×</span>' : '') +
      '<strong>' + escapeHtml(row.name) + '</strong></div></td>' +
      cells +
      '</tr>';
  }).join("");

  return '<section class="detail-section weapon-section kill-team-weapon-section">' +
    '<div class="section-heading-row"><h3>' + escapeHtml(title) + '</h3>' +
    '<span class="section-count">' + rows.length + '</span></div>' +
    '<div class="weapon-table-wrap"><table class="weapon-table compact-weapon-table kill-team-weapon-table">' +
    '<thead><tr><th class="weapon-name-column">Weapon</th>' + head + '</tr></thead>' +
    '<tbody>' + body + '</tbody></table></div></section>';
}

function renderHeresyModelProfileSection(profiles = []) {
  if (profiles.length < 2) return "";

  const order = [
    "M","WS","BS","S","T","W","I","A","LD","CL","WP","IN","SAV","INV",
    "Front Armour","Side Armour","Rear Armour","Front","Rear","HP"
  ];

  const maps = profiles.map(profile => new Map(
    (profile.values || []).map(item => [normalize(item.label), item.value ?? ""])
  ));
  const columns = order.filter(column =>
    maps.some(values => values.has(normalize(column)))
  );

  const head = columns.map(column => "<th>" + escapeHtml(column) + "</th>").join("");
  const body = profiles.map((profile, rowIndex) => {
    const values = maps[rowIndex];
    const type = values.get("type") || "";
    const cells = columns.map(column =>
      '<td data-label="' + escapeHtml(column) + '" class="weapon-number">' +
      escapeHtml(values.get(normalize(column)) || "—") + '</td>'
    ).join("");

    return '<tr class="weapon-row weapon-stat-row">' +
      '<td class="weapon-name"><strong>' + escapeHtml(profile.name) + '</strong>' +
      (type ? '<small>' + escapeHtml(type) + '</small>' : '') + '</td>' +
      cells +
      '</tr>';
  }).join("");

  return '<section class="detail-section weapon-section heresy-profile-section">' +
    '<div class="section-heading-row"><h3>Model profiles</h3>' +
    '<span class="section-count">' + profiles.length + '</span></div>' +
    '<div class="weapon-table-wrap"><table class="weapon-table compact-weapon-table heresy-profile-table">' +
    '<thead><tr><th class="weapon-name-column">Model</th>' + head + '</tr></thead>' +
    '<tbody>' + body + '</tbody></table></div></section>';
}

function renderHeresyComponentSection(components = []) {
  if (!components.length) return "";

  const columns = ["M","BS","Primary Armour","Exposed Armour","HP","Transport Capacity"];
  const rows = components.map(component => {
    const values = new Map(
      (component.values || []).map(item => [normalize(item.label), item.value ?? ""])
    );
    return {
      name:component.name || component.type || "Component",
      values:columns.map(column => values.get(normalize(column)) || "—")
    };
  });

  const head = columns.map(column => "<th>" + escapeHtml(column) + "</th>").join("");
  const body = rows.map(row => {
    const cells = row.values.map((value, index) =>
      '<td data-label="' + escapeHtml(columns[index]) + '" class="weapon-number">' +
      escapeHtml(value) + '</td>'
    ).join("");

    return '<tr class="weapon-row weapon-stat-row">' +
      '<td class="weapon-name"><strong>' + escapeHtml(row.name) + '</strong></td>' +
      cells +
      '</tr>';
  }).join("");

  return '<section class="detail-section weapon-section heresy-component-section">' +
    '<div class="section-heading-row"><h3>Titan structure</h3>' +
    '<span class="section-count">' + rows.length + '</span></div>' +
    '<div class="weapon-table-wrap"><table class="weapon-table compact-weapon-table heresy-component-table">' +
    '<thead><tr><th class="weapon-name-column">Section</th>' + head + '</tr></thead>' +
    '<tbody>' + body + '</tbody></table></div></section>';
}

function renderHeresyWeaponSection(profiles, title = "Weapons", kind = "ranged") {
  const melee = kind === "melee";
  const columns = melee
    ? ["IM","AM","SM","AP","D","Special Rules","Traits"]
    : ["R","FP","RS","AP","D","Special Rules","Traits"];

  const rows = (profiles || []).map(profile => {
    const values = new Map(
      (profile.values || []).map(item => [normalize(item.label), item.value ?? ""])
    );
    return {
      name:profile.name || "Weapon",
      quantity:Number.isFinite(Number(profile.quantity)) ? Math.max(1, Number(profile.quantity)) : null,
      values:columns.map(column => {
        const value = values.get(normalize(column));
        return value !== undefined && value !== "" ? value : "—";
      })
    };
  });

  const head = columns.map(column => "<th>" + escapeHtml(column) + "</th>").join("");
  const body = rows.map(row => {
    const cells = row.values.map((value, index) =>
      '<td data-label="' + escapeHtml(columns[index]) + '" class="' +
      (index >= 5 ? "heresy-weapon-text" : "weapon-number") + '">' +
      escapeHtml(value) + '</td>'
    ).join("");

    return '<tr class="weapon-row weapon-stat-row">' +
      '<td class="weapon-name"><div class="weapon-title-line">' +
      (row.quantity != null ? '<span class="weapon-quantity">' + row.quantity + '×</span>' : '') +
      '<strong>' + escapeHtml(row.name) + '</strong></div></td>' +
      cells +
      '</tr>';
  }).join("");

  return '<section class="detail-section weapon-section heresy-weapon-section">' +
    '<div class="section-heading-row"><h3>' + escapeHtml(title) + '</h3>' +
    '<span class="section-count">' + rows.length + '</span></div>' +
    '<div class="weapon-table-wrap"><table class="weapon-table compact-weapon-table heresy-weapon-table">' +
    '<thead><tr><th class="weapon-name-column">Weapon</th>' + head + '</tr></thead>' +
    '<tbody>' + body + '</tbody></table></div></section>';
}

function renderWeaponSection(profiles, title = "Weapons") {
  const columns = ["Range", "A", "BS/WS", "S", "AP", "D"];

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
      stats: [
        get("Range"),
        get("A"),
        skill,
        get("S"),
        get("AP"),
        get("D")
      ],
      keywords:get("Keywords")
    };
  });

  return `
    <section class="detail-section weapon-section">
      <div class="section-heading-row">
        <h3>${escapeHtml(title)}</h3>
        <span class="section-count">${rows.length}</span>
      </div>
      <div class="weapon-table-wrap">
        <table class="weapon-table compact-weapon-table">
          <thead>
            <tr>
              <th class="weapon-name-column">Weapon</th>
              ${columns.map(column => `<th>${escapeHtml(column)}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${rows.map(row => `
              <tr class="weapon-row weapon-stat-row">
                <td class="weapon-name">
                  <div class="weapon-title-line">
                    ${row.quantity != null ? `<span class="weapon-quantity">${row.quantity}×</span>` : ""}
                    <strong>${escapeHtml(row.name)}</strong>
                  </div>
                </td>
                ${row.stats.map((value, index) => {
                  const cellClass =
                    index === 0 && /^melee$/i.test(String(value).trim())
                      ? "weapon-range-text"
                      : index === 0
                        ? "weapon-range-number"
                        : "weapon-number";

                  return `
                    <td data-label="${escapeHtml(columns[index])}" class="${cellClass}">
                      ${escapeHtml(value)}
                    </td>`;
                }).join("")}
              </tr>
              <tr class="weapon-keyword-row">
                <td colspan="7">
                  <span>Keywords</span>
                  <strong>${escapeHtml(row.keywords)}</strong>
                </td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </section>`;
}

function renderAosWeaponSection(profiles, title = "Weapons") {
  const rows = (profiles || []).map(profile => {
    const values = new Map(
      (profile.values || []).map(item => [normalize(item.label), item.value ?? ""])
    );

    const ranged = normalize(profile.type || "").includes("ranged");
    const range = ranged
      ? (values.get("rng") || values.get("range") || "—")
      : "Melee";

    return {
      name:profile.name || "Weapon",
      quantity:Number.isFinite(Number(profile.quantity)) ? Math.max(1, Number(profile.quantity)) : null,
      range,
      attacks:values.get("atk") || values.get("attacks") || values.get("a") || "—",
      hit:values.get("hit") || "—",
      wound:values.get("wnd") || values.get("wound") || "—",
      rend:values.get("rnd") || values.get("rend") || "—",
      damage:values.get("dmg") || values.get("damage") || "—",
      ability:values.get("ability") || "—"
    };
  });

  return `
    <section class="detail-section weapon-section aos-weapon-section">
      <div class="section-heading-row">
        <h3>${escapeHtml(title)}</h3>
        <span class="section-count">${rows.length}</span>
      </div>
      <div class="weapon-table-wrap">
        <table class="weapon-table aos-weapon-table">
          <thead>
            <tr>
              <th class="weapon-name-column">Weapon</th>
              <th>Range</th>
              <th>Atk</th>
              <th>Hit</th>
              <th>Wnd</th>
              <th>Rnd</th>
              <th>Dmg</th>
              <th>Ability</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(row => `
              <tr class="weapon-row weapon-stat-row">
                <td class="weapon-name">
                  <div class="weapon-title-line">
                    ${row.quantity != null ? `<span class="weapon-quantity">${row.quantity}×</span>` : ""}
                    <strong>${escapeHtml(row.name)}</strong>
                  </div>
                </td>
                <td data-label="Range" class="weapon-range-text">${escapeHtml(row.range)}</td>
                <td data-label="Atk" class="weapon-number">${escapeHtml(row.attacks)}</td>
                <td data-label="Hit" class="weapon-number">${escapeHtml(row.hit)}</td>
                <td data-label="Wnd" class="weapon-number">${escapeHtml(row.wound)}</td>
                <td data-label="Rnd" class="weapon-number">${escapeHtml(row.rend)}</td>
                <td data-label="Dmg" class="weapon-number">${escapeHtml(row.damage)}</td>
                <td data-label="Ability" class="aos-weapon-ability">${escapeHtml(row.ability)}</td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </section>`;
}

function renderAosAbilitySection(rules) {
  if (!rules?.length) return "";

  return `
    <section class="detail-section ability-section aos-ability-section">
      <div class="section-heading-row">
        <h3>Abilities</h3>
        <span class="section-count">${rules.length}</span>
      </div>
      <div class="ability-list">
        ${rules.map(rule => {
          const fields = Array.isArray(rule.fields) ? rule.fields.filter(field => field?.value) : [];
          return `
            <article class="ability-card aos-ability-card">
              <div class="aos-ability-heading">
                <h4>${escapeHtml(cleanRuleText(rule.name || "Ability"))}</h4>
                ${rule.category ? `<span>${escapeHtml(rule.category)}</span>` : ""}
              </div>
              ${fields.length
                ? `<div class="aos-ability-fields">
                    ${fields.map(field => `
                      <div class="aos-ability-field">
                        <strong>${escapeHtml(field.label)}</strong>
                        <div class="ability-text">${formatRuleText(field.value)}</div>
                      </div>`).join("")}
                  </div>`
                : rule.text
                  ? `<div class="ability-text unique-rule-text">${formatRuleText(rule.text)}</div>`
                  : ""}
            </article>`;
        }).join("")}
      </div>
    </section>`;
}


function renderWarfleetsWeaponSection(profiles, title = "Weapons") {
  const rows = (profiles || []).map(profile => {
    const values = new Map(
      (profile.values || []).map(item => [normalize(item.label), item.value ?? ""])
    );

    return {
      name:profile.name || "Weapon",
      facing:values.get("facing") || "—",
      range:values.get("range") || "—",
      attacks:values.get("a") || values.get("attacks") || "—",
      strength:values.get("str") || values.get("strength") || "—",
      special:values.get("special") || values.get("special rules") || "—"
    };
  });

  const body = rows.map(row =>
    '<tr class="weapon-row weapon-stat-row">' +
      '<td class="weapon-name"><strong>' + escapeHtml(row.name) + '</strong></td>' +
      '<td data-label="Facing" class="warfleet-facing">' + escapeHtml(row.facing) + '</td>' +
      '<td data-label="Range" class="weapon-range-text">' + escapeHtml(row.range) + '</td>' +
      '<td data-label="A" class="weapon-number">' + escapeHtml(row.attacks) + '</td>' +
      '<td data-label="Str" class="weapon-number">' + escapeHtml(row.strength) + '</td>' +
      '<td data-label="Special" class="opr-weapon-special">' + escapeHtml(row.special) + '</td>' +
    '</tr>'
  ).join("");

  return (
    '<section class="detail-section weapon-section warfleets-weapon-section">' +
      '<div class="section-heading-row">' +
        '<h3>' + escapeHtml(title) + '</h3>' +
        '<span class="section-count">' + rows.length + '</span>' +
      '</div>' +
      '<div class="weapon-table-wrap">' +
        '<table class="weapon-table compact-weapon-table warfleets-weapon-table">' +
          '<thead><tr>' +
            '<th class="weapon-name-column">Weapon</th>' +
            '<th>Facing</th>' +
            '<th>Range</th>' +
            '<th>A</th>' +
            '<th>Str</th>' +
            '<th>Special</th>' +
          '</tr></thead>' +
          '<tbody>' + body + '</tbody>' +
        '</table>' +
      '</div>' +
    '</section>'
  );
}

function renderOprWeaponSection(profiles, title = "Weapons") {
  const rows = (profiles || []).map(profile => {
    const values = new Map(
      (profile.values || []).map(item => [normalize(item.label), item.value ?? ""])
    );
    const rangeRaw = values.get("range");
    const range = rangeRaw && /^\d+(?:\.\d+)?$/.test(String(rangeRaw).trim())
      ? String(rangeRaw).trim() + '\"'
      : (rangeRaw || (/melee/i.test(profile.type || "") ? "Melee" : "—"));

    return {
      name:profile.name || "Weapon",
      quantity:Number.isFinite(Number(profile.quantity)) ? Math.max(1, Number(profile.quantity)) : null,
      range,
      attacks:values.get("a") || values.get("attacks") || "—",
      special:values.get("special") || values.get("special rules") || values.get("keywords") || "—"
    };
  });

  return `
    <section class="detail-section weapon-section opr-weapon-section">
      <div class="section-heading-row">
        <h3>${escapeHtml(title)}</h3>
        <span class="section-count">${rows.length}</span>
      </div>
      <div class="weapon-table-wrap">
        <table class="weapon-table compact-weapon-table opr-weapon-table">
          <thead>
            <tr>
              <th class="weapon-name-column">Weapon</th>
              <th>Range</th>
              <th>A</th>
              <th>Special rules</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(row => `
              <tr class="weapon-row weapon-stat-row">
                <td class="weapon-name">
                  <div class="weapon-title-line">
                    ${row.quantity != null ? `<span class="weapon-quantity">${row.quantity}×</span>` : ""}
                    <strong>${escapeHtml(row.name)}</strong>
                  </div>
                </td>
                <td data-label="Range" class="weapon-range-text">${escapeHtml(row.range)}</td>
                <td data-label="A" class="weapon-number">${escapeHtml(row.attacks)}</td>
                <td data-label="Special rules" class="opr-weapon-special">${escapeHtml(row.special)}</td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </section>`;
}

function renderOprAbilitySection(rules, title = "Special rules") {
  if (!rules?.length) return "";

  return `
    <section class="detail-section ability-section">
      <div class="section-heading-row">
        <h3>${escapeHtml(title)}</h3>
        <span class="section-count">${rules.length}</span>
      </div>
      <div class="ability-list">
        ${rules.map(rule => `
          <article class="ability-card unique-rule-card">
            <h4>${escapeHtml(cleanRuleText(rule.name || "Rule"))}</h4>
            ${rule.text ? `<div class="ability-text unique-rule-text">${formatRuleText(rule.text)}</div>` : ""}
          </article>`).join("")}
      </div>
    </section>`;
}

function renderAbilitySection(rules) {
  const uniqueRules = (rules || []).filter(rule => !isCoreRule(rule));
  if (!uniqueRules.length) return "";

  return `
    <section class="detail-section ability-section">
      <div class="section-heading-row">
        <h3>Unique abilities & rules</h3>
        <span class="section-count">${uniqueRules.length}</span>
      </div>
      <div class="ability-list">
        ${uniqueRules.map(rule => {
          const text = cleanUniqueRuleText(rule.text || "");
          return `
            <article class="ability-card unique-rule-card">
              <h4>${escapeHtml(cleanRuleText(rule.name || "Rule"))}</h4>
              ${text ? `<div class="ability-text unique-rule-text">${formatRuleText(text)}</div>` : ""}
            </article>`;
        }).join("")}
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
    .replace(/\\(?=<\/?[a-z][^>]*>)/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "■ ")
    .replace(/<\/?ul[^>]*>/gi, "\n")
    .replace(/<\/?ol[^>]*>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<p[^>]*>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\\\s*$/gm, "")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/\^\^/g, "")
    .replace(/\*\*/g, "")
    .replace(/__+/g, "")
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

function sourceCpStorageKey(sourceId) {
  return "tv_source_cp_" + encodeURIComponent(String(sourceId || ""));
}

function getActiveCpSource() {
  const source = getActiveUnitBrowserSource();
  if (state.gameSystem !== "40k" || !source || source.id === "all" || source.kind === "opr") return null;
  return source;
}

function getSourceCP(sourceId) {
  if (!sourceId || sourceId === "all") return 0;
  try {
    return Math.max(0, Number(localStorage.getItem(sourceCpStorageKey(sourceId)) || 0));
  } catch {
    return 0;
  }
}

function setSourceCP(sourceId, value) {
  if (!sourceId || sourceId === "all") return;
  localStorage.setItem(sourceCpStorageKey(sourceId), String(Math.max(0, Number(value) || 0)));
}

function getMatchState() {
  try {
    return {
      turn: localStorage.getItem("tv_match_turn") || "your"
    };
  } catch {
    return {turn:"your"};
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

function updateGameContextUi(unit = state.selected) {
  const opr = isOprMode();
  const aos = isAosMode();
  const heresy = isHeresyMode();
  const killTeam = isKillTeamMode();
  const legionsImperialis = isLegionsImperialisMode();
  const necromunda = isNecromundaMode();
  const dnd = isDndMode();
  const non40k = state.gameSystem !== "40k";

  els.appNav?.classList.toggle("opr-context", non40k);

  const stratButton = els.appNav?.querySelector('[data-page-target="strats"]');
  const scoreButton = els.appNav?.querySelector('[data-page-target="score"]');
  const armyRulesButton = els.appNav?.querySelector('[data-page-target="army-rules"]');
  const coreRulesButton = els.navMoreMenu?.querySelector('[data-page-target="rules"]');

  stratButton?.classList.toggle("hidden", non40k);
  scoreButton?.classList.toggle("hidden", non40k);
  coreRulesButton?.classList.toggle("hidden", non40k);

  const unitButton = els.appNav?.querySelector('[data-page-target="datasheets"]');
  const unitLabel = unitButton?.querySelector("span:last-child");
  if (unitLabel) {
    unitLabel.textContent = isWarfleetsMode()
      ? "Fleet"
      : killTeam
        ? "Operatives"
        : necromunda
          ? "Fighters"
          : dnd
            ? "Characters"
            : legionsImperialis
              ? "Detachments"
              : "Units";
  }

  const browserEyebrow = els.rosterBrowser?.querySelector(".roster-browser-heading .eyebrow");
  const browserTitle = els.rosterBrowser?.querySelector(".roster-browser-heading h1");
  if (browserEyebrow) {
    browserEyebrow.textContent = isWarfleetsMode()
      ? "FLEET BROWSER"
      : killTeam
        ? "KILL TEAM"
        : necromunda
          ? "GANG ROSTER"
          : dnd
            ? "CHARACTERS"
            : legionsImperialis
              ? "DETACHMENT BROWSER"
              : "UNIT BROWSER";
  }
  if (browserTitle) {
    browserTitle.textContent = isWarfleetsMode()
      ? "Choose a ship or squadron."
      : killTeam
        ? "Choose an operative."
        : necromunda
          ? "Choose a fighter."
          : dnd
            ? "Choose a character."
            : legionsImperialis
              ? "Choose a detachment."
              : "Choose a unit.";
  }
  if (els.searchInput) {
    els.searchInput.placeholder = isWarfleetsMode()
      ? "Type a ship or squadron name…"
      : killTeam
        ? "Type an operative name…"
        : necromunda
          ? "Type a fighter name…"
          : dnd
            ? "Type a character, attack or spell…"
            : legionsImperialis
              ? "Type a detachment name…"
              : "Type a unit name…";
  }

  const armyRulesLabel = armyRulesButton?.querySelector("span:last-child");
  if (armyRulesLabel) {
    armyRulesLabel.textContent = killTeam
      ? "Team Rules"
      : necromunda
        ? "Gang Rules"
        : dnd
          ? "Features"
          : legionsImperialis
            ? "Formation Rules"
            : (opr || heresy)
              ? "Rules"
              : "Army Rules";
  }

  const heading = els.pageArmyRules?.querySelector("h1");
  const copy = els.pageArmyRules?.querySelector(".page-heading > p:last-child");
  const eyebrow = els.pageArmyRules?.querySelector(".eyebrow");

  if (heading) {
    heading.textContent = killTeam
      ? "Team Rules"
      : necromunda
        ? "Gang Rules"
        : dnd
          ? "Features"
          : legionsImperialis
            ? "Formation Rules"
            : (opr || heresy)
              ? "Rules"
              : "Army Rules";
  }

  if (eyebrow) {
    eyebrow.textContent = opr
      ? currentGameName().toUpperCase() + " REFERENCE"
      : killTeam
        ? "KILL TEAM REFERENCE"
        : necromunda
          ? "NECROMUNDA REFERENCE"
          : dnd
            ? "D&D CHARACTER REFERENCE"
            : legionsImperialis
              ? "LEGIONS IMPERIALIS REFERENCE"
              : heresy
                ? "HORUS HERESY REFERENCE"
                : aos
                  ? "AGE OF SIGMAR REFERENCE"
                  : "ARMY REFERENCE";
  }

  if (copy) {
    copy.textContent = opr
      ? isWarfleetsMode()
        ? "Ship rules and systems referenced by the active Warfleets fleet."
        : "Special rules" + (isOprFantasyMode() ? " and spells" : "") + " referenced by the active " + currentGameName() + (isOprQuestMode() ? " campaign." : " list.")
      : killTeam
        ? "Team-wide abilities, equipment and selected rules imported with the active Kill Team. Operative-specific abilities and unique actions are shown on each operative."
        : necromunda
          ? "Gang-wide rules and current campaign state imported from Gyrinx. Fighter-specific skills, powers, gear, injuries and status are shown on each fighter."
          : dnd
            ? "Species traits, class features and feats imported with the active D&D Beyond character. Attacks, spells, slots and inventory are on the character page."
            : legionsImperialis
              ? "Formation rules imported with the active Legions Imperialis army. Detachment-specific special rules are shown on each detachment."
              : heresy
                ? "Army rules imported with the active Horus Heresy list. Unit-specific wargear, reactions and traits are shown on each unit profile."
                : aos
                  ? "Battle traits, spells, prayers and other army-level abilities imported with the active Age of Sigmar list."
                  : "Rules that apply to the selected imported list or whole army.";
  }
}

function renderMatchTools() {
  const match = getMatchState();
  const cpSource = getActiveCpSource();

  if (els.unitBrowserCp) {
    els.unitBrowserCp.classList.toggle("hidden", !cpSource);
    els.unitBrowserCp.title = cpSource ? cpSource.label + " Command Points" : "";
  }

  if (els.cpValue) {
    els.cpValue.textContent = cpSource ? String(getSourceCP(cpSource.id)) : "0";
  }

  if (els.turnToggle) {
    els.turnToggle.textContent = match.turn === "your" ? "Player 1 turn" : "Player 2 turn";
    els.turnToggle.classList.toggle("opponent", match.turn === "opponent");
  }
}

function adjustCP(delta) {
  const source = getActiveCpSource();
  if (!source) {
    toast("Choose a specific list or army tab to track CP.");
    return;
  }

  const next = Math.max(0, getSourceCP(source.id) + delta);
  setSourceCP(source.id, next);
  renderMatchTools();
}

function toggleTurn() {
  const match = getMatchState();
  const next = match.turn === "your" ? "opponent" : "your";
  localStorage.setItem("tv_match_turn", next);
  renderMatchTools();
}

function resetScores() {
  if (!confirm("Reset both players' scores for all five turns?")) return;

  localStorage.removeItem("tv_score_state");
  localStorage.removeItem("tv_score_turn");
  state.scoreTurn = 1;
  renderScoreboard();
  setVoicePrompt("score");
  toast("Scores reset");
}

function resetGame() {
  if (!confirm(
    "Reset this game? This clears unit states, both players' scores, CP and the current turn. Loaded lists and pins will stay."
  )) return;

  for (const key of Object.keys(localStorage)) {
    if (
      key.startsWith("tv_status_") ||
      key.startsWith("tv_destroyed_") ||
      key.startsWith("tv_unit_destroyed_") ||
      key.startsWith("tv_source_cp_")
    ) {
      localStorage.removeItem(key);
    }

    if (key.startsWith("tv_dnd_state_")) {
      let saved = {};
      try { saved = JSON.parse(localStorage.getItem(key) || "{}"); } catch {}
      const inventoryDeltas = dndIsRecord(saved?.inventoryDeltas) ? saved.inventoryDeltas : {};
      localStorage.setItem(key, JSON.stringify({
        economy:{action:false, bonus:false, reaction:false},
        slots:{},
        inventoryDeltas,
        lastRoll:null
      }));
    }
  }

  ["tv_match_cp","tv_match_turn","tv_score_state","tv_score_turn"].forEach(key =>
    localStorage.removeItem(key)
  );

  state.scoreTurn = 1;
  updateUnitTopStatuses(state.selected);
  renderScoreboard();
  renderMatchTools();
  renderAll();
  toast("Game reset");
}

function resetMatchState() {
  resetGame();
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

let diceAudioContext = null;

function playRerollSound() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    diceAudioContext ||= new AudioContextClass();
    const ctx = diceAudioContext;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});

    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.12, now);
    master.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    master.connect(ctx.destination);

    for (let i = 0; i < 6; i++) {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + i * 0.022;
      const duration = 0.035 + (i % 2) * 0.01;

      oscillator.type = i % 2 ? "triangle" : "square";
      oscillator.frequency.setValueAtTime(180 + (i * 47), start);
      oscillator.frequency.exponentialRampToValueAtTime(90 + (i * 20), start + duration);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.13, start + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

      oscillator.connect(gain);
      gain.connect(master);
      oscillator.start(start);
      oscillator.stop(start + duration + 0.01);
    }
  } catch (error) {
    console.warn("Could not play reroll sound", error);
  }
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
  playRerollSound();
  renderDiceState();
}

function rerollEverything() {
  const last = state.lastDiceRoll;
  if (!last?.rolls?.length) {
    toast("Roll some dice first.");
    return;
  }

  last.rolls = last.rolls.map(() => randomD6());
  playRerollSound();
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


function getDndCharacterContexts() {
  return state.rosters.flatMap((roster, rosterIndex) => {
    if (roster.source !== "dndbeyond" || !rosterMatchesSelectedGame(roster)) return [];
    return (roster.units || [])
      .filter(unit => unit.system === "dnd")
      .map(unit => ({roster, rosterIndex, unit}));
  });
}

function activeDndCharacterContext() {
  const contexts = getDndCharacterContexts();
  return contexts.find(item =>
    state.selected?.id === item.unit.id ||
    state.selectedRosterId === item.roster.id
  ) || contexts[0] || null;
}

function focusDndAction(context, action) {
  if (!context || !action) return false;
  state.activeRoster = context.rosterIndex;
  state.selectedRosterId = context.roster.id;
  state.selected = context.unit;
  state.dndFocusedActionId = action.id;
  state.unitBrowserSourceId = "roster:" + context.roster.id;
  localStorage.setItem("tv_unit_browser_source", state.unitBrowserSourceId);
  rememberRecentUnit(context.unit);
  switchPage("datasheets", {silent:true});
  renderAll();
  renderDetail(context.unit);
  if (els.voiceHint) els.voiceHint.textContent = action.name;
  toast(action.name);
  return true;
}

function handleDndVoiceCommand(primary, alternatives = []) {
  if (!isDndMode()) return false;
  const contexts = getDndCharacterContexts();
  if (!contexts.length) return false;

  const raw = String(primary || "").trim();
  const q = normalize(raw);
  if (!q) return false;

  const context = activeDndCharacterContext();

  const inventoryMatch = raw.match(/^\s*(add|remove|drop|delete)\s+(?:(\d+)\s+)?(.+?)\s*$/i);
  if (inventoryMatch && context) {
    const verb = inventoryMatch[1].toLowerCase();
    const amount = Math.max(1, Number(inventoryMatch[2] || 1));
    const name = inventoryMatch[3].trim();
    const delta = /remove|drop|delete/.test(verb) ? -amount : amount;
    if (adjustDndInventory(context.unit, name, delta)) {
      state.activeRoster = context.rosterIndex;
      state.selectedRosterId = context.roster.id;
      state.selected = context.unit;
      state.dndFocusedActionId = "";
      switchPage("datasheets", {silent:true});
      renderDetail(context.unit);
      toast((delta > 0 ? "Added " : "Removed ") + amount + " " + name);
      return true;
    }
  }

  if (/^(new turn|reset turn|start turn)$/.test(q) && context) {
    const runtime = getDndRuntimeState(context.unit);
    runtime.economy = {action:false, bonus:false, reaction:false};
    saveDndRuntimeState(context.unit, runtime);
    renderDetail(context.unit);
    toast("New turn — action economy reset");
    return true;
  }

  let kind = "";
  let query = raw;
  if (/^\s*(attack|strike|shoot)\b/i.test(raw)) {
    kind = "attack";
    query = raw.replace(/^\s*(?:attack|strike|shoot)(?:\s+with)?\s+/i, "");
  } else if (/^\s*cast\b/i.test(raw)) {
    kind = "spell";
    query = raw.replace(/^\s*cast\s+/i, "");
  } else if (/^\s*use\b/i.test(raw)) {
    query = raw.replace(/^\s*use\s+/i, "");
  }

  const spoken = [
    query,
    ...alternatives.slice(1).map(item =>
      String(item?.transcript || "")
        .replace(/^\s*(?:attack|strike|shoot)(?:\s+with)?\s+/i, "")
        .replace(/^\s*cast\s+/i, "")
        .replace(/^\s*use\s+/i, "")
    )
  ].filter(Boolean);

  const ranked = [];
  for (const item of contexts) {
    const actions = [
      ...(item.unit.dnd?.attacks || []),
      ...(item.unit.dnd?.spells || [])
    ].filter(action => !kind || action.kind === kind);

    for (const action of actions) {
      const score = Math.max(...spoken.map(value => scoreVoicePhrase(value, action.name)));
      ranked.push({...item, action, score});
    }
  }

  ranked.sort((a,b) => b.score - a.score || a.action.name.localeCompare(b.action.name));
  const top = ranked[0];
  const second = ranked[1];
  if (!top || top.score < .52) return false;

  const margin = top.score - (second?.score || 0);
  const exact = spoken.some(value => normalize(value) === normalize(top.action.name));
  if (!exact && top.score < .72 && margin < .12) return false;

  return focusDndAction(top, top.action);
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

  if (isDndMode() && handleDndVoiceCommand(primary, alternatives)) return;
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

  if (/^(show )?(all abilities|all rules)$/.test(q)) {
    scrollToDetailSection(".ability-section");
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
    .replace(/\s+/g, " ")
    .trim();

  const digit = cleaned.match(/\b([2-6])(?:\s*s)?\b/);
  if (digit) return Number(digit[1]);

  const number = parseSpokenNumber(cleaned.replace(/\bs\b/g, ""));
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

  const groupOrder = isWarfleetsMode()
    ? ["Heavy Ships","Medium Ships","Light Ships","Ships","Squadrons"]
    : isKillTeamMode()
      ? ["Leaders","Operatives"]
      : isNecromundaMode()
        ? ["Leaders","Champions","Gangers","Juves & Prospects","Brutes","Hangers-on","Vehicles","Pets","Fighters"]
        : isLegionsImperialisMode()
        ? [
            "HQ",
            "Core",
            "Support",
            "Vanguard",
            "Light Armour",
            "Battle Tank",
            "Heavy Armour",
            "Artillery",
            "Bastion",
            "Transport",
            "Air Support",
            "Knights",
            "Titans",
            "Other Detachments"
          ]
        : isHeresyMode()
        ? [
          "High Command",
          "Command",
          "Retinue",
          "Troops",
          "Elites",
          "Recon",
          "Fast Attack",
          "Support",
          "Heavy Assault",
          "Armour",
          "War Engines",
          "Transports",
          "Lords of War",
          "Other units"
        ]
      : [
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
            const rating = entry.unit.system === "necromunda"
              ? (entry.unit.stats || []).find(stat => normalize(stat.label) === "rating")?.value
              : null;
            return `
              <button class="roster-unit-button" type="button" data-entry-index="${entry.entryIndex}">
                <span class="roster-unit-copy">
                  <strong>${escapeHtml(entry.unit.name)}</strong>
                  ${source.kind === "all" ? `<small>${escapeHtml(entry.sourceLabel)}</small>` : ""}
                </span>
                ${rating != null
                  ? `<small class="roster-unit-points">${escapeHtml(rating)}</small>`
                  : pts != null
                    ? `<small class="roster-unit-points">${escapeHtml(pts)} pts</small>`
                    : ""}
              </button>`;
          }).join("")}
        </div>
      </section>`);
  }

  els.quickLists.innerHTML = html.join("") ||
    '<div class="empty-section">' +
      (isWarfleetsMode()
        ? "No ships or squadrons were found in this fleet."
        : isKillTeamMode()
          ? "No operatives were found in this kill team."
          : isNecromundaMode()
            ? "No fighters were found in this gang."
            : isLegionsImperialisMode()
              ? "No detachments were found in this army."
              : "No units were found in this data source.") +
    '</div>';

  els.quickLists.querySelectorAll("[data-entry-index]").forEach(button => {
    button.addEventListener("click", () => {
      const entry = source.entries[Number(button.dataset.entryIndex)];
      if (entry) selectUnitFromRoster(entry.unit, entry.rosterIndex);
    });
  });

  updateRosterBrowserVisibility();
}

function enterDatasheetHistory() {
  if (history.state?.tvView === "datasheet") return;
  history.pushState({...history.state, tvView:"datasheet"}, "", location.href);
}

function handleDatasheetBack() {
  if (state.selected && history.state?.tvView === "datasheet") {
    history.back();
    return;
  }
  backToRosterBrowser();
}

function handleBrowserBack() {
  if (state.currentPage === "datasheets" && state.selected) {
    backToRosterBrowser({fromHistory:true});
  }
}

function backToRosterBrowser(options = {}) {
  if (!getUnitBrowserSources().length) return;

  state.selected = null;
  state.selectedRosterId = null;
  if (els.searchInput) els.searchInput.value = "";
  els.datasheetResultsShell?.classList.add("hidden");
  renderDetail(null);
  renderTabs();
  renderQuickLists();
  updateRosterBrowserVisibility();
  setVoicePrompt("datasheets");
  window.scrollTo({top:0, behavior:"smooth"});

  if (!options.fromHistory && history.state?.tvView === "datasheet") {
    history.replaceState({...history.state, tvView:"list"}, "", location.href);
  }
}

function bindDynamicDetailControls() {}

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
  if (els.modeToggle) els.modeToggle.textContent = state.mode === "table" ? "Mobile mode" : "Table mode";
}

function shareRandomSecret() {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, value => value.toString(16).padStart(2, "0")).join("");
}

function cleanupSharePeer() {
  try { state.shareConnection?.close(); } catch {}
  try { state.sharePeer?.destroy(); } catch {}
  state.shareConnection = null;
  state.sharePeer = null;
}

async function stopShareScanner() {
  const scanner = state.shareScanner;
  state.shareScanner = null;
  if (!scanner) return;

  try {
    const running = scanner.getState?.();
    if (running === 2 || running === 3) await scanner.stop();
  } catch {}

  try { scanner.clear(); } catch {}
  els.opponentQrScanner?.classList.add("hidden");
}

function renderSharePage() {
  const rosters = state.rosters.filter(roster =>
    (roster.source === "new-recruit" || roster.source === "opr") &&
    rosterMatchesSelectedGame(roster)
  );
  if (!els.shareRosterSelect || !els.createAppShareButton) return;

  els.shareRosterSelect.innerHTML = rosters.length
    ? rosters.map(roster => `
        <option value="${escapeHtml(roster.id)}">
          ${escapeHtml(roster.name)}${roster.points != null ? " · " + escapeHtml(roster.points) + " pts" : ""}
        </option>`).join("")
    : '<option value="">No imported lists</option>';

  els.createAppShareButton.disabled = !rosters.length;
  if (els.removeShareRosterButton) {
    els.removeShareRosterButton.disabled = !rosters.length;
    els.removeShareRosterButton.classList.toggle("hidden", !rosters.length);
  }
}

function removeSelectedShareRoster() {
  const roster = getRosterForAppShare();
  if (!roster) return;

  if (!confirm('Remove "' + roster.name + '" from this device? The copy already sent to another device will not be affected.')) {
    return;
  }

  cleanupSharePeer();
  els.appShareQrPanel?.classList.add("hidden");
  if (els.appShareQrCode) els.appShareQrCode.innerHTML = "";

  const index = state.rosters.findIndex(item => item.id === roster.id);
  if (index >= 0) state.rosters.splice(index, 1);

  state.activeRoster = Math.min(state.activeRoster, Math.max(0, state.rosters.length - 1));

  if (state.unitBrowserSourceId === "roster:" + roster.id) {
    const nextSource = getUnitBrowserSources().find(source => source.id !== "all");
    state.unitBrowserSourceId = nextSource?.id || "all";
    localStorage.setItem("tv_unit_browser_source", state.unitBrowserSourceId);
  }

  persist();
  renderAll();
  renderSharePage();
  toast("List removed from this device");
}

function getRosterForAppShare() {
  const rosterId = els.shareRosterSelect?.value;
  return state.rosters.find(roster =>
    (roster.source === "new-recruit" || roster.source === "opr") &&
    rosterMatchesSelectedGame(roster) &&
    roster.id === rosterId
  ) || null;
}

function buildAppSharePackage(roster) {
  return {
    type:"tabletop-voice-roster",
    version:1,
    exportedAt:Date.now(),
    roster:{
      ...roster,
      id:roster.id,
      sharedFromOpponent:false
    }
  };
}

async function sendAppSharePackage(conn, roster) {
  const payload = JSON.stringify(buildAppSharePackage(roster));
  const chunkSize = 24000;
  const totalChunks = Math.max(1, Math.ceil(payload.length / chunkSize));

  conn.send({
    type:"tv-share-manifest",
    name:roster.name,
    chunks:totalChunks,
    length:payload.length
  });

  for (let index = 0; index < totalChunks; index++) {
    if (!conn.open) throw new Error("Opponent disconnected.");

    conn.send({
      type:"tv-share-chunk",
      index,
      data:payload.slice(index * chunkSize, (index + 1) * chunkSize)
    });

    if (index % 8 === 0) await new Promise(resolve => setTimeout(resolve, 8));
  }

  conn.send({type:"tv-share-complete"});
}

function setAppShareStatus(message) {
  if (els.appShareStatus) els.appShareStatus.textContent = message;
}

function setOpponentReceiveStatus(message, type = "") {
  if (!els.opponentReceiveStatus) return;
  els.opponentReceiveStatus.classList.remove("hidden","good","bad");
  if (type) els.opponentReceiveStatus.classList.add(type);
  els.opponentReceiveStatus.textContent = message;
  if (type !== "good") els.opponentReceiveActions?.classList.add("hidden");
}

function createAppShareQr() {
  const roster = getRosterForAppShare();
  if (!roster) {
    toast("Choose an imported list first.");
    return;
  }

  if (typeof Peer === "undefined" || typeof QRCode === "undefined") {
    toast("Sharing libraries did not load. Refresh and try again.");
    return;
  }

  cleanupSharePeer();
  const secret = shareRandomSecret();
  const peer = new Peer(undefined, {debug:1});
  state.sharePeer = peer;

  els.appShareQrPanel?.classList.remove("hidden");
  if (els.appShareQrCode) els.appShareQrCode.innerHTML = "";
  setAppShareStatus("Creating QR…");

  peer.on("open", id => {
    const url = new URL(location.href);
    url.search = "";
    url.hash = "";
    url.searchParams.set("tvshare", id);
    url.searchParams.set("key", secret);

    if (els.appShareQrCode) {
      els.appShareQrCode.innerHTML = "";
      new QRCode(els.appShareQrCode, {
        text:url.toString(),
        width:240,
        height:240,
        correctLevel:QRCode.CorrectLevel.M
      });
    }

    setAppShareStatus("Waiting for opponent…");
  });

  peer.on("connection", conn => {
    if (conn.metadata?.key !== secret) {
      conn.close();
      return;
    }

    state.shareConnection = conn;
    setAppShareStatus("Opponent connected…");

    conn.on("data", message => {
      if (message?.type !== "tv-share-hello" || message.key !== secret) return;

      sendAppSharePackage(conn, roster)
        .then(() => setAppShareStatus("List sent ✓ — use the × beside the list selector if you want to remove it from this device."))
        .catch(error => setAppShareStatus(error.message || "Transfer failed"));
    });

    conn.on("close", () => {
      if (!els.appShareStatus?.textContent?.startsWith("List sent ✓")) {
        setAppShareStatus("Opponent disconnected");
      }
    });
  });

  peer.on("error", error => {
    console.error("Share peer error", error);
    setAppShareStatus("Could not create transfer");
  });
}

function parseOpponentShareLink(value) {
  let url;
  try {
    url = new URL(value, location.href);
  } catch {
    return null;
  }

  const peerId = url.searchParams.get("tvshare");
  const key = url.searchParams.get("key");
  if (!peerId || !key) return null;
  return {peerId,key};
}

function importSharedRosterPackage(pack) {
  if (pack?.type !== "tabletop-voice-roster" || pack.version !== 1 || !pack.roster) {
    throw new Error("This QR did not contain a compatible Tabletop Voice list.");
  }

  const incoming = pack.roster;
  if (!Array.isArray(incoming.units) || !incoming.name) {
    throw new Error("The received roster was incomplete.");
  }

  const roster = {
    ...incoming,
    id:crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
    source:incoming.source === "opr" ? "opr" : "new-recruit",
    sharedFromOpponent:true,
    importedAt:Date.now()
  };

  const duplicateIndex = state.rosters.findIndex(existing =>
    existing.source === roster.source &&
    existing.sharedFromOpponent &&
    normalize(existing.name) === normalize(roster.name) &&
    normalize(existing.faction) === normalize(roster.faction)
  );

  if (duplicateIndex >= 0) {
    state.rosters.splice(duplicateIndex, 1, roster);
    state.activeRoster = duplicateIndex;
  } else {
    state.rosters.push(roster);
    state.activeRoster = state.rosters.length - 1;
  }

  state.unitBrowserSourceId = "roster:" + roster.id;
  localStorage.setItem("tv_unit_browser_source", state.unitBrowserSourceId);
  state.detachmentStratagemLoadKey = "";

  persist();
  renderAll();
  renderSharePage();

  setOpponentReceiveStatus(
    "SAVED TO THIS APP ✓ — " + roster.name +
      (roster.points != null ? " · " + roster.points + " pts" : "") +
      ". No save button is needed; the list is already stored on this device.",
    "good"
  );
  els.opponentReceiveActions?.classList.remove("hidden");
  if (els.opponentShareLink) els.opponentShareLink.value = "";
  toast("Opponent list saved to this app");
  setTimeout(cleanupSharePeer, 250);
}

function connectOpponentShare(peerId, key) {
  if (typeof Peer === "undefined") {
    setOpponentReceiveStatus("Sharing library did not load. Refresh and try again.", "bad");
    return;
  }

  cleanupSharePeer();
  setOpponentReceiveStatus("Connecting to opponent…");

  const chunks = [];
  let expectedChunks = 0;

  const peer = new Peer(undefined, {debug:1});
  state.sharePeer = peer;

  peer.on("open", () => {
    const conn = peer.connect(peerId, {
      reliable:true,
      metadata:{key}
    });

    state.shareConnection = conn;

    conn.on("open", () => {
      setOpponentReceiveStatus("Connected. Receiving list…");
      conn.send({type:"tv-share-hello", key});
    });

    conn.on("data", message => {
      if (!message?.type) return;

      if (message.type === "tv-share-manifest") {
        expectedChunks = Number(message.chunks || 0);
        chunks.length = expectedChunks;
        setOpponentReceiveStatus("Receiving " + (message.name || "opponent list") + "…");
        return;
      }

      if (message.type === "tv-share-chunk") {
        chunks[Number(message.index)] = String(message.data || "");
        return;
      }

      if (message.type === "tv-share-complete") {
        try {
          if (!expectedChunks || chunks.some(chunk => typeof chunk !== "string")) {
            throw new Error("The transfer was incomplete.");
          }

          const pack = JSON.parse(chunks.join(""));
          importSharedRosterPackage(pack);

          const url = new URL(location.href);
          url.searchParams.delete("tvshare");
          url.searchParams.delete("key");
          history.replaceState({}, "", url.pathname + url.search + url.hash);
        } catch (error) {
          console.error(error);
          setOpponentReceiveStatus(error.message || "Could not import opponent list.", "bad");
        }
      }
    });

    conn.on("error", error => {
      console.error("Opponent share connection error", error);
      setOpponentReceiveStatus("Could not receive the opponent list.", "bad");
    });
  });

  peer.on("error", error => {
    console.error("Opponent share peer error", error);
    setOpponentReceiveStatus("Could not connect. Ask them to create a fresh QR.", "bad");
  });
}

function connectOpponentShareLink(value) {
  const parsed = parseOpponentShareLink(value);
  if (!parsed) {
    setOpponentReceiveStatus("That is not a Tabletop Voice share QR/link.", "bad");
    return;
  }

  stopShareScanner();
  connectOpponentShare(parsed.peerId, parsed.key);
}

async function startOpponentQrScanner() {
  if (typeof Html5Qrcode === "undefined") {
    toast("QR scanner did not load. You can still paste the share link below.");
    return;
  }

  await stopShareScanner();
  els.opponentQrScanner?.classList.remove("hidden");

  const scanner = new Html5Qrcode("opponentQrScanner");
  state.shareScanner = scanner;

  try {
    await scanner.start(
      {facingMode:"environment"},
      {fps:10, qrbox:{width:230,height:230}},
      decodedText => {
        stopShareScanner();
        if (els.opponentShareLink) els.opponentShareLink.value = decodedText;
        connectOpponentShareLink(decodedText);
      },
      () => {}
    );
  } catch (error) {
    console.error("QR scanner error", error);
    setOpponentReceiveStatus("Camera scanner could not start. Paste the share link instead.", "bad");
    await stopShareScanner();
  }
}

function handleShareUrlOnBoot() {
  const url = new URL(location.href);
  const peerId = url.searchParams.get("tvshare");
  const key = url.searchParams.get("key");
  if (!peerId || !key) return;

  // Remove one-time connection details from the address bar/history before
  // making any network connection. The values remain only in memory.
  url.searchParams.delete("tvshare");
  url.searchParams.delete("key");
  history.replaceState(history.state || {}, "", url.pathname + url.search + url.hash);

  switchPage("share", {silent:true});
  connectOpponentShare(peerId, key);
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
    state.referenceData = JSON.parse(localStorage.getItem(CORE_REFERENCE_STORAGE_KEY) || '{"rules":[],"stratagems":[]}');
    if (!state.referenceData || !Array.isArray(state.referenceData.rules)) {
      state.referenceData = {rules:[], stratagems:[]};
    }

    state.rosters = JSON.parse(localStorage.getItem("tv_rosters") || "[]");
    state.rosters.forEach(roster => {
      if (roster.source === "opr") {
        const migratedOprKey = oprGameSystemKey(roster.gameSystem);
        if (migratedOprKey) roster.gameSystemKey = migratedOprKey;
        (roster.units || []).forEach(unit => {
          if (unit?.system === "opr" && migratedOprKey) unit.gameSystemKey = migratedOprKey;
        });
      }

      if (roster.source === "new-recruit" && Array.isArray(roster.units)) {
        roster.units.forEach(unit => {
          if (unit.system) return;
          const detected = inferUnitGameSystem(unit);
          unit.system = detected === "grimdark" ? "opr" : detected;
        });
      }

      if (
        roster.source === "new-recruit" &&
        roster.gameSystemKey === "grimdark"
      ) {
        const metadata = normalize([
          roster.gameSystemName,
          roster.gameSystem,
          roster.name,
          roster.faction
        ].filter(Boolean).join(" "));

        if (metadata.includes("grimdark future star quest")) roster.gameSystemKey = "opr-star-quest";
        else if (metadata.includes("grimdark future firefight")) roster.gameSystemKey = "grimdark-firefight";
        else if (metadata.includes("age of fantasy quest")) roster.gameSystemKey = "aof-quest";
        else if (metadata.includes("age of fantasy regiments")) roster.gameSystemKey = "aof-regiments";
        else if (metadata.includes("age of fantasy skirmish")) roster.gameSystemKey = "aof-skirmish";
        else if (metadata.includes("age of fantasy")) roster.gameSystemKey = "aof";
      }

      if (!roster.gameSystemKey) roster.gameSystemKey = inferRosterGameSystem(roster);

      if (roster.source === "new-recruit" && isOprMode(roster.gameSystemKey)) {
        (roster.units || []).forEach(unit => {
          if (unit?.system === "opr") unit.gameSystemKey = roster.gameSystemKey;
        });
      }

      if (
        roster.source === "new-recruit" &&
        roster.gameSystemKey === "40k" &&
        Array.isArray(roster.units)
      ) {
        resolveRosterAttachments(roster.units);
      }
    });
    state.activeRoster = Math.min(Number(localStorage.getItem("tv_activeRoster") || 0), Math.max(0, state.rosters.length - 1));
    ensureActiveRosterForGame();
  } catch {
    state.rosters = [];
  }
}

function clearRosters() {
  if (!confirm("Remove all loaded roster, army and core-rule reference data from this device?")) return;
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
  localStorage.removeItem(CORE_REFERENCE_STORAGE_KEY);
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith("tv_dnd_state_")) localStorage.removeItem(key);
  }
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
