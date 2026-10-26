// A small preview renderer for this README's Markdown subset.
// Raw HTML is intentional: only render the trusted local README.
// GitHub remains the source of truth for the published rendering.
const inline = (value) => value
  .replace(/`([^`]+)`/g, (_, text) => `<code>${text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')}</code>`)
  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')
  .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

export function renderMarkdown(source) {
  const lines = source.split(/\r?\n/);
  let output = '';
  let paragraph = [];
  const flush = () => {
    if (paragraph.length) output += `<p>${inline(paragraph.join(' '))}</p>\n`;
    paragraph = [];
  };
  for (let i = 0; i < lines.length; i++) {
    const value = lines[i];
    if (!value.trim()) { flush(); continue; }
    if (/^\|/.test(value)) {
      flush();
      const cells = (row) => row.split('|').slice(1, -1).map(s => s.trim());
      output += `<table><thead><tr>${cells(value).map(s => `<th>${inline(s)}</th>`).join('')}</tr></thead><tbody>`;
      i += 2;
      while (i < lines.length && /^\|/.test(lines[i])) {
        output += `<tr>${cells(lines[i]).map(s => `<td>${inline(s)}</td>`).join('')}</tr>`;
        i++;
      }
      i--;
      output += '</tbody></table>\n';
      continue;
    }
    const heading = value.match(/^(#{1,6}) (.+)$/);
    if (heading) {
      flush();
      const level = heading[1].length;
      const id = heading[2].toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
      output += `<h${level} id="${id}">${inline(heading[2])}</h${level}>\n`;
    } else if (value.trim().startsWith('<')) {
      flush(); output += value + '\n';
    } else {
      paragraph.push(value);
    }
  }
  flush();
  return output;
}
