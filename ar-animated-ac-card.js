/*! ARSmartHome - Animated AC Climate Card  |  github.com/marsh4200/ar_ac-lovelace */
const AR_AC_VERSION = "1.0.1";

const MODE_META = {
  cool:      { label: "Cool", icon: "mdi:snowflake",      color: "#38bdf8" },
  heat:      { label: "Heat", icon: "mdi:fire",           color: "#fb923c" },
  dry:       { label: "Dry",  icon: "mdi:water-percent",  color: "#34d399" },
  fan_only:  { label: "Fan",  icon: "mdi:fan",            color: "#a78bfa" },
  heat_cool: { label: "Auto", icon: "mdi:autorenew",      color: "#fbbf24" },
  auto:      { label: "Auto", icon: "mdi:autorenew",      color: "#fbbf24" },
  off:       { label: "Off",  icon: "mdi:power",          color: "#6b7686" },
};

const ACTIVE_ACTIONS = ["cooling", "heating", "drying", "fan", "preheating", "defrosting"];

const ACTION_VERB = {
  cooling: "Cooling", heating: "Heating", drying: "Drying",
  fan: "Fan only", idle: "Idle", off: "Off",
  preheating: "Pre-heating", defrosting: "Defrosting",
};

const LOUVER_OPEN = "M52 84 L308 84 L322 100 L38 100 Z";
const LOUVER_SHUT = "M60 84 L300 84 L294 92 L66 92 Z";

function fanDuration(fanMode) {
  const f = (fanMode || "").toString().toLowerCase();
  if (/high|turbo|max|focus|5|4/.test(f)) return "0.9s";
  if (/med|mid|3/.test(f)) return "1.4s";
  if (/low|quiet|silent|min|1/.test(f)) return "2.4s";
  if (/auto/.test(f)) return "1.6s";
  return "1.6s";
}

class ArAnimatedAcCard extends HTMLElement {
  static getConfigElement() {
    return document.createElement("ar-animated-ac-card-editor");
  }

  static getStubConfig(hass) {
    let entity = "";
    if (hass) {
      const c = Object.keys(hass.states).find((e) => e.startsWith("climate."));
      if (c) entity = c;
    }
    return { entity, show_current: true, show_humidity: true };
  }

