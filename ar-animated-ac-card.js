/*! ARSmartHome - Animated AC Climate Card  |  github.com/marsh4200/ar_ac-lovelace */
const AR_AC_VERSION = "1.5.0";

const MODE_META = {
  cool:      { label: "Cool", icon: "mdi:snowflake",     color: "#38bdf8", glyph: "cool" },
  heat:      { label: "Heat", icon: "mdi:fire",          color: "#fb923c", glyph: "heat" },
  dry:       { label: "Dry",  icon: "mdi:water-percent", color: "#34d399", glyph: "dry" },
  fan_only:  { label: "Fan",  icon: "mdi:fan",           color: "#a78bfa", glyph: "fan" },
  heat_cool: { label: "Auto", icon: "mdi:autorenew",     color: "#fbbf24", glyph: "auto" },
  auto:      { label: "Auto", icon: "mdi:autorenew",     color: "#fbbf24", glyph: "auto" },
  off:       { label: "Off",  icon: "mdi:power",         color: "#6b7686", glyph: null },
};

const ACTIVE_ACTIONS = ["cooling", "heating", "drying", "fan", "preheating", "defrosting"];
const ACTION_VERB = {
  cooling: "Cooling", heating: "Heating", drying: "Drying", fan: "Fan only",
  idle: "Idle", off: "Off", preheating: "Pre-heating", defrosting: "Defrosting",
};

const LOUVER_OPEN = "M52 84 L308 84 L322 100 L38 100 Z";
const LOUVER_SHUT = "M60 84 L300 84 L294 92 L66 92 Z";

function fanDuration(f) {
  f = (f || "").toString().toLowerCase();
  if (/high|turbo|max|focus|5|4/.test(f)) return "0.9s";
  if (/med|mid|3/.test(f)) return "1.4s";
  if (/low|quiet|silent|min|1/.test(f)) return "2.4s";
  return "1.6s";
}

const GLYPHS =
  '<g class="gl gl-cool" fill="none" stroke-width="1.5" stroke-linecap="round" style="stroke:var(--accent)">' +
    '<line x1="0" y1="-7" x2="0" y2="7"/><line x1="-6.1" y1="-3.5" x2="6.1" y2="3.5"/><line x1="-6.1" y1="3.5" x2="6.1" y2="-3.5"/>' +
    '<line x1="0" y1="-7" x2="-2.1" y2="-4.9"/><line x1="0" y1="-7" x2="2.1" y2="-4.9"/><line x1="0" y1="7" x2="-2.1" y2="4.9"/><line x1="0" y1="7" x2="2.1" y2="4.9"/>' +
  '</g>' +
  '<path class="gl gl-heat" style="fill:var(--accent)" d="M0 -8 C 3.4 -3.6 5 -1 3 2.4 C 5.4 1 5 5 1.4 7.6 C 2.8 4.6 0.5 4.2 0 6 C -1 3.6 -3 5 -2.4 2 C -4.8 3 -4.4 -1 -2 -2 C -3.4 -4 -2 -6 0 -8 Z"/>' +
  '<path class="gl gl-dry" style="fill:var(--accent)" d="M0 -8 C 4.6 -1.5 6 2 0 8 C -6 2 -4.6 -1.5 0 -8 Z"/>' +
  '<g class="gl gl-fan" style="fill:var(--accent)"><path d="M0 0 C 1.6 -4 4.6 -5.6 7 -4 C 5.6 -1.4 2.6 -0.4 0 0 Z"/><path transform="rotate(120)" d="M0 0 C 1.6 -4 4.6 -5.6 7 -4 C 5.6 -1.4 2.6 -0.4 0 0 Z"/><path transform="rotate(240)" d="M0 0 C 1.6 -4 4.6 -5.6 7 -4 C 5.6 -1.4 2.6 -0.4 0 0 Z"/><circle r="1.5"/></g>' +
  '<g class="gl gl-auto" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="stroke:var(--accent)"><path d="M5.5 -3 A 6 6 0 1 0 6.5 3.2"/><path d="M6.6 -6 L 6.6 -2.6 L 3.2 -2.6"/></g>';

