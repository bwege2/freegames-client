// @ts-nocheck
// OpenClonk 36de799: src/script/C4AulExec.cpp, src/script/C4AulExec.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $u64n } from '../../rt/int.ts';
import { c$strlen } from '../../rt/libc.ts';
import { op_sub$C4TimeMilliseconds$C4TimeMilliseconds } from '../../rt/native.ts';
import { $oadd, $oarr, $oat, $oidx, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $rbegin, $rend, $throw, $vpush, StdString, std_sort } from '../../rt/std.ts';

export class C4AulScriptContext {
  Obj = null;
  Return = null;
  Pars = null;
  Func = null;
  CPos = null;
  tTime = new $.C4TimeMilliseconds();

  dump(Dump = new $.StdStrBuf().init$pi8$b(S(""))) {
    $.DebugLog(this.ReturnDump(new $.StdStrBuf().init$rStdStrBuf$b(Dump)).getData());
  }

  ReturnDump(Dump = new $.StdStrBuf().init$pi8$b(S(""))) {
    if (this.Func == null) {
      return new $.StdStrBuf().init$pi8$b(S(""));
    }
    if (this.Obj != null && this.Obj.Status !== 0) {
      let ObjVal = new $.C4Value().init$pC4PropList(this.Obj);
      Dump.Append$StdStrBuf(ObjVal.GetDataString(0));
      Dump.Append$pi8(S("->"));
    }
    let fDirectExec = !(this.Func.GetName() != null);
    if (!fDirectExec) {
      Dump.Append$pi8(this.Func.GetName());
      Dump.AppendChar(40);
      let iNullPars = 0;
      for (let i = 0; i < this.Func.GetParCount(); i = i + 1 | 0) {
        if ($oidx(this.Pars, i).op_not()) {
          iNullPars = iNullPars + 1 | 0;
        } else {
          if (i > iNullPars) {
            Dump.AppendChar(44);
          }
          while (iNullPars > 0) {
            Dump.Append$pi8(S("0,"));
            iNullPars = iNullPars - 1 | 0;
          }
          Dump.Append$StdStrBuf($oidx(this.Pars, i).GetDataString());
        }
      }
      Dump.AppendChar(41);
    } else {
      Dump.Append$StdStrBuf(this.Func.Parent.GetDataString$v$c());
    }
    if (!fDirectExec && this.Func.pOrgScript != null) {
      Dump.AppendFormat(S(" (%s:%d)"), this.Func.pOrgScript.ScriptName.getData(), this.CPos != null ? this.Func.GetLineOfCode(this.CPos) : $.SGetLine(this.Func.pOrgScript.GetScript(), this.Func.Script));
    }
    return Dump.$clone();
  }

  None() {
    this.tTime = new $.C4TimeMilliseconds();
    return this;
  }

  $clone() { return new C4AulScriptContext().$assign(this); }
  $assign(o) {
    this.Obj = o.Obj;
    this.Return = o.Return;
    this.Pars = o.Pars;
    this.Func = o.Func;
    this.CPos = o.CPos;
    this.tTime.$assign(o.tTime);
    return this;
  }
}

export class C4AulExec {
  pCurCtx = null;
  pCurVal = null;
  iTraceStart = -1;
  fProfiling = false;
  tDirectExecStart = new $.C4TimeMilliseconds();
  tDirectExecTotal = 0;
  pProfiledScript = null;
  Contexts = $oarr(512, () => new C4AulScriptContext().None());
  Values = $oarr(1024, () => new $.C4Value().init$v());

  init() {
    this.pCurCtx = $oadd($oat(this.Contexts, 0), -1);
    this.pCurVal = $oadd($oat(this.Values, 0), -1);
    this.iTraceStart = -1;
    this.tDirectExecStart = new $.C4TimeMilliseconds();
    this.Contexts = $oarr(512, () => new C4AulScriptContext().None());
    this.Values = $oarr(1024, () => new $.C4Value().init$v());
    return this;
  }

  StartProfiling(pProfiledScript) {
    if (this.fProfiling) {
      this.StopProfiling();
    }
    this.fProfiling = true;
    this.pProfiledScript = pProfiledScript;
    let tNow = $.C4TimeMilliseconds.Now();
    this.tDirectExecStart.$assign(tNow);
    this.tDirectExecTotal = 0;
    for (let pCtx = $oat(this.Contexts, 0); pCtx.$i <= this.pCurCtx.$i; pCtx = $oadd(pCtx, 1)) {
      pCtx.tTime.$assign(tNow);
    }
  }

  IsProfiling() {
    return this.fProfiling;
  }

  StopProfiling() {
    this.fProfiling = false;
  }

  Exec$pC4AulScriptFunc$pC4PropList$pC4Value$b(pSFunc, p, pnPars, fPassErrors) {
    let pOldCtx = this.pCurCtx;
    let pPars = $oadd(this.pCurVal, 1);
    try {
      0;
      for (let i = 0; i < pSFunc.GetParCount(); i = i + 1 | 0) {
        this.PushValue($oidx(pnPars, i));
      }
      let ctx = new C4AulScriptContext().None();
      ctx.tTime.$assign(new $.C4TimeMilliseconds().init$u32(0));
      ctx.Obj = p;
      ctx.Return = null;
      ctx.Pars = pPars;
      ctx.Func = pSFunc;
      ctx.CPos = null;
      this.PushContext(ctx);
      return this.Exec$pC4AulBCC(pSFunc.GetCode());
    } catch ($e1) {
      if ($e1 instanceof $.C4AulError) {
        const e = $e1;
        if (!fPassErrors) {
          $.ScriptEngine.GetErrorHandler().OnError(e.what());
        }
        while (this.pCurCtx.$i > pOldCtx.$i) {
          this.pCurCtx.dump(new $.StdStrBuf().init$pi8$b(S(" by: ")));
          this.PopContext();
        }
        this.PopValuesUntil($oadd(pPars, -1));
        if (fPassErrors) {
          $throw($e1);
        }
        this.LogCallStack();
      } else {
        throw $e1;
      }
    }
    return new $.C4Value().$copy($.C4VNull);
  }

