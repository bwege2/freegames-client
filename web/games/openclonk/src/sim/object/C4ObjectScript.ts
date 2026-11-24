// @ts-nocheck
// OpenClonk 36de799: src/object/C4ObjectScript.cpp, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $and64n, $or64n, $shr64n, $u64n } from '../../rt/int.ts';
import { c$strlen, c$strncat, c$strncpy, c$strstr } from '../../rt/libc.ts';
import { UnsyncedRandom$u32 } from '../../rt/native.ts';
import { $oadd, $oat, $own, $padd, $rd, $wr, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, $min, $throw, StdString } from '../../rt/std.ts';

export function C4ValueToMatrix$rC4Value$pStdMeshMatrix(value, matrix) {
  let array = value.getArray();
  if (array == null) {
    return false;
  }
  return C4ValueToMatrix$C4ValueArray$pStdMeshMatrix(array, matrix);
}

export function C4ValueToMatrix$C4ValueArray$pStdMeshMatrix(array, matrix) {
  if (array.GetSize() !== 12) {
    return false;
  }
  const trans = matrix;
  $wr(trans.op_call$i32$i32(0, 0), 0, Math.fround(Math.fround(array.op_index$i32$c(0).getInt()) / 1000));
  $wr(trans.op_call$i32$i32(0, 1), 0, Math.fround(Math.fround(array.op_index$i32$c(1).getInt()) / 1000));
  $wr(trans.op_call$i32$i32(0, 2), 0, Math.fround(Math.fround(array.op_index$i32$c(2).getInt()) / 1000));
  $wr(trans.op_call$i32$i32(0, 3), 0, Math.fround(Math.fround(array.op_index$i32$c(3).getInt()) / 1000));
  $wr(trans.op_call$i32$i32(1, 0), 0, Math.fround(Math.fround(array.op_index$i32$c(4).getInt()) / 1000));
  $wr(trans.op_call$i32$i32(1, 1), 0, Math.fround(Math.fround(array.op_index$i32$c(5).getInt()) / 1000));
  $wr(trans.op_call$i32$i32(1, 2), 0, Math.fround(Math.fround(array.op_index$i32$c(6).getInt()) / 1000));
  $wr(trans.op_call$i32$i32(1, 3), 0, Math.fround(Math.fround(array.op_index$i32$c(7).getInt()) / 1000));
  $wr(trans.op_call$i32$i32(2, 0), 0, Math.fround(Math.fround(array.op_index$i32$c(8).getInt()) / 1000));
  $wr(trans.op_call$i32$i32(2, 1), 0, Math.fround(Math.fround(array.op_index$i32$c(9).getInt()) / 1000));
  $wr(trans.op_call$i32$i32(2, 2), 0, Math.fround(Math.fround(array.op_index$i32$c(10).getInt()) / 1000));
  $wr(trans.op_call$i32$i32(2, 3), 0, Math.fround(Math.fround(array.op_index$i32$c(11).getInt()) / 1000));
  return true;
}

function FnChangeDef(Obj, to_id) {
  return !!Obj.ChangeDef(to_id.$clone());
}

function FnSetSolidMask(Obj, iX, iY, iWdt, iHgt, iTX, iTY) {
  Obj.SetSolidMask(iX | 0, iY | 0, iWdt | 0, iHgt | 0, iTX | 0, iTY | 0);
}

function FnSetHalfVehicleSolidMask(Obj, set) {
  Obj.SetHalfVehicleSolidMask(set);
}

function FnDeathAnnounce(Obj) {
  let MaxDeathMsg = 7;
  if ($.Game.C4S.Head.Film !== 0) {
    return;
  }
  if (Obj.Info != null && $rd(P(Obj.Info.DeathMessage, 0)) !== 0) {
    $.GameMsgObject(P(Obj.Info.DeathMessage, 0), Obj);
  } else {
    const idDeathMsg = new Int8Array(129);
    $.ssprintf$4(idDeathMsg, S("IDS_OBJ_DEATH%d"), 1 + UnsyncedRandom$u32(7) >>> 0);
    $.GameMsgObject($.FormatString($.LoadResStr(P(idDeathMsg, 0)), Obj.GetName()).getData(), Obj);
  }
}

function FnGrabContents(Obj, from) {
  if (from == null || Obj === from) {
    return false;
  }
  Obj.GrabContents(from);
  return true;
}

function FnPunch(Obj, target, punch) {
  if (target == null) {
    return false;
  }
  return !!$.ObjectComPunch(Obj, target, punch | 0);
}

function FnKill(_this, pObj, fForced) {
  if (pObj == null) {
    pObj = $.Object_(_this);
  }
  if (pObj == null || !pObj.GetAlive()) {
    return false;
  }
  if ($.Object_(_this) != null && $.ValidPlr($.Object_(_this).Controller) !== 0) {
    pObj.UpdatLastEnergyLossCause($.Object_(_this).Controller);
  }
  pObj.AssignDeath(!!fForced);
  return true;
}

function FnFling(Obj, iXDir, iYDir, iPrec, fAddSpeed) {
  if (iPrec === 0) {
    iPrec = 1;
  }
  Obj.Fling($.itofix$i32$i32(iXDir | 0, iPrec | 0), $.itofix$i32$i32(iYDir | 0, iPrec | 0), fAddSpeed);
  Obj.Action.t_attach = 0;
}

function FnJump(Obj) {
  return !!$.ObjectComJump(Obj);
}

function FnEnter(Obj, pTarget) {
  return !!Obj.Enter(pTarget, true, true, null);
}

function FnExit(Obj, tx, ty, tr, txdir, tydir, trdir) {
  tx = tx + Obj.GetX();
  ty = ty + Obj.GetY();
  $.ObjectComCancelAttach(Obj);
  return !!Obj.Exit(tx | 0, ty + Obj.Shape.y | 0, tr | 0, $.itofix$i32(txdir | 0), $.itofix$i32(tydir | 0), $.itofix$i32(trdir | 0).op_div$i32(10));
}

function FnCollect(Obj, pItem, ignoreOCF) {
  if (pItem == null) {
    return false;
  }
  if ((Obj.OCF & 16384) >>> 0 !== 0 || ignoreOCF) {
    return !!Obj.Collect(pItem);
  }
  return false;
}

function FnRemoveObject(Obj, fEjectContents) {
  Obj.AssignRemoval(fEjectContents);
}

function FnSetPosition(Obj, iX, iY, fCheckBounds, iPrec) {
  if (iPrec === 0) {
    iPrec = 1;
  }
  let i_x = $.itofix$i32$i32(iX | 0, iPrec | 0);
  let i_y = $.itofix$i32$i32(iY | 0, iPrec | 0);
  if (fCheckBounds) {
    Obj.BoundsCheck(i_x, i_y);
  }
  Obj.ForcePosition(i_x.$clone(), i_y.$clone());
  Obj.UpdateInLiquid();
}

function FnDoCon(Obj, iChange, iPrec, bGrowFromCenter) {
  if (iPrec === 0) {
    iPrec = 100;
  }
  Obj.DoCon(Math.trunc(100000 * iChange / iPrec) | 0, bGrowFromCenter);
}

function FnGetCon(Obj, iPrec) {
  if (iPrec === 0) {
    iPrec = 100;
  }
  return Math.trunc(iPrec * Obj.GetCon() / 100000);
}

function FnSetName(_this, pNewName, fSetInInfo, fMakeValidIfExists) {
  if (!($.Object_(_this) != null)) {
    if (_this == null) {
      $throw(new $.NeedNonGlobalContext().init(S("SetName")));
    } else if (fSetInInfo) {
      return false;
    }
    _this.SetName($.FnStringPar(pNewName));
    return true;
  } else {
    if (fSetInInfo) {
      let pInfo = $.Object_(_this).Info;
      if (pInfo == null) {
        return false;
      }
      let szName = pNewName.GetCStr();
      if (szName == null || szName.a[szName.o] === 0) {
        return false;
      }
      if (c$strlen(szName) > 30) {
        return false;
      }
      if ($.SEqual(szName, P(pInfo.Name, 0))) {
        return true;
      }
      let pInfoList = null;
      let pOwner = $.Players.Get($.Object_(_this).Owner);
      if (pOwner != null) {
        pInfoList = pOwner.CrewInfoList;
      }
      const NameBuf = new Int8Array(31);
      if (pInfoList != null && pInfoList.NameExists(szName)) {
        if (!fMakeValidIfExists) {
          return false;
        }
        $.SCopy$pi8$pi8$u64(szName, P(NameBuf, 0), 30);
        pInfoList.MakeValidName(P(NameBuf, 0));
        szName = P(NameBuf, 0);
      }
      $.SCopy$pi8$pi8$u64(szName, P(pInfo.Name, 0), 30);
      $.Object_(_this).SetName();
      $.Object_(_this).Call$pi8$pC4AulParSet$b(S("~OnNameChanged"), new $.C4AulParSet().init$mb(true).op_and());
    } else {
      if (pNewName == null) {
        $.Object_(_this).SetName();
      } else {
        $.Object_(_this).SetName(pNewName.GetCStr());
      }
      $.Object_(_this).Call$pi8$pC4AulParSet$b(S("~OnNameChanged"), new $.C4AulParSet().init$mb(false).op_and());
    }
  }
  return true;
}

function FnSetCrewExtraData(Obj, DataName, Data) {
  let strDataName = $.FnStringPar(DataName);
  if (Obj.Info == null) {
    return new $.C4Value().init$v();
  }
  if (Data.GetType() !== 0 && Data.GetType() !== 1 && Data.GetType() !== 2 && Data.GetType() !== 4) {
    return new $.C4Value().$copy($.C4VNull);
  }
  let pInfo = Obj.Info;
  if (pInfo.ExtraData.pNames == null) {
    pInfo.ExtraData.CreateTempNameList();
  }
  let ival = 0;
  if ((ival = pInfo.ExtraData.pNames.GetItemNr(strDataName)) !== -1) {
    pInfo.ExtraData.op_index$i32(ival | 0).$assign(Data);
  } else {
    pInfo.ExtraData.pNames.AddName(strDataName);
    if ((ival = pInfo.ExtraData.pNames.GetItemNr(strDataName)) === -1) {
      return new $.C4Value().init$v();
    }
    pInfo.ExtraData.op_index$i32(ival | 0).$assign(Data);
  }
  return new $.C4Value().$copy(Data);
}

function FnGetCrewExtraData(Obj, DataName) {
  let strDataName = $.FnStringPar(DataName);
  if (Obj.Info == null) {
    return new $.C4Value().init$v();
  }
  let pInfo = Obj.Info;
  if (pInfo.ExtraData.pNames == null) {
    return new $.C4Value().init$v();
  }
  let ival = pInfo.ExtraData.pNames.GetItemNr(strDataName);
  if (ival === -1) {
    return new $.C4Value().init$v();
  }
  return new $.C4Value().$copy(pInfo.ExtraData.op_index$i32(ival | 0));
}

function FnDoEnergy(Obj, iChange, fExact, iEngType, iCausedBy) {
  if (iEngType.IsNil()) {
    iEngType.op_assign$i64(32);
  }
  if (iCausedBy.IsNil()) {
    iCausedBy.op_assign$i64(-1);
  }
  Obj.DoEnergy(iChange | 0, fExact, iEngType.op_long() | 0, iCausedBy.op_long() | 0);
}

function FnDoBreath(Obj, iChange) {
  Obj.DoBreath(iChange | 0);
}

function FnDoDamage(Obj, iChange, iDmgType, iCausedBy) {
  if (iDmgType.IsNil()) {
    iDmgType.op_assign$i64(0);
  }
  if (iCausedBy.IsNil()) {
    iCausedBy.op_assign$i64(-1);
  }
  Obj.DoDamage$i32$i32$i32(iChange | 0, iCausedBy.op_long() | 0, iDmgType.op_long() | 0);
}

function FnSetEntrance(Obj, e_status) {
  Obj.EntranceStatus = e_status;
}

function FnSetXDir(Obj, nxdir, iPrec) {
  if (iPrec === 0) {
    iPrec = 10;
  }
  Obj.xdir.$assign($.itofix$i32$i32(nxdir | 0, iPrec | 0));
  Obj.Mobile = true;
}

function FnSetRDir(Obj, nrdir, iPrec) {
  if (iPrec === 0) {
    iPrec = 10;
  }
  Obj.rdir.$assign($.itofix$i32$i32(nrdir | 0, iPrec | 0));
  Obj.Mobile = true;
}

function FnSetYDir(Obj, nydir, iPrec) {
  if (iPrec === 0) {
    iPrec = 10;
  }
  Obj.ydir.$assign($.itofix$i32$i32(nydir | 0, iPrec | 0));
  Obj.Mobile = true;
}

function FnSetR(Obj, nr) {
  Obj.SetRotation(nr | 0);
}

function FnSetAction(Obj, szAction, pTarget, pTarget2, fDirect) {
  if (szAction == null) {
    return false;
  }
  return !!Obj.SetActionByName$pi8$pC4Object$pC4Object$i32$b($.FnStringPar(szAction), pTarget, pTarget2, 5, !!fDirect);
}

function FnSetActionData(Obj, iData) {
  if (Obj.Status === 0) {
    return false;
  }
  let pActionDef = Obj.GetAction();
  if (pActionDef != null && pActionDef.GetPropertyP(23 /*P_Procedure*/) === 246) {
    if ($and64n(iData, 255) >= 30 || $shr64n(iData, 8) >= 30) {
      return false;
    }
  }
  Obj.Action.Data = iData | 0;
  return true;
}

