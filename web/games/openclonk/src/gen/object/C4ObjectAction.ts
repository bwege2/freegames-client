// @ts-nocheck
// OpenClonk 36de799: src/object/C4ObjectAction.cpp, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';

export function GrabLost(cObj, prev_target) {
  if (prev_target != null && prev_target.Status !== 0) {
    prev_target.Call$pi8$pC4AulParSet$b(S("~GrabLost"));
  }
  for (let pCom = cObj.Command; pCom != null; pCom = pCom.Next) {
    if (pCom.Next != null && pCom.Next.Command === 15) {
      cObj.ClearCommand(pCom);
      break;
    }
  }
}

function DoGravity(cobj) {
  if (cobj.InLiquid && cobj.Def.Float !== 0) {
    cobj.ydir.op_subAssign$C4Fixed($.Landscape.GetGravity().op_mul$C4Fixed($.C4REAL100(80)));
    if (cobj.ydir.op_lt$C4Fixed($.C4REAL100(-160))) {
      cobj.ydir.$assign($.C4REAL100(-160));
    }
    if (cobj.xdir.op_lt$C4Fixed($.FloatFriction.op_neg())) {
      cobj.xdir.op_addAssign$C4Fixed($.FloatFriction);
    }
    if (cobj.xdir.op_gt$C4Fixed($.FloatFriction.op_pos())) {
      cobj.xdir.op_subAssign$C4Fixed($.FloatFriction);
    }
    if (cobj.rdir.op_lt$C4Fixed($.FloatFriction.op_neg())) {
      cobj.rdir.op_addAssign$C4Fixed($.FloatFriction);
    }
    if (cobj.rdir.op_gt$C4Fixed($.FloatFriction.op_pos())) {
      cobj.rdir.op_subAssign$C4Fixed($.FloatFriction);
    }
    let y_float = (cobj.GetY() - 1 | 0) + (Math.imul(cobj.Def.Float, cobj.GetCon()) / 100000 | 0) | 0;
    if (!$.GBackLiquid(cobj.GetX(), y_float - 1 | 0) || !$.GBackLiquid(cobj.GetX(), y_float - 2 | 0)) {
      if (cobj.ydir.op_lt$i32(0)) {
        cobj.ydir.op_divAssign$i32(2);
        if ($.Abs$C4Fixed(cobj.ydir.$clone()).op_lt$C4Fixed($.C4REAL100(10))) {
          cobj.ydir.op_assign(0);
        }
      }
    }
  } else if ((~cobj.Category & 1) !== 0) {
    cobj.ydir.op_addAssign$C4Fixed($.Landscape.GetGravity());
  }
}

export function ReduceLineSegments(rShape, fAlternate) {
  for (let cnt = 0; ((cnt + 2 | 0) + (fAlternate ? 1 : 0) | 0) < rShape.VtxNum; cnt = cnt + 1 | 0) {
    if ($.PathFree$i32$i32$i32$i32(rShape.VtxX[cnt], rShape.VtxY[cnt], rShape.VtxX[(cnt + 2 | 0) + (fAlternate ? 1 : 0) | 0], rShape.VtxY[(cnt + 2 | 0) + (fAlternate ? 1 : 0) | 0])) {
      if (fAlternate) {
        rShape.RemoveVertex(cnt + 2 | 0);
      }
      rShape.RemoveVertex(cnt + 1 | 0);
      return true;
    }
  }
  return false;
}

export function StopActionDelayCommand(cobj) {
  $.ObjectComStop(cobj);
  cobj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(9, null, 0, 0, 50);
}

export function Towards(val, target, step) {
  if (val.op_eq$C4Fixed(target)) {
    return;
  }
  if ($.Abs$C4Fixed(val.op_sub$C4Fixed(target)).op_le$C4Fixed(step)) {
    val.$assign(target);
    return;
  }
  if (val.op_lt$C4Fixed(target)) {
    val.op_addAssign$C4Fixed(step);
  } else {
    val.op_subAssign$C4Fixed(step);
  }
}

export function $init(): void {
}

Object.assign($, { DoGravity, GrabLost, ReduceLineSegments, StopActionDelayCommand, Towards });
