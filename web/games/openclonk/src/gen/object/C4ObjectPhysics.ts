// @ts-nocheck
// OpenClonk 36de799: src/object/C4ObjectPhysics.cpp, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $ } from '../../rt/registry.ts';

function BubbleOut(tx, ty) {
  if (!$.GBackSemiSolid(tx, ty)) {
    return;
  }
  if ($.Objects.ObjectCount($.C4ID.Bubble.$clone()) >= 150) {
    return;
  }
  $.Game.CreateObject$C4ID$pC4Object$i32$i32$i32$i32$b$C4Fixed$C4Fixed$C4Fixed$i32($.C4ID.Bubble.$clone(), null, -1, tx, ty);
}

export function $init(): void {
}

Object.assign($, { BubbleOut });
