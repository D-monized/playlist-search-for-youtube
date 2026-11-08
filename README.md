# Playlist Search for YouTube

A browser extension that adds search where YouTube has none.

- **Search inside any playlist.** A "Search this playlist…" box on Watch Later, Liked videos and every other playlist, both on the playlist page and in the panel beside a playing video. **Load all** scrolls the list so the search covers every video.
- **Search your history and bookmarks.** Click the toolbar icon to find YouTube videos you've watched or bookmarked in this browser.

Everything runs locally. No account, no network requests, no data collected. See the [privacy policy](PRIVACY.md).

Works in Chrome, Edge, Helium, Firefox and LibreWolf (Manifest V3).

## Install from source

**Chrome / Edge / Helium:** open `chrome://extensions` (`edge://extensions` in Edge), turn on **Developer mode**, click **Load unpacked** and select this folder.

**Firefox / LibreWolf:** open `about:debugging#/runtime/this-firefox`, click **Load Temporary Add-on…** and select `manifest.json`.

Refresh any YouTube tab that was already open.

## Files

| File | Purpose |
|---|---|
| `manifest.json` | Extension manifest |
| `popup.html`, `popup.js` | Toolbar popup: searches history and bookmarks |
| `results.js` | Matching and de-duplication logic used by the popup |
| `content.js` | Adds the search box to YouTube playlists |
| `results.test.js` | Tests for `results.js`, run with `node results.test.js` |

## Package

Zip the extension files (not the folder) for the Chrome Web Store; the same zip renamed to `.xpi` works for Firefox:

```
manifest.json popup.html popup.js results.js content.js icons/
```

---

Not affiliated with, endorsed by, or sponsored by YouTube or Google.
