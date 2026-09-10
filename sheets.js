// Fetch a Google Sheet's CSV export and parse it into rows of strings.
// The sheet just needs to be shared as "Anyone with the link – Viewer"
// (File > Share in Google Sheets) for the export URL to work without auth.

export async function fetchCsv(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      'Could not fetch the Google Sheet (HTTP ' + res.status + '). ' +
      'Make sure it is shared as "Anyone with the link – Viewer".'
    );
  }
  const text = await res.text();
  return parseCsv(text);
}

// Small CSV parser: handles quoted fields, embedded commas, and escaped
// double-quotes ("" inside a quoted field). Good enough for Sheets' export.
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  const endField = () => { row.push(field); field = ''; };
  const endRow = () => { endField(); rows.push(row); row = []; };

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else { inQuotes = false; }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      endField();
    } else if (c === '\r') {
      // ignore, \n handles the row break
    } else if (c === '\n') {
      endRow();
    } else {
      field += c;
    }
  }
  if (field.length || row.length) endRow();

  // Drop fully blank rows.
  return rows.filter(r => r.some(cell => (cell || '').trim() !== ''));
}