const STYLE =
':host{display:block}' +
'.card{--accent:#38bdf8;--flowdur:1.6s;--surface:#10151c;--ink:#e7ecf3;--muted:#8b97a7;--line:rgba(255,255,255,0.12);--fill:rgba(255,255,255,0.04);--fill2:rgba(255,255,255,0.10);--edge:rgba(255,255,255,0.08);--shadow:none;background:var(--surface);border:0.5px solid var(--edge);border-radius:22px;padding:18px;color:var(--ink);font-family:var(--mdc-typography-font-family,Roboto,sans-serif);box-shadow:var(--shadow);transition:background .3s,color .3s;}' +
'.card.light{--surface:#f5f7fa;--ink:#1b2430;--muted:#5d6975;--line:rgba(0,0,0,0.12);--fill:rgba(0,0,0,0.03);--fill2:rgba(0,0,0,0.06);--edge:rgba(0,0,0,0.07);--shadow:0 6px 20px rgba(20,30,45,0.08);}' +
'.hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;}' +
'.title{font-size:15px;font-weight:500;}' +
'.sub{font-size:12px;color:var(--muted);margin-top:3px;display:flex;align-items:center;gap:7px;flex-wrap:wrap;}' +
'.fanchip{display:inline-flex;align-items:center;gap:4px;color:var(--accent);--mdc-icon-size:14px;}' +
'.iconbtn{border:0.5px solid var(--line);background:var(--fill);color:var(--accent);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;}' +
'.power{width:40px;height:40px;border-radius:50%;--mdc-icon-size:20px;}' +
'.card:not(.off) .power{box-shadow:0 0 14px -2px var(--accent);}' +
'svg.unit{width:100%;display:block;margin:2px 0;}' +
'#streamswrap{transform-origin:180px 92px;}' +
'#streams path{animation:blow var(--flowdur) ease-in infinite;}' +
'.card.off #streamswrap{opacity:0;}' +
'.card.calm #streams{opacity:0;}' +
'#streamswrap.swinging{animation:sweep 4s ease-in-out infinite;}' +
'#glow{transition:opacity .4s;}' +
'.card.off #glow{opacity:0!important;}' +
'.card.blowing #glow{animation:glowpulse 3s ease-in-out infinite;}' +
'#louver{transition:all .4s ease;}' +
'.card.off #led{fill:#3a4452!important;}' +
'.gl{display:none;}' +
'.ctl{display:flex;align-items:center;justify-content:space-between;margin:12px 2px 2px;}' +
'.metric{display:flex;flex-direction:column;gap:2px;}' +
'.metric.end{align-items:flex-end;}' +
'.metric .k{font-size:12px;color:var(--muted);}' +
'.metric .v{font-size:15px;font-weight:500;display:flex;align-items:center;gap:4px;--mdc-icon-size:16px;}' +
'.metric .v ha-icon{color:var(--muted);}' +
'.stepper{display:flex;align-items:center;gap:14px;}' +
'.round{width:42px;height:42px;border-radius:50%;--mdc-icon-size:20px;}' +
'.tgt{text-align:center;min-width:78px;}' +
'.big{font-size:34px;font-weight:500;line-height:1;}' +
'.big .u{font-size:18px;}' +
'.tlbl{font-size:11px;color:var(--muted);}' +
'.modes{display:grid;gap:8px;margin-top:14px;}' +
'.mode{display:flex;flex-direction:column;align-items:center;gap:3px;padding:9px 0;border-radius:13px;border:0.5px solid var(--line);background:var(--fill);color:var(--ink);cursor:pointer;font-size:11px;--mdc-icon-size:18px;transition:all .2s;}' +
'.fanrow{display:flex;align-items:center;gap:10px;margin-top:12px;}' +
'.fans{display:flex;gap:6px;flex:1;}' +
'.fan{flex:1;padding:8px 0;border-radius:11px;border:0.5px solid var(--line);background:var(--fill);color:var(--ink);cursor:pointer;font-size:11px;transition:all .2s;}' +
'.swing{width:40px;height:36px;border-radius:11px;--mdc-icon-size:18px;}' +
'.iconbtn:active,.mode:active,.fan:active{background:var(--fill2);}' +
'.mode.active,.fan.active{border-color:var(--accent);color:var(--accent);background:var(--fill2);box-shadow:inset 0 0 0 1px var(--accent),0 0 10px -3px var(--accent);font-weight:600;}' +
'.card.off .big,.card.off .tlbl{opacity:.45;}' +
'.card.off #disp{opacity:.4;}' +
'.warn{padding:16px;color:#fb923c;font-size:13px;}' +
'@keyframes blow{0%{transform:translateY(-6px);opacity:0}20%{opacity:.9}100%{transform:translateY(64px);opacity:0}}' +
'@keyframes glowpulse{0%,100%{opacity:.2}50%{opacity:.4}}' +
'@keyframes sweep{0%,100%{transform:rotate(-9deg)}50%{transform:rotate(9deg)}}';

