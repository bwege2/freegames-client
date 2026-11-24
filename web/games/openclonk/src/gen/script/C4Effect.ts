// @ts-nocheck
// OpenClonk 36de799: src/script/C4Effect.cpp, src/script/C4Effect.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { C4PropListNumbered } from './C4PropList.ts';
import { $oat, $oi, $rd, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, $iptr, $throw } from '../../rt/std.ts';

export class C4Effect extends C4PropListNumbered {
  iPriority = 0;
  iTime = 0;
  iInterval = 0;
  pNext = null;
  CommandTarget = new $.C4Value().init$v();
  Target = null;
  pFnTimer = null;
  pFnStart = null;
  pFnStop = null;
  pFnEffect = null;
  pFnDamage = null;

  AssignCallbackFunctions() {
    let p = this.GetCallbackScript();
    if (p == null) {
      return;
    }
    const fn = new Int8Array(101);
    $.ssprintf$2(fn, S("Fx%sStart"), this.GetName());
    this.pFnStart = p.GetFunc$pi8(P(fn, 0));
    $.ssprintf$2(fn, S("Fx%sStop"), this.GetName());
    this.pFnStop = p.GetFunc$pi8(P(fn, 0));
    $.ssprintf$2(fn, S("Fx%sTimer"), this.GetName());
    this.pFnTimer = p.GetFunc$pi8(P(fn, 0));
    $.ssprintf$2(fn, S("Fx%sEffect"), this.GetName());
    this.pFnEffect = p.GetFunc$pi8(P(fn, 0));
    $.ssprintf$2(fn, S("Fx%sDamage"), this.GetName());
    this.pFnDamage = p.GetFunc$pi8(P(fn, 0));
  }

  CallStart(temporary$, var1, var2, var3, var4) {
    const temporary = [temporary$];
    if (!(this.GetCallbackScript() != null)) {
      return this.Call$i32$pC4AulParSet$b(8 /*P_Start*/, new $.C4AulParSet().init$ri32$C4Value$C4Value$C4Value$C4Value(P(temporary, 0), var1, var2, var3, var4).op_and()).getInt();
    }
    if (this.pFnStart != null) {
      return this.pFnStart.Exec$pC4PropList$pC4AulParSet$b(this.GetCallbackScript(), new $.C4AulParSet().init$mpC4Object$mpC4Effect$ri32$C4Value$C4Value$C4Value$C4Value(Obj(this.Target), this, P(temporary, 0), var1, var2, var3, var4).op_and()).getInt();
    }
    return 0;
  }

  CallStop(reason$, temporary$) {
    const reason = [reason$];
    const temporary = [temporary$];
    if (!(this.GetCallbackScript() != null)) {
      return this.Call$i32$pC4AulParSet$b(9 /*P_Stop*/, new $.C4AulParSet().init$ri32$rb(P(reason, 0), P(temporary, 0)).op_and()).getInt();
    }
    if (this.pFnStop != null) {
      return this.pFnStop.Exec$pC4PropList$pC4AulParSet$b(this.GetCallbackScript(), new $.C4AulParSet().init$mpC4Object$mpC4Effect$ri32$rb(Obj(this.Target), this, P(reason, 0), P(temporary, 0)).op_and()).getInt();
    }
    return 0;
  }

  CallTimer(time$) {
    const time = [time$];
    try {
      if (!(this.GetCallbackScript() != null)) {
        return this.Call$i32$pC4AulParSet$b(10 /*P_Timer*/, new $.C4AulParSet().init$ri32(P(time, 0)).op_and(), true).getInt();
      }
      if (this.pFnTimer != null) {
        return this.pFnTimer.Exec$pC4PropList$pC4AulParSet$b(this.GetCallbackScript(), new $.C4AulParSet().init$mpC4Object$mpC4Effect$ri32(Obj(this.Target), this, P(time, 0)).op_and(), true).getInt();
      }
    } catch ($e1) {
      if ($e1 instanceof $.C4AulError) {
        const e = $e1;
        $.ScriptEngine.GetErrorHandler().OnError(e.what());
        $.DebugLogF(S(" Removing %s"), new $.C4Value().init$pC4Effect(this).GetDataString(3).getData());
      } else {
        throw $e1;
      }
    }
    return -1;
  }

