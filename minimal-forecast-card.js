/**
 * minimal-forecast-card
 *
 * YAML config:
 *   entity: weather.home              # required
 *   forecast_type: daily              # daily | hourly
 *   items_to_show: 7                  # total entries (1–14)
 *   visible: 5                        # items visible at once
 *   item_spacing: 0                   # any CSS length between items: 0, 4px, 2%
 *   inner_spacing: 10px               # any CSS length between label/icon/temp
 *   dividers: true                    # separator lines between items
 *   style: clean                      # clean | soft | glass
 *   direction: horizontal             # horizontal | vertical
 *   card_shadow:                      # CSS box-shadow for ha-card
 *   item_shadow:                      # CSS box-shadow for .fc-col items
 *   hide_min_temp: false              # hide the low temperature span
 *   sparkline: true                   # smooth hi-temp curve (horizontal only)
 *   sparkline_color: var(--primary-color) # any CSS color (hex, rgba, var)
 *   sparkline_width: 2                # stroke width of the sparkline path
 *   embedded: false                   # strip card chrome for nesting
 *   font_size: medium                 # any CSS length (14px, 1.2em) or small | medium | large | xlarge
 *   icon_size: 32                     # px override
 *   custom_icon_path: /local/icons/   # serves {condition}.svg
 *   tap_action:
 *     action: more-info               # more-info | navigate | url | call-service | none
 *
 * Theme CSS overrides:
 *   --mfc-label-color     --mfc-hi-color      --mfc-lo-color
 *   --mfc-icon-color      --mfc-divider-color  --mfc-spark-color
 *   --mfc-spark-width     --mfc-card-shadow    --mfc-item-shadow
 *   --mfc-label-font-weight  --mfc-hi-font-weight  --mfc-lo-font-weight
 */

