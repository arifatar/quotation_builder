import { fetchCsv } from '../lib/sheets.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const itemsUrl = process.env.ITEMS_SHEET_CSV_URL;
  const settingsUrl = process.env.SETTINGS_SHEET_CSV_URL;

  if (!itemsUrl || !settingsUrl) {
    res.status(500).json({
      error: 'ITEMS_SHEET_CSV_URL and/or SETTINGS_SHEET_CSV_URL are not set in Vercel environment variables. See README.md.'
    });
    return;
  }

  try {
    const [itemRows, settingRows] = await Promise.all([fetchCsv(itemsUrl), fetchCsv(settingsUrl)]);

    // --- Items sheet: header row, then Channel | Category | Sub Category | Item Name | Unit | Price ---
    const dataRows = itemRows.slice(1); // skip header row
    const items = [];
    let seq = 1;

    dataRows.forEach((r) => {
      const channel = (r[0] || '').trim();
      const category = (r[1] || '').trim();
      const subCategory = (r[2] || '').trim();
      const itemName = (r[3] || '').trim();
      const unit = (r[4] || '').trim() || 'pcs';
      const price = parseFloat(String(r[5] || '0').replace(/[^0-9.\-]/g, '')) || 0;

      if (!itemName) return; // a row with no item name is not a usable row

      items.push({
        id: [channel, category, subCategory, itemName, seq++].join('::'),
        channel: channel || 'General',
        category: category || 'Uncategorized',
        subCategory: subCategory || '',
        name: itemName,
        unit,
        price
      });
    });

    // --- Settings sheet: Key | Value rows (header row optional) ---
    const settingsMap = {};
    settingRows.forEach((r) => {
      const key = (r[0] || '').trim();
      const value = (r[1] || '').trim();
      if (key && key.toLowerCase() !== 'key') settingsMap[key] = value;
    });

    const settings = {
      companyName: settingsMap.CompanyName || '',
      address: settingsMap.Address || '',
      phone: settingsMap.Phone || '',
      email: settingsMap.Email || '',
      website: settingsMap.Website || '',
      currency: settingsMap.Currency || '৳',
      prefix: settingsMap.Prefix || 'QTN-',
      logoDataUrl: settingsMap.LogoURL || '',
      terms: settingsMap.Terms || '',
      bank: settingsMap.Bank || '',
      sheetUrl: settingsMap.SheetURL || ''
    };

    res.status(200).json({ settings, items, syncedAt: new Date().toISOString() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load data from Google Sheets. ' + e.message });
  }
}
