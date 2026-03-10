## Minimal Forecast Card

A forecast-only card for Home Assistant, built as a companion to the [Atmospheric Weather Card](https://github.com/shpongledsummer/atmospheric-weather-card). 

The focus here is just on showing a clean forecast. It's deliberately light on features because it's meant to do one thing and do it well. This card has horizontal and vertical layouts with pure CSS scrolling, a sparkline temperature curve, three visual styles, and plenty of styling options to tweak it for your dashboard.

<img width="400" alt="Image" src="https://github.com/user-attachments/assets/e66a386d-d165-4251-9b9d-4eaf8ed5cac8" /><br>
<img width="400" alt="Image" src="https://github.com/user-attachments/assets/0e07ddde-6dd0-4767-a4bc-a770e0d88f2d" /><br>

*The examples are provided [here.](https://github.com/shpongledsummer/atmospheric-weather-card#usage-modes)*

<br>

## Contents

[Installation](#installation)<br>
[Quick Start](#quick-start)<br>
[Configuration / Styling](#configuration--styling)<br>
[Style Presets](#style-presets)<br>
[CSS Variables](#css-variables)<br>
[Embedded Mode](#embedded-mode)<br>
[Custom Icons](#custom-icons)

<br>

## Installation

<details>
<summary><b>Method 1 - HACS (Recommended)</b></summary>

1. Open **HACS** in Home Assistant.
2. Navigate to **Frontend** → **Custom repositories** (via the top-right menu).
3. Add this repository URL and select the **Dashboard** category.
4. Click **Install**.
5. Reload your dashboard.

</details>

<details>
<summary><b>Method 2 - Manual</b></summary>

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

<img width="400" alt="image" src="https://github.com/user-attachments/assets/a5397566-38f2-4f99-beba-8bc6d6ab23e4" />

A basic card:

```yaml
type: custom:minimal-forecast-card
entity: weather.your_weather_entity
forecast_type: daily
items_to_show: 7
visible: 4
style: clean
dividers: true
divider_inset: 0px
divider_color: rgba(0, 0, 0, 0.05)
item_spacing: 8px
inner_spacing: 12px
item_padding: 20px
direction: horizontal
embedded: false
sparkline: true
sparkline_color: rgba(213, 184, 82, 0.4)
font_size: 16px
icon_size: 46px
custom_icon_path: /local/weather-icons/

```

This gives you a horizontal 7-day forecast with 4 items visible at a time, a sparkline temperature curve, and the `clean` style.

<br>

## Configuration / Styling

#### Required

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| **`entity`** | `string` | — | **Required.** Your weather integration entity (e.g., `weather.your_weather_entity`). |

<details>
<summary><strong>Forecast Settings</strong></summary>

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `forecast_type` | `string` | `daily` | Which forecast to request. `daily` or `hourly`. |
| `items_to_show` | `number` | `7` | Total number of forecast entries to display (`1` to `14`). |
| `visible` | `number` | `5` | How many items are visible at once before scrolling kicks in. If `items_to_show` is less than or equal to this value, all items fit without scrolling. |
| `direction` | `string` | `horizontal` | Layout direction. `horizontal` lays items side by side, `vertical` stacks them top to bottom. |
| `hide_min_temp` | `boolean` | `false` | Hides the low temperature. Useful for hourly forecasts (which usually don't include a low value) or if you just want a cleaner look. |

**Scrolling behavior**

Scrolling is handled entirely in CSS (no JavaScript scroll logic). When there are more items than `visible`, the card becomes scrollable, either horizontally or vertically depending on the `direction` setting. Items snap into place on touch devices. If all items fit, they stretch equally to fill the available width (horizontal) or stack naturally (vertical).

> In vertical mode, each item becomes a row with the icon and label on the left and temperatures aligned to the right. The sparkline is automatically hidden in vertical mode.

</details>

<details>
<summary><strong>Spacing & Sizing</strong></summary>

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `font_size` | `string` / `CSS length` | `medium` | Base font size for the entire card. All internal sizing (icons, spacing, text) scales from this. Accepts named sizes: `small`, `medium`, `large`, `xlarge`, or any CSS length like `14px` or `1.2em`. |
| `icon_size` | `number` / `CSS length` | *scales with font* | Icon size. Numbers are treated as pixels (e.g., `32` becomes `32px`). If not set, icons scale proportionally with the base font size. |
| `item_spacing` | `CSS length` | *per style* | Gap between forecast items. Any CSS value works: `0`, `4px`, `2%`, `0.25em`. The `clean` style defaults to `0`, while `soft` and `glass` default to `0.25em`. |
| `inner_spacing` | `CSS length` | `10px` | Gap between the label, icon, and temperature inside each forecast item. |
| `item_height` | `CSS length` | *auto* | Overrides the height of each forecast item. Useful for matching specific row heights in vertical mode or setting taller columns in horizontal mode. |
| `card_padding` | `CSS padding` | `16px` | Padding of the outer card. Accepts any CSS padding shorthand: `20px`, `10px 0px`, `8px 12px 8px 12px`. Ignored when `embedded: true` (padding is forced to 0). |
| `item_padding` | `CSS padding` | *per direction* | Padding inside each forecast item. Defaults to `0.75em 0.5em` in horizontal mode and `0.875em 1em` in vertical mode. Accepts any CSS padding shorthand. |

</details>

<details>
<summary><strong>Sparkline</strong></summary>

The sparkline is a smooth curve drawn behind the forecast items, connecting the high temperatures across all entries. It gives a quick visual sense of the temperature trend.

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `sparkline` | `boolean` | `true` | Show the temperature curve. Only renders in horizontal mode and is automatically hidden in vertical. Requires at least 3 data points. |
| `sparkline_color` | `CSS color` | `var(--primary-color)` | Color of the sparkline. Any CSS color works: hex, rgba, or a CSS variable. |
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
| `style` | `string` | `clean` | Visual style for the forecast items. `clean`, `soft`, or `glass`. See [Styles](#styles) for details. |
| `dividers` | `boolean` | `true` | Show separator lines between items. Dividers are always hidden in `soft` style (the tiles provide enough separation). In `glass` style, dividers show when the card is standalone but are hidden when `embedded: true` (since the individual tiles take over). |
| `divider_color` | `CSS color` | `var(--divider-color)` | Color of the divider lines. Falls back to `rgba(255,255,255,0.2)` if `--divider-color` is not set in your theme. |
| `divider_width` | `number` / `CSS length` | `3px` | Thickness of the divider lines. Numbers are treated as pixels. |
| `divider_inset` | `CSS length` | `0` | Inset from both ends of each divider. In horizontal mode this is the top/bottom gap; in vertical mode it's the left/right gap. Accepts any CSS length: `5%`, `10px`, `0.5em`. Default is `0` (dividers go edge to edge). |
| `embedded` | `boolean` | `false` | Strips card chrome (padding, background, shadow, border) for nesting inside another card. See [Embedded Mode](#embedded-mode). |
| `card_shadow` | `CSS box-shadow` | *none* | Box-shadow for the outer card. Example: `0 2px 8px rgba(0,0,0,0.1)`. |
| `item_shadow` | `CSS box-shadow` | *none* | Box-shadow for each individual forecast item. |
| `card_background` | `CSS background` | *theme default* | Background of the outer card. Accepts any CSS background value: colors, gradients, `rgba(...)`, etc. Overrides the theme and glass defaults. Ignored when `embedded: true`. |
| `item_background` | `CSS background` | *per style* | Background of each forecast item. Only has a visible effect in `soft` and embedded `glass` styles (which have item backgrounds by default). In `clean` or standalone `glass`, items have no background unless you set one here. |
| `custom_icon_path` | `string` | — | Path to a folder containing custom SVG weather icons. See [Custom Icons](#custom-icons). |
| `icon_filter` | `CSS filter` | *none* | Applies a visual filter to the weather icons (e.g., `brightness(0.8)`, `grayscale(100%)`). *Note: Custom SVGs have a subtle drop-shadow by default if this is left unset.* |

```yaml
# Example: thin, inset dividers
dividers: true
divider_color: "rgba(255,255,255,0.1)"
divider_width: 2px
divider_inset: 10%
```

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

> The card tells taps and scroll gestures apart. Scrolling through the forecast won't accidentally trigger the tap action. When the action is set to `none`, the pointer cursor is also hidden.

</details>

<br>

## Style Presets

The `style` option controls how individual forecast items look. There are three options.

<details>
<summary><b>clean</b> (default)</summary>

<br>

A flat, minimal look with no background on the items. Divider lines appear between items when `dividers: true` (the default).

```yaml
type: custom:minimal-forecast-card
entity: weather.your_weather_entity
style: clean
dividers: true
```

</details>

<details>
<summary><b>soft</b></summary>

<br>

Each item gets a subtle, tinted background tile with rounded corners. Dividers are automatically hidden since the tiles already provide visual separation. A small default gap (`0.25em`) is applied between items.

```yaml
type: custom:minimal-forecast-card
entity: weather.your_weather_entity
style: soft
```

</details>

<details>
<summary><b>glass</b></summary>

<br>

A frosted-glass effect using `backdrop-filter`. How it works depends on whether the card is embedded or not:

**Standalone (not embedded):** The outer card gets a translucent background with blur. The individual forecast items stay clean with no background, so the card's blur shows through. Dividers work in this mode.

**Embedded:** The card chrome is stripped (as with any embedded card), so there's no outer card to blur. Instead, each item gets its own frosted tile with blur and a subtle tinted background. Dividers are hidden since the tiles provide separation.

Works best on dashboards with a visible background image or gradient.

```yaml
type: custom:minimal-forecast-card
entity: weather.your_weather_entity
style: glass
```

</details>

<br>

## CSS Variables

On top of the YAML options in the [Configuration](#configuration) section, you can fine-tune the card using CSS custom properties. Set these in your Home Assistant theme for global use, or use `card_mod` to target a specific card.

<details>
<summary><b>Color & Weight Variables</b></summary>

| Variable | Default | Description |
| :--- | :--- | :--- |
| `--mfc-label-color` | `--secondary-text-color` | Color of the day/hour label. |
| `--mfc-hi-color` | `--primary-text-color` | Color of the high temperature. |
| `--mfc-lo-color` | `--secondary-text-color` | Color of the low temperature. |
| `--mfc-icon-color` | `--secondary-text-color` | Color of the weather icon (MDI icons only, no effect on custom SVGs). |
| `--mfc-icon-filter` | *none* | CSS filter applied to the weather icons. Custom SVGs fall back to a subtle drop-shadow if this is unset. |
| `--mfc-divider-color` | `var(--divider-color, rgba(255,255,255,0.2))` | Color of the separator lines. |
| `--mfc-divider-width` | `3px` | Thickness of the separator lines. |
| `--mfc-divider-inset` | `0` | Inset at both ends of each divider line. |
| `--mfc-spark-color` | `var(--primary-color)` | Color of the sparkline curve. |
| `--mfc-spark-width` | `2` | Stroke width of the sparkline. |
| `--mfc-card-shadow` | `--ha-card-box-shadow` | Box shadow of the outer card. |
| `--mfc-item-shadow` | `none` | Box shadow of each forecast item. |
| `--mfc-card-bg` | *theme card background* | Background of the outer card. Overrides the theme default and the glass effect. |
| `--mfc-item-bg` | *per style* | Background of each forecast item. Overrides the `soft` and embedded `glass` tile backgrounds. |
| `--mfc-label-font-weight` | `600` | Font weight of the day/hour label. |
| `--mfc-hi-font-weight` | `600` | Font weight of the high temperature. |
| `--mfc-lo-font-weight` | `400` | Font weight of the low temperature. |

</details>

<details>
<summary><b>Card Mod Example</b></summary>

This shows how to apply custom styles to a specific card using `card_mod`.

```yaml
type: custom:minimal-forecast-card
entity: weather.your_weather_entity
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
> For the YAML equivalents (like `sparkline_color`, `divider_color`, `divider_width`, `divider_inset`, `card_shadow`, `item_shadow`, `card_background`, `item_background`), see the [Configuration](#configuration) section.
<br>

## Embedded Mode

Setting `embedded: true` removes all card container styles (padding, background, box shadow, and border). This is meant for nesting the forecast inside another card (like a vertical stack or the Atmospheric Weather Card) so you don't get that card-inside-card look.

```yaml
type: custom:minimal-forecast-card
entity: weather.your_weather_entity
embedded: true
style: glass
```

When using the `glass` style with `embedded: true`, the card's glass effect is disabled (since the parent card handles its own background). Instead, each individual forecast item gets its own frosted tile.

<br>

## Custom Icons

By default the card uses Home Assistant's built-in MDI weather icons. If you prefer your own set, point the card to a folder containing SVG files named after each weather condition.

```yaml
custom_icon_path: /local/icons/weather/
```

The card loads icons as `{path}/{condition}.svg`. For example, if the forecast says `rainy`, it loads `/local/icons/weather/rainy.svg`.

<details>
<summary><b>Expected filenames</b></summary>

<br>

These are the weather conditions the card handles. Provide an SVG file for each one:

`clear-night` · `cloudy` · `exceptional` · `fog` · `hail` · `lightning` · `lightning-rainy` · `partlycloudy` · `pouring` · `rainy` · `snowy` · `snowy-rainy` · `sunny` · `windy` · `windy-variant`

If a condition doesn't have a matching file, the image element will render but show nothing. There is no automatic fallback to MDI when using custom icons.

</details>