  CallDamage(damage, damagetype$, plr$) {
    const damagetype = [damagetype$];
    const plr = [plr$];
    if (!(this.GetCallbackScript() != null)) {
      let pFn = this.GetFunc$i32(12 /*P_Damage*/);
      if (pFn != null) {
        damage.a[damage.o] = pFn.Exec$pC4PropList$pC4AulParSet$b(this, new $.C4AulParSet().init$ri32$ri32$ri32(damage, P(damagetype, 0), P(plr, 0)).op_and()).getInt();
      }
    } else if (this.pFnDamage != null) {
      damage.a[damage.o] = this.pFnDamage.Exec$pC4PropList$pC4AulParSet$b(this.GetCallbackScript(), new $.C4AulParSet().init$mpC4Object$mpC4Effect$ri32$ri32$ri32(Obj(this.Target), this, damage, P(damagetype, 0), P(plr, 0)).op_and()).getInt();
    }
  }

  CallEffect(effect, var1, var2, var3, var4) {
    if (!(this.GetCallbackScript() != null)) {
      return this.Call$i32$pC4AulParSet$b(11 /*P_Effect*/, new $.C4AulParSet().init$pi8$C4Value$C4Value$C4Value$C4Value(effect, var1, var2, var3, var4).op_and()).getInt();
    }
    if (this.pFnEffect != null) {
      return this.pFnEffect.Exec$pC4PropList$pC4AulParSet$b(this.GetCallbackScript(), new $.C4AulParSet().init$pi8$mpC4Object$mpC4Effect$C4Value$C4Value$C4Value$C4Value(effect, Obj(this.Target), this, var1, var2, var3, var4).op_and()).getInt();
    }
    return 0;
  }

  init$ppC4Effect$pC4String$i32$i32$pC4PropList(ppEffectList, szName, iPrio, iTimerInterval, pCmdTarget) {
    super.init();
    this.CommandTarget = new $.C4Value().init$v();
    this.iPriority = 0;
    this.iInterval = iTimerInterval;
    this.iTime = 0;
    this.CommandTarget.SetPropList(pCmdTarget);
    this.AcquireNumber();
    C4Effect.prototype.Register.call(this, ppEffectList, iPrio);
    this.SetProperty(1 /*P_Name*/, $.C4VString$pC4String(szName));
    return this;
  }

  init$ppC4Effect$pC4PropList$i32$i32(ppEffectList, prototype, iPrio, iTimerInterval) {
    super.init(prototype);
    this.CommandTarget = new $.C4Value().init$v();
    this.iPriority = 0;
    this.iInterval = iTimerInterval;
    this.iTime = 0;
    this.CommandTarget.Set0();
    this.AcquireNumber();
    C4Effect.prototype.Register.call(this, ppEffectList, iPrio);
    this.SetProperty(1 /*P_Name*/, $.C4VString$pi8(prototype.GetName()));
    return this;
  }

  init$v() {
    super.init();
    this.CommandTarget = new $.C4Value().init$v();
    this.iPriority = this.iTime = this.iInterval = 0;
    this.CommandTarget.Set0();
    this.pNext = null;
    return this;
  }

