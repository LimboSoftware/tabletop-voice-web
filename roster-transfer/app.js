const $ = id => document.getElementById(id);

const els = {
  senderView: $("senderView"),
  receiverView: $("receiverView"),
  fileInput: $("fileInput"),
  dropZone: $("dropZone"),
  fileList: $("fileList"),
  createTransfer: $("createTransfer"),
  resetTransfer: $("resetTransfer"),
  qrPanel: $("qrPanel"),
  qrCode: $("qrCode"),
  shareLink: $("shareLink"),
  copyLink: $("copyLink"),
  senderStatus: $("senderStatus"),
  senderDetail: $("senderDetail"),
  senderStatusDot: $("senderStatusDot"),
  receiveConnecting: $("receiveConnecting"),
  receiveComplete: $("receiveComplete"),
  receiverStatus: $("receiverStatus"),
  receiverDetail: $("receiverDetail"),
  receiverStatusDot: $("receiverStatusDot"),
  receiveProgress: $("receiveProgress"),
  receivedFiles: $("receivedFiles"),
  shareAll: $("shareAll"),
  receiveError: $("receiveError"),
  receiveErrorText: $("receiveErrorText"),
  toast: $("toast")
};

const state = {
  files: [],
  peer: null,
  secret: null,
  activeConnection: null,
  received: [],
  receivedFiles: []
};

function toast(message) {
  els.toast.textContent = message;
  els.toast.classList.remove("hidden");
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => els.toast.classList.add("hidden"), 2500);
}

