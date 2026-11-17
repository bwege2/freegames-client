// A small XML reader for X-Moto's files (levels, themes): elements, attributes, text and CDATA, the five
// predefined entities and numeric character references. It runs the same in the browser and in node.
export interface XNode {
  name: string;
  attrs: Record<string, string>;
  children: XNode[];
  text: string;
}

const ENT: Record<string, string> = { lt: '<', gt: '>', amp: '&', quot: '"', apos: "'" };
function decode(s: string): string {
  return s.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[a-z]+);/g, (m, e: string) => {
    if (e[0] === '#') {
      const n = e[1] === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : m;
    }
    return ENT[e] ?? m;
  });
}

export function parseXml(src: string): XNode {
  let i = 0;
  const root: XNode = { name: '#root', attrs: {}, children: [], text: '' };
  const stack: XNode[] = [root];
  const n = src.length;
  while (i < n) {
    const lt = src.indexOf('<', i);
    const top = stack[stack.length - 1];
    if (lt < 0) { top.text += decode(src.slice(i)); break; }
    if (lt > i) top.text += decode(src.slice(i, lt));
    if (src.startsWith('<!--', lt)) {
      const e = src.indexOf('-->', lt + 4);
      i = e < 0 ? n : e + 3;
    } else if (src.startsWith('<![CDATA[', lt)) {
      const e = src.indexOf(']]>', lt + 9);
      top.text += src.slice(lt + 9, e < 0 ? n : e);
      i = e < 0 ? n : e + 3;
    } else if (src.startsWith('<?', lt)) {
      const e = src.indexOf('?>', lt + 2);
      i = e < 0 ? n : e + 2;
    } else if (src.startsWith('<!', lt)) {
      const e = src.indexOf('>', lt + 2);
      i = e < 0 ? n : e + 1;
    } else if (src[lt + 1] === '/') {
      const e = src.indexOf('>', lt + 2);
      const name = src.slice(lt + 2, e).trim();
      // close up to the matching element (tolerates sloppy files)
      for (let k = stack.length - 1; k > 0; k--) {
        if (stack[k].name === name) { stack.length = k; break; }
      }
      i = e < 0 ? n : e + 1;
    } else {
      let j = lt + 1;
      while (j < n && !/[\s/>]/.test(src[j])) j++;
      const el: XNode = { name: src.slice(lt + 1, j), attrs: {}, children: [], text: '' };
      // attributes
      for (;;) {
        while (j < n && /\s/.test(src[j])) j++;
        if (src[j] === '/' || src[j] === '>' || j >= n) break;
        let k = j;
        while (k < n && !/[\s=/>]/.test(src[k])) k++;
        const an = src.slice(j, k);
        j = k;
        while (j < n && /\s/.test(src[j])) j++;
        if (src[j] === '=') {
          j++;
          while (j < n && /\s/.test(src[j])) j++;
          const q = src[j];
          if (q === '"' || q === "'") {
            const e = src.indexOf(q, j + 1);
            el.attrs[an] = decode(src.slice(j + 1, e));
            j = e + 1;
          } else {
            let e = j;
            while (e < n && !/[\s>]/.test(src[e])) e++;
            el.attrs[an] = decode(src.slice(j, e));
            j = e;
          }
        } else if (an) {
          el.attrs[an] = '';
        }
      }
      top.children.push(el);
      if (src[j] === '/') { i = src.indexOf('>', j) + 1; } else { stack.push(el); i = j + 1; }
    }
  }
  return root;
}

export const child = (n: XNode, name: string): XNode | undefined => n.children.find((c) => c.name === name);
export const children = (n: XNode, name: string): XNode[] => n.children.filter((c) => c.name === name);
/** XMLDocument::getOption */
export const attr = (n: XNode | undefined, name: string, def = ''): string => (n && n.attrs[name] !== undefined ? n.attrs[name] : def);
