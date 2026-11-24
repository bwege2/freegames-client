// @ts-nocheck
// OpenClonk 36de799: src/object/C4Command.cpp, src/object/C4Command.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { Random } from '../../rt/native.ts';
import { $oarr, $oat, $rd, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, $fn, $max, $maxBy, $min } from '../../rt/std.ts';

export class C4Command {
  cObj = null;
  Command = 0;
  Tx = new $.C4Value().init$v();
  Ty = 0;
  Target = new $.C4ObjectPtr().init$v();
  Target2 = new $.C4ObjectPtr().init$v();
  Data = new $.C4Value().init$v();
  UpdateInterval = 0;
  Evaluated = 0;
  PathChecked = 0;
  Finished = 0;
  Failures = 0;
  Retries = 0;
  Permit = 0;
  Text = null;
  Next = null;
  iExec = 0;
  BaseMode = 0;

  init() {
    this.Tx = new $.C4Value().init$v();
    this.Target = new $.C4ObjectPtr().init$v();
    this.Target2 = new $.C4ObjectPtr().init$v();
    this.Data = new $.C4Value().init$v();
    C4Command.prototype.Default.call(this);
    return this;
  }

  $dtor() {
    C4Command.prototype.Clear.call(this);
  }

  Set(iCommand, pObj, pTarget, nTx, iTy, pTarget2, iData, iUpdateInterval, fEvaluated, iRetries, szText, iBaseMode) {
    this.Clear();
    this.Default();
    this.Command = iCommand;
    this.cObj = pObj;
    this.Target.op_assign(pTarget);
    this.Tx.$assign(nTx);
    this.Ty = iTy;
    if (this.Command !== 23 && !this.Tx.CheckConversion(1 /*C4V_Int*/)) {
      this.Tx.SetInt(0);
    }
    this.Target2.op_assign(pTarget2);
    this.Data.$assign(iData);
    this.UpdateInterval = iUpdateInterval;
    this.Evaluated = fEvaluated ? 1 : 0;
    this.Retries = iRetries;
    this.Text = szText;
    if (this.Text != null) {
      this.Text.IncRef();
    }
    this.BaseMode = iBaseMode;
  }

  Clear() {
    this.Command = 0;
    this.cObj = null;
    this.Evaluated = 0;
    this.PathChecked = 0;
    this.Tx.$assign($.C4VNull);
    this.Ty = 0;
    this.Target.$assign(this.Target2.op_assign(null));
    this.UpdateInterval = 0;
    if (this.Text != null) {
      this.Text.DecRef();
    }
    this.Text = null;
    this.BaseMode = 0;
  }

  Execute() {
    if (this.Finished !== 0) {
      return;
    }
    if (this.cObj == null) {
      this.Finish();
      return;
    }
    if (this.Failures !== 0) {
      if (this.Retries > 0) {
        this.Failures = 0;
        this.Retries = this.Retries - 1 | 0;
        this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(21, null, 0, 0, 10);
        return;
      } else {
        this.Finish();
        return;
      }
    }
    if (this.UpdateInterval > 0) {
      this.UpdateInterval = this.UpdateInterval - 1 | 0;
      if (this.UpdateInterval === 0) {
        this.Finish(true);
        return;
      }
    }
    if (this.InitEvaluation()) {
      return;
    }
    this.iExec = 1;
    switch (this.Command) {
      case 1:
        this.Follow();
        break;
      case 2:
        this.MoveTo();
        break;
      case 3:
        this.Enter();
        break;
      case 4:
        this.Exit();
        break;
      case 5:
        this.Grab();
        break;
      case 7:
        this.UnGrab();
        break;
      case 6:
        this.Throw();
        break;
      case 8:
        this.Jump();
        break;
      case 9:
        this.Wait();
        break;
      case 10:
        this.Get();
        break;
      case 11:
        this.Put();
        break;
      case 12:
        this.Drop();
        break;
      case 13:
        this.Dig();
        break;
      case 14:
        this.Activate();
        break;
      case 15:
        this.PushTo();
        break;
      case 16:
        this.Transfer();
        break;
      case 17:
        this.Attack();
        break;
      case 18:
        this.Buy();
        break;
      case 19:
        this.Sell();
        break;
      case 20:
        this.Acquire();
        break;
      case 21:
        this.Retry();
        break;
      case 22:
        this.Home();
        break;
      case 23:
        this.Call();
        break;
      case 24:
        this.Take();
        break;
      case 25:
        this.Take2();
        break;
      default:
        this.Finish();
        break;
    }
    if (this.iExec > 1) {
      $delete(this);
    } else {
      this.iExec = 0;
    }
  }

  ClearPointers(pObj) {
    if (this.cObj === pObj) {
      this.cObj = null;
    }
    if (this.Target.op_eq$pC4Object(pObj)) {
      this.Target.op_assign(null);
    }
    if (this.Target2.op_eq$pC4Object(pObj)) {
      this.Target2.op_assign(null);
    }
  }

  Default() {
    this.Command = 0;
    this.cObj = null;
    this.Evaluated = 0;
    this.PathChecked = 0;
    this.Finished = 0;
    this.Tx.$assign($.C4VNull);
    this.Ty = 0;
    this.Target.$assign(this.Target2.op_assign(null));
    this.Data.Set0();
    this.UpdateInterval = 0;
    this.Failures = 0;
    this.Retries = 0;
    this.Permit = 0;
    this.Text = null;
    this.Next = null;
    this.iExec = 0;
    this.BaseMode = 0;
  }

  Denumerate(numbers) {
    this.Target.DenumeratePointers();
    this.Target2.DenumeratePointers();
    this.Tx.Denumerate(numbers);
  }

  CompileFunc(pComp, numbers$) {
    const numbers = [numbers$];
    const iVersion = [0];
    if (pComp.Separator(12 /*SEP_DOLLAR*/)) {
      iVersion[0] = 1;
      pComp.Value$StdIntPackAdapt$i32($.mkIntPackAdapt$ri32(P(iVersion, 0)));
      pComp.Separator(1 /*SEP_SEP*/);
    } else {
      pComp.NoSeparator();
    }
    pComp.Value$StdEnumAdapt$i32$u8$9($.mkEnumAdaptT$9(P(this, "Command"), $oat($.EnumAdaptCommandEntries, 0)));
    pComp.Separator(1 /*SEP_SEP*/);
    pComp.Value$StdParameterAdapt$C4Value$pC4ValueNumbers($.mkParAdapt$rC4Value$rpC4ValueNumbers(this.Tx, P(numbers, 0)));
    pComp.Separator(1 /*SEP_SEP*/);
    pComp.Value$StdIntPackAdapt$i32($.mkIntPackAdapt$ri32(P(this, "Ty")));
    pComp.Separator(1 /*SEP_SEP*/);
    pComp.Value$rC4ObjectPtr(this.Target);
    pComp.Separator(1 /*SEP_SEP*/);
    pComp.Value$rC4ObjectPtr(this.Target2);
    pComp.Separator(1 /*SEP_SEP*/);
    pComp.Value$StdParameterAdapt$C4Value$pC4ValueNumbers($.mkParAdapt$rC4Value$rpC4ValueNumbers(this.Data, P(numbers, 0)));
    pComp.Separator(1 /*SEP_SEP*/);
    pComp.Value$StdIntPackAdapt$i32($.mkIntPackAdapt$ri32(P(this, "UpdateInterval")));
    pComp.Separator(1 /*SEP_SEP*/);
    pComp.Value$StdIntPackAdapt$i32($.mkIntPackAdapt$ri32(P(this, "Evaluated")));
    pComp.Separator(1 /*SEP_SEP*/);
    pComp.Value$StdIntPackAdapt$i32($.mkIntPackAdapt$ri32(P(this, "PathChecked")));
    pComp.Separator(1 /*SEP_SEP*/);
    pComp.Value$StdIntPackAdapt$i32($.mkIntPackAdapt$ri32(P(this, "Finished")));
    pComp.Separator(1 /*SEP_SEP*/);
    pComp.Value$StdIntPackAdapt$i32($.mkIntPackAdapt$ri32(P(this, "Failures")));
    pComp.Separator(1 /*SEP_SEP*/);
    pComp.Value$StdIntPackAdapt$i32($.mkIntPackAdapt$ri32(P(this, "Retries")));
    pComp.Separator(1 /*SEP_SEP*/);
    pComp.Value$StdIntPackAdapt$i32($.mkIntPackAdapt$ri32(P(this, "Permit")));
    pComp.Separator(1 /*SEP_SEP*/);
    if (iVersion[0] > 0) {
      pComp.Value$StdIntPackAdapt$i32($.mkIntPackAdapt$ri32(P(this, "BaseMode")));
      pComp.Separator(1 /*SEP_SEP*/);
    }
    let TextBuf = new $.StdStrBuf();
    if (pComp.isSerializer()) {
      if (this.Text != null) {
        TextBuf.Ref$StdStrBuf(this.Text.GetData());
      } else {
        TextBuf.Ref$pi8(S("0"));
      }
    }
    pComp.Value$StdParameterAdapt$StdStrBuf$i32$2($.mkParAdapt$rStdStrBuf$mi32(TextBuf, 1 /*RCT_All*/));
    if (pComp.isDeserializer()) {
      if (this.Text != null) {
        this.Text.DecRef();
      }
      if (TextBuf.op_eq$pi8(S("0"))) {
        this.Text = null;
      } else {
        this.Text = $.Strings.RegString$StdStrBuf(new $.StdStrBuf().init$rStdStrBuf$b(TextBuf));
        this.Text.IncRef();
      }
    }
  }

