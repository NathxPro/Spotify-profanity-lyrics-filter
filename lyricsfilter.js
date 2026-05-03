// ==Spicetify Extension==
// Name: Lyrics Filter
// Description: Blurs profanity in Spotify lyrics and Spicy Lyrics fullscreen.
//              Click blurred words to reveal. Adjust blur intensity in settings.
// Version: 3.0.0
// Author: You :)
// ==/Spicetify Extension==

(function lyricsFilter() {

  // ─── Config (saved to localStorage) ────────────────────────────────────────
  const STORAGE_KEY = "lyricsFilter_config";

  function loadConfig() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch { return {}; }
  }

  function saveConfig(cfg) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  }

  let config = { blurAmount: 8, ...loadConfig() };

  // ─── Profanity list ────────────────────────────────────────────────────────
  const PROFANITY = new Set([
    "shit","fuck","fucking","fucked","fucker","fucks","damn","ass","asshole","bitch","bitches",
    "bastard","crap","piss","cock","dick","pussy","cunt","motherfucker","motherfucking",
    "bullshit","goddamn","goddammit","hell","whore","slut","faggot","nigga","nigger",
    "jackass","dumbass","douchebag","ballsack","balls","dipshit","horseshit","shitty",
    "bloody","bollocks","wanker","tosser","twat","arse","arsehole","bugger","prick","knob",
    "bimbo","tramp","skank","hoe","boner","dildo","cum","jizz","tits","titties","boobs",
    "crotch","screw","screwed","screwing","fag","retard","spaz"
  ]);

  // ─── Styles ────────────────────────────────────────────────────────────────
  const styleEl = document.createElement("style");
  styleEl.id = "lyrics-filter-styles";
  document.head.appendChild(styleEl);

  function updateStyles() {
    styleEl.textContent = `
      .lf-blurred {
        filter: blur(${config.blurAmount}px) !important;
        cursor: pointer !important;
        user-select: none !important;
        transition: filter 0.2s ease !important;
      }
      .lf-blurred:hover {
        filter: blur(${Math.max(2, config.blurAmount * 0.5)}px) !important;
      }
      .lf-revealed {
        filter: none !important;
        cursor: pointer !important;
        color: #e25d5d !important;
      }
      /* Settings modal styles */
      .lf-settings {
        padding: 24px;
        color: var(--spice-text, #fff);
        font-family: var(--font-family, CircularSp, sans-serif);
        min-width: 300px;
      }
      .lf-settings h2 {
        margin: 0 0 20px;
        font-size: 20px;
        font-weight: 700;
      }
      .lf-settings label {
        display: block;
        font-size: 14px;
        margin-bottom: 8px;
        color: var(--spice-subtext, #b3b3b3);
      }
      .lf-settings .lf-row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 24px;
      }
      .lf-settings input[type=range] {
        flex: 1;
        accent-color: #1db954;
        cursor: pointer;
      }
      .lf-settings .lf-value {
        font-size: 14px;
        font-weight: 700;
        min-width: 40px;
        text-align: right;
        color: #1db954;
      }
      .lf-settings .lf-preview {
        display: inline-block;
        font-size: 18px;
        font-weight: 700;
        padding: 4px 8px;
        border-radius: 4px;
        background: rgba(255,255,255,0.08);
        margin-bottom: 20px;
        transition: filter 0.2s;
      }
      .lf-settings .lf-save {
        background: #1db954;
        color: #000;
        border: none;
        border-radius: 20px;
        padding: 10px 28px;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        width: 100%;
        transition: opacity 0.15s;
      }
      .lf-settings .lf-save:hover { opacity: 0.85; }
      .lf-settings .lf-section-title {
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: var(--spice-subtext, #b3b3b3);
        margin-bottom: 12px;
      }
    `;
  }
  updateStyles();

  // ─── Word processing ───────────────────────────────────────────────────────
  function isProfane(word) {
    const clean = word.replace(/^[^a-zA-Z]+|[^a-zA-Z]+$/g, "").toLowerCase();
    return PROFANITY.has(clean);
  }

  function toggleBlur(span) {
    span.classList.toggle("lf-blurred");
    span.classList.toggle("lf-revealed");
  }

  // Spicy Lyrics: each word is its own span.word
  function processSpicyLine(lineEl) {
    if (lineEl.dataset.lfProcessed) return;
    lineEl.dataset.lfProcessed = "1";
    lineEl.querySelectorAll("span.word").forEach(span => {
      if (isProfane(span.textContent)) {
        span.classList.add("lf-blurred");
        span.addEventListener("click", e => { e.stopPropagation(); toggleBlur(span); });
      }
    });
  }

  // Standard Spotify lyrics: whole line is one text node
  function processStandardLine(el) {
    if (el.dataset.lfProcessed) return;
    el.dataset.lfProcessed = "1";
    const original = el.textContent;
    if (!original.trim()) return;
    const escaped = [...PROFANITY].map(w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const regex = new RegExp(`\\b(${escaped.join("|")})\\b`, "gi");
    if (!regex.test(original)) return;
    const parts = original.split(new RegExp(`\\b(${escaped.join("|")})\\b`, "gi"));
    el.textContent = "";
    parts.forEach(part => {
      if (PROFANITY.has(part.toLowerCase())) {
        const span = document.createElement("span");
        span.className = "lf-blurred";
        span.textContent = part;
        span.addEventListener("click", e => { e.stopPropagation(); toggleBlur(span); });
        el.appendChild(span);
      } else {
        el.appendChild(document.createTextNode(part));
      }
    });
  }

  function scanAll() {
    // Spicy Lyrics
    document.querySelectorAll("div.line").forEach(processSpicyLine);
    // Standard Spotify
    document.querySelectorAll([
      "[class*='lyrics-lyrics-container'] [class*='lyrics-lyricsContent-lyric']",
      "[data-testid='fullscreen-lyric']",
      "[class*='lyric-active']",
      "[class*='lyrics-line']",
    ].join(", ")).forEach(processStandardLine);
  }

  // Re-scan when blur changes (reset processed flags so lines get re-evaluated)
  function rescanWithNewBlur() {
    document.querySelectorAll("[data-lf-processed]").forEach(el => {
      delete el.dataset.lfProcessed;
    });
    // Just update the CSS — no need to re-parse, blur is handled by class
    updateStyles();
  }

  // ─── MutationObserver ──────────────────────────────────────────────────────
  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== 1) continue;
        if (node.matches?.("div.line")) processSpicyLine(node);
        node.querySelectorAll?.("div.line").forEach(processSpicyLine);
        const std = "[class*='lyrics-lyricsContent-lyric'], [data-testid='fullscreen-lyric']";
        if (node.matches?.(std)) processStandardLine(node);
        node.querySelectorAll?.(std).forEach(processStandardLine);
      }
    }
  });

  // ─── Settings modal ────────────────────────────────────────────────────────
  function openSettings() {
    const container = document.createElement("div");
    container.className = "lf-settings";
    container.innerHTML = `
      <h2>🎵 Lyrics Filter</h2>
      <p class="lf-section-title">Blur Intensity</p>
      <label>Preview: <span class="lf-preview" id="lf-preview-word" style="filter: blur(${config.blurAmount}px)">badword</span></label>
      <div class="lf-row">
        <span style="font-size:12px">Low</span>
        <input type="range" id="lf-blur-slider" min="2" max="30" step="1" value="${config.blurAmount}">
        <span style="font-size:12px">High</span>
        <span class="lf-value" id="lf-blur-value">${config.blurAmount}px</span>
      </div>
      <button class="lf-save" id="lf-save-btn">Save Settings</button>
    `;

    // Live preview as slider moves
    const slider = container.querySelector("#lf-blur-slider");
    const valueLabel = container.querySelector("#lf-blur-value");
    const preview = container.querySelector("#lf-preview-word");

    slider.addEventListener("input", () => {
      const val = parseInt(slider.value);
      valueLabel.textContent = val + "px";
      preview.style.filter = `blur(${val}px)`;
    });

    container.querySelector("#lf-save-btn").addEventListener("click", () => {
      config.blurAmount = parseInt(slider.value);
      saveConfig(config);
      updateStyles();
      Spicetify.PopupModal.hide();
      Spicetify.showNotification("Lyrics Filter settings saved!");
    });

    Spicetify.PopupModal.display({
      title: "Lyrics Filter Settings",
      content: container,
    });
  }

  // ─── Top bar button ────────────────────────────────────────────────────────
  function addSettingsButton() {
    // Avoid duplicate buttons
    if (document.getElementById("lf-settings-btn")) return;

    const btn = document.createElement("button");
    btn.id = "lf-settings-btn";
    btn.title = "Lyrics Filter Settings";
    btn.style.cssText = `
      background: transparent;
      border: none;
      cursor: pointer;
      color: var(--spice-text, #fff);
      opacity: 0.7;
      font-size: 18px;
      padding: 4px 8px;
      border-radius: 4px;
      transition: opacity 0.15s;
      display: flex;
      align-items: center;
    `;
    btn.innerHTML = "🔇";
    btn.addEventListener("mouseenter", () => btn.style.opacity = "1");
    btn.addEventListener("mouseleave", () => btn.style.opacity = "0.7");
    btn.addEventListener("click", openSettings);

    // Try to insert into Spotify's top bar controls area
    const targets = [
      ".main-topBar-container .main-topBar-topbarContent",
      "[class*='topBar-topbarContent']",
      ".Root__top-bar header",
      ".main-actionButtons",
    ];

    for (const selector of targets) {
      const bar = document.querySelector(selector);
      if (bar) {
        bar.appendChild(btn);
        return;
      }
    }

    // Fallback: floating button in bottom-right
    btn.style.cssText += `
      position: fixed; bottom: 80px; right: 20px;
      opacity: 1;
      font-size: 20px; padding: 10px 14px;
      border-radius: 50%; z-index: 9999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    `;
    document.body.appendChild(btn);
  }

  // ─── Init ──────────────────────────────────────────────────────────────────
  function init() {
    if (!Spicetify?.Player || !Spicetify?.PopupModal) {
      setTimeout(init, 300);
      return;
    }

    observer.observe(document.body, { childList: true, subtree: true });

    Spicetify.Player.addEventListener("songchange", () => {
      setTimeout(scanAll, 1500);
    });

    addSettingsButton();
    scanAll();
    console.log("[LyricsFilter] v3.0 loaded ✓");
  }

  init();

})();