  Init$pC4PropList$i32$C4Value$C4Value$C4Value$C4Value(pForObj, iPrio, rVal1, rVal2, rVal3, rVal4) {
    this.Target = pForObj;
    let fRemoveUpper = iPrio !== 1;
    if (fRemoveUpper && this.pNext != null) {
      let pEffect2 = this.pNext.Check(this.GetName(), iPrio, this.iInterval, rVal1, rVal2, rVal3, rVal4);
      if (pEffect2 != null) {
        if (pEffect2 !== $iptr(-1) && pEffect2 !== $iptr(-2)) {
          return pEffect2;
        }
        return null;
      }
    }
    const pLastRemovedEffect = [null];
    let pFn = null;
    if (!(this.GetCallbackScript() != null)) {
      this.Call$i32$pC4AulParSet$b(6 /*P_Construction*/, new $.C4AulParSet().init$C4Value$C4Value$C4Value$C4Value(rVal1, rVal2, rVal3, rVal4).op_and()).getInt();
      if (pForObj != null && pForObj.Status === 0) {
        return null;
      }
      pFn = this.GetFunc$i32(8 /*P_Start*/);
    } else {
      pFn = this.pFnStart;
    }
    if (fRemoveUpper && this.pNext != null && pFn != null) {
      this.TempRemoveUpperEffects(false, P(pLastRemovedEffect, 0));
    }
    if (pForObj != null && pForObj.Status === 0) {
      return null;
    }
    this.iPriority = iPrio;
    if (this.CallStart(0, rVal1, rVal2, rVal3, rVal4) === -1) {
      this.SetDead();
    }
    if (fRemoveUpper && this.pNext != null && pFn != null) {
      this.TempReaddUpperEffects(pLastRemovedEffect[0]);
    }
    if (pForObj != null && pForObj.Status === 0) {
      return null;
    }
    if (!this.IsDead() && pForObj != null && $.WildcardMatch(S("*Fire*"), this.GetName())) {
      pForObj.SetOnFire(true);
    }
    return this;
  }

  static New$pC4PropList$ppC4Effect$pC4String$i32$i32$pC4PropList$C4Value$C4Value$C4Value$C4Value(pForObj, ppEffectList, szName, iPrio, iTimerInterval, pCmdTarget, rVal1, rVal2, rVal3, rVal4) {
    let pEffect = new C4Effect().init$ppC4Effect$pC4String$i32$i32$pC4PropList(ppEffectList, szName, iPrio, iTimerInterval, pCmdTarget);
    return pEffect.Init$pC4PropList$i32$C4Value$C4Value$C4Value$C4Value(pForObj, iPrio, rVal1, rVal2, rVal3, rVal4);
  }

  static New$pC4PropList$ppC4Effect$pC4PropList$i32$i32$C4Value$C4Value$C4Value$C4Value(pForObj, ppEffectList, prototype, iPrio, iTimerInterval, rVal1, rVal2, rVal3, rVal4) {
    let pEffect = new C4Effect().init$ppC4Effect$pC4PropList$i32$i32(ppEffectList, prototype, iPrio, iTimerInterval);
    return pEffect.Init$pC4PropList$i32$C4Value$C4Value$C4Value$C4Value(pForObj, iPrio, rVal1, rVal2, rVal3, rVal4);
  }

  $dtor() {
    let pEffect = null;
    while ((pEffect = this.pNext) != null) {
      this.pNext = pEffect.pNext;
      pEffect.pNext = null;
      $delete(pEffect);
    }
    super.$dtor();
  }

  Register(ppEffectList, iPrio) {
    let pCheck = null;
    let pPrev = ppEffectList.a[ppEffectList.o];
    if (pPrev != null && $.Abs$i32(pPrev.iPriority) < iPrio) {
      while ((pCheck = pPrev.pNext) != null) {
        if ($.Abs$i32(pCheck.iPriority) >= iPrio) {
          break;
        } else {
          pPrev = pCheck;
        }
      }
      this.pNext = pPrev.pNext;
      pPrev.pNext = this;
    } else {
      this.pNext = ppEffectList.a[ppEffectList.o];
      ppEffectList.a[ppEffectList.o] = this;
    }
  }

