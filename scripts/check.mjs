import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { renderMarkdown } from './markdown.mjs';
const sharp = createRequire(import.meta.url)('sharp');

const readme = await readFile('README.md', 'utf8');
const localAssets = [...new Set([...readme.matchAll(/(?:src|srcset)="\.\/([^" ]+)"/g)].map(m => m[1]))];
for (const file of localAssets) {
  const data = await readFile(file);
  assert(data.length > 0, `${file} is empty`);
  if (file.endsWith('.svg')) await sharp(data).png().toBuffer();
  if (file.endsWith('.gif')) {
    assert.equal(data.subarray(0, 6).toString(), 'GIF89a');
    assert(data.includes(Buffer.from('NETSCAPE2.0')), 'GIF must loop');
    const metadata = await sharp(data, { animated: true }).metadata();
    assert.equal(metadata.pages, 64);
    assert.equal(metadata.width, 1200);
    assert.equal(metadata.pageHeight, 600);
    assert(metadata.delay.every(delay => delay === 90));
    assert(data.length < 3 * 1024 * 1024, 'Keep the animated cover under 3 MB');
  }
  console.log(`OK ${file} (${(await stat(file)).size.toLocaleString()} bytes)`);
}
const headings = new Set([...readme.matchAll(/^## (.+)$/gm)].map(m => m[1].toLowerCase().replace(/\s+/g, '-')));
for (const match of readme.matchAll(/href="#([^"]+)"/g)) assert(headings.has(match[1]), `Broken anchor: ${match[1]}`);
const rendered = renderMarkdown(readme);
assert.equal((rendered.match(/<details>/g) || []).length, 10);
assert.equal((rendered.match(/<\/details>/g) || []).length, 10);
assert.equal((rendered.match(/<summary>/g) || []).length, 10);
assert(!/<script|<iframe|onclick=|style=/i.test(readme), 'Keep README compatible with GitHub sanitization');
assert(readme.includes('prefers-reduced-motion: reduce'));
console.log('OK local assets, section links, 10 expandable sections, and reduced-motion fallback.');
