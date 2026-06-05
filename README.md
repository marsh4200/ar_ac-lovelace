# ❄️ AR Animated AC Card

A realistic animated split air-conditioner card for Home Assistant.

The card visually represents an indoor wall-mounted AC unit with dynamic airflow, moving louvers, swing animations, HVAC mode colours, temperature controls, and live climate information.

Designed to look and feel like a real air-conditioner rather than a standard climate card.

---

## Preview

<p align="center">
  <img src="images/preview.gif" alt="AR Animated AC Card Preview" width="800">
</p>

---

## Features

✨ Realistic wall-mounted split-unit design

🌬️ Animated airflow that blows downward and outward

🎯 Automatic airflow animation based on `hvac_action`

🔄 Swing mode animation

🎨 HVAC mode colour themes

* Cooling → Cyan
* Heating → Orange
* Dry → Green
* Fan Only → Purple
* Auto → Amber

⚡ Fan speed affects airflow animation speed

🌡️ Target temperature controls

🏠 Current room temperature display

💧 Humidity display (when available)

📱 Fully responsive design

🎛️ Auto-generated HVAC and fan mode controls

🛠️ Built-in Visual Configuration Editor

🚫 No external dependencies

---

## Installation

### HACS

[![Open your Home Assistant instance and open this repository in HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=marsh4200&repository=ar_ac-lovelace&category=plugin)

Or manually:

1. Open HACS
2. Select **Custom Repositories**
3. Add:

```text
https://github.com/marsh4200/ar_ac-lovelace
```

4. Category: **Dashboard**
5. Install
6. Reload your browser

---

### Manual Installation

Copy:

```text
ar-animated-ac-card.js
```

to:

```text
/config/www/community/ar_ac-lovelace/
```

Then add the resource:

```text
URL:
/local/community/ar_ac-lovelace/ar-animated-ac-card.js

Type:
JavaScript Module
```

---

## Example Configuration

```yaml
type: custom:ar-animated-ac-card
entity: climate.living_room
name: Living Room
show_current: true
show_humidity: true
```

---

## Configuration Options

| Option        | Type    | Default       | Description           |
| ------------- | ------- | ------------- | --------------------- |
| entity        | string  | Required      | Climate entity        |
| name          | string  | Friendly Name | Card title            |
| show_current  | boolean | true          | Show room temperature |
| show_humidity | boolean | true          | Show humidity value   |

---

## Behaviour

### Airflow Animation

The card automatically uses:

```yaml
hvac_action
```

to determine whether the AC is actively heating or cooling.

If your integration does not expose `hvac_action`, airflow will be shown whenever the HVAC mode is not set to:

```yaml
off
```

---

### Temperature Controls

The card automatically honours:

* `target_temp_step`
* `min_temp`
* `max_temp`

Range setpoints (`target_temp_low` / `target_temp_high`) are displayed as read-only.

---

## Requirements

* Home Assistant 2024.1+
* A Climate Entity
* Modern Browser

---

## Roadmap

* [ ] Additional AC styles
* [ ] Ceiling cassette support
* [ ] Compact layout mode
* [ ] Energy usage display
* [ ] Advanced airflow patterns
* [ ] Optional sound effects

---


---