  Denumerate(numbers) {
    let pEff = this;
    do {
      pEff.CommandTarget.Denumerate(numbers);
      pEff.AssignCallbackFunctions();
      $.C4PropList.prototype.Denumerate.call(pEff, numbers);
    } while ((pEff = pEff.pNext) != null);
  }

  ClearPointers$pC4PropList(pObj) {
    let pEff = this;
    do {
      if (pEff.CommandTarget.getPropList() === pObj) {
        pEff.SetDead();
        pEff.CommandTarget.Set0();
      }
    } while ((pEff = pEff.pNext) != null);
  }

  SetDead() {
    this.iPriority = 0;
  }

  IsDead() {
    return this.iPriority === 0;
  }

  FlipActive() {
    this.iPriority = Math.imul(this.iPriority, -1);
  }

  IsActive() {
    return this.iPriority > 0;
  }

  IsInactiveAndNotDead() {
    return this.iPriority < 0;
  }

  Get(szName, iIndex = 0, iMaxPriority = 0) {
    let $t1;
    if (szName == null) {
      return null;
    }
    let pEff = this;
    do {
      if (pEff.IsDead()) {
        continue;
      }
      if (iMaxPriority !== 0 && pEff.iPriority > iMaxPriority) {
        continue;
      }
      let szEffectName = pEff.GetName();
      if (!$.SWildcardMatchEx(szEffectName, szName)) {
        continue;
      }
      if (($t1 = iIndex, iIndex = iIndex - 1 | 0, $t1) !== 0) {
        continue;
      }
      return pEff;
    } while ((pEff = pEff.pNext) != null);
    return null;
  }

  GetCount(szMask, iMaxPriority = 0) {
    let iCnt = 0;
    let pEff = this;
    do {
      if (!pEff.IsDead()) {
        if (szMask == null || $.SWildcardMatchEx(pEff.GetName(), szMask)) {
          if (iMaxPriority === 0 || pEff.iPriority <= iMaxPriority) {
            iCnt = iCnt + 1 | 0;
          }
        }
      }
    } while ((pEff = pEff.pNext) != null);
    return iCnt;
  }

  Check(szCheckEffect, iPrio, iTimer, rVal1, rVal2, rVal3, rVal4) {
    if (iPrio === 1) {
      return null;
    }
    let pAddToEffect = null;
    let fDoTempCallsForAdd = false;
    const pLastRemovedEffect = [null];
    for (let pCheck = this; pCheck != null; pCheck = pCheck.pNext) {
      if (!pCheck.IsDead() && pCheck.iPriority >= iPrio) {
        let iResult = pCheck.CallEffect(szCheckEffect, rVal1, rVal2, rVal3, rVal4);
        if (iResult === -1) {
          return $iptr(-1);
        }
        if (iResult === -2 || iResult === -3) {
          pAddToEffect = pCheck;
          fDoTempCallsForAdd = iResult === -3;
        }
      }
    }
    if (pAddToEffect != null) {
      if (pAddToEffect.pNext != null && fDoTempCallsForAdd) {
        pAddToEffect.TempRemoveUpperEffects(false, P(pLastRemovedEffect, 0));
      }
      let Par1 = $.C4VString$pi8(szCheckEffect);
      let Par2 = $.C4VInt(iTimer);
      let Par8 = new $.C4Value().init$v();
      let iResult = pAddToEffect.DoCall(this.Target, S("Add"), Par1, Par2, rVal1, rVal2, rVal3, rVal4, Par8).getInt();
      if (pAddToEffect.pNext != null && fDoTempCallsForAdd) {
        pAddToEffect.TempReaddUpperEffects(pLastRemovedEffect[0]);
      }
      if (iResult === -1) {
        pAddToEffect.Kill();
        return $iptr(-2);
      } else {
        return pAddToEffect;
      }
    }
    return null;
  }

  GetCallbackScript() {
    return this.CommandTarget._getPropList();
  }

