// A small XML parser for Enigma's data files (levels, indices, objects.xml): elements, attributes, text and
// CDATA. Namespace prefixes are kept in the names ("el:level").

export interface XmlElement { name: string; attrs: Record<string, string>; children: XmlElement[]; text: string }

const ENTITIES: Record<string, string> = { lt: '<', gt: '>', amp: '&', quot: '"', apos: "'" };
export function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-fA-F]+|#\d+|\w+);/g, (m, e: string) => {
    if (e[0] === '#') return String.fromCodePoint(e[1] === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
    return ENTITIES[e] ?? m;
  });
}

export function parseXml(src: string): XmlElement {
  const root: XmlElement = { name: '#document', attrs: {}, children: [], text: '' };
  const stack: XmlElement[] = [root];
  let i = 0;
  const n = src.length;
  while (i < n) {
    const lt = src.indexOf('<', i);
    if (lt < 0) { stack[stack.length - 1].text += decodeEntities(src.slice(i)); break; }
    if (lt > i) stack[stack.length - 1].text += decodeEntities(src.slice(i, lt));
    if (src.startsWith('<!--', lt)) { const e = src.indexOf('-->', lt + 4); i = e < 0 ? n : e + 3; continue; }
    if (src.startsWith('<![CDATA[', lt)) {
      const e = src.indexOf(']]>', lt + 9);
      stack[stack.length - 1].text += src.slice(lt + 9, e < 0 ? n : e);
      i = e < 0 ? n : e + 3; continue;
    }
    if (src.startsWith('<?', lt) || src.startsWith('<!', lt)) { const e = src.indexOf('>', lt); i = e < 0 ? n : e + 1; continue; }
    if (src[lt + 1] === '/') {
      const e = src.indexOf('>', lt);
      const name = src.slice(lt + 2, e).trim();
      while (stack.length > 1) { const top = stack.pop()!; if (top.name === name) break; }
      i = e + 1; continue;
    }
    // start tag
    let j = lt + 1;
    while (j < n && !/[\s/>]/.test(src[j])) j++;
    const el: XmlElement = { name: src.slice(lt + 1, j), attrs: {}, children: [], text: '' };
    for (;;) {
      while (j < n && /\s/.test(src[j])) j++;
      if (src[j] === '/' || src[j] === '>') break;
      let k = j;
      while (k < n && !/[\s=/>]/.test(src[k])) k++;
      const an = src.slice(j, k);
      while (k < n && /\s/.test(src[k])) k++;
      if (src[k] === '=') {
        k++;
        while (k < n && /\s/.test(src[k])) k++;
        const q = src[k];
        const e = src.indexOf(q, k + 1);
        el.attrs[an] = decodeEntities(src.slice(k + 1, e));
        j = e + 1;
      } else { el.attrs[an] = ''; j = k; }
    }
    stack[stack.length - 1].children.push(el);
    if (src[j] === '/') { i = src.indexOf('>', j) + 1; }
    else { stack.push(el); i = j + 1; }
  }
  return root;
}

export function findAll(el: XmlElement, name: string, out: XmlElement[] = []): XmlElement[] {
  for (const c of el.children) {
    if (c.name === name) out.push(c);
    findAll(c, name, out);
  }
  return out;
}
export function findFirst(el: XmlElement, name: string): XmlElement | null {
  for (const c of el.children) {
    if (c.name === name) return c;
    const r = findFirst(c, name);
    if (r) return r;
  }
  return null;
}
