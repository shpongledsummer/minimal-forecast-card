## Minimal Forecast Card

<!-- SCREENSHOT PLACEHOLDER: main card preview, ~400px wide -->
<!-- <img width="400" alt="image" src="URL_HERE" /> -->

A forecast-only card for Home Assistant, built as the companion to the [Atmospheric Weather Card](https://github.com/shpongledsummer/atmospheric-weather-card). The focus is on a clean, high-quality forecast and nothing else.

This card doesn't have many features on purpose, the goal is to do one thing (forecast) and do it well. It supports horizontal and vertical layouts with CSS-only scrolling, a sparkline temperature curve, three visual styles, and plenty of options to adapt it to your dashboard.

<img width="400" alt="image" src="https://github.com/user-attachments/assets/3c47ffde-c39a-4cfe-b6d0-b40bffe3fd9a" /><br>
<img width="400" alt="image" src="https://github.com/user-attachments/assets/1ee0296d-7f72-4b39-9d2b-0240d3ebeb01" />



<br>

## Contents

[Installation](#installation)<br>
[Quick Start](#quick-start)<br>
[Configuration](#configuration)<br>
[Styles](#styles)<br>
[Embedded Mode](#embedded-mode)<br>
[Custom Icons](#custom-icons)

<br>

## Installation

<details>
<summary><b>Method 1 — HACS (Recommended)</b></summary>

1. Open **HACS** in Home Assistant.
2. Navigate to **Frontend** → **Custom repositories** (via the top-right menu).
3. Add this repository URL and select the **Dashboard** category.
4. Click **Install**.
5. Reload your dashboard.

</details>

<details>
<summary><b>Method 2 — Manual</b></summary>

1. Download `minimal-forecast-card.js` from the latest release.
2. Place the file in your `config/www/` folder.
3. Navigate to **Settings** → **Dashboards** → **⋮** → **Resources**.
4. Add a new resource:
    * **URL:** `/local/minimal-forecast-card.js`
    * **Type:** JavaScript Module
5. Hard-refresh your browser.

</details>

<br>

## Quick Start

A basic card with all defaults:

```yaml
type: custom:minimal-forecast-card
entity: weather.home
```

This gives you a horizontal 7-day forecast, 5 items visible at a time, a sparkline temperature curve, and the `clean` style. Everything else is optional.

<!-- SCREENSHOT PLACEHOLDER: basic default card -->
<!-- <img width="400" alt="image" src="URL_HERE" /> -->

<br>

## Configuration

#### Required

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| **`entity`** | `string` | — | **Required.** Your weather integration entity (e.g., `weather.home`). |

<details>
<summary><strong>Forecast Settings</strong></summary>

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `forecast_type` | `string` | `daily` | Which forecast to request from your weather entity. Accepts `daily` or `hourly`. |
| `items_to_show` | `number` | `7` | Total number of forecast entries to display. Accepts values from `1` to `14`. |
| `visible` | `number` | `5` | How many items are visible at once before scrolling begins. If `items_to_show` is less than or equal to this value, all items fit without scrolling. |
| `direction` | `string` | `horizontal` | Layout direction. `horizontal` lays items side by side, `vertical` stacks them top to bottom. |
| `hide_min_temp` | `boolean` | `false` | Hides the low temperature. Useful for hourly forecasts (which typically don't include a low value) or for a cleaner look. |

**Scrolling behavior**

Scrolling is handled entirely in CSS (no JavaScript scroll logic). When there are more items than `visible`, the card becomes scrollable — horizontally or vertically depending on the `direction` setting. Items snap into place on touch devices. If all items fit, they stretch equally to fill the available width (horizontal) or stack naturally (vertical).

> [!NOTE]
> In vertical mode, each item becomes a row — with the label on the left, the icon next to it, and temperatures aligned to the right. The sparkline is automatically hidden in vertical mode.

</details>

<details>
<summary><strong>Spacing & Sizing</strong></summary>

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `font_size` | `string` · `CSS length` | `medium` | Base font size for the entire card. All internal sizing (icons, spacing, text) scales from this value. Accepts named sizes: `small`, `medium`, `large`, `xlarge` — or any CSS length like `14px` or `1.2em`. |
| `icon_size` | `number` · `CSS length` | *scales with font* | Icon size. Numbers are treated as pixels (e.g., `32` becomes `32px`). If not set, icons scale proportionally with the base font size. |
| `item_spacing` | `CSS length` | *per style* | Gap between forecast items. Any CSS value works: `0`, `4px`, `2%`, `0.25em`. The `clean` style defaults to `0`, while `soft` and `glass` default to `0.25em`. |
| `inner_spacing` | `CSS length` | `10px` | Gap between the label, icon, and temperature inside each forecast item. |
| `item_height` | `CSS length` | *auto* | Overrides the height of each forecast item. Useful for matching specific row heights in vertical mode or setting taller columns in horizontal mode. |

> [!TIP]
> The card uses CSS `em` units internally, so everything scales relative to `font_size`. If you change only `font_size`, the entire card (icons, spacing, text) adjusts proportionally without needing to touch anything else.

</details>

<details>
<summary><strong>Sparkline</strong></summary>

The sparkline is a smooth curve drawn behind the forecast items, connecting the high temperatures across all entries. It gives a quick visual sense of the temperature trend over the coming days or hours.

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `sparkline` | `boolean` | `true` | Show the temperature curve. Only renders in horizontal mode — automatically hidden in vertical. Requires at least 3 data points. |
| `sparkline_color` | `CSS color` | `var(--primary-color)` | Color of the sparkline. Accepts any CSS color: hex, rgba, or a CSS variable. |
| `sparkline_width` | `number` | `2` | Stroke width of the sparkline path in pixels. |

```yaml
sparkline: true
sparkline_color: "#ff9800"
sparkline_width: 3
```

</details>

<details>
<summary><strong>Appearance</strong></summary>

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `style` | `string` | `clean` | Visual style for the forecast items. Accepts `clean`, `soft`, or `glass`. See [Styles](#styles) for details and examples. |
| `dividers` | `boolean` | `true` | Show thin separator lines between items. Only applies to the `clean` style — `soft` and `glass` use tile backgrounds instead, so dividers are automatically hidden for those. |
| `embedded` | `boolean` | `false` | Strips card chrome (padding, background, shadow, border) for nesting inside another card. See [Embedded Mode](#embedded-mode). |
| `card_shadow` | `CSS box-shadow` | *none* | Custom box-shadow for the outer card. Example: `0 2px 8px rgba(0,0,0,0.1)`. |
| `item_shadow` | `CSS box-shadow` | *none* | Custom box-shadow for each individual forecast item. |
| `custom_icon_path` | `string` | — | Path to a folder containing custom SVG weather icons. See [Custom Icons](#custom-icons). |

</details>

<details>
<summary><strong>Interaction</strong></summary>

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `tap_action` | `object` | `{ action: more-info }` | What happens when you tap the card. Supports all standard Home Assistant [tap actions](https://www.home-assistant.io/dashboards/actions/). |

Supported actions: `more-info`, `navigate`, `url`, `call-service`, `none`.

```yaml
# Open the weather entity detail popup (default)
tap_action:
  action: more-info

# Navigate to a specific view
tap_action:
  action: navigate
  navigation_path: /lovelace/weather

# Disable tap entirely
tap_action:
  action: none
```

> [!NOTE]
> The card distinguishes between taps and scroll gestures. Scrolling through the forecast won't accidentally trigger the tap action. When the action is set to `none`, the pointer cursor is also hidden.

</details>

<br>

## Styles

The `style` option controls how individual forecast items are rendered. There are three options.

<!-- SCREENSHOT PLACEHOLDER: side-by-side comparison of all 3 styles -->
<!-- <img width="600" alt="image" src="URL_HERE" /> -->

<details>
<summary><b>clean</b> (default)</summary>

<br>

A flat, minimal look with no background on the items. Divider lines appear between items when `dividers: true` (the default).

<!-- SCREENSHOT PLACEHOLDER: clean style -->
<!-- <img width="400" alt="image" src="URL_HERE" /> -->

```yaml
type: custom:minimal-forecast-card
entity: weather.home
style: clean
dividers: true
```

</details>

<details>
<summary><b>soft</b></summary>

<br>

Each item gets a subtle, tinted background tile with rounded corners. Dividers are automatically hidden since the tiles already provide visual separation. A small default gap (`0.25em`) is applied between items.

<!-- SCREENSHOT PLACEHOLDER: soft style -->
<!-- <img width="400" alt="image" src="URL_HERE" /> -->

```yaml
type: custom:minimal-forecast-card
entity: weather.home
style: soft
```

</details>

<details>
<summary><b>glass</b></summary>

<br>

Same tile layout as `soft`, but with a frosted-glass effect using `backdrop-filter`. The outer card also becomes translucent so you can see through to whatever is behind it. Works best on dashboards with a visible background image or gradient. Dividers are automatically hidden.

<!-- SCREENSHOT PLACEHOLDER: glass style -->
<!-- <img width="400" alt="image" src="URL_HERE" /> -->

```yaml
type: custom:minimal-forecast-card
entity: weather.home
style: glass
```

> [!NOTE]
> The glass effect on the outer card is automatically disabled when `embedded: true`, since the parent card is expected to handle its own background.

</details>

<br>

### CSS Variables

In addition to the YAML settings listed in the [Configuration](#configuration) section, you can fine-tune the card's appearance using CSS custom properties. Set these in your Home Assistant theme to apply them globally, or use `card_mod` to target a specific card instance.

<details>
<summary><b>Color & Weight Variables</b></summary>

| Variable | Default | Description |
| :--- | :--- | :--- |
| `--mfc-label-color` | `--secondary-text-color` | Color of the day/hour label. |
| `--mfc-hi-color` | `--primary-text-color` | Color of the high temperature. |
| `--mfc-lo-color` | `--secondary-text-color` | Color of the low temperature. |
| `--mfc-icon-color` | `--state-icon-color` | Color of the weather icon (MDI icons only, has no effect on custom SVGs). |
| `--mfc-divider-color` | `--divider-color` | Color of the separator lines between items. |
| `--mfc-spark-color` | `--primary-color` | Color of the sparkline curve. |
| `--mfc-spark-width` | `2` | Stroke width of the sparkline. |
| `--mfc-card-shadow` | `--ha-card-box-shadow` | Box shadow of the outer card. |
| `--mfc-item-shadow` | `none` | Box shadow of each forecast item. |
| `--mfc-label-font-weight` | `600` | Font weight of the day/hour label. |
| `--mfc-hi-font-weight` | `600` | Font weight of the high temperature. |
| `--mfc-lo-font-weight` | `400` | Font weight of the low temperature. |

</details>

<details>
<summary><b>Card Mod Example</b></summary>

This example shows how to apply custom styles to a specific card instance using `card_mod`.

```yaml
type: custom:minimal-forecast-card
entity: weather.home
card_mod:
  style: |
    :host {
      --mfc-hi-color: #e65100;
      --mfc-lo-color: #1565c0;
      --mfc-spark-color: rgba(255, 152, 0, 0.5);
      --mfc-label-font-weight: 500;
    }
```

</details>

> [!IMPORTANT]
> These are CSS custom properties, not YAML card options. To use them globally, add them to your HA theme file. For card-level settings like `sparkline_color`, `card_shadow`, and `item_shadow`, see the [Configuration](#configuration) section — those are YAML options you set directly on the card.

<br>

## Embedded Mode

When `embedded: true`, the card removes all of its own visual chrome — padding, background, box shadow, and border are stripped away. This is intended for nesting the forecast inside another card (like a vertical stack or the Atmospheric Weather Card) without the visual doubling of card-inside-card borders.

<!-- SCREENSHOT PLACEHOLDER: embedded vs non-embedded comparison -->
<!-- <img width="400" alt="image" src="URL_HERE" /> -->

```yaml
type: custom:minimal-forecast-card
entity: weather.home
embedded: true
style: glass
```

The glass style's translucent outer background is also disabled in embedded mode, since the parent card handles its own background.

<br>

## Custom Icons

By default, the card uses Home Assistant's built-in MDI weather icons. If you prefer your own set, point the card to a folder containing SVG files named after each weather condition.

```yaml
custom_icon_path: /local/icons/weather/
```

The card loads icons as `{path}/{condition}.svg` — for example, if the forecast says `rainy`, it loads `/local/icons/weather/rainy.svg`.

<details>
<summary><b>Expected filenames</b></summary>

<br>

These are the weather conditions the card handles. Provide an SVG file for each one:

`clear-night` · `cloudy` · `exceptional` · `fog` · `hail` · `lightning` · `lightning-rainy` · `partlycloudy` · `pouring` · `rainy` · `snowy` · `snowy-rainy` · `sunny` · `windy` · `windy-variant`

If a condition doesn't have a matching file, the image element will render but show nothing. There is no automatic fallback to MDI when using custom icons.

</details>

<br>

## Full Example

A card using most of the available options:

```yaml
type: custom:minimal-forecast-card
entity: weather.home
forecast_type: daily
items_to_show: 7
visible: 5
direction: horizontal
style: soft
dividers: false
item_spacing: 4px
inner_spacing: 8px
item_height: 120px
font_size: medium
icon_size: 30
hide_min_temp: false
sparkline: true
sparkline_color: var(--primary-color)
sparkline_width: 2
card_shadow: 0 2px 6px rgba(0,0,0,0.08)
item_shadow: none
embedded: false
custom_icon_path: /local/icons/weather/
tap_action:
  action: more-info
```