  static Execute$ppC4Effect(ppEffectList) {
    for (let pEffect = ppEffectList.a[ppEffectList.o]; pEffect != null; pEffect = pEffect.pNext) {
      pEffect.iTime = pEffect.iTime + 1 | 0;
    }
    let pEffect = ppEffectList.a[ppEffectList.o];
    let ppPrevEffect = ppEffectList;
    while (pEffect != null) {
      if (pEffect.IsDead()) {
        let pNextEffect = pEffect.pNext;
        pEffect.pNext = null;
        $delete(pEffect);
        ppPrevEffect.a[ppPrevEffect.o] = pEffect = pNextEffect;
      } else {
        if (pEffect.iInterval !== 0 && pEffect.iTime % pEffect.iInterval === 0 && pEffect.iTime !== 0) {
          if (pEffect.CallTimer(pEffect.iTime) === -1) {
            if (pEffect.Target != null && pEffect.Target.Status === 0) {
              return;
            }
            pEffect.Kill();
          }
          if (pEffect.Target != null && pEffect.Target.Status === 0) {
            return;
          }
        }
        ppPrevEffect = P(pEffect, "pNext");
        pEffect = pEffect.pNext;
      }
    }
  }

  Kill() {
    const pLastRemovedEffect = [null];
    if (this.IsActive()) {
      this.TempRemoveUpperEffects(false, P(pLastRemovedEffect, 0));
    } else if (this.iPriority !== 1) {
      this.CallStart(2, new $.C4Value().init$v(), new $.C4Value().init$v(), new $.C4Value().init$v(), new $.C4Value().init$v());
    }
    let iPrevPrio = this.iPriority;
    this.SetDead();
    if (this.CallStop(0, false) === -1) {
      this.iPriority = iPrevPrio;
    }
    this.TempReaddUpperEffects(pLastRemovedEffect[0]);
    if (this.Target != null && $.WildcardMatch(S("*Fire*"), this.GetName())) {
      if (!(this.Get(S("*Fire*")) != null)) {
        this.Target.SetOnFire(false);
      }
    }
    if (this.IsDead() && !(this.GetCallbackScript() != null)) {
      this.Call$i32$pC4AulParSet$b(7 /*P_Destruction*/, new $.C4AulParSet().init$mi32(0).op_and());
    }
  }

  ClearAll(iClearFlag$) {
    const iClearFlag = [iClearFlag$];
    if (this.pNext != null) {
      this.pNext.ClearAll(iClearFlag[0]);
    }
    if (this.Target != null && this.Target.Status === 0 || this.IsDead()) {
      return;
    }
    let iPrevPrio = this.iPriority;
    this.SetDead();
    if (this.CallStop(iClearFlag[0], false) === -1) {
      if (this.Target != null && this.Target.Status === 0) {
        return;
      }
      this.iPriority = iPrevPrio;
    }
    if (this.Target != null && $.WildcardMatch(S("*Fire*"), this.GetName()) && this.IsDead()) {
      if (!(this.Get(S("*Fire*")) != null)) {
        this.Target.SetOnFire(false);
      }
    }
    if (this.IsDead() && !(this.GetCallbackScript() != null)) {
      this.Call$i32$pC4AulParSet$b(7 /*P_Destruction*/, new $.C4AulParSet().init$ri32(P(iClearFlag, 0)).op_and());
    }
  }

  DoDamage$ri32$i32$i32(riDamage, iDamageType, iCausePlr) {
    let pEff = this;
    do {
      if (!pEff.IsDead()) {
        pEff.CallDamage(riDamage, iDamageType, iCausePlr);
      }
      if (this.Target != null && this.Target.Status === 0) {
        return;
      }
    } while ((pEff = pEff.pNext) != null && riDamage.a[riDamage.o] !== 0);
  }