  Call() {
    if (this.Text == null || !(this.Text.GetCStr() != null) || !($rd(this.Text.GetCStr(), 0) !== 0)) {
      this.Finish();
      return;
    }
    if (this.Target.op_not()) {
      this.Finish();
      return;
    }
    this.Finish(true);
    this.Target.op_arrow().Call$pi8$pC4AulParSet$b(this.Text.GetCStr(), new $.C4AulParSet().init$rpC4Object$rC4Value$ri32$rC4ObjectPtr(P(this, "cObj"), this.Tx, P(this, "Ty"), this.Target2).op_and());
  }

  Home() {
    this.Finish();
  }

  Retry() {
  }

  Fail(szFailMessage = null) {
    let pBase = null;
    for (pBase = this.Next; pBase != null; pBase = pBase.Next) {
      if (pBase.Finished === 0) {
        break;
      }
    }
    let ExecFail = false;
    switch (this.BaseMode) {
      case 0:
        {
          if (pBase != null) {
            pBase.Failures = pBase.Failures + 1 | 0;
            return;
          } else {
            ExecFail = true;
          }
          break;
        }
      case 3:
        {
          if (pBase != null) {
            pBase.Failures = pBase.Failures + 1 | 0;
          }
          if (pBase == null || pBase.Retries === 0) {
            ExecFail = true;
          }
          break;
        }
      case 1:
        {
          ExecFail = true;
          break;
        }
    }
    const szCommandName = new Int8Array(25);
    const szObjectName = new Int8Array(31);
    let str = new $.StdStrBuf();
    if (ExecFail && this.cObj != null && (this.cObj.OCF & 524288) >>> 0 !== 0) {
      if (szFailMessage != null) {
        $.StdStrBuf.prototype.op_assign$pi8.call(str, szFailMessage);
      }
      let l_Obj = this.cObj;
      switch (this.Command) {
        case 23:
          {
            let l_Command = this.Command;
            if (this.CallFailed() !== 0) {
              return;
            }
            $.SCopy$pi8$pi8($.LoadResStr(CommandNameID(l_Command)), P(szCommandName, 0));
            str.Format($.LoadResStr(S("IDS_CON_FAILURE")), P(szCommandName, 0));
            break;
          }
        case 4:
          break;
        case 13:
          break;
        case 20:
          if (szFailMessage != null) {
            break;
          }
          $.SCopy$pi8$pi8($.LoadResStr(CommandNameID(this.Command)), P(szCommandName, 0));
          let pDef = null;
          pDef = this.Data.getDef();
          $.SCopy$pi8$pi8(pDef != null ? pDef.GetName() : $.LoadResStr(S("IDS_OBJ_UNKNOWN")), P(szObjectName, 0));
          str.Format($.LoadResStr(S("IDS_CON_FAILUREOF")), P(szCommandName, 0), P(szObjectName, 0));
          break;
        default:
          if (szFailMessage != null) {
            break;
          }
          $.SCopy$pi8$pi8($.LoadResStr(CommandNameID(this.Command)), P(szCommandName, 0));
          str.Format($.LoadResStr(S("IDS_CON_FAILURE")), P(szCommandName, 0));
          break;
      }
      if (l_Obj != null) {
        if (l_Obj.Status !== 0 && l_Obj.Def.SilentCommands === 0) {
          if (!str.op_not()) {
            $.Messages.Append(3, str.getData(), l_Obj, -1, 0, 0, 0xffffffff, true);
          }
          l_Obj.Action.ComDir = 0;
          let pars = new $.C4AulParSet().init$mC4Value$mC4Value$rC4Value$mC4Value$mC4Value$rC4Value($.C4VString$pi8(CommandName(this.Command)), $.C4VObj(this.Target.op_C4Object_()), this.Tx, $.C4VInt(this.Ty), $.C4VObj(this.Target2.op_C4Object_()), this.Data);
          l_Obj.Call$pi8$pC4AulParSet$b(S("~CommandFailure"), pars.op_and());
        }
      }
    }
  }

  Acquire() {
    if (this.Data.op_not()) {
      this.Finish();
      return;
    }
    if (this.cObj.Contents.Find(this.Data.getDef()) != null) {
      this.Finish(true);
      return;
    }
    let scriptresult = this.cObj.Call$pi8$pC4AulParSet$b(S("~ControlCommandAcquire"), new $.C4AulParSet().init$rC4ObjectPtr$rC4Value$ri32$rC4ObjectPtr$rC4Value(this.Target, this.Tx, P(this, "Ty"), this.Target2, this.Data).op_and()).getInt();
    if (this.cObj.Status === 0) {
      return;
    }
    if (1 === scriptresult) {
      return;
    }
    if (2 === scriptresult) {
      this.Finish(true);
      return;
    }
    if (3 === scriptresult) {
      this.Finish();
      return;
    }
    let pMaterial = null;
    while ((pMaterial = $.Game.FindObject(this.Data.getDef(), this.cObj.GetX(), this.cObj.GetY(), -1, -1, 0x800000, pMaterial)) != null) {
      if (this.Target2.op_not() || pMaterial.Contained.op_ne$C4ObjectPtr(this.Target2)) {
        if ($.Inside$i32$i32$i32$3(this.cObj.GetX() - pMaterial.GetX() | 0, -this.Tx._getInt() | 0, this.Tx._getInt())) {
          if ($.Inside$i32$i32$i32$3(this.cObj.GetY() - pMaterial.GetY() | 0, -this.Ty | 0, this.Ty)) {
            if ((pMaterial.OCF & 64) >>> 0 !== 0) {
              if (!pMaterial.GetOnFire()) {
                break;
              }
            }
          }
        }
      }
    }
    if (pMaterial != null) {
      this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(10, pMaterial, 0, 0, 40);
      return;
    }
    this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(18, null, 0, 0, 100, null, true, new $.C4Value().$copy(this.Data), false, 0, null, 3);
  }

  Sell() {
    this.Finish();
  }

  Buy() {
    this.Finish();
  }

  Attack() {
    let $t1, $t2, $t3;
    if (this.Target.op_not()) {
      this.Finish();
      return;
    }
    if ((this.Target.op_arrow().OCF & 524288) >>> 0 !== 0) {
      $t1 = this.cObj.Contents;
      $t2 = $t1.begin();
      $t3 = $t1.end();
      try {
        for (; $t2.op_ne($t3); $t2.op_inc$v()) {
          const pProjectile = $t2.op_mul();
          if (pProjectile.Def.Projectile !== 0) {
            this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(6, pProjectile, this.Target.op_arrow().GetX(), this.Target.op_arrow().GetY(), 2);
            return;
          }
        }
      } finally { $t2.$dtor(); $t3.$dtor(); }
      if (this.cObj.Contained.op_ne$C4ObjectPtr(this.Target.op_arrow().Contained)) {
        if (this.cObj.Contained.op_C4Object_() != null) {
          this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(4, null, 0, 0, 10);
        } else {
          this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(3, this.Target.op_arrow().Contained.op_C4Object_(), 0, 0, 10);
        }
        return;
      }
      this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(2, null, this.Target.op_arrow().GetX(), this.Target.op_arrow().GetY(), 10);
      return;
    } else {
      this.Finish(true);
      return;
    }
  }

  Transfer() {
    if (this.Target.op_not()) {
      this.Finish();
      return;
    }
    let pZone = null;
    const iEntryX = [0];
    const iEntryY = [0];
    if (!((pZone = $.Game.TransferZones.Find$pC4Object(this.Target.op_C4Object_())) != null)) {
      this.Finish();
      return;
    }
    if (!$.Inside$i32$i32$i32$3(this.cObj.GetX() - pZone.X | 0, -5, (pZone.Wdt - 1 | 0) + 5 | 0)) {
      if (!pZone.GetEntryPoint(P(iEntryX, 0), P(iEntryY, 0), this.cObj.GetX(), this.cObj.GetY())) {
        this.Finish();
        return;
      }
      this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(2, null, iEntryX[0], iEntryY[0], 25);
      return;
    }
    if ($.Game.iTick5 === 0) {
      if (!this.Target.op_arrow().Call$pi8$pC4AulParSet$b(S("~ControlTransfer"), new $.C4AulParSet().init$rpC4Object$rC4Value$ri32(P(this, "cObj"), this.Tx, P(this, "Ty")).op_and()).getBool()) {
        this.Finish(true);
        return;
      }
    }
  }

  Finish(fSuccess = false, szFailMessage = null) {
    this.Finished = 1;
    if (!fSuccess) {
      this.Fail(szFailMessage);
    } else {
      let iExpGain = this.GetExpGain();
      if (iExpGain !== 0 && this.cObj != null) {
        if (this.cObj.Info != null) {
          for (let i = iExpGain; i !== 0; i = i - 1 | 0) {
            if (!((this.cObj.Info.ControlCount = this.cObj.Info.ControlCount + 1 | 0) % 5 !== 0)) {
              this.cObj.DoExperience(1);
            }
          }
        }
      }
    }
  }

  Follow() {
    if (this.Target.op_not()) {
      this.Finish();
      return;
    }
    if (this.cObj.Contained.op_ne$C4ObjectPtr(this.Target.op_arrow().Contained)) {
      if (this.cObj.Def.CrewMember === 0) {
        this.Finish();
        return;
      }
      if (this.cObj.Contained.op_C4Object_() != null) {
        this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(4, null, 0, 0, 50);
      } else {
        this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(3, this.Target.op_arrow().Contained.op_C4Object_(), 0, 0, 50);
      }
      return;
    }
    if (this.Target.op_arrow().GetProcedure() === 243) {
      if (this.cObj.GetProcedure() === 243) {
        if (this.cObj.Action.Target.op_eq$C4ObjectPtr(this.Target.op_arrow().Action.Target)) {
          this.cObj.Action.ComDir = this.Target.op_arrow().Action.ComDir;
          return;
        }
      }
      this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(5, this.Target.op_arrow().Action.Target.op_C4Object_());
      return;
    } else if (this.cObj.GetProcedure() === 243) {
      this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(7);
      return;
    }
    if ($.Inside$i32$i32$i32$3(this.cObj.GetX() - this.Target.op_arrow().GetX() | 0, -6, 6) && $.Inside$i32$i32$i32$3(this.cObj.GetY() - this.Target.op_arrow().GetY() | 0, -6, 6)) {
      this.cObj.Action.ComDir = this.Target.op_arrow().Action.ComDir;
    } else {
      this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(2, null, this.Target.op_arrow().GetX(), this.Target.op_arrow().GetY(), 10);
    }
  }

