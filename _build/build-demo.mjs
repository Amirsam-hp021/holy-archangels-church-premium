// Builds the static GitHub Pages demo into docs/: snapshots of live pages + the premium layer.
// node _build/build-demo.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://1136991.us12.myftpupload.com';
const PAGES = ['', 'about-us', 'pastors-corner', 'hall-rental', 'holy-baptism', 'divine-liturgy', 'sunday-school', 'contact'];
const OUT = path.join(ROOT, 'docs');

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true });
fs.copyFileSync(path.join(ROOT, 'css/church-premium.css'), path.join(OUT, 'assets/church-premium.css'));
fs.copyFileSync(path.join(ROOT, 'js/church-premium.js'), path.join(OUT, 'assets/church-premium.js'));
fs.copyFileSync(path.join(ROOT, '_build/demo.js'), path.join(OUT, 'assets/demo.js'));
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');

for (const slug of PAGES) {
  const res = await fetch(`${SITE}/${slug ? slug + '/' : ''}`, { headers: { 'user-agent': 'Mozilla/5.0 (Macintosh) demo-builder' } });
  let html = await res.text();
  const up = slug ? '../' : './';

  // links between mirrored pages stay inside the demo; everything else points at the live site
  html = html.replace(/href="https:\/\/1136991\.us12\.myftpupload\.com\/([a-z0-9-]*)\/?(#[^"]*)?"/g, (m, s, hash = '') =>
    PAGES.includes(s) ? `href="${up}${s ? s + '/' : ''}${hash}"` : m);

  const loader = `<script>(function(){var off=false;try{off=localStorage.getItem('chpOff')==='1'}catch(e){}window.CHP_OFF=off;` +
    `if(!off)document.write('<link rel="stylesheet" href="${up}assets/church-premium.css"><script src="${up}assets/church-premium.js"><\\/script>');})();</script>`;
  html = html.replace('</head>', `${loader}\n</head>`);
  html = html.replace('</body>', `<script src="${up}assets/demo.js"></script>\n</body>`);
  html = html.replace(/<title>[^<]*<\/title>/, m => m.replace(/h99\.2f2\.myftpupload\.com Managed WordPress Site/, 'Holy Archangels Armenian Church — Premium Preview'));

  const dir = path.join(OUT, slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  console.log(`✓ /${slug}  ${(html.length / 1024).toFixed(0)} KB`);
}
