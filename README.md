# Quotation Builder

A single-page quotation builder where the item catalog and company info live in a **Google Sheet**. Paste your data into the sheet, and the app reads it live — no database, no admin login, no code to touch.

## How it works
- Your Google Sheet has two tabs: **Items** (Channel, Category, Sub Category, Item Name, Unit, Price) and **Settings** (Key, Value — company name, address, currency, terms, etc.).
- A tiny serverless function (`/api/data`) fetches both tabs as CSV and serves them as JSON to the app.
- The **New Quotation** tab has cascading filters — pick a Channel, then a Category (narrowed to that channel), then a Sub-Category (narrowed further) — to quickly find the item you want among a large catalog.
- The app's **Catalog** tab shows everything currently loaded, grouped by Channel → Category → Sub-Category, plus a **Refresh Now** button and an **Open Google Sheet** shortcut.
- Building a quotation and generating the PDF needs no login at all — anyone with the link can use it. Editing the catalog just means editing the sheet.
- Saved quotation history is kept in each browser's local storage (not shared) — the catalog is the only thing centralized.

## One-time setup

### 1. Create your Google Sheet
1. Create a new Google Sheet.
2. Rename the first tab to **Items**. Header row: `Channel, Category, Sub Category, Item Name, Unit, Price`. A ready-made example is in `sheet-templates/Items-template.csv` — you can paste its contents straight in, or use **File → Import** in Sheets.
   - **Channel** is the top-level split (e.g. Retail vs Wholesale, or Online vs In-Store) — use whatever grouping makes sense for your business.
   - Leave **Sub Category** blank on a row if you don't need that level for that item; it'll just be grouped under "(no sub-category)" in the Catalog view.
3. Add a second tab named **Settings** with two columns: `Key, Value`. Use `sheet-templates/Settings-template.csv` as a starting point. Recognized keys: `CompanyName, Address, Phone, Email, Website, Currency, Prefix, LogoURL, Terms, Bank, SheetURL`.
   - `LogoURL` (optional): a direct link to a logo image hosted somewhere public (e.g. Imgur). It's shown in the Catalog tab and embedded in generated PDFs when the host allows it.
   - `SheetURL` (optional but recommended): paste the sheet's own edit URL here — it powers the "Open Google Sheet" shortcut inside the app.
4. **Share it:** File → Share → change to "Anyone with the link" → **Viewer**. This is required — without it, the app can't read the sheet.

### 2. Get the CSV export URLs
For each tab, open it in your browser and note two things from the URL:
- The **Sheet ID** — the long string in `.../spreadsheets/d/<SHEET_ID>/edit`
- The **gid** — the number after `#gid=` when that specific tab is open

Then build each tab's CSV URL:
```
https://docs.google.com/spreadsheets/d/<SHEET_ID>/export?format=csv&gid=<GID>
```
You'll have one URL for the Items tab and one for the Settings tab (same Sheet ID, different gid).

### 3. Set environment variables in Vercel
Project → **Settings → Environment Variables**:
| Name | Value |
|---|---|
| `ITEMS_SHEET_CSV_URL` | the Items tab's CSV export URL |
| `SETTINGS_SHEET_CSV_URL` | the Settings tab's CSV export URL |

### 4. Deploy
Push this project to GitHub, import it in Vercel (Framework preset: **Other**, no build command needed), redeploy after setting the env vars above.

## Day to day use
Just edit the Google Sheet — add a row for a new item, change a price, update the terms text. Open the app (or hit **Refresh Now** on the Catalog tab if it's already open) and the change is live. No redeploying, no logins.

## Known limitations
- **Quotation numbers are local to each browser/device** — there's no shared counter, since the sheet itself isn't writable by the app. If you build quotations from more than one device, numbers can repeat across devices.
- **Logo in the PDF** depends on the image host allowing cross-origin fetches. Most direct-image hosts (e.g. Imgur direct links) work fine; some (like private Google Drive links) will not embed — the company name and details still print regardless.
- Google's CSV export can lag by a few seconds after an edit; if a change doesn't show up, wait a moment and hit Refresh again.

## Local development
```bash
npm i -g vercel   # if you don't have it
cp .env.example .env.local   # fill in your two CSV URLs
vercel dev
```

## Files
- `index.html` — the app.
- `api/data.js` — fetches both sheet tabs and returns them as JSON.
- `lib/sheets.js` — CSV fetch + parser helper.
- `sheet-templates/` — starter CSVs to paste into your Google Sheet.