  MoveTo() {
    let iMoveToRange = 5;
    if (this.cObj.Def.MoveToRange > 0) {
      iMoveToRange = this.cObj.Def.MoveToRange;
    }
    let cx = 0;
    let cy = 0;
    cx = this.cObj.GetX();
    cy = this.cObj.GetY();
    let fWaypoint = false;
    if (this.Next != null && this.Next.Command === 2) {
      fWaypoint = true;
    }
    if (this.cObj.Contained.op_C4Object_() != null) {
      this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(4, null, 0, 0, 50);
      return;
    }
    if ((this.cObj.OCF & 524288) >>> 0 !== 0 || this.cObj.Def.Pathfinder !== 0) {
      if (this.PathChecked === 0) {
        if ($.Distance(cx, cy, this.Tx._getInt(), this.Ty) < 1000) {
          if (!($.Inside$i32$i32$i32$3(cx - this.Tx._getInt() | 0, -20, 20) && $.Inside$i32$i32$i32$3(cy - this.Ty | 0, -20, 20))) {
            if (!$.PathFree$i32$i32$i32$i32(cx, cy, this.Tx._getInt(), this.Ty)) {
              $.Game.PathFinder.EnableTransferZones(this.cObj.Def.NoTransferZones === 0);
              $.Game.PathFinder.SetLevel(this.cObj.Def.Pathfinder);
              if (!$.Game.PathFinder.Find(this.cObj.GetX(), this.cObj.GetY(), this.Tx._getInt(), this.Ty, $fn(new ObjectAddWaypoint().init(this.cObj)))) {
                this.PathChecked = 1;
              }
              return;
            } else {
              this.PathChecked = 1;
            }
          }
        }
      }
    }
    if ($.Game.iTick35 === 0) {
      this.PathChecked = 0;
    }
    if (this.cObj.GetProcedure() === 243) {
      if (this.cObj.Action.Target.op_C4Object_() != null) {
        if (this.cObj.Action.Target.op_arrow().GetPropertyInt(14 /*P_Touchable*/) === 2 || !((this.Data.getInt() & 2) !== 0)) {
          this.Evaluated = 0;
          this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(7, null, 0, 0, 50);
          return;
        }
      }
    }
    switch (this.cObj.GetProcedure()) {
      case 243:
      case 248:
        if (!fWaypoint) {
          if (this.cObj.Action.Target.op_C4Object_() != null) {
            cx = this.cObj.Action.Target.op_arrow().GetX();
            cy = this.cObj.Action.Target.op_arrow().GetY();
          }
        }
        break;
      case 240:
        $.ObjectComStop(this.cObj);
        break;
    }
    let iTargetRange = iMoveToRange;
    let iRangeFactorTop = 1;
    let iRangeFactorBottom = 1;
    let iRangeFactorSide = 1;
    if ((this.cObj.OCF & 524288) >>> 0 !== 0) {
      iTargetRange = this.cObj.Shape.Wdt / 2 | 0;
      if (fWaypoint) {
        if (this.cObj.GetProcedure() !== 238) {
          iRangeFactorTop = 3;
          iRangeFactorSide = 3;
          iRangeFactorBottom = 2;
        }
      }
    }
    if ($.Inside$i32$i32$i32$3(cx - this.Tx._getInt() | 0, Math.imul(-iRangeFactorSide | 0, iTargetRange), Math.imul(iRangeFactorSide, iTargetRange)) && $.Inside$i32$i32$i32$3(cy - this.Ty | 0, Math.imul(-iRangeFactorBottom | 0, iTargetRange), Math.imul(iRangeFactorTop, iTargetRange))) {
      this.cObj.Action.ComDir = 0;
      this.Finish(true);
      return;
    }
    if (!(this.cObj.GetAction() != null)) {
      this.Finish();
      return;
    }
    switch (this.cObj.GetProcedure()) {
      case 235:
        if (cx < (this.Tx._getInt() - iTargetRange | 0)) {
          this.cObj.Action.ComDir = 3;
        }
        if (cx > (this.Tx._getInt() + iTargetRange | 0)) {
          this.cObj.Action.ComDir = 7;
        }
        if (this.FlightControl()) {
          return;
        }
        if (this.JumpControl()) {
          return;
        }
        break;
      case 243:
      case 248:
        if (cx < (this.Tx._getInt() - iTargetRange | 0)) {
          this.cObj.Action.ComDir = 3;
        }
        if (cx > (this.Tx._getInt() + iTargetRange | 0)) {
          this.cObj.Action.ComDir = 7;
        }
        break;
      case 238:
        if (cy > (this.Ty + iTargetRange | 0)) {
          this.cObj.Action.ComDir = 1;
        }
        if (cy < (this.Ty - iTargetRange | 0)) {
          this.cObj.Action.ComDir = 5;
        }
        if (this.cObj.Action.Dir === 0) {
          if (this.Tx._getInt() > (cx + 7 | 0) && $.Inside$i32$i32$i32$3(cy - this.Ty | 0, -30, 30)) {
            $.ObjectComLetGo(this.cObj, 1);
            return;
          }
          if (this.cObj.Action.Time > 2) {
            if (this.cObj.t_contact !== 0) {
              $.ObjectComLetGo(this.cObj, 1);
              return;
            }
          }
        }
        if (this.cObj.Action.Dir === 1) {
          if (this.Tx._getInt() < (cx - 7 | 0) && $.Inside$i32$i32$i32$3(cy - this.Ty | 0, -30, 30)) {
            $.ObjectComLetGo(this.cObj, -1);
            return;
          }
          if (this.cObj.Action.Time > 2) {
            if (this.cObj.t_contact !== 0) {
              $.ObjectComLetGo(this.cObj, -1);
              return;
            }
          }
        }
        break;
      case 241:
        if ($.Game.iTick2 !== 0) {
          if (cx < (this.Tx._getInt() - iTargetRange | 0)) {
            this.cObj.Action.ComDir = 3;
          }
          if (cx > (this.Tx._getInt() + iTargetRange | 0)) {
            this.cObj.Action.ComDir = 7;
          }
        } else {
          if (cy < this.Ty) {
            this.cObj.Action.ComDir = 5;
          }
          if (cy > this.Ty) {
            this.cObj.Action.ComDir = 1;
          }
        }
        break;
      case 239:
        if (cx < (this.Tx._getInt() - iTargetRange | 0)) {
          this.cObj.Action.ComDir = 3;
        }
        if (cx > (this.Tx._getInt() + iTargetRange | 0)) {
          this.cObj.Action.ComDir = 7;
        }
        if ($.Abs$i32($.Angle(cx, cy, this.Tx._getInt(), this.Ty)) > 110) {
          $.ObjectComLetGo(this.cObj, 0);
        }
        break;
      case 245:
        {
          let dx = $.itofix$i32(this.Tx._getInt()).op_sub$C4Fixed(this.cObj.fix_x);
          let dy = $.itofix$i32(this.Ty).op_sub$C4Fixed(this.cObj.fix_y);
          let dScale = $.C4REAL100(this.cObj.GetAction().GetPropertyInt(24 /*P_Speed*/)).op_div$C4Fixed($maxBy($.Abs$C4Fixed(dx.$clone()), $.Abs$C4Fixed(dy.$clone()), (x, y) => x.op_lt$C4Fixed(y)));
          dx.op_mulAssign$C4Fixed(dScale);
          dy.op_mulAssign$C4Fixed(dScale);
          dx.op_subAssign$C4Fixed(this.cObj.xdir);
          dy.op_subAssign$C4Fixed(this.cObj.ydir);
          if ($.Abs$C4Fixed(dx.$clone()).op_add$C4Fixed($.Abs$C4Fixed(dy.$clone())).op_lt$C4Fixed($.C4REAL100(20))) {
            this.cObj.Action.ComDir = 0;
          } else if ($.Abs$C4Fixed(dy.$clone()).op_mul$i32(3).op_lt$C4Fixed(dx)) {
            this.cObj.Action.ComDir = 3;
          } else if ($.Abs$C4Fixed(dy.$clone()).op_mul$i32(3).op_lt$C4Fixed(dx.op_neg())) {
            this.cObj.Action.ComDir = 7;
          } else if ($.Abs$C4Fixed(dx.$clone()).op_mul$i32(3).op_lt$C4Fixed(dy)) {
            this.cObj.Action.ComDir = 5;
          } else if ($.Abs$C4Fixed(dx.$clone()).op_mul$i32(3).op_lt$C4Fixed(dy.op_neg())) {
            this.cObj.Action.ComDir = 1;
          } else if (dx.op_gt$i32(0) && dy.op_gt$i32(0)) {
            this.cObj.Action.ComDir = 4;
          } else if (dx.op_lt$i32(0) && dy.op_gt$i32(0)) {
            this.cObj.Action.ComDir = 6;
          } else if (dx.op_gt$i32(0) && dy.op_lt$i32(0)) {
            this.cObj.Action.ComDir = 2;
          } else {
            this.cObj.Action.ComDir = 8;
          }
        }
        break;
      case 236:
        if (cx < (this.Tx._getInt() - iTargetRange | 0)) {
          this.cObj.Action.ComDir = 3;
        }
        if (cx > (this.Tx._getInt() + iTargetRange | 0)) {
          this.cObj.Action.ComDir = 7;
        }
        if (this.FlightControl()) {
          return;
        }
        break;
    }
  }