  DirectExec(p, szScript, _szContext, fPassErrors = false, context = null, parse_function = false) {
    if (true && $.Config.General.DebugRec !== 0) {
      $.AddDbgRec(164 /*RCT_DirectExec*/, szScript, c$strlen(szScript) + 1 | 0);
      const iObjNumber = [p != null && p.GetPropListNumbered() != null ? p.GetPropListNumbered().Number : -1];
      $.AddDbgRec(164 /*RCT_DirectExec*/, P(iObjNumber, 0), 4);
    }
    this.StartDirectExec();
    let script = $.GameScript.GetPropList$v();
    if (p != null && p.IsStatic$v() != null) {
      script = p.IsStatic$v();
    } else if (p != null && p.GetDef$v() != null) {
      script = p.GetDef$v();
    }
    let pFunc = new $.C4AulScriptFunc().init$pC4PropListStatic$pC4ScriptHost$pi8$pi8(script, null, null, szScript);
    try {
      if (parse_function) {
        pFunc.ParseDirectExecFunc($.ScriptEngine, context);
      } else {
        pFunc.ParseDirectExecStatement($.ScriptEngine, context);
      }
      let Pars = new $.C4AulParSet().init$v();
      let vRetVal = this.Exec$pC4AulScriptFunc$pC4PropList$pC4Value$b(pFunc, p, $oat(Pars.Par, 0), fPassErrors);
      this.StopDirectExec();
      return vRetVal;
    } catch ($e1) {
      if ($e1 instanceof $.C4AulError) {
        const ex = $e1;
        if (fPassErrors) {
          $throw($e1);
        }
        $.ScriptEngine.GetErrorHandler().OnError(ex.what());
        this.LogCallStack();
        this.StopDirectExec();
        return new $.C4Value().$copy($.C4VNull);
      } else {
        throw $e1;
      }
    }
  }

  StartTrace() {
    if (this.iTraceStart < 0) {
      this.iTraceStart = this.ContextStackSize();
    }
  }

  StartDirectExec() {
    if (this.fProfiling) {
      this.tDirectExecStart.$assign($.C4TimeMilliseconds.Now());
    }
  }

  StopDirectExec() {
    if (this.fProfiling) {
      this.tDirectExecTotal = this.tDirectExecTotal + (op_sub$C4TimeMilliseconds$C4TimeMilliseconds($.C4TimeMilliseconds.Now(), this.tDirectExecStart) >>> 0) >>> 0;
    }
  }

  GetContextDepth() {
    return this.pCurCtx.$i - $oat(this.Contexts, 0).$i + 1 | 0;
  }

  GetContext(iLevel) {
    return iLevel >= 0 && iLevel < this.GetContextDepth() ? $oadd($oat(this.Contexts, 0), iLevel) : null;
  }

  LogCallStack() {
    for (let pCtx = this.pCurCtx; pCtx.$i >= $oat(this.Contexts, 0).$i; pCtx = $oadd(pCtx, -1)) {
      pCtx.dump(new $.StdStrBuf().init$pi8$b(S(" by: ")));
    }
  }

  static FnTranslate(_this, text) {
    if (text == null || text.GetData().isNull()) {
      return null;
    }
    if (_this != null && _this.GetDef$v() != null) {
      do {
        const s = _this.GetDef$v().Script;
        const k = text.GetCStr();
        if (s != null) {
          try {
            return $.Strings.RegString$pi8(s.Translate(StdString.of(k)).c_str());
          } catch ($e4) {
            if ($e4 instanceof $.C4LangStringTable$NoSuchTranslation) {
            } else {
              throw $e4;
            }
          }
        }
      } while (false);
    }
    do {
      const s = $.AulExec.pCurCtx.Func.pOrgScript;
      const k = text.GetCStr();
      if (s != null) {
        try {
          return $.Strings.RegString$pi8(s.Translate(StdString.of(k)).c_str());
        } catch ($e3) {
          if ($e3 instanceof $.C4LangStringTable$NoSuchTranslation) {
          } else {
            throw $e3;
          }
        }
      }
    } while (false);
    $.DebugLogF(S("WARNING: Translate: no translation for string \"%s\""), text.GetCStr());
    $.AulExec.LogCallStack();
    return text;
  }

  static FnLogCallStack(__this) {
    $.AulExec.LogCallStack();
    return true;
  }

  ClearPointers(obj) {
    for (let pCtx = this.pCurCtx; pCtx.$i >= $oat(this.Contexts, 0).$i; pCtx = $oadd(pCtx, -1)) {
      if (pCtx.Obj === obj) {
        pCtx.Obj = null;
      }
    }
  }

