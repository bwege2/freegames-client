// @ts-nocheck
// OpenClonk 36de799: src/script/C4AulScriptFunc.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $u64n } from '../../rt/int.ts';
import { P } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $vpush } from '../../rt/std.ts';
import { C4AulFunc } from './C4AulFunc.ts';

export class C4AulBCC {
  bccType = 61 /*AB_EOFN*/;
  Par = new C4AulBCC$$anon1();

  init$i32$i32(bccType, X) {
    this.bccType = bccType;
    this.Par = ((($o) => ($o.X = X, $o))(new C4AulBCC$$anon1()));
    C4AulBCC.prototype.IncRef.call(this);
    return this;
  }

  op_assign$mC4AulBCC(from) {
    this.DecRef();
    this.bccType = from.bccType;
    this.Par.$assign(from.Par);
    from.bccType = 61 /*AB_EOFN*/;
    return this;
  }

  $dtor() {
    C4AulBCC.prototype.DecRef.call(this);
  }

  IncRef() {
    switch (this.bccType) {
      case 59:
        if (!(this.Par.s != null)) break;
      case 44:
      case 39:
      case 40:
      case 10:
      case 11:
      case 2:
      case 3:
        this.Par.s.IncRef();
        break;
      case 46:
        this.Par.a.IncRef();
        break;
      default:
        break;
    }
  }

  DecRef() {
    switch (this.bccType) {
      case 59:
        if (!(this.Par.s != null)) break;
      case 44:
      case 39:
      case 40:
      case 10:
      case 11:
      case 2:
      case 3:
        this.Par.s.DecRef();
        break;
      case 46:
        this.Par.a.DecRef();
        break;
      default:
        break;
    }
  }

  $copy(from) {
    C4AulBCC.prototype.init$i32$i32.call(this, from.bccType, from.Par.X);
    return this;
  }
  $clone() { return new C4AulBCC().$copy(this); }
  $assign(from) {
    this.DecRef();
    this.bccType = from.bccType;
    this.Par.$assign(from.Par);
    this.IncRef();
    return this;
  }
}

export class C4AulBCC$$anon1 {
  $v = 0;
  get X() { const v = this.$v; return v === null ? 0 : v; }
  set X(v) { this.$v = v; }
  get i() { const v = this.$v; return v === null ? 0 : v; }
  set i(v) { this.$v = v; }
  get s() { const v = this.$v; return v === 0 ? null : v; }
  set s(v) { this.$v = v; }
  get p() { const v = this.$v; return v === 0 ? null : v; }
  set p(v) { this.$v = v; }
  get a() { const v = this.$v; return v === 0 ? null : v; }
  set a(v) { this.$v = v; }
  get f() { const v = this.$v; return v === 0 ? null : v; }
  set f(v) { this.$v = v; }
  $clone() { const u = new C4AulBCC$$anon1(); u.$v = this.$v; return u; }
  $assign(o) { this.$v = o.$v; return this; }
}

export class C4AulScriptFunc extends C4AulFunc {
  OwnerOverloaded = null;
  Code = [];
  PosForCode = [];
  ParCount = 0;
  ParType = new Int32Array(10);
  Script = null;
  VarNamed = new $.C4ValueMapNames();
  ParNamed = new $.C4ValueMapNames();
  pOrgScript = null;
  tProfileTime = 0;

  SetOverloaded(f) {
    if (this.OwnerOverloaded != null) {
      this.OwnerOverloaded.DecRef();
    }
    this.OwnerOverloaded = f;
    if (f != null) {
      f.IncRef();
    }
  }

  SFunc() {
    return this;
  }

  AddBCC(eType, X = 0, SPos = null) {
    $vpush(this.Code, new C4AulBCC().init$i32$i32(eType, X));
    this.PosForCode.push(SPos);
  }

  RemoveLastBCC() {
    this.Code.pop();
    this.PosForCode.pop();
  }

  ClearCode() {
    this.Code.length = 0;
    this.PosForCode.length = 0;
  }

  GetCodePos() {
    return this.Code.length | 0;
  }

  GetCodeByPos(iPos) {
    return this.Code[$u64n(iPos)];
  }

  GetLastCode() {
    return this.Code.length === 0 ? null : this.Code[this.Code.length - 1];
  }

  DumpByteCode() { /* not translated: a developer tool (prints bytecode to stderr) */ }

