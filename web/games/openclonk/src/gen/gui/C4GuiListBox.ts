// @ts-nocheck
// OpenClonk 36de799: src/gui/C4GuiListBox.cpp, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $ } from '../../rt/registry.ts';

export class SortCompareElements {
  par = null;
  SortFunc = null;

  init(SortFunc, par) {
    this.par = par;
    this.SortFunc = SortFunc;
    return this;
  }

  op_call(pEl1, pEl2) {
    return this.SortFunc(pEl1, pEl2, this.par) > 0 ? 1 : 0;
  }

  $clone() { return new SortCompareElements().$assign(this); }
  $assign(o) {
    this.par = o.par;
    this.SortFunc = o.SortFunc;
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { SortCompareElements });
