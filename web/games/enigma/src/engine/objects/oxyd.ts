// st_oxyd (stones/OxydStone.cc): the oxyd stones, their colours, the fair shuffle with level rules
// (wo:shuffleOxyd), opening pairs and the level end when all are open.
import {
  Stone, Register, server, IntegerRand, toInt, toBool, toStr, getObjectList, valueEquals, levelPrepareHooks,
  host, ReplaceStone, MakeStone, toTokenList, GameObject, XLevelRuntime, MOVABLE_PERSISTENT, objValue, type GridPos, type Message, type Value,
  type StoneContact,
} from '../core.ts';
import { LuaTable, type LuaValue } from '../../lua/interp.ts';
import type { LevelLua } from '../api.ts';

const CLOSED = 0, OPEN_SINGLE = 1, OPENING = 2, CLOSING = 3, OPEN_PAIR = 4;
const AUTO = -1, FAKE = -2, QUAKE = -3, BOLD = -4;
const OBJBIT_CLOSED = 1 << 24, OBJBIT_OPENPAIR = 1 << 25;
const NOTHING = 0, SOLUTION = 1, COUNT = 2, ALL = 3;
const RULE_SINGLE_MIN = 0, RULE_SINGLE_MAX = 1, RULE_PAIR_MIN = 2, RULE_PAIR_MAX = 3;

interface Rule { groupId1: number; groupId2: number; ruleId: number }
interface Frame {
  rulesLimit: number[]; oxydsCandidatesMask: number[]; oxydsCandidatesCount: number[];
  freeOxydsMask: number; freePseudoCount: number; freePairsCount: number;
  selOxyd1Mask: number; selOxyd2Mask: number; openedOxydIndex: number; fixedcolorOxydIndex: number; isColored: boolean;
}
function newFrame(): Frame {
  return { rulesLimit: [], oxydsCandidatesMask: [], oxydsCandidatesCount: [], freeOxydsMask: 0, freePseudoCount: 0, freePairsCount: 0,
    selOxyd1Mask: 0, selOxyd2Mask: 0, openedOxydIndex: 0, fixedcolorOxydIndex: 0, isColored: false };
}
function copyFrame(f: Frame): Frame {
  return { ...f, rulesLimit: f.rulesLimit.slice(), oxydsCandidatesMask: f.oxydsCandidatesMask.slice(), oxydsCandidatesCount: f.oxydsCandidatesCount.slice() };
}

const S = {
  levelOxyds: [] as OxydStone[],
  isInit: false,
  colorsUsageCount: [] as number[],
  shuffledFakeCount: 0, shuffledQuakeCount: 0, shuffledBoldCount: 0, oddUnshuffledColor: false,
  randomOxydIds: [] as number[],
  groupsMembers: [] as number[], groupsSharedMembers: [] as number[],
  singleRulesMin: [] as Rule[], singleRulesMax: [] as Rule[], pairRulesMin: [] as Rule[], pairRulesMax: [] as Rule[],
  shuffleStack: [] as Frame[],
};
const u32 = (x: number) => x >>> 0;
const bit = (i: number) => u32(1 << i);

function numColorsAvailable() { return server.MaxOxydColor + 1; }
function countOxyds(m: number) { let r = 0; for (let j = 0; j < S.levelOxyds.length; j++) { if (m & 1) r++; m >>>= 1; } return r; }
function oxydId(mask: number) {
  for (let i = 0; i < S.levelOxyds.length; i++) { if (mask === 1) return i; mask >>>= 1; }
  throw new XLevelRuntime('Oxyd shuffle - oxydId attempt to convert bad mask');
}
function randomMember(members: number) {
  if (!members) throw new XLevelRuntime('Oxyd shuffle - random member out of no selection');
  for (let i = 0; i < S.levelOxyds.length; i++) { const c = bit(S.randomOxydIds[i]); if (members & c) return c; }
  throw new XLevelRuntime('Oxyd shuffle - random member no candidate found');
}
function color(o: OxydStone) { return toInt(o.getAttr('oxydcolor')); }
function noshuffle(o: OxydStone) { return toBool(o.getAttr('noshuffle')); }

