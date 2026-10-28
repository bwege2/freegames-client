// A small interpreter for the HP 2000 Time-Shared BASIC that the Hunt the Wumpus listing is written in
// (re/wumpus/wumpus.basic), as a test oracle only: it runs the listing itself, so the port can be
// compared with the original program. It knows the statements the listing uses: REM PRINT INPUT
// IF..THEN GOTO "GOTO e OF" GOSUB RETURN FOR..TO NEXT DIM READ DATA DEF FN END and assignments;
// # and <> are "not equal". Output follows HP BASIC: numbers with a blank (or "-") before and a blank
// after, INPUT prompts with "?". It shares no code with the port (src/game.ts).

export interface BasicIo {
  print(s: string): void;
  input(): Promise<string>;
  rnd(): number;
}

type Tok = { t: 'num'; v: number } | { t: 'str'; v: string } | { t: 'id'; v: string } | { t: 'op'; v: string };

function lex(s: string): Tok[] {
  const out: Tok[] = [];
  const re = /\s*(?:(\d+\.?\d*|\.\d+)|"([^"]*)"|([A-Z][A-Z0-9]*\$?)|(<>|<=|>=|[-+*/(),;=#<>!]))/gy;
  let m: RegExpExecArray | null;
  while (re.lastIndex < s.length) {
    if (/^\s*$/.test(s.slice(re.lastIndex))) break;
    m = re.exec(s);
    if (!m) throw new Error(`cannot read: ${s.slice(re.lastIndex)}`);
    if (m[1] !== undefined) out.push({ t: 'num', v: Number(m[1]) });
    else if (m[2] !== undefined) out.push({ t: 'str', v: m[2] });
    else if (m[3] !== undefined) out.push({ t: 'id', v: m[3] });
    else out.push({ t: 'op', v: m[4] });
  }
  return out;
}

type Value = number | string;

interface Line { no: number; kw: string; toks: Tok[] }

class Stop extends Error {}

