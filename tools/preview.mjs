import http from 'node:http';
import { readFile } from 'node:fs/promises';
const allowed = new Set(['index.html', 'style.css', 'app.mjs', 'scanner.mjs', 'worker.mjs', 'i18n.mjs', 'icon.svg']);
const mime = { html: 'text/html; charset=utf-8', css: 'text/css', mjs: 'text/javascript', svg: 'image/svg+xml' };
http.createServer(async (req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const name = pathname === '/' ? 'index.html' : pathname.slice(1);
  if (!allowed.has(name)) { res.writeHead(404); res.end('Not found'); return; }
  try {
    const data = await readFile(new URL(`../dist/${name}`, import.meta.url));
    res.writeHead(200, { 'Content-Type': mime[name.split('.').pop()], 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' });
    res.end(data);
  } catch { res.writeHead(500); res.end('Build first: npm run build'); }
}).listen(8942, '127.0.0.1', () => console.log('BuildPeek preview: http://127.0.0.1:8942'));