function groupId(v: Value): number {
  if (S.levelOxyds.length >= 32) throw new XLevelRuntime('Oxyd shuffle rule - error more than 32 oxyds');
  const objs = getObjectList(v, null);
  let mask = 0, count = 0;
  for (const o of objs) {
    const j = S.levelOxyds.indexOf(o as OxydStone);
    if (j >= 0) { mask = u32(mask | bit(j)); count++; }
  }
  if (count !== objs.length) throw new XLevelRuntime('Oxyd shuffle rule - group member identification error');
  const k = S.groupsMembers.indexOf(mask);
  if (k >= 0) return k;
  S.groupsMembers.push(mask);
  return S.groupsMembers.length - 1;
}
function addShuffleRule(type: number, limit: number, g1: Value, g2: Value) {
  if (S.shuffleStack.length === 0) S.shuffleStack.push(newFrame());
  const base = S.shuffleStack[0];
  const r: Rule = { groupId1: groupId(g1), groupId2: groupId(g2), ruleId: base.rulesLimit.length };
  base.rulesLimit.push(limit);
  if (S.groupsMembers[r.groupId1] === 0) throw new XLevelRuntime('Oxyd shuffle rule for an empty group');
  if (type === RULE_SINGLE_MIN) S.singleRulesMin.push(r);
  else if (type === RULE_SINGLE_MAX) S.singleRulesMax.push(r);
  else {
    if (S.groupsMembers[r.groupId2] === 0) throw new XLevelRuntime('Oxyd shuffle rule for an empty group');
    (type === RULE_PAIR_MIN ? S.pairRulesMin : S.pairRulesMax).push(r);
  }
}

function initColors() {
  if (S.isInit) return;
  const numColors = numColorsAvailable();
  S.colorsUsageCount = new Array(numColors).fill(0);
  const noShuffleCount = new Array(numColors).fill(0);
  S.shuffledFakeCount = S.shuffledQuakeCount = S.shuffledBoldCount = 0;
  S.oddUnshuffledColor = false;
  const auto: OxydStone[] = [];
  for (const o of S.levelOxyds) {
    const c = color(o);
    const decline = noshuffle(o);
    if (c >= 0 && c < numColors) { S.colorsUsageCount[c]++; if (decline) noShuffleCount[c]++; }
    else if (c === AUTO) { if (decline) throw new XLevelRuntime('Oxyd init colors - autocolored oxyd declined shuffle'); auto.push(o); }
    else if (c === FAKE) { if (!decline) S.shuffledFakeCount++; }
    else if (c === QUAKE) { if (!decline) S.shuffledQuakeCount++; }
    else if (c === BOLD) { if (!decline) S.shuffledBoldCount++; }
  }
  let onlyPairs = true;
  for (let i = 0; i < numColors; i++) {
    if (S.colorsUsageCount[i] % 2 === 1) {
      if (auto.length > 0) { auto.pop()!.setAttr('oxydcolor', i); S.colorsUsageCount[i]++; }
      else if (onlyPairs) { onlyPairs = false; break; }
      else if (!server.AllowSingleOxyds) throw new XLevelRuntime('Oxyd init colors - too many unpaired oxyds with given color');
    }
    if (noShuffleCount[i] % 2 === 1) S.oddUnshuffledColor = true;
  }
  let last: OxydStone | null = null;
  let lastColor = 0;
  if (auto.length % 2 === 1) onlyPairs = false;
  let dc = 0;
  while (auto.length > 0) {
    const c = Math.trunc(dc / 2) % numColors;
    if (S.colorsUsageCount[c] <= 2 * Math.trunc(Math.trunc(dc / 2) / numColors) + 1) {
      lastColor = c;
      last = auto.pop()!;
      last.setAttr('oxydcolor', c);
      S.colorsUsageCount[c]++;
    }
    dc++;
  }
  if (!onlyPairs && last) {
    last.setAttr('oxydcolor', FAKE);
    S.colorsUsageCount[lastColor]--;
    S.shuffledFakeCount++;
  } else if (!(onlyPairs || server.AllowSingleOxyds)) throw new XLevelRuntime('Oxyd init colors - too many unpaired oxyds with given color');
  S.isInit = true;
}

function shuffleColors(logFlag = NOTHING) {
  initColors();
  let onlyPairs = true;
  for (let i = 0; i < numColorsAvailable(); i++) if (S.colorsUsageCount[i] !== 0 && S.colorsUsageCount[i] !== 2) { onlyPairs = false; break; }
  if (S.shuffleStack.length > 0 && onlyPairs && S.levelOxyds.length < 32) fairShuffleColors(logFlag);
  else simpleShuffleColors();
  for (const o of S.levelOxyds) if (o.state === CLOSED && o.isDisplayable()) o.setClosedModel(true);
}

