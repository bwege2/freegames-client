// @ts-nocheck
// OpenClonk 36de799: src/object/C4ObjectGraphics.cpp, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { ftoi32 } from '../../rt/int.ts';
import { $ } from '../../rt/registry.ts';

function DrawVertex(cgo, tx, ty, col, contact) {
  if ($.Inside$i32$f32$f32(ftoi32(tx), cgo.X, Math.fround(cgo.X + cgo.Wdt)) && $.Inside$i32$f32$f32(ftoi32(ty), cgo.Y, Math.fround(cgo.Y + cgo.Hgt))) {
    $.pDraw.DrawLineDw(cgo.Surface, Math.fround(tx - Math.fround(1)), ty, Math.fround(tx + Math.fround(1)), ty, col >>> 0, 0.5);
    $.pDraw.DrawLineDw(cgo.Surface, tx, Math.fround(ty - Math.fround(1)), tx, Math.fround(ty + Math.fround(1)), col >>> 0, 0.5);
    if (contact !== 0) {
      $.pDraw.DrawFrameDw(cgo.Surface, ftoi32(tx - 1.5), ftoi32(ty - 1.5), ftoi32(tx + 1.5), ftoi32(ty + 1.5), 0xffffffff);
    }
  }
}

export function $init(): void {
}

Object.assign($, { DrawVertex });