function bytesLabel(bytes) {
  if (!Number.isFinite(bytes)) return "";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

function randomSecret() {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
}

function fileExtension(name = "") {
  const match = String(name).toLowerCase().match(/\.([^.]+)$/);
  return match ? match[1] : "";
}

function mimeForFormat(format) {
  return {
    json:"application/json",
    ros:"application/xml",
    rosz:"application/zip",
    txt:"text/plain"
  }[format] || "application/octet-stream";
}

function bytesToBase64(bytes) {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function parseJsonSummary(text, fileName) {
  let raw;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error(fileName + " is not valid JSON.");
  }

  if (!raw?.roster) {
    throw new Error(fileName + " does not look like a New Recruit JSON export.");
  }

  const roster = raw.roster;
  const pts = (roster.costs || []).find(cost => String(cost.name || "").toLowerCase() === "pts")?.value;
  const faction = (roster.forces || [])[0]?.catalogueName || (roster.forces || [])[0]?.name || "";

  return {
    rosterName:roster.name || fileName.replace(/\.[^.]+$/, ""),
    faction,
    points:pts ?? null
  };
}

function parseRosSummary(text, fileName) {
  const doc = new DOMParser().parseFromString(String(text || ""), "application/xml");
  if (doc.querySelector("parsererror")) throw new Error(fileName + " could not be read as ROS XML.");

  const roster = doc.documentElement?.localName === "roster"
    ? doc.documentElement
    : doc.querySelector("roster");

  if (!roster) throw new Error(fileName + " does not look like a New Recruit ROS export.");

  const pts = [...roster.querySelectorAll(":scope > costs > cost")]
    .find(cost => String(cost.getAttribute("name") || "").toLowerCase() === "pts")
    ?.getAttribute("value");

  const force = roster.querySelector(":scope > forces > force");

  return {
    rosterName:roster.getAttribute("name") || fileName.replace(/\.[^.]+$/, ""),
    faction:force?.getAttribute("catalogueName") || force?.getAttribute("name") || "",
    points:pts ?? null
  };
}

function parseTxtSummary(text, fileName) {
  const lines = String(text || "").replace(/\r/g, "").split("\n").map(line => line.trim());
  const first = lines.find(Boolean) || "";
  const match = first.match(/^(.+?)\s+\(([\d,]+)\s+Points?\)$/i);
  if (!match) throw new Error(fileName + " does not look like a New Recruit TXT export.");

  const content = lines.filter(Boolean);
  const detachmentIndex = content.findIndex(line => /\(\d+\s+Detachment Points?\)$/i.test(line));
  const faction =
    (detachmentIndex > 0 ? content[detachmentIndex - 1] : "") ||
    content[2] ||
    content[1] ||
    "";

  return {
    rosterName:match[1].trim(),
    faction,
    points:Number(match[2].replace(/,/g, ""))
  };
}

async function readTransferFile(file) {
  const format = fileExtension(file.name);
  if (!["json","ros","rosz","txt"].includes(format)) {
    throw new Error(file.name + " is not a supported New Recruit export.");
  }

  if (format === "rosz") {
    if (typeof fflate === "undefined") {
      throw new Error("ROSZ support could not load. Check your connection and refresh.");
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const archive = fflate.unzipSync(bytes);
    const entryName = Object.keys(archive).find(name => /\.ros$/i.test(name));
    if (!entryName) throw new Error(file.name + " does not contain a .ros roster.");

    const rosText = fflate.strFromU8(archive[entryName]);
    const summary = parseRosSummary(rosText, file.name);

    return {
      name:file.name,
      payload:bytesToBase64(bytes),
      encoding:"base64",
      mime:mimeForFormat(format),
      format,
      size:file.size,
      ...summary
    };
  }

  const text = await file.text();
  const summary =
    format === "json" ? parseJsonSummary(text, file.name) :
    format === "ros" ? parseRosSummary(text, file.name) :
    parseTxtSummary(text, file.name);

  return {
    name:file.name,
    payload:text,
    encoding:"text",
    mime:mimeForFormat(format),
    format,
    size:file.size,
    ...summary
  };
}

async function addFiles(fileList) {
  const incoming = [...fileList].filter(file =>
    ["json","ros","rosz","txt"].includes(fileExtension(file.name))
  );

  if (!incoming.length) {
    toast("Choose New Recruit JSON, ROS, ROSZ or TXT files.");
    return;
  }

  const parsed = [];
  for (const file of incoming) {
    try {
      parsed.push(await readTransferFile(file));
    } catch (error) {
      toast(error.message);
    }
  }

  if (!parsed.length) return;

  const byName = new Map(state.files.map(file => [file.name, file]));
  parsed.forEach(file => byName.set(file.name, file));
  state.files = [...byName.values()];
  renderSelectedFiles();
}

function renderSelectedFiles() {
  els.fileList.classList.toggle("hidden", !state.files.length);
  els.createTransfer.disabled = !state.files.length;

  els.fileList.innerHTML = state.files.map(file => {
    const meta = [
      file.faction,
      file.points != null ? file.points + " pts" : "",
      bytesLabel(file.size)
    ].filter(Boolean).join(" · ");

    return `
      <div class="file-card">
        <div>
          <strong>${escapeHtml(file.rosterName)}</strong>
          <small>${escapeHtml(meta || file.name)}</small>
        </div>
        <span class="file-badge">${escapeHtml(String(file.format || "").toUpperCase())}</span>
      </div>`;
  }).join("");
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setSenderStatus(kind, title, detail) {
  els.senderStatus.textContent = title;
  els.senderDetail.textContent = detail || "";
  els.senderStatusDot.className = "status-dot " + kind;
}

function setReceiverStatus(kind, title, detail) {
  els.receiverStatus.textContent = title;
  els.receiverDetail.textContent = detail || "";
  els.receiverStatusDot.className = "status-dot " + kind;
}

function cleanupPeer() {
  try { state.activeConnection?.close(); } catch {}
  try { state.peer?.destroy(); } catch {}
  state.activeConnection = null;
  state.peer = null;
}

function resetSender() {
  cleanupPeer();
  state.secret = null;
  els.qrPanel.classList.add("hidden");
  els.resetTransfer.classList.add("hidden");
  els.createTransfer.classList.remove("hidden");
  els.createTransfer.disabled = !state.files.length;
  els.qrCode.innerHTML = "";
  els.shareLink.value = "";
  setSenderStatus("waiting", "Waiting for your phone", "Scan the QR code below.");
}

async function createTransfer() {
  if (!state.files.length) return;
  if (typeof Peer === "undefined" || typeof QRCode === "undefined") {
    toast("Transfer libraries did not load. Check your internet connection.");
    return;
  }

  cleanupPeer();
  state.secret = randomSecret();
  els.createTransfer.disabled = true;
  els.createTransfer.textContent = "Starting…";
  setSenderStatus("waiting", "Creating transfer", "Connecting to the signalling service…");

  const peer = new Peer(undefined, {debug: 1});
  state.peer = peer;

  peer.on("open", id => {
    const url = new URL(location.href);
    url.search = "";
    url.hash = "";
    url.searchParams.set("receive", id);
    url.searchParams.set("key", state.secret);

    els.shareLink.value = url.toString();
    els.qrCode.innerHTML = "";
    new QRCode(els.qrCode, {
      text: url.toString(),
      width: 250,
      height: 250,
      correctLevel: QRCode.CorrectLevel.M
    });

    els.qrPanel.classList.remove("hidden");
    els.createTransfer.classList.add("hidden");
    els.resetTransfer.classList.remove("hidden");
    setSenderStatus("live", "Waiting for your phone", "Scan the QR code with your phone camera.");
  });

  peer.on("connection", conn => {
    if (conn.metadata?.key !== state.secret) {
      conn.close();
      return;
    }

    state.activeConnection = conn;
    setSenderStatus("live", "Phone found", "Opening the secure browser-to-browser connection…");

    conn.on("open", () => {
      setSenderStatus("live", "Phone connected", "Preparing your roster files…");
    });

    conn.on("data", async message => {
      if (message?.type === "hello" && message.key === state.secret) {
        try {
          await sendFiles(conn);
        } catch (error) {
          console.error(error);
          setSenderStatus("bad", "Transfer failed", error.message || "The connection closed.");
        }
      }
    });

    conn.on("close", () => {
      if (!els.senderStatusDot.classList.contains("good")) {
        setSenderStatus("waiting", "Phone disconnected", "Scan the QR again to reconnect.");
      }
    });

    conn.on("error", error => {
      console.error(error);
      setSenderStatus("bad", "Connection error", "Try scanning the QR again.");
    });
  });

  peer.on("error", error => {
    console.error(error);
    setSenderStatus("bad", "Couldn’t start transfer", "Refresh the page and try again.");
    els.createTransfer.disabled = false;
    els.createTransfer.textContent = "Create transfer QR";
  });
}

async function sendFiles(conn) {
  const chunkSize = 24_000;
  const manifest = state.files.map(file => ({
    name: file.name,
    rosterName: file.rosterName,
    faction: file.faction,
    points: file.points,
    size: file.size,
    chunks: Math.ceil(file.text.length / chunkSize)
  }));

  conn.send({
    type: "manifest",
    key: state.secret,
    files: manifest
  });

  const totalChunks = manifest.reduce((sum, file) => sum + file.chunks, 0);
  let sentChunks = 0;

  for (let fileIndex = 0; fileIndex < state.files.length; fileIndex++) {
    const file = state.files[fileIndex];
    const chunks = manifest[fileIndex].chunks;

    for (let chunkIndex = 0; chunkIndex < chunks; chunkIndex++) {
      if (!conn.open) throw new Error("The phone connection closed.");

      const start = chunkIndex * chunkSize;
      conn.send({
        type: "chunk",
        fileIndex,
        chunkIndex,
        data: file.text.slice(start, start + chunkSize)
      });

      sentChunks++;
      const percent = Math.round((sentChunks / totalChunks) * 100);
      setSenderStatus(
        "live",
        "Sending " + file.rosterName,
        percent + "% complete"
      );

      if (chunkIndex % 8 === 0) await sleep(8);
    }

    conn.send({type: "file-complete", fileIndex});
  }

  conn.send({type: "complete"});
  setSenderStatus("good", "Transfer complete", state.files.length + (state.files.length === 1 ? " list sent." : " lists sent."));
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getReceiveParams() {
  const params = new URLSearchParams(location.search);
  return {
    peerId: params.get("receive"),
    key: params.get("key")
  };
}

function startReceiver(peerId, key) {
  els.senderView.classList.add("hidden");
  els.receiverView.classList.remove("hidden");

  if (!peerId || !key) {
    showReceiveError("This transfer link is incomplete. Scan the QR code again.");
    return;
  }

  if (typeof Peer === "undefined") {
    showReceiveError("The transfer library did not load. Check your internet connection and refresh.");
    return;
  }

  setReceiverStatus("waiting", "Starting secure transfer", "Keep the QR page open on your PC.");

  const peer = new Peer(undefined, {debug: 1});
  state.peer = peer;

  peer.on("open", () => {
    setReceiverStatus("live", "Finding your PC", "Opening the peer-to-peer connection…");

    const conn = peer.connect(peerId, {
      reliable: true,
      metadata: {key}
    });

    state.activeConnection = conn;

    conn.on("open", () => {
      setReceiverStatus("live", "Connected to your PC", "Requesting roster files…");
      conn.send({type: "hello", key});
    });

    conn.on("data", handleIncomingData);

    conn.on("close", () => {
      if (!els.receiveComplete.classList.contains("hidden")) return;
      showReceiveError("The connection closed before all files arrived. Scan the QR again.");
    });

    conn.on("error", error => {
      console.error(error);
      showReceiveError("The phone could not connect to the PC. Keep both pages open and try scanning the QR again.");
    });
  });

  peer.on("error", error => {
    console.error(error);
    showReceiveError("Couldn’t connect to the transfer. The QR may have expired; create a new one on the PC.");
  });
}

function handleIncomingData(message) {
  if (!message?.type) return;

  if (message.type === "manifest") {
    state.received = message.files.map(meta => ({
      meta,
      chunks: new Array(meta.chunks),
      received: 0
    }));

    const count = state.received.length;
    setReceiverStatus("live", "Receiving " + count + (count === 1 ? " list" : " lists"), "Keep this page open until the transfer finishes.");
    els.receiveProgress.style.width = "0%";
    return;
  }

  if (message.type === "chunk") {
    const file = state.received[message.fileIndex];
    if (!file || file.chunks[message.chunkIndex] !== undefined) return;

    file.chunks[message.chunkIndex] = message.data;
    file.received++;

    const total = state.received.reduce((sum, item) => sum + item.meta.chunks, 0);
    const done = state.received.reduce((sum, item) => sum + item.received, 0);
    const percent = total ? Math.round((done / total) * 100) : 0;

    els.receiveProgress.style.width = percent + "%";
    setReceiverStatus("live", "Receiving roster files", percent + "% complete");
    return;
  }

  if (message.type === "complete") {
    finishReceive();
  }
}

function finishReceive() {
  try {
    state.receivedFiles = state.received.map(item => {
      if (item.chunks.some(chunk => chunk === undefined)) {
        throw new Error("A file was incomplete.");
      }

      const text = item.chunks.join("");
      parseRosterSummary(text, item.meta.name);

      return {
        ...item.meta,
        text,
        file: new File([text], item.meta.name, {type: "application/json"})
      };
    });
  } catch (error) {
    showReceiveError(error.message || "A received file was incomplete.");
    return;
  }

  els.receiveProgress.style.width = "100%";
  setReceiverStatus("good", "Transfer complete", "Your JSON files are ready.");
  els.receiveConnecting.classList.add("hidden");
  els.receiveComplete.classList.remove("hidden");

  renderReceivedFiles();
}

function renderReceivedFiles() {
  els.receivedFiles.innerHTML = "";

  state.receivedFiles.forEach((item, index) => {
    const url = URL.createObjectURL(item.file);
    const meta = [
      item.faction,
      item.points != null ? item.points + " pts" : "",
      bytesLabel(item.size)
    ].filter(Boolean).join(" · ");

    const card = document.createElement("div");
    card.className = "received-card";
    card.innerHTML = `
      <div>
        <strong>${escapeHtml(item.rosterName || item.name)}</strong>
        <small>${escapeHtml(meta || item.name)}</small>
      </div>
      <a class="secondary button-link compact" download="${escapeHtml(item.name)}" href="${url}">Save JSON</a>`;

    els.receivedFiles.appendChild(card);
  });

  const canShareFiles = !!navigator.share &&
    (!navigator.canShare || navigator.canShare({files: state.receivedFiles.map(item => item.file)}));

  els.shareAll.classList.toggle("hidden", !canShareFiles);
}

async function shareAllFiles() {
  if (!state.receivedFiles.length || !navigator.share) return;

  try {
    await navigator.share({
      files: state.receivedFiles.map(item => item.file),
      title: "New Recruit rosters",
      text: "Save these JSON files, then import them into Tabletop Voice."
    });
  } catch (error) {
    if (error?.name !== "AbortError") toast("Couldn’t open the share sheet.");
  }
}

function showReceiveError(message) {
  els.receiveConnecting.classList.add("hidden");
  els.receiveComplete.classList.add("hidden");
  els.receiveError.classList.remove("hidden");
  els.receiveErrorText.textContent = message;
  setReceiverStatus("bad", "Transfer failed", message);
}

function boot() {
  const {peerId, key} = getReceiveParams();

  if (peerId) {
    startReceiver(peerId, key);
    return;
  }

  els.fileInput.addEventListener("change", () => addFiles(els.fileInput.files));
  els.dropZone.addEventListener("dragover", event => {
    event.preventDefault();
    els.dropZone.classList.add("drag");
  });
  els.dropZone.addEventListener("dragleave", () => els.dropZone.classList.remove("drag"));
  els.dropZone.addEventListener("drop", event => {
    event.preventDefault();
    els.dropZone.classList.remove("drag");
    addFiles(event.dataTransfer.files);
  });

  els.createTransfer.addEventListener("click", createTransfer);
  els.resetTransfer.addEventListener("click", resetSender);

  els.copyLink.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(els.shareLink.value);
      toast("Transfer link copied.");
    } catch {
      els.shareLink.select();
      document.execCommand("copy");
      toast("Transfer link copied.");
    }
  });

  els.shareAll.addEventListener("click", shareAllFiles);
}

window.addEventListener("beforeunload", cleanupPeer);
boot();