  Enter() {
    const ocf = [0];
    if (this.Target.op_not() || this.cObj.Def.NoPushEnter !== 0) {
      this.Finish();
      return;
    }
    if (this.cObj.Contained.op_eq$C4ObjectPtr(this.Target)) {
      this.Finish(true);
      return;
    }
    if (this.cObj.GetProcedure() === 240) {
      $.ObjectComStop(this.cObj);
    }
    if (this.cObj.GetProcedure() === 243) {
      if (this.cObj.Action.Target.op_C4Object_() != null) {
        if (this.cObj.Action.Target.op_arrow().GetPropertyInt(14 /*P_Touchable*/) === 2 || !((this.Data.getInt() & 2) !== 0)) {
          this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(7, null, 0, 0, 50);
          return;
        }
      }
    }
    if (this.cObj.GetProcedure() === 243) {
      if (this.cObj.Action.Target.op_eq$C4ObjectPtr(this.Target)) {
        this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(7, null, 0, 0, 50);
        return;
      }
    }
    let cx = 0;
    let cy = 0;
    cx = this.cObj.GetX();
    cy = this.cObj.GetY();
    if (this.cObj.GetProcedure() === 243) {
      if (this.cObj.Action.Target.op_C4Object_() != null) {
        cx = this.cObj.Action.Target.op_arrow().GetX();
        cy = this.cObj.Action.Target.op_arrow().GetY();
      }
    }
    ocf[0] = 2048;
    if (this.cObj.Contained.op_not() && this.Target.op_arrow().At$i32$i32$ru32(cx, cy, P(ocf, 0)) && (ocf[0] & 2048) >>> 0 !== 0) {
      this.cObj.Action.ComDir = 0;
      if (this.cObj.GetProcedure() === 243 && this.cObj.Action.Target.op_C4Object_() != null) {
        this.cObj.Action.Target.op_arrow().SetCommand$i32$pC4Object$i32$i32$pC4Object$b$C4Value$i32$pC4String(3, this.Target.op_C4Object_());
        this.Finish(true);
        return;
      } else {
        if ((this.Target.op_arrow().EntranceStatus ? 1 : 0) !== 0) {
          this.cObj.Enter(this.Target.op_C4Object_());
          this.Finish(true);
          return;
        } else {
          this.Target.op_arrow().ActivateEntrance(this.cObj.Controller, this.cObj);
        }
      }
    } else {
      const ex = [0];
      const ey = [0];
      const ewdt = [0];
      const ehgt = [0];
      if (this.Target.op_arrow().GetEntranceArea(P(ex, 0), P(ey, 0), P(ewdt, 0), P(ehgt, 0)) !== 0) {
        this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(2, null, ex[0] + (ewdt[0] / 2 | 0) | 0, ey[0] + (ehgt[0] / 2 | 0) | 0, 50, null, true, $.C4VInt((this.Data.getInt() & 2) !== 0 ? 2 : 0));
      }
    }
  }

  Exit() {
    if (this.cObj.Contained.op_not()) {
      this.Finish(true);
      return;
    }
    if (this.cObj.Contained.op_arrow().EntranceStatus) {
      if (this.cObj.Contained.op_arrow().Contained.op_C4Object_() != null) {
        this.cObj.Enter(this.cObj.Contained.op_arrow().Contained.op_C4Object_());
        this.Finish(true);
        return;
      }
      const ex = [0];
      const ey = [0];
      const ewdt = [0];
      const ehgt = [0];
      if ((this.cObj.Contained.op_arrow().OCF & 2048) >>> 0 !== 0) {
        if (this.cObj.Contained.op_arrow().GetEntranceArea(P(ex, 0), P(ey, 0), P(ewdt, 0), P(ehgt, 0)) !== 0) {
          this.cObj.Exit(ex[0] + (ewdt[0] / 2 | 0) | 0, ((ey[0] + ehgt[0] | 0) + this.cObj.Shape.GetY() | 0) - 1 | 0);
          this.Finish(true);
          return;
        }
      }
      if (this.cObj.GetPropertyInt(13 /*P_Collectible*/) !== 0) {
        if (this.cObj.Contained.op_arrow().Def.Collection.Wdt !== 0) {
          this.cObj.Exit(this.cObj.Contained.op_arrow().GetX(), (this.cObj.Contained.op_arrow().GetY() + this.cObj.Contained.op_arrow().Def.Collection.y | 0) - 1 | 0);
          $.ObjectComJump(this.cObj);
          this.Finish(true);
          return;
        }
      }
      this.cObj.Exit(this.cObj.GetX(), this.cObj.GetY());
      this.Finish(true);
      return;
    } else {
      if (!this.cObj.Contained.op_arrow().ActivateEntrance(this.cObj.Controller, this.cObj)) {
        this.Finish();
        return;
      }
    }
  }

  Grab() {
    const ocf = [0];
    if (this.cObj.GetProcedure() === 243) {
      if (this.cObj.Action.Target.op_eq$C4ObjectPtr(this.Target)) {
        this.Finish(true);
        return;
      }
    }
    if (this.cObj.GetProcedure() === 240) {
      $.ObjectComStop(this.cObj);
    }
    if (this.cObj.GetProcedure() === 243) {
      this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(7, null, 0, 0, 50);
      return;
    }
    if (this.Target.op_not()) {
      this.Finish();
      return;
    }
    ocf[0] = 0xffffffff;
    if (this.cObj.Contained.op_not() && this.Target.op_arrow().At$i32$i32$ru32(this.cObj.GetX(), this.cObj.GetY(), P(ocf, 0))) {
      if (this.cObj.GetProcedure() === 238 || this.cObj.GetProcedure() === 239) {
        $.ObjectComLetGo(this.cObj, this.cObj.Action.Dir === 0 ? 1 : -1);
      }
      this.cObj.Action.ComDir = 0;
      $.ObjectComGrab(this.cObj, this.Target.op_C4Object_());
    } else {
      this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(2, null, this.Target.op_arrow().GetX() + this.Tx._getInt() | 0, this.Target.op_arrow().GetY() + this.Ty | 0, 50);
    }
  }

  UnGrab() {
    $.ObjectComUnGrab(this.cObj);
    this.cObj.Action.ComDir = 0;
    this.Finish(true);
  }

  Throw() {
    if (this.cObj.GetProcedure() === 240) {
      $.ObjectComStop(this.cObj);
    }
    if (this.Target.op_C4Object_() != null) {
      if (!(this.cObj.Contents.GetLink$pC4Object(this.Target.op_C4Object_()) != null)) {
        this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(10, this.Target.op_C4Object_(), 0, 0, 40);
        return;
      }
    }
    let iMoveToRange = 5;
    if (this.cObj.Def.MoveToRange > 0) {
      iMoveToRange = this.cObj.Def.MoveToRange;
    }
    if (this.Tx._getInt() !== 0 || this.Ty !== 0) {
      if (this.cObj.GetProcedure() === 243) {
        this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(7, null, 0, 0, 50);
        return;
      }
      let iDir = 1;
      if (this.cObj.GetX() > this.Tx._getInt()) {
        iDir = -1;
      }
      const iTx = [0];
      const iTy = [0];
      let pthrow = $.C4REAL100(this.cObj.GetPropertyInt(73 /*P_ThrowSpeed*/));
      let iHeight = this.cObj.Shape.Hgt;
      if (!$.FindThrowingPosition(this.Tx._getInt(), this.Ty, pthrow.op_mul$i32(iDir), pthrow.op_neg(), iHeight, P(iTx, 0), P(iTy, 0))) {
        if (!$.FindThrowingPosition(this.Tx._getInt(), this.Ty, pthrow.op_mul$i32(iDir).op_mul$i32(-1), pthrow.op_neg(), iHeight, P(iTx, 0), P(iTy, 0))) {
          this.Finish();
          return;
        }
      }
      if ($.Inside$i32$i32$i32$3(this.cObj.GetX() - iTx[0] | 0, -iMoveToRange | 0, iMoveToRange) && $.Inside$i32$i32$i32$3(this.cObj.GetY() - iTy[0] | 0, -15, 15)) {
        if (this.cObj.GetX() < this.Tx._getInt()) {
          this.cObj.SetDir(1);
        } else {
          this.cObj.SetDir(0);
        }
        this.cObj.Action.ComDir = 0;
        if ($.ObjectComThrow(this.cObj, this.Target.op_C4Object_())) {
          this.Finish(true);
        }
        return;
      }
      this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(2, null, iTx[0], iTy[0], 20);
      return;
    }
    if (this.cObj.Contained.op_C4Object_() != null) {
      $.ObjectComPutTake(this.cObj, this.cObj.Contained.op_C4Object_(), this.Target.op_C4Object_());
      this.Finish(true);
      return;
    }
    if (this.cObj.GetProcedure() === 243) {
      if (this.cObj.Action.Target.op_C4Object_() != null) {
        $.ObjectComPutTake(this.cObj, this.cObj.Action.Target.op_C4Object_(), this.Target.op_C4Object_());
      }
      this.Finish(true);
      return;
    }
    $.ObjectComThrow(this.cObj, this.Target.op_C4Object_());
    this.Finish(true);
  }

  Jump() {
    if (this.cObj.GetProcedure() === 236) {
      if (this.Tx._getInt() !== 0) {
        if (this.cObj.GetX() < this.Tx._getInt()) {
          this.cObj.Action.ComDir = 3;
        } else if (this.cObj.GetX() > this.Tx._getInt()) {
          this.cObj.Action.ComDir = 7;
        } else {
          this.cObj.Action.ComDir = 0;
        }
      }
    } else {
      this.cObj.Action.ComDir = 0;
      this.Finish(true);
      return;
    }
  }

  Wait() {
    if (this.cObj.GetProcedure() === 240) {
      $.ObjectComStop(this.cObj);
    }
  }

  Take() {
    $.ObjectComTake(this.cObj);
    this.Finish(true);
  }

