const api = globalThis.browser ?? chrome; // Firefox/LibreWolf: browser.*, Chrome: chrome.* (both promise-based)
const q = document.getElementById('q');
const list = document.getElementById('results');
let timer;

q.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(search, 150); });
search();

async function search() {
  const query = q.value.trim();
  const [history, bookmarks] = await Promise.all([
    // shortcut: scans the newest 10k history entries, raise maxResults if older videos are missing.
    api.history.search({ text: query, startTime: 0, maxResults: 10000 }),
    api.bookmarks.search(query || 'youtu'),
  ]);
  render(toResults(history, bookmarks, query).slice(0, 200));
}

function render(rows) {
  list.replaceChildren();
  if (!rows.length) {
    list.innerHTML = '<li class="empty">No matching YouTube videos.</li>';
    return;
  }
  for (const r of rows) {
    const a = document.createElement('a');
    a.href = r.url;
    a.textContent = r.title;
    const meta = document.createElement('div');
    meta.className = 'meta';
    for (const s of r.sources) {
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = s;
      meta.append(tag);
    }
    if (r.time) meta.append(new Date(r.time).toLocaleDateString());
    a.append(meta);
    a.addEventListener('click', e => { e.preventDefault(); api.tabs.create({ url: r.url }); });
    const li = document.createElement('li');
    li.append(a);
    list.append(li);
  }
}