function simpleShuffleColors() {
  const closed: number[] = [];
  S.levelOxyds.forEach((o, i) => { if (o.state === CLOSED && !noshuffle(o)) closed.push(i); });
  const size = closed.length;
  if (size > 1) {
    for (let i = 0; i < size; i++) {
      let a = IntegerRand(0, size - 2);
      if (a >= i) ++a;
      const o1 = S.levelOxyds[closed[i]], o2 = S.levelOxyds[closed[a]];
      const ic = o1.getAttr('oxydcolor');
      o1.setAttr('oxydcolor', o2.getAttr('oxydcolor'));
      o2.setAttr('oxydcolor', ic);
    }
  }
}

function fairShuffleColors(logFlag: number) {
  const n = S.levelOxyds.length;
  S.randomOxydIds = Array.from({ length: n }, (_, i) => i);
  for (let i = 0; i < n - 1; i++) {
    const j = IntegerRand(i, n - 1);
    const t = S.randomOxydIds[i]; S.randomOxydIds[i] = S.randomOxydIds[j]; S.randomOxydIds[j] = t;
  }
  if (S.groupsSharedMembers.length === 0) {
    let noshufflePseudo = 0;
    for (let i = 0; i < n; i++) { const o = S.levelOxyds[i]; if (color(o) < AUTO && noshuffle(o)) noshufflePseudo = u32(noshufflePseudo | bit(i)); }
    for (let i = 0; i < S.groupsMembers.length; i++) {
      let shared = 0;
      for (let j = 0; j < S.groupsMembers.length; j++) if (i !== j) shared = u32(shared | (S.groupsMembers[i] & S.groupsMembers[j]));
      S.groupsSharedMembers.push(u32(shared & ~noshufflePseudo));
    }
    const all = u32((n >= 32 ? 0xffffffff : u32((2 ** n) - 1)) & ~noshufflePseudo);
    const base = S.shuffleStack[0];
    for (let i = 0; i < n; i++) {
      const cand = u32(all & ~bit(i));
      base.oxydsCandidatesMask.push(cand);
      base.oxydsCandidatesCount.push(countOxyds(cand));
    }
    base.freeOxydsMask = all;
    base.freePseudoCount = S.shuffledFakeCount + S.shuffledQuakeCount + S.shuffledBoldCount;
    base.freePairsCount = 0;
    for (let i = 0; i < numColorsAvailable(); i++) base.freePairsCount += S.colorsUsageCount[i];
    base.freePairsCount = Math.trunc(base.freePairsCount / 2);
    base.selOxyd1Mask = base.selOxyd2Mask = 0;
    base.openedOxydIndex = base.fixedcolorOxydIndex = 0;
  }
  const second = copyFrame(S.shuffleStack[S.shuffleStack.length - 1]);
  let notClosedPseudo = 0;
  for (let i = 0; i < n; i++) { const o = S.levelOxyds[i]; if (color(o) < AUTO && o.state !== CLOSED) notClosedPseudo = u32(notClosedPseudo | bit(i)); }
  second.freeOxydsMask = u32(second.freeOxydsMask & ~notClosedPseudo);
  for (let i = 0; i < n; i++) {
    second.oxydsCandidatesMask[i] = u32(second.oxydsCandidatesMask[i] & ~notClosedPseudo);
    second.oxydsCandidatesCount[i] = countOxyds(second.oxydsCandidatesMask[i]);
  }
  S.shuffleStack.push(second);
  if (logFlag === NOTHING) logFlag = SOLUTION;
  const result = evaluateTopFrame(logFlag);
  S.shuffleStack.pop();
  if (!(result > 0)) throw new XLevelRuntime('Oxyd shuffle colors - no fair solution exists for given rules');
}

