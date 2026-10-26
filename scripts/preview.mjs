import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { renderMarkdown } from './markdown.mjs';

const root = resolve('.');
const port = Number(process.env.PORT || 4187);
const css = `
:root{color-scheme:dark;--bg:#0d1117;--fg:#e6edf3;--muted:#9198a1;--border:#3d444d;--link:#9bd85b;--panel:#151b23}
html.light{color-scheme:light;--bg:#fff;--fg:#1f2328;--muted:#59636e;--border:#d1d9e0;--link:#447a14;--panel:#f6f8fa}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
.toolbar{padding:14px 24px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:16px;color:var(--muted);font-size:12px}
.toolbar span{letter-spacing:.06em}.toolbar div{display:flex;gap:8px}button{cursor:pointer;color:var(--fg);background:var(--panel);border:1px solid var(--border);border-radius:6px;padding:7px 10px;font:inherit}
main{max-width:1012px;margin:30px auto 70px;padding:32px;border:1px solid var(--border);border-radius:6px}.file-label{font-size:12px;color:var(--muted);margin:0 0 24px;font-family:Consolas,monospace}
article>:first-child{margin-top:0}a{color:var(--link);text-decoration:none}a:hover{text-decoration:underline}p{margin:0 0 16px}img{max-width:100%;vertical-align:middle}picture{display:block}h2{font-size:24px;padding-bottom:.3em;border-bottom:1px solid var(--border);margin:24px 0 16px;line-height:1.25}h4{margin:24px 0 16px;font-size:16px}sub{font-size:11px}table{border-collapse:collapse;width:100%;margin:0 0 16px;overflow:auto}td,th{border:1px solid var(--border);padding:14px 16px;text-align:left}th{font-weight:600}tbody tr:nth-child(2n){background:var(--panel)}table p:last-child{margin-bottom:0}td img{margin-bottom:6px}details{margin:0 0 16px}summary{cursor:pointer;line-height:1.8}details[open]>summary{margin-bottom:16px}details details{margin:16px 0 24px 16px;padding-left:16px;border-left:2px solid #c4f563}code{background:var(--panel);border-radius:4px;padding:.2em .4em;font-size:85%}a:focus-visible,summary:focus-visible,button:focus-visible{outline:2px solid #c4f563;outline-offset:4px}
@media(max-width:700px){main{margin:0;border:0;padding:20px 16px}.file-label{margin-bottom:16px}.toolbar{padding:10px 16px}.toolbar>span{display:none}.toolbar{justify-content:flex-end}td,th{padding:10px 9px}body{font-size:14px}h2{font-size:22px}sub{font-size:10px}td[width]{width:50%}}
`;

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://127.0.0.1');
    if (url.pathname === '/') {
      const content = renderMarkdown(await readFile('README.md', 'utf8'));
      const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Lucas / Backend Arcade — README preview</title><style>${css}</style></head><body><nav class="toolbar"><span>README PREVIEW · LOCAL RENDERING APPROXIMATION</span><div><button id="theme" aria-pressed="false">Light theme</button><button id="motion" aria-pressed="false">Pause cover</button></div></nav><main><p class="file-label">TobilobaLucas / README.md</p><article>${content}</article></main><script>
const theme = document.getElementById('theme');theme.onclick=()=>{const light=document.documentElement.classList.toggle('light');theme.textContent=light?'Dark theme':'Light theme';theme.setAttribute('aria-pressed',light)};
const motion=document.getElementById('motion');const image=document.querySelector('picture img');const source=document.querySelector('picture source');let paused=matchMedia('(prefers-reduced-motion: reduce)').matches;function setMotion(){image.src=paused?'./assets/arcade-cover.svg':'./assets/arcade-cover.gif';source.media=paused?'all':'not all';motion.textContent=paused?'Play cover':'Pause cover';motion.setAttribute('aria-pressed',paused)}motion.onclick=()=>{paused=!paused;setMotion()};setMotion();
</script></body></html>`;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
      return;
    }
    const file = resolve(root, '.' + decodeURIComponent(url.pathname));
    if (!file.startsWith(root + sep) || !file.startsWith(resolve('assets') + sep)) {
      res.writeHead(404); res.end(); return;
    }
    const mime = { '.svg': 'image/svg+xml', '.gif': 'image/gif' }[extname(file)] || 'application/octet-stream';
    const content = await readFile(file);
    res.writeHead(200, { 'Content-Type': mime }); res.end(content);
  } catch {
    res.writeHead(404); res.end('Not found');
  }
}).listen(port, '127.0.0.1', () => console.log(`README preview: http://127.0.0.1:${port}`));
