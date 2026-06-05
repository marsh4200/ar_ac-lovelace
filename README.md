# AR Animated AC Card

An animated wall-split air conditioner climate card for Home Assistant. A realistic indoor split unit throws air **down and out into the room**, the louver opens downward, swing sweeps the throw side-to-side, and a glowing under-unit halo plus accent colour follow the HVAC mode. Single dependency-free custom element with a visual config editor.

![version](https://img.shields.io/badge/version-1.0.1-38bdf8)
![hacs](https://img.shields.io/badge/HACS-Dashboard-41bdf5)

Repo: `marsh4200/ar_ac-lovelace` · card type: `custom:ar-animated-ac-card`

## What it does

- Realistic SVG split unit with gloss, intake grille, vents, on-board display and status LED
- Airflow streams that pour downward and fan outward, only while actively heating/cooling (driven by `hvac_action`)
- Louver that opens downward when running and closes flush when off
- Swing sweeps the whole airflow left-to-right when swing is enabled
- Accent follows HVAC mode (cool cyan / heat orange / dry green / fan violet / auto amber)
- Airflow speed reacts to fan mode (low/quiet slows it, high speeds it up)
- Target temperature stepper, room temperature and humidity readouts
- Mode and fan buttons generated from the entity's own `hvac_modes` / `fan_modes`
- Swing toggle shown only when the entity supports swing

## Install

### HACS (custom repository)
1. HACS → ⋮ → Custom repositories → add `https://github.com/marsh4200/ar_ac-lovelace`, category **Dashboard**.
2. Install. Add the resource if you are not prompted automatically.

### Manual / one-line
From your HA config directory:

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/marsh4200/ar_ac-lovelace/main/install.sh)
```

Then add the resource (Settings → Dashboards → Resources, type JavaScript Module):

```
/local/community/ar_ac-lovelace/ar-animated-ac-card.js
```

## Usage

```yaml
type: custom:ar-animated-ac-card
entity: climate.living_room
name: Living room        # optional, defaults to friendly_name
show_current: true       # room temperature readout
show_humidity: true      # humidity readout (auto-hidden if not reported)
```

A visual editor is available in the dashboard card picker.

## Config

| Option         | Type    | Default              | Description                                  |
|----------------|---------|----------------------|----------------------------------------------|
| `entity`       | string  | —                    | A `climate.*` entity (required)              |
| `name`         | string  | entity friendly name | Header title                                 |
| `show_current` | boolean | `true`               | Show room temperature                        |
| `show_humidity`| boolean | `true`               | Show humidity (auto-hidden if not reported)  |

## Notes

- Airflow visibility is keyed off `hvac_action`. If your integration does not report it, the card assumes it is blowing whenever the mode is not `off`.
- Temperature stepping uses `target_temp_step`, `min_temp` and `max_temp` from the entity. Range setpoints (`target_temp_low`/`high`) are displayed read-only.

## License

MIT © ARSmartHome
