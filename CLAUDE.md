# CLAUDE.md

Personal website (elikloft.com), hosted on GitHub Pages. Plain HTML/CSS/JS — no build step, no framework. Pushing to `main` deploys.

@README.md

## Layout
- `index.html` + `mystyle.css` — homepage (Bootstrap 4 CDN + Font Awesome 5)
- `401k/` — SPY buy-timing analysis (`spy-data.json` is the dataset)
- `telemetry/` — race telemetry demo (Portland International Raceway)
- `timing/` — LoRa drag-strip timing system UI (backburnered — page kept but unlinked from homepage)
## Things to know
- Weather data: a GitHub Action fetches from Weather Underground hourly and force-pushes a single-commit `weather-data` branch; the homepage fetches `weather.json` from that branch's raw.githubusercontent.com URL. It is deliberately not committed to `main` (keeps history clean, avoids hourly Pages rebuilds).
- `401k/spy-data.json` is intentionally frozen — the page answered a one-time question and the data isn't maintained (last refreshed 2026-07-17).
- Styling on the homepage is mostly inline `style=` attributes; match that pattern for small additions rather than growing `mystyle.css`.

## Local preview
`npx serve -l 3000 .` (also configured in `.claude/launch.json`)