// ═══════════════════════════════════════════════════════════════════════════════
// CSS
//
// DOM hierarchy:
//   ha-card > .fc-row > .fc-cols > .fc-items > [.fc-spark + .fc-col …]
//
//   .fc-row     — style data-attrs, font-size scope (all children use em)
//   .fc-cols    — scroll viewport, measured by ResizeObserver for --_cols-w
//   .fc-items   — flex layout + position context for sparkline
//   .fc-spark   — absolute inside .fc-items, stretches to intrinsic flex width
//   .fc-col     — individual forecast day/hour
//
// Sizing uses native CSS font-size inheritance:
//   font_size sets font-size on .fc-row; all descendants use em units.
//   No custom scale multiplier — standard CSS cascade does the work.
//
// Horizontal scroll item widths use --_cols-w (px), set by a ResizeObserver
// on .fc-cols. This avoids container-query units (cqi) which require
// Chrome 105+ / Safari 16+ and break on older Fire tablets and iPads.
//
// Vertical height constraint is pure CSS via --_row-h.
// ═══════════════════════════════════════════════════════════════════════════════
const CSS = `
  /* ─── tokens ─── */
  :host {
    -webkit-tap-highlight-color: transparent;
    --mfc-sp: 10px;
    --mfc-icon: 2em;
    --mfc-vis: 5;
    --mfc-pad: 16px;

    --mfc-label-color: var(--secondary-text-color);
    --mfc-hi-color: var(--primary-text-color);
    --mfc-lo-color: var(--secondary-text-color);
    --mfc-icon-color: var(--secondary-text-color);
    --mfc-divider-color: var(--divider-color, rgba(128,128,128,0.3));
    --mfc-spark-color: var(--primary-color, #4a90d9);
    --mfc-spark-width: 2;

    --mfc-label-font-weight: 600;
    --mfc-hi-font-weight: 600;
    --mfc-lo-font-weight: 400;

    --_g: 0px;
    --_cols-w: 300px;
  }

  /* ─── card shell ─── */
  ha-card {
    -webkit-tap-highlight-color: transparent;
    padding: var(--mfc-pad);
    background: var(--ha-card-background, var(--card-background-color, #fff));
    color: var(--primary-text-color);
    font-family: var(--ha-card-header-font-family, inherit);
    border-radius: var(--ha-card-border-radius, 12px);
    border-width: var(--ha-card-border-width, 0);
    border-color: var(--ha-card-border-color, transparent);
    box-shadow: var(--mfc-card-shadow, var(--ha-card-box-shadow, none));
    overflow: hidden;
  }
  ha-card[data-tap] {
    cursor: pointer;
  }
  ha-card[data-embedded] {
    padding: 0;
    background: none;
    box-shadow: none !important;
    border: none;
	border-radius: unset;
  }
  
  /* ─── root card glass effect (ignored if embedded) ─── */
  ha-card[data-style="glass"]:not([data-embedded]) {
    /* Mix the theme's solid background with 50% transparency */
    background: color-mix(in srgb, var(--ha-card-background, var(--card-background-color, #fff)) 50%, transparent);
    backdrop-filter: blur(12px) saturate(130%);
    -webkit-backdrop-filter: blur(12px) saturate(130%);
  }

  /* ─── style gap defaults (on .fc-row, not ha-card) ─── */
  .fc-row[data-style="clean"] { --_g: 0px; }
  .fc-row[data-style="soft"]  { --_g: 0.25em; }
  .fc-row[data-style="glass"] { --_g: 0.25em; }

  /* ─── .fc-row — token scope, font-size anchor ─── */
  .fc-row {
    position: relative;
    font-size: 1rem;
  }

  /* ─── .fc-cols — scroll viewport ─── */
  .fc-cols {
    overflow: hidden;
    scrollbar-width: none;
  }
  .fc-cols::-webkit-scrollbar { display: none; }

  /* ─── .fc-items — flex layout, sparkline stacking context ─── */
  .fc-items {
    display: flex;
    gap: var(--_g);
    position: relative;
    width: max-content;
    min-width: 100%;
  }

  /* ─── fit: all items visible, equal width ─── */
  .fc-row[data-scroll="fit"] .fc-col {
    flex: 1 1 0%;
  }

  /* ─── horizontal scroll ─── */
  .fc-row[data-scroll="x"] .fc-cols {
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    contain: layout style paint;
  }
  .fc-row[data-scroll="x"] .fc-items {
    transform: translateZ(0);
  }
  .fc-row[data-scroll="x"] .fc-col {
    flex: 0 0 calc((var(--_cols-w) - (var(--mfc-vis) - 1) * var(--_g)) / var(--mfc-vis));
  }
  
  /* ─── horizontal height override ─── */
  .fc-row:not([data-dir="v"]) .fc-col {
    height: var(--mfc-item-h, auto);
  }

  /* ─── vertical ─── */
  .fc-row[data-dir="v"] {
    --_row-h: var(--mfc-item-h, calc(var(--mfc-icon) + 1.75em));
  }
  .fc-row[data-dir="v"] .fc-items {
    flex-direction: column;
    width: 100%;
  }
  .fc-row[data-dir="v"] .fc-col {
    flex: 0 0 var(--_row-h);
  }
  .fc-row[data-dir="v"][data-scroll="y"] .fc-cols {
    overflow-y: auto;
    scroll-snap-type: y proximity;
    max-height: calc(var(--_row-h) * var(--mfc-vis) + var(--_g) * (var(--mfc-vis) - 1));
    contain: layout style paint;
  }
  .fc-row[data-dir="v"][data-scroll="y"] .fc-items {
    transform: translateZ(0);
  }

  /* ─── sparkline ─── */
  .fc-spark {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
    transform: translateZ(0);
  }
  .fc-spark path {
    fill: none;
    stroke: var(--mfc-spark-color);
    stroke-width: var(--mfc-spark-width);
    stroke-linecap: round;
    stroke-linejoin: round;
    vector-effect: non-scaling-stroke;
  }

  /* ─── column base ─── */
  .fc-col {
    position: relative;
    z-index: 1;
    box-sizing: border-box;
    scroll-snap-align: start;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0.75em 0.5em;
    text-align: center;
    min-width: 0;
	gap: var(--mfc-sp);
    box-shadow: var(--mfc-item-shadow, none);
  }

  /* ─── dividers: ::before pseudo-element centred in the flex gap ─── */
  .fc-row[data-dividers] .fc-col + .fc-col::before {
    content: "";
    position: absolute;
    top: 5%;
    bottom: 5%;
    /* CPU-rendered exact center: half the gap + half the 3px width */
    inset-inline-start: calc((var(--_g) / -2) - 1.5px);
    width: 3px;
    background: var(--mfc-divider-color);
    pointer-events: none;
  }
  
  /* vertical direction: horizontal divider line */
  .fc-row[data-dir="v"][data-dividers] .fc-col + .fc-col::before {
    /* CPU-rendered exact center: half the gap + half the 3px height */
    top: calc((var(--_g) / -2) - 1.5px);
    bottom: auto;
    inset-inline-start: 5%;
    inset-inline-end: 5%;
    width: auto;
    height: 3px;
  }
  /* soft/glass have tile chrome — suppress dividers */
  .fc-row[data-style="soft"] .fc-col + .fc-col::before,
  .fc-row[data-style="glass"] .fc-col + .fc-col::before {
    display: none;
  }

  /* ─── style: soft ─── */
  .fc-row[data-style="soft"] .fc-col {
    background: color-mix(in srgb, var(--secondary-text-color) 6%, transparent);
    border-radius: calc(var(--ha-card-border-radius, 12px) * 0.6);
  }

  /* ─── style: glass ─── */
  .fc-row[data-style="glass"] .fc-col {
    background: color-mix(in srgb, var(--secondary-text-color) 6%, transparent);
    border-radius: calc(var(--ha-card-border-radius, 12px) * 0.6);
    backdrop-filter: blur(12px) saturate(130%);
    -webkit-backdrop-filter: blur(12px) saturate(130%);
  }

  /* ─── vertical: column becomes a row ─── */
  .fc-row[data-dir="v"] .fc-col {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 0.875em 1em;
	height: var(--_row-h);
    width: 100%;
  }

  /* ─── label (day name or hour) ─── */
  .fc-label {
    font-size: 0.8em;
    font-weight: var(--mfc-label-font-weight, 600);
    line-height: 1;
    color: var(--mfc-label-color);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    white-space: nowrap;
    opacity: 0.55;
  }
  .fc-col[data-today] .fc-label {
    color: var(--mfc-hi-color);
    opacity: 0.85;
  }
  .fc-row[data-dir="v"] .fc-label {
    width: fit-content;
    flex-shrink: 0;
    margin: 0;
    font-size: 1em;
  }

  /* ─── icon ─── */
  .fc-icon {
    --mdc-icon-size: var(--mfc-icon);
    color: var(--mfc-icon-color);
    flex-shrink: 0;
  }
  .fc-custom-icon {
    width: var(--mfc-icon);
    height: var(--mfc-icon);
    object-fit: contain;
    flex-shrink: 0;
    filter: drop-shadow(0px 3px 6px rgba(0, 0, 0, 0.05));
  }
  .fc-row[data-dir="v"] .fc-icon,
  .fc-row[data-dir="v"] .fc-custom-icon {
    order: -1;
    margin: 0;
  }

  /* ─── temperatures ─── */
  .fc-temps {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.375em;
  }
  .fc-hi {
    font-size: 1.1em;
    font-weight: var(--mfc-hi-font-weight, 600);
    line-height: 1;
    letter-spacing: -0.02em;
    color: var(--mfc-hi-color);
    font-variant-numeric: tabular-nums;
  }
  .fc-lo {
    font-size: 1em;
    font-weight: var(--mfc-lo-font-weight, 400);
    line-height: 1;
    color: var(--mfc-lo-color);
    opacity: 0.5;
    font-variant-numeric: tabular-nums;
  }

  .fc-row[data-dir="v"] .fc-temps {
    flex-direction: row;
    align-items: baseline;
    flex: 1;
    justify-content: flex-end;
    gap: 0;
  }
  .fc-row[data-dir="v"] .fc-hi {
    text-align: end;
    font-size: 1em;
  }
  .fc-row[data-dir="v"] .fc-lo {
    margin-inline-start: 0.5em;
    font-size: 1em;
  }

  /* ─── error ─── */
  .not-found {
    padding: 16px;
    text-align: center;
    color: var(--secondary-text-color);
    font-size: 0.85em;
    opacity: 0.55;
  }
`;

