# EU Gas Demand — Methodology Site

A simple, shareable web page that explains how monthly gas demand is calculated for every EU country plus the UK.

## How to view it

### Option 1 — Open locally in a browser
Just double-click `index.html`. Everything is plain HTML/CSS/JavaScript with no server required.

### Option 2 — Publish on GitHub Pages (shareable URL)
1. Push this folder to a GitHub repository (it already lives inside the ENTSOG repo).
2. Go to the repository on GitHub → **Settings → Pages**.
3. Under **Source**, select the branch (e.g. `master`) and folder. You can either:
   - Set the source folder to `/Methodology` (page will be at `https://<user>.github.io/<repo>/`)
   - Or set it to `/ (root)` and link to `Methodology/index.html`
4. Save. GitHub will publish the site within a minute or two and show you the URL.

To share with someone, just send them the GitHub Pages URL.

## What it does

Visitors:
1. Pick a country from a dropdown (all 27 EU countries + UK).
2. Choose whether they want to see methodology for **historical months** (those already confirmed by official sources) or **current months** (estimated).
3. See a clear, plain-English breakdown of where each sector's data comes from, plus a worked example using real February 2024 numbers.

## Updating the data

Methodology text and example numbers live in `data.js`. Edit that file to change wording or refresh the example month.

To refresh the example values to a more recent month:

```bash
py -c "
import pandas as pd
df = pd.read_csv('data/master/master_monthly.csv')
piv = df[df['date']=='2025-01-01'].pivot_table(  # change date
    index='country', columns='sector', values='value_twh', aggfunc='first'
).round(2)
print(piv.to_string())
"
```

Then update each country's `example` block in `data.js`.

## Files in this folder

| File | Purpose |
|---|---|
| `index.html` | The page itself |
| `style.css` | All styling |
| `data.js` | Country-by-country methodology data + example numbers |
| `app.js` | Interactive logic (dropdown, period selection, content rendering) |
| `README.md` | This file |

No build step. No frameworks. No server. Just open and read.
