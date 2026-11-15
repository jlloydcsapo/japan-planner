const KEY = 'japan-13-day-planner-v2';

export function loadState() {
  try { return JSON.parse(localStorage.getItem(KEY)) || null; }
  catch { return null; }
}

export function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function clearState() { localStorage.removeItem(KEY); }

export function downloadJSON(state) {
  const blob = new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), ...state }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: 'japan-itinerary-backup.json' });
  a.click();
  URL.revokeObjectURL(url);
}

export function readJSON(file) {
  return file.text().then(text => JSON.parse(text));
}
