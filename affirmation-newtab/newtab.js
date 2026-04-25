const STORAGE_KEY   = "affirm_v2";
const RING_CIRC     = 87.96;
const DEFAULT_HABITS = ["Drink 8 glasses of water","Move for 20 minutes","Read for 15 minutes","",""];
const THEMES        = ["ocean","forest","cosmic","ember","roseNoir","charcoal","parchment","lavender","golden","steel"];
const DARK_THEMES   = new Set(["ocean","forest","cosmic","ember","roseNoir","charcoal"]);

const CATEGORY_COLORS = {
  "Confidence": { bg:"#E1F3FE", text:"#1F6C9F" },
  "Growth":     { bg:"#EDF3EC", text:"#346538" },
  "Self-Worth": { bg:"#FDEBEC", text:"#9F2F2D" },
  "Resilience": { bg:"#FBF3DB", text:"#956400" },
  "Focus":      { bg:"#E1F3FE", text:"#1F4C8F" },
  "Peace":      { bg:"#EDF3EC", text:"#2A5C30" },
  "Vision":     { bg:"#F0EEFE", text:"#5B47C5" },
  "Purpose":    { bg:"#FBF3DB", text:"#7A5000" },
  "Abundance":  { bg:"#EDF3EC", text:"#346538" },
  "Custom":     { bg:"#F7F6F3", text:"#787774" },
};

function getPillStyle(category, theme) {
  if (DARK_THEMES.has(theme)) {
    return { bg: 'var(--accent-bg)', text: 'var(--accent)' };
  }
  return CATEGORY_COLORS[category] || CATEGORY_COLORS["Custom"];
}

