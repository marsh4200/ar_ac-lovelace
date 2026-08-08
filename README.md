# AR Animated AC Card

An animated wall-split air conditioner climate card for Home Assistant. A realistic indoor split unit throws air **down and out into the room**, the louver opens downward, swing sweeps the throw side-to-side, the on-unit LCD shows the active mode symbol beside the temperature, and the accent colour follows the HVAC mode. Single dependency-free custom element with a visual config editor and dark/light backgrounds.

![version](https://img.shields.io/badge/version-1.5.0-38bdf8)
![hacs](https://img.shields.io/badge/HACS-Dashboard-41bdf5)

Repo: `marsh4200/ar_ac-lovelace` · card type: `custom:ar-animated-ac-card`

## What it does

- Realistic SVG split unit with gloss, intake grille, vents, drop shadow and status LED
- Airflow that pours downward and fans out, only while actively heating/cooling (driven by `hvac_action`)
- Louver opens downward when running, closes flush when off
- Swing sweeps the whole airflow left-to-right when swing is enabled
- On-unit LCD shows the active mode glyph (cool/heat/dry/fan/auto) next to the target temperature
- Current fan speed stays lit on its button and is shown in the status line with a fan icon
- Accent follows HVAC mode (cool cyan / heat orange / dry green / fan violet / auto amber)
- Airflow speed reacts to fan mode (low/quiet slows it, high speeds it up)
- Dark or light background
- Mode and fan buttons generated from the entity's own `hvac_modes` / `fan_modes`; swing button shown only when supported

## Install

### HACS (custom repository)
1. HACS → ⋮ → Custom repositories → add `https://github.com/marsh4200/ar_ac-lovelace`, category **Dashboard**.
2. Install. Add the resource if you are not prompted automatically.

### Manual
1. Copy `ar-animated-ac-card.js` into `config/www/ar_ac-lovelace/`.
2. Settings → Dashboards → Resources → Add, type **JavaScript Module**:
   `/local/ar_ac-lovelace/ar-animated-ac-card.js`

## Usage

```yaml
type: custom:ar-animated-ac-card
entity: climate.living_room
name: Living room        # optional, defaults to friendly_name
theme: dark              # dark | light
show_current: true       # room temperature readout
show_humidity: true      # humidity readout (auto-hidden if not reported)
```

A visual editor is available in the dashboard card picker.

## Config

| Option         | Type    | Default              | Description                                  |
|----------------|---------|----------------------|----------------------------------------------|
| `entity`       | string  | —                    | A `climate.*` entity (required)              |
| `name`         | string  | entity friendly name | Header title                                 |
| `theme`        | string  | `dark`               | Background: `dark` or `light`                |
| `show_current` | boolean | `true`               | Show room temperature                        |
| `show_humidity`| boolean | `true`               | Show humidity (auto-hidden if not reported)  |

### Hidden options

Not shown in the visual editor by default. In the editor, tap the small version line
at the bottom five times to unlock them, or just add the keys in YAML.

| Option                   | Type   | Default        | Description                                              |
|--------------------------|--------|----------------|----------------------------------------------------------|
| `brand`                  | string | `ARSmartHome`  | Text printed on the indoor unit. Set `""` to remove it.  |
| `step`                   | number | entity step    | Force the +/- increment (IR units usually want `1`)      |
| `temperature_attribute`  | string | auto           | Read the setpoint from a specific attribute name         |

```yaml
type: custom:ar-animated-ac-card
entity: climate.lounge
brand: Everton            # replaces ARSmartHome on the unit
step: 1
```

## Notes

- Airflow visibility is keyed off `hvac_action`. If your integration does not report it, the card assumes it is blowing whenever the mode is not `off`.
- Temperature stepping uses `target_temp_step`, `min_temp` and `max_temp` from the entity. Range setpoints (`target_temp_low`/`high`) are displayed read-only.
- IR-based climate entities (Broadlink / SmartIR / `ar_smart_ir`) often report the setpoint as a string rather than a number, and often report no setpoint at all until one is sent. The card coerces string setpoints, falls back to `target_temp` / `target_temperature` / `setpoint`, and will step from the room temperature if the entity has no setpoint yet.
- The setpoint stays visible when the unit is off (dimmed) instead of blanking to `--`. If it still shows `--`, open the browser console: the card logs the attribute names it can see so you can point `temperature_attribute` at the right one.

## Changelog

### 1.5.0
- Fixed `--` setpoint on Broadlink / IR climate entities (string setpoints, alternate attribute names, missing setpoints)
- Setpoint now shown while off, dimmed, rather than blanked
- `unavailable` / `unknown` states no longer render as if the unit is running
- Hidden `brand`, `step` and `temperature_attribute` options; unlock in the editor by tapping the version line five times

## License

MIT © ARSmartHome