  Exec$pC4AulBCC(pCPos) {
    try {
      for (; ; ) {
        let fJump = false;
        switch (pCPos.bccType) {
          case 42:
            this.PushInt(pCPos.Par.i);
            break;
          case 43:
            this.PushBool(!(pCPos.Par.i === 0));
            break;
          case 44:
            this.PushString(pCPos.Par.s);
            break;
          case 45:
            this.PushPropList(pCPos.Par.p);
            break;
          case 46:
            this.PushArray(pCPos.Par.a);
            break;
          case 47:
            this.PushFunction(pCPos.Par.f);
            break;
          case 48:
            this.PushValue($.C4VNull);
            break;
          case 6:
            this.PushValue($oidx(this.pCurVal, pCPos.Par.i));
            break;
          case 8:
            $oidx(this.pCurVal, pCPos.Par.i).$assign(this.pCurVal);
            break;
          case 9:
            $oidx(this.pCurVal, pCPos.Par.i).$assign(this.pCurVal);
            this.PopValue();
            break;
          case 61:
            $throw(new $.C4AulExecError().init(S("internal error: function didn't return")));
          case 59:
            if (pCPos.Par.s != null) {
              $throw(new $.C4AulExecError().init(StdString.of(S("syntax error: ")).plus(pCPos.Par.s.GetCStr()).c_str()));
            } else {
              $throw(new $.C4AulExecError().init(S("syntax error: see above for details")));
            }
          case 7:
            this.PushValue($oidx($.AulExec.GetContext($.AulExec.GetContextDepth() - 2 | 0).Pars, pCPos.Par.i));
            break;
          case 10:
            if (this.pCurCtx.Obj == null) {
              $throw(new $.C4AulExecError().init(S("can't access local variables without this")));
            }
            this.PushNullVals(1);
            this.pCurCtx.Obj.GetPropertyByS(pCPos.Par.s, this.pCurVal);
            break;
          case 11:
            if (this.pCurCtx.Obj == null) {
              $throw(new $.C4AulExecError().init(S("can't access local variables without this")));
            }
            if (this.pCurCtx.Obj.IsFrozen()) {
              $throw(new $.C4AulExecError().init(S("local variable: this is readonly")));
            }
            this.pCurCtx.Obj.SetPropertyByS(pCPos.Par.s, this.pCurVal);
            break;
          case 2:
            if (!this.pCurVal.CheckConversion(3 /*C4V_PropList*/)) {
              $throw(new $.C4AulExecError().init($.FormatString(S("proplist access: proplist expected, got %s"), this.pCurVal.GetTypeName()).getData()));
            }
            if (!this.pCurVal._getPropList().GetPropertyByS(pCPos.Par.s, this.pCurVal)) {
              this.pCurVal.Set0();
            }
            break;
          case 3:
            {
              let pPropList = $oadd(this.pCurVal, -1);
              if (!pPropList.CheckConversion(3 /*C4V_PropList*/)) {
                $throw(new $.C4AulExecError().init($.FormatString(S("proplist write: proplist expected, got %s"), pPropList.GetTypeName()).getData()));
              }
              if (pPropList._getPropList().IsFrozen()) {
                $throw(new $.C4AulExecError().init(S("proplist write: proplist is readonly")));
              }
              pPropList._getPropList().SetPropertyByS(pCPos.Par.s, this.pCurVal);
              pPropList.Set$C4Value(this.pCurVal);
              this.PopValue();
              break;
            }
          case 12:
            this.PushValue($.ScriptEngine.GlobalNamed.GetItem$i32(pCPos.Par.i));
            break;
          case 13:
            $.ScriptEngine.GlobalNamed.GetItem$i32(pCPos.Par.i).Set$C4Value(this.pCurVal);
            break;
          case 19:
            this.CheckOpPar(1 /*C4V_Int*/, S("~"));
            this.pCurVal.SetInt(~this.pCurVal._getInt());
            break;
          case 20:
            this.pCurVal.SetBool(!this.pCurVal.getBool());
            break;
          case 21:
            this.CheckOpPar(1 /*C4V_Int*/, S("-"));
            this.pCurVal.SetInt(-this.pCurVal._getInt() | 0);
            break;
          case 17:
            this.CheckOpPar(1 /*C4V_Int*/, S("++"));
            this.pCurVal.SetInt(this.pCurVal._getInt() + 1 | 0);
            break;
          case 18:
            this.CheckOpPar(1 /*C4V_Int*/, S("--"));
            this.pCurVal.SetInt(this.pCurVal._getInt() - 1 | 0);
            break;
          case 22:
            {
              this.CheckOpPars(1 /*C4V_Int*/, 1 /*C4V_Int*/, S("**"));
              let pPar1 = $oadd(this.pCurVal, -1);
              let pPar2 = this.pCurVal;
              pPar1.SetInt($.Pow(pPar1._getInt(), pPar2._getInt()));
              this.PopValue();
              break;
            }
          case 23:
            {
              this.CheckOpPars(1 /*C4V_Int*/, 1 /*C4V_Int*/, S("/"));
              let pPar1 = $oadd(this.pCurVal, -1);
              let pPar2 = this.pCurVal;
              if (!(pPar2._getInt() !== 0)) {
                $throw(new $.C4AulExecError().init(S("division by zero")));
              }
              if (pPar1._getInt() === -0x80000000 && pPar2._getInt() === -1) {
                $throw(new $.C4AulExecError().init(S("division overflow")));
              }
              pPar1.SetInt(pPar1._getInt() / pPar2._getInt() | 0);
              this.PopValue();
              break;
            }
          case 24:
            {
              this.CheckOpPars(1 /*C4V_Int*/, 1 /*C4V_Int*/, S("*"));
              let pPar1 = $oadd(this.pCurVal, -1);
              let pPar2 = this.pCurVal;
              pPar1.SetInt(Math.imul(pPar1._getInt(), pPar2._getInt()));
              this.PopValue();
              break;
            }
          case 25:
            {
              this.CheckOpPars(1 /*C4V_Int*/, 1 /*C4V_Int*/, S("%"));
              let pPar1 = $oadd(this.pCurVal, -1);
              let pPar2 = this.pCurVal;
              if (pPar1._getInt() === -0x80000000 && pPar2._getInt() === -1) {
                $throw(new $.C4AulExecError().init(S("modulo division overflow")));
              }
              if (pPar2._getInt() !== 0) {
                pPar1.SetInt(pPar1._getInt() % pPar2._getInt());
              } else {
                pPar1.Set0();
              }
              this.PopValue();
              break;
            }
          case 26:
            {
              this.CheckOpPars(1 /*C4V_Int*/, 1 /*C4V_Int*/, S("-"));
              let pPar1 = $oadd(this.pCurVal, -1);
              let pPar2 = this.pCurVal;
              pPar1.SetInt(pPar1._getInt() - pPar2._getInt() | 0);
              this.PopValue();
              break;
            }
          case 27:
            {
              this.CheckOpPars(1 /*C4V_Int*/, 1 /*C4V_Int*/, S("+"));
              let pPar1 = $oadd(this.pCurVal, -1);
              let pPar2 = this.pCurVal;
              pPar1.SetInt(pPar1._getInt() + pPar2._getInt() | 0);
              this.PopValue();
              break;
            }
          case 28:
            {
              this.CheckOpPars(1 /*C4V_Int*/, 1 /*C4V_Int*/, S("<<"));
              let pPar1 = $oadd(this.pCurVal, -1);
              let pPar2 = this.pCurVal;
              pPar1.SetInt(pPar1._getInt() << pPar2._getInt() | 0);
              this.PopValue();
              break;
            }
          case 29:
            {
              this.CheckOpPars(1 /*C4V_Int*/, 1 /*C4V_Int*/, S(">>"));
              let pPar1 = $oadd(this.pCurVal, -1);
              let pPar2 = this.pCurVal;
              pPar1.SetInt(pPar1._getInt() >> pPar2._getInt());
              this.PopValue();
              break;
            }
          case 30:
            {
              this.CheckOpPars(1 /*C4V_Int*/, 1 /*C4V_Int*/, S("<"));
              let pPar1 = $oadd(this.pCurVal, -1);
              let pPar2 = this.pCurVal;
              pPar1.SetBool(pPar1._getInt() < pPar2._getInt());
              this.PopValue();
              break;
            }
          case 31:
            {
              this.CheckOpPars(1 /*C4V_Int*/, 1 /*C4V_Int*/, S("<="));
              let pPar1 = $oadd(this.pCurVal, -1);
              let pPar2 = this.pCurVal;
              pPar1.SetBool(pPar1._getInt() <= pPar2._getInt());
              this.PopValue();
              break;
            }
          case 32:
            {
              this.CheckOpPars(1 /*C4V_Int*/, 1 /*C4V_Int*/, S(">"));
              let pPar1 = $oadd(this.pCurVal, -1);
              let pPar2 = this.pCurVal;
              pPar1.SetBool(pPar1._getInt() > pPar2._getInt());
              this.PopValue();
              break;
            }
          case 33:
            {
              this.CheckOpPars(1 /*C4V_Int*/, 1 /*C4V_Int*/, S(">="));
              let pPar1 = $oadd(this.pCurVal, -1);
              let pPar2 = this.pCurVal;
              pPar1.SetBool(pPar1._getInt() >= pPar2._getInt());
              this.PopValue();
              break;
            }
          case 34:
            {
              let pPar1 = $oadd(this.pCurVal, -1);
              let pPar2 = this.pCurVal;
              pPar1.SetBool(pPar1.IsIdenticalTo(pPar2));
              this.PopValue();
              break;
            }
          case 35:
            {
              let pPar1 = $oadd(this.pCurVal, -1);
              let pPar2 = this.pCurVal;
              pPar1.SetBool(!pPar1.IsIdenticalTo(pPar2));
              this.PopValue();
              break;
            }
          case 36:
            {
              this.CheckOpPars(1 /*C4V_Int*/, 1 /*C4V_Int*/, S("&"));
              let pPar1 = $oadd(this.pCurVal, -1);
              let pPar2 = this.pCurVal;
              pPar1.SetInt(pPar1._getInt() & pPar2._getInt());
              this.PopValue();
              break;
            }
          case 37:
            {
              this.CheckOpPars(1 /*C4V_Int*/, 1 /*C4V_Int*/, S("^"));
              let pPar1 = $oadd(this.pCurVal, -1);
              let pPar2 = this.pCurVal;
              pPar1.SetInt(pPar1._getInt() ^ pPar2._getInt());
              this.PopValue();
              break;
            }
          case 38:
            {
              this.CheckOpPars(1 /*C4V_Int*/, 1 /*C4V_Int*/, S("|"));
              let pPar1 = $oadd(this.pCurVal, -1);
              let pPar2 = this.pCurVal;
              pPar1.SetInt(pPar1._getInt() | pPar2._getInt());
              this.PopValue();
              break;
            }
          case 49:
            {
              let pArray = new $.C4ValueArray().init$i32(pCPos.Par.i);
              for (let i = 0; i < pCPos.Par.i; i = i + 1 | 0) {
                pArray.op_index$i32(i).$assign($oidx(this.pCurVal, (i - pCPos.Par.i | 0) + 1 | 0));
              }
              this.PopValues(pCPos.Par.i);
              this.PushArray(pArray);
              break;
            }
          case 50:
            {
              let pPropList = $.C4PropList.New$pC4PropList();
              for (let i = 0; i < pCPos.Par.i; i = i + 1 | 0) {
                pPropList.SetPropertyByS($oidx(this.pCurVal, Math.imul(-2, i) - 1 | 0)._getStr(), $oidx(this.pCurVal, Math.imul(-2, i)));
              }
              this.PopValues(Math.imul(pCPos.Par.i, 2));
              this.PushPropList(pPropList);
              break;
            }
          case 0:
            {
              let pIndex = this.pCurVal;
              let pStruct = $oadd(this.pCurVal, -1);
              let pResult = $oadd(this.pCurVal, -1);
              if (this.CheckArrayAccess(pStruct, pIndex) === 5) {
                pResult.$assign(pStruct._getArray().GetItem(pIndex._getInt()));
              } else {
                0;
                let pPropList = pStruct._getPropList();
                if (!pPropList.GetPropertyByS(pIndex._getStr(), pResult)) {
                  pResult.Set0();
                }
              }
              this.PopValue();
              break;
            }
          case 1:
            {
              let pValue = this.pCurVal;
              let pIndex = $oadd(this.pCurVal, -1);
              let pStruct = $oadd(this.pCurVal, -2);
              let pResult = $oadd(this.pCurVal, -2);
              if (this.CheckArrayAccess(pStruct, pIndex) === 5) {
                if (pStruct._getArray().IsFrozen()) {
                  $throw(new $.C4AulExecError().init(S("array write: array is readonly")));
                }
                pStruct._getArray().SetItem(pIndex._getInt(), pValue);
              } else {
                0;
                let pPropList = pStruct._getPropList();
                if (pPropList.IsFrozen()) {
                  $throw(new $.C4AulExecError().init(S("proplist write: proplist is readonly")));
                }
                pPropList.SetPropertyByS(pIndex._getStr(), pValue);
              }
              pResult.$assign(pValue);
              this.PopValues(2);
              break;
            }
          case 4:
            {
              const Array_ = $oidx(this.pCurVal, -2);
              const StartIndex = $oidx(this.pCurVal, -1);
              const EndIndex = this.pCurVal;
              if (!Array_.CheckConversion(5 /*C4V_Array*/)) {
                $throw(new $.C4AulExecError().init($.FormatString(S("array slice: can't access %s as an array"), Array_.GetTypeName()).getData()));
              }
              if (!StartIndex.CheckConversion(1 /*C4V_Int*/)) {
                $throw(new $.C4AulExecError().init($.FormatString(S("array slice: start index of type %s, int expected"), StartIndex.GetTypeName()).getData()));
              }
              if (!EndIndex.CheckConversion(1 /*C4V_Int*/)) {
                $throw(new $.C4AulExecError().init($.FormatString(S("array slice: end index of type %s, int expected"), EndIndex.GetTypeName()).getData()));
              }
              Array_.SetArray(Array_.GetData().Array.GetSlice(StartIndex._getInt(), EndIndex._getInt()));
              this.PopValues(2);
              break;
            }
          case 5:
            {
              const Array_ = $oidx(this.pCurVal, -3);
              const StartIndex = $oidx(this.pCurVal, -2);
              const EndIndex = $oidx(this.pCurVal, -1);
              const Value = this.pCurVal;
              if (!Array_.CheckConversion(5 /*C4V_Array*/)) {
                $throw(new $.C4AulExecError().init($.FormatString(S("array slice: can't access %s as an array"), Array_.GetTypeName()).getData()));
              }
              if (!StartIndex.CheckConversion(1 /*C4V_Int*/)) {
                $throw(new $.C4AulExecError().init($.FormatString(S("array slice: start index of type %s, int expected"), StartIndex.GetTypeName()).getData()));
              }
              if (!EndIndex.CheckConversion(1 /*C4V_Int*/)) {
                $throw(new $.C4AulExecError().init($.FormatString(S("array slice: end index of type %s, int expected"), EndIndex.GetTypeName()).getData()));
              }
              let pArray = Array_._getArray();
              if (pArray.IsFrozen()) {
                $throw(new $.C4AulExecError().init(S("array write: array is readonly")));
              }
              pArray.SetSlice(StartIndex._getInt(), EndIndex._getInt(), Value);
              Array_.$assign(Value);
              this.PopValues(3);
              break;
            }
          case 41:
            if (pCPos.Par.i < 0) {
              this.PopValues(-pCPos.Par.i | 0);
            } else {
              this.PushNullVals(pCPos.Par.i);
            }
            break;
          case 51:
            fJump = true;
            pCPos = $oadd(pCPos, pCPos.Par.i);
            break;
          case 52:
            if (this.pCurVal.op_not()) {
              fJump = true;
              pCPos = $oadd(pCPos, pCPos.Par.i);
            } else {
              this.PopValue();
            }
            break;
          case 53:
            if (!this.pCurVal.op_not()) {
              fJump = true;
              pCPos = $oadd(pCPos, pCPos.Par.i);
            } else {
              this.PopValue();
            }
            break;
          case 54:
            {
              if (this.pCurVal.GetType() !== 0) {
                fJump = true;
                pCPos = $oadd(pCPos, pCPos.Par.i);
              } else {
                this.PopValue();
              }
              break;
            }
          case 55:
            if (this.pCurVal.op_not()) {
              fJump = true;
              pCPos = $oadd(pCPos, pCPos.Par.i);
            }
            this.PopValue();
            break;
          case 56:
            if (this.pCurVal.op_const_void_() != null) {
              fJump = true;
              pCPos = $oadd(pCPos, pCPos.Par.i);
            }
            this.PopValue();
            break;
          case 58:
            {
              if (this.iTraceStart >= 0) {
                let Buf = new $.StdStrBuf().init$pi8$b(S("T"));
                Buf.AppendChars(62, $u64n(this.ContextStackSize() - this.iTraceStart | 0));
                $.LogF(S("%s%s returned %s"), Buf.getData(), this.pCurCtx.Func.GetName(), this.pCurVal.GetDataString().getData());
              }
              let pReturn = this.pCurCtx.Return;
              if (pReturn == null) {
                let rVal = new $.C4Value().$copy(this.pCurVal);
                this.PopValuesUntil($oadd(this.pCurCtx.Pars, -1));
                this.PopContext();
                return rVal;
              }
              if (this.pCurVal !== pReturn) {
                pReturn.Set$C4Value(this.pCurVal);
              }
              this.PopContext();
              this.PopValuesUntil(pReturn);
              pCPos = $oadd(this.pCurCtx.CPos, 1);
              fJump = true;
              break;
            }
          case 16:
            {
              let pFunc = pCPos.Par.f;
              let pPars = $oadd($oadd(this.pCurVal, -pFunc.GetParCount()), 1);
              this.pCurCtx.CPos = pCPos;
              0;
              let pJump = this.Call(pFunc, pPars, pPars, null);
              if (pJump != null) {
                pCPos = pJump;
                fJump = true;
              }
              break;
            }
          case 14:
            if (!this.pCurVal.CheckConversion(1 /*C4V_Int*/)) {
              $throw(new $.C4AulExecError().init($.FormatString(S("Par: index of type %s, int expected"), this.pCurVal.GetTypeName()).getData()));
            }
            if (this.pCurVal._getInt() >= 0 && this.pCurVal._getInt() < this.pCurCtx.Func.GetParCount()) {
              this.pCurVal.Set$C4Value($oidx(this.pCurCtx.Pars, this.pCurVal._getInt()));
            } else {
              this.pCurVal.Set0();
            }
            break;
          case 15:
            if (this.pCurCtx.Obj == null || this.pCurCtx.Obj.Status === 0) {
              this.PushNullVals(1);
            } else {
              this.PushPropList(this.pCurCtx.Obj);
            }
            break;
          case 57:
            {
              0;
              let iItem = this.pCurVal._getInt();
              if (iItem === 0) {
                if (!$oidx(this.pCurVal, -1).CheckConversion(5 /*C4V_Array*/)) {
                  $throw(new $.C4AulExecError().init($.FormatString(S("for: array expected, but got %s"), $oidx(this.pCurVal, -1).GetTypeName()).getData()));
                }
              }
              let pArray = $oidx(this.pCurVal, -1)._getArray();
              if (this.pCurVal._getInt() >= pArray.GetSize()) {
                break;
              }
              $oidx(this.pCurVal, pCPos.Par.i).$assign(pArray.GetItem(iItem));
              this.pCurVal.SetInt(iItem + 1 | 0);
              pCPos = $oadd(pCPos, 2);
              fJump = true;
              break;
            }
          case 39:
          case 40:
            {
              let pPars = $oadd($oadd(this.pCurVal, -10), 1);
              let pTargetVal = $oadd(this.pCurVal, -10);
              let pDest = null;
              if (pTargetVal.CheckConversion(3 /*C4V_PropList*/)) {
                pDest = pTargetVal._getPropList();
              } else {
                $throw(new $.C4AulExecError().init($.FormatString(S("'->': invalid target type %s, expected proplist"), pTargetVal.GetTypeName()).getData()));
              }
              let pFunc = pDest.GetFunc$pC4String(pCPos.Par.s);
              if (pFunc == null && pCPos.bccType === 40) {
                this.PopValuesUntil(pTargetVal);
                pTargetVal.Set0();
                break;
              }
              if (pFunc == null) {
                $throw(new $.C4AulExecError().init($.FormatString(S("'->': no function \"%s\" in object \"%s\""), pCPos.Par.s.GetCStr(), pTargetVal.GetDataString().getData()).getData()));
              }
              this.pCurCtx.CPos = pCPos;
              0;
              if ($oadd(this.pCurVal, 1).$i - pPars.$i > pFunc.GetParCount()) {
                this.PopValues($oadd(this.pCurVal, 1).$i - pPars.$i - pFunc.GetParCount() | 0);
              } else {
                this.PushNullVals(pFunc.GetParCount() - ($oadd(this.pCurVal, 1).$i - pPars.$i) | 0);
              }
              let pNewCPos = this.Call(pFunc, pTargetVal, pPars, pDest);
              if (pNewCPos != null) {
                pCPos = pNewCPos;
                fJump = true;
              }
              break;
            }
          case 60:
            {
              let pDebug = $.C4AulDebug.GetDebugger();
              if (pDebug != null) {
                pDebug.DebugStep(pCPos, this.pCurVal);
              }
            }
            break;
        }
        if (!fJump) {
          pCPos = $oadd(pCPos, 1);
        }
      }
    } catch ($e1) {
      if ($e1 instanceof $.C4AulError) {
        0;
        this.pCurCtx.CPos = pCPos;
        $throw($e1);
      } else {
        throw $e1;
      }
    }
  }

