// @ts-nocheck
// OpenClonk 36de799: src/config/C4Reloc.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $ } from '../../rt/registry.ts';

export class C4Reloc {
  Paths = [];

  None() {
    this.Paths = [];
    return this;
  }

  $clone() { return new C4Reloc().$assign(this); }
  $assign(o) {
    this.Paths = o.Paths.slice();
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4Reloc });
