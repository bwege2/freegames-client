// @ts-nocheck
// OpenClonk 36de799: src/game/C4GameVersion.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $ } from '../../rt/registry.ts';
import { StdPair, pair_gt, pair_lt } from '../../rt/std.ts';

export function CompareVersion(iVer1, iVer2, iRVer1 = 9, iRVer2 = 0) {
  let ver = new StdPair(iVer1, iVer2);
  let rVer = new StdPair(iRVer1, iRVer2);
  if (pair_lt(ver, rVer)) {
    return -1;
  }
  if (pair_gt(ver, rVer)) {
    return 1;
  }
  return 0;
}

export function $init(): void {
}

Object.assign($, { CompareVersion });
