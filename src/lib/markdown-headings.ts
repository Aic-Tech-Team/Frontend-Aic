/**
 * The `##` headings of a markdown text, with the ids `MarkdownContent` (`headingIds`) gives them,
 * in order. Code fences are skipped, and inline marks are removed from the titles.
 */
export function markdownHeadings(md: string): { id: string; title: string }[] {
  const out: { id: string; title: string }[] = [];
  let fenced = false;
  for (const line of md.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    const m = line.match(/^##\s+(.+?)\s*#*\s*$/);
    if (m) {
      const title = m[1].replace(/[*_`~]/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").trim();
      out.push({ id: `section-${out.length}`, title });
    }
  }
  return out;
}