// ═══════════════════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════════════════

const ICONS = Object.freeze({
  "clear-night":     "mdi:weather-night",
  "cloudy":          "mdi:weather-cloudy",
  "exceptional":     "mdi:alert-circle-outline",
  "fog":             "mdi:weather-fog",
  "hail":            "mdi:weather-hail",
  "lightning":       "mdi:weather-lightning",
  "lightning-rainy": "mdi:weather-lightning-rainy",
  "partlycloudy":    "mdi:weather-partly-cloudy",
  "pouring":         "mdi:weather-pouring",
  "rainy":           "mdi:weather-rainy",
  "snowy":           "mdi:weather-snowy",
  "snowy-rainy":     "mdi:weather-snowy-rainy",
  "sunny":           "mdi:weather-sunny",
  "windy":           "mdi:weather-windy",
  "windy-variant":   "mdi:weather-windy-variant",
});

const mdi = (c) => ICONS[c] || "mdi:weather-cloudy";

const FONT_SIZES = Object.freeze({
  small: "0.85rem", medium: "1rem", large: "1.15rem", xlarge: "1.3rem",
});

const STYLE_SET  = new Set(["clean", "soft", "glass"]);

const POLL_INTERVAL_MS = 30 * 60_000; // 30 minutes

// ═══════════════════════════════════════════════════════════════════════════════
// Pure helpers
// ═══════════════════════════════════════════════════════════════════════════════

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/** Resolve font_size config to a direct CSS value. */
function parseFontSize(v) {
  if (!v || v === "medium") return "1rem";
  if (typeof v === "number") return v + "px";
  if (FONT_SIZES[v]) return FONT_SIZES[v];
  const s = String(v).trim();
  return s || "1rem";
}