function evaluateTopFrame(logFlag: number): number {
  const n = S.levelOxyds.length;
  const top = S.shuffleStack[S.shuffleStack.length - 1];
  let solutions = 0;
  if (top.selOxyd1Mask !== 0) {
    if (top.selOxyd2Mask !== 0) {
      const o1 = S.levelOxyds[oxydId(top.selOxyd1Mask)], o2 = S.levelOxyds[oxydId(top.selOxyd2Mask)];
      if ((noshuffle(o1) || o1.state !== CLOSED) && (noshuffle(o2) || o2.state !== CLOSED) && color(o1) >= 0 && color(o2) >= 0 && color(o1) !== color(o2)) return 0;
    }
    top.freeOxydsMask = u32(top.freeOxydsMask & ~top.selOxyd1Mask & ~top.selOxyd2Mask);
    if (top.selOxyd2Mask !== 0) top.freePairsCount--; else top.freePseudoCount--;
    for (let i = 0; i < n; i++) {
      if (top.freeOxydsMask & bit(i)) {
        if (top.oxydsCandidatesMask[i] & top.selOxyd1Mask) top.oxydsCandidatesCount[i]--;
        if (top.oxydsCandidatesMask[i] & top.selOxyd2Mask) top.oxydsCandidatesCount[i]--;
        top.oxydsCandidatesMask[i] = u32(top.oxydsCandidatesMask[i] & top.freeOxydsMask);
      }
    }
    if (top.selOxyd2Mask !== 0) {
      for (const r of [...S.singleRulesMin, ...S.singleRulesMax]) {
        const g = S.groupsMembers[r.groupId1];
        if ((g & top.selOxyd1Mask) && (g & top.selOxyd2Mask)) top.rulesLimit[r.ruleId]--;
      }
      for (const r of [...S.pairRulesMin, ...S.pairRulesMax]) {
        const g1 = S.groupsMembers[r.groupId1], g2 = S.groupsMembers[r.groupId2];
        if (((g1 & top.selOxyd1Mask) && (g2 & top.selOxyd2Mask)) || ((g1 & top.selOxyd2Mask) && (g2 & top.selOxyd1Mask))) top.rulesLimit[r.ruleId]--;
      }
    }
  }
  for (const r of S.singleRulesMax) {
    if (top.rulesLimit[r.ruleId] === 0) {
      const hot = S.groupsMembers[r.groupId1] & top.freeOxydsMask;
      for (let j = 0; j < n; j++) if (hot & bit(j)) {
        top.oxydsCandidatesMask[j] = u32(top.oxydsCandidatesMask[j] & ~S.groupsMembers[r.groupId1]);
        top.oxydsCandidatesCount[j] = countOxyds(top.oxydsCandidatesMask[j]);
      }
      top.rulesLimit[r.ruleId] = -1;
    }
  }
  for (const r of S.pairRulesMax) {
    if (top.rulesLimit[r.ruleId] === 0) {
      const h1 = S.groupsMembers[r.groupId1] & top.freeOxydsMask, h2 = S.groupsMembers[r.groupId2] & top.freeOxydsMask;
      for (let j = 0; j < n; j++) {
        if (h1 & bit(j)) { top.oxydsCandidatesMask[j] = u32(top.oxydsCandidatesMask[j] & ~S.groupsMembers[r.groupId2]); top.oxydsCandidatesCount[j] = countOxyds(top.oxydsCandidatesMask[j]); }
        if (h2 & bit(j)) { top.oxydsCandidatesMask[j] = u32(top.oxydsCandidatesMask[j] & ~S.groupsMembers[r.groupId1]); top.oxydsCandidatesCount[j] = countOxyds(top.oxydsCandidatesMask[j]); }
      }
      top.rulesLimit[r.ruleId] = -1;
    }
  }
  if (top.freePseudoCount === 0) {
    for (let j = 0; j < n; j++) if ((top.freeOxydsMask & bit(j)) && top.oxydsCandidatesCount[j] === 0) return 0;
  }
  if (top.freeOxydsMask === 0) {
    for (const r of [...S.singleRulesMin, ...S.pairRulesMin]) if (top.rulesLimit[r.ruleId] > 0) return 0;
    colorShuffleDistribution(logFlag);
    return 1;
  }
  for (const r of S.singleRulesMin) if (top.rulesLimit[r.ruleId] * 2 > countOxyds(top.freeOxydsMask & S.groupsMembers[r.groupId1])) return 0;
  for (const r of S.pairRulesMin) {
    if (top.rulesLimit[r.ruleId] > countOxyds(top.freeOxydsMask & S.groupsMembers[r.groupId1]) ||
      top.rulesLimit[r.ruleId] > countOxyds(top.freeOxydsMask & S.groupsMembers[r.groupId2])) return 0;
  }
  const next = copyFrame(top);
  next.selOxyd1Mask = next.selOxyd2Mask = 0;
  const recurse = () => { S.shuffleStack.push(copyFrame(next)); const r = evaluateTopFrame(logFlag); S.shuffleStack.pop(); return r; };
  for (; next.openedOxydIndex < n; next.openedOxydIndex++) {
    if (S.levelOxyds[next.openedOxydIndex].state === OPEN_PAIR) {
      const c = color(S.levelOxyds[next.openedOxydIndex]);
      for (let i = next.openedOxydIndex + 1; i < n; i++) {
        if (color(S.levelOxyds[i]) === c) {
          next.selOxyd1Mask = bit(next.openedOxydIndex); next.selOxyd2Mask = bit(i);
          next.openedOxydIndex++;
          return recurse();
        }
      }
    }
  }
  for (; next.fixedcolorOxydIndex < n; next.fixedcolorOxydIndex++) {
    const c1 = S.levelOxyds[next.fixedcolorOxydIndex];
    const col1 = color(c1);
    if (col1 > AUTO && (noshuffle(c1) || c1.state === OPENING || c1.state === CLOSING || c1.state === OPEN_SINGLE)) {
      for (let i = next.fixedcolorOxydIndex + 1; i < n; i++) {
        const c2 = S.levelOxyds[i];
        if (color(c2) === col1 && (noshuffle(c2) || c2.state === OPENING || c2.state === CLOSING || c2.state === OPEN_SINGLE)) {
          next.selOxyd1Mask = bit(next.fixedcolorOxydIndex); next.selOxyd2Mask = bit(i);
          if ((next.selOxyd2Mask & next.oxydsCandidatesMask[next.fixedcolorOxydIndex]) === 0) return 0;
          next.fixedcolorOxydIndex++;
          return recurse();
        }
      }
    }
  }
  if (logFlag < COUNT && !S.oddUnshuffledColor) {
    for (const r of S.singleRulesMin) {
      if (top.rulesLimit[r.ruleId] > 0 && (S.groupsSharedMembers[r.groupId1] & top.freeOxydsMask) === 0) {
        next.selOxyd1Mask = randomMember(S.groupsMembers[r.groupId1] & top.freeOxydsMask);
        next.selOxyd2Mask = randomMember(S.groupsMembers[r.groupId1] & top.freeOxydsMask & ~next.selOxyd1Mask);
        return recurse();
      }
    }
    for (const r of S.pairRulesMin) {
      if (top.rulesLimit[r.ruleId] > 0 && (S.groupsSharedMembers[r.groupId1] & top.freeOxydsMask) === 0 && (S.groupsSharedMembers[r.groupId2] & top.freeOxydsMask) === 0) {
        next.selOxyd1Mask = randomMember(S.groupsMembers[r.groupId1] & top.freeOxydsMask);
        next.selOxyd2Mask = randomMember(S.groupsMembers[r.groupId2] & top.freeOxydsMask);
        return recurse();
      }
    }
  }
  let minFree = n;
  for (let i = 0; i < n; i++) {
    const j = S.randomOxydIds[i];
    if (next.freeOxydsMask & bit(j)) {
      if (minFree === n) minFree = j;
      else if (next.oxydsCandidatesCount[j] < next.oxydsCandidatesCount[minFree]) minFree = j;
    }
  }
  if (next.freePairsCount > 0 && next.oxydsCandidatesCount[minFree] > 0) {
    next.selOxyd1Mask = bit(minFree);
    const cands = next.oxydsCandidatesMask[minFree];
    for (let i = 0; i < n; i++) {
      const j = S.randomOxydIds[i];
      if (cands & bit(j)) {
        next.selOxyd2Mask = bit(j);
        const r = recurse();
        if (r > 0 && logFlag < COUNT) return r;
        solutions += r;
      }
    }
  }
  const pseudo = S.levelOxyds[minFree];
  if (next.freePseudoCount > 0 && (color(pseudo) < AUTO || (!noshuffle(pseudo) && pseudo.state === CLOSED))) {
    next.selOxyd1Mask = bit(minFree);
    next.selOxyd2Mask = 0;
    const r = recurse();
    if (r > 0 && logFlag < COUNT) return r;
    solutions += r;
  }
  return solutions;
}