class ArAnimatedAcCard extends HTMLElement {
  static getConfigElement() { return document.createElement("ar-animated-ac-card-editor"); }

  static getStubConfig(hass) {
    let entity = "";
    if (hass) { const c = Object.keys(hass.states).find((e) => e.startsWith("climate.")); if (c) entity = c; }
    return { entity, theme: "dark", show_current: true, show_humidity: true };
  }

  setConfig(config) {
    if (!config || !config.entity || !config.entity.startsWith("climate.")) {
      throw new Error("You need to define a climate entity");
    }
    this._config = Object.assign({ theme: "dark", show_current: true, show_humidity: true }, config);
    this._built = false;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._built && hass) this._build();
    if (this._built) this._update();
  }

  getCardSize() { return 5; }

  _svc(service, data) {
    this._hass.callService("climate", service, Object.assign({ entity_id: this._config.entity }, data));
  }

  _pretty(s) { return s.toString().replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()); }

  _build() {
    this._built = true;
    const root = this.attachShadow({ mode: "open" });
    const st = this._hass.states[this._config.entity];
    const a = st ? st.attributes : {};
    let hvacModes = (a.hvac_modes || ["cool", "heat", "dry", "fan_only", "auto"]).filter((m) => m !== "off");
    if (Array.isArray(this._config.modes) && this._config.modes.length) {
      hvacModes = this._config.modes.filter((m) => hvacModes.includes(m));
    }
    const entityFans = a.fan_modes || [];
    let fanModes = entityFans;
    if (Array.isArray(this._config.fan_modes) && this._config.fan_modes.length) {
      fanModes = this._config.fan_modes.filter((f) => entityFans.includes(f));
    }
    const hasSwing = Array.isArray(a.swing_modes) && a.swing_modes.length > 1;

    const modeBtns = hvacModes.map((m) => {
      const meta = MODE_META[m] || { label: this._pretty(m), icon: "mdi:dots-horizontal" };
      return '<button class="mode" data-mode="' + m + '"><ha-icon icon="' + meta.icon + '"></ha-icon><span>' + meta.label + '</span></button>';
    }).join("");
    const fanBtns = fanModes.map((f) => '<button class="fan" data-fan="' + f + '">' + this._pretty(f) + '</button>').join("");

    root.innerHTML =
      '<style>' + STYLE + '</style>' +
      '<div class="card">' +
        '<div class="hdr"><div><div class="title" id="title">AC</div><div class="sub" id="sub"></div></div>' +
        '<button class="iconbtn power" id="power" title="Power"><ha-icon icon="mdi:power"></ha-icon></button></div>' +
        '<svg class="unit" id="unit" viewBox="0 0 360 200" role="img" aria-label="Air conditioner">' +
          '<defs>' +
            '<linearGradient id="arbody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbfdff"/><stop offset="0.55" stop-color="#eef2f7"/><stop offset="1" stop-color="#cfd6df"/></linearGradient>' +
            '<linearGradient id="argloss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity="0.85"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient>' +
            '<linearGradient id="arlip" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c2c9d3"/><stop offset="1" stop-color="#9aa3af"/></linearGradient>' +
            '<filter id="arblr"><feGaussianBlur stdDeviation="10"/></filter>' +
            '<filter id="ards" x="-20%" y="-20%" width="140%" height="170%"><feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000" flood-opacity="0.28"/></filter>' +
          '</defs>' +
          '<ellipse id="glow" cx="180" cy="178" rx="120" ry="16" style="fill:var(--accent)" opacity="0.3" filter="url(#arblr)"/>' +
          '<g id="streamswrap"><g id="streams" fill="none" stroke="var(--accent)" stroke-width="3.6" stroke-linecap="round"></g></g>' +
          '<g filter="url(#ards)">' +
            '<rect x="20" y="12" width="320" height="64" rx="15" fill="url(#arbody)" stroke="#bcc5cf" stroke-width="0.5"/>' +
            '<rect x="22" y="13" width="316" height="20" rx="13" fill="url(#argloss)"/>' +
            '<line x1="28" y1="31" x2="332" y2="31" stroke="#cdd4dd" stroke-width="1"/>' +
            '<g stroke="#d9dfe7" stroke-width="2" stroke-linecap="round"><line x1="40" y1="46" x2="206" y2="46"/><line x1="40" y1="53" x2="206" y2="53"/><line x1="40" y1="60" x2="206" y2="60"/></g>' +
            '<rect x="226" y="39" width="106" height="29" rx="8" fill="#0a141f"/>' +
            '<g id="modeglyph" transform="translate(248,54)">' + GLYPHS + '</g>' +
            '<text id="disp" x="298" y="59" text-anchor="middle" font-family="monospace" font-size="17" style="fill:var(--accent)">--</text>' +
            '<circle id="led" cx="40" cy="23" r="4" style="fill:var(--accent)"/>' +
            '<text id="brand" x="206" y="25" text-anchor="end" font-family="sans-serif" font-size="8" fill="#9aa4b1"></text>' +
          '</g>' +
          '<path d="M34 76 L326 76 L318 90 L42 90 Z" fill="url(#arlip)" stroke="#aab2bd" stroke-width="0.5"/>' +
          '<rect x="60" y="80" width="240" height="5" rx="2.5" fill="#10202e"/>' +
          '<path id="louver" d="' + LOUVER_SHUT + '" fill="#aeb6c2"/>' +
        '</svg>' +
        '<div class="ctl" id="controls">' +
          '<div class="metric" id="curwrap"><span class="k">Room</span><span class="v"><ha-icon icon="mdi:thermometer"></ha-icon><span id="cur">--</span></span></div>' +
          '<div class="stepper"><button class="iconbtn round" id="down" title="Lower"><ha-icon icon="mdi:minus"></ha-icon></button>' +
          '<div class="tgt"><div class="big" id="big">--</div><div class="tlbl">target</div></div>' +
          '<button class="iconbtn round" id="up" title="Raise"><ha-icon icon="mdi:plus"></ha-icon></button></div>' +
          '<div class="metric end" id="humwrap"><span class="k">Humidity</span><span class="v"><ha-icon icon="mdi:water"></ha-icon><span id="hum">--</span></span></div>' +
        '</div>' +
        '<div class="modes" id="modes" style="grid-template-columns:repeat(' + Math.max(hvacModes.length, 1) + ',1fr);">' + modeBtns + '</div>' +
        (fanModes.length || hasSwing ?
          '<div class="fanrow" id="fanrow"><div class="fans" id="fans">' + fanBtns + '</div>' +
          (hasSwing ? '<button class="iconbtn swing" id="swing" title="Swing"><ha-icon icon="mdi:arrow-up-down"></ha-icon></button>' : '') +
          '</div>' : '') +
      '</div>';

    this._el = {
      card: root.querySelector(".card"), title: root.getElementById("title"), sub: root.getElementById("sub"),
      disp: root.getElementById("disp"), cur: root.getElementById("cur"), hum: root.getElementById("hum"),
      curwrap: root.getElementById("curwrap"), humwrap: root.getElementById("humwrap"), big: root.getElementById("big"),
      louver: root.getElementById("louver"), swing: root.getElementById("swing"), streamswrap: root.getElementById("streamswrap"),
      streams: root.getElementById("streams"), brand: root.getElementById("brand"),
      unit: root.getElementById("unit"), controls: root.getElementById("controls"),
      modesEl: root.getElementById("modes"), fanrow: root.getElementById("fanrow"),
    };

    for (let i = 0; i < 9; i++) {
      const x0 = 84 + i * 24, off = (x0 - 180) * 0.55, xEnd = x0 + off, xCtrl = x0 + off * 0.35;
      const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
      p.setAttribute("d", "M" + x0 + " 92 Q " + xCtrl + " 126 " + xEnd + " 158");
      p.style.animationDelay = (i * 0.16) + "s";
      this._el.streams.appendChild(p);
    }

    root.getElementById("power").onclick = () => this._togglePower();
    root.getElementById("up").onclick = () => this._stepTemp(1);
    root.getElementById("down").onclick = () => this._stepTemp(-1);
    root.querySelectorAll(".mode").forEach((b) => (b.onclick = () => this._svc("set_hvac_mode", { hvac_mode: b.dataset.mode })));
    root.querySelectorAll(".fan").forEach((b) => (b.onclick = () => this._svc("set_fan_mode", { fan_mode: b.dataset.fan })));
    if (this._el.swing) this._el.swing.onclick = () => this._toggleSwing();
  }

  _togglePower() {
    const st = this._hass.states[this._config.entity];
    if (!st) return;
    if (st.state !== "off") return this._svc("set_hvac_mode", { hvac_mode: "off" });
    const modes = (st.attributes.hvac_modes || []).filter((m) => m !== "off");
    this._svc("set_hvac_mode", { hvac_mode: modes.includes("cool") ? "cool" : (modes[0] || "cool") });
  }

  _toggleSwing() {
    const st = this._hass.states[this._config.entity];
    const modes = st.attributes.swing_modes || [];
    const cur = st.attributes.swing_mode;
    if (cur && cur !== "off") return this._svc("set_swing_mode", { swing_mode: "off" });
    const on = modes.find((m) => /vertical|both|on/i.test(m)) || modes.find((m) => m !== "off") || "on";
    this._svc("set_swing_mode", { swing_mode: on });
  }

  /* Coerce anything the integration throws at us into a usable number.
     IR/Broadlink climate entities often report setpoints as strings ("24",
     "24.0", "24 \u00b0C") rather than floats, which used to fail typeof checks. */
  _num(v) {
    if (v == null) return null;
    if (typeof v === "number") return isFinite(v) ? v : null;
    const n = parseFloat(String(v).replace(",", ".").replace(/[^\d.\-]/g, ""));
    return isFinite(n) ? n : null;
  }

  /* Resolve the target setpoint across the attribute names different
     integrations use. Returns {value, low, high, range}. */
  _target() {
    const a = (this._hass.states[this._config.entity] || {}).attributes || {};
    const key = this._config.temperature_attribute;
    const cands = key ? [a[key]] : [a.temperature, a.target_temp, a.target_temperature, a.setpoint, a.temp];
    for (const c of cands) {
      const n = this._num(c);
      if (n != null) return { value: n, range: false };
    }
    const lo = this._num(a.target_temp_low), hi = this._num(a.target_temp_high);
    if (lo != null && hi != null) return { value: null, low: lo, high: hi, range: true };
    if (!this._warned) {
      this._warned = true;
      console.warn("[ar-animated-ac-card] no target temperature attribute found on " +
        this._config.entity + ". Attributes present: " + Object.keys(a).join(", ") +
        ". Set `temperature_attribute:` in the card config to point at the right one.");
    }
    return { value: null, range: false };
  }

  _step() {
    const a = this._hass.states[this._config.entity].attributes;
    return this._num(this._config.step) || this._num(a.target_temp_step) || 1;
  }

  _stepTemp(dir) {
    const st = this._hass.states[this._config.entity];
    if (!st || st.state === "unavailable") return;
    const a = st.attributes;
    const t = this._target();
    if (t.range) return;
    const step = this._step();
    const min = this._num(a.min_temp) != null ? this._num(a.min_temp) : 7;
    const max = this._num(a.max_temp) != null ? this._num(a.max_temp) : 35;
    // No setpoint reported yet (common on IR units after a restart): start from
    // the room temperature, or the middle of the allowed range.
    let base = t.value;
    if (base == null) base = this._num(a.current_temperature);
    if (base == null) base = Math.round((min + max) / 2);
    let next = Math.min(max, Math.max(min, Math.round((base + dir * step) / step) * step));
    this._svc("set_temperature", { temperature: Number(next.toFixed(2)) });
  }

  _unit() {
    const st = this._hass.states[this._config.entity];
    return (st && st.attributes.temperature_unit) ||
      (this._hass.config && this._hass.config.unit_system && this._hass.config.unit_system.temperature) || "\u00b0";
  }

  _fmt(t) {
    const n = this._num(t);
    return n == null ? "--" : (Math.round(n * 10) / 10).toString();
  }

  _update() {
    const st = this._hass.states[this._config.entity];
    const E = this._el;
    if (!st) { E.card.innerHTML = '<div class="warn">Entity ' + this._config.entity + ' not found</div>'; return; }
    const a = st.attributes;
    const mode = st.state;
    const meta = MODE_META[mode] || { color: "#38bdf8", glyph: null };
    const dead = mode === "unavailable" || mode === "unknown";
    const isOn = !dead && mode !== "off";
    const action = a.hvac_action;
    const blowing = isOn && (action ? ACTIVE_ACTIONS.includes(action) : true);

    E.card.style.setProperty("--accent", meta.color);
    E.card.style.setProperty("--flowdur", fanDuration(a.fan_mode));
    E.card.classList.toggle("light", this._config.theme === "light");
    E.card.classList.toggle("off", !isOn);
    E.card.classList.toggle("blowing", blowing);
    E.card.classList.toggle("calm", isOn && !blowing);

    E.title.textContent = this._config.name || a.friendly_name || "AC";

    // Hidden branding on the indoor unit. Defaults to ARSmartHome; set
    // `brand:` in the card config to override, or "" to remove it entirely.
    const brand = (this._config.brand == null ? "ARSmartHome" : String(this._config.brand)).slice(0, 24);
    if (E.brand) {
      E.brand.textContent = brand;
      E.brand.setAttribute("font-size", brand.length > 18 ? 6 : brand.length > 14 ? 6.8 : brand.length > 11 ? 7.4 : 8);
    }

    const unit = this._unit();
    const t = this._target();
    const targetStr = t.range ? (this._fmt(t.low) + "–" + this._fmt(t.high))
                              : (t.value != null ? this._fmt(t.value) : "--");
    const hasTarget = targetStr !== "--" && !dead;

    if (dead) {
      E.sub.textContent = this._pretty(mode);
    } else if (isOn) {
      const verb = action && ACTION_VERB[action] ? ACTION_VERB[action] : (MODE_META[mode] ? MODE_META[mode].label : this._pretty(mode));
      let html = verb + (hasTarget ? " · " + targetStr + unit : "");
      if (a.fan_mode) html += ' <span class="fanchip"><ha-icon icon="mdi:fan"></ha-icon>' + this._pretty(a.fan_mode) + "</span>";
      E.sub.innerHTML = html;
    } else {
      E.sub.textContent = hasTarget ? "Off · " + targetStr + unit : "Off";
    }

    // Show the setpoint whenever the entity reports one, even while off or idle,
    // rather than blanking it to "--". Dimmed via CSS when the unit is off.
    E.disp.textContent = hasTarget ? targetStr + "°" : "--";
    E.big.innerHTML = hasTarget ? targetStr + '<span class="u">' + unit + "</span>" : "--";

    this.shadowRoot.querySelectorAll("#modeglyph .gl").forEach((g) => (g.style.display = "none"));
    if (isOn && meta.glyph) {
      const gl = this.shadowRoot.querySelector(".gl-" + meta.glyph);
      if (gl) gl.style.display = "";
    }

    if (this._config.show_current !== false && this._num(a.current_temperature) != null) {
      E.curwrap.style.visibility = "visible"; E.cur.textContent = this._fmt(a.current_temperature) + unit;
    } else E.curwrap.style.visibility = "hidden";

    if (this._config.show_humidity !== false && this._num(a.current_humidity) != null) {
      E.humwrap.style.visibility = "visible"; E.hum.textContent = Math.round(this._num(a.current_humidity)) + "%";
    } else E.humwrap.style.visibility = "hidden";

    const swingOn = a.swing_mode && a.swing_mode !== "off";
    E.louver.setAttribute("d", isOn ? LOUVER_OPEN : LOUVER_SHUT);
    E.streamswrap.classList.toggle("swinging", isOn && swingOn);

    const collapse = Array.isArray(this._config.collapse_when_off) ? this._config.collapse_when_off : [];
    const sect = { unit: E.unit, controls: E.controls, modes: E.modesEl, fan: E.fanrow };
    Object.keys(sect).forEach((k) => { if (sect[k]) sect[k].style.display = (!isOn && collapse.includes(k)) ? "none" : ""; });

    this.shadowRoot.querySelectorAll(".mode").forEach((b) => b.classList.toggle("active", b.dataset.mode === mode && isOn));
    this.shadowRoot.querySelectorAll(".fan").forEach((b) => b.classList.toggle("active", b.dataset.fan === a.fan_mode && isOn));
    if (E.swing) E.swing.style.color = isOn && swingOn ? meta.color : "var(--muted)";
  }
}