function FnSetComDir(Obj, ncomdir) {
  Obj.Action.ComDir = ncomdir | 0;
}

function FnSetDir(Obj, ndir) {
  Obj.SetDir(ndir | 0);
}

function FnSetCategory(Obj, iCategory) {
  Obj.SetCategory(iCategory | 0);
}

function FnSetAlive(Obj, nalv) {
  Obj.SetAlive(nalv);
}

function FnSetOwner(Obj, iOwner) {
  return !!Obj.SetOwner(iOwner | 0);
}

function FnSetPhase(Obj, iVal) {
  return !!Obj.SetPhase(iVal | 0);
}

function FnExecuteCommand(Obj) {
  return !!Obj.ExecuteCommand();
}

function FnSetCommand(Obj, szCommand, pTarget, Tx, iTy, pTarget2, Data, iRetries) {
  if (szCommand == null) {
    return false;
  }
  let iCommand = $.CommandByName($.FnStringPar(szCommand));
  if (iCommand === 0) {
    Obj.ClearCommands();
    return false;
  }
  let szText = null;
  if (iCommand === 23) {
    szText = Data.getStr();
  }
  Obj.SetCommand$i32$pC4Object$C4Value$i32$pC4Object$b$C4Value$i32$pC4String(iCommand | 0, pTarget, new $.C4Value().$copy(Tx), iTy, pTarget2, false, new $.C4Value().$copy(Data), iRetries, szText);
  return true;
}

function FnAddCommand(Obj, szCommand, pTarget, Tx, iTy, pTarget2, iUpdateInterval, Data, iRetries, iBaseMode) {
  if (szCommand == null) {
    return false;
  }
  let iCommand = $.CommandByName($.FnStringPar(szCommand));
  if (iCommand === 0) {
    return false;
  }
  let szText = null;
  if (iCommand === 23) {
    szText = Data.getStr();
  }
  return Obj.AddCommand$i32$pC4Object$C4Value$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(iCommand | 0, pTarget, new $.C4Value().$copy(Tx), iTy, iUpdateInterval, pTarget2, true, new $.C4Value().$copy(Data), false, iRetries, szText, iBaseMode);
}

function FnAppendCommand(Obj, szCommand, pTarget, Tx, iTy, pTarget2, iUpdateInterval, Data, iRetries, iBaseMode) {
  if (szCommand == null) {
    return false;
  }
  let iCommand = $.CommandByName($.FnStringPar(szCommand));
  if (iCommand === 0) {
    return false;
  }
  let szText = null;
  if (iCommand === 23) {
    szText = Data.getStr();
  }
  return Obj.AddCommand$i32$pC4Object$C4Value$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(iCommand | 0, pTarget, new $.C4Value().$copy(Tx), iTy, iUpdateInterval, pTarget2, true, new $.C4Value().$copy(Data), true, iRetries, szText, iBaseMode);
}

function FnGetCommand(Obj, iElement, iCommandNum) {
  let $t1;
  let Command = Obj.Command;
  while (Command != null && ($t1 = iCommandNum, iCommandNum = iCommandNum - 1 | 0, $t1) !== 0) {
    Command = Command.Next;
  }
  if (Command == null) {
    return new $.C4Value().$copy($.C4VNull);
  }
  switch (iElement) {
    case 0:
      return $.C4VString$pi8($.CommandName(Command.Command));
    case 1:
      return $.C4VObj(Command.Target.op_C4Object_());
    case 2:
      return new $.C4Value().$copy(Command.Tx);
    case 3:
      return $.C4VInt(Command.Ty);
    case 4:
      return $.C4VObj(Command.Target2.op_C4Object_());
    case 5:
      return Command.Command === 23 ? $.C4VString$pC4String(Command.Text) : new $.C4Value().$copy(Command.Data);
  }
  return new $.C4Value().$copy($.C4VNull);
}

function FnFinishCommand(Obj, fSuccess, iCommandNum) {
  let $t1;
  let Command = Obj.Command;
  while (Command != null && ($t1 = iCommandNum, iCommandNum = iCommandNum - 1, $t1) !== 0) {
    Command = Command.Next;
  }
  if (Command == null) {
    return false;
  }
  if (!fSuccess) {
    Command.Failures = Command.Failures + 1 | 0;
  } else {
    Command.Finished = 1;
  }
  return true;
}

function FnGetAction(Obj) {
  let pActionDef = Obj.GetAction();
  if (pActionDef == null) {
    return $.String_(S("Idle"));
  }
  return $.String_(pActionDef.GetName());
}

function FnGetActionTarget(Obj, target_index) {
  if (target_index === 0) {
    return Obj.Action.Target.op_C4Object_();
  }
  if (target_index === 1) {
    return Obj.Action.Target2.op_C4Object_();
  }
  return null;
}

function FnSetActionTargets(Obj, pTarget1, pTarget2) {
  Obj.Action.Target.op_assign(pTarget1);
  Obj.Action.Target2.op_assign(pTarget2);
}

function FnGetDir(Obj) {
  return Obj.Action.Dir;
}

function FnGetEntrance(Obj) {
  return Obj.EntranceStatus;
}

function FnGetPhase(Obj) {
  return Obj.Action.Phase;
}

function FnGetEnergy(Obj, fExact) {
  if (fExact) {
    return Obj.Energy;
  } else {
    return Math.imul(100, Obj.Energy) / 100000 | 0;
  }
}

function FnGetBreath(Obj) {
  return Obj.Breath;
}

function FnGetMass(_this) {
  if (!($.Object_(_this) != null)) {
    if (_this == null || !(_this.GetDef$v() != null)) {
      $throw(new $.NeedNonGlobalContext().init(S("GetMass")));
    } else {
      return _this.GetDef$v().Mass;
    }
  } else {
    return $.Object_(_this).Mass;
  }
}

function FnGetRDir(Obj, iPrec) {
  if (iPrec === 0) {
    iPrec = 10;
  }
  return $.fixtoi$C4Fixed$i32(Obj.rdir, iPrec | 0);
}

function FnGetXDir(Obj, iPrec) {
  if (iPrec === 0) {
    iPrec = 10;
  }
  return $.fixtoi$C4Fixed$i32(Obj.xdir, iPrec | 0);
}

function FnGetYDir(Obj, iPrec) {
  if (iPrec === 0) {
    iPrec = 10;
  }
  return $.fixtoi$C4Fixed$i32(Obj.ydir, iPrec | 0);
}

function FnGetR(Obj) {
  let iR = Obj.GetR();
  while (iR > 180) {
    iR = iR - 360;
  }
  while (iR < -180) {
    iR = iR + 360;
  }
  return iR;
}

function FnGetComDir(Obj) {
  return Obj.Action.ComDir;
}

function FnGetVertexNum(Obj) {
  return Obj.Shape.VtxNum;
}

function FnGetVertex(Obj, iIndex, iValueToGet) {
  if (Obj.Shape.VtxNum < 1) {
    return new $.Nillable$i64().init$C4Void(new $.C4Void());
  }
  if (iIndex < 0 || iIndex >= Obj.Shape.VtxNum) {
    return new $.Nillable$i64().init$C4Void(new $.C4Void());
  }
  iIndex = $min(iIndex, Obj.Shape.VtxNum - 1 | 0);
  switch (iValueToGet | 0) {
    case 0:
      return new $.Nillable$i64().init$i64(Obj.Shape.VtxX[iIndex]);
    case 1:
      return new $.Nillable$i64().init$i64(Obj.Shape.VtxY[iIndex]);
    case 2:
      return new $.Nillable$i64().init$i64(Obj.Shape.VtxCNAT[iIndex]);
    case 3:
      return new $.Nillable$i64().init$i64(Obj.Shape.VtxFriction[iIndex]);
    default:
      $.DebugLog($.FormatString(S("GetVertex: Unknown vertex attribute: %ld"), iValueToGet).getData());
      return new $.Nillable$i64().init$C4Void(new $.C4Void());
  }
  0;
  return new $.Nillable$i64().init$C4Void(new $.C4Void());
}

function FnSetVertex(Obj, iIndex, iValueToSet, iValue, iOwnVertexMode) {
  if (iOwnVertexMode !== 0) {
    if (!Obj.fOwnVertices) {
      Obj.Shape.CreateOwnOriginalCopy(Obj.Def.Shape);
      Obj.fOwnVertices = true;
    }
    iIndex = iIndex + 15;
  }
  if (!$.Inside$i64$i32$i32(iIndex, 0, 29)) {
    return false;
  }
  switch (iValueToSet | 0) {
    case 0:
      Obj.Shape.VtxX[iIndex] = iValue | 0;
      break;
    case 1:
      Obj.Shape.VtxY[iIndex] = iValue | 0;
      break;
    case 2:
      Obj.Shape.VtxCNAT[iIndex] = iValue | 0;
      break;
    case 3:
      Obj.Shape.VtxFriction[iIndex] = iValue | 0;
      break;
    default:
      $.DebugLogF(S("SetVertex: Unknown vertex attribute: %ld"), iValueToSet);
      return false;
  }
  if (iOwnVertexMode === 2) {
    Obj.UpdateShape(true);
  }
  return true;
}

function FnAddVertex(Obj, iX, iY) {
  return !!Obj.Shape.AddVertex(iX | 0, iY | 0);
}

function FnInsertVertex(Obj, iIndex, iX, iY) {
  return !!Obj.Shape.InsertVertex(iIndex | 0, iX | 0, iY | 0);
}

function FnRemoveVertex(Obj, iIndex) {
  return !!Obj.Shape.RemoveVertex(iIndex | 0);
}

function FnSetContactDensity(Obj, iDensity) {
  Obj.Shape.ContactDensity = iDensity | 0;
}

function FnGetAlive(Obj) {
  return Obj.GetAlive();
}

function FnGetOwner(Obj) {
  return Obj.Owner;
}

function FnGetController(Obj) {
  return Obj.Controller;
}

function FnSetController(Obj, iNewController) {
  if (iNewController !== -1 && !($.ValidPlr(iNewController | 0) !== 0)) {
    return false;
  }
  Obj.Controller = iNewController | 0;
  return true;
}

function FnGetKiller(Obj) {
  return Obj.LastEnergyLossCausePlayer;
}

function FnSetKiller(Obj, iNewKiller) {
  if (iNewKiller !== -1 && !($.ValidPlr(iNewKiller | 0) !== 0)) {
    return false;
  }
  Obj.LastEnergyLossCausePlayer = iNewKiller | 0;
  return true;
}

function FnGetCategory(_this) {
  if (!($.Object_(_this) != null)) {
    if (_this == null || !(_this.GetDef$v() != null)) {
      $throw(new $.NeedNonGlobalContext().init(S("GetCategory")));
    } else {
      return _this.GetDef$v().Category;
    }
  } else {
    return $.Object_(_this).Category;
  }
}

function FnGetOCF(Obj) {
  return Obj.OCF;
}

function FnGetDamage(Obj) {
  return Obj.Damage;
}

function FnGetValue(_this, pInBase, iForPlayer) {
  if (!($.Object_(_this) != null)) {
    if (_this == null || !(_this.GetDef$v() != null)) {
      $throw(new $.NeedNonGlobalContext().init(S("GetValue")));
    } else {
      return _this.GetDef$v().GetValue(pInBase, iForPlayer | 0);
    }
  } else {
    return $.Object_(_this).GetValue(pInBase, iForPlayer | 0);
  }
}

function FnGetRank(Obj) {
  if (Obj.Info == null) {
    return 0;
  }
  return Obj.Info.Rank;
}

function FnGetActTime(Obj) {
  return Obj.Action.Time;
}

function FnGetID(Obj) {
  return Obj.GetPrototype();
}

function FnGetMenu(Obj) {
  if (Obj.Menu != null && Obj.Menu.IsActive$v()) {
    return new $.Nillable$pC4Def().init$rpC4Def($.C4Id2Def(new $.C4ID().init$u64($u64n(Obj.Menu.GetIdentification()))));
  }
  return new $.Nillable$pC4Def().init$C4Void(new $.C4Void());
}

function FnCreateMenu(Obj, pDef, pCommandObj, iExtra, szCaption, iExtraData, iStyle, fPermanent, idMenuID) {
  if (pCommandObj != null && pCommandObj.Status === 0) {
    return false;
  }
  let fctSymbol = new $.C4FacetSurface().init();
  fctSymbol.Create(35, 35);
  if (pDef != null) {
    pDef.Draw$rC4Facet$b$u32$pC4Object$i32$i32$pC4DrawTransform$pi8(fctSymbol);
  }
  if (!Obj.CloseMenu(false)) {
    return false;
  }
  if (Obj.Menu == null) {
    Obj.Menu = new $.C4ObjectMenu().init();
  } else {
    Obj.Menu.ClearItems();
  }
  Obj.Menu.Init$rC4FacetSurface$pi8$pC4Object$i32$i32$i32$i32$b(fctSymbol, $.FnStringPar(szCaption), pCommandObj, iExtra | 0, iExtraData | 0, (idMenuID.op_unsigned_long_C4ID_() != null ? idMenuID : pDef != null ? pDef.id : $.C4ID.None).GetHandle() | 0, iStyle | 0, true);
  Obj.Menu.SetPermanent(fPermanent);
  return true;
}












