// Code Lab terminal input relay.
// Python runs in a Web Worker, and input() must block until the student
// types a line. The worker makes a synchronous request to
// /__codelab_stdin__/<runId>/<seq>; this service worker holds that request
// open until the page posts the typed line (or EOF) for the same run.
// Every other request passes through untouched.

const PREFIX = '/__codelab_stdin__/';
const waiting = new Map(); // runId -> resolve(text | null)
const queued = new Map(); // runId -> [text | null] typed before the request arrived

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('message', (event) => {
  const { type, runId, text = null } = event.data || {};
  if (type !== 'codelab-stdin' || !runId) return;
  const resolve = waiting.get(runId);
  if (resolve) {
    waiting.delete(runId);
    resolve(text);
  } else {
    queued.set(runId, [...(queued.get(runId) || []), text]);
  }
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(PREFIX)) return;

  const runId = url.pathname.slice(PREFIX.length).split('/')[0];
  const next = new Promise((resolve) => {
    const pending = queued.get(runId);
    if (pending?.length) {
      resolve(pending.shift());
      if (!pending.length) queued.delete(runId);
    } else {
      waiting.set(runId, resolve);
    }
  });

  event.respondWith(next.then((text) => new Response(JSON.stringify({ text }), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Codelab-Stdin': '1' },
  })));
});
