import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
const sharp = createRequire(import.meta.url)('sharp');

await mkdir('assets', { recursive: true });
const C = { bg: '#101215', panel: '#1A1E24', line: '#30363D', white: '#F5F3E9', muted: '#9CA4AF', lime: '#C4F563', purple: '#BCA3FF', pink: '#FFA9D2' };
const esc = (s) => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const rect = (x, y, w, h, fill, r = 0, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" ${extra}/>`;
const text = (x, y, value, size = 16, fill = C.white, extra = '') => `<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" font-family="Segoe UI, Arial, sans-serif" ${extra}>${esc(value)}</text>`;
const mono = (x, y, value, size = 14, fill = C.muted, extra = '') => text(x, y, value, size, fill, extra).replace('font-family="Segoe UI, Arial, sans-serif"', 'font-family="Consolas, monospace"');
const line = (x1, y1, x2, y2, color = C.line, width = 1, extra = '') => `<path d="M${x1} ${y1} L${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${width}" ${extra}/>`;
const svg = (w, h, content, label) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title"><title id="title">${esc(label)}</title>${content}</svg>`;
const heart = (x, y, color, scale = 1) => `<path d="M0 3H3V0H9V3H12V0H18V3H21V9H18V12H15V15H12V18H9V15H6V12H3V9H0Z" fill="${color}" transform="translate(${x} ${y}) scale(${scale})"/>`;
const star = (x, y, color, size = 1) => `<path d="M0 -10V10M-10 0H10" stroke="${color}" stroke-width="3" transform="translate(${x} ${y}) scale(${size})"/>`;

function cover(frame = 0) {
  const phase = frame / 64;
  const bob = Math.round(Math.sin(phase * Math.PI * 2) * 4);
  const blink = frame >= 29 && frame <= 31;
  let a = rect(0, 0, 1200, 600, C.bg, 16);
  a += rect(1, 1, 1198, 598, 'none', 15, `stroke="${C.line}" stroke-width="2"`);
  a += rect(32, 28, 10, 10, C.lime) + mono(54, 38, 'LUCAS / BACKEND ARCADE', 15, C.white, 'letter-spacing="1"');
  a += mono(1164, 38, 'PLAYER 01 · NIGERIA', 14, C.muted, 'text-anchor="end"');
  a += line(32, 62, 1168, 62);
  a += mono(48, 117, 'SOMEWHERE BETWEEN AN IDEA AND GIT PUSH.', 14, C.lime, 'letter-spacing="1"');
  a += text(40, 275, 'LUCAS', 166, C.white, 'font-weight="900" letter-spacing="-9"');
  a += rect(592, 249, 25, 25, C.lime, 3);
  a += text(48, 335, 'Simple interfaces.', 32, C.white, 'font-weight="600"');
  a += text(48, 378, 'Interesting backends.', 32, C.muted, 'font-weight="600"');
  a += mono(48, 428, 'JAVA + SPRING BOOT  /  OCCASIONAL SIDE QUESTS', 14, C.muted);

  // A tiny server room, with packets travelling along a circuit.
  a += rect(706, 91, 462, 371, '#171A20', 12);
  for (let x = 730; x < 1160; x += 24) {
    for (let y = 114; y < 450; y += 24) a += `<circle cx="${x}" cy="${y}" r="1" fill="#30333E"/>`;
  }
  a += `<circle cx="953" cy="280" r="131" fill="#242333"/>`;
  a += `<circle cx="953" cy="280" r="130" fill="none" stroke="#373246" stroke-dasharray="5 9"/>`;
  a += `<path d="M738 337H789V384H1094V216H1135" stroke="#52623A" stroke-width="3" fill="none"/>`;
  const path = [{x:738,y:337},{x:789,y:337},{x:789,y:384},{x:1094,y:384},{x:1094,y:216},{x:1135,y:216}];
  const lengths = path.slice(1).map((p, i) => Math.hypot(p.x - path[i].x, p.y - path[i].y));
  const total = lengths.reduce((v, n) => v + n, 0);
  for (let p = 0; p < 3; p++) {
    let distance = ((phase + p / 3) % 1) * total;
    for (let i = 0; i < lengths.length; i++) {
      if (distance <= lengths[i]) {
        const f = distance / lengths[i];
        a += rect(Math.round(path[i].x + (path[i+1].x-path[i].x)*f)-4, Math.round(path[i].y+(path[i+1].y-path[i].y)*f)-4, 8, 8, C.lime);
        break;
      }
      distance -= lengths[i];
    }
  }
  a += mono(729, 119, 'THE OTHER SIDE OF THE BUTTON', 11, C.muted);
  a += star(1100, 150, C.purple, .7) + star(772, 239, C.lime, .5);
  a += heart(740, 424, C.lime, .8) + heart(766, 424, C.lime, .8) + heart(792, 424, C.lime, .8);
  a += mono(1143, 441, 'HP: STILL CURIOUS', 11, C.muted, 'text-anchor="end"');

  // Original pixel server mascot. A little hardware with a lot of feelings.
  a += `<ellipse cx="951" cy="385" rx="99" ry="13" fill="#0B0D11"/>`;
  a += `<g transform="translate(0 ${bob})">`;
  a += rect(866, 195, 174, 166, '#080B0D') + rect(860, 201, 186, 154, '#080B0D');
  a += rect(866, 201, 174, 154, C.lime);
  a += rect(878, 213, 150, 70, '#202A22');
  a += rect(895, blink ? 247 : 235, 22, blink ? 4 : 20, C.lime);
  a += rect(988, blink ? 247 : 235, 22, blink ? 4 : 20, C.lime);
  a += `<path d="M938 258V264H966V258" stroke="${C.lime}" stroke-width="5" fill="none"/>`;
  a += rect(878, 295, 150, 19, '#2F3D28');
  a += rect(886, 302, 7, 5, frame % 16 < 8 ? C.white : C.lime);
  a += line(908, 304, 1015, 304, '#6F8B49', 3);
  a += rect(878, 321, 150, 19, '#2F3D28') + rect(886, 328, 7, 5, C.lime);
  a += line(908, 330, 1015, 330, '#6F8B49', 3);
  a += rect(880, 355, 19, 19, C.purple) + rect(1007, 355, 19, 19, C.purple);
  a += rect(873, 371, 33, 8, C.purple) + rect(1000, 371, 33, 8, C.purple);
  a += rect(846, 279, 14, 42, C.purple) + rect(1046, 268, 14, 42, C.purple);
  a += rect(1055, 262, 18, 13, C.purple);
  a += rect(947, 175, 8, 20, C.purple) + rect(940, 163, 22, 14, C.lime);
  a += '</g>';
  a += rect(1002, 133 + bob, 132, 42, '#292336', 6, 'stroke="#6B5887"');
  a += mono(1068, 160 + bob, '{ ok: true }', 14, C.purple, 'text-anchor="middle"');
  a += `<path d="M1024 ${175+bob}V185L1035 ${175+bob}" fill="#292336"/>`;

  a += rect(32, 492, 1136, 61, C.panel, 8);
  a += mono(52, 529, 'SELECT A PROJECT. CHALLENGE AN EDGE CASE.', 15, C.white);
  a += rect(890, 505, 262, 35, C.lime, 4);
  a += mono(1021, 528, 'INSERT CURIOSITY  ↓', 14, '#15200D', 'text-anchor="middle" font-weight="700"');
  a += mono(32, 578, 'NO HIGHSCORE YET. STILL PLAYING.', 11, C.muted, 'letter-spacing="1"');
  a += mono(1168, 578, 'EST. IN CURIOSITY', 11, C.muted, 'text-anchor="end" letter-spacing="1"');
  return svg(1200, 600, a, 'Lucas — Backend Arcade');
}

function cartridge(name, number, accent, title, subtitle, status, isChat) {
  let a = rect(0, 0, 560, 286, C.bg, 12);
  a += rect(1, 1, 558, 284, 'none', 11, `stroke="${C.line}" stroke-width="2"`);
  a += rect(0, 0, 8, 286, accent, 3);
  a += mono(30, 34, `CARTRIDGE / ${number}`, 12, C.muted, 'letter-spacing="1"');
  a += rect(371, 17, 167, 26, isChat ? '#342636' : '#25311D', 4);
  a += mono(454, 35, status, 10, accent, 'text-anchor="middle" letter-spacing=".5"');
  a += line(30, 56, 530, 56);
  if (isChat) {
    a += rect(422, 82, 76, 49, '#3B2E43', 8);
    a += `<path d="M432 131V143L447 131" fill="#3B2E43"/>`;
    a += rect(454, 103, 76, 49, accent, 8);
    a += `<path d="M518 152V164L503 152" fill="${accent}"/>`;
    a += rect(468, 123, 7, 7, '#432C42') + rect(484, 123, 7, 7, '#432C42') + rect(500, 123, 7, 7, '#432C42');
    a += star(404, 112, C.purple, .6);
  } else {
    a += `<circle cx="478" cy="120" r="40" fill="#26371C" stroke="${accent}" stroke-width="2"/>`;
    a += `<circle cx="478" cy="120" r="30" fill="none" stroke="#789C45"/>`;
    a += text(478, 134, '₦', 38, accent, 'font-weight="700" text-anchor="middle"');
    a += star(416, 97, accent, .5) + star(530, 152, accent, .4);
  }
  a += mono(30, 106, title, 12, accent, 'letter-spacing="1"');
  a += text(27, 181, name, 61, C.white, 'font-weight="800" letter-spacing="-2"');
  a += text(30, 217, subtitle, 20, C.muted);
  a += line(30, 241, 530, 241);
  a += mono(30, 266, isChat ? 'PLOT TWIST: YOU WERE THE MAIN CHARACTER.' : 'THE GROUP CHAT FINALLY HAS A PLAN.', 10, accent, 'letter-spacing=".3"');
  return svg(560, 286, a, `${name} — ${subtitle}`);
}

const coverSvg = cover();
await writeFile('assets/arcade-cover.svg', coverSvg);
await writeFile('assets/splitcash.svg', cartridge('Splitcash', '01', C.lime, 'MULTIPLAYER FINANCE', 'Good subscriptions. Shared costs.', 'MVP IN PROGRESS', false));
await writeFile('assets/chatlore.svg', cartridge('Chatlore', '02', C.pink, 'CO-OP STORY MODE', 'Your group chat has a plot.', 'IN THE WORKSHOP', true));
let footer = rect(0, 0, 1200, 180, C.lime, 12);
footer += mono(36, 39, 'CO-OP MODE / OPEN AN INVITATION', 13, '#34461E', 'letter-spacing="1"');
footer += text(32, 108, 'Player two, press start.', 58, '#15200D', 'font-weight="800" letter-spacing="-2"');
footer += mono(36, 148, 'GOT AN INTERESTING PROBLEM? I’M LISTENING.', 15, '#34461E');
footer += `<g transform="translate(1070 65)"><path d="M0 18H47V0L88 29L47 58V40H0Z" fill="#15200D"/></g>`;
await writeFile('assets/coop.svg', svg(1200, 180, footer, 'Player two, press start.'));

const frames = [];
for (let frame = 0; frame < 64; frame++) {
  frames.push(await sharp(Buffer.from(cover(frame))).png().toBuffer());
  if (frame % 16 === 0) console.log(`Rendered cover frame ${frame + 1}/64`);
}
await sharp(frames, { join: { animated: true } }).gif({ delay: Array(64).fill(90), loop: 0, colours: 128, dither: 0, effort: 3 }).toFile('assets/arcade-cover.gif');
await sharp(Buffer.from(coverSvg)).png().toFile('assets/arcade-cover.png');
console.log('Built 4 SVGs, a static PNG, and the animated cover.');
