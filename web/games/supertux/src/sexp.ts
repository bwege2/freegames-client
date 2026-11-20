// SuperTux 0.6.3 S-expression reader for levels, sprites, tilesets and fonts.
// The original uses sexp-cpp; this reads the same subset: lists, quoted strings (with \" and \\),
// atoms, and ';' line comments outside strings.
export type Sexp = string | Sexp[];

export function parseSexp(text: string): Sexp {
  let quoted = false;
  const chars: string[] = [];
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted && c === '\\' && i + 1 < text.length) { chars.push(c, text[++i]); continue; }
    if (c === '"') { quoted = !quoted; chars.push(c); continue; }
    if (c === ';' && !quoted) { while (i < text.length && text[i] !== '\n') i++; continue; }
    chars.push(c);
  }
  const s = chars.join('');
  const root: Sexp[] = [];
  const stack: Sexp[][] = [root];
  let i = 0;
  const isSpace = (c: string) => c === ' ' || c === '\t' || c === '\r' || c === '\n';
  while (i < s.length) {
    const c = s[i];
    if (isSpace(c)) { i++; continue; }
    if (c === '(') { const list: Sexp[] = []; stack[stack.length - 1].push(list); stack.push(list); i++; continue; }
    if (c === ')') { if (stack.length > 1) stack.pop(); i++; continue; }
    if (c === '"') {
      i++;
      let out = '';
      while (i < s.length && s[i] !== '"') {
        if (s[i] === '\\' && i + 1 < s.length) {
          const n = s[i + 1];
          out += n === 'n' ? '\n' : n === 't' ? '\t' : n === 'r' ? '\r' : n;
          i += 2;
        } else out += s[i++];
      }
      i++;
      stack[stack.length - 1].push(out);
      continue;
    }
    let j = i;
    while (j < s.length && !isSpace(s[j]) && s[j] !== '(' && s[j] !== ')' && s[j] !== '"') j++;
    stack[stack.length - 1].push(s.slice(i, j));
    i = j;
  }
  if (root.length === 0) throw new Error('empty S-expression');
  return root[0];
}

export function list(node: Sexp | undefined): Sexp[] {
  return Array.isArray(node) ? node : [];
}

export function children(node: Sexp | undefined, name: string): Sexp[][] {
  return list(node).filter((x): x is Sexp[] => Array.isArray(x) && x[0] === name);
}

export function child(node: Sexp | undefined, name: string): Sexp[] | undefined {
  return list(node).find((x): x is Sexp[] => Array.isArray(x) && x[0] === name);
}

export function has(node: Sexp | undefined, name: string): boolean {
  return child(node, name) !== undefined;
}

export function atom(node: Sexp | undefined, name: string, fallback = ''): string {
  const c = child(node, name);
  return c && typeof c[1] === 'string' ? c[1] : fallback;
}

export function num(node: Sexp | undefined, name: string, fallback = 0): number {
  const c = child(node, name);
  const v = c ? Number(c[1]) : NaN;
  return Number.isFinite(v) ? v : fallback;
}

export function bool(node: Sexp | undefined, name: string, fallback = false): boolean {
  const c = child(node, name);
  if (!c) return fallback;
  return c[1] === '#t' || c[1] === 'true';
}

export function numbers(node: Sexp | undefined, name: string): number[] {
  const c = child(node, name);
  return c ? c.slice(1).map(Number) : [];
}

/** gettext-wrapped text: (name (_ "Hello")) -> "Hello" */
export function text(node: Sexp | undefined, name: string, fallback = ''): string {
  const c = child(node, name);
  if (!c) return fallback;
  const v = c[1];
  if (typeof v === 'string') return v;
  if (Array.isArray(v) && typeof v[1] === 'string') return v[1];
  return fallback;
}

export function textOf(v: Sexp | undefined, fallback = ''): string {
  if (typeof v === 'string') return v;
  if (Array.isArray(v) && typeof v[1] === 'string') return v[1];
  return fallback;
}