  Take2() {
    $.ObjectComTake2(this.cObj);
    this.Finish(true);
  }

  GetTryEnter() {
    if (this.Target.op_arrow().Contained.op_C4Object_() != null && !this.Target.op_arrow().Contained.op_arrow().Call$pi8$pC4AulParSet$b(S("~RejectContents")).op_not()) {
      this.Finish();
      return false;
    }
    let fWasContained = !this.Target.op_arrow().Contained.op_not();
    const fRejectCollect = [false];
    let fSuccess = !!this.Target.op_arrow().Enter(this.cObj, true, true, P(fRejectCollect, 0));
    if (this.Target.op_not()) {
      this.Finish(true);
      return true;
    }
    if (fRejectCollect[0]) {
      if (this.cObj.PutAwayUnusedObject(this.Target.op_C4Object_())) {
        return false;
      }
      this.Finish();
      return false;
    }
    if (!fSuccess) {
      this.Finish();
      return false;
    }
    if (fWasContained) {
      this.cObj.Call$pi8$pC4AulParSet$b(S("~Get"), new $.C4AulParSet().init$rC4ObjectPtr(this.Target).op_and());
    }
    return true;
  }

  Get() {
    if ((this.Data.getInt() === 1 || this.Data.getInt() === 2) && this.Target.op_C4Object_() != null) {
      this.cObj.ActivateMenu((this.Data.getInt() === 1 ? 13 /*C4MN_Get*/ : 18 /*C4MN_Contents*/) | 0, 0, 0, 0, this.Target.op_C4Object_());
      this.Finish(true);
      return;
    }
    if (this.Target.op_not() && this.Target2.op_C4Object_() != null && this.Data.op_const_void_() != null) {
      if (this.Target.op_assign(this.Target2.op_arrow().Contents.Find(this.Data.getDef())).op_not()) {
        this.Finish();
        return;
      }
    }
    if (this.Target.op_not()) {
      this.Finish();
      return;
    }
    if (!((this.Target.op_arrow().OCF & 8) >>> 0 !== 0)) {
      this.Finish();
      return;
    }
    if (this.Target.op_arrow().Contained.op_eq$pC4Object(this.cObj)) {
      if (this.Tx._getInt() > 1) {
        this.Target.op_assign(null);
        this.Tx.op_dec$i32(0);
        return;
      } else {
        this.cObj.Action.ComDir = 0;
        this.Finish(true);
        return;
      }
    }
    if (this.cObj.GetProcedure() === 243) {
      if (this.cObj.Action.Target.op_ne$C4ObjectPtr(this.Target.op_arrow().Contained)) {
        this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(7, null, 0, 0, 50);
        return;
      }
    }
    if (this.Target.op_arrow().Contained.op_not() && (this.Target.op_arrow().OCF & 0x200000) >>> 0 !== 0) {
      const iX = [this.Target.op_arrow().GetX()];
      const iY = [this.Target.op_arrow().GetY()];
      if (!$.FindClosestFree(P(iX, 0), P(iY, 0), -120, 120, -1, -1)) {
        this.Finish();
        return;
      }
      const iX2 = [this.Target.op_arrow().GetX()];
      const iY2 = [this.Target.op_arrow().GetY()];
      if ($.FindClosestFree(P(iX2, 0), P(iY2, 0), -140, 140, -40, 40)) {
        if ($.Distance(this.Target.op_arrow().GetX(), this.Target.op_arrow().GetY(), iX2[0], iY2[0]) < Math.imul(10, $.Distance(this.Target.op_arrow().GetX(), this.Target.op_arrow().GetY(), iX[0], iY[0]))) {
          iX[0] = iX2[0];
          iY[0] = iY2[0];
        }
      }
      if (!$.Inside$i32$i32$i32$3(this.cObj.GetX() - iX[0] | 0, -15, 15) || !$.Inside$i32$i32$i32$3(this.cObj.GetY() - iY[0] | 0, -15, 15)) {
        this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(2, null, iX[0], iY[0], 50);
        return;
      }
      this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(13, null, this.Target.op_arrow().GetX(), this.Target.op_arrow().GetY() + 4 | 0, 50);
      return;
    }
    if (this.cObj.GetProcedure() === 240) {
      $.ObjectComStop(this.cObj);
    }
    if (this.Target.op_arrow().Contained.op_C4Object_() != null) {
      if (this.Target.op_arrow().Def.NoGet !== 0) {
        return;
      }
      if (this.cObj.Contained.op_eq$C4ObjectPtr(this.Target.op_arrow().Contained)) {
        this.GetTryEnter();
        return;
      }
      if (this.cObj.Contained.op_C4Object_() != null) {
        this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(4, null, 0, 0, 50);
        return;
      }
      if ((this.Target.op_arrow().Contained.op_arrow().Def.GrabPutGet & 2) !== 0) {
        if (this.cObj.GetProcedure() === 243 && this.cObj.Action.Target.op_eq$C4ObjectPtr(this.Target.op_arrow().Contained)) {
          this.GetTryEnter();
          return;
        }
        this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(5, this.Target.op_arrow().Contained.op_C4Object_(), 0, 0, 50);
        return;
      }
      if ((this.Target.op_arrow().Contained.op_arrow().OCF & 2048) >>> 0 !== 0) {
        this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(3, this.Target.op_arrow().Contained.op_C4Object_(), 0, 0, 50);
        return;
      }
      this.Finish();
      return;
    }
    if (this.cObj.Contained.op_C4Object_() != null) {
      this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(4, null, 0, 0, 50);
      return;
    }
    if (this.cObj.Contained.op_not()) {
      const ocf = [16385];
      if (this.cObj.At$i32$i32$ru32(this.Target.op_arrow().GetX(), this.Target.op_arrow().GetY(), P(ocf, 0))) {
        this.cObj.Action.ComDir = 0;
        if (this.GetTryEnter()) {
          return;
        }
      } else {
        if ($.Inside$i32$i32$i32$3(this.cObj.GetX() - this.Target.op_arrow().GetX() | 0, -10, 10)) {
          if ($.Inside$i32$i32$i32$3(this.cObj.GetY() - this.Target.op_arrow().GetY() | 0, 30, 50)) {
            let iSideX = 1;
            if (Random(2) !== 0) {
              iSideX = -1;
            }
            iSideX = this.cObj.GetX() + Math.imul(iSideX, this.cObj.GetY() - this.Target.op_arrow().GetY() | 0) | 0;
            if ($.PathFree$i32$i32$i32$i32(iSideX, this.cObj.GetY(), this.Target.op_arrow().GetX(), this.Target.op_arrow().GetY())) {
              this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(8, null, this.Tx._getInt(), this.Ty);
              this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(2, null, iSideX, this.cObj.GetY(), 50);
            }
          }
        }
        this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(2, null, ((this.Target.op_arrow().GetX() >>> 0) + Random(15) >>> 0) - 7 >>> 0 | 0, this.Target.op_arrow().GetY(), 25, null);
      }
    }
  }

  Put() {
    if (this.Target.op_not()) {
      this.Finish();
      return;
    }
    if (this.Target2.op_not() && this.Data.op_const_void_() != null) {
      if (this.Target2.op_assign(this.cObj.Contents.Find(this.Data.getDef())).op_not()) {
        this.Finish();
        return;
      }
    }
    if (this.Target2.op_not()) {
      if (this.Target2.op_assign(this.cObj.Contents.GetObject()).op_not()) {
        this.Finish(true);
        return;
      }
    }
    if (this.Target2.op_arrow().Contained.op_eq$C4ObjectPtr(this.Target)) {
      if (this.Tx._getInt() > 1) {
        this.Target2.op_assign(null);
        this.Tx.op_dec$i32(0);
        return;
      } else {
        this.Finish(true);
        return;
      }
    }
    if (!(this.cObj.Contents.GetLink$pC4Object(this.Target2.op_C4Object_()) != null)) {
      if (this.Target2.op_arrow().Contained.op_not()) {
        if ($.Distance(this.cObj.GetX(), this.cObj.GetY(), this.Target2.op_arrow().GetX(), this.Target2.op_arrow().GetY()) < 80) {
          if ((this.Target2.op_arrow().OCF & 32) >>> 0 !== 0) {
            return;
          }
        }
      }
      this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(10, this.Target2.op_C4Object_(), 0, 0, 40);
      return;
    }
    if (this.Target.op_arrow().Contained.op_C4Object_() != null) {
      this.Finish();
      return;
    }
    if (this.cObj.GetProcedure() === 240) {
      $.ObjectComStop(this.cObj);
    }
    let pGrabbing = null;
    if (this.cObj.GetProcedure() === 243) {
      pGrabbing = this.cObj.Action.Target.op_C4Object_();
    }
    if (pGrabbing != null && pGrabbing !== this.Target.op_C4Object_()) {
      this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(7, null, 0, 0, 50);
      return;
    }
    if (this.cObj.Contained.op_eq$C4ObjectPtr(this.Target)) {
      if (!$.ObjectComPut(this.cObj, this.Target.op_C4Object_(), this.Target2.op_C4Object_())) {
        this.Finish();
      }
      return;
    }
    if (this.cObj.Contained.op_C4Object_() != null) {
      this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(4, null, 0, 0, 50);
      return;
    }
    if ((this.Target.op_arrow().OCF & 16384) >>> 0 !== 0) {
      if (!(this.Target2.op_arrow().Def.Fragile !== 0)) {
        if (pGrabbing !== this.Target.op_C4Object_()) {
          let iTx = (this.Target.op_arrow().GetX() + this.Target.op_arrow().Def.Collection.x | 0) + (this.Target.op_arrow().Def.Collection.Wdt / 2 | 0) | 0;
          let iTy = (this.Target.op_arrow().GetY() + this.Target.op_arrow().Def.Collection.y | 0) + (this.Target.op_arrow().Def.Collection.Hgt / 2 | 0) | 0;
          let pthrow = $.C4REAL100(this.cObj.GetPropertyInt(73 /*P_ThrowSpeed*/));
          let iHeight = this.cObj.Shape.Hgt;
          const iPosX = [0];
          const iPosY = [0];
          let iObjDist = $.Distance(this.cObj.GetX(), this.cObj.GetY(), this.Target.op_arrow().GetX(), this.Target.op_arrow().GetY());
          if ($.FindThrowingPosition(iTx, iTy, pthrow.$clone(), pthrow.op_neg(), iHeight, P(iPosX, 0), P(iPosY, 0)) && $.Distance(iPosX[0], iPosY[0], this.cObj.GetX(), this.cObj.GetY()) < iObjDist || $.FindThrowingPosition(iTx, iTy, pthrow.op_mul$i32(-1), pthrow.op_neg(), iHeight, P(iPosX, 0), P(iPosY, 0)) && $.Distance(iPosX[0], iPosY[0], this.cObj.GetX(), this.cObj.GetY()) < iObjDist) {
            this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(6, this.Target2.op_C4Object_(), iTx, iTy, 5);
            return;
          }
        }
      }
    }
    if ((this.Target.op_arrow().Def.GrabPutGet & 1) !== 0) {
      if (pGrabbing === this.Target.op_C4Object_()) {
        if (!$.ObjectComPut(this.cObj, this.Target.op_C4Object_(), this.Target2.op_C4Object_())) {
          this.Finish();
          return;
        }
        if (this.Ty !== 0) {
          this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(7, null, 0, 0);
        }
        return;
      }
      this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(5, this.Target.op_C4Object_(), 0, 0, 50);
      this.Ty = 1;
      return;
    }
    if ((this.Target.op_arrow().OCF & 2048) >>> 0 !== 0) {
      this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(3, this.Target.op_C4Object_(), 0, 0, 50);
      return;
    }
  }