function colorShuffleDistribution(logFlag: number) {
  if (logFlag === COUNT) return;
  const remain = S.colorsUsageCount.slice();
  let rf = S.shuffledFakeCount, rq = S.shuffledQuakeCount, rb = S.shuffledBoldCount;
  for (const f of S.shuffleStack) {
    f.isColored = false;
    if (f.selOxyd1Mask !== 0) {
      if (f.selOxyd2Mask === 0) {
        const o = S.levelOxyds[oxydId(f.selOxyd1Mask)];
        if (!(rf + rq + rb > 0)) throw new XLevelRuntime('Oxyd shuffle - to few pseudo colors');
        const i = IntegerRand(1, rf + rq + rb);
        if (i <= rf) { rf--; o.setAttr('oxydcolor', FAKE); }
        else if (i <= rf + rq) { rq--; o.setAttr('oxydcolor', QUAKE); }
        else { rb--; o.setAttr('oxydcolor', BOLD); }
        f.isColored = true;
      } else {
        const o1 = S.levelOxyds[oxydId(f.selOxyd1Mask)], o2 = S.levelOxyds[oxydId(f.selOxyd2Mask)];
        if (o1.state === OPEN_PAIR) { remain[color(o1)] -= 2; f.isColored = true; }
        else if (noshuffle(o1) || o1.state !== CLOSED) { const c = color(o1); o2.setAttr('oxydcolor', c); remain[c] -= 2; f.isColored = true; }
        else if (noshuffle(o2) || o2.state !== CLOSED) { const c = color(o2); o1.setAttr('oxydcolor', c); remain[c] -= 2; f.isColored = true; }
      }
    }
  }
  const pairs: number[] = [];
  for (let c = 0; c < numColorsAvailable(); c++) for (let i = 0; i < Math.trunc(remain[c] / 2); i++) pairs.push(c);
  for (let i = 0; i < pairs.length - 1; i++) {
    const j = IntegerRand(i, pairs.length - 1);
    const t = pairs[i]; pairs[i] = pairs[j]; pairs[j] = t;
  }
  let ci = 0;
  for (const f of S.shuffleStack) {
    if (!f.isColored && f.selOxyd1Mask !== 0) {
      S.levelOxyds[oxydId(f.selOxyd1Mask)].setAttr('oxydcolor', pairs[ci]);
      S.levelOxyds[oxydId(f.selOxyd2Mask)].setAttr('oxydcolor', pairs[ci]);
      ci++;
    }
  }
}

