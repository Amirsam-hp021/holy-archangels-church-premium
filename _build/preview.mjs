// Usage: node browser.mjs <url> --script _build/preview.mjs   (env: PAGES="/,/about-us/" W=1440 TAG=v1 OFF=1 to skip injection)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://1136991.us12.myftpupload.com';
export default async function run(page) {
  const W = +(process.env.W || 1440), H = W < 800 ? 860 : 900;
  const tag = process.env.TAG || 'v1';
  const pages = (process.env.PAGES || '/').split(',');
  await page.setViewportSize({ width: W, height: H });
  if (!process.env.OFF) {
    await page.route(u => u.href.startsWith(SITE) && !/\.(css|js|png|jpe?g|webp|svg|woff2?|gif|mp4)(\?|$)/.test(u.pathname + (u.search||'')) && !u.pathname.startsWith('/wp-json'), async route => {
      const r = await route.fetch();
      const ct = r.headers()['content-type'] || '';
      if (!ct.includes('text/html')) return route.fulfill({ response: r });
      const css = fs.readFileSync(path.join(ROOT, 'css/church-premium.css'), 'utf8');
      const js = fs.readFileSync(path.join(ROOT, 'js/church-premium.js'), 'utf8');
      let body = await r.text();
      body = body.replace('</head>', `<style id="chp-css">${css}</style>\n<script id="chp-js">${js}</script>\n</head>`);
      route.fulfill({ response: r, body, headers: { ...r.headers(), 'content-length': undefined } });
    });
  }
  const out = {};
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (/church-premium/.test(m.text())) errors.push(m.text()); });
  for (const p of pages) {
    await page.goto(SITE + p, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(3500);
    const slug = (p.replace(/\//g, '') || 'home') + '-' + W + '-' + tag;
    await page.screenshot({ path: path.join(ROOT, '_build/shots', slug + '-top.png') });
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < h; y += 500) { await page.evaluate(y => scrollTo(0, y), y); await page.waitForTimeout(140); }
    await page.waitForTimeout(1500);
    await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(ROOT, '_build/shots', slug + '-full.png'), fullPage: true });
    out[p] = await page.evaluate(() => ({
      live: document.documentElement.className,
      hero: !!document.querySelector('.chp-hero'), banners: document.querySelectorAll('.chp-banner').length,
      cards: document.querySelectorAll('.chp-card').length, topline: document.querySelectorAll('.chp-topline').length,
      display: [...document.querySelectorAll('.chp-display')].map(e => e.className.match(/chp-display--\w+/)[0] + ':' + e.innerText.slice(0, 20)),
      eyebrows: document.querySelectorAll('.chp-eyebrow').length,
      hidden: [...document.querySelectorAll('[data-elementor-type=wp-page] .elementor-widget')].filter(e => getComputedStyle(e).opacity === '0' && e.offsetParent).map(e => e.dataset.id + ':' + e.dataset.widget_type),
      hscroll: document.documentElement.scrollWidth > innerWidth
    }));
  }
  out.errors = errors;
  return out;
}