  PushContext(rContext) {
    if (this.pCurCtx.$i >= $oadd($oadd($oat(this.Contexts, 0), $.MAX_CONTEXT_STACK$C4AulExec), -1).$i) {
      $throw(new $.C4AulExecError().init(S("context stack overflow")));
    }
    (this.pCurCtx = $oadd(this.pCurCtx, 1)).$assign(rContext);
    if (this.iTraceStart >= 0) {
      let Buf = new $.StdStrBuf().init$pi8$b(S("T"));
      Buf.AppendChars(62, $u64n(this.ContextStackSize() - this.iTraceStart | 0));
      this.pCurCtx.dump(new $.StdStrBuf().init$rStdStrBuf$b(Buf));
    }
    if (this.fProfiling) {
      this.pCurCtx.tTime.$assign($.C4TimeMilliseconds.Now());
    }
  }

  PopContext() {
    if (this.pCurCtx.$i < $oat(this.Contexts, 0).$i) {
      $throw(new $.C4AulExecError().init(S("internal error: context stack underflow")));
    }
    if (this.fProfiling) {
      let dt = op_sub$C4TimeMilliseconds$C4TimeMilliseconds($.C4TimeMilliseconds.Now(), this.pCurCtx.tTime) >>> 0;
      if (this.pCurCtx.Func != null) {
        this.pCurCtx.Func.tProfileTime = this.pCurCtx.Func.tProfileTime + dt >>> 0;
      }
    }
    if (this.iTraceStart >= 0) {
      if (this.ContextStackSize() <= this.iTraceStart) {
        this.iTraceStart = -1;
      }
    }
    this.pCurCtx = $oadd(this.pCurCtx, -1);
  }