function invalidateShuffle() {
  S.shuffleStack = []; S.groupsMembers = []; S.groupsSharedMembers = [];
  S.singleRulesMin = []; S.singleRulesMax = []; S.pairRulesMin = []; S.pairRulesMax = [];
  S.colorsUsageCount = []; S.isInit = false;
}
levelPrepareHooks.push(() => { S.levelOxyds = []; invalidateShuffle(); });

export class OxydStone extends Stone {
  constructor(flavor = 'b') {
    super();
    this.setAttr('flavor', flavor);
    this.setAttr('oxydcolor', AUTO);
  }
  getClass() { return 'st_oxyd'; }
  movableTrait() { return MOVABLE_PERSISTENT; }
  clone(): GameObject {
    const o = super.clone() as OxydStone;
    S.levelOxyds.push(o);
    invalidateShuffle();
    return o;
  }
  dispose() {
    const i = S.levelOxyds.indexOf(this);
    if (i >= 0) S.levelOxyds.splice(i, 1);
    invalidateShuffle();
    super.dispose();
  }
  message(m: Message): Value {
    if (m.message === 'closeall') { closeAllStandardOxyds(); return null; }
    if (m.message === 'peepall') {
      for (const o of S.levelOxyds) if (o.state === CLOSED && o.isDisplayable()) o.setClosedModel(false);
    } else if (m.message === 'shuffle') { shuffleColors(); return null; }
    else if ((m.message === '_trigger' && toBool(m.value)) || m.message === '_cannonball') { this.tryOpen(); return null; }
    else if (m.message === '_init') { initColors(); return null; }
    else if (m.message === '_model_reanimated') {
      if (this.objFlags & OBJBIT_CLOSED) { this.state = CLOSED; this.setClosedModel(); this.objFlags &= ~OBJBIT_CLOSED; }
      else if (this.objFlags & OBJBIT_OPENPAIR) {
        this.state = OPEN_PAIR;
        this.set_model(`st_oxyd${toStr(this.getAttr('flavor'))}${toInt(this.getDefaultedAttr('oxydcolor', 0))}_open`);
        this.objFlags &= ~OBJBIT_OPENPAIR;
      }
      return null;
    }
    return super.message(m);
  }
  setAttr(key: string, val: Value) {
    if (key === 'oxydcolor' && this.state !== CLOSED) throw new XLevelRuntime('OxydStone error - recoloring of a not closed stone');
    if (key === 'flavor' && this.state !== CLOSED) throw new XLevelRuntime('OxydStone error - reflavoring of a not closed stone');
    super.setAttr(key, val);
    if (key === 'flavor' && this.pos.x >= 0) this.setClosedModel(true);
  }
  maxState() { return 2; }
  toggleState() {
    switch (this.state) {
      case OPEN_PAIR: return;
      case OPEN_SINGLE: case OPENING: this.setState(0); return;
      default: this.setState(1);
    }
  }
  externalState() {
    switch (this.state) {
      case OPEN_SINGLE: case OPENING: return 1;
      case OPEN_PAIR: return 2;
      default: return 0;
    }
  }
  setState(s: number) {
    if (this.isDisplayable()) {
      if (this.state === OPEN_PAIR) return;
      if (s === 1) this.tryOpen();
      else if (color(this) >= AUTO) this.setIState(CLOSING);
    }
  }
  actor_hit(_sc: StoneContact) { this.tryOpen(); }
  is_removable() { return !toBool(this.getAttr('static')); }
  animcb() {
    if (this.state === CLOSING) this.setIState(CLOSED);
    else if (this.state === OPENING) this.setIState(OPEN_SINGLE);
    else if (this.state === OPEN_PAIR) this.setIState(OPEN_PAIR);
    else if (this.state === OPEN_SINGLE) this.setIState(CLOSING);
  }
  on_creation(p: GridPos) {
    this.setClosedModel(true);
    this.activatePhoto();
    super.on_creation(p);
  }
  on_removal(p: GridPos) { this.deactivatePhoto(); this.kill_model(p); }
  init_model() {}
  lightDirChanged(oldDirs: number, _n: number) { if (oldDirs === 0) this.tryOpen(); }
  setClosedModel(isInitial = false) {
    const flavor = toStr(this.getDefaultedAttr('flavor', 'a'));
    const c = color(this);
    if (flavor === 'e' && !isInitial && c !== FAKE) this.set_model(`st_oxyd${flavor}${c}`);
    else this.set_model('st_oxyd' + flavor);
  }
  tryOpen() {
    let single = false;
    let pair: OxydStone | null = null;
    initColors();
    for (const o of S.levelOxyds) {
      if (o.state !== CLOSED && color(o) < AUTO) return;
      if (o.state === OPEN_SINGLE || o.state === OPENING) { single = true; pair = o; }
    }
    const my = color(this);
    if (my < AUTO) {
      if (single) pair!.setIState(CLOSING);
      if (my <= QUAKE) this.setIState(OPENING);
    } else if (this.state === CLOSED || this.state === CLOSING) {
      if (single) {
        if (color(pair!) === my) {
          pair!.setIState(OPEN_PAIR);
          this.setIState(OPEN_PAIR);
          this.setAttr('$pairid', pair!.id);
        } else {
          pair!.setIState(CLOSING);
          this.setIState(OPENING);
        }
      } else this.setIState(OPENING);
    }
  }
  setIState(ns: number) {
    if (!this.isDisplayable()) {
      if (ns === CLOSING) this.objFlags |= OBJBIT_CLOSED;
      else if (ns === OPEN_PAIR) this.objFlags |= OBJBIT_OPENPAIR;
      else throw new XLevelRuntime('OxydStone error - unexpected new iState');
      return;
    }
    const flavor = toStr(this.getDefaultedAttr('flavor', 'a'));
    const col = String(toInt(this.getDefaultedAttr('oxydcolor', 0)));
    const base = 'st_oxyd' + flavor;
    const model = base + col;
    const old = this.state;
    const oldExt = this.externalState();
    this.state = ns;
    let didShuffle = false, didQuake = false;
    switch (ns) {
      case CLOSED:
        if (color(this) === BOLD) { shuffleColors(); didShuffle = true; }
        this.setClosedModel();
        break;
      case OPEN_SINGLE:
        if (color(this) <= QUAKE) {
          this.set_anim(base + '_pseudo' + col);
          if (color(this) === QUAKE) { closeAllStandardOxyds(); didQuake = true; this.sound_event('quake'); }
          else if (color(this) === BOLD) this.sound_event('shuffle');
        } else this.set_model(model + '_blink');
        break;
      case OPEN_PAIR:
        if (old === CLOSED || old === CLOSING) {
          this.sound_event('oxydopen');
          this.sound_event('oxydopened');
          if (old === CLOSING) this.get_model()?.reverse();
          else this.set_anim(model + '_opening');
        } else this.set_model(model + '_open');
        if (!S.levelOxyds.some((o) => o.state !== OPEN_PAIR)) host.finishLevel();
        break;
      case OPENING:
        this.sound_event('oxydopen');
        if (old === CLOSED) this.set_anim(model + '_opening');
        else if (old === CLOSING) this.get_model()?.reverse();
        break;
      case CLOSING:
        if (old === CLOSED || old === CLOSING) { this.state = old; return; }
        this.sound_event('oxydclose');
        if (old === OPENING) this.get_model()?.reverse();
        else if (old === OPEN_SINGLE || old === OPEN_PAIR) this.set_anim(model + '_closing');
        break;
    }
    if ((color(this) > AUTO && oldExt !== this.externalState() && oldExt === 0) || didShuffle || didQuake) {
      this.performAction(this.externalState() !== 0);
    } else if (color(this) > AUTO && oldExt === 2 && oldExt === this.externalState()) {
      const v = this.getAttr('selection');
      if (v !== undefined) {
        const tokens = toTokenList(v).map((t) => toStr(t));
        if (!(tokens.length > 0 && tokens.length <= 2)) throw new XLevelRuntime("Oxyd stone with illegal 'selection' attribute");
        this.sound_event('stonetransform');
        const first = tokens[0] ?? '', last = tokens[tokens.length - 1] ?? '';
        const paired = GameObject.getObject(toInt(this.getAttr('$pairid')));
        if (paired instanceof Stone) {
          if (first.startsWith('=')) host.callLua('enigma.settile', first.slice(1), paired, true);
          else ReplaceStone(paired.pos, MakeStone(first));
        }
        if (last.startsWith('=')) host.callLua('enigma.settile', last.slice(1), this, true);
        else ReplaceStone(this.pos, MakeStone(last));
      }
    }
  }
}