function FnAddMenuItem(Obj, szCaption, szCommand, pDef, iCount, Parameter, szInfoCaption, iExtra, XPar, XPar2) {
  if (Obj.Menu == null) {
    return false;
  }
  const caption = new Int8Array(257);
  const parameter = new Int8Array(257);
  const dummy = new Int8Array(257);
  const command = new Int8Array(513);
  const command2 = new Int8Array(513);
  const infocaption = new Int8Array(513);
  let iSymbolSize = Obj.Menu.GetSymbolSize();
  if (szCaption != null) {
    let s = $.FnStringPar(szCaption);
    let sep = c$strstr(s, S("%s"));
    if (sep != null && pDef != null) {
      c$strncpy(P(caption, 0), s, $u64n($min(sep.o - s.o, 256)));
      caption[$min(sep.o - s.o, 256)] = 0;
      c$strncat(P(caption, 0), pDef.GetName(), 256);
      c$strncat(P(caption, 0), $padd(sep, 2), 256);
    } else {
      c$strncpy(P(caption, 0), s, 256);
      caption[256] = 0;
    }
  } else {
    caption[0] = 0;
  }
  switch (Parameter.GetType()) {
    case 1:
      $.ssprintf$8(parameter, S("%d"), Parameter.getInt());
      break;
    case 2:
      $.SCopy$pi8$pi8(Parameter.getBool() ? S("true") : S("false"), P(parameter, 0));
      break;
    case 3:
      if (Parameter.getPropList().GetObject$v() != null) {
        $.ssprintf$8(parameter, S("Object(%d)"), Parameter.getPropList().GetObject$v().Number);
      } else if (Parameter.getPropList().GetDef$v() != null) {
        $.ssprintf$8(parameter, S("C4Id(\"%s\")"), Parameter.getPropList().GetDef$v().id.ToString());
      } else {
        $throw(new $.C4AulExecError().init(S("proplist as parameter to AddMenuItem")));
      }
      break;
    case 4:
      parameter[0] = 34;
      $.SCopy$pi8$pi8$u64(Parameter.getStr().GetCStr(), $padd(P(parameter, 0), 1), 510);
      $.SAppendChar(34, P(command, 0));
      break;
    case 0:
      $.SCopy$pi8$pi8(S("nil"), P(parameter, 0));
      break;
    case 5:
      $throw(new $.C4AulExecError().init(S("array as parameter to AddMenuItem")));
    default:
      return false;
  }
  let fOwnValue = false;
  let iValue = 0;
  if ((iExtra & 128) !== 0) {
    fOwnValue = true;
    iValue = XPar2.getInt();
  }
  let i = 0;
  for (; i < $.SLen($.FnStringPar(szCommand)); i = i + 1) {
    if (!$.IsIdentifier($rd($.FnStringPar(szCommand), i))) {
      break;
    }
  }
  if (i < $.SLen($.FnStringPar(szCommand))) {
    $.SCopy$pi8$pi8$u64($.FnStringPar(szCommand), P(dummy, 0), 256);
    let pFound = $.SSearch(P(dummy, 0), S("%d"));
    if (pFound != null) {
      $wr($padd(pFound, -1), 0, 115);
    }
    $.ssprintf$15(command, P(dummy, 0), P(parameter, 0), 0);
    $.ssprintf$15(command2, P(dummy, 0), P(parameter, 0), 1);
  } else {
    let szScriptCom = $.FnStringPar(szCommand);
    if (szScriptCom != null && szScriptCom.a[szScriptCom.o] !== 0) {
      if ((iExtra & 128) !== 0) {
        $.ssprintf$15(command, S("%s(%s,%s,0,%ld)"), szScriptCom, pDef != null ? pDef.id.ToString() : S("nil"), P(parameter, 0), iValue);
        $.ssprintf$15(command2, S("%s(%s,%s,1,%ld)"), szScriptCom, pDef != null ? pDef.id.ToString() : S("nil"), P(parameter, 0), iValue);
      } else {
        $.ssprintf$15(command, S("%s(%s,%s)"), szScriptCom, pDef != null ? pDef.id.ToString() : S("nil"), P(parameter, 0));
        $.ssprintf$15(command2, S("%s(%s,%s,1)"), szScriptCom, pDef != null ? pDef.id.ToString() : S("nil"), P(parameter, 0));
      }
    } else {
      $wr(P(command, 0), 0, $wr(P(command2, 0), 0, 0));
    }
  }
  $.SCopy$pi8$pi8$u64($.FnStringPar(szInfoCaption), P(infocaption, 0), 512);
  let fctSymbol = new $.C4FacetSurface().init();
  let pGfx = null;
  let pGfxObj = null;
  switch (iExtra & 127) {
    case 1:
      {
        let pfctRankSym = $.GraphicsResource.fctRank;
        let iRankSymNum = $.GraphicsResource.iNumRanks;
        if (pDef != null && pDef.pRankSymbols != null) {
          pfctRankSym = pDef.pRankSymbols;
          iRankSymNum = pDef.iNumRankSymbols;
        }
        $.C4RankSystem.DrawRankSymbol(fctSymbol, iCount, pfctRankSym, iRankSymNum, true);
        iCount = 0;
        break;
      }
    case 2:
      fctSymbol.Create(iSymbolSize, iSymbolSize);
      if (pDef != null) {
        pDef.Draw$rC4Facet$b$u32$pC4Object$i32$i32$pC4DrawTransform$pi8(fctSymbol, false, 0, null, XPar.getInt());
      }
      break;
    case 3:
      {
        if (!XPar.CheckConversion(11 /*C4V_Object*/)) {
          return false;
        }
        let pGfxObj$2 = XPar.getObj();
        if (pGfxObj$2 != null && pGfxObj$2.Status !== 0) {
          let pRankRes = $.GraphicsResource.fctRank;
          let iRankCnt = $.GraphicsResource.iNumRanks;
          let pDef$2 = pGfxObj$2.Def;
          if (pDef$2.pRankSymbols != null) {
            pRankRes = pDef$2.pRankSymbols;
            iRankCnt = pDef$2.iNumRankSymbols;
          }
          let fctRank = new $.C4Facet().init$v();
          if (Obj.Menu.IsContextMenu()) {
            let C4MN_SymbolSize = Obj.Menu.GetItemHeight();
            fctSymbol.Create(C4MN_SymbolSize * 2 | 0, C4MN_SymbolSize | 0);
            fctSymbol.Wdt = Math.fround(C4MN_SymbolSize);
            pGfxObj$2.Def.Draw$rC4Facet$b$u32$pC4Object$i32$i32$pC4DrawTransform$pi8(fctSymbol, false, pGfxObj$2.Color, pGfxObj$2);
            fctRank.$assign(fctSymbol);
            fctRank.X = Math.fround(C4MN_SymbolSize);
            fctSymbol.Wdt = Math.fround(fctSymbol.Wdt * Math.fround(2));
          } else {
            fctSymbol.Create(iSymbolSize, iSymbolSize);
            pGfxObj$2.Def.Draw$rC4Facet$b$u32$pC4Object$i32$i32$pC4DrawTransform$pi8(fctSymbol, false, pGfxObj$2.Color, pGfxObj$2);
            fctRank.$assign(fctSymbol);
            fctRank.X = Math.fround(fctRank.Wdt - pRankRes.Wdt);
            fctRank.Wdt = pRankRes.Wdt;
            fctRank.Hgt = pRankRes.Hgt;
          }
          if (pGfxObj$2.Info != null) {
            let fctBackup = fctSymbol.$clone();
            fctSymbol.Set$C4Facet(fctRank);
            $.C4RankSystem.DrawRankSymbol(fctSymbol, pGfxObj$2.Info.Rank, pRankRes, iRankCnt | 0, true);
            fctSymbol.Set$C4Facet(fctBackup);
          }
        }
      }
      break;
    case 4:
      {
        if (!XPar.CheckConversion(11 /*C4V_Object*/)) {
          $throw(new $.C4AulExecError().init($.FormatString(S("call to \"%s\" parameter %d: got \"%s\", but expected \"%s\"!"), S("AddMenuItem"), 8, XPar.GetTypeName(), $.GetC4VName(11 /*C4V_Object*/)).getData()));
        }
        pGfxObj = XPar.getObj();
      }
      break;
    case 5:
      {
        let pDef$2 = $.C4Id2Def(new $.C4ID().init$string(StdString.of(P(caption, 0))));
        if (pDef$2 != null) {
          pGfx = pDef$2.Graphics;
        } else {
          fctSymbol.Create(iSymbolSize, iSymbolSize);
          let dwClr = XPar.getInt() >>> 0;
          if (szCaption == null || !$.Game.DrawTextSpecImage(fctSymbol, P(caption, 0), null, dwClr !== 0 ? dwClr : 255)) {
            return false;
          }
        }
        $wr(P(caption, 0), 0, 0);
      }
      break;
    case 7:
      {
        let gfx_proplist = XPar.getPropList();
        fctSymbol.Create(iSymbolSize, iSymbolSize);
        if (!$.Game.DrawPropListSpecImage(fctSymbol, gfx_proplist)) {
          return false;
        }
      }
      break;
    case 6:
      fctSymbol.Create(iSymbolSize, iSymbolSize);
      if (pDef != null) {
        pDef.Draw$rC4Facet$b$u32$pC4Object$i32$i32$pC4DrawTransform$pi8(fctSymbol, false, XPar.getInt() >>> 0);
      }
      break;
    default:
      if (pDef != null) {
        fctSymbol.Create(iSymbolSize, iSymbolSize);
        pDef.Draw$rC4Facet$b$u32$pC4Object$i32$i32$pC4DrawTransform$pi8(fctSymbol);
      } else {
      }
      break;
  }
  if (iCount === 0 && !((iExtra & 256) !== 0)) {
    iCount = 0xbc614e;
  }
  let fIsSelectable = !!($rd(P(command, 0)) !== 0);
  if (pGfxObj != null) {
    Obj.Menu.Add$pi8$pC4Object$pi8$i32$pC4Object$pi8$C4ID$pi8$b$i32$b(P(caption, 0), pGfxObj, P(command, 0), iCount, null, P(infocaption, 0), (pDef != null ? pDef.id : $.C4ID.None).$clone(), P(command2, 0), fOwnValue, iValue | 0, fIsSelectable);
  } else if (pGfx != null) {
    Obj.Menu.Add$pi8$pC4DefGraphics$pi8$i32$pC4Object$pi8$C4ID$pi8$b$i32$b(P(caption, 0), pGfx, P(command, 0), iCount, null, P(infocaption, 0), (pDef != null ? pDef.id : $.C4ID.None).$clone(), P(command2, 0), fOwnValue, iValue | 0, fIsSelectable);
  } else {
    Obj.Menu.Add$pi8$rC4FacetSurface$pi8$i32$pC4Object$pi8$C4ID$pi8$b$i32$b(P(caption, 0), fctSymbol, P(command, 0), iCount, null, P(infocaption, 0), (pDef != null ? pDef.id : $.C4ID.None).$clone(), P(command2, 0), fOwnValue, iValue | 0, fIsSelectable);
  }
  return true;
}

function FnSelectMenuItem(Obj, iItem) {
  if (Obj.Menu == null) {
    return false;
  }
  return !!Obj.Menu.SetSelection(iItem | 0, false, true);
}

function FnSetMenuDecoration(Obj, idNewDeco) {
  if (Obj.Menu == null) {
    return false;
  }
  let pNewDeco = new $.FrameDecoration().init();
  if (!pNewDeco.SetByDef$C4ID(idNewDeco.$clone())) {
    $delete(pNewDeco);
    return false;
  }
  Obj.Menu.SetFrameDeco(pNewDeco);
  return true;
}

function FnSetMenuTextProgress(Obj, iNewProgress) {
  if (Obj.Menu == null) {
    return false;
  }
  return Obj.Menu.SetTextProgress(iNewProgress | 0, false);
}

function FnContained(Obj) {
  return Obj.Contained.op_C4Object_();
}

function FnContents(Obj, index) {
  let $t1;
  let cobj = null;
  while ((cobj = Obj.Contents.GetObject(($t1 = index, index = index + 1, $t1) | 0)) != null) {
    if (cobj.GetProcedure() !== 246) {
      return cobj;
    }
  }
  return null;
}

function FnShiftContents(Obj, fShiftBack, idTarget, fDoCalls) {
  if (idTarget == null) {
    return !!Obj.ShiftContents(fShiftBack, fDoCalls);
  }
  let pNewFront = Obj.Contents.Find(idTarget);
  if (pNewFront == null) {
    return false;
  }
  Obj.DirectComContents(pNewFront, fDoCalls);
  return true;
}

function FnScrollContents(Obj) {
  let pMove = Obj.Contents.GetObject();
  if (pMove != null) {
    Obj.Contents.Remove(pMove);
    Obj.Contents.Add$pC4Object$i32$pC4ObjectList(pMove, 0 /*stNone*/);
  }
  return Obj.Contents.GetObject();
}

function FnContentsCount(Obj, id) {
  return Obj.Contents.ObjectCount(id.$clone());
}

function FnFindContents(Obj, c_id) {
  return Obj.Contents.Find(c_id);
}

function FnFindOtherContents(Obj, c_id) {
  return Obj.Contents.FindOther(c_id.$clone());
}

function FnActIdle(Obj) {
  return !(Obj.GetAction() != null);
}

function FnStuck(Obj, off_x, off_y) {
  return !!Obj.Shape.CheckContact(Obj.GetX() + off_x | 0, Obj.GetY() + off_y | 0);
}

function FnInLiquid(Obj) {
  return Obj.InLiquid;
}