  setConfig(config) {
    if (!config || !config.entity || !config.entity.startsWith("climate.")) {
      throw new Error("You need to define a climate entity");
    }
    this._config = Object.assign(
      { show_current: true, show_humidity: true, show_name: true },
      config
    );
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

  _build() {
    this._built = true;
    const root = this.attachShadow({ mode: "open" });
    const stateObj = this._hass.states[this._config.entity];
    const attrs = stateObj ? stateObj.attributes : {};

    const hvacModes = (attrs.hvac_modes || ["cool", "heat", "dry", "fan_only", "auto"]).filter((m) => m !== "off");
    const fanModes = attrs.fan_modes || [];
    const hasSwing = Array.isArray(attrs.swing_modes) && attrs.swing_modes.length > 1;

    const modeBtns = hvacModes.map((m) => {
      const meta = MODE_META[m] || { label: m, icon: "mdi:dots-horizontal" };
      return '<button class="mode" data-mode="' + m + '"><ha-icon icon="' + meta.icon + '"></ha-icon><span>' + meta.label + '</span></button>';
    }).join("");

    const fanBtns = fanModes.map((f) =>
      '<button class="fan" data-fan="' + f + '">' + this._pretty(f) + '</button>'
    ).join("");

    root.innerHTML =
'<style>' +
':host{display:block}' +
'.card{--accent:#38bdf8;--flowdur:1.6s;background:#10151c;border:0.5px solid rgba(255,255,255,0.08);border-radius:20px;padding:18px 18px 20px;color:#e7ecf3;font-family:var(--mdc-typography-font-family,Roboto,sans-serif);}' +
'.hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;}' +
'.title{font-size:15px;font-weight:500;}' +
'.sub{font-size:12px;color:#8b97a7;margin-top:2px;}' +
'.iconbtn{border:0.5px solid rgba(255,255,255,0.14);background:rgba(255,255,255,0.04);color:var(--accent);cursor:pointer;display:flex;align-items:center;justify-content:center;}' +
'.power{width:40px;height:40px;border-radius:50%;--mdc-icon-size:20px;}' +
'svg{width:100%;display:block;}' +
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
'.ctl{display:flex;align-items:center;justify-content:space-between;margin:12px 4px 4px;}' +
'.metric{display:flex;flex-direction:column;gap:2px;}' +
'.metric .k{font-size:12px;color:#8b97a7;}' +
'.metric .v{font-size:15px;font-weight:500;display:flex;align-items:center;gap:4px;--mdc-icon-size:16px;}' +
'.metric .v ha-icon{color:#8b97a7;}' +
'.stepper{display:flex;align-items:center;gap:14px;}' +
'.round{width:42px;height:42px;border-radius:50%;--mdc-icon-size:20px;}' +
'.tgt{text-align:center;min-width:78px;}' +
'.big{font-size:34px;font-weight:500;line-height:1;}' +
'.big .u{font-size:18px;}' +
'.tlbl{font-size:11px;color:#8b97a7;}' +
'.modes{display:grid;gap:8px;margin-top:14px;}' +
'.mode{display:flex;flex-direction:column;align-items:center;padding:9px 0;border-radius:12px;border:0.5px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:#e7ecf3;cursor:pointer;font-size:11px;--mdc-icon-size:18px;}' +
'.mode ha-icon{margin-bottom:3px;}' +
'.fanrow{display:flex;align-items:center;gap:10px;margin-top:12px;}' +
'.fans{display:flex;gap:6px;flex:1;}' +
'.fan{flex:1;padding:7px 0;border-radius:10px;border:0.5px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:#e7ecf3;cursor:pointer;font-size:11px;}' +
'.swing{width:40px;height:34px;border-radius:10px;--mdc-icon-size:18px;}' +
'.mode.active,.fan.active{border-color:var(--accent);background:rgba(255,255,255,0.10);color:var(--accent);}' +
'.warn{padding:16px;color:#fb923c;font-size:13px;}' +
'@keyframes blow{0%{transform:translateY(-6px);opacity:0}20%{opacity:.9}100%{transform:translateY(64px);opacity:0}}' +
'@keyframes glowpulse{0%,100%{opacity:.2}50%{opacity:.4}}' +
'@keyframes sweep{0%,100%{transform:rotate(-9deg)}50%{transform:rotate(9deg)}}' +
'</style>' +
'<div class="card">' +
  '<div class="hdr">' +
    '<div><div class="title" id="title">AC</div><div class="sub" id="sub"></div></div>' +
    '<button class="iconbtn power" id="power" title="Power"><ha-icon icon="mdi:power"></ha-icon></button>' +
  '</div>' +
  '<svg viewBox="0 0 360 200" role="img" aria-label="Air conditioner">' +
    '<defs>' +
      '<linearGradient id="arbody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbfdff"/><stop offset="0.55" stop-color="#eef2f7"/><stop offset="1" stop-color="#cfd6df"/></linearGradient>' +
      '<linearGradient id="argloss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity="0.85"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient>' +
      '<linearGradient id="arlip" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c2c9d3"/><stop offset="1" stop-color="#9aa3af"/></linearGradient>' +
      '<filter id="arblr"><feGaussianBlur stdDeviation="10"/></filter>' +
    '</defs>' +
    '<ellipse id="glow" cx="180" cy="178" rx="120" ry="16" style="fill:var(--accent)" opacity="0.32" filter="url(#arblr)"/>' +
    '<g id="streamswrap"><g id="streams" fill="none" stroke="var(--accent)" stroke-width="3.6" stroke-linecap="round"></g></g>' +
    '<rect x="20" y="12" width="320" height="64" rx="15" fill="url(#arbody)" stroke="#bcc5cf" stroke-width="0.5"/>' +
    '<rect x="22" y="13" width="316" height="20" rx="13" fill="url(#argloss)"/>' +
    '<line x1="28" y1="31" x2="332" y2="31" stroke="#cdd4dd" stroke-width="1"/>' +
    '<g stroke="#d9dfe7" stroke-width="2" stroke-linecap="round"><line x1="40" y1="46" x2="232" y2="46"/><line x1="40" y1="53" x2="232" y2="53"/><line x1="40" y1="60" x2="232" y2="60"/></g>' +
    '<rect x="250" y="40" width="74" height="26" rx="7" fill="#0c1622"/>' +
    '<text id="disp" x="287" y="58" text-anchor="middle" font-family="monospace" font-size="16" style="fill:var(--accent)">--</text>' +
    '<circle id="led" cx="40" cy="23" r="4" style="fill:var(--accent)"/>' +
    '<text x="332" y="25" text-anchor="end" font-family="sans-serif" font-size="8" fill="#9aa4b1">ARSmartHome</text>' +
    '<path d="M34 76 L326 76 L318 90 L42 90 Z" fill="url(#arlip)" stroke="#aab2bd" stroke-width="0.5"/>' +
    '<rect x="60" y="80" width="240" height="5" rx="2.5" fill="#10202e"/>' +
    '<path id="louver" d="' + LOUVER_SHUT + '" fill="#aeb6c2"/>' +
  '</svg>' +
  '<div class="ctl">' +
    '<div class="metric" id="curwrap"><span class="k">Room</span><span class="v"><ha-icon icon="mdi:thermometer"></ha-icon><span id="cur">--</span></span></div>' +
    '<div class="stepper">' +
      '<button class="iconbtn round" id="down" title="Lower"><ha-icon icon="mdi:minus"></ha-icon></button>' +
      '<div class="tgt"><div class="big" id="big">--</div><div class="tlbl">target</div></div>' +
      '<button class="iconbtn round" id="up" title="Raise"><ha-icon icon="mdi:plus"></ha-icon></button>' +
    '</div>' +
    '<div class="metric" id="humwrap" style="align-items:flex-end;"><span class="k">Humidity</span><span class="v"><ha-icon icon="mdi:water"></ha-icon><span id="hum">--</span></span></div>' +
  '</div>' +
  '<div class="modes" id="modes" style="grid-template-columns:repeat(' + Math.max(hvacModes.length, 1) + ',1fr);">' + modeBtns + '</div>' +
  (fanModes.length || hasSwing ?
  '<div class="fanrow">' +
    '<div class="fans" id="fans">' + fanBtns + '</div>' +
    (hasSwing ? '<button class="iconbtn swing" id="swing" title="Swing"><ha-icon icon="mdi:arrow-up-down"></ha-icon></button>' : '') +
  '</div>' : '') +
'</div>';

    this._el = {
      card: root.querySelector(".card"),
      title: root.getElementById("title"),
      sub: root.getElementById("sub"),
      disp: root.getElementById("disp"),
      cur: root.getElementById("cur"),
      hum: root.getElementById("hum"),
      curwrap: root.getElementById("curwrap"),
      humwrap: root.getElementById("humwrap"),
      big: root.getElementById("big"),
      louver: root.getElementById("louver"),
      swing: root.getElementById("swing"),
      streamswrap: root.getElementById("streamswrap"),
      streams: root.getElementById("streams"),
    };

    for (let i = 0; i < 9; i++) {
      const x0 = 84 + i * 24;
      const off = (x0 - 180) * 0.55;
      const xEnd = x0 + off;
      const xCtrl = x0 + off * 0.35;
      const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
      p.setAttribute("d", "M" + x0 + " 92 Q " + xCtrl + " 126 " + xEnd + " 158");
      p.style.animationDelay = (i * 0.16) + "s";
      this._el.streams.appendChild(p);
    }

    root.getElementById("power").onclick = () => this._togglePower();
    root.getElementById("up").onclick = () => this._stepTemp(1);
    root.getElementById("down").onclick = () => this._stepTemp(-1);
    root.querySelectorAll(".mode").forEach((b) =>
      (b.onclick = () => this._svc("set_hvac_mode", { hvac_mode: b.dataset.mode })));
    root.querySelectorAll(".fan").forEach((b) =>
      (b.onclick = () => this._svc("set_fan_mode", { fan_mode: b.dataset.fan })));
    if (this._el.swing) this._el.swing.onclick = () => this._toggleSwing();
  }

  _togglePower() {
    const st = this._hass.states[this._config.entity];
    if (!st) return;
    if (st.state !== "off") return this._svc("set_hvac_mode", { hvac_mode: "off" });
    const modes = (st.attributes.hvac_modes || []).filter((m) => m !== "off");
    const target = modes.includes("cool") ? "cool" : (modes[0] || "cool");
    this._svc("set_hvac_mode", { hvac_mode: target });
  }

  _toggleSwing() {
    const st = this._hass.states[this._config.entity];
    const modes = st.attributes.swing_modes || [];
    const cur = st.attributes.swing_mode;
    if (cur && cur !== "off") return this._svc("set_swing_mode", { swing_mode: "off" });
    const on = modes.find((m) => /vertical|both|on/i.test(m)) || modes.find((m) => m !== "off") || "on";
    this._svc("set_swing_mode", { swing_mode: on });
  }

  _stepTemp(dir) {
    const st = this._hass.states[this._config.entity];
    if (!st || st.state === "off") return;
    const a = st.attributes;
    if (typeof a.temperature !== "number") return;
    const step = a.target_temp_step || 0.5;
    const min = a.min_temp != null ? a.min_temp : 7;
    const max = a.max_temp != null ? a.max_temp : 35;
    let next = a.temperature + dir * step;
    next = Math.min(max, Math.max(min, Math.round(next / step) * step));
    this._svc("set_temperature", { temperature: Number(next.toFixed(2)) });
  }

  _unit() {
    const st = this._hass.states[this._config.entity];
    return (st && st.attributes.temperature_unit) ||
      (this._hass.config && this._hass.config.unit_system && this._hass.config.unit_system.temperature) || "°";
  }

  _fmt(t) {
    if (t == null || isNaN(t)) return "--";
    return (Math.round(t * 10) / 10).toString();
  }

  _pretty(s) {
    return s.toString().replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  _update() {
    const st = this._hass.states[this._config.entity];
    const E = this._el;
    if (!st) {
      E.card.innerHTML = '<div class="warn">Entity ' + this._config.entity + ' not found</div>';
      return;
    }
    const a = st.attributes;
    const mode = st.state;
    const meta = MODE_META[mode] || { color: "#38bdf8", label: this._pretty(mode) };
    const isOn = mode !== "off";
    const action = a.hvac_action;
    const blowing = isOn && (action ? ACTIVE_ACTIONS.includes(action) : true);

    E.card.style.setProperty("--accent", meta.color);
    E.card.style.setProperty("--flowdur", fanDuration(a.fan_mode));
    E.card.classList.toggle("off", !isOn);
    E.card.classList.toggle("blowing", blowing);
    E.card.classList.toggle("calm", isOn && !blowing);

    E.title.textContent = this._config.name || a.friendly_name || "AC";

    const unit = this._unit();
    let target = a.temperature;
    if (target == null && a.target_temp_high != null) {
      target = a.target_temp_low + "–" + a.target_temp_high;
    }
    const targetStr = target != null ? (typeof target === "number" ? this._fmt(target) : target) : "--";

    const verb = isOn ? (action && ACTION_VERB[action] ? ACTION_VERB[action] : (MODE_META[mode] ? MODE_META[mode].label : this._pretty(mode))) : "Off";
    E.sub.textContent = isOn ? verb + " · " + targetStr + unit : "Off";

    E.disp.textContent = isOn ? (typeof target === "number" ? this._fmt(target) + "°" : targetStr) : "--";
    E.big.innerHTML = isOn ? targetStr + '<span class="u">' + unit + '</span>' : '--';

    if (this._config.show_current !== false && a.current_temperature != null) {
      E.curwrap.style.visibility = "visible";
      E.cur.textContent = this._fmt(a.current_temperature) + unit;
    } else E.curwrap.style.visibility = "hidden";

    if (this._config.show_humidity !== false && a.current_humidity != null) {
      E.humwrap.style.visibility = "visible";
      E.hum.textContent = Math.round(a.current_humidity) + "%";
    } else E.humwrap.style.visibility = "hidden";

    const swingOn = a.swing_mode && a.swing_mode !== "off";
    E.louver.setAttribute("d", isOn ? LOUVER_OPEN : LOUVER_SHUT);
    E.streamswrap.classList.toggle("swinging", isOn && swingOn);

    this.shadowRoot.querySelectorAll(".mode").forEach((b) =>
      b.classList.toggle("active", b.dataset.mode === mode && isOn));
    this.shadowRoot.querySelectorAll(".fan").forEach((b) =>
      b.classList.toggle("active", b.dataset.fan === a.fan_mode && isOn));
    if (E.swing) E.swing.style.color = isOn && swingOn ? meta.color : "#6b7686";
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
        entity: "Climate entity",
        name: "Name (optional)",
        show_current: "Show room temperature",
        show_humidity: "Show humidity",
      }[s.name] || s.name);
      this._form.addEventListener("value-changed", (ev) => {
        this.dispatchEvent(new CustomEvent("config-changed", {
          detail: { config: ev.detail.value },
          bubbles: true, composed: true,
        }));
      });
      this.appendChild(this._form);
    }
    this._form.hass = this._hass;
    this._form.data = this._config;
    this._form.schema = [
      { name: "entity", required: true, selector: { entity: { domain: "climate" } } },
      { name: "name", selector: { text: {} } },
      { name: "show_current", selector: { boolean: {} } },
      { name: "show_humidity", selector: { boolean: {} } },
    ];
  }
}

customElements.define("ar-animated-ac-card", ArAnimatedAcCard);
customElements.define("ar-animated-ac-card-editor", ArAnimatedAcCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "ar-animated-ac-card",
  name: "AR Animated AC Card",
  description: "Animated wall-split air conditioner climate card with downward airflow, swing sweep and mode-driven accent.",
  preview: true,
  documentationURL: "https://github.com/marsh4200/ar_ac-lovelace",
});

console.info(
  "%c AR-ANIMATED-AC-CARD %c v" + AR_AC_VERSION + " ",
  "color:#10151c;background:#38bdf8;font-weight:700;border-radius:3px 0 0 3px;padding:2px 4px",
  "color:#38bdf8;background:#10151c;border-radius:0 3px 3px 0;padding:2px 4px"
);