  CheckOverflow(iCnt) {
    if (this.pCurVal.$i - $oat(this.Values, 0).$i >= ($.MAX_VALUE_STACK$C4AulExec - iCnt | 0)) {
      $throw(new $.C4AulExecError().init(S("value stack overflow, probably due to too deep recursion")));
    }
  }

  PushInt(i) {
    this.CheckOverflow(1);
    (this.pCurVal = $oadd(this.pCurVal, 1)).SetInt(i);
  }

  PushBool(b) {
    this.CheckOverflow(1);
    (this.pCurVal = $oadd(this.pCurVal, 1)).SetBool(b);
  }

  PushString(Str) {
    this.CheckOverflow(1);
    (this.pCurVal = $oadd(this.pCurVal, 1)).SetString(Str);
  }

  PushArray(Array_) {
    this.CheckOverflow(1);
    (this.pCurVal = $oadd(this.pCurVal, 1)).SetArray(Array_);
  }

  PushFunction(Fn) {
    this.CheckOverflow(1);
    (this.pCurVal = $oadd(this.pCurVal, 1)).SetFunction(Fn);
  }

  PushPropList(PropList) {
    this.CheckOverflow(1);
    (this.pCurVal = $oadd(this.pCurVal, 1)).SetPropList(PropList);
  }