class ArAnimatedAcCardEditor extends HTMLElement {
  setConfig(config) { this._config = config; this._render(); }
  set hass(hass) { this._hass = hass; this._render(); }
  _render() {
    if (!this._hass || !this._config) return;
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.computeLabel = (s) => ({
        entity: "Climate entity", name: "Name (optional)", theme: "Background",
        modes: "HVAC modes to show", fan_modes: "Fan speeds to show",
        collapse_when_off: "Collapse when off",
        show_current: "Show room temperature", show_humidity: "Show humidity",
        brand: "Unit branding", step: "Temperature step", temperature_attribute: "Setpoint attribute",
      }[s.name] || s.name);
      this._form.addEventListener("value-changed", (ev) => {
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: ev.detail.value }, bubbles: true, composed: true }));
      });
      this.appendChild(this._form);
    }

    // Tap the version line five times to unlock the branding / IR fields.
    if (!this._foot) {
      this._foot = document.createElement("div");
      this._foot.style.cssText = "margin-top:14px;font-size:11px;opacity:.45;cursor:default;user-select:none;text-align:right;";
      this._foot.textContent = "AR Animated AC Card v" + AR_AC_VERSION;
      this._taps = 0;
      this._foot.addEventListener("click", () => {
        if (this._secret) return;
        if (++this._taps >= 5) {
          this._secret = true;
          this._foot.textContent = "Advanced unlocked \u00b7 v" + AR_AC_VERSION;
          this._render();
        }
      });
      this.appendChild(this._foot);
    }
    this._form.hass = this._hass;
    this._form.data = this._config;

    const est = this._hass.states[this._config.entity];
    const ea = est ? est.attributes : {};
    const pretty = (s) => s.toString().replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const modeOpts = (ea.hvac_modes || []).filter((m) => m !== "off")
      .map((m) => ({ value: m, label: (MODE_META[m] && MODE_META[m].label) || pretty(m) }));
    const fanOpts = (ea.fan_modes || []).map((f) => ({ value: f, label: pretty(f) }));

    this._form.schema = [
      { name: "entity", required: true, selector: { entity: { domain: "climate" } } },
      { name: "name", selector: { text: {} } },
      { name: "theme", selector: { select: { mode: "dropdown", options: [{ value: "dark", label: "Dark" }, { value: "light", label: "Light" }] } } },
      ...(modeOpts.length ? [{ name: "modes", selector: { select: { multiple: true, mode: "list", options: modeOpts } } }] : []),
      ...(fanOpts.length ? [{ name: "fan_modes", selector: { select: { multiple: true, mode: "list", options: fanOpts } } }] : []),
      { name: "collapse_when_off", selector: { select: { multiple: true, mode: "list", options: [
        { value: "unit", label: "Unit graphic" },
        { value: "controls", label: "Temperature & metrics" },
        { value: "modes", label: "Mode buttons" },
        { value: "fan", label: "Fan speeds" },
      ] } } },
      { name: "show_current", selector: { boolean: {} } },
      { name: "show_humidity", selector: { boolean: {} } },
      ...(this._secret ? [
        { name: "brand", selector: { text: {} } },
        { name: "step", selector: { number: { min: 0.1, max: 5, step: 0.1, mode: "box" } } },
        { name: "temperature_attribute", selector: { text: {} } },
      ] : []),
    ];
  }
}

customElements.define("ar-animated-ac-card", ArAnimatedAcCard);
customElements.define("ar-animated-ac-card-editor", ArAnimatedAcCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "ar-animated-ac-card",
  name: "AR Animated AC Card",
  description: "Animated wall-split air conditioner climate card with downward airflow, swing sweep, on-unit mode glyph and dark/light themes.",
  preview: true,
  documentationURL: "https://github.com/marsh4200/ar_ac-lovelace",
});

console.info(
  "%c AR-ANIMATED-AC-CARD %c v" + AR_AC_VERSION + " ",
  "color:#10151c;background:#38bdf8;font-weight:700;border-radius:3px 0 0 3px;padding:2px 4px",
  "color:#38bdf8;background:#10151c;border-radius:0 3px 3px 0;padding:2px 4px"
);