export async function runBasic(listing: string, io: BasicIo): Promise<void> {
  const lines: Line[] = [];
  for (const raw of listing.replace(/\r/g, '').split('\n')) {
    const m = /^\s*(\d+)\s+(.*)$/.exec(raw);
    if (!m) continue;
    const text = m[2].trim();
    const kw = /^(REM|PRINT|INPUT|IF|GOTO|GOSUB|RETURN|FOR|NEXT|DIM|READ|DATA|DEF|END|LET)/.exec(text)?.[1] ?? 'LET';
    lines.push({ no: Number(m[1]), kw, toks: kw === 'REM' ? [] : lex(kw === 'LET' && !text.startsWith('LET') ? text : text.slice(kw.length)) });
  }
  lines.sort((a, b) => a.no - b.no);
  const index = new Map(lines.map((l, i) => [l.no, i]));
  const jump = (no: number) => {
    const i = index.get(no);
    if (i === undefined) throw new Error(`no line ${no}`);
    return i;
  };

  const vars = new Map<string, Value>();
  const arrays = new Map<string, Value[]>();
  const dims = new Map<string, number[]>();
  const fns = new Map<string, { param: string; body: Tok[] }>();
  const data: number[] = [];
  for (const l of lines) if (l.kw === 'DATA') for (const t of l.toks) if (t.t === 'num') data.push(t.v);
  // GOSUB remembers how many FOR frames were open: RETURN drops the subroutine's own loops, and FOR and
  // NEXT look for their variable only among the frames of the current subroutine (as BASICs of the time)
  const gosubs: { ret: number; base: number }[] = [];
  const fors: { v: string; limit: number; step: number; at: number }[] = [];
  const base = () => gosubs.length ? gosubs[gosubs.length - 1].base : 0;

  const getVar = (n: string): Value => vars.get(n) ?? (n.endsWith('$') ? '' : 0);
  const cell = (n: string, idx: number[]): number => {
    if (!arrays.has(n)) { dims.set(n, idx.map(() => 10)); arrays.set(n, []); }
    const d = dims.get(n)!;
    let off = 0;
    idx.forEach((x, i) => {
      if (x < 0 || x > d[i]) throw new Error(`subscript ${x} out of range for ${n}`);
      off = off * (d[i] + 1) + Math.floor(x);
    });
    return off;
  };

  // ---- expressions (OR < AND < comparisons < + - < * / < unary -)
  let toks: Tok[] = [];
  let p = 0;
  const peek = () => toks[p];
  const isOp = (v: string) => peek()?.t === 'op' && peek().v === v;
  const isId = (v: string) => peek()?.t === 'id' && peek().v === v;
  const expect = (v: string) => { if (!isOp(v) && !isId(v)) throw new Error(`expected ${v}`); p++; };
  const args = (): number[] => {
    expect('(');
    const out = [num(expr())];
    while (isOp(',')) { p++; out.push(num(expr())); }
    expect(')');
    return out;
  };
  const num = (v: Value) => { if (typeof v !== 'number') throw new Error('number expected'); return v; };
  function primary(): Value {
    const t = toks[p++];
    if (!t) throw new Error('expression expected');
    if (t.t === 'num' || t.t === 'str') return t.v;
    if (t.t === 'op' && t.v === '(') { const v = expr(); expect(')'); return v; }
    if (t.t === 'op' && t.v === '-') return -num(primary());
    if (t.t === 'id') {
      if (t.v === 'INT') return Math.floor(args()[0]);
      if (t.v === 'RND') { args(); return io.rnd(); }
      if (/^FN[A-Z]$/.test(t.v)) {
        const f = fns.get(t.v)!;
        const a = args()[0];
        const saved = [toks, p, vars.get(f.param)] as const;
        vars.set(f.param, a);
        toks = f.body; p = 0;
        const v = expr();
        [toks, p] = [saved[0], saved[1]];
        if (saved[2] === undefined) vars.delete(f.param); else vars.set(f.param, saved[2]);
        return v;
      }
      if (isOp('(')) { const idx = args(); return arrays.get(t.v)?.[cell(t.v, idx)] ?? 0; }
      return getVar(t.v);
    }
    throw new Error(`unexpected ${t.v}`);
  }
  function term(): Value {
    let v = primary();
    while (isOp('*') || isOp('/')) { const o = toks[p++].v; const r = num(primary()); v = o === '*' ? num(v) * r : num(v) / r; }
    return v;
  }
  function sum(): Value {
    let v = term();
    while (isOp('+') || isOp('-')) { const o = toks[p++].v; const r = num(term()); v = o === '+' ? num(v) + r : num(v) - r; }
    return v;
  }
  function compare(): Value {
    const l = sum();
    for (const o of ['=', '#', '<>', '<=', '>=', '<', '>']) {
      if (!isOp(o)) continue;
      p++;
      const r = sum();
      const c = o === '=' ? l === r : o === '#' || o === '<>' ? l !== r : o === '<=' ? l <= r : o === '>=' ? l >= r : o === '<' ? l < r : l > r;
      return c ? 1 : 0;
    }
    return l;
  }
  function and(): Value { let v = compare(); while (isId('AND')) { p++; const r = compare(); v = num(v) && num(r) ? 1 : 0; } return v; }
  function expr(): Value { let v = and(); while (isId('OR')) { p++; const r = and(); v = num(v) || num(r) ? 1 : 0; } return v; }

  // HP 2000 BASIC's packed number field: sign position and digits, padded to 6 (9, 12, 15) columns
  const fmt = (v: Value) => {
    if (typeof v === 'string') return v;
    const text = (v < 0 ? '-' : ' ') + String(Math.abs(v));
    const width = [6, 9, 12, 15].find((w) => text.length - 1 <= (w / 3 - 1) * 3) ?? 15;
    return text + ' '.repeat(Math.max(0, width - text.length));
  };
  const assignTarget = (): ((v: Value) => void) => {
    const t = toks[p++];
    if (t?.t !== 'id') throw new Error('variable expected');
    if (isOp('(')) { const idx = args(); return (v) => { const a = arrays.get(t.v)!; a[cell(t.v, idx)] = v; }; }
    return (v) => vars.set(t.v, v);
  };
  const numberIn = (line: string): number | null => {
    const item = line.split(',')[0].trim();
    return /^[+-]?(\d+\.?\d*|\.\d+)(E[+-]?\d+)?$/i.test(item) ? Number(item) : null;
  };

  let pc = 0;
  try {
    while (pc < lines.length) {
      const line = lines[pc];
      toks = line.toks; p = 0;
      let next = pc + 1;
      switch (line.kw) {
        case 'REM': case 'DATA': break;
        case 'END': throw new Stop();
        case 'PRINT': {
          let out = '', newline = true;
          while (p < toks.length) {
            if (isOp(';')) { p++; newline = false; continue; }
            out += fmt(expr());
            newline = true;
          }
          io.print(out + (newline ? '\n' : ''));
          break;
        }
        case 'INPUT': {
          const t = toks[0] as { v: string };
          const set = assignTarget();
          for (;;) {
            io.print('?');
            const raw = await io.input();
            if (t.v.endsWith('$')) { set(raw.trim()); break; }
            const v = numberIn(raw);
            if (v !== null) { set(v); break; }
          }
          break;
        }
        case 'IF': {
          const c = expr();
          expect('THEN');
          if (num(c)) next = jump(num(primary()));
          break;
        }
        case 'GOTO': {
          const v = num(expr());
          if (isId('OF')) {
            p++;
            const targets: number[] = [num(primary())];
            while (isOp(',')) { p++; targets.push(num(primary())); }
            if (v >= 1 && v <= targets.length && Number.isInteger(v)) next = jump(targets[v - 1]);
          } else next = jump(v);
          break;
        }
        case 'GOSUB': gosubs.push({ ret: pc + 1, base: fors.length }); next = jump(num(expr())); break;
        case 'RETURN': {
          const r = gosubs.pop();
          if (r === undefined) throw new Error('RETURN without GOSUB');
          fors.length = Math.min(fors.length, r.base);
          next = r.ret;
          break;
        }
        case 'DIM': {
          while (p < toks.length) {
            const n = (toks[p++] as { v: string }).v;
            const d = args();
            arrays.set(n, []); dims.set(n, d);
            if (isOp(',')) p++;
          }
          break;
        }
        case 'READ': {
          while (p < toks.length) {
            const set = assignTarget();
            const v = data.shift();
            if (v === undefined) throw new Error('out of data');
            set(v);
            if (isOp(',')) p++;
          }
          break;
        }
        case 'DEF': {
          const name = (toks[p++] as { v: string }).v;
          expect('(');
          const param = (toks[p++] as { v: string }).v;
          expect(')');
          expect('=');
          fns.set(name, { param, body: toks.slice(p) });
          break;
        }
        case 'FOR': {
          const v = (toks[p++] as { v: string }).v;
          expect('=');
          const init = num(sum());
          expect('TO');
          const limit = num(sum());
          let step = 1;
          if (isId('STEP')) { p++; step = num(sum()); }
          vars.set(v, init);
          // a FOR on a variable that already has a frame drops it and every frame above it
          const open = fors.findIndex((f, i) => i >= base() && f.v === v);
          if (open >= 0) fors.length = open;
          fors.push({ v, limit, step, at: pc + 1 });
          if (step > 0 ? init > limit : init < limit) throw new Error('empty FOR loops are not used by the listing');
          break;
        }
        case 'NEXT': {
          const v = (toks[p++] as { v: string }).v;
          // a GOTO out of an inner loop leaves its frame behind: NEXT drops frames until its variable
          while (fors.length > base() && fors[fors.length - 1].v !== v) fors.pop();
          const f = fors.length > base() ? fors[fors.length - 1] : undefined;
          if (!f) throw new Error(`NEXT ${v} without FOR`);
          const x = num(getVar(v)) + f.step;
          vars.set(v, x);
          if (f.step > 0 ? x <= f.limit : x >= f.limit) next = f.at;
          else fors.pop();
          break;
        }
        case 'LET': {
          if (isId('LET')) p++;
          const set = assignTarget();
          expect('=');
          set(expr());
          break;
        }
      }
      pc = next;
    }
  } catch (e) {
    if (!(e instanceof Stop)) throw e;
  }
}