  PushValue(rVal) {
    this.CheckOverflow(1);
    (this.pCurVal = $oadd(this.pCurVal, 1)).Set$C4Value(rVal);
  }

  PushNullVals(iCnt) {
    this.CheckOverflow(iCnt);
    this.pCurVal = $oadd(this.pCurVal, iCnt);
  }

  PopValue() {
    let $t1;
    0;
    ($t1 = this.pCurVal, this.pCurVal = $oadd(this.pCurVal, -1), $t1).Set0();
    return true;
  }

  PopValues(n) {
    let $t1, $t2;
    0;
    while (($t1 = n, n = n - 1 | 0, $t1) !== 0) {
      ($t2 = this.pCurVal, this.pCurVal = $oadd(this.pCurVal, -1), $t2).Set0();
    }
  }

  PopValuesUntil(pUntilVal) {
    let $t1;
    0;
    while (this.pCurVal.$i > pUntilVal.$i) {
      ($t1 = this.pCurVal, this.pCurVal = $oadd(this.pCurVal, -1), $t1).Set0();
    }
  }

  ContextStackSize() {
    return this.pCurCtx.$i - $oat(this.Contexts, 0).$i + 1 | 0;
  }

  ValueStackSize() {
    return this.pCurVal.$i - $oat(this.Values, 0).$i + 1 | 0;
  }

