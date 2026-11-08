// Pure logic, shared by popup.js and results.test.js.
function videoKey(url) {
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') return u.pathname.slice(1);
    if (!/(^|\.)youtube\.com$/.test(u.hostname)) return null;
    if (u.pathname === '/watch') return u.searchParams.get('v');
    const m = u.pathname.match(/^\/shorts\/([\w-]+)/);
    return m ? m[1] : null;
  } catch { return null; }
}

// Bookmarks first, then history (newest first); one row per video; every query word must appear in the title.
function toResults(historyItems, bookmarkItems, query) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const seen = new Map();
  const add = (item, source) => {
    const key = item.url && videoKey(item.url);
    if (!key) return;
    const title = (item.title || item.url).replace(/ - YouTube$/, '');
    if (!words.every(w => title.toLowerCase().includes(w))) return;
    const row = seen.get(key);
    if (row) { if (!row.sources.includes(source)) row.sources.push(source); return; }
    seen.set(key, { url: item.url, title, sources: [source], time: item.lastVisitTime || item.dateAdded || 0 });
  };
  bookmarkItems.forEach(b => add(b, 'bookmark'));
  [...historyItems].sort((a, b) => (b.lastVisitTime || 0) - (a.lastVisitTime || 0)).forEach(h => add(h, 'history'));
  return [...seen.values()];
}

if (typeof module !== 'undefined') module.exports = { videoKey, toResults };