  Drop() {
    if (this.cObj.GetProcedure() === 240) {
      $.ObjectComStop(this.cObj);
    }
    if (this.Target.op_C4Object_() != null) {
      if (!(this.cObj.Contents.GetLink$pC4Object(this.Target.op_C4Object_()) != null)) {
        this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(10, this.Target.op_C4Object_(), 0, 0, 40);
        return;
      }
    }
    let iMoveToRange = 5;
    if (this.cObj.Def.MoveToRange > 0) {
      iMoveToRange = this.cObj.Def.MoveToRange;
    }
    if (this.Tx._getInt() !== 0 || this.Ty !== 0) {
      if (this.cObj.GetProcedure() === 243) {
        this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(7, null, 0, 0, 50);
        return;
      }
      if ($.Inside$i32$i32$i32$3(this.cObj.GetX() - this.Tx._getInt() | 0, -iMoveToRange | 0, iMoveToRange) && $.Inside$i32$i32$i32$3(this.cObj.GetY() - this.Ty | 0, -15, 15)) {
        this.cObj.Action.ComDir = 0;
        $.ObjectComDrop(this.cObj, this.Target.op_C4Object_());
        this.Finish(true);
        return;
      }
      this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(2, null, this.Tx._getInt(), this.Ty, 20);
      return;
    }
    if (this.cObj.Contained.op_C4Object_() != null) {
      $.ObjectComPutTake(this.cObj, this.cObj.Contained.op_C4Object_(), this.Target.op_C4Object_());
      this.Finish(true);
      return;
    }
    if (this.cObj.GetProcedure() === 243) {
      if (this.cObj.Action.Target.op_C4Object_() != null) {
        $.ObjectComPutTake(this.cObj, this.cObj.Action.Target.op_C4Object_(), this.Target.op_C4Object_());
      }
      this.Finish(true);
      return;
    }
    $.ObjectComDrop(this.cObj, this.Target.op_C4Object_());
    this.Finish(true);
  }

  Dig() {
    let cx = 0;
    let cy = 0;
    let tx = 0;
    let ty = 0;
    cx = this.cObj.GetX();
    cy = this.cObj.GetY();
    tx = this.Tx._getInt();
    ty = (this.Ty + this.cObj.Shape.GetY() | 0) + 3 | 0;
    let fDigOutMaterial = this.Data.getBool();
    if (this.cObj.GetProcedure() === 243) {
      this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(7, null, 0, 0, 50);
      return;
    }
    if (this.cObj.Contained.op_C4Object_() != null) {
      this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(4, null, 0, 0, 50);
      return;
    }
    if (this.cObj.GetProcedure() === 238 || this.cObj.GetProcedure() === 239) {
      $.ObjectComLetGo(this.cObj, this.cObj.Action.Dir === 0 ? 1 : -1);
    }
    let iMoveToRange = 5;
    if (this.cObj.Def.MoveToRange > 0) {
      iMoveToRange = this.cObj.Def.MoveToRange;
    }
    if ($.Inside$i32$i32$i32$3(cx - tx | 0, -iMoveToRange | 0, iMoveToRange) && $.Inside$i32$i32$i32$3(cy - ty | 0, -iMoveToRange | 0, iMoveToRange)) {
      $.ObjectComStop(this.cObj);
      this.Finish(true);
      return;
    }
    if (this.cObj.GetProcedure() !== 240) {
      if (this.cObj.GetProcedure() !== 235) {
        return;
      }
    }
    if (this.cObj.GetProcedure() !== 240) {
      if (!$.ObjectComDig(this.cObj)) {
        this.Finish();
        return;
      }
    }
    if (fDigOutMaterial) {
      this.cObj.Action.Data = 1;
    }
    if (cx < (tx - 1 | 0)) {
      this.cObj.Action.ComDir = 3;
    }
    if (cx > (tx + 1 | 0)) {
      this.cObj.Action.ComDir = 7;
    }
    if (cy < (ty - 1 | 0)) {
      this.cObj.Action.ComDir = 5;
    }
    if (cx < (tx - 1 | 0)) {
      if (cy < (ty - 1 | 0)) {
        this.cObj.Action.ComDir = 4;
      }
    }
    if (cx > (tx - 1 | 0)) {
      if (cy < (ty - 1 | 0)) {
        this.cObj.Action.ComDir = 6;
      }
    }
    if (cx < (tx - 1 | 0)) {
      if (cy > (ty + 1 | 0)) {
        this.cObj.Action.ComDir = 2;
      }
    }
    if (cx > (tx + 1 | 0)) {
      if (cy > (ty + 1 | 0)) {
        this.cObj.Action.ComDir = 8;
      }
    }
  }

  Activate() {
    let $t1, $t2, $t3;
    if (this.Target2.op_C4Object_() != null && this.Target.op_not() && this.Data.op_not()) {
      this.cObj.ActivateMenu(6, 0, 0, 0, this.Target2.op_C4Object_());
      this.Finish(true);
      return;
    }
    if (this.Target.op_C4Object_() != null) {
      if (this.Target.op_arrow().Contained.op_not()) {
        this.Finish(true);
        return;
      }
    }
    if (this.Target2.op_not()) {
      if (this.Target.op_C4Object_() != null) {
        this.Target2.$assign(this.Target.op_arrow().Contained);
      }
    }
    if (this.Target2.op_not()) {
      this.Finish();
      return;
    }
    if (this.cObj.GetProcedure() === 240) {
      $.ObjectComStop(this.cObj);
    }
    if (this.cObj.Contained.op_eq$C4ObjectPtr(this.Target2)) {
      for (this.Tx.SetInt(this.Data.op_const_void_() != null ? $max(this.Tx._getInt(), 1) : 1); this.Tx._getInt() !== 0; this.Tx.op_dec$v()) {
        if (this.Target.op_not()) {
          $t1 = this.Target2.op_arrow().Contents;
          $t2 = $t1.begin();
          $t3 = $t1.end();
          try {
            for (; $t2.op_ne($t3); $t2.op_inc$v()) {
              const pObj = $t2.op_mul();
              if (pObj.Status !== 0 && pObj.Def === this.Data.getDef()) {
                if (pObj.Command == null || pObj.Command.Command !== 4) {
                  this.Target.op_assign(pObj);
                  break;
                }
              }
            }
          } finally { $t2.$dtor(); $t3.$dtor(); }
        }
        if (this.Target.op_not()) {
          this.Finish();
          return;
        }
        if (this.Target.op_arrow().Contained.op_ne$C4ObjectPtr(this.Target2)) {
          this.Finish();
          return;
        }
        this.Target.op_arrow().Controller = this.cObj.Controller;
        this.Target.op_arrow().SetCommand$i32$pC4Object$i32$i32$pC4Object$b$C4Value$i32$pC4String(4);
        this.Target.op_assign(null);
      }
      this.Finish(true);
      return;
    }
    if (this.cObj.Contained.op_C4Object_() != null) {
      this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(4, null, 0, 0, 50);
      return;
    }
    if ((this.Target2.op_arrow().OCF & 2048) >>> 0 !== 0) {
      this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(3, this.Target2.op_C4Object_(), 0, 0, 50);
      return;
    }
    this.Finish();
  }