  AddPar(Idtf, type = 10 /*C4V_Any*/) {
    0;
    0;
    this.ParNamed.AddName(Idtf);
    this.ParType[this.ParCount] = type;
    this.ParCount = this.ParCount + 1 | 0;
  }

  init$pC4PropListStatic$pC4ScriptHost$pi8$pi8(Parent, pOrgScript, pName, Script) {
    super.init(Parent, pName);
    this.OwnerOverloaded = null;
    this.Code = [];
    this.PosForCode = [];
    this.ParCount = 0;
    this.Script = Script;
    this.VarNamed = new $.C4ValueMapNames();
    this.ParNamed = new $.C4ValueMapNames();
    this.pOrgScript = pOrgScript;
    this.tProfileTime = 0;
    let $t1;
    $t1 = this.ParType;
    for (let $i1 = 0; $i1 < $t1.length; $i1++) {
      const i = P($t1, $i1);
      i.a[i.o] = 10 /*C4V_Any*/;
    }
    C4AulScriptFunc.prototype.AddBCC.call(this, 61 /*AB_EOFN*/);
    return this;
  }

  init$pC4PropListStatic$C4AulScriptFunc(Parent, FromFunc) {
    super.init(Parent, FromFunc.GetName());
    this.OwnerOverloaded = null;
    this.Code = [];
    this.PosForCode = [];
    this.ParCount = FromFunc.ParCount;
    this.Script = FromFunc.Script;
    this.VarNamed = new $.C4ValueMapNames().$copy(FromFunc.VarNamed);
    this.ParNamed = new $.C4ValueMapNames().$copy(FromFunc.ParNamed);
    this.pOrgScript = FromFunc.pOrgScript;
    this.tProfileTime = 0;
    for (let i = 0; i < 10; i = i + 1 | 0) {
      this.ParType[i] = FromFunc.ParType[i];
    }
    C4AulScriptFunc.prototype.AddBCC.call(this, 61 /*AB_EOFN*/);
    return this;
  }

  $dtor() {
    if (this.OwnerOverloaded != null) {
      this.OwnerOverloaded.DecRef();
    }
    C4AulScriptFunc.prototype.ClearCode.call(this);
    super.$dtor();
  }

  ParseDirectExecFunc(Engine, context = null) {
    this.ClearCode();
    let state = new $.C4AulParse().init$pC4AulScriptFunc$pC4AulScriptContext$pC4AulScriptEngine(this, context, Engine);
    let func = state.Parse_DirectExec(this.Script, true);
    $.C4AulCompiler.Compile$pC4AulScriptFunc$pFunction(this, func);
  }

  ParseDirectExecStatement(Engine, context = null) {
    this.ClearCode();
    let state = new $.C4AulParse().init$pC4AulScriptFunc$pC4AulScriptContext$pC4AulScriptEngine(this, context, Engine);
    let func = state.Parse_DirectExec(this.Script, false);
    $.C4AulCompiler.Compile$pC4AulScriptFunc$pFunction(this, func);
  }

  GetPublic() {
    return true;
  }

  GetParCount() {
    return this.ParCount;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 10 /*C4V_Any*/;
  }

  Exec$pC4PropList$pC4Value$b(p, pPars, fPassErrors = false) {
    return $.AulExec.Exec$pC4AulScriptFunc$pC4PropList$pC4Value$b(this, p, pPars, fPassErrors);
  }

  GetLineOfCode(bcc) {
    return $.SGetLine(this.pOrgScript != null ? this.pOrgScript.GetScript() : this.Script, this.PosForCode[$u64n(bcc.$i - this.Code[0].$i)]);
  }

  GetCode() {
    0;
    return this.Code[0];
  }

  $clone() { return new C4AulScriptFunc().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.OwnerOverloaded = o.OwnerOverloaded;
    this.Code = o.Code.slice();
    this.PosForCode = o.PosForCode.slice();
    this.ParCount = o.ParCount;
    this.ParType = o.ParType.slice();
    this.Script = o.Script;
    this.VarNamed.$assign(o.VarNamed);
    this.ParNamed.$assign(o.ParNamed);
    this.pOrgScript = o.pOrgScript;
    this.tProfileTime = o.tProfileTime;
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4AulBCC, C4AulBCC$$anon1, C4AulScriptFunc });