function FnOnFire(Obj) {
  if (Obj.GetOnFire()) {
    return true;
  }
  if (Obj.pEffects == null) {
    return false;
  }
  return !!(Obj.pEffects.Get(S("*Fire*")) != null);
}

function FnCreateContents(Obj, PropList, iCount) {
  if (iCount.IsNil()) {
    iCount.op_assign$i64(1);
  }
  let pNewObj = null;
  while (iCount.op_dec$i32(0) > 0) {
    pNewObj = Obj.CreateContents(PropList);
  }
  return pNewObj;
}

function FnMakeCrewMember(Obj, iPlayer) {
  if (!($.ValidPlr(iPlayer | 0) !== 0)) {
    return false;
  }
  return !!$.Players.Get(iPlayer | 0).MakeCrewMember(Obj);
}

function FnGrabObjectInfo(Obj, pFrom) {
  if (pFrom == null) {
    return false;
  }
  return !!Obj.GrabInfo(pFrom);
}

function FnSetCrewStatus(Obj, iPlr, fInCrew) {
  let pPlr = $.Players.Get(iPlr | 0);
  if (pPlr == null) {
    return false;
  }
  return !!pPlr.SetObjectCrewStatus(Obj, fInCrew);
}

function FnSetTransferZone(Obj, iX, iY, iWdt, iHgt) {
  iX = iX + Obj.GetX();
  iY = iY + Obj.GetY();
  return $.Game.TransferZones.Set(iX | 0, iY | 0, iWdt | 0, iHgt | 0, Obj) ? 1 : 0;
}

function FnObjectDistance(_this, pObj2, pObj) {
  if (pObj == null) {
    pObj = $.Object_(_this);
  }
  if (pObj == null || pObj2 == null) {
    return 0;
  }
  return $.Distance(pObj.GetX(), pObj.GetY(), pObj2.GetX(), pObj2.GetY());
}

function FnObjectNumber(Obj) {
  return Obj.Number;
}

function FnShowInfo(Obj, pObj) {
  if (pObj == null) {
    pObj = Obj;
  }
  if (pObj == null) {
    return 0;
  }
  return Obj.ActivateMenu(15, 0, 0, 0, pObj) ? 1 : 0;
}

function FnSetMass(Obj, iValue) {
  Obj.OwnMass = iValue - Obj.Def.Mass | 0;
  Obj.UpdateMass();
}

function FnGetColor(Obj) {
  return Obj.Color;
}

function FnSetColor(Obj, iValue) {
  Obj.Color = iValue >>> 0;
  Obj.UpdateGraphics(false);
  Obj.UpdateFace(false);
}

function FnSetLightRange(Obj, iRange, iFadeoutRange) {
  if (iFadeoutRange.IsNil()) {
    if (iRange === 0) {
      iFadeoutRange.op_assign$i64(0);
    } else {
      iFadeoutRange.op_assign$i64(80);
    }
  }
  Obj.SetLightRange(iRange | 0, iFadeoutRange.op_long() | 0);
}

function FnGetLightColor(Obj) {
  return Obj.GetLightColor();
}

function FnSetLightColor(Obj, iValue) {
  Obj.SetLightColor(iValue >>> 0);
}

function FnSetPicture(Obj, iX, iY, iWdt, iHgt) {
  Obj.PictureRect.Set$i32$i32$i32$i32(iX | 0, iY | 0, iWdt | 0, iHgt | 0);
}

function FnGetProcedure(Obj) {
  let pActionDef = Obj.GetAction();
  if (pActionDef == null) {
    return null;
  }
  return pActionDef.GetPropertyStr(23 /*P_Procedure*/);
}

function FnCheckVisibility(Obj, plr) {
  return Obj.IsVisible(plr, false);
}

function FnSetClrModulation(Obj, dwClr, iOverlayID) {
  let clr = 0xffffffff;
  if (!dwClr.IsNil()) {
    clr = dwClr.op_long() >>> 0;
  }
  if (iOverlayID !== 0) {
    let pOverlay = Obj.GetGraphicsOverlay$i32$b(iOverlayID | 0, false);
    if (pOverlay == null) {
      $.DebugLogF(S("SetClrModulation: Overlay %d not defined for object %d (%s)"), iOverlayID | 0, Obj.Number, Obj.GetName());
      return false;
    }
    pOverlay.SetClrModulation(clr);
  } else {
    Obj.ColorMod = clr;
    if (Obj.pMeshInstance != null) {
      Obj.pMeshInstance.SetFaceOrderingForClrModulation(clr);
    }
  }
  return true;
}

function FnGetClrModulation(Obj, iOverlayID) {
  if (iOverlayID !== 0) {
    let pOverlay = Obj.GetGraphicsOverlay$i32$b(iOverlayID | 0, false);
    if (pOverlay == null) {
      $.DebugLogF(S("GetClrModulation: Overlay %d not defined for object %d (%s)"), iOverlayID | 0, Obj.Number, Obj.GetName());
      return new $.Nillable$i64().init$C4Void(new $.C4Void());
    }
    return new $.Nillable$i64().init$i64(pOverlay.GetClrModulation());
  } else {
    return new $.Nillable$i64().init$i64(Obj.ColorMod);
  }
}

function FnCloseMenu(Obj) {
  return !!Obj.CloseMenu(true);
}

function FnGetMenuSelection(Obj) {
  if (Obj.Menu == null || !Obj.Menu.IsActive$v()) {
    return new $.Nillable$i64().init$C4Void(new $.C4Void());
  }
  return new $.Nillable$i64().init$i64(Obj.Menu.GetSelection());
}

function FnCanConcatPictureWith(Obj, pObj) {
  if (Obj.Status === 0 || pObj == null) {
    return false;
  }
  return Obj.CanConcatPictureWith(pObj);
}

function FnSetGraphics(Obj, pGfxName, pSrcDef, iOverlayID, iOverlayMode, pAction, dwBlitMode, pOverlayObject) {
  if (Obj.Status === 0) {
    return false;
  }
  if (iOverlayID !== 0) {
    if (iOverlayID < 0) {
      $.Log(S("SetGraphics: Background overlays not implemented!"));
      return false;
    }
    let pGrp = null;
    if (iOverlayMode === 5 || iOverlayMode === 7 || iOverlayMode === 8) {
      if (pOverlayObject == null) {
        return Obj.RemoveGraphicsOverlay(iOverlayID | 0);
      }
    } else {
      if (pSrcDef == null) {
        return Obj.RemoveGraphicsOverlay(iOverlayID | 0);
      }
      pGrp = pSrcDef.Graphics.Get($.FnStringPar(pGfxName));
      if (pGrp == null) {
        return false;
      }
    }
    let pOverlay = Obj.GetGraphicsOverlay$i32$b(iOverlayID | 0, true);
    switch (iOverlayMode) {
      case 1:
        pOverlay.SetAsBase(pGrp, dwBlitMode >>> 0);
        break;
      case 2:
        pOverlay.SetAsAction(pGrp, $.FnStringPar(pAction), dwBlitMode >>> 0);
        break;
      case 4:
        pOverlay.SetAsIngamePicture(pGrp, dwBlitMode >>> 0);
        break;
      case 3:
        pOverlay.SetAsPicture(pGrp, dwBlitMode >>> 0);
        break;
      case 5:
        if (pOverlayObject != null && pOverlayObject.Status === 0) {
          pOverlayObject = null;
        }
        pOverlay.SetAsObject(pOverlayObject, dwBlitMode >>> 0);
        break;
      case 6:
        pOverlay.SetAsExtraGraphics(pGrp, dwBlitMode >>> 0);
        break;
      case 7:
        if (pOverlayObject != null && pOverlayObject.Status === 0) {
          pOverlayObject = null;
        }
        pOverlay.SetAsRank(dwBlitMode >>> 0, pOverlayObject);
        break;
      case 8:
        if (pOverlayObject != null && pOverlayObject.Status === 0) {
          pOverlayObject = null;
        }
        pOverlay.SetAsObjectPicture(pOverlayObject, dwBlitMode >>> 0);
        break;
      default:
        $.DebugLog(S("SetGraphics: Invalid overlay mode"));
        pOverlay.SetAsBase(null, 0);
        break;
    }
    if (!pOverlay.IsValid(Obj)) {
      Obj.RemoveGraphicsOverlay(iOverlayID | 0);
      return false;
    }
    return true;
  }
  return Obj.SetGraphics$pi8$pC4Def($.FnStringPar(pGfxName), pSrcDef);
}

function FnGetDefBottom(_this) {
  if (_this == null || !(_this.GetDef$v() != null)) {
    $throw(new $.NeedNonGlobalContext().init(S("GetDefBottom")));
  }
  let obj = $.Object_(_this);
  let def = _this.GetDef$v();
  0;
  if (obj != null) {
    return obj.GetY() + obj.Shape.GetBottom$v() | 0;
  } else if (def != null) {
    return def.Shape.GetBottom$v();
  } else {
    return 0;
  }
}

function FnSetMenuSize(Obj, iCols, iRows) {
  let pMnu = Obj.Menu;
  if (pMnu == null || !pMnu.IsActive$v()) {
    return false;
  }
  pMnu.SetSize($.Clamp$i64$i64$i64(iCols, 0, 50) | 0, $.Clamp$i64$i64$i64(iRows, 0, 50) | 0);
  return true;
}

function FnGetCrewEnabled(Obj) {
  return !Obj.CrewDisabled;
}

function FnSetCrewEnabled(Obj, fEnabled) {
  let change = (Obj.CrewDisabled ? 1 : 0) === (fEnabled ? 1 : 0) ? true : false;
  Obj.CrewDisabled = !fEnabled;
  if (!fEnabled) {
    let pOwner = null;
    if ((pOwner = $.Players.Get(Obj.Owner)) != null) {
      let fWasCursorMode = pOwner.ViewMode === 0;
      if (pOwner.Cursor.op_eq$pC4Object(Obj)) {
        pOwner.AdjustCursorCommand();
      }
      if (pOwner.ViewCursor.op_not() && pOwner.Cursor.op_not() && fWasCursorMode) {
        pOwner.SetViewMode(1, Obj);
      }
    }
  }
  if (change) {
    if (fEnabled) {
      Obj.Call$pi8$pC4AulParSet$b(S("~OnCrewEnabled"));
    } else {
      Obj.Call$pi8$pC4AulParSet$b(S("~OnCrewDisabled"));
    }
  }
}

function FnDoCrewExp(Obj, iChange) {
  Obj.DoExperience(iChange | 0);
}

function FnClearMenuItems(Obj) {
  if (Obj.Menu == null) {
    return false;
  }
  Obj.Menu.ClearItems();
  return true;
}

function FnGetObjectLayer(Obj) {
  return Obj.Layer.op_C4Object_();
}

function FnSetObjectLayer(Obj, pNewLayer) {
  let $t1, $t2, $t3;
  Obj.Layer.op_assign(pNewLayer);
  $t1 = Obj.Contents;
  $t2 = $t1.begin();
  $t3 = $t1.end();
  try {
    for (; $t2.op_ne($t3); $t2.op_inc$v()) {
      const contentObj = $t2.op_mul();
      if (contentObj != null && contentObj.Status !== 0) {
        contentObj.Layer.op_assign(pNewLayer);
      }
    }
  } finally { $t2.$dtor(); $t3.$dtor(); }
}

function FnSetShape(Obj, iX, iY, iWdt, iHgt) {
  Obj.Shape.x = iX | 0;
  Obj.Shape.y = iY | 0;
  Obj.Shape.Wdt = iWdt | 0;
  Obj.Shape.Hgt = iHgt | 0;
  Obj.UpdatePos();
}

function FnSetObjDrawTransform(Obj, iA, iB, iC, iD, iE, iF, iOverlayID) {
  let pTransform = null;
  if (iOverlayID !== 0) {
    let pOverlay = Obj.GetGraphicsOverlay$i32$b(iOverlayID | 0, false);
    if (pOverlay == null) {
      return false;
    }
    pTransform = pOverlay.GetTransform();
  } else {
    pTransform = Obj.pDrawTransform;
    if (iB === 0 && iC === 0 && iD === 0 && iF === 0 && iA === iE && (iA === 0 || iA === 1000)) {
      if (pTransform == null) {
        return true;
      }
      if (pTransform.FlipDir === 1) {
        $delete(pTransform);
        Obj.pDrawTransform = null;
        return true;
      }
      pTransform.Set(Math.fround(1), Math.fround(0), Math.fround(0), Math.fround(0), Math.fround(1), Math.fround(0), Math.fround(0), Math.fround(0), Math.fround(1));
      return true;
    }
    if (pTransform == null) {
      pTransform = Obj.pDrawTransform = new $.C4DrawTransform().init$v();
    }
  }
  pTransform.Set(Math.fround(Math.fround(iA) / Math.fround(1000)), Math.fround(Math.fround(iB) / Math.fround(1000)), Math.fround(Math.fround(iC) / Math.fround(1000)), Math.fround(Math.fround(iD) / Math.fround(1000)), Math.fround(Math.fround(iE) / Math.fround(1000)), Math.fround(Math.fround(iF) / Math.fround(1000)), Math.fround(0), Math.fround(0), Math.fround(1));
  return true;
}