  DoCall(pObj, szFn, rVal1, rVal2, rVal3, rVal4, rVal5, rVal6, rVal7) {
    let p = this.GetCallbackScript();
    if (p == null) {
      let fn = this.GetFunc$pi8(szFn);
      if (fn != null) {
        return fn.Exec$pC4PropList$pC4AulParSet$b(this, new $.C4AulParSet().init$C4Value$C4Value$C4Value$C4Value$C4Value$C4Value$C4Value(rVal1, rVal2, rVal3, rVal4, rVal5, rVal6, rVal7).op_and());
      }
    } else {
      let fn = p.GetFunc$pi8($.FormatString(S("Fx%s%s"), this.GetName(), szFn).getData());
      if (fn != null) {
        return fn.Exec$pC4PropList$pC4AulParSet$b(p, new $.C4AulParSet().init$mpC4Object$mpC4Effect$C4Value$C4Value$C4Value$C4Value$C4Value$C4Value$C4Value(Obj(pObj), this, rVal1, rVal2, rVal3, rVal4, rVal5, rVal6, rVal7).op_and());
      }
    }
    return new $.C4Value().init$v();
  }

  ReAssignCallbackFunctions() {
    this.AssignCallbackFunctions();
  }

  ReAssignAllCallbackFunctions() {
    this.ReAssignCallbackFunctions();
    if (this.pNext != null) {
      this.pNext.ReAssignAllCallbackFunctions();
    }
  }

  OnObjectChangedDef(pObj) {
    if (pObj == null) {
      return;
    }
    let pCheck = this;
    while (pCheck != null) {
      if (pCheck.GetCallbackScript() === pObj) {
        pCheck.ReAssignCallbackFunctions();
      }
      pCheck = pCheck.pNext;
    }
  }

  CompileFunc$pStdCompiler$pC4PropList$pC4ValueNumbers(pComp, Owner$, numbers$) {
    const Owner = [Owner$];
    const numbers = [numbers$];
    if (pComp.isDeserializer()) {
      this.Target = Owner[0];
    }
    pComp.Separator(7 /*SEP_START*/);
    pComp.Value$ri32(P(this, "iPriority"));
    pComp.Separator();
    pComp.Value$ri32(P(this, "iTime"));
    pComp.Separator();
    pComp.Value$ri32(P(this, "iInterval"));
    pComp.Separator();
    const nptr = [0];
    if (!pComp.isDeserializer() && this.CommandTarget.getPropList() != null && this.CommandTarget._getPropList().GetPropListNumbered() != null) {
      nptr[0] = this.CommandTarget._getPropList().GetPropListNumbered().Number;
    }
    pComp.Value$ri32(P(nptr, 0));
    if (pComp.isDeserializer()) {
      this.CommandTarget.SetObjectEnum(nptr[0]);
    }
    pComp.Separator();
    if (pComp.isSerializer()) {
      let p = this.CommandTarget.getPropList() != null ? this.CommandTarget._getPropList().IsStatic$v() : null;
      if (p != null) {
        p.RefCompileFunc(pComp, numbers[0]);
      } else {
        pComp.String$pi8$u64$i32(S("None"), 5, 4 /*RCT_ID*/);
      }
    } else {
      let s = new $.StdStrBuf();
      pComp.Value$StdParameterAdapt$StdStrBuf$i32$2($.mkParAdapt$rStdStrBuf$mi32(s, 4 /*RCT_ID*/));
      if (nptr[0] === 0) {
        if (!$.ScriptEngine.GetGlobalConstant(s.getData(), this.CommandTarget)) {
          this.CommandTarget.Set0();
        }
      }
    }
    pComp.Separator();
    $.C4PropListNumbered.prototype.CompileFunc$pStdCompiler$pC4ValueNumbers.call(this, pComp, numbers[0]);
    pComp.Separator(8 /*SEP_END*/);
    const fNext = [!(this.pNext == null)];
    if (pComp.hasNaming()) {
      if (fNext[0] || pComp.isDeserializer()) {
        fNext[0] = pComp.Separator();
      }
    } else {
      pComp.Value$rb(P(fNext, 0));
    }
    if (!fNext[0]) {
      return;
    }
    pComp.Value$StdParameter2Adapt$StdPtrAdapt$C4Effect$pC4PropList$pC4ValueNumbers$2($.mkParAdapt$mStdPtrAdapt$C4Effect$rpC4PropList$rpC4ValueNumbers($.mkPtrAdaptNoNull$rpC4Effect(P(this, "pNext")), P(Owner, 0), P(numbers, 0)));
  }