  PushTo() {
    if (this.Target.op_not()) {
      this.Finish();
      return;
    }
    if (this.Target.op_eq$C4ObjectPtr(this.Target2)) {
      this.Finish();
      return;
    }
    if (this.Target2.op_C4Object_() != null) {
      if (this.Target.op_arrow().Contained.op_eq$C4ObjectPtr(this.Target2)) {
        this.Finish(true);
        return;
      }
    } else {
      if ($.Inside$i32$i32$i32$3(this.Target.op_arrow().GetX() - this.Tx._getInt() | 0, -10, 10)) {
        if ($.Inside$i32$i32$i32$3(this.Target.op_arrow().GetY() - this.Ty | 0, -10, 10)) {
          this.cObj.Action.ComDir = 0;
          this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(7);
          this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(9, null, 0, 0, 10);
          this.Finish(true);
          return;
        }
      }
    }
    if (this.cObj.GetProcedure() === 240) {
      $.ObjectComStop(this.cObj);
    }
    if (this.Target.op_arrow().Contained.op_C4Object_() != null) {
      this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(14, this.Target.op_C4Object_(), 0, 0, 40);
      return;
    }
    if (!(this.cObj.GetProcedure() === 243 && this.cObj.Action.Target.op_eq$C4ObjectPtr(this.Target))) {
      this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(5, this.Target.op_C4Object_(), 0, 0, 40);
      return;
    }
    if (this.Target2.op_C4Object_() != null) {
      this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(3, this.Target2.op_C4Object_(), 0, 0, 40, null, true, new $.C4Value().init$i32(2));
      return;
    } else {
      this.cObj.AddCommand$i32$pC4Object$C4Value$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(2, null, new $.C4Value().$copy(this.Tx), this.Ty, 40, null, true, new $.C4Value().init$i32(2));
      return;
    }
  }

  CallFailed() {
    if (this.Text == null || !(this.Text.GetCStr() != null) || !($rd(this.Text.GetCStr(), 0) !== 0) || this.Target.op_not()) {
      return 0;
    }
    const szFunctionFailed = new Int8Array(1025);
    $.ssprintf$2(szFunctionFailed, S("~%sFailed"), this.Text.GetCStr());
    return this.Target.op_arrow().Call$pi8$pC4AulParSet$b(P(szFunctionFailed, 0), new $.C4AulParSet().init$rpC4Object$rC4Value$ri32$rC4ObjectPtr(P(this, "cObj"), this.Tx, P(this, "Ty"), this.Target2).op_and())._getInt();
  }

  JumpControl() {
    if (!((this.cObj.OCF & 524288) >>> 0 !== 0 || this.cObj.Def.Pathfinder !== 0)) {
      return false;
    }
    let cx = this.cObj.GetX();
    let cy = this.cObj.GetY();
    let iAngle = $.Angle(cx, cy, this.Tx._getInt(), this.Ty);
    while (iAngle > 180) {
      iAngle = iAngle - 360 | 0;
    }
    if ($.Inside$i32$i32$i32$3(iAngle - 35 | 0, -10, 10) || $.Inside$i32$i32$i32$3(iAngle + 35 | 0, -10, 10)) {
      if ($.PathFree$i32$i32$i32$i32(cx, cy, this.Tx._getInt(), this.Ty)) {
        if ($.Distance(cx, cy, this.Tx._getInt(), this.Ty) > 30) {
          let iTopFree = 0;
          for (iTopFree = 0; iTopFree < 50 && !$.GBackSolid(cx, (cy + this.cObj.Shape.GetY() | 0) - iTopFree | 0); iTopFree = iTopFree + 1 | 0) {
          }
          if (iTopFree >= 15) {
            this.cObj.AddCommand$i32$pC4Object$C4Value$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(8, null, new $.C4Value().$copy(this.Tx), this.Ty);
            return true;
          }
        }
      }
    }
    if ($.Inside$i32$i32$i32$3(iAngle - 0 | 0, -30, 30)) {
      if ($.Inside$i32$i32$i32$3(cy - this.Ty | 0, 10, 40)) {
        let iSide = SolidOnWhichSide(this.Tx._getInt(), this.Ty);
        let iDist = Math.imul(5, $.Abs$i32(cy - this.Ty | 0)) / 6 | 0;
        const iSideX = [cx - Math.imul(iDist, iSide) | 0];
        const iSideY = [cy];
        AdjustMoveToTarget(P(iSideX, 0), P(iSideY, 0), false, 0);
        if ($.Inside$i32$i32$i32$3(iSideY[0] - cy | 0, -20, 20)) {
          if ($.PathFree$i32$i32$i32$i32(iSideX[0], iSideY[0], this.Tx._getInt(), this.Ty)) {
            this.cObj.AddCommand$i32$pC4Object$C4Value$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(8, null, new $.C4Value().$copy(this.Tx), this.Ty);
            this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(2, null, iSideX[0], iSideY[0], 50);
            return true;
          }
        }
      }
    }
    let iLowSideRange = 5;
    if (!($.GBackDensity(cx, cy + (this.cObj.Shape.Hgt / 2 | 0) | 0) >= this.cObj.Shape.ContactDensity)) {
      if ((this.cObj.t_contact & 2) >>> 0 !== 0) {
        if ($.Inside$i32$i32$i32$3(iAngle - 80 | 0, Math.imul(-iLowSideRange | 0, 10), Math.imul(iLowSideRange, 10))) {
          this.cObj.AddCommand$i32$pC4Object$C4Value$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(8, null, new $.C4Value().$copy(this.Tx), this.Ty);
          return true;
        }
      }
      if ((this.cObj.t_contact & 1) >>> 0 !== 0) {
        if ($.Inside$i32$i32$i32$3(iAngle + 80 | 0, Math.imul(-iLowSideRange | 0, 10), Math.imul(iLowSideRange, 10))) {
          this.cObj.AddCommand$i32$pC4Object$C4Value$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(8, null, new $.C4Value().$copy(this.Tx), this.Ty);
          return true;
        }
      }
    }
    return false;
  }

  FlightControl() {
    if (!((this.cObj.OCF & 524288) >>> 0 !== 0 || this.cObj.Def.Pathfinder !== 0)) {
      return false;
    }
    let pActionDef = this.cObj.GetAction();
    if (pActionDef != null) {
      if (pActionDef.GetPropertyInt(59 /*P_ObjectDisabled*/) !== 0) {
        return false;
      }
    }
    let cx = this.cObj.GetX();
    let cy = this.cObj.GetY();
    let iAngle = $.Angle(cx, cy, this.Tx._getInt(), this.Ty);
    while (iAngle > 180) {
      iAngle = iAngle - 360 | 0;
    }
    if ($.Inside$i32$i32$i32$3(iAngle, -60, 60) || $.Inside$i32$i32$i32$3(iAngle, -60, 60)) {
      if ($.Distance(cx, cy, this.Tx._getInt(), this.Ty) > 30) {
        let iTopFree = 0;
        for (iTopFree = 0; iTopFree < 50 && !$.GBackSolid(cx, (cy + this.cObj.Shape.GetY() | 0) - iTopFree | 0); iTopFree = iTopFree + 1 | 0) {
        }
        if (iTopFree >= 15) {
          return this.cObj.SetActionByName$pi8$pC4Object$pC4Object$i32$b(S("Fly"));
        }
      }
    }
    return false;
  }

  InitEvaluation() {
    if (this.Evaluated !== 0) {
      return false;
    }
    this.Evaluated = 1;
    switch (this.Command) {
      case 2:
        {
          if (this.Target.op_C4Object_() != null) {
            this.Tx.op_addAssign(this.Target.op_arrow().GetX());
            this.Ty = this.Ty + this.Target.op_arrow().GetY() | 0;
            this.Target.op_assign(null);
          }
          const iTx = [this.Tx._getInt()];
          if ((~this.Data.getInt() & 1) !== 0) {
            AdjustMoveToTarget(P(iTx, 0), P(this, "Ty"), FreeMoveTo(this.cObj), this.cObj.Shape.Hgt);
          }
          this.Tx.SetInt(iTx[0]);
          return true;
        }
      case 15:
        {
          const iTx = [this.Tx._getInt()];
          AdjustMoveToTarget(P(iTx, 0), P(this, "Ty"), FreeMoveTo(this.cObj), this.cObj.Shape.Hgt);
          this.Tx.SetInt(iTx[0]);
          return true;
        }
      case 4:
        $.ObjectComCancelAttach(this.cObj);
        return true;
      case 8:
        {
          if (this.Tx._getInt() !== 0) {
            if (this.Tx._getInt() < this.cObj.GetX()) {
              this.cObj.SetDir(0);
            }
            if (this.Tx._getInt() > this.cObj.GetX()) {
              this.cObj.SetDir(1);
            }
          }
          $.ObjectComJump(this.cObj);
          return true;
        }
      case 9:
        if (!this.Data.op_not()) {
          this.UpdateInterval = this.Data.getInt();
        } else if (this.Tx._getInt() !== 0) {
          this.UpdateInterval = this.Tx._getInt();
        }
        return true;
      case 20:
        if (!(this.Tx._getInt() !== 0)) {
          this.Tx.SetInt(500);
        }
        if (this.Ty === 0) {
          this.Ty = 250;
        }
        return true;
    }
    return false;
  }

  GetExpGain() {
    switch (this.Command) {
      case 9:
      case 16:
      case 21:
      case 23:
        return 0;
      case 1:
      case 2:
      case 3:
      case 4:
        return 1;
      case 5:
      case 7:
      case 6:
      case 8:
      case 10:
      case 11:
      case 12:
      case 14:
      case 15:
      case 13:
      case 18:
      case 19:
      case 24:
      case 25:
        return 1;
      case 20:
      case 22:
        return 2;
      case 17:
        return 15;
    }
    return 0;
  }

  $clone() { return new C4Command().$assign(this); }
  $assign(o) {
    this.cObj = o.cObj;
    this.Command = o.Command;
    this.Tx.$assign(o.Tx);
    this.Ty = o.Ty;
    this.Target.$assign(o.Target);
    this.Target2.$assign(o.Target2);
    this.Data.$assign(o.Data);
    this.UpdateInterval = o.UpdateInterval;
    this.Evaluated = o.Evaluated;
    this.PathChecked = o.PathChecked;
    this.Finished = o.Finished;
    this.Failures = o.Failures;
    this.Retries = o.Retries;
    this.Permit = o.Permit;
    this.Text = o.Text;
    this.Next = o.Next;
    this.iExec = o.iExec;
    this.BaseMode = o.BaseMode;
    return this;
  }
}