function closeAllStandardOxyds() {
  for (const o of S.levelOxyds) if (color(o) >= AUTO) o.setIState(CLOSING);
}

/** wo:shuffleOxyd(rules...) (lua.cc shuffleOxyd) */
export function shuffleOxyd(api: LevelLua, rules: LuaValue[]) {
  let logFlag = NOTHING;
  for (const rule of rules) {
    if (!(rule instanceof LuaTable)) api.err('Shuffle oxyds - rule is not a table');
    const r1 = rule.getInt(1);
    if (!(api.isGroup(r1) || api.isObject(r1) || typeof r1 === 'string')) api.err('Shuffle oxyds - rule first group fault');
    const g1 = api.toValue(r1);
    const r2 = rule.getInt(2);
    if (!(api.isGroup(r2) || api.isObject(r2) || typeof r2 === 'string' || r2 === undefined)) api.err('Shuffle oxyds - rule second group fault');
    const g2 = api.toValue(r2);
    const isPair = r2 !== undefined;
    const log = rule.get('log');
    if (log === 'solution' && logFlag < SOLUTION) logFlag = SOLUTION;
    else if (log === 'count' && logFlag < COUNT) logFlag = COUNT;
    else if (log === 'all' && logFlag < ALL) logFlag = ALL;
    const clamp = (v: LuaValue) => Math.max(0, Math.min(numColorsAvailable(), Math.trunc(Number(v) || 0)));
    const mn = rule.get('min');
    if (mn !== undefined) addShuffleRule(isPair ? RULE_PAIR_MIN : RULE_SINGLE_MIN, clamp(mn), g1, g2);
    const mx = rule.get('max');
    if (mx !== undefined) addShuffleRule(isPair ? RULE_PAIR_MAX : RULE_SINGLE_MAX, clamp(mx), g1, g2);
    if (!isPair) {
      if (rule.get('linear') === true) {
        let first: GameObject | null = null;
        for (const o of getObjectList(g1, null)) {
          if (!first) first = o;
          else { addShuffleRule(RULE_PAIR_MAX, 0, objValue(first), objValue(o)); first = o; }
        }
      }
      if (rule.get('circular') === true) {
        let first: GameObject | null = null, left: GameObject | null = null;
        for (const o of getObjectList(g1, null)) {
          if (!first) { first = o; left = o; }
          else { addShuffleRule(RULE_PAIR_MAX, 0, objValue(left), objValue(o)); left = o; }
        }
        if (first && first !== left) addShuffleRule(RULE_PAIR_MAX, 0, objValue(first), objValue(left));
      }
    }
  }
  shuffleColors(logFlag);
}

for (const [name, fl] of [['st_oxyd', 'b'], ['st_oxyd_a', 'a'], ['st_oxyd_b', 'b'], ['st_oxyd_c', 'c'], ['st_oxyd_d', 'd'], ['st_oxyd_e', 'e']] as const) {
  Register(name, new OxydStone(fl));
}
export const _unused = valueEquals;
