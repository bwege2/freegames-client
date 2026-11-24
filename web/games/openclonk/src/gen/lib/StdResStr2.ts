// @ts-nocheck
// OpenClonk 36de799: src/lib/StdResStr2.cpp, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { P } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';



export function LoadResStrNoAmp(id) {
  let str = $.LoadResStr(id);
  let cpd = P($.strResult$StdResStr2, 0);
  for (let cps = str; cps.a[cps.o] !== 0; cps = cps.add(1), cpd = cpd.add(1)) {
    if (cps.a[cps.o] === 38) {
      cpd = cpd.add(-1);
    } else {
      cpd.a[cpd.o] = cps.a[cps.o];
    }
  }
  cpd.a[cpd.o] = 0;
  return P($.strResult$StdResStr2, 0);
}

export function $init(): void {
  $.ResStrMaxLen$StdResStr2 = 4096;
  $.strResult$StdResStr2 = new Int8Array(4097);
}

Object.assign($, { LoadResStrNoAmp });