function FnSetObjDrawTransform2(Obj, iA, iB, iC, iD, iE, iF, iG, iH, iI, iOverlayID) {
  let pObj = Obj;
  let pTransform = null;
  if (iOverlayID !== 0) {
    let pOverlay = pObj.GetGraphicsOverlay$i32$b(iOverlayID | 0, false);
    if (pOverlay == null) {
      return false;
    }
    pTransform = pOverlay.GetTransform();
  } else {
    pTransform = pObj.pDrawTransform;
    if (pTransform == null) {
      pTransform = pObj.pDrawTransform = new $.C4DrawTransform().init$i32(1);
    }
  }
  let matrix = new $.C4BltTransform();
  $.C4BltTransform.prototype.Set.call(matrix, Math.fround(Math.fround(iA) / Math.fround(1000)), Math.fround(Math.fround(iB) / Math.fround(1000)), Math.fround(Math.fround(iC) / Math.fround(1000)), Math.fround(Math.fround(iD) / Math.fround(1000)), Math.fround(Math.fround(iE) / Math.fround(1000)), Math.fround(Math.fround(iF) / Math.fround(1000)), Math.fround(Math.fround(iG) / Math.fround(1000)), Math.fround(Math.fround(iH) / Math.fround(1000)), Math.fround(Math.fround(iI) / Math.fround(1000)));
  pTransform.op_mulAssign(matrix);
  return true;
}

function FnSetObjectStatus(Obj, iNewStatus, fClearPointers) {
  if (Obj.Status === 0) {
    return false;
  }
  if (Obj.Status === iNewStatus) {
    return true;
  }
  switch (iNewStatus) {
    case 1:
      return Obj.StatusActivate();
    case 2:
      return Obj.StatusDeactivate(fClearPointers);
    default:
      return false;
  }
}

function FnGetObjectStatus(Obj) {
  return Obj.Status;
}

function FnAdjustWalkRotation(Obj, iRangeX, iRangeY, iSpeed) {
  if (Obj.Def.Rotateable === 0 || (~Obj.Action.t_attach & 8) !== 0 || Obj.Shape.AttachMat === -1) {
    return false;
  }
  return Obj.AdjustWalkRotation(iRangeX | 0, iRangeY | 0, iSpeed | 0);
}

function FnGetContact(Obj, iVertex, dwCheck) {
  if (iVertex === -1) {
    let iResult = 0;
    for (let i = 0; i < Obj.Shape.VtxNum; i = i + 1 | 0) {
      iResult = $or64n(iResult, Obj.Shape.GetVertexContact(i, dwCheck >>> 0, Obj.GetX(), Obj.GetY()));
    }
    return iResult;
  }
  if (!$.Inside$i64$i32$i32(iVertex, 0, Obj.Shape.VtxNum - 1 | 0)) {
    return 0;
  }
  return Obj.Shape.GetVertexContact(iVertex | 0, dwCheck >>> 0, Obj.GetX(), Obj.GetY());
}

function FnSetObjectBlitMode(Obj, dwNewBlitMode, iOverlayID) {
  if (iOverlayID !== 0) {
    let pOverlay = Obj.GetGraphicsOverlay$i32$b(iOverlayID | 0, false);
    if (pOverlay == null) {
      $.DebugLogF(S("SetObjectBlitMode: Overlay %d not defined for object %d (%s)"), iOverlayID | 0, Obj.Number, Obj.GetName());
      return 0;
    }
    pOverlay.SetBlitMode(dwNewBlitMode >>> 0);
    return 1;
  }
  let dwPrevMode = Obj.BlitMode;
  if (dwNewBlitMode === 0) {
    Obj.BlitMode = Obj.Def.BlitMode >>> 0;
  } else {
    Obj.BlitMode = $or64n(dwNewBlitMode, 128) >>> 0;
  }
  return dwPrevMode;
}

function FnGetObjectBlitMode(Obj, iOverlayID) {
  if (iOverlayID !== 0) {
    let pOverlay = Obj.GetGraphicsOverlay$i32$b(iOverlayID | 0, false);
    if (pOverlay == null) {
      $.DebugLogF(S("SetObjectBlitMode: Overlay %d not defined for object %d (%s)"), iOverlayID | 0, Obj.Number, Obj.GetName());
      return new $.Nillable$i64().init$C4Void(new $.C4Void());
    }
    return new $.Nillable$i64().init$i64(pOverlay.GetBlitMode());
  }
  return new $.Nillable$i64().init$i64(Obj.BlitMode);
}

function FnGetUnusedOverlayID(Obj, iBaseIndex) {
  if (iBaseIndex === 0) {
    return 0;
  }
  let iSearchDir = iBaseIndex < 0 ? -1 : 1;
  while (Obj.GetGraphicsOverlay$i32$b(iBaseIndex | 0, false) != null) {
    iBaseIndex = iBaseIndex + iSearchDir;
  }
  return iBaseIndex;
}

function FnPlayAnimation(Obj, szAnimation, iSlot, PositionProvider, WeightProvider, iSibling, iAttachNumber) {
  if (Obj == null) {
    return new $.Nillable$i32().init$C4Void(new $.C4Void());
  }
  if (Obj.pMeshInstance == null) {
    return new $.Nillable$i32().init$C4Void(new $.C4Void());
  }
  if (iSlot === 0) {
    return new $.Nillable$i32().init$C4Void(new $.C4Void());
  }
  if (PositionProvider == null) {
    return new $.Nillable$i32().init$C4Void(new $.C4Void());
  }
  let stop_previous_animations = WeightProvider.IsNil();
  if (!iSibling.IsNil() && stop_previous_animations) {
    return new $.Nillable$i32().init$C4Void(new $.C4Void());
  }
  let Instance = Obj.pMeshInstance;
  if (!iAttachNumber.IsNil()) {
    let Attached = Instance.GetAttachedMeshByNumber(iAttachNumber.op_int() >>> 0);
    if (Attached == null || !Attached.OwnChild) {
      return new $.Nillable$i32().init$C4Void(new $.C4Void());
    }
    Instance = Attached.Child;
  }
  let s_node = null;
  if (!iSibling.IsNil()) {
    s_node = Instance.GetAnimationNodeByNumber(iSibling.op_int() >>> 0);
    if (s_node == null || s_node.GetSlot() !== iSlot) {
      return new $.Nillable$i32().init$C4Void(new $.C4Void());
    }
  }
  let animation = Instance.GetMesh().GetSkeleton$v$c().GetAnimationByName(szAnimation.GetData());
  if (animation == null) {
    return new $.Nillable$i32().init$C4Void(new $.C4Void());
  }
  let p_provider = $.CreateValueProviderFromArray(Obj, PositionProvider, animation);
  let w_provider = null;
  if (stop_previous_animations) {
    w_provider = new $.C4ValueProviderConst().init$C4Fixed($.Fix1$C4Real.$clone());
  } else {
    w_provider = $.CreateValueProviderFromArray(Obj, WeightProvider.op_C4ValueArray_());
  }
  if (p_provider == null || w_provider == null) {
    $delete(p_provider);
    $delete(w_provider);
    return new $.Nillable$i32().init$C4Void(new $.C4Void());
  }
  let n_node = Instance.PlayAnimation$StdMeshAnimation$i32$pAnimationNode$pValueProvider$pValueProvider$b(animation, iSlot, s_node, p_provider, w_provider, stop_previous_animations);
  if (n_node == null) {
    return new $.Nillable$i32().init$C4Void(new $.C4Void());
  }
  return new $.Nillable$i32().init$i32(n_node.GetNumber() | 0);
}

function FnTransformBone(Obj, szBoneName, Transformation, iSlot, WeightProvider, iSibling, iAttachNumber) {
  if (Obj == null) {
    return new $.Nillable$i32().init$C4Void(new $.C4Void());
  }
  if (Obj.pMeshInstance == null) {
    return new $.Nillable$i32().init$C4Void(new $.C4Void());
  }
  if (iSlot === 0) {
    return new $.Nillable$i32().init$C4Void(new $.C4Void());
  }
  if (Transformation == null) {
    return new $.Nillable$i32().init$C4Void(new $.C4Void());
  }
  if (WeightProvider == null) {
    return new $.Nillable$i32().init$C4Void(new $.C4Void());
  }
  let Instance = Obj.pMeshInstance;
  if (!iAttachNumber.IsNil()) {
    let Attached = Instance.GetAttachedMeshByNumber(iAttachNumber.op_int() >>> 0);
    if (Attached == null || !Attached.OwnChild) {
      return new $.Nillable$i32().init$C4Void(new $.C4Void());
    }
    Instance = Attached.Child;
  }
  let s_node = null;
  if (!iSibling.IsNil()) {
    s_node = Instance.GetAnimationNodeByNumber(iSibling.op_int() >>> 0);
    if (s_node == null || s_node.GetSlot() !== iSlot) {
      return new $.Nillable$i32().init$C4Void(new $.C4Void());
    }
  }
  let bone = Instance.GetMesh().GetSkeleton$v$c().GetBoneByName(szBoneName.GetData());
  if (bone == null) {
    return new $.Nillable$i32().init$C4Void(new $.C4Void());
  }
  let w_provider = $.CreateValueProviderFromArray(Obj, WeightProvider);
  if (w_provider == null) {
    return new $.Nillable$i32().init$C4Void(new $.C4Void());
  }
  let matrix = new $.StdMeshMatrix();
  if (!C4ValueToMatrix$C4ValueArray$pStdMeshMatrix(Transformation, matrix)) {
    $throw(new $.C4AulExecError().init(S("TransformBone: Transformation is not a valid 3x4 matrix")));
  }
  let trans = matrix.Decompose();
  let n_node = Instance.PlayAnimation$pStdMeshBone$StdMeshTransformation$i32$pAnimationNode$pValueProvider$b(bone, trans, iSlot, s_node, w_provider, false);
  if (n_node == null) {
    return new $.Nillable$i32().init$C4Void(new $.C4Void());
  }
  return new $.Nillable$i32().init$i32(n_node.GetNumber() | 0);
}

function FnStopAnimation(Obj, iAnimationNumber, iAttachNumber) {
  if (Obj == null) {
    return false;
  }
  if (Obj.pMeshInstance == null) {
    return false;
  }
  if (iAnimationNumber.IsNil()) {
    return false;
  }
  let Instance = Obj.pMeshInstance;
  if (!iAttachNumber.IsNil()) {
    let Attached = Instance.GetAttachedMeshByNumber(iAttachNumber.op_int() >>> 0);
    if (Attached == null || !Attached.OwnChild) {
      return false;
    }
    Instance = Attached.Child;
  }
  let node = Instance.GetAnimationNodeByNumber(iAnimationNumber.op_int() >>> 0);
  if (node == null || node.GetSlot() === 0) {
    return false;
  }
  Instance.StopAnimation(node);
  return true;
}

function FnGetRootAnimation(Obj, iSlot, iAttachNumber) {
  if (Obj == null) {
    return new $.Nillable$i32().init$C4Void(new $.C4Void());
  }
  if (Obj.pMeshInstance == null) {
    return new $.Nillable$i32().init$C4Void(new $.C4Void());
  }
  let Instance = Obj.pMeshInstance;
  if (!iAttachNumber.IsNil()) {
    let Attached = Instance.GetAttachedMeshByNumber(iAttachNumber.op_int() >>> 0);
    if (Attached == null || !Attached.OwnChild) {
      return new $.Nillable$i32().init$C4Void(new $.C4Void());
    }
    Instance = Attached.Child;
  }
  let node = Instance.GetRootAnimationForSlot(iSlot);
  if (node == null) {
    return new $.Nillable$i32().init$C4Void(new $.C4Void());
  }
  return new $.Nillable$i32().init$i32(node.GetNumber() | 0);
}

function FnGetAnimationList(_this, iAttachNumber) {
  let Obj = $.Object_(_this);
  let skeleton = null;
  if (Obj == null) {
    if (_this == null || !(_this.GetDef$v() != null)) {
      $throw(new $.NeedNonGlobalContext().init(S("GetAnimationList")));
    }
    let def = _this.GetDef$v();
    if (!def.Graphics.IsMesh()) {
      return new $.Nillable$pC4ValueArray().init$C4Void(new $.C4Void());
    }
    skeleton = def.Graphics.$u1.Mesh.GetSkeleton$v();
  } else {
    if (Obj == null) {
      return new $.Nillable$pC4ValueArray().init$C4Void(new $.C4Void());
    }
    if (Obj.pMeshInstance == null) {
      return new $.Nillable$pC4ValueArray().init$C4Void(new $.C4Void());
    }
    let Instance = Obj.pMeshInstance;
    if (!iAttachNumber.IsNil()) {
      let Attached = Instance.GetAttachedMeshByNumber(iAttachNumber.op_int() >>> 0);
      if (Attached == null || !Attached.OwnChild) {
        return new $.Nillable$pC4ValueArray().init$C4Void(new $.C4Void());
      }
      Instance = Attached.Child;
    }
    skeleton = Instance.GetMesh().GetSkeleton$v$c();
  }
  let animations = skeleton.GetAnimations();
  let retval = new $.C4ValueArray().init$i32(animations.length | 0);
  for (let i = 0; i < animations.length; i = i + 1 >>> 0) {
    retval.op_index$i32(i | 0).$assign($.C4VString$StdStrBuf(new $.StdStrBuf().init$StdStrBuf$b(animations[i].Name)));
  }
  return new $.Nillable$pC4ValueArray().init$rpC4ValueArray(retval);
}

