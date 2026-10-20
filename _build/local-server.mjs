// Local preview: proxies the live site and injects css/ + js/ (read fresh on every request).
// node _build/local-server.mjs   →   http://localhost:8080      (?off=1 on any page shows the original)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://1136991.us12.myftpupload.com';
const PORT = +(process.env.PORT || 8080);
const LOCAL = `http://localhost:${PORT}`;
const esc = s => s.replace(/\//g, '\\/');

http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, LOCAL);
    const off = url.searchParams.has('off');
    url.searchParams.delete('off');
    const headers = { ...req.headers, host: new URL(SITE).host, 'accept-encoding': 'identity' };
    delete headers.connection;
    if (headers.referer) headers.referer = headers.referer.replace(LOCAL, SITE);
    if (headers.origin) headers.origin = SITE;
    const body = ['GET', 'HEAD'].includes(req.method) ? undefined : await new Promise(r => { const c = []; req.on('data', d => c.push(d)); req.on('end', () => r(Buffer.concat(c))); });
    const up = await fetch(SITE + url.pathname + url.search, { method: req.method, headers, body, redirect: 'manual' });

    const out = {};
    up.headers.forEach((v, k) => { if (!['content-length', 'content-encoding', 'transfer-encoding', 'connection', 'content-security-policy', 'strict-transport-security'].includes(k)) out[k] = v; });
    if (out.location) out.location = out.location.replace(SITE, LOCAL);
    if (up.headers.get('set-cookie')) out['set-cookie'] = up.headers.getSetCookie().map(c => c.replace(/;\s*secure/ig, '').replace(/;\s*domain=[^;]+/ig, ''));

    const type = up.headers.get('content-type') || '';
    if (/text\/html|text\/css|javascript|json/.test(type)) {
      let text = await up.text();
      text = text.split(SITE).join(LOCAL).split(esc(SITE)).join(esc(LOCAL));
      if (type.includes('text/html') && !off) {
        const css = fs.readFileSync(path.join(ROOT, 'css/church-premium.css'), 'utf8');
        const js = fs.readFileSync(path.join(ROOT, 'js/church-premium.js'), 'utf8');
        text = text.replace('</head>', `<style id="chp-css">${css}</style>\n<script id="chp-js">${js}</script>\n</head>`);
      }
      res.writeHead(up.status, out);
      res.end(text);
    } else {
      res.writeHead(up.status, out);
      res.end(Buffer.from(await up.arrayBuffer()));
    }
  } catch (e) {
    res.writeHead(502, { 'content-type': 'text/plain' });
    res.end('Proxy error: ' + e.message);
  }
}).listen(PORT, () => console.log(`Church preview → ${LOCAL}   (add ?off=1 to see the original)`));