function cssLen(v, fallback) {
  if (typeof v === "number") return v + "px";
  if (typeof v === "string" && v.trim()) return v.trim();
  return fallback;
}

/** O(1) forecast fingerprint — gates redundant DOM updates. */
function fp(fc) {
  if (!fc?.length) return "";
  const a = fc[0], z = fc[fc.length - 1];
  return `${fc.length}|${a.datetime}|${a.temperature}|${a.templow}|${z.datetime}|${z.temperature}|${z.templow}`;
}

/** Strip past entries. Daily: before today midnight. Hourly: before now. */
function filterPast(raw, isDaily) {
  const now = new Date();
  const cutoff = isDaily
    ? new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    : now.getTime();
  return raw.filter((f) => Date.parse(f.datetime) >= cutoff);
}

/** Format the label: weekday name for daily, clock time for hourly. */
function fmtLabel(dt, daily, locale) {
  const d = new Date(dt);
  return daily
    ? d.toLocaleDateString(locale, { weekday: "short" })
    : d.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" });
}

function isToday(dt) {
  const d = new Date(dt), n = new Date();
  return d.getFullYear() === n.getFullYear()
      && d.getMonth()    === n.getMonth()
      && d.getDate()     === n.getDate();
}

// ═══════════════════════════════════════════════════════════════════════════════
// DOM builders + updaters
// ═══════════════════════════════════════════════════════════════════════════════

function createIcon(cond, path) {
  if (path) {
    const base = path.endsWith("/") ? path : path + "/";
    const img = document.createElement("img");
    img.src = `${base}${cond}.svg`;
    img.className = "fc-custom-icon";
    img.alt = cond;
    img.loading = "lazy";
    return img;
  }
  const icon = document.createElement("ha-icon");
  icon.setAttribute("icon", mdi(cond));
  icon.className = "fc-icon";
  return icon;
}

function createColumn(f, daily, locale, iconPath, hideMin) {
  const col = document.createElement("div");
  col.className = "fc-col";
  if (daily && isToday(f.datetime)) col.dataset.today = "";

  const label = document.createElement("span");
  label.className = "fc-label";
  label.textContent = fmtLabel(f.datetime, daily, locale);
  col.appendChild(label);

  col.appendChild(createIcon(f.condition, iconPath));

  const temps = document.createElement("div");
  temps.className = "fc-temps";

  const hi = document.createElement("span");
  hi.className = "fc-hi";
  hi.textContent = f.temperature != null ? Math.round(f.temperature) + "°" : "";
  temps.appendChild(hi);

  if (!hideMin && f.templow != null) {
    const lo = document.createElement("span");
    lo.className = "fc-lo";
    lo.textContent = Math.round(f.templow) + "°";
    temps.appendChild(lo);
  }

  col.appendChild(temps);
  return col;
}

/**
 * Update an existing column node in-place.
 * DOM child order is fixed: [0]=label, [1]=icon, [2]=temps.
 * CSS order property handles visual reordering in vertical mode
 * without affecting this indexing.
 */
