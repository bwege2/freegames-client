// @ts-nocheck
// OpenClonk 36de799: src/control/C4PlayerControl.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $ } from '../../rt/registry.ts';

export class C4PlayerControlAssignmentSets {
  Sets = [];
  clear_previous = false;

  init() {
    this.Sets = [];
    this.clear_previous = false;
    return this;
  }

  $clone() { return new C4PlayerControlAssignmentSets().$assign(this); }
  $assign(o) {
    this.Sets = o.Sets.slice();
    this.clear_previous = o.clear_previous;
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4PlayerControlAssignmentSets });