export class ObjectAddWaypoint {
  cObj = null;

  init(obj) {
    this.cObj = obj;
    return this;
  }

  op_call(iX$, iY$, TransferTarget) {
    const iX = [iX$];
    const iY = [iY$];
    if (this.cObj == null) {
      return false;
    }
    if (TransferTarget != null) {
      return this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(16, TransferTarget, iX[0], iY[0], 0, null, false);
    }
    AdjustSolidOffset(P(iX, 0), P(iY, 0), this.cObj.Shape.Wdt / 2 | 0, this.cObj.Shape.Hgt / 2 | 0);
    let iUpdate = 25;
    if (this.cObj.Command != null && this.cObj.Command.Command === 16) {
      iUpdate = 0;
    }
    0;
    if (!this.cObj.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(2, null, iX[0], iY[0], iUpdate, null, false, new $.C4Value().$copy(this.cObj.Command.Data))) {
      return false;
    }
    return true;
  }

  $clone() { return new ObjectAddWaypoint().$assign(this); }
  $assign(o) {
    this.cObj = o.cObj;
    return this;
  }
}

















export function CommandName(iCommand) {
  switch (iCommand) {
    case 0:
      return S("None");
    case 1:
      return S("Follow");
    case 2:
      return S("MoveTo");
    case 3:
      return S("Enter");
    case 4:
      return S("Exit");
    case 5:
      return S("Grab");
    case 6:
      return S("Throw");
    case 7:
      return S("UnGrab");
    case 8:
      return S("Jump");
    case 9:
      return S("Wait");
    case 10:
      return S("Get");
    case 11:
      return S("Put");
    case 12:
      return S("Drop");
    case 13:
      return S("Dig");
    case 14:
      return S("Activate");
    case 15:
      return S("PushTo");
    case 16:
      return S("Transfer");
    case 17:
      return S("Attack");
    case 18:
      return S("Buy");
    case 19:
      return S("Sell");
    case 20:
      return S("Acquire");
    case 21:
      return S("Retry");
    case 22:
      return S("Home");
    case 23:
      return S("Call");
    case 24:
      return S("Take");
    case 25:
      return S("Take2");
    default:
      return S("None");
  }
}










export function CommandNameID(iCommand) {
  switch (iCommand) {
    case 0:
      return S("IDS_COMM_NONE");
    case 1:
      return S("IDS_COMM_FOLLOW");
    case 2:
      return S("IDS_COMM_MOVETO");
    case 3:
      return S("IDS_COMM_ENTER");
    case 4:
      return S("IDS_COMM_EXIT");
    case 5:
      return S("IDS_COMM_GRAB");
    case 6:
      return S("IDS_COMM_THROW");
    case 7:
      return S("IDS_COMM_UNGRAB");
    case 8:
      return S("IDS_COMM_JUMP");
    case 9:
      return S("IDS_COMM_WAIT");
    case 10:
      return S("IDS_COMM_GET");
    case 11:
      return S("IDS_COMM_PUT");
    case 12:
      return S("IDS_COMM_DROP");
    case 13:
      return S("IDS_COMM_DIG");
    case 14:
      return S("IDS_COMM_ACTIVATE");
    case 15:
      return S("IDS_COMM_PUSHTO");
    case 16:
      return S("IDS_COMM_TRANSFER");
    case 17:
      return S("IDS_COMM_ATTACK");
    case 18:
      return S("IDS_COMM_BUY");
    case 19:
      return S("IDS_COMM_SELL");
    case 20:
      return S("IDS_COMM_ACQUIRE");
    case 21:
      return S("IDS_COMM_RETRY");
    case 22:
      return S("IDS_CON_HOME");
    case 23:
      return S("IDS_COMM_CALL");
    case 24:
      return S("IDS_COMM_TAKE");
    case 25:
      return S("IDS_COMM_TAKE2");
    default:
      return S("IDS_COMM_NONE");
  }
}

export function InitEnumAdaptCommandEntries() {
  for (let i = 1; i <= 25; i = i + 1 | 0) {
    $.EnumAdaptCommandEntries[i - 1 | 0].Name = CommandName(i);
    $.EnumAdaptCommandEntries[i - 1 | 0].Val = i;
  }
  $.EnumAdaptCommandEntries[25].Name = null;
  return true;
}


export function CommandByName(szCommand) {
  for (let cnt = 1; cnt <= 25; cnt = cnt + 1 | 0) {
    if ($.SEqual(szCommand, CommandName(cnt))) {
      return cnt;
    }
  }
  return 0;
}

export function FreeMoveTo(cObj) {
  if (cObj.GetProcedure() === 245) {
    return true;
  }
  return false;
}

export function AdjustMoveToTarget(rX, rY, fFreeMove, iShapeHgt) {
  let iY = $min(rY.a[rY.o], $.Landscape.GetHeight());
  while (iY >= 0 && $.GBackSolid(rX.a[rX.o], iY)) {
    iY = iY - 1 | 0;
  }
  if (iY >= 0) {
    rY.a[rY.o] = iY;
  }
  if (!fFreeMove) {
    if (!$.GBackSemiSolid(rX.a[rX.o], rY.a[rY.o])) {
      for (iY = rY.a[rY.o]; iY < $.Landscape.GetHeight() && !$.GBackSemiSolid(rX.a[rX.o], iY + 1 | 0); iY = iY + 1 | 0) {
      }
      if (iY < $.Landscape.GetHeight()) {
        rY.a[rY.o] = iY;
      }
    }
    if ($.GBackSolid(rX.a[rX.o], rY.a[rY.o] + 1 | 0) || $.GBackSolid(rX.a[rX.o], rY.a[rY.o] + 5 | 0)) {
      if (!$.GBackSemiSolid(rX.a[rX.o], rY.a[rY.o] - (iShapeHgt / 2 | 0) | 0)) {
        rY.a[rY.o] = rY.a[rY.o] - (iShapeHgt / 2 | 0) | 0;
      }
    }
  }
}

export function AdjustSolidOffset(rX, rY, iXOff, iYOff) {
  if ($.GBackSolid(rX.a[rX.o], rY.a[rY.o])) {
    return false;
  }
  let cnt = 0;
  for (cnt = 1; cnt < iYOff; cnt = cnt + 1 | 0) {
    if ($.GBackSolid(rX.a[rX.o], rY.a[rY.o] + cnt | 0) && !$.GBackSolid(rX.a[rX.o], rY.a[rY.o] - cnt | 0)) {
      rY.a[rY.o] = rY.a[rY.o] - 1 | 0;
    }
    if ($.GBackSolid(rX.a[rX.o], rY.a[rY.o] - cnt | 0) && !$.GBackSolid(rX.a[rX.o], rY.a[rY.o] + cnt | 0)) {
      rY.a[rY.o] = rY.a[rY.o] + 1 | 0;
    }
  }
  for (cnt = 1; cnt < iXOff; cnt = cnt + 1 | 0) {
    if ($.GBackSolid(rX.a[rX.o] + cnt | 0, rY.a[rY.o]) && !$.GBackSolid(rX.a[rX.o] - cnt | 0, rY.a[rY.o])) {
      rX.a[rX.o] = rX.a[rX.o] - 1 | 0;
    }
    if ($.GBackSolid(rX.a[rX.o] - cnt | 0, rY.a[rY.o]) && !$.GBackSolid(rX.a[rX.o] + cnt | 0, rY.a[rY.o])) {
      rX.a[rX.o] = rX.a[rX.o] + 1 | 0;
    }
  }
  return true;
}

export function SolidOnWhichSide(iX, iY) {
  for (let cx = 1; cx < 10; cx = cx + 1 | 0) {
    for (let cy = 0; cy < 10; cy = cy + 1 | 0) {
      if ($.GBackSolid(iX - cx | 0, iY - cy | 0) || $.GBackSolid(iX - cx | 0, iY + cy | 0)) {
        return -1;
      }
      if ($.GBackSolid(iX + cx | 0, iY - cy | 0) || $.GBackSolid(iX + cx | 0, iY + cy | 0)) {
        return 1;
      }
    }
  }
  return 0;
}

export function $init(): void {
  $.MoveToRange$C4Command = 5;
  $.LetGoRange1$C4Command = 7;
  $.C4CMD_First$C4Command = 1;
  $.LetGoRange2$C4Command = 30;
  $.DigRange$C4Command = 1;
  $.C4CMD_Last$C4Command = 25;
  $.FollowRange$C4Command = 6;
  $.PushToRange$C4Command = 10;
  $.DigOutPositionRange$C4Command = 15;
  $.C4CMD_Mode_SilentSub$C4Command = 0;
  $.PathRange$C4Command = 20;
  $.MaxPathRange$C4Command = 1000;
  $.JumpAngle$C4Command = 35;
  $.JumpLowAngle$C4Command = 80;
  $.JumpAngleRange$C4Command = 10;
  $.JumpHighAngle$C4Command = 0;
  $.C4CMD_Mode_Base$C4Command = 1;
  $.FlightAngleRange$C4Command = 60;
  $.LetGoHangleAngle$C4Command = 110;
  $.C4CMD_Mode_SilentBase$C4Command = 2;
  $.EnumAdaptCommandEntries = $oarr(26, () => ({}));
  $.C4CMD_Mode_Sub$C4Command = 3;
  $.C4CMD_MoveTo_NoPosAdjust$C4Command = 1;
  $.C4CMD_MoveTo_PushTarget$C4Command = 2;
  $.C4CMD_Enter_PushTarget$C4Command = 2;
  $.InitEnumAdaptCommandEntriesDummy$C4Command = InitEnumAdaptCommandEntries();
}

Object.assign($, { AdjustMoveToTarget, AdjustSolidOffset, C4Command, CommandByName, CommandName, CommandNameID, FreeMoveTo, InitEnumAdaptCommandEntries, ObjectAddWaypoint, SolidOnWhichSide });