function updateColumn(col, f, daily, locale, iconPath, hideMin) {
  // Today marker
  if (daily && isToday(f.datetime)) col.dataset.today = "";
  else delete col.dataset.today;

  // Label
  col.children[0].textContent = fmtLabel(f.datetime, daily, locale);

  // Icon — update in-place when element type matches, replace otherwise
  const iconEl = col.children[1];
  if (iconPath) {
    const base = iconPath.endsWith("/") ? iconPath : iconPath + "/";
    if (iconEl.tagName === "IMG") {
      iconEl.src = `${base}${f.condition}.svg`;
      iconEl.alt = f.condition;
    } else {
      iconEl.replaceWith(createIcon(f.condition, iconPath));
    }
  } else {
    if (iconEl.tagName === "HA-ICON") {
      iconEl.setAttribute("icon", mdi(f.condition));
    } else {
      iconEl.replaceWith(createIcon(f.condition, null));
    }
  }

  // Temperatures
  const temps = col.children[2];
  temps.children[0].textContent = f.temperature != null ? Math.round(f.temperature) + "°" : "";

  const existingLo = temps.children[1];
  if (!hideMin && f.templow != null) {
    if (existingLo) {
      existingLo.textContent = Math.round(f.templow) + "°";
    } else {
      const lo = document.createElement("span");
      lo.className = "fc-lo";
      lo.textContent = Math.round(f.templow) + "°";
      temps.appendChild(lo);
    }
  } else if (existingLo) {
    existingLo.remove();
  }
}

