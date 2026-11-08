// Run: node results.test.js
const assert = require('assert');
const { videoKey, toResults } = require('./results.js');

assert.strictEqual(videoKey('https://www.youtube.com/watch?v=abc123&t=10'), 'abc123');
assert.strictEqual(videoKey('https://youtu.be/abc123'), 'abc123');
assert.strictEqual(videoKey('https://m.youtube.com/shorts/xyz_9'), 'xyz_9');
assert.strictEqual(videoKey('https://www.youtube.com/feed/history'), null);
assert.strictEqual(videoKey('https://example.com/watch?v=abc'), null);
assert.strictEqual(videoKey('not a url'), null);

const history = [
  { url: 'https://www.youtube.com/watch?v=a1', title: 'Rust Tutorial - YouTube', lastVisitTime: 100 },
  { url: 'https://www.youtube.com/watch?v=a1&t=30', title: 'Rust Tutorial - YouTube', lastVisitTime: 50 },
  { url: 'https://www.youtube.com/watch?v=b2', title: 'Cooking pasta - YouTube', lastVisitTime: 200 },
  { url: 'https://example.com/rust', title: 'Rust blog', lastVisitTime: 300 },
];
const bookmarks = [{ url: 'https://youtu.be/c3', title: 'Rust async talk' }, { title: 'Folder' }];

const all = toResults(history, bookmarks, '');
assert.deepStrictEqual(all.map(r => r.title), ['Rust async talk', 'Cooking pasta', 'Rust Tutorial']);

const rust = toResults(history, bookmarks, 'RUST tut');
assert.strictEqual(rust.length, 1);
assert.deepStrictEqual(rust[0].sources, ['history']);

const both = toResults(history, [{ url: 'https://www.youtube.com/watch?v=b2', title: 'Cooking pasta' }], 'pasta');
assert.deepStrictEqual(both[0].sources, ['bookmark', 'history']);

console.log('ok');
