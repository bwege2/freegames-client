// @ts-nocheck
// OpenClonk 36de799: src/object/C4ObjectCom.cpp, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { Random } from '../../rt/native.ts';
import { P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';

export function ObjectActionWalk(cObj) {
  return cObj.SetActionByName$pi8$pC4Object$pC4Object$i32$b(S("Walk"));
}

export function ObjectActionStand(cObj) {
  cObj.Action.ComDir = 0;
  return ObjectActionWalk(cObj);
}

export function ObjectActionJump(cObj, xdir, ydir, fByCom$) {
  const fByCom = [fByCom$];
  0;
  let pars = new $.C4AulParSet().init$mi32$mi32$rb($.fixtoi$C4Fixed$i32(xdir, 100), $.fixtoi$C4Fixed$i32(ydir, 100), P(fByCom, 0));
  if (!cObj.Call$pi8$pC4AulParSet$b(S("~OnActionJump"), pars.op_and()).op_not()) {
    return true;
  }
  if (!cObj.SetActionByName$pi8$pC4Object$pC4Object$i32$b(S("Jump"))) {
    return false;
  }
  cObj.xdir.$assign(xdir);
  cObj.ydir.$assign(ydir);
  cObj.Mobile = true;
  cObj.Action.t_attach &= -9;
  return true;
}

export function ObjectActionDive(cObj, xdir, ydir) {
  if (!cObj.SetActionByName$pi8$pC4Object$pC4Object$i32$b(S("Dive"))) {
    return false;
  }
  cObj.xdir.$assign(xdir);
  cObj.ydir.$assign(ydir);
  cObj.Mobile = true;
  cObj.Action.t_attach &= -9;
  return true;
}

export function ObjectActionTumble(cObj, dir, xdir, ydir) {
  if (!cObj.SetActionByName$pi8$pC4Object$pC4Object$i32$b(S("Tumble"))) {
    return false;
  }
  cObj.SetDir(dir);
  cObj.xdir.$assign(xdir);
  cObj.ydir.$assign(ydir);
  return true;
}

export function ObjectActionGetPunched(cObj, xdir, ydir) {
  if (!cObj.SetActionByName$pi8$pC4Object$pC4Object$i32$b(S("GetPunched"))) {
    return false;
  }
  cObj.xdir.$assign(xdir);
  cObj.ydir.$assign(ydir);
  return true;
}

export function ObjectActionKneel(cObj) {
  return cObj.SetActionByName$pi8$pC4Object$pC4Object$i32$b(S("KneelDown"));
}

export function ObjectActionFlat(cObj, dir) {
  if (!cObj.SetActionByName$pi8$pC4Object$pC4Object$i32$b(S("FlatUp"))) {
    return false;
  }
  cObj.SetDir(dir);
  return true;
}

export function ObjectActionScale(cObj, dir) {
  if (!cObj.SetActionByName$pi8$pC4Object$pC4Object$i32$b(S("Scale"))) {
    return false;
  }
  cObj.SetDir(dir);
  return true;
}

export function ObjectActionHangle(cObj) {
  return cObj.SetActionByName$pi8$pC4Object$pC4Object$i32$b(S("Hangle"));
}

export function ObjectActionThrow(cObj, pThing = null) {
  if (pThing == null) {
    pThing = cObj.Contents.GetObject();
  }
  if (pThing == null) {
    return false;
  }
  let pthrow = $.C4REAL100(cObj.GetPropertyInt(73 /*P_ThrowSpeed*/));
  let iDir = 1;
  if (cObj.Action.Dir === 0) {
    iDir = -1;
  }
  if (!cObj.SetActionByName$pi8$pC4Object$pC4Object$i32$b(S("Throw"))) {
    return false;
  }
  pThing.Exit(cObj.GetX(), (cObj.GetY() + cObj.Shape.y | 0) - 1 | 0, Random(360) | 0, pthrow.op_mul$i32(iDir).op_add$C4Fixed(cObj.xdir), pthrow.op_neg().op_add$C4Fixed(cObj.ydir), pthrow.op_mul$i32(iDir));
  return true;
}

export function ObjectActionDig(cObj) {
  if (!cObj.SetActionByName$pi8$pC4Object$pC4Object$i32$b(S("Dig"))) {
    return false;
  }
  cObj.Action.Data = 0;
  return true;
}

export function ObjectActionPush(cObj, target) {
  return cObj.SetActionByName$pi8$pC4Object$pC4Object$i32$b(S("Push"), target);
}

function CornerScaleOkay(cObj, iRangeX, iRangeY) {
  let cty = cObj.GetY() - iRangeY | 0;
  let ctx = 0;
  if (cObj.Action.Dir === 0) {
    ctx = cObj.GetX() - iRangeX | 0;
  } else {
    ctx = cObj.GetX() + iRangeX | 0;
  }
  cObj.ContactCheck(ctx, cty);
  return !((cObj.t_contact & 4) >>> 0 !== 0) && !((cObj.t_contact & 1) >>> 0 !== 0) && !((cObj.t_contact & 2) >>> 0 !== 0) && !((cObj.t_contact & 8) >>> 0 !== 0);
}

export function ObjectActionCornerScale(cObj) {
  let iRangeX = 1;
  let iRangeY = 1;
  if (!CornerScaleOkay(cObj, iRangeX, iRangeY)) {
    return false;
  }
  if (!cObj.SetActionByName$pi8$pC4Object$pC4Object$i32$b(S("KneelUp"))) {
    cObj.SetActionByName$pi8$pC4Object$pC4Object$i32$b(S("Walk"));
  }
  cObj.xdir.op_assign(0);
  cObj.ydir.op_assign(0);
  if (cObj.Action.Dir === 0) {
    cObj.fix_x.op_subAssign$C4Fixed($.itofix$i32(iRangeX));
  } else {
    cObj.fix_x.op_addAssign$C4Fixed($.itofix$i32(iRangeX));
  }
  cObj.fix_y.op_subAssign$C4Fixed($.itofix$i32(iRangeY));
  return true;
}

export function ObjectComStop(cObj) {
  cObj.SetActionByName$pi8$pC4Object$pC4Object$i32$b(S("Idle"));
  return ObjectActionStand(cObj);
}

export function ObjectComGrab(cObj$, pTarget$) {
  const cObj = [cObj$];
  const pTarget = [pTarget$];
  if (pTarget[0] == null) {
    return false;
  }
  if (cObj[0].GetProcedure() !== 235) {
    return false;
  }
  if (!ObjectActionPush(cObj[0], pTarget[0])) {
    return false;
  }
  cObj[0].Call$pi8$pC4AulParSet$b(S("~Grab"), new $.C4AulParSet().init$rpC4Object$mb(P(pTarget, 0), true).op_and());
  if (pTarget[0].Status !== 0 && cObj[0].Status !== 0) {
    pTarget[0].Call$pi8$pC4AulParSet$b(S("~Grabbed"), new $.C4AulParSet().init$rpC4Object$mb(P(cObj, 0), true).op_and());
  }
  return true;
}

export function ObjectComUnGrab(cObj$) {
  const cObj = [cObj$];
  if (cObj[0].GetProcedure() === 243) {
    const pTarget = [cObj[0].Action.Target.op_C4Object_()];
    if (ObjectActionStand(cObj[0])) {
      if (!cObj[0].CloseMenu(false)) {
        return false;
      }
      cObj[0].Call$pi8$pC4AulParSet$b(S("~Grab"), new $.C4AulParSet().init$rpC4Object$mb(P(pTarget, 0), false).op_and());
      cObj[0].Action.Target.op_assign(null);
      if (pTarget[0] != null && pTarget[0].Status !== 0 && cObj[0].Status !== 0) {
        pTarget[0].Call$pi8$pC4AulParSet$b(S("~Grabbed"), new $.C4AulParSet().init$rpC4Object$mb(P(cObj, 0), false).op_and());
      }
      return true;
    }
  }
  return false;
}

export function ObjectComJump(cObj) {
  if (cObj.GetProcedure() !== 235) {
    return false;
  }
  let TXDir = $.Fix0$C4Real.$clone();
  let pActionWalk = cObj.GetAction();
  let iPhysicalWalk = $.C4REAL100(pActionWalk.GetPropertyInt(24 /*P_Speed*/)).op_mul$C4Fixed($.itofix$i32$i32(cObj.GetCon(), 100000));
  let iPhysicalJump = $.C4REAL100(cObj.GetPropertyInt(90 /*P_JumpSpeed*/)).op_mul$C4Fixed($.itofix$i32$i32(cObj.GetCon(), 100000));
  if (cObj.Action.ComDir === 7 || cObj.Action.ComDir === 8) {
    TXDir.$assign(iPhysicalWalk.op_neg());
  } else if (cObj.Action.ComDir === 3 || cObj.Action.ComDir === 2) {
    TXDir.$assign(iPhysicalWalk.op_pos());
  }
  let x = cObj.fix_x.$clone();
  let y = cObj.fix_y.$clone();
  let iBtmVtx = cObj.Shape.GetBottomVertex();
  if (iBtmVtx !== -1) {
    x.op_addAssign$i32(cObj.Shape.GetVertexX(iBtmVtx));
    y.op_addAssign$i32(cObj.Shape.GetVertexY(iBtmVtx));
  }
  if (cObj.Shape.ContactDensity > 25 && $.SimFlightHitsLiquid(x.$clone(), y.$clone(), TXDir.$clone(), iPhysicalJump.op_neg()) && ObjectActionDive(cObj, TXDir.$clone(), iPhysicalJump.op_neg())) {
    return true;
  }
  return ObjectActionJump(cObj, TXDir.$clone(), iPhysicalJump.op_neg(), true);
}

export function ObjectComLetGo(cObj, xdirf) {
  return ObjectActionJump(cObj, $.itofix$i32(xdirf), $.Fix0$C4Real.$clone(), true);
}

export function ObjectComDig(cObj) {
  if (!ObjectActionDig(cObj)) {
    $.GameMsgObjectError($.FormatString($.LoadResStr(S("IDS_OBJ_NODIG")), cObj.GetName()).getData(), cObj);
    return false;
  }
  return true;
}

export function ObjectComPut(cObj, pTarget, pThing$ = null) {
  const pThing = [pThing$];
  if (pThing[0] == null) {
    pThing[0] = cObj.Contents.GetObject();
  }
  if (pThing[0] == null) {
    return false;
  }
  if (pTarget == null) {
    return false;
  }
  if (pTarget !== cObj.Contained.op_C4Object_() && !((pTarget.Def.GrabPutGet & 1) !== 0)) {
    return false;
  }
  if (!((pTarget.OCF & 64) >>> 0 !== 0)) {
    return false;
  }
  const fRejectCollect = [false];
  if (!pThing[0].Enter(pTarget, true, true, P(fRejectCollect, 0))) {
    return false;
  }
  cObj.Call$pi8$pC4AulParSet$b(S("~Put"));
  pTarget.Call$pi8$pC4AulParSet$b(S("~Collection"), new $.C4AulParSet().init$rpC4Object$mb(P(pThing, 0), true).op_and());
  return true;
}

export function ObjectComThrow(cObj, pThing = null) {
  if (pThing == null) {
    pThing = cObj.Contents.GetObject();
  }
  if (pThing == null) {
    return false;
  }
  switch (cObj.GetProcedure()) {
    case 235:
      return ObjectActionThrow(cObj, pThing);
  }
  return false;
}

export function ObjectComDrop(cObj, pThing = null) {
  if (pThing == null) {
    pThing = cObj.Contents.GetObject();
  }
  if (pThing == null) {
    return false;
  }
  let pthrow = $.C4REAL100(cObj.GetPropertyInt(73 /*P_ThrowSpeed*/));
  let tdir = 0;
  let right = 0;
  let isHanglingOrSwimming = false;
  let iProc = -1;
  let pActionDef = cObj.GetAction();
  if (pActionDef != null) {
    iProc = pActionDef.GetPropertyP(23 /*P_Procedure*/);
    if (iProc === 239 || iProc === 241) {
      isHanglingOrSwimming = true;
    }
  }
  let iOutposReduction = 1;
  if (iProc !== 238) {
    if (ComDirLike(cObj.Action.ComDir, 7)) {
      tdir = -1;
      right = 0;
      if (cObj.xdir.op_lt$C4Fixed($.C4REAL10(15)) && !isHanglingOrSwimming) {
        iOutposReduction = iOutposReduction - 1 | 0;
      }
    }
    if (ComDirLike(cObj.Action.ComDir, 3)) {
      tdir = 1;
      right = 1;
      if (cObj.xdir.op_gt$C4Fixed($.C4REAL10(-15)) && !isHanglingOrSwimming) {
        iOutposReduction = iOutposReduction - 1 | 0;
      }
    }
  }
  pThing.Exit(cObj.GetX() + Math.imul(Math.imul(cObj.Shape.x + Math.imul(cObj.Shape.Wdt, right) | 0, !(tdir === 0) ? 1 : 0), iOutposReduction) | 0, ((cObj.GetY() + cObj.Shape.y | 0) + cObj.Shape.Hgt | 0) - (pThing.Shape.y + pThing.Shape.Hgt | 0) | 0, 0, pthrow.op_mul$i32(tdir), $.Fix0$C4Real.$clone(), $.Fix0$C4Real.$clone());
  cObj.SetOCF();
  ObjectComUnGrab(cObj);
  return true;
}

export function ObjectComPutTake(cObj, pTarget, pThing = null) {
  if (pTarget == null) {
    return false;
  }
  if (pThing == null) {
    pThing = cObj.Contents.GetObject();
  }
  if (pThing != null) {
    return ObjectComPut(cObj, pTarget, pThing);
  }
  if (pTarget === cObj.Contained.op_C4Object_()) {
    return ObjectComTake(cObj);
  }
  if ((pTarget.Def.GrabPutGet & 2) !== 0) {
    return cObj.ActivateMenu(13, 0, 0, 0, pTarget);
  }
  return false;
}

export function ObjectComTake(cObj) {
  return cObj.ActivateMenu(6);
}

export function ObjectComTake2(cObj) {
  return cObj.ActivateMenu(13, 0, 0, 0, cObj.Contained.op_C4Object_());
}

export function ObjectComPunch(cObj$, pTarget, punch$ = 0) {
  const cObj = [cObj$];
  const punch = [punch$];
  if (cObj[0] == null || pTarget == null) {
    return false;
  }
  if (punch[0] === 0) {
    return true;
  }
  let fBlowStopped = !pTarget.Call$pi8$pC4AulParSet$b(S("~QueryCatchBlow"), new $.C4AulParSet().init$rpC4Object(P(cObj, 0)).op_and()).op_not();
  if (fBlowStopped && punch[0] > 1) {
    punch[0] = punch[0] / 2 | 0;
  }
  pTarget.DoEnergy(-punch[0] | 0, false, 40, cObj[0].Controller);
  let tdir = 1;
  if (cObj[0].Action.Dir === 0) {
    tdir = -1;
  }
  pTarget.Action.ComDir = 0;
  if (fBlowStopped) {
    return false;
  }
  if (punch[0] >= 10 && ObjectActionTumble(pTarget, pTarget.Action.Dir, $.C4REAL100(150).op_mul$i32(tdir), $.itofix$i32(-2))) {
    pTarget.Call$pi8$pC4AulParSet$b(S("~CatchBlow"), new $.C4AulParSet().init$ri32$rpC4Object(P(punch, 0), P(cObj, 0)).op_and());
    return true;
  }
  if (ObjectActionGetPunched(pTarget, $.C4REAL100(250).op_mul$i32(tdir), $.Fix0$C4Real.$clone())) {
    pTarget.Call$pi8$pC4AulParSet$b(S("~CatchBlow"), new $.C4AulParSet().init$ri32$rpC4Object(P(punch, 0), P(cObj, 0)).op_and());
    return true;
  }
  return false;
}

export function ObjectComCancelAttach(cObj) {
  if (cObj.GetProcedure() === 246) {
    return cObj.SetAction(null);
  }
  return false;
}

export function ObjectComStopDig(cObj) {
  let o_xdir = cObj.xdir.$clone();
  let o_ydir = cObj.ydir.$clone();
  ObjectActionStand(cObj);
  cObj.xdir.$assign(o_xdir);
  cObj.ydir.$assign(o_ydir);
  if (cObj.Command != null && cObj.Command.Command === 13) {
    cObj.ClearCommand(cObj.Command);
  }
}

export function ComDirLike(iComDir, iSample) {
  if (iComDir === iSample) {
    return true;
  }
  if ((iComDir % 8 + 1 | 0) === iSample) {
    return true;
  }
  if (iComDir === (iSample % 8 + 1 | 0)) {
    return true;
  }
  return false;
}

export function $init(): void {
}

Object.assign($, { ComDirLike, CornerScaleOkay, ObjectActionCornerScale, ObjectActionDig, ObjectActionDive, ObjectActionFlat, ObjectActionGetPunched, ObjectActionHangle, ObjectActionJump, ObjectActionKneel, ObjectActionPush, ObjectActionScale, ObjectActionStand, ObjectActionThrow, ObjectActionTumble, ObjectActionWalk, ObjectComCancelAttach, ObjectComDig, ObjectComDrop, ObjectComGrab, ObjectComJump, ObjectComLetGo, ObjectComPunch, ObjectComPut, ObjectComPutTake, ObjectComStop, ObjectComStopDig, ObjectComTake, ObjectComTake2, ObjectComThrow, ObjectComUnGrab });
