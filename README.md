# Quotation Builder

A single-page quotation builder with a shared backend: item categories, prices, and company settings live in a Neon Postgres database and can be updated any time from an admin-locked screen inside the app. Building a quotation and generating the PDF requires no login; editing the catalog does.

## Architecture
- **Frontend:** one static `index.html` (no build step) — the customer-facing / quotation-building UI.
- **Backend:** Vercel Serverless Functions under `/api`, talking to a Neon Postgres database.
- **Auth:** a single admin password (an environment variable), entered once per browser session to unlock editing.
- **Quotation history:** kept in the browser's `localStorage` (not shared) — only the catalog (categories/items/settings) is centralized.

## One-time setup

### 1. Create the database (Neon)
1. In your Vercel project, go to **Storage → Create Database → Postgres (Neon)**, or create a database directly at [neon.tech](https://neon.tech) and connect it to your Vercel project later.
2. Once created, open the Neon **SQL Editor** and run everything in `schema.sql` from this project (creates the `settings`, `categories`, and `items` tables).

### 2. Set environment variables
In Vercel → your project → **Settings → Environment Variables**, add:
| Name | Value |
|---|---|
| `DATABASE_URL` | Your Neon connection string (auto-filled if you created the DB through Vercel's Storage tab) |
| `ADMIN_PASSWORD` | A password of your choice — this is what unlocks editing in the app |

### 3. Deploy
Push this project to GitHub, then import it in Vercel (Framework preset: **Other**). No build command needed. See `.env.example` for the variables above.

## Using the app
- **New Quotation** and **Saved Quotations** tabs work for anyone — no password needed.
- **Items & Pricing** and **Company Settings** tabs ask for the admin password the first time you open them each browser session. After entering it correctly, editing unlocks.
- Any change made there (add/edit/delete a category or item, update company info or logo) is saved straight to the database — the next person who opens the app (or refreshes) sees it immediately.

## Local development
```bash
npm install
npm i -g vercel   # if you don't have it
vercel dev
```
`vercel dev` runs both the static frontend and the `/api` functions locally, using the variables from a `.env.local` file (copy `.env.example` to `.env.local` and fill in real values).

## Files
- `index.html` — the app.
- `api/data.js` — public read of settings + categories + items.
- `api/settings.js` — update company settings (admin only).
- `api/categories/`, `api/items/` — create/update/delete catalog entries (admin only).
- `api/next-number.js` — atomically issues the next quotation number.
- `lib/db.js`, `lib/auth.js` — shared database connection and password-check helpers.
- `schema.sql` — run once against your Neon database.