  LocalValueStackSize() {
    return (this.ContextStackSize() !== 0 ? this.pCurVal.$i - this.pCurCtx.Pars.$i - this.pCurCtx.Func.GetParCount() - this.pCurCtx.Func.VarNamed.iSize + 1 : this.pCurVal.$i - $oat(this.Values, 0).$i + 1) | 0;
  }

  CheckOpPars(Type1, Type2, opname) {
    let pPar1 = $oadd(this.pCurVal, -1);
    let pPar2 = this.pCurVal;
    if (!pPar1.CheckParConversion(Type1)) {
      $throw(new $.C4AulExecError().init($.FormatString(S("operator \"%s\" left side got %s, but expected %s"), opname, pPar1.GetTypeName(), $.GetC4VName(Type1)).getData()));
    }
    if (!pPar2.CheckParConversion(Type2)) {
      $throw(new $.C4AulExecError().init($.FormatString(S("operator \"%s\" right side got %s, but expected %s"), opname, pPar2.GetTypeName(), $.GetC4VName(Type2)).getData()));
    }
  }

  CheckOpPar(Type1, opname) {
    if (!this.pCurVal.CheckParConversion(Type1)) {
      $throw(new $.C4AulExecError().init($.FormatString(S("operator \"%s\": got %s, but expected %s"), opname, this.pCurVal.GetTypeName(), $.GetC4VName(Type1)).getData()));
    }
  }

  CheckArrayAccess(pStructure, pIndex) {
    if (pStructure.CheckConversion(5 /*C4V_Array*/)) {
      if (!pIndex.CheckConversion(1 /*C4V_Int*/)) {
        $throw(new $.C4AulExecError().init($.FormatString(S("array access: index of type %s, but expected int"), pIndex.GetTypeName()).getData()));
      }
      return 5 /*C4V_Array*/;
    } else if (pStructure.CheckConversion(3 /*C4V_PropList*/)) {
      if (!pIndex.CheckConversion(4 /*C4V_String*/)) {
        $throw(new $.C4AulExecError().init($.FormatString(S("proplist access: index of type %s, but expected string"), pIndex.GetTypeName()).getData()));
      }
      return 3 /*C4V_PropList*/;
    } else {
      $throw(new $.C4AulExecError().init($.FormatString(S("can't access %s as array or proplist"), pStructure.GetTypeName()).getData()));
    }
  }

