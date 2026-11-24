// @ts-nocheck
// OpenClonk 36de799: src/landscape/C4MaterialList.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { P } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';

export class C4MaterialList {
  Amount = new Int32Array(125);

  init() {
    C4MaterialList.prototype.Default.call(this);
    return this;
  }

  $dtor() {
    C4MaterialList.prototype.Clear.call(this);
  }

  Default() {
    this.Reset();
  }

  Clear() {
  }

  Reset() {
    let $t1;
    $t1 = this.Amount;
    for (let $i1 = 0; $i1 < $t1.length; $i1++) {
      const cnt = P($t1, $i1);
      cnt.a[cnt.o] = 0;
    }
  }

  Get(iMaterial) {
    if (!$.Inside$i32$i32$i32$3(iMaterial, 0, 125)) {
      return 0;
    }
    return this.Amount[iMaterial];
  }

  Add(iMaterial, iAmount) {
    if (!$.Inside$i32$i32$i32$3(iMaterial, 0, 125)) {
      return;
    }
    this.Amount[iMaterial] = this.Amount[iMaterial] + iAmount | 0;
  }

  Set(iMaterial, iAmount) {
    if (!$.Inside$i32$i32$i32$3(iMaterial, 0, 125)) {
      return;
    }
    this.Amount[iMaterial] = iAmount;
  }

  $clone() { return new C4MaterialList().$assign(this); }
  $assign(o) {
    this.Amount = o.Amount.slice();
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4MaterialList });