function FnGetAnimationLength(Obj, szAnimation, iAttachNumber) {
  if (Obj == null) {
    return new $.Nillable$i32().init$C4Void(new $.C4Void());
  }
  if (Obj.pMeshInstance == null) {
    return new $.Nillable$i32().init$C4Void(new $.C4Void());
  }
  let Instance = Obj.pMeshInstance;
  if (!iAttachNumber.IsNil()) {
    let Attached = Instance.GetAttachedMeshByNumber(iAttachNumber.op_int() >>> 0);
    if (Attached == null || !Attached.OwnChild) {
      return new $.Nillable$i32().init$C4Void(new $.C4Void());
    }
    Instance = Attached.Child;
  }
  let animation = Instance.GetMesh().GetSkeleton$v$c().GetAnimationByName(szAnimation.GetData());
  if (animation == null) {
    return new $.Nillable$i32().init$C4Void(new $.C4Void());
  }
  return new $.Nillable$i32().init$i32($.fixtoi$C4Fixed$i32($.ftofix(animation.Length), 1000));
}

function FnGetAnimationName(Obj, iAnimationNumber, iAttachNumber) {
  if (Obj == null) {
    return new $.Nillable$pC4String().init$C4Void(new $.C4Void());
  }
  if (Obj.pMeshInstance == null) {
    return new $.Nillable$pC4String().init$C4Void(new $.C4Void());
  }
  if (iAnimationNumber.IsNil()) {
    return new $.Nillable$pC4String().init$C4Void(new $.C4Void());
  }
  let Instance = Obj.pMeshInstance;
  if (!iAttachNumber.IsNil()) {
    let Attached = Instance.GetAttachedMeshByNumber(iAttachNumber.op_int() >>> 0);
    if (Attached == null || !Attached.OwnChild) {
      return new $.Nillable$pC4String().init$C4Void(new $.C4Void());
    }
    Instance = Attached.Child;
  }
  let node = Instance.GetAnimationNodeByNumber(iAnimationNumber.op_int() >>> 0);
  if (node == null || node.GetType() !== 0) {
    return new $.Nillable$pC4String().init$C4Void(new $.C4Void());
  }
  return new $.Nillable$pC4String().init$rpC4String($.String_(node.GetAnimation().Name.getData()));
}

function FnGetAnimationPosition(Obj, iAnimationNumber, iAttachNumber) {
  if (Obj == null) {
    return new $.Nillable$i32().init$C4Void(new $.C4Void());
  }
  if (Obj.pMeshInstance == null) {
    return new $.Nillable$i32().init$C4Void(new $.C4Void());
  }
  if (iAnimationNumber.IsNil()) {
    return new $.Nillable$i32().init$C4Void(new $.C4Void());
  }
  let Instance = Obj.pMeshInstance;
  if (!iAttachNumber.IsNil()) {
    let Attached = Instance.GetAttachedMeshByNumber(iAttachNumber.op_int() >>> 0);
    if (Attached == null || !Attached.OwnChild) {
      return new $.Nillable$i32().init$C4Void(new $.C4Void());
    }
    Instance = Attached.Child;
  }
  let node = Instance.GetAnimationNodeByNumber(iAnimationNumber.op_int() >>> 0);
  if (node == null || node.GetType() !== 0) {
    return new $.Nillable$i32().init$C4Void(new $.C4Void());
  }
  return new $.Nillable$i32().init$i32($.fixtoi$C4Fixed$i32(node.GetPosition(), 1000));
}

function FnGetAnimationWeight(Obj, iAnimationNumber, iAttachNumber) {
  if (Obj == null) {
    return new $.Nillable$i32().init$C4Void(new $.C4Void());
  }
  if (Obj.pMeshInstance == null) {
    return new $.Nillable$i32().init$C4Void(new $.C4Void());
  }
  if (iAnimationNumber.IsNil()) {
    return new $.Nillable$i32().init$C4Void(new $.C4Void());
  }
  let Instance = Obj.pMeshInstance;
  if (!iAttachNumber.IsNil()) {
    let Attached = Instance.GetAttachedMeshByNumber(iAttachNumber.op_int() >>> 0);
    if (Attached == null || !Attached.OwnChild) {
      return new $.Nillable$i32().init$C4Void(new $.C4Void());
    }
    Instance = Attached.Child;
  }
  let node = Instance.GetAnimationNodeByNumber(iAnimationNumber.op_int() >>> 0);
  if (node == null || node.GetType() !== 2) {
    return new $.Nillable$i32().init$C4Void(new $.C4Void());
  }
  return new $.Nillable$i32().init$i32($.fixtoi$C4Fixed$i32(node.GetWeight(), 1000));
}

function FnSetAnimationPosition(Obj, iAnimationNumber, PositionProvider, iAttachNumber) {
  if (Obj == null) {
    return false;
  }
  if (Obj.pMeshInstance == null) {
    return false;
  }
  if (iAnimationNumber.IsNil()) {
    return false;
  }
  let Instance = Obj.pMeshInstance;
  if (!iAttachNumber.IsNil()) {
    let Attached = Instance.GetAttachedMeshByNumber(iAttachNumber.op_int() >>> 0);
    if (Attached == null || !Attached.OwnChild) {
      return false;
    }
    Instance = Attached.Child;
  }
  let node = Instance.GetAnimationNodeByNumber(iAnimationNumber.op_int() >>> 0);
  if (node == null || node.GetSlot() === 0 || node.GetType() !== 0) {
    return false;
  }
  let p_provider = $.CreateValueProviderFromArray(Obj, PositionProvider);
  if (p_provider == null) {
    return false;
  }
  Instance.SetAnimationPosition(node, p_provider);
  return true;
}

function FnSetAnimationBoneTransform(Obj, iAnimationNumber, Transformation, iAttachNumber) {
  if (Obj == null) {
    return false;
  }
  if (Obj.pMeshInstance == null) {
    return false;
  }
  if (iAnimationNumber.IsNil()) {
    return false;
  }
  let Instance = Obj.pMeshInstance;
  if (!iAttachNumber.IsNil()) {
    let Attached = Instance.GetAttachedMeshByNumber(iAttachNumber.op_int() >>> 0);
    if (Attached == null || !Attached.OwnChild) {
      return false;
    }
    Instance = Attached.Child;
  }
  let node = Instance.GetAnimationNodeByNumber(iAnimationNumber.op_int() >>> 0);
  if (node == null || node.GetSlot() === 0 || node.GetType() !== 1) {
    return false;
  }
  let matrix = new $.StdMeshMatrix();
  if (!C4ValueToMatrix$C4ValueArray$pStdMeshMatrix(Transformation, matrix)) {
    $throw(new $.C4AulExecError().init(S("TransformBone: Transformation is not a valid 3x4 matrix")));
  }
  let trans = matrix.Decompose();
  Instance.SetAnimationBoneTransform(node, trans);
  return true;
}

function FnSetAnimationWeight(Obj, iAnimationNumber, WeightProvider, iAttachNumber) {
  if (Obj == null) {
    return false;
  }
  if (Obj.pMeshInstance == null) {
    return false;
  }
  if (iAnimationNumber.IsNil()) {
    return false;
  }
  let Instance = Obj.pMeshInstance;
  if (!iAttachNumber.IsNil()) {
    let Attached = Instance.GetAttachedMeshByNumber(iAttachNumber.op_int() >>> 0);
    if (Attached == null || !Attached.OwnChild) {
      return false;
    }
    Instance = Attached.Child;
  }
  let node = Instance.GetAnimationNodeByNumber(iAnimationNumber.op_int() >>> 0);
  if (node == null || node.GetSlot() === 0 || node.GetType() !== 2) {
    return false;
  }
  let w_provider = $.CreateValueProviderFromArray(Obj, WeightProvider);
  if (w_provider == null) {
    return false;
  }
  Instance.SetAnimationWeight(node, w_provider);
  return true;
}

function FnAttachMesh(Obj, Mesh, szParentBone, szChildBone, Transformation, Flags, AttachNumber) {
  if (Obj.pMeshInstance == null) {
    return new $.Nillable$i32().init$C4Void(new $.C4Void());
  }
  if (Mesh == null) {
    return new $.Nillable$i32().init$C4Void(new $.C4Void());
  }
  let trans = $.StdMeshMatrix.Identity();
  if (Transformation != null && !C4ValueToMatrix$C4ValueArray$pStdMeshMatrix(Transformation, trans)) {
    $throw(new $.C4AulExecError().init(S("AttachMesh: Transformation is not a valid 3x4 matrix")));
  }
  let attach = null;
  let pObj = Mesh.GetObject$v();
  if (pObj != null) {
    if (pObj.pMeshInstance == null) {
      return new $.Nillable$i32().init$C4Void(new $.C4Void());
    }
    attach = Obj.pMeshInstance.AttachMesh$rStdMeshInstance$pDenumerator$StdStrBuf$StdStrBuf$StdMeshMatrix$u32$b$u32(pObj.pMeshInstance, new $.C4MeshDenumerator().init$pC4Object(pObj), szParentBone.GetData(), szChildBone.GetData(), trans, Flags >>> 0, false, AttachNumber >>> 0);
  } else {
    let pDef = Mesh.GetDef$v();
    if (pDef == null) {
      return new $.Nillable$i32().init$C4Void(new $.C4Void());
    }
    if (pDef.Graphics.Type !== 2) {
      return new $.Nillable$i32().init$C4Void(new $.C4Void());
    }
    attach = Obj.pMeshInstance.AttachMesh$StdMesh$pDenumerator$StdStrBuf$StdStrBuf$StdMeshMatrix$u32$u32(pDef.Graphics.$u1.Mesh, new $.C4MeshDenumerator().init$pC4Def(pDef), szParentBone.GetData(), szChildBone.GetData(), trans, Flags >>> 0, AttachNumber >>> 0);
    if (attach != null) {
      attach.Child.SetFaceOrderingForClrModulation(Obj.ColorMod);
    }
  }
  if (attach == null) {
    return new $.Nillable$i32().init$C4Void(new $.C4Void());
  }
  return new $.Nillable$i32().init$i32(attach.Number | 0);
}

function FnDetachMesh(Obj, iAttachNumber) {
  if (Obj == null || Obj.pMeshInstance == null) {
    return false;
  }
  return Obj.pMeshInstance.DetachMesh(iAttachNumber >>> 0);
}

function FnSetAttachBones(Obj, iAttachNumber, szParentBone, szChildBone) {
  if (Obj == null || Obj.pMeshInstance == null) {
    return false;
  }
  let attach = Obj.pMeshInstance.GetAttachedMeshByNumber(iAttachNumber >>> 0);
  if (attach == null) {
    return false;
  }
  if (!szParentBone.IsNil()) {
    let ParentBone = szParentBone.op_C4String_();
    if (!attach.SetParentBone(ParentBone.GetData())) {
      return false;
    }
  }
  if (!szChildBone.IsNil()) {
    let ChildBone = szChildBone.op_C4String_();
    if (!attach.SetChildBone(ChildBone.GetData())) {
      return false;
    }
  }
  return true;
}

function FnSetAttachTransform(Obj, iAttachNumber, Transformation) {
  if (Obj == null || Obj.pMeshInstance == null) {
    return false;
  }
  if (Transformation == null) {
    return false;
  }
  let attach = Obj.pMeshInstance.GetAttachedMeshByNumber(iAttachNumber >>> 0);
  if (attach == null) {
    return false;
  }
  let trans = new $.StdMeshMatrix();
  if (!C4ValueToMatrix$C4ValueArray$pStdMeshMatrix(Transformation, trans)) {
    $throw(new $.C4AulExecError().init(S("SetAttachTransform: Transformation is not a valid 3x4 matrix")));
  }
  attach.SetAttachTransformation(trans);
  return true;
}

function FnGetBoneNames(_this) {
  let obj = $.Object_(_this);
  let fnMakeC4ValueArray = ((len, iterable) => {
  let retval = new $.C4ValueArray().init$i32(len | 0);
  for (let i = 0; i < len; i = i + 1) {
    retval.SetItem(i | 0, iterable(i));
  }
  return retval;
});
  if (obj == null) {
    if (_this == null || !(_this.GetDef$v() != null)) {
      $throw(new $.NeedNonGlobalContext().init(S("GetBoneNames")));
    }
    let def = _this.GetDef$v();
    if (!def.Graphics.IsMesh()) {
      return new $.Nillable$pC4ValueArray().init$C4Void(new $.C4Void());
    }
    const skeleton = def.Graphics.$u1.Mesh.GetSkeleton$v();
    let fnGetBoneName = ((i) => {
  return $.C4VString$StdStrBuf(new $.StdStrBuf().init$StdStrBuf$b(skeleton.GetBone(i).Name));
});
    return new $.Nillable$pC4ValueArray().init$rpC4ValueArray(fnMakeC4ValueArray(skeleton.GetNumBones(), fnGetBoneName));
  } else {
    if (obj.pMeshInstance == null) {
      return new $.Nillable$pC4ValueArray().init$C4Void(new $.C4Void());
    }
    const skeleton = obj.pMeshInstance.GetMesh().GetSkeleton$v$c();
    let fnGetBoneName = ((i$2) => {
  return $.C4VString$StdStrBuf(new $.StdStrBuf().init$StdStrBuf$b(skeleton.GetBone(i$2).Name));
});
    return new $.Nillable$pC4ValueArray().init$rpC4ValueArray(fnMakeC4ValueArray(skeleton.GetNumBones(), fnGetBoneName));
    ;
  }
}