  Call(pFunc, pReturn, pPars, pContext = null) {
    if (pContext == null) {
      0;
      pContext = this.pCurCtx.Obj;
    }
    pFunc.CheckParTypes(pPars, true);
    let pSFunc = pFunc.SFunc();
    if (pSFunc != null) {
      let ctx = new C4AulScriptContext().None();
      ctx.Obj = pContext;
      if (ctx.Obj != null && ctx.Obj.Status === 0) {
        $throw(new $.C4AulExecError().init(S("using removed object")));
      }
      ctx.Return = pReturn;
      ctx.Pars = pPars;
      ctx.Func = pSFunc;
      ctx.CPos = null;
      this.PushContext(ctx);
      return pSFunc.GetCode();
    } else {
      if (pContext != null && pContext.Status === 0) {
        $throw(new $.C4AulExecError().init(S("using removed object")));
      }
      if (true && $.Config.General.DebugRec !== 0) {
        let sCallText = new $.StdStrBuf();
        if (pContext != null && pContext.GetObject$v() != null) {
          sCallText.AppendFormat(S("Object(%d): "), pContext.GetObject$v().Number);
        }
        sCallText.Append$pi8(pFunc.GetName());
        sCallText.AppendChar(40);
        for (let i = 0; i < 10; i = i + 1 | 0) {
          if (i !== 0) {
            sCallText.AppendChar(44);
          }
          const rV = $oidx(pPars, i);
          if (rV.GetType() === 4) {
            let s = rV.getStr();
            if (s == null) {
              sCallText.Append$pi8(S("(Snull)"));
            } else {
              sCallText.Append$pi8(S("\""));
              sCallText.Append$StdStrBuf(s.GetData());
              sCallText.Append$pi8(S("\""));
            }
          } else {
            sCallText.Append$StdStrBuf(rV.GetDataString());
          }
        }
        sCallText.AppendChar(41);
        sCallText.AppendChar(59);
        $.AddDbgRec(154 /*RCT_AulFunc*/, sCallText.getData(), sCallText.getLength() + 1 | 0);
      }
      if (pReturn.$i > this.pCurVal.$i) {
        this.PushValue(pFunc.Exec$pC4PropList$pC4Value$b(pContext, pPars, true));
      } else {
        pReturn.Set$C4Value(pFunc.Exec$pC4PropList$pC4Value$b(pContext, pPars, true));
      }
      this.PopValuesUntil(pReturn);
      return null;
    }
  }

  $clone() { return new C4AulExec().$assign(this); }
  $assign(o) {
    this.pCurCtx = o.pCurCtx;
    this.pCurVal = o.pCurVal;
    this.iTraceStart = o.iTraceStart;
    this.fProfiling = o.fProfiling;
    this.tDirectExecStart.$assign(o.tDirectExecStart);
    this.tDirectExecTotal = o.tDirectExecTotal;
    this.pProfiledScript = o.pProfiledScript;
    this.Contexts = o.Contexts.slice();
    this.Values = o.Values.slice();
    return this;
  }
}

export class C4AulProfiler {
  Times = [];

  CollectEntry(pFunc, tProfileTime) {
    if (tProfileTime === 0) {
      return;
    }
    let e = new C4AulProfiler$Entry();
    e.pFunc = pFunc;
    e.tProfileTime = tProfileTime;
    $vpush(this.Times, e.$clone());
  }

  CollectTimes$pC4PropListStatic(p) {
    let pSFunc = null;
    for (let pFn = p.EnumerateOwnFuncs(); pFn != null; pFn = p.EnumerateOwnFuncs(pFn)) {
      if ((pSFunc = p.GetFunc$pC4String(pFn).SFunc()) != null) {
        this.CollectEntry(pSFunc, pSFunc.tProfileTime);
      }
    }
  }

  CollectTimes$v() {
    this.CollectTimes$pC4PropListStatic($.ScriptEngine.GetPropList());
    for (let pScript = $.ScriptEngine.Child0; pScript != null; pScript = pScript.Next) {
      this.CollectTimes$pC4PropListStatic(pScript.GetPropList$v());
    }
  }

  static ResetTimes$pC4PropListStatic(p) {
    let pSFunc = null;
    for (let pFn = p.EnumerateOwnFuncs(); pFn != null; pFn = p.EnumerateOwnFuncs(pFn)) {
      if ((pSFunc = p.GetFunc$pC4String(pFn).SFunc()) != null) {
        pSFunc.tProfileTime = 0;
      }
    }
  }

  static ResetTimes$v() {
    C4AulProfiler.ResetTimes$pC4PropListStatic($.ScriptEngine.GetPropList());
    for (let pScript = $.ScriptEngine.Child0; pScript != null; pScript = pScript.Next) {
      C4AulProfiler.ResetTimes$pC4PropListStatic(pScript.GetPropList$v());
    }
  }

  Show() {
    std_sort($rbegin(this.Times), $rend(this.Times));
    $.Log(S("Profiler statistics:"));
    $.Log(S("=============================="));
    for (const e of this.Times) {
      $.LogF(S("%05ums\t%s"), e.tProfileTime, e.pFunc != null ? e.pFunc.GetFullName().getData() : S("Direct exec"));
    }
    $.Log(S("=============================="));
  }

  static Abort() {
    $.AulExec.StopProfiling();
  }

  static StartProfiling(pScript) {
    $.AulExec.StartProfiling(pScript);
    if (pScript != null) {
      C4AulProfiler.ResetTimes$pC4PropListStatic(pScript.GetPropList$v());
    } else {
      C4AulProfiler.ResetTimes$v();
    }
  }

  static StopProfiling() {
    if (!$.AulExec.IsProfiling()) {
      return;
    }
    $.AulExec.StopProfiling();
    let Profiler = new C4AulProfiler().None();
    Profiler.CollectEntry(null, $.AulExec.tDirectExecTotal);
    if ($.AulExec.pProfiledScript != null) {
      Profiler.CollectTimes$pC4PropListStatic($.AulExec.pProfiledScript.GetPropList$v());
    } else {
      Profiler.CollectTimes$v();
    }
    Profiler.Show();
  }

  None() {
    this.Times = [];
    return this;
  }

  $clone() { return new C4AulProfiler().$assign(this); }
  $assign(o) {
    this.Times = o.Times.slice();
    return this;
  }
}

export class C4AulProfiler$Entry {
  pFunc = null;
  tProfileTime = 0;

  $clone() { return new C4AulProfiler$Entry().$assign(this); }
  $assign(o) {
    this.pFunc = o.pFunc;
    this.tProfileTime = o.tProfileTime;
    return this;
  }
}




export function $init(): void {
  $.MAX_CONTEXT_STACK$C4AulExec = 512;
  $.MAX_VALUE_STACK$C4AulExec = 1024;
  $.AulExec = new C4AulExec(); $.AulExec.init();
}

Object.assign($, { C4AulExec, C4AulProfiler, C4AulProfiler$Entry, C4AulScriptContext });
