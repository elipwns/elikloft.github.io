# CLAUDE.md

Personal website (elikloft.com), hosted on GitHub Pages. Plain HTML/CSS/JS — no build step, no framework. Pushing to `main` deploys.

@README.md

## Layout
- `index.html` + `mystyle.css` — homepage (Bootstrap 4 CDN + Font Awesome 5)
- `401k/` — SPY buy-timing analysis (`spy-data.json` is the dataset)
- `telemetry/` — race telemetry demo (Portland International Raceway)
- `timing/` — LoRa drag-strip timing system UI
- `weather.json` — local weather station data

## Things to know
- A GitHub Action commits `weather.json` to `main` hourly, so `main` moves constantly — always `git fetch` and branch from fresh `origin/main`; local refs go stale fast.
- `401k/spy-data.json` is updated manually (the auto-update workflow was removed). Regenerate with the Yahoo Finance chart API script — see git history of `.github/workflows/update-spy.yml` (removed in 2621b41) for the reference implementation. Format: `[["YYYY-MM-DD", adjClose], ...]` from 2019-01-01, compact JSON.
- Styling on the homepage is mostly inline `style=` attributes; match that pattern for small additions rather than growing `mystyle.css`.

## Local preview
`npx serve -l 3000 .` (also configured in `.claude/launch.json`)
