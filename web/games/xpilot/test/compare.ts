// Compares a run of the port (harness.ts) with a client's draw golden: section by section in order,
// the number of calls and their hash (drawidx), and for committed sections the lines (draw.txt, with
// the XDrawPoint runs folded as goldens.py folds them), to show the first line that differs.
import { readDraw, readDrawIndex, type DrawIndex } from './golden.ts';
import { runClient, type RunOptions, type RunResult, type Section } from './harness.ts';

const FOLD = 64;

function fnvHex(lines: string[]): string {
  let hi = 0xcbf29ce4, lo = 0x84222325;
  for (const s of lines) {
    for (let i = 0; i < s.length; i++) {
      lo = (lo ^ (s.charCodeAt(i) & 0xff)) >>> 0;
      const t = lo * 0x1b3;
      hi = (hi * 0x1b3 + Math.floor(t / 4294967296) + lo * 256) >>> 0;
      lo = t >>> 0;
    }
  }
  return hi.toString(16).padStart(8, '0') + lo.toString(16).padStart(8, '0');
}

/** the lines as committed: runs of more than 64 XDrawPoint calls folded */
export function fold(lines: string[]): string[] {
  const out: string[] = [];
  let run: string[] = [];
  const flush = () => {
    if (run.length > FOLD) out.push(`XDrawPoint* n=${run.length} hash=${fnvHex(run)}\n`);
    else out.push(...run);
    run = [];
  };
  for (const l of lines) {
    if (l.startsWith('XDrawPoint ')) run.push(l);
    else {
      flush();
      out.push(l);
    }
  }
  flush();
  return out;
}

export interface Comparison {
  /** sections of the golden that came out the same, from the start */
  matched: number;
  total: number;
  /** where the first difference is */
  first: string | null;
  run: RunResult;
}

export async function compareClient(scn: string, nick: string, opts: RunOptions & { maxSections?: number } = {}): Promise<Comparison> {
  const index: DrawIndex[] = readDrawIndex(scn, nick);
  const draw = readDraw(scn, nick);
  const committed = new Set(index.filter((e) => e.committed !== null).map((e) => e.section));
  const limit = Math.min(opts.maxSections ?? index.length, index.length);
  let at = 0;
  let first: string | null = null;
  class Stop extends Error {}
  const check = (s: Section) => {
    if (first !== null) return;
    const g = index[at];
    if (!g) {
      first = `section ${s.name} after the golden's last`;
      return;
    }
    if (g.section !== s.name || g.calls !== s.calls || g.hash !== s.hash) {
      let where = `section ${at} is ${s.name} with ${s.calls} calls ${s.hash}, golden ${g.section} with ${g.calls} calls ${g.hash}`;
      const want = draw.get(g.section);
      if (want && s.lines) {
        const got = fold(s.lines).filter((l) => !l.startsWith('# '));
        const exp = want.map((b) => b.toString('latin1')).filter((l) => !l.startsWith('# '));
        let i = 0;
        while (i < got.length && i < exp.length && got[i] === exp[i]) i++;
        where += `\n  line ${i + 1}: port   ${got[i]?.trimEnd() ?? '(end)'}\n  line ${i + 1}: golden ${exp[i]?.trimEnd() ?? '(end)'}`;
        if (i > 0) where += `\n  after  ${got[i - 1].trimEnd()}`;
      } else if (!committed.has(g.section)) where += ' (not committed)';
      first = where;
      throw new Stop();
    }
    at++;
    if (at >= limit) throw new Stop();
  };
  let run: RunResult;
  try {
    run = await runClient(scn, nick, { ...opts, keep: (name) => committed.has(name) || name === index[at]?.section, onSection: check });
  } catch (e) {
    if (!(e instanceof Stop)) throw e;
    run = { sections: [], c2sOk: 0, c2sBad: [], sent: [], log: [], lastTick: -1, exitStatus: null };
  }
  if (first === null && at < limit) first = `the run ended after ${at} sections (golden: ${index.length})`;
  return { matched: at, total: index.length, first, run };
}
