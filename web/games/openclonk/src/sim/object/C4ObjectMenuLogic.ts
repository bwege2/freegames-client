// @ts-nocheck
// OpenClonk 36de799: src/object/C4ObjectMenuLogic.cpp, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $ } from '../../rt/registry.ts';

function DrawMenuSymbol(iMenu, cgo, iOwner) {
  let ccgo = new $.C4Facet().init$v();
  let dwColor = 0;
  if ($.ValidPlr(iOwner) !== 0) {
    dwColor = $.Players.Get(iOwner).ColorDw;
  }
  switch (iMenu) {
    case 4:
      $.GraphicsResource.fctFlagClr.DrawClr(ccgo.$assign(cgo.GetFraction(75, 75)), true, dwColor);
      $.GraphicsResource.fctWealth.Draw$rC4Facet$b$i32$i32$b(ccgo.$assign(cgo.GetFraction(100, 50, 1, 8)));
      $.GraphicsResource.fctArrow.Draw$rC4Facet$b$i32$i32$b(ccgo.$assign(cgo.GetFraction(70, 70, 2, 16)), false, 0);
      break;
    case 5:
      $.GraphicsResource.fctFlagClr.DrawClr(ccgo.$assign(cgo.GetFraction(75, 75)), true, dwColor);
      $.GraphicsResource.fctWealth.Draw$rC4Facet$b$i32$i32$b(ccgo.$assign(cgo.GetFraction(100, 50, 1, 8)));
      $.GraphicsResource.fctArrow.Draw$rC4Facet$b$i32$i32$b(ccgo.$assign(cgo.GetFraction(70, 70, 2, 16)), false, 1);
      break;
  }
}

export function $init(): void {
}

Object.assign($, { DrawMenuSymbol });