function FnGetMeshMaterial(_this, iSubMesh) {
  let Obj = $.Object_(_this);
  if (Obj == null) {
    if (_this == null || !(_this.GetDef$v() != null)) {
      $throw(new $.NeedNonGlobalContext().init(S("GetMeshMaterial")));
    }
    let def = _this.GetDef$v();
    if (!def.Graphics.IsMesh()) {
      return new $.Nillable$pC4String().init$C4Void(new $.C4Void());
    }
    if (iSubMesh < 0 || iSubMesh >>> 0 >= def.Graphics.$u1.Mesh.GetNumSubMeshes()) {
      return new $.Nillable$pC4String().init$C4Void(new $.C4Void());
    }
    const submesh = def.Graphics.$u1.Mesh.GetSubMesh($u64n(iSubMesh));
    return new $.Nillable$pC4String().init$rpC4String($.String_(submesh.GetMaterial().Name.getData()));
  } else {
    if (Obj.pMeshInstance == null) {
      return new $.Nillable$pC4String().init$C4Void(new $.C4Void());
    }
    if (iSubMesh < 0 || iSubMesh >>> 0 >= Obj.pMeshInstance.GetNumSubMeshes()) {
      return new $.Nillable$pC4String().init$C4Void(new $.C4Void());
    }
    const submesh = Obj.pMeshInstance.GetSubMesh$u64($u64n(iSubMesh));
    return new $.Nillable$pC4String().init$rpC4String($.String_(submesh.GetMaterial().Name.getData()));
  }
}

function FnSetMeshMaterial(Obj, Material, iSubMesh) {
  if (Obj == null || Obj.pMeshInstance == null) {
    return false;
  }
  if (iSubMesh < 0 || iSubMesh >>> 0 >= Obj.pMeshInstance.GetNumSubMeshes()) {
    return false;
  }
  if (Material == null) {
    return false;
  }
  let material = $.MeshMaterialManager.GetMaterial(Material.GetData().getData());
  if (material == null) {
    return false;
  }
  Obj.pMeshInstance.SetMaterial($u64n(iSubMesh), material);
  return true;
}

function FnCreateParticleAtBone(Obj, szName, szBoneName, _Pos, _Dir, _lifetime, _properties, _amount) {
  if (Obj == null || Obj.Status === 0) {
    return false;
  }
  if (Obj.pMeshInstance == null) {
    return false;
  }
  const mesh = Obj.pMeshInstance.GetMesh();
  let bone = mesh.GetSkeleton$v$c().GetBoneByName(szBoneName.GetData());
  if (bone == null) {
    return false;
  }
  let pDef = $.Particles.definitions.GetDef($.FnStringPar(szName));
  if (pDef == null) {
    return false;
  }
  return true;
}

function FnGetDefWidth(_this) {
  if (_this == null) {
    return new $.Nillable$i64().init$C4Void(new $.C4Void());
  }
  let def = _this.GetDef$v();
  if (def == null) {
    return new $.Nillable$i64().init$C4Void(new $.C4Void());
  }
  return new $.Nillable$i64().init$i64(def.Shape.Wdt);
}

function FnGetDefHeight(_this) {
  if (_this == null) {
    return new $.Nillable$i64().init$C4Void(new $.C4Void());
  }
  let def = _this.GetDef$v();
  if (def == null) {
    return new $.Nillable$i64().init$C4Void(new $.C4Void());
  }
  return new $.Nillable$i64().init$i64(def.Shape.Hgt);
}


export function InitObjectFunctionMap(pEngine) {
  for (let pCDef = $oat($.C4ScriptObjectConstMap, 0); pCDef.Identifier != null; pCDef = $oadd(pCDef, 1)) {
    0;
    pEngine.RegisterGlobalConstant(pCDef.Identifier, $.C4VInt(pCDef.Data | 0));
  }
  let p = pEngine.GetPropList();
  $.AddFunc$224(p, S("DoCon"), FnDoCon);
  $.AddFunc$203(p, S("GetCon"), FnGetCon);
  $.AddFunc$220(p, S("DoDamage"), FnDoDamage);
  $.AddFunc$222(p, S("DoEnergy"), FnDoEnergy);
  $.AddFunc$221(p, S("DoBreath"), FnDoBreath);
  $.AddFunc$202(p, S("GetEnergy"), FnGetEnergy);
  $.AddFunc$141(p, S("OnFire"), FnOnFire);
  $.AddFunc$160(p, S("Stuck"), FnStuck);
  $.AddFunc$141(p, S("InLiquid"), FnInLiquid);
  $.AddFunc$146(p, S("SetAction"), FnSetAction);
  $.AddFunc$157(p, S("SetActionData"), FnSetActionData);
  $.AddFunc$81(p, S("GetAction"), FnGetAction);
  $.AddFunc$200(p, S("GetActTime"), FnGetActTime);
  $.AddFunc$200(p, S("GetOwner"), FnGetOwner);
  $.AddFunc$177(p, S("GetMass"), FnGetMass);
  $.AddFunc$200(p, S("GetBreath"), FnGetBreath);
  $.AddFunc$18(p, S("GetMenu"), FnGetMenu);
  $.AddFunc$200(p, S("GetVertexNum"), FnGetVertexNum);
  $.AddFunc$40(p, S("GetVertex"), FnGetVertex);
  $.AddFunc$162(p, S("SetVertex"), FnSetVertex);
  $.AddFunc$160(p, S("AddVertex"), FnAddVertex);
  $.AddFunc$161(p, S("InsertVertex"), FnInsertVertex);
  $.AddFunc$157(p, S("RemoveVertex"), FnRemoveVertex);
  $.AddFunc$221(p, S("SetContactDensity"), FnSetContactDensity, false);
  $.AddFunc$200(p, S("GetController"), FnGetController);
  $.AddFunc$157(p, S("SetController"), FnSetController);
  $.AddFunc$103(p, S("SetName"), FnSetName);
  $.AddFunc$200(p, S("GetKiller"), FnGetKiller);
  $.AddFunc$157(p, S("SetKiller"), FnSetKiller);
  $.AddFunc$200(p, S("GetPhase"), FnGetPhase);
  $.AddFunc$157(p, S("SetPhase"), FnSetPhase);
  $.AddFunc$177(p, S("GetCategory"), FnGetCategory);
  $.AddFunc$200(p, S("GetOCF"), FnGetOCF);
  $.AddFunc$218(p, S("SetAlive"), FnSetAlive);
  $.AddFunc$141(p, S("GetAlive"), FnGetAlive);
  $.AddFunc$200(p, S("GetDamage"), FnGetDamage);
  $.AddFunc$221(p, S("SetComDir"), FnSetComDir);
  $.AddFunc$200(p, S("GetComDir"), FnGetComDir);
  $.AddFunc$221(p, S("SetDir"), FnSetDir);
  $.AddFunc$200(p, S("GetDir"), FnGetDir);
  $.AddFunc$218(p, S("SetEntrance"), FnSetEntrance);
  $.AddFunc$141(p, S("GetEntrance"), FnGetEntrance);
  $.AddFunc$221(p, S("SetCategory"), FnSetCategory);
  $.AddFunc$154(p, S("FinishCommand"), FnFinishCommand);
  $.AddFunc$141(p, S("ActIdle"), FnActIdle);
  $.AddFunc$223(p, S("SetRDir"), FnSetRDir);
  $.AddFunc$203(p, S("GetRDir"), FnGetRDir);
  $.AddFunc$203(p, S("GetXDir"), FnGetXDir);
  $.AddFunc$203(p, S("GetYDir"), FnGetYDir);
  $.AddFunc$200(p, S("GetR"), FnGetR);
  $.AddFunc$223(p, S("SetXDir"), FnSetXDir);
  $.AddFunc$223(p, S("SetYDir"), FnSetYDir);
  $.AddFunc$221(p, S("SetR"), FnSetR);
  $.AddFunc$157(p, S("SetOwner"), FnSetOwner);
  $.AddFunc$157(p, S("MakeCrewMember"), FnMakeCrewMember);
  $.AddFunc$150(p, S("GrabObjectInfo"), FnGrabObjectInfo);
  $.AddFunc$71(p, S("CreateContents"), FnCreateContents);
  $.AddFunc$153(p, S("ShiftContents"), FnShiftContents);
  $.AddFunc$41(p, S("GetID"), FnGetID);
  $.AddFunc$73(p, S("Contents"), FnContents);
  $.AddFunc$70(p, S("ScrollContents"), FnScrollContents);
  $.AddFunc$70(p, S("Contained"), FnContained);
  $.AddFunc$199(p, S("ContentsCount"), FnContentsCount);
  $.AddFunc$72(p, S("FindContents"), FnFindContents, false);
  $.AddFunc$69(p, S("FindOtherContents"), FnFindOtherContents, false);
  $.AddFunc$218(p, S("RemoveObject"), FnRemoveObject);
  $.AddFunc$73(p, S("GetActionTarget"), FnGetActionTarget);
  $.AddFunc$217(p, S("SetActionTargets"), FnSetActionTargets);
  $.AddFunc$159(p, S("SetCrewStatus"), FnSetCrewStatus, false);
  $.AddFunc$225(p, S("SetPosition"), FnSetPosition);
  $.AddFunc$142(p, S("CreateMenu"), FnCreateMenu);
  $.AddFunc$148(p, S("AddMenuItem"), FnAddMenuItem);
  $.AddFunc$157(p, S("SelectMenuItem"), FnSelectMenuItem);
  $.AddFunc$137(p, S("SetMenuDecoration"), FnSetMenuDecoration);
  $.AddFunc$157(p, S("SetMenuTextProgress"), FnSetMenuTextProgress);
  $.AddFunc$178(p, S("ObjectDistance"), FnObjectDistance);
  $.AddFunc$179(p, S("GetValue"), FnGetValue);
  $.AddFunc$200(p, S("GetRank"), FnGetRank);
  $.AddFunc$205(p, S("SetTransferZone"), FnSetTransferZone);
  $.AddFunc$221(p, S("SetMass"), FnSetMass);
  $.AddFunc$200(p, S("GetColor"), FnGetColor);
  $.AddFunc$221(p, S("SetColor"), FnSetColor);
  $.AddFunc$219(p, S("SetLightRange"), FnSetLightRange);
  $.AddFunc$200(p, S("GetLightColor"), FnGetLightColor);
  $.AddFunc$221(p, S("SetLightColor"), FnSetLightColor);
  $.AddFunc$227(p, S("SetPicture"), FnSetPicture);
  $.AddFunc$81(p, S("GetProcedure"), FnGetProcedure);
  $.AddFunc$150(p, S("CanConcatPictureWith"), FnCanConcatPictureWith);
  $.AddFunc$143(p, S("SetGraphics"), FnSetGraphics);
  $.AddFunc$200(p, S("ObjectNumber"), FnObjectNumber);
  $.AddFunc$201(p, S("ShowInfo"), FnShowInfo);
  $.AddFunc$155(p, S("CheckVisibility"), FnCheckVisibility);
  $.AddFunc$140(p, S("SetClrModulation"), FnSetClrModulation);
  $.AddFunc$39(p, S("GetClrModulation"), FnGetClrModulation);
  $.AddFunc$141(p, S("CloseMenu"), FnCloseMenu);
  $.AddFunc$38(p, S("GetMenuSelection"), FnGetMenuSelection);
  $.AddFunc$177(p, S("GetDefBottom"), FnGetDefBottom);
  $.AddFunc$160(p, S("SetMenuSize"), FnSetMenuSize);
  $.AddFunc$141(p, S("GetCrewEnabled"), FnGetCrewEnabled);
  $.AddFunc$218(p, S("SetCrewEnabled"), FnSetCrewEnabled);
  $.AddFunc$221(p, S("DoCrewExp"), FnDoCrewExp);
  $.AddFunc$141(p, S("ClearMenuItems"), FnClearMenuItems);
  $.AddFunc$70(p, S("GetObjectLayer"), FnGetObjectLayer);
  $.AddFunc$216(p, S("SetObjectLayer"), FnSetObjectLayer);
  $.AddFunc$227(p, S("SetShape"), FnSetShape);
  $.AddFunc$164(p, S("SetObjDrawTransform"), FnSetObjDrawTransform);
  $.AddFunc$165(p, S("SetObjDrawTransform2"), FnSetObjDrawTransform2, false);
  $.AddFunc$159(p, S("SetObjectStatus"), FnSetObjectStatus, false);
  $.AddFunc$200(p, S("GetObjectStatus"), FnGetObjectStatus, false);
  $.AddFunc$161(p, S("AdjustWalkRotation"), FnAdjustWalkRotation, false);
  $.AddFunc$204(p, S("GetContact"), FnGetContact);
  $.AddFunc$204(p, S("SetObjectBlitMode"), FnSetObjectBlitMode);
  $.AddFunc$39(p, S("GetObjectBlitMode"), FnGetObjectBlitMode);
  $.AddFunc$203(p, S("GetUnusedOverlayID"), FnGetUnusedOverlayID, false);
  $.AddFunc$141(p, S("ExecuteCommand"), FnExecuteCommand);
  $.AddFunc$29(p, S("PlayAnimation"), FnPlayAnimation);
  $.AddFunc$27(p, S("TransformBone"), FnTransformBone);
  $.AddFunc$139(p, S("StopAnimation"), FnStopAnimation);
  $.AddFunc$31(p, S("GetRootAnimation"), FnGetRootAnimation);
  $.AddFunc$17(p, S("GetAnimationList"), FnGetAnimationList);
  $.AddFunc$28(p, S("GetAnimationLength"), FnGetAnimationLength);
  $.AddFunc$23(p, S("GetAnimationName"), FnGetAnimationName);
  $.AddFunc$30(p, S("GetAnimationPosition"), FnGetAnimationPosition);
  $.AddFunc$30(p, S("GetAnimationWeight"), FnGetAnimationWeight);
  $.AddFunc$138(p, S("SetAnimationPosition"), FnSetAnimationPosition);
  $.AddFunc$138(p, S("SetAnimationBoneTransform"), FnSetAnimationBoneTransform);
  $.AddFunc$138(p, S("SetAnimationWeight"), FnSetAnimationWeight);
  $.AddFunc$26(p, S("AttachMesh"), FnAttachMesh);
  $.AddFunc$157(p, S("DetachMesh"), FnDetachMesh);
  $.AddFunc$156(p, S("SetAttachBones"), FnSetAttachBones);
  $.AddFunc$158(p, S("SetAttachTransform"), FnSetAttachTransform);
  $.AddFunc$15(p, S("GetBoneNames"), FnGetBoneNames);
  $.AddFunc$21(p, S("GetMeshMaterial"), FnGetMeshMaterial);
  $.AddFunc$149(p, S("SetMeshMaterial"), FnSetMeshMaterial);
  $.AddFunc$147(p, S("CreateParticleAtBone"), FnCreateParticleAtBone);
  $.AddFunc$137(p, S("ChangeDef"), FnChangeDef);
  $.AddFunc$150(p, S("GrabContents"), FnGrabContents);
  $.AddFunc$152(p, S("Punch"), FnPunch);
  $.AddFunc$89(p, S("Kill"), FnKill);
  $.AddFunc$226(p, S("Fling"), FnFling);
  $.AddFunc$141(p, S("Jump"), FnJump, false);
  $.AddFunc$150(p, S("Enter"), FnEnter);
  $.AddFunc$215(p, S("DeathAnnounce"), FnDeathAnnounce);
  $.AddFunc$228(p, S("SetSolidMask"), FnSetSolidMask);
  $.AddFunc$218(p, S("SetHalfVehicleSolidMask"), FnSetHalfVehicleSolidMask);
  $.AddFunc$163(p, S("Exit"), FnExit);
  $.AddFunc$151(p, S("Collect"), FnCollect);
  $.AddFunc$144(p, S("SetCommand"), FnSetCommand);
  $.AddFunc$145(p, S("AddCommand"), FnAddCommand);
  $.AddFunc$145(p, S("AppendCommand"), FnAppendCommand);
  $.AddFunc$14(p, S("GetCommand"), FnGetCommand);
  $.AddFunc$12(p, S("SetCrewExtraData"), FnSetCrewExtraData);
  $.AddFunc$11(p, S("GetCrewExtraData"), FnGetCrewExtraData);
  $.AddFunc$32(p, S("GetDefWidth"), FnGetDefWidth);
  $.AddFunc$32(p, S("GetDefHeight"), FnGetDefHeight);
}