// ── Storage ──────────────────────────────────
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function getData() {
  try {
    const d = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    return {
      habits:             d.habits             ?? DEFAULT_HABITS,
      checks:             d.checks             ?? {},
      streak:             d.streak             ?? 0,
      lastActiveDay:      d.lastActiveDay       ?? null,
      affirmationOffset:  d.affirmationOffset   ?? 0,
      theme:              d.theme               ?? "ocean",
      sound:              d.sound               ?? "none",
      customAffirmations: d.customAffirmations  ?? [],
      deletedBuiltinIdx:  d.deletedBuiltinIdx   ?? [],
    };
  } catch { return { habits: DEFAULT_HABITS, checks: {}, streak: 0, lastActiveDay: null, affirmationOffset: 0, theme: "ocean", sound: "none", customAffirmations: [], deletedBuiltinIdx: [] }; }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ── Affirmations ─────────────────────────────
function getActiveAffirmations(data) {
  const builtin = AFFIRMATIONS.filter((_, i) => !data.deletedBuiltinIdx.includes(i));
  const custom  = (data.customAffirmations || []).map(t => ({ text: t, category: "Custom" }));
  return [...builtin, ...custom];
}

function getCurrentAffirmation(data) {
  const list = getActiveAffirmations(data);
  if (!list.length) return { text: "Add your first affirmation in settings.", category: "Custom" };
  const idx = (Math.floor(Date.now() / 86400000) + (data.affirmationOffset || 0)) % list.length;
  return list[idx];
}

function renderAffirmation(data) {
  const item    = getCurrentAffirmation(data);
  const el      = document.getElementById("affirmation");
  const pill    = document.getElementById("category-pill");
  const counter = document.getElementById("affirmation-counter");
  const total   = getActiveAffirmations(data).length;
  const idx     = (Math.floor(Date.now() / 86400000) + (data.affirmationOffset || 0)) % (total || 1);

  el.textContent        = item.text;
  pill.textContent      = item.category;
  counter.textContent   = total ? `${idx + 1} / ${total}` : "";

  const col = getPillStyle(item.category, data.theme);
  pill.style.background = col.bg;
  pill.style.color      = col.text;
}

function animateAffirmation(data) {
  const el = document.getElementById("affirmation");
  el.style.transition = "none";
  el.style.opacity    = "0";
  el.style.transform  = "translateY(8px)";
  requestAnimationFrame(() => {
    renderAffirmation(data);
    requestAnimationFrame(() => {
      el.style.transition = "opacity 0.35s ease, transform 0.35s ease";
      el.style.opacity    = "1";
      el.style.transform  = "translateY(0)";
    });
  });
}

// ── Clock ─────────────────────────────────────
function renderClock() {
  const now = new Date();
  document.getElementById("time").textContent =
    `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
  const days   = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  document.getElementById("date").textContent =
    `${days[now.getDay()]} — ${months[now.getMonth()]} ${now.getDate()}`;
}

// ── Habits ────────────────────────────────────
function updateStreak(data) {
  const today = todayKey();
  if (data.lastActiveDay === today) return;
  const d = new Date(); d.setDate(d.getDate() - 1);
  const yesterday = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  data.streak = data.lastActiveDay === yesterday ? (data.streak || 0) + 1 : 1;
  data.lastActiveDay = today;
}

function renderProgress(checked, total) {
  const offset = total === 0 ? RING_CIRC : RING_CIRC * (1 - checked / total);
  document.getElementById("progress-ring").style.strokeDashoffset = offset;
  document.getElementById("progress-label").textContent = checked;
}

function renderHabits(data) {
  const today   = todayKey();
  const checks  = data.checks[today] || {};
  const list    = document.getElementById("habits-list");
  list.innerHTML = "";

  const active = data.habits.filter(h => h.trim());
  let checkedCount = 0;

  data.habits.forEach((habit, i) => {
    if (!habit.trim()) return;
    const checked = !!checks[i];
    if (checked) checkedCount++;
    const li = document.createElement("li");
    li.innerHTML = `
      <label class="habit-label ${checked ? "checked" : ""}">
        <input type="checkbox" class="habit-check" data-index="${i}" ${checked ? "checked" : ""} />
        <span class="habit-check-box">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </span>
        <span class="habit-text">${habit}</span>
      </label>`;
    list.appendChild(li);
  });

  renderProgress(checkedCount, active.length);

  list.querySelectorAll(".habit-check").forEach(cb => {
    cb.addEventListener("change", e => {
      const idx   = parseInt(e.target.dataset.index, 10);
      const data  = getData();
      const today = todayKey();
      if (!data.checks[today]) data.checks[today] = {};
      data.checks[today][idx] = e.target.checked;
      const done = Object.values(data.checks[today]).filter(Boolean).length;
      if (done >= data.habits.filter(h => h.trim()).length) updateStreak(data);
      saveData(data);
      renderHabits(data);
      renderStreak(data);
    });
  });
}

function renderStreak(data) {
  document.getElementById("streak-count").textContent = data.streak || 0;
}

// ── Theme ─────────────────────────────────────
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document.querySelectorAll(".theme-swatch").forEach(btn =>
    btn.classList.toggle("active", btn.dataset.theme === theme));
}

// ── Sound ─────────────────────────────────────
let audioCtx = null, gainNode = null, nodesChain = [];

function stopSound() {
  const chainToStop = [...nodesChain];   // snapshot — don't capture by reference
  nodesChain = [];
  if (gainNode) gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.4);
  setTimeout(() => {
    chainToStop.forEach(n => { try { n.stop?.(); n.disconnect(); } catch {} });
  }, 900);
}

function startSound(type) {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === "suspended") audioCtx.resume();

  const master = audioCtx.createGain();
  master.gain.setValueAtTime(0, audioCtx.currentTime);
  master.connect(audioCtx.destination);
  gainNode = master;
  nodesChain = [master];

  if (type === "brown" || type === "rain") {
    const buf  = audioCtx.createBuffer(1, audioCtx.sampleRate * 4, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      const w = Math.random() * 2 - 1;
      data[i] = (last + 0.02 * w) / 1.02;
      last = data[i];
      data[i] *= 3.5;
    }
    const src = audioCtx.createBufferSource();
    src.buffer = buf; src.loop = true;
    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = type === "rain" ? 700 : 200;
    src.connect(filter); filter.connect(master);
    src.start();
    master.gain.setTargetAtTime(type === "rain" ? 0.14 : 0.08, audioCtx.currentTime, 0.8);
    nodesChain.push(src, filter);
  } else if (type === "tone") {
    [55, 110, 165].forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const g   = audioCtx.createGain();
      osc.type = "sine"; osc.frequency.value = freq;
      g.gain.value = 0.4 / (i + 1);
      osc.connect(g); g.connect(master); osc.start();
      nodesChain.push(osc, g);
    });
    master.gain.setTargetAtTime(0.2, audioCtx.currentTime, 1.2);
  }
}

function applySound(type) {
  if (nodesChain.length) stopSound();
  document.querySelectorAll(".sound-opt").forEach(b =>
    b.classList.toggle("active", b.dataset.sound === type));
  const on  = document.getElementById("sound-on-icon");
  const off = document.getElementById("sound-off-icon");
  const btn = document.getElementById("sound-btn");
  if (type !== "none") {
    startSound(type);
    on.style.display = "block"; off.style.display = "none";
    btn.classList.add("active");
  } else {
    on.style.display = "none"; off.style.display = "block";
    btn.classList.remove("active");
  }
}

// ── Affirmation manager ───────────────────────
function renderAffirmList(data) {
  const container = document.getElementById("affirm-list");
  container.innerHTML = "";

  AFFIRMATIONS.forEach((item, i) => {
    if (data.deletedBuiltinIdx.includes(i)) return;
    const col = getPillStyle(item.category, data.theme);
    const div = document.createElement("div");
    div.className = "affirm-item";
    div.innerHTML = `
      <span class="affirm-item-pill" style="background:${col.bg};color:${col.text}">${item.category}</span>
      <span class="affirm-item-text">${item.text}</span>
      <button class="affirm-item-del" data-builtin="${i}" title="Hide">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>`;
    container.appendChild(div);
  });

  (data.customAffirmations || []).forEach((text, i) => {
    const div = document.createElement("div");
    div.className = "affirm-item custom";
    div.innerHTML = `
      <span class="affirm-item-pill" style="background:#F7F6F3;color:#787774">Custom</span>
      <span class="affirm-item-text">${text}</span>
      <button class="affirm-item-del" data-custom="${i}" title="Delete">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>`;
    container.appendChild(div);
  });

  container.querySelectorAll("[data-builtin]").forEach(btn => {
    btn.addEventListener("click", () => {
      const data = getData();
      const idx  = parseInt(btn.dataset.builtin, 10);
      if (!data.deletedBuiltinIdx.includes(idx)) data.deletedBuiltinIdx.push(idx);
      saveData(data); renderAffirmList(data); renderAffirmation(data);
    });
  });
  container.querySelectorAll("[data-custom]").forEach(btn => {
    btn.addEventListener("click", () => {
      const data = getData();
      data.customAffirmations.splice(parseInt(btn.dataset.custom, 10), 1);
      saveData(data); renderAffirmList(data); renderAffirmation(data);
    });
  });
}

// ── Init ──────────────────────────────────────
function init() {
  const data = getData();
  saveData(data);

  applyTheme(data.theme);

  const isSound = data.sound && data.sound !== "none";
  document.getElementById("sound-on-icon").style.display = isSound ? "block" : "none";
  document.getElementById("sound-off-icon").style.display = isSound ? "none" : "block";
  if (isSound) document.getElementById("sound-btn").classList.add("active");
  document.querySelectorAll(".sound-opt").forEach(b =>
    b.classList.toggle("active", b.dataset.sound === data.sound));

  renderClock();
  setInterval(renderClock, 10000);
  renderAffirmation(data);
  renderHabits(data);
  renderStreak(data);

  // Shuffle affirmation
  document.getElementById("refresh-btn").addEventListener("click", () => {
    const data = getData();
    data.affirmationOffset = (data.affirmationOffset || 0) + 1;
    saveData(data); animateAffirmation(data);
  });

  // Sound quick-toggle
  document.getElementById("sound-btn").addEventListener("click", () => {
    const data   = getData();
    data.sound   = data.sound === "none" ? "brown" : "none";
    saveData(data); applySound(data.sound);
  });

  // Settings drawer
  document.getElementById("settings-btn").addEventListener("click", () =>
    document.getElementById("settings-drawer").classList.remove("hidden"));
  document.getElementById("close-drawer").addEventListener("click", () =>
    document.getElementById("settings-drawer").classList.add("hidden"));

  // Theme swatches
  document.querySelectorAll(".theme-swatch").forEach(btn => {
    btn.addEventListener("click", () => {
      const data = getData();
      data.theme = btn.dataset.theme;
      saveData(data);
      applyTheme(data.theme);
      renderAffirmation(data);
    });
  });

  // Sound options
  document.querySelectorAll(".sound-opt").forEach(btn => {
    btn.addEventListener("click", () => {
      const data = getData();
      data.sound = btn.dataset.sound;
      saveData(data); applySound(data.sound);
    });
  });

  // Open affirmation manager
  document.getElementById("manage-affirmations-btn").addEventListener("click", () => {
    document.getElementById("settings-drawer").classList.add("hidden");
    renderAffirmList(getData());
    document.getElementById("affirm-modal").classList.remove("hidden");
    document.getElementById("new-affirm-input").focus();
  });

  // Affirmation modal close
  document.getElementById("affirm-modal-close").addEventListener("click", () =>
    document.getElementById("affirm-modal").classList.add("hidden"));

  // Add custom affirmation
  document.getElementById("add-affirm-btn").addEventListener("click", () => {
    const input = document.getElementById("new-affirm-input");
    const text  = input.value.trim();
    if (!text) return;
    const data  = getData();
    data.customAffirmations.push(text);
    saveData(data); input.value = "";
    renderAffirmList(data); renderAffirmation(data);
  });
  document.getElementById("new-affirm-input").addEventListener("keydown", e => {
    if (e.key === "Enter") document.getElementById("add-affirm-btn").click();
  });

  // Habit editor
  document.getElementById("edit-habits-btn").addEventListener("click", () => {
    const data      = getData();
    const container = document.getElementById("habit-inputs");
    container.innerHTML = "";
    for (let i = 0; i < 5; i++) {
      const div = document.createElement("div");
      div.className = "habit-input-row";
      div.innerHTML = `
        <span class="habit-input-num">${i + 1}</span>
        <input class="habit-input" type="text" maxlength="52"
          placeholder="e.g. Meditate for 10 minutes"
          value="${(data.habits[i]||"").replace(/"/g,"&quot;")}" data-index="${i}" />`;
      container.appendChild(div);
    }
    document.getElementById("modal").classList.remove("hidden");
    container.querySelector("input")?.focus();
  });

  document.getElementById("modal-cancel").addEventListener("click", () =>
    document.getElementById("modal").classList.add("hidden"));

  document.getElementById("modal-save").addEventListener("click", () => {
    const data = getData();
    document.querySelectorAll("#habit-inputs .habit-input").forEach(inp =>
      data.habits[parseInt(inp.dataset.index, 10)] = inp.value.trim());
    saveData(data); renderHabits(data);
    document.getElementById("modal").classList.add("hidden");
  });

  // Close on backdrop / Escape
  ["modal","affirm-modal"].forEach(id => {
    document.getElementById(id).addEventListener("click", e => {
      if (e.target.id === id) document.getElementById(id).classList.add("hidden");
    });
  });
  document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    ["modal","affirm-modal"].forEach(id =>
      document.getElementById(id).classList.add("hidden"));
    document.getElementById("settings-drawer").classList.add("hidden");
  });
}

document.addEventListener("DOMContentLoaded", init);