  GetEffect() {
    return this;
  }

  SetPropertyByS(k, to) {
    if ($oi(k) >= $oi($oat($.Strings.P, 0)) && $oi(k) < $oi($oat($.Strings.P, 249 /*P_LAST*/))) {
      switch (k.$i - $oat($.Strings.P, 0).$i) {
        case 1:
          if (!(to.getStr() != null) || !($rd(to.getStr().GetCStr()) !== 0)) {
            $throw(new $.C4AulExecError().init(S("effect: Name has to be a nonempty string")));
          }
          $.C4PropList.prototype.SetPropertyByS.call(this, k, to);
          this.ReAssignCallbackFunctions();
          return;
        case 2:
          $throw(new $.C4AulExecError().init(S("effect: Priority is readonly")));
        case 3:
          this.iInterval = to.getInt();
          return;
        case 4:
          $throw(new $.C4AulExecError().init(S("effect: CommandTarget is readonly")));
        case 94:
          $throw(new $.C4AulExecError().init(S("effect: Target is readonly")));
        case 5:
          this.iTime = to.getInt();
          return;
        case 0:
          $throw(new $.C4AulExecError().init(S("effect: Prototype is readonly")));
      }
    }
    $.C4PropList.prototype.SetPropertyByS.call(this, k, to);
  }

  ResetProperty(k) {
    if ($oi(k) >= $oi($oat($.Strings.P, 0)) && $oi(k) < $oi($oat($.Strings.P, 249 /*P_LAST*/))) {
      switch (k.$i - $oat($.Strings.P, 0).$i) {
        case 1:
          $throw(new $.C4AulExecError().init(S("effect: Name has to be a nonempty string")));
        case 2:
          $throw(new $.C4AulExecError().init(S("effect: Priority is readonly")));
        case 3:
          this.iInterval = 0;
          return;
        case 4:
          $throw(new $.C4AulExecError().init(S("effect: CommandTarget is readonly")));
        case 94:
          $throw(new $.C4AulExecError().init(S("effect: Target is readonly")));
        case 5:
          this.iTime = 0;
          return;
        case 0:
          $throw(new $.C4AulExecError().init(S("effect: Prototype is readonly")));
      }
    }
    $.C4PropList.prototype.ResetProperty.call(this, k);
  }

  GetPropertyByS(k, pResult) {
    if ($oi(k) >= $oi($oat($.Strings.P, 0)) && $oi(k) < $oi($oat($.Strings.P, 249 /*P_LAST*/))) {
      switch (k.$i - $oat($.Strings.P, 0).$i) {
        case 1:
          return $.C4PropList.prototype.GetPropertyByS.call(this, k, pResult);
        case 2:
          pResult.$assign($.C4VInt($.Abs$i32(this.iPriority)));
          return true;
        case 3:
          pResult.$assign($.C4VInt(this.iInterval));
          return true;
        case 4:
          pResult.$assign(this.CommandTarget);
          return true;
        case 94:
          pResult.$assign(new $.C4Value().init$pC4PropList(this.Target));
          return true;
        case 5:
          pResult.$assign($.C4VInt(this.iTime));
          return true;
      }
    }
    return $.C4PropList.prototype.GetPropertyByS.call(this, k, pResult);
  }