export function $init(): void {
  $.C4MN_Add_ImgRank$C4ObjectScript = 1;
  $.C4MN_Add_ImgIndexed$C4ObjectScript = 2;
  $.C4MN_Add_ImgObjRank$C4ObjectScript = 3;
  $.C4MN_Add_ImgObject$C4ObjectScript = 4;
  $.C4MN_Add_ImgTextSpec$C4ObjectScript = 5;
  $.C4MN_Add_ImgColor$C4ObjectScript = 6;
  $.C4MN_Add_ImgPropListSpec$C4ObjectScript = 7;
  $.C4MN_Add_MaxImage$C4ObjectScript = 127;
  $.C4MN_Add_PassValue$C4ObjectScript = 128;
  $.C4MN_Add_ForceCount$C4ObjectScript = 256;
  $.C4MN_Add_ForceNoDesc$C4ObjectScript = 512;
  $.C4ScriptObjectConstMap = $own([
  ((($o) => ($o.Identifier = S("C4D_None"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 0, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4D_All"), $o.ValType = 1 /*C4V_Int*/, $o.Data = -1, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4D_StaticBack"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 1, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4D_Structure"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 2, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4D_Vehicle"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 4, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4D_Living"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 8, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4D_Object"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 16, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4D_Goal"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 32, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4D_Environment"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 128, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4D_Rule"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 64, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4D_Background"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 4096, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4D_Parallax"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 8192, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4D_MouseSelect"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 16384, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4D_Foreground"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 32768, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4D_MouseIgnore"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 65536, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4D_IgnoreFoW"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 131072, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4D_GrabGet"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 2, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4D_GrabPut"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 1, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4D_Border_Sides"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 1, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4D_Border_Top"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 2, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4D_Border_Bottom"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 4, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4D_Border_Layer"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 8, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("COMD_None"), $o.ValType = 1 /*C4V_Int*/, $o.Data = -1, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("COMD_Stop"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 0, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("COMD_Up"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 1, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("COMD_UpRight"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 2, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("COMD_Right"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 3, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("COMD_DownRight"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 4, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("COMD_Down"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 5, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("COMD_DownLeft"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 6, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("COMD_Left"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 7, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("COMD_UpLeft"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 8, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("DIR_Left"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 0, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("DIR_Right"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 1, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("OCF_Construct"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 2, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("OCF_Grab"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 4, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("OCF_Collectible"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 8, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("OCF_OnFire"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 16, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("OCF_HitSpeed1"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 32, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("OCF_Fullcon"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 64, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("OCF_Inflammable"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 128, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("OCF_Rotate"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 512, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("OCF_Exclusive"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 1024, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("OCF_Entrance"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 2048, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("OCF_HitSpeed2"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 4096, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("OCF_HitSpeed3"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 8192, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("OCF_Collection"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 16384, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("OCF_HitSpeed4"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 65536, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("OCF_NotContained"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 262144, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("OCF_CrewMember"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 524288, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("OCF_InLiquid"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 0x100000, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("OCF_InSolid"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 0x200000, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("OCF_InFree"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 0x400000, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("OCF_Available"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 0x800000, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("OCF_Container"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 0x1000000, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("OCF_Alive"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 0x2000000, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("VIS_All"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 0, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("VIS_None"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 1, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("VIS_Owner"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 2, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("VIS_Allies"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 4, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("VIS_Enemies"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 8, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("VIS_Select"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 16, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("VIS_God"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 32, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("VIS_LayerToggle"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 64, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("VIS_OverlayOnly"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 128, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("VIS_Editor"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 256, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4MN_Style_Normal"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 0, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4MN_Style_Context"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 1, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4MN_Style_Info"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 2, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4MN_Style_Dialog"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 3, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4MN_Style_EqualItemHeight"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 128, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4MN_Extra_None"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 0, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4MN_Extra_Value"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 2, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4MN_Extra_Info"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 4, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4MN_Add_ImgRank"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 1, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4MN_Add_ImgIndexed"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 2, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4MN_Add_ImgObjRank"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 3, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4MN_Add_ImgObject"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 4, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4MN_Add_ImgTextSpec"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 5, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4MN_Add_ImgPropListSpec"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 7, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4MN_Add_ImgColor"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 6, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4MN_Add_PassValue"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 128, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4MN_Add_ForceCount"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 256, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4MN_Add_ForceNoDesc"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 512, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("GFXOV_MODE_None"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 0, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("GFXOV_MODE_Base"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 1, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("GFXOV_MODE_Action"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 2, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("GFXOV_MODE_Picture"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 3, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("GFXOV_MODE_IngamePicture"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 4, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("GFXOV_MODE_Object"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 5, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("GFXOV_MODE_ExtraGraphics"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 6, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("GFXOV_MODE_Rank"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 7, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("GFXOV_MODE_ObjectPicture"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 8, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("GFX_Overlay"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 1, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("GFXOV_Clothing"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 1000, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("GFXOV_Tools"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 2000, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("GFXOV_ProcessTarget"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 3000, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("GFXOV_Misc"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 5000, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("GFXOV_UI"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 6000, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("GFX_BLIT_Additive"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 1, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("GFX_BLIT_Mod2"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 2, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("GFX_BLIT_ClrSfc_OwnClr"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 4, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("GFX_BLIT_ClrSfc_Mod2"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 8, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("GFX_BLIT_Wireframe"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 16, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("GFX_BLIT_Custom"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 128, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("GFX_BLIT_Parent"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 256, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("CNAT_None"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 0, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("CNAT_Left"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 1, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("CNAT_Right"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 2, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("CNAT_Top"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 4, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("CNAT_Bottom"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 8, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("CNAT_Center"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 16, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("CNAT_MultiAttach"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 32, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("CNAT_NoCollision"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 64, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("CNAT_PhaseHalfVehicle"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 128, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("VTX_X"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 0, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("VTX_Y"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 1, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("VTX_CNAT"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 2, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("VTX_Friction"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 3, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("VTX_SetPermanent"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 1, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("VTX_SetPermanentUpd"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 2, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4OS_DELETED"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 0, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4OS_NORMAL"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 1, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4OS_INACTIVE"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 2, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4CMD_Base"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 1, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4CMD_SilentBase"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 2, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4CMD_Sub"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 3, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4CMD_SilentSub"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 0, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4CMD_MoveTo_NoPosAdjust"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 1, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4CMD_MoveTo_PushTarget"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 2, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4CMD_Enter_PushTarget"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 2, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4AVP_Const"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 0, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4AVP_Linear"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 1, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4AVP_X"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 2, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4AVP_Y"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 3, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4AVP_R"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 4, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4AVP_AbsX"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 5, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4AVP_AbsY"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 6, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4AVP_Dist"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 7, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4AVP_XDir"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 8, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4AVP_YDir"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 9, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4AVP_RDir"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 10, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4AVP_AbsRDir"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 11, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4AVP_CosR"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 12, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4AVP_SinR"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 13, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4AVP_CosV"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 14, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4AVP_SinV"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 15, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4AVP_Action"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 16, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("ANIM_Loop"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 0, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("ANIM_Hold"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 1, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("ANIM_Remove"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 2, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("AM_None"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 0, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("AM_DrawBefore"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 1, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("AM_MatchSkeleton"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 2, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = null, $o.ValType = 0 /*C4V_Nil*/, $o.Data = 0, $o))(new $.C4ScriptConstDef())),
]);
}

Object.assign($, { C4ValueToMatrix$C4ValueArray$pStdMeshMatrix, C4ValueToMatrix$rC4Value$pStdMeshMatrix, FnActIdle, FnAddCommand, FnAddMenuItem, FnAddVertex, FnAdjustWalkRotation, FnAppendCommand, FnAttachMesh, FnCanConcatPictureWith, FnChangeDef, FnCheckVisibility, FnClearMenuItems, FnCloseMenu, FnCollect, FnContained, FnContents, FnContentsCount, FnCreateContents, FnCreateMenu, FnCreateParticleAtBone, FnDeathAnnounce, FnDetachMesh, FnDoBreath, FnDoCon, FnDoCrewExp, FnDoDamage, FnDoEnergy, FnEnter, FnExecuteCommand, FnExit, FnFindContents, FnFindOtherContents, FnFinishCommand, FnFling, FnGetActTime, FnGetAction, FnGetActionTarget, FnGetAlive, FnGetAnimationLength, FnGetAnimationList, FnGetAnimationName, FnGetAnimationPosition, FnGetAnimationWeight, FnGetBoneNames, FnGetBreath, FnGetCategory, FnGetClrModulation, FnGetColor, FnGetComDir, FnGetCommand, FnGetCon, FnGetContact, FnGetController, FnGetCrewEnabled, FnGetCrewExtraData, FnGetDamage, FnGetDefBottom, FnGetDefHeight, FnGetDefWidth, FnGetDir, FnGetEnergy, FnGetEntrance, FnGetID, FnGetKiller, FnGetLightColor, FnGetMass, FnGetMenu, FnGetMenuSelection, FnGetMeshMaterial, FnGetOCF, FnGetObjectBlitMode, FnGetObjectLayer, FnGetObjectStatus, FnGetOwner, FnGetPhase, FnGetProcedure, FnGetR, FnGetRDir, FnGetRank, FnGetRootAnimation, FnGetUnusedOverlayID, FnGetValue, FnGetVertex, FnGetVertexNum, FnGetXDir, FnGetYDir, FnGrabContents, FnGrabObjectInfo, FnInLiquid, FnInsertVertex, FnJump, FnKill, FnMakeCrewMember, FnObjectDistance, FnObjectNumber, FnOnFire, FnPlayAnimation, FnPunch, FnRemoveObject, FnRemoveVertex, FnScrollContents, FnSelectMenuItem, FnSetAction, FnSetActionData, FnSetActionTargets, FnSetAlive, FnSetAnimationBoneTransform, FnSetAnimationPosition, FnSetAnimationWeight, FnSetAttachBones, FnSetAttachTransform, FnSetCategory, FnSetClrModulation, FnSetColor, FnSetComDir, FnSetCommand, FnSetContactDensity, FnSetController, FnSetCrewEnabled, FnSetCrewExtraData, FnSetCrewStatus, FnSetDir, FnSetEntrance, FnSetGraphics, FnSetHalfVehicleSolidMask, FnSetKiller, FnSetLightColor, FnSetLightRange, FnSetMass, FnSetMenuDecoration, FnSetMenuSize, FnSetMenuTextProgress, FnSetMeshMaterial, FnSetName, FnSetObjDrawTransform, FnSetObjDrawTransform2, FnSetObjectBlitMode, FnSetObjectLayer, FnSetObjectStatus, FnSetOwner, FnSetPhase, FnSetPicture, FnSetPosition, FnSetR, FnSetRDir, FnSetShape, FnSetSolidMask, FnSetTransferZone, FnSetVertex, FnSetXDir, FnSetYDir, FnShiftContents, FnShowInfo, FnStopAnimation, FnStuck, FnTransformBone, InitObjectFunctionMap });