/** Catmull-Rom → cubic bezier sparkline path `d` attribute value. */
function buildSparkPath(fc) {
  const pts = [];
  for (let i = 0; i < fc.length; i++) {
    if (fc[i].temperature != null) pts.push({ i, t: fc[i].temperature });
  }
  if (pts.length < 3) return "";

  let lo = Infinity, hi = -Infinity;
  for (const p of pts) { lo = Math.min(lo, p.t); hi = Math.max(hi, p.t); }
  const span = (hi - lo) || 1;
  const n = fc.length;
  const w = n * 100, h = 100, py = 12;

  const coords = pts.map((p) => ({
    x: n > 1 ? (p.i / (n - 1)) * w : w / 2,
    y: py + (1 - (p.t - lo) / span) * (h - 2 * py),
  }));

  let d = `M${coords[0].x.toFixed(1)},${coords[0].y.toFixed(1)}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[Math.max(i - 1, 0)];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[Math.min(i + 2, coords.length - 1)];
    const tension = 5;
    const c1x = p1.x + (p2.x - p0.x) / tension;
    const c1y = p1.y + (p2.y - p0.y) / tension;
    const c2x = p2.x - (p3.x - p1.x) / tension;
    const c2y = p2.y - (p3.y - p1.y) / tension;
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return d;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Tap actions (scroll-aware via pointer events)
// ═══════════════════════════════════════════════════════════════════════════════

function fireTap(el, hass, cfg) {
  const a = cfg.tap_action;
  if (!a) return;
  switch (a.action) {
    case "more-info": {
      const ev = new Event("hass-more-info", { bubbles: true, composed: true });
      ev.detail = { entityId: cfg.entity };
      el.dispatchEvent(ev);
      break;
    }
    case "navigate":
      if (a.navigation_path) {
        history.pushState(null, "", a.navigation_path);
        window.dispatchEvent(new Event("location-changed"));
      }
      break;
    case "url":
      if (a.url_path) window.open(a.url_path);
      break;
    case "call-service":
    case "perform-action": {
      const svc = a.service || a.perform_action;
      if (!svc) break;
      const [domain, service] = svc.split(".", 2);
      if (domain && service) {
        hass.callService(domain, service, a.service_data || a.data || {}, a.target || {});
      }
      break;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Element
// ═══════════════════════════════════════════════════════════════════════════════

class MinimalForecastCard extends HTMLElement {

  static getConfigElement() { return undefined; }

  static getStubConfig() {
    return {
      entity:           "weather.home",
      forecast_type:    "daily",
      items_to_show:    7,
      visible:          5,
      dividers:         true,
      style:            "clean",
      direction:        "horizontal",
      item_height:      null,
      hide_min_temp:    false,
      sparkline:        true,
      sparkline_color:  "",
      sparkline_width:  2,
      embedded:         false,
      font_size:        "medium",
      icon_size:        32,
      custom_icon_path: "",
      tap_action:       { action: "more-info" },
    };
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this._cfg       = {};
    this._fcKey     = "";
    this._fc        = null;
    this._fcRaw     = null;
    this._hass      = null;
    this._timer     = null;
    this._connected = false;
    this._fetching  = false;
    this._tapXY     = null;
    this._lastState = undefined;
    this._colNodes  = [];

    // ── Stable DOM skeleton ──
    const style = document.createElement("style");
    style.textContent = CSS;

    this._card = document.createElement("ha-card");
    this._row  = document.createElement("div");
    this._row.className = "fc-row";
    this._row.dataset.scroll = "fit";
    this._row.dataset.style  = "clean";
    this._row.dataset.dir    = "h";

    this._cols = document.createElement("div");
    this._cols.className = "fc-cols";

    this._items = document.createElement("div");
    this._items.className = "fc-items";

    const svgNS = "http://www.w3.org/2000/svg";
    this._spark = document.createElementNS(svgNS, "svg");
    this._spark.setAttribute("class", "fc-spark");
    this._spark.setAttribute("preserveAspectRatio", "none");
    this._sparkPath = document.createElementNS(svgNS, "path");
    this._spark.appendChild(this._sparkPath);

    this._items.appendChild(this._spark);
    this._cols.appendChild(this._items);
    this._row.appendChild(this._cols);
    this._card.appendChild(this._row);
    this.shadowRoot.append(style, this._card);

    // ── ResizeObserver: measure .fc-cols for scroll item widths ──
    // Replaces container-query units (cqi) for broad device compatibility.
    // Chrome 64+ / Safari 13.1+ / Firefox 69+ (vs cqi: Chrome 105+).
    this._ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentBoxSize?.[0]?.inlineSize ?? entry.contentRect.width;
        if (w > 0) this._row.style.setProperty("--_cols-w", w + "px");
      }
    });

    // ── Scroll-aware tap: only fire if pointer didn't travel ──
    this._card.addEventListener("pointerdown", (e) => {
      this._tapXY = { x: e.clientX, y: e.clientY };
    }, { passive: true });

    this._card.addEventListener("pointerup", (e) => {
      if (!this._tapXY || !this._hass || this._cfg.tap === "none") return;
      const dx = Math.abs(e.clientX - this._tapXY.x);
      const dy = Math.abs(e.clientY - this._tapXY.y);
      this._tapXY = null;
      if (dx < 5 && dy < 5) fireTap(this, this._hass, this._cfg);
    }, { passive: true });
  }

  // ─── Config (editor-flash safe) ───

  setConfig(raw) {
    if (!raw.entity) throw new Error("minimal-forecast-card: 'entity' required.");

    const next = {
      entity:     raw.entity,
      type:       raw.forecast_type === "hourly" ? "hourly" : "daily",
      items:      clamp(raw.items_to_show ?? 7, 1, 14),
      vis:        clamp(raw.visible ?? 5, 1, 14),
      itemSp:     raw.item_spacing != null ? cssLen(raw.item_spacing, "0px") : null,
      innerSp:    cssLen(raw.inner_spacing, "10px"),
      itemHeight: raw.item_height != null ? cssLen(raw.item_height, null) : null,
      dividers:   raw.dividers !== false,
      style:      STYLE_SET.has(raw.style) ? raw.style : "clean",
      dir:        raw.direction === "vertical" ? "v" : "h",
      cardShadow: raw.card_shadow != null ? String(raw.card_shadow).trim() : null,
      itemShadow: raw.item_shadow != null ? String(raw.item_shadow).trim() : null,
      hideMin:    raw.hide_min_temp === true,
      spark:      raw.sparkline !== false,
      sparkColor: raw.sparkline_color ? String(raw.sparkline_color).trim() : null,
      sparkWidth: raw.sparkline_width != null ? String(raw.sparkline_width).trim() : null,
      embedded:   raw.embedded === true,
      fontSize:   parseFontSize(raw.font_size),
      iconPx:     (typeof raw.icon_size === "number" && raw.icon_size > 0) ? raw.icon_size : null,
      iconPath:   raw.custom_icon_path || null,
      tap:        raw.tap_action?.action ?? "more-info",
      tap_action: raw.tap_action || { action: "more-info" },
    };

    const fetchNeeded = next.entity !== this._cfg.entity || next.type !== this._cfg.type;
    const prev = this._cfg;
    this._cfg = next;
    this._applyTokens();

    if (fetchNeeded) {
      this._fc     = null;
      this._fcRaw  = null;
      this._fcKey  = "";
      if (this._connected && this._hass) this._fetch();
    } else if (this._fcRaw) {
      this._fc = filterPast(this._fcRaw, next.type === "daily").slice(0, next.items);
      this._fcKey = fp(this._fc);
      const VIS_KEYS = [
        "items", "vis", "itemSp", "innerSp", "dividers", "style",
        "dir", "spark", "hideMin", "embedded", "fontSize", "iconPx", "iconPath",
      ];
      for (const k of VIS_KEYS) {
        if (next[k] !== prev[k]) {
          this._paint();
          break;
        }
      }
    }
  }

  // ─── Hass (state observer — triggers fetch on invalid→valid recovery) ───

  set hass(hass) {
    this._hass = hass;
    if (!this._cfg.entity) return;

    const obj = hass.states[this._cfg.entity];
    if (!obj) {
      this._showError(`Entity <b>${this._cfg.entity}</b> not found`);
      this._lastState = undefined;
      return;
    }

    const s = obj.state;
    const wasInvalid = this._lastState === "unavailable"
                    || this._lastState === "unknown"
                    || this._lastState === undefined;
    const isValid = s !== "unavailable" && s !== "unknown";
    this._lastState = s;

    if (!isValid) {
      this._showError(`Weather data ${s}`);
      return;
    }

    // Fetch if: no data yet, or entity just recovered from an invalid state
    if ((!this._fc || wasInvalid) && this._connected && !this._fetching) {
      this._fetch();
    }
  }

  // ─── Lifecycle ───

  connectedCallback() {
    this._connected = true;
    this._ro.observe(this._cols);
    this._startTimer();
    if (this._hass && !this._fc) this._fetch();
  }

  disconnectedCallback() {
    this._connected = false;
    this._ro.unobserve(this._cols);
    this._stopTimer();
  }

  _startTimer() {
    this._stopTimer();
    this._timer = setInterval(() => {
      if (this._hass) this._fetch();
    }, POLL_INTERVAL_MS);
  }

  _stopTimer() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }

  // ─── Fetch (guarded, fires from timer / connect / config change / recovery) ───

  async _fetch() {
    if (!this._hass || !this._cfg.entity || this._fetching) return;
    this._fetching = true;

    try {
      const res = await this._hass.callWS({
        type: "call_service",
        domain: "weather",
        service: "get_forecasts",
        target: { entity_id: this._cfg.entity },
        service_data: { type: this._cfg.type },
        return_response: true,
      });

      if (!this._connected) return;

      const eid = this._cfg.entity;
      this._fcRaw = (res?.[eid] || res?.response?.[eid])?.forecast ?? [];

      const trimmed = filterPast(this._fcRaw, this._cfg.type === "daily")
        .slice(0, this._cfg.items);
      const key = fp(trimmed);

      if (key !== this._fcKey || !this._fc) {
        this._fcKey = key;
        this._fc = trimmed;
        this._paint();
      }
    } catch (e) {
      if (!this._connected) return;
      console.warn(`minimal-forecast-card: fetch failed (${this._cfg.entity})`, e);
      if (!this._fc) {
        this._showError("Could not load forecast");
      }
    } finally {
      this._fetching = false;
    }
  }

  // ─── DOM: error state ───

  _showError(msg) {
    this._spark.style.display = "none";

    // Clear tracked columns
    for (const col of this._colNodes) col.remove();
    this._colNodes.length = 0;

    // Reuse or create error element
    let errDiv = this._items.querySelector(".not-found");
    if (!errDiv) {
      errDiv = document.createElement("div");
      errDiv.className = "not-found";
      this._items.appendChild(errDiv);
    }
    errDiv.innerHTML = msg;
  }

  // ─── DOM: tokens (cheap — called every setConfig) ───

  _applyTokens() {
    const c = this._cfg;
    const rs = this._row.style;

    this._row.dataset.style  = c.style;
    this._row.dataset.dir    = c.dir;

    if (c.dividers) {
      this._row.dataset.dividers = "";
    } else {
      delete this._row.dataset.dividers;
    }

    this._card.dataset.style = c.style;
    this._card.toggleAttribute("data-embedded", c.embedded);
    this._card.toggleAttribute("data-tap", c.tap !== "none");

    rs.setProperty("font-size", c.fontSize);
    rs.setProperty("--mfc-sp", c.innerSp);
    if (c.itemHeight) rs.setProperty("--mfc-item-h", c.itemHeight);
    else rs.removeProperty("--mfc-item-h");
    rs.setProperty("--mfc-vis", c.vis);
    rs.setProperty("--mfc-icon", c.iconPx ? c.iconPx + "px" : "2em");

    if (c.itemSp != null) rs.setProperty("--_g", c.itemSp);
    else rs.removeProperty("--_g");

    if (c.sparkColor) rs.setProperty("--mfc-spark-color", c.sparkColor);
    else rs.removeProperty("--mfc-spark-color");

    if (c.sparkWidth) rs.setProperty("--mfc-spark-width", c.sparkWidth);
    else rs.removeProperty("--mfc-spark-width");

    if (c.cardShadow) rs.setProperty("--mfc-card-shadow", c.cardShadow);
    else rs.removeProperty("--mfc-card-shadow");

    if (c.itemShadow) rs.setProperty("--mfc-item-shadow", c.itemShadow);
    else rs.removeProperty("--mfc-item-shadow");

    this._updateScrollMode();
  }

  // ─── DOM: scroll mode ───

  _updateScrollMode() {
    if (!this._fc) {
      this._row.dataset.scroll = "fit";
      return;
    }
    const overflow = this._fc.length > this._cfg.vis;
    if (this._cfg.dir === "v") {
      this._row.dataset.scroll = overflow ? "y" : "fit";
    } else {
      this._row.dataset.scroll = overflow ? "x" : "fit";
    }
  }

  // ─── DOM: paint (recycles existing nodes, creates/removes only the diff) ───

  _paint() {
    const c = this._cfg;
    const fc = this._fc;
    const daily = c.type === "daily";
    const locale = this._hass?.locale?.language || navigator.language;

    if (!fc?.length) {
      this._showError("No forecast data");
      return;
    }

    // Remove error element if transitioning from error → data
    const errDiv = this._items.querySelector(".not-found");
    if (errDiv) errDiv.remove();

    // Sync viewport measurement for --_cols-w (ResizeObserver may not have
    // fired yet on first paint). Single read, no forced reflow since _paint
    // runs from async _fetch completion.
    const colsW = this._cols.clientWidth;
    if (colsW > 0) this._row.style.setProperty("--_cols-w", colsW + "px");

    const needed = fc.length;
    const existing = this._colNodes.length;

    // Update existing columns in-place
    const reusable = Math.min(needed, existing);
    for (let i = 0; i < reusable; i++) {
      updateColumn(this._colNodes[i], fc[i], daily, locale, c.iconPath, c.hideMin);
    }

    // Append new columns if count increased
    for (let i = existing; i < needed; i++) {
      const col = createColumn(fc[i], daily, locale, c.iconPath, c.hideMin);
      this._items.appendChild(col);
      this._colNodes.push(col);
    }

    // Remove excess columns if count decreased
    while (this._colNodes.length > needed) {
      this._colNodes.pop().remove();
    }

    // Sparkline
    const showSpark = c.spark && c.dir === "h";
    if (showSpark) {
      const d = buildSparkPath(fc);
      if (d) {
        this._spark.style.display = "";
        this._spark.setAttribute("viewBox", `0 0 ${fc.length * 100} 100`);
        this._sparkPath.setAttribute("d", d);
      } else {
        this._spark.style.display = "none";
      }
    } else {
      this._spark.style.display = "none";
    }

    this._updateScrollMode();
  }

  getCardSize() {
    return this._cfg.dir === "v" ? 4 : 2;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Register
// ═══════════════════════════════════════════════════════════════════════════════

customElements.define("minimal-forecast-card", MinimalForecastCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "minimal-forecast-card",
  name: "Minimal Forecast Card",
  description: " A minimal forecast-only Home Assistant card.",
});
