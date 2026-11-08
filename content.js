// Adds a filter box to YouTube playlists: the /playlist page (Liked = list=LL, Watch Later = list=WL, saved playlists)
// and the playlist panel next to the video on /watch?...&list=... pages.
// shortcut: relies on YouTube's element names below, update them if YouTube changes its markup.
const PAGE_ITEM = 'ytd-playlist-video-renderer';
const PANEL_ITEM = 'ytd-playlist-panel-video-renderer';
let box, mode, lastCount = -1;

function visiblePanel() {
  return [...document.querySelectorAll('ytd-playlist-panel-renderer')]
    .find(p => p.offsetParent && p.querySelector(PANEL_ITEM));
}

function items() {
  if (mode === 'panel') return [...(visiblePanel()?.querySelectorAll(PANEL_ITEM) || [])];
  return [...document.querySelectorAll(PAGE_ITEM)];
}

function applyFilter() {
  if (!box) return;
  const words = box.querySelector('input').value.toLowerCase().split(/\s+/).filter(Boolean);
  const all = items();
  let shown = 0;
  for (const el of all) {
    const title = (el.querySelector('#video-title')?.textContent || '').toLowerCase();
    const ok = words.every(w => title.includes(w));
    el.style.display = ok ? '' : 'none';
    if (ok) shown++;
  }
  lastCount = all.length;
  box.querySelector('.count').textContent = `${shown}/${all.length}`;
}

async function loadAll(btn) {
  btn.disabled = true;
  const y = window.scrollY;
  let last = -1, stale = 0;
  while (stale < 3) { // stop after ~4.5s with no new videos
    const root = mode === 'panel' ? visiblePanel() : document;
    // Scrolling the "more" spinner (or the last video) into view makes YouTube load the next batch.
    const more = root?.querySelector('ytd-continuation-item-renderer') || items().at(-1);
    more?.scrollIntoView({ block: 'end' });
    await new Promise(r => setTimeout(r, 1500));
    const n = items().length;
    stale = n === last ? stale + 1 : 0;
    last = n;
    applyFilter();
  }
  window.scrollTo(0, y);
  btn.disabled = false;
}

function makeBox(style) {
  const b = document.createElement('div');
  b.style.cssText = 'display:flex;gap:6px;align-items:center;font:13px Roboto,Arial,sans-serif;color:var(--yt-spec-text-primary,#000);' + style;
  // No innerHTML: YouTube enforces Trusted Types and rejects it.
  const input = Object.assign(document.createElement('input'), { type: 'search', placeholder: 'Search this playlist…' });
  input.setAttribute('aria-label', 'Search this playlist');
  input.style.cssText = 'flex:1;min-width:0;padding:6px 10px;border-radius:16px;border:1px solid var(--yt-spec-10-percent-layer,#ccc);background:var(--yt-spec-base-background,#fff);color:inherit;font:inherit';
  input.addEventListener('input', applyFilter);
  const btn = Object.assign(document.createElement('button'), { type: 'button', textContent: 'Load all', title: 'Scroll through the whole playlist so the search covers every video' });
  btn.style.cssText = 'padding:6px 10px;border-radius:16px;border:0;background:var(--yt-spec-badge-chip-background,#eee);color:inherit;font:inherit;cursor:pointer';
  btn.addEventListener('click', () => loadAll(btn));
  const count = Object.assign(document.createElement('span'), { className: 'count' });
  count.style.cssText = 'color:var(--yt-spec-text-secondary,#666);white-space:nowrap';
  b.append(input, btn, count);
  return b;
}

function update() {
  const want = location.pathname === '/playlist' ? 'page'
    : location.pathname === '/watch' && visiblePanel() ? 'panel' : null;
  if (box && (want !== mode || !box.isConnected)) { box.remove(); box = null; } // YouTube re-renders on navigation
  mode = want;
  if (!mode) return;
  if (!box) {
    if (mode === 'page') {
      box = makeBox('position:fixed;top:64px;right:16px;z-index:9999;width:360px;padding:8px;border-radius:12px;background:var(--yt-spec-base-background,#fff);box-shadow:0 2px 8px rgba(0,0,0,.3)');
      document.body.append(box);
    } else {
      box = makeBox('padding:8px 12px');
      visiblePanel().querySelector('#items').before(box); // sits above the scrolling list, under the panel header
    }
    lastCount = -1;
  }
  if (items().length !== lastCount) applyFilter(); // videos YouTube loaded since the last check
}

setInterval(update, 1000); // YouTube is a single-page app and renders the panel late, so poll instead of hooking its events
update();
