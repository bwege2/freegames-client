// @ts-nocheck
// OpenClonk 36de799: src/platform/C4TimeMilliseconds.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $ } from '../../rt/registry.ts';

export class C4TimeMilliseconds {
  time = 0;
  inf = 0 /*NoInfinity*/;

  init$u32(millis) {
    this.time = millis;
    this.inf = 0 /*NoInfinity*/;
    return this;
  }

  $clone() { return new C4TimeMilliseconds().$assign(this); }
  $assign(o) {
    this.time = o.time;
    this.inf = o.inf;
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4TimeMilliseconds });
