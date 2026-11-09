// backed-map.cpp of HyperRogue 13.1o. STUB (a later stage or package; created by P3).
import { NotPorted } from './hyper.ts';
import { G } from './globals.ts';
import type { cell } from './locations.ts';

// added by P3 (landlock.ts, landgen.ts, monstergen.ts): STAGE1-STUB until its owner ports it
export function apply_precision_policy(_c: cell, from: cell): void { if (!(G.precision_policy & 2)) return; if (!from) return; if (!G.currentmap.get_backmap()) return; throw new NotPorted('apply_precision_policy (backed map)'); } // STAGE1-STUB (real without a backmap, as in the standard geometry). NEW module backed-map.ts (P1's stub list)