  GetProperties() {
    let $t1, $t2, $t3, $t4, $t5, $t6;
    let a = $.C4PropList.prototype.GetProperties.call(this);
    let i = 0;
    i = a.GetSize();
    a.SetSize(i + 5 | 0);
    a.op_index$i32(($t1 = i, i = i + 1 | 0, $t1)).$assign($.C4VString$pC4String($oat($.Strings.P, 1 /*P_Name*/)));
    a.op_index$i32(($t2 = i, i = i + 1 | 0, $t2)).$assign($.C4VString$pC4String($oat($.Strings.P, 2 /*P_Priority*/)));
    a.op_index$i32(($t3 = i, i = i + 1 | 0, $t3)).$assign($.C4VString$pC4String($oat($.Strings.P, 3 /*P_Interval*/)));
    a.op_index$i32(($t4 = i, i = i + 1 | 0, $t4)).$assign($.C4VString$pC4String($oat($.Strings.P, 4 /*P_CommandTarget*/)));
    a.op_index$i32(($t5 = i, i = i + 1 | 0, $t5)).$assign($.C4VString$pC4String($oat($.Strings.P, 94 /*P_Target*/)));
    a.op_index$i32(($t6 = i, i = i + 1 | 0, $t6)).$assign($.C4VString$pC4String($oat($.Strings.P, 5 /*P_Time*/)));
    return a;
  }

  TempRemoveUpperEffects(fTempRemoveThis, ppLastRemovedEffect) {
    if (this.Target != null && this.Target.Status === 0) {
      return;
    }
    if (this.iPriority === 1) {
      return;
    }
    let pEff = this.pNext;
    while (pEff != null) {
      if (pEff.IsActive()) {
        break;
      } else {
        pEff = pEff.pNext;
      }
    }
    if (pEff != null) {
      pEff.TempRemoveUpperEffects(true, ppLastRemovedEffect);
    }
    if (fTempRemoveThis) {
      this.FlipActive();
      if (this.Target != null && $.WildcardMatch(S("*Fire*"), this.GetName())) {
        if (!(this.Get(S("*Fire*")) != null)) {
          this.Target.SetOnFire(false);
        }
      }
      if (this.iPriority !== 1) {
        this.CallStop(1, true);
      }
      if (ppLastRemovedEffect.a[ppLastRemovedEffect.o] == null) {
        ppLastRemovedEffect.a[ppLastRemovedEffect.o] = this;
      }
    }
  }

  TempReaddUpperEffects(pLastReaddEffect) {
    if (pLastReaddEffect == null) {
      return;
    }
    if (this.Target != null && this.Target.Status === 0) {
      return;
    }
    for (let pEff = this.pNext; pEff != null; pEff = pEff.pNext) {
      if (pEff.IsInactiveAndNotDead()) {
        pEff.FlipActive();
        if (pEff.iPriority !== 1) {
          pEff.CallStart(1, new $.C4Value().init$v(), new $.C4Value().init$v(), new $.C4Value().init$v(), new $.C4Value().init$v());
        }
        if (this.Target != null && $.WildcardMatch(S("*Fire*"), pEff.GetName())) {
          this.Target.SetOnFire(true);
        }
      }
      if (pEff === pLastReaddEffect) {
        break;
      }
    }
  }

  $clone() { return new C4Effect().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.iPriority = o.iPriority;
    this.iTime = o.iTime;
    this.iInterval = o.iInterval;
    this.pNext = o.pNext;
    this.CommandTarget.$assign(o.CommandTarget);
    this.Target = o.Target;
    this.pFnTimer = o.pFnTimer;
    this.pFnStart = o.pFnStart;
    this.pFnStop = o.pFnStop;
    this.pFnEffect = o.pFnEffect;
    this.pFnDamage = o.pFnDamage;
    return this;
  }
}

function Obj(p) {
  return p != null ? p.GetObject$v() : null;
}

export function $init(): void {
}

Object.assign($, { C4Effect, Obj });
