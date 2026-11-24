// @ts-nocheck
// OpenClonk 36de799: src/script/C4AulFunc.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { C4RefCnt } from './C4StringTable.ts';
import { $oarr, $oat, $oidx, $own, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $throw } from '../../rt/std.ts';

export class C4AulParSet {
  Par = $oarr(10, () => new $.C4Value().init$v());

  init$v() {
    this.Par = $own([
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
]);
    return this;
  }

  Copy(Pars, ParCount) {
    for (let i = 0; i < ParCount; i = i + 1 | 0) {
      this.Par[i].Set$C4Value($oidx(Pars, i));
    }
  }

  op_index(iIdx) {
    return this.Par[iIdx];
  }

  op_and() {
    return this;
  }

  init$C4Value$C4Value$C4Value$C4Value(pars, pars$2, pars$3, pars$4) {
    this.Par = $own([
  new $.C4Value().$copy(pars),
  new $.C4Value().$copy(pars$2),
  new $.C4Value().$copy(pars$3),
  new $.C4Value().$copy(pars$4),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
]);
    return this;
  }

  init$mi32(pars) {
    this.Par = $own([
  new $.C4Value().init$i32(pars),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
]);
    return this;
  }

  init$ri32(pars) {
    this.Par = $own([
  new $.C4Value().init$i32(pars.a[pars.o]),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
]);
    return this;
  }

  init$C4Value$C4Value$C4Value$C4Value$C4Value$C4Value$C4Value(pars, pars$2, pars$3, pars$4, pars$5, pars$6, pars$7) {
    this.Par = $own([
  new $.C4Value().$copy(pars),
  new $.C4Value().$copy(pars$2),
  new $.C4Value().$copy(pars$3),
  new $.C4Value().$copy(pars$4),
  new $.C4Value().$copy(pars$5),
  new $.C4Value().$copy(pars$6),
  new $.C4Value().$copy(pars$7),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
]);
    return this;
  }

  init$mpC4Object$mpC4Effect$C4Value$C4Value$C4Value$C4Value$C4Value$C4Value$C4Value(pars, pars$2, pars$3, pars$4, pars$5, pars$6, pars$7, pars$8, pars$9) {
    this.Par = $own([
  new $.C4Value().init$pC4Object(pars),
  new $.C4Value().init$pC4Effect(pars$2),
  new $.C4Value().$copy(pars$3),
  new $.C4Value().$copy(pars$4),
  new $.C4Value().$copy(pars$5),
  new $.C4Value().$copy(pars$6),
  new $.C4Value().$copy(pars$7),
  new $.C4Value().$copy(pars$8),
  new $.C4Value().$copy(pars$9),
  new $.C4Value().init$v(),
]);
    return this;
  }

  init$ri32$C4Value$C4Value$C4Value$C4Value(pars, pars$2, pars$3, pars$4, pars$5) {
    this.Par = $own([
  new $.C4Value().init$i32(pars.a[pars.o]),
  new $.C4Value().$copy(pars$2),
  new $.C4Value().$copy(pars$3),
  new $.C4Value().$copy(pars$4),
  new $.C4Value().$copy(pars$5),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
]);
    return this;
  }

  init$mpC4Object$mpC4Effect$ri32$C4Value$C4Value$C4Value$C4Value(pars, pars$2, pars$3, pars$4, pars$5, pars$6, pars$7) {
    this.Par = $own([
  new $.C4Value().init$pC4Object(pars),
  new $.C4Value().init$pC4Effect(pars$2),
  new $.C4Value().init$i32(pars$3.a[pars$3.o]),
  new $.C4Value().$copy(pars$4),
  new $.C4Value().$copy(pars$5),
  new $.C4Value().$copy(pars$6),
  new $.C4Value().$copy(pars$7),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
]);
    return this;
  }

  init$ri32$rb(pars, pars$2) {
    this.Par = $own([
  new $.C4Value().init$i32(pars.a[pars.o]),
  new $.C4Value().init$b(pars$2.a[pars$2.o]),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
]);
    return this;
  }

  init$mpC4Object$mpC4Effect$ri32$rb(pars, pars$2, pars$3, pars$4) {
    this.Par = $own([
  new $.C4Value().init$pC4Object(pars),
  new $.C4Value().init$pC4Effect(pars$2),
  new $.C4Value().init$i32(pars$3.a[pars$3.o]),
  new $.C4Value().init$b(pars$4.a[pars$4.o]),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
]);
    return this;
  }

  init$mpC4Object$mpC4Effect$ri32(pars, pars$2, pars$3) {
    this.Par = $own([
  new $.C4Value().init$pC4Object(pars),
  new $.C4Value().init$pC4Effect(pars$2),
  new $.C4Value().init$i32(pars$3.a[pars$3.o]),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
]);
    return this;
  }

  init$ri32$ri32$ri32(pars, pars$2, pars$3) {
    this.Par = $own([
  new $.C4Value().init$i32(pars.a[pars.o]),
  new $.C4Value().init$i32(pars$2.a[pars$2.o]),
  new $.C4Value().init$i32(pars$3.a[pars$3.o]),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
]);
    return this;
  }

  init$mpC4Object$mpC4Effect$ri32$ri32$ri32(pars, pars$2, pars$3, pars$4, pars$5) {
    this.Par = $own([
  new $.C4Value().init$pC4Object(pars),
  new $.C4Value().init$pC4Effect(pars$2),
  new $.C4Value().init$i32(pars$3.a[pars$3.o]),
  new $.C4Value().init$i32(pars$4.a[pars$4.o]),
  new $.C4Value().init$i32(pars$5.a[pars$5.o]),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
]);
    return this;
  }

  init$pi8$C4Value$C4Value$C4Value$C4Value(pars, pars$2, pars$3, pars$4, pars$5) {
    this.Par = $own([
  new $.C4Value().init$pi8(pars),
  new $.C4Value().$copy(pars$2),
  new $.C4Value().$copy(pars$3),
  new $.C4Value().$copy(pars$4),
  new $.C4Value().$copy(pars$5),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
]);
    return this;
  }

  init$pi8$mpC4Object$mpC4Effect$C4Value$C4Value$C4Value$C4Value(pars, pars$2, pars$3, pars$4, pars$5, pars$6, pars$7) {
    this.Par = $own([
  new $.C4Value().init$pi8(pars),
  new $.C4Value().init$pC4Object(pars$2),
  new $.C4Value().init$pC4Effect(pars$3),
  new $.C4Value().$copy(pars$4),
  new $.C4Value().$copy(pars$5),
  new $.C4Value().$copy(pars$6),
  new $.C4Value().$copy(pars$7),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
  new $.C4Value().init$v(),
]);
    return this;
  }

  $clone() { return new C4AulParSet().$assign(this); }
  $assign(o) {
    this.Par = o.Par.slice();
    return this;
  }
}

export class C4AulFunc extends C4RefCnt {
  Parent = null;
  Name = new $.C4RefCntPointer$C4String();
  MapNext = null;

  init(Parent, pName) {
    this.Parent = Parent;
    this.Name = new $.C4RefCntPointer$C4String().init$pC4String(pName != null ? $.Strings.RegString$pi8(pName) : null);
    this.MapNext = null;
    if (this.GetName() != null) {
      $.ScriptEngine.FuncLookUp.Add(this);
    }
    return this;
  }

  GetName() {
    return this.Name.op_const_C4String_() != null ? this.Name.op_arrow$v$c().GetCStr() : null;
  }

  GetFullName() {
    let r = new $.StdStrBuf();
    if (this.Parent == null) {
      r.Ref$pi8(S("(unowned) "));
    } else {
      r.Take$mStdStrBuf(this.Parent.GetDataString$v$c());
      r.AppendChar(46);
    }
    if (this.GetName() != null) {
      r.Append$StdStrBuf(this.Name.op_arrow$v$c().GetData());
    } else {
      r.Append$pi8(S("(unnamed)"));
    }
    return r;
  }

  $dtor() {
    if (this.GetName() != null) {
      $.ScriptEngine.FuncLookUp.Remove(this);
    }
  }

  SFunc() {
    return null;
  }

  GetPublic() {
    return false;
  }

  GetParCount() {
    return 10;
  }

  Exec$pC4PropList$pC4AulParSet$b(p = null, pPars = null, fPassErrors = false) {
    if (pPars == null) {
      return this.Exec$pC4PropList$pC4Value$b(p, $oat(new C4AulParSet().init$v().Par, 0), fPassErrors);
    }
    if (!this.CheckParTypes($oat(pPars.Par, 0), fPassErrors)) {
      return new $.C4Value().init$v();
    }
    return this.Exec$pC4PropList$pC4Value$b(p, $oat(pPars.Par, 0), fPassErrors);
  }

  CheckParTypes(pPars, fPassErrors) {
    let pTypes = this.GetParType();
    let parcount = this.GetParCount();
    for (let i = 0; i < parcount; i = i + 1 | 0) {
      if (!$oidx(pPars, i).CheckParConversion(pTypes.a[pTypes.o + i])) {
        let e = new $.C4AulExecError().init($.FormatString(S("call to \"%s\" parameter %d: passed %s, but expected %s"), this.GetName(), i + 1 | 0, $oidx(pPars, i).GetTypeName(), $.GetC4VName(pTypes.a[pTypes.o + i])).getData());
        if (fPassErrors) {
          $throw(e.$clone());
        } else {
          $.ScriptEngine.GetErrorHandler().OnError(e.what());
          return false;
        }
      }
    }
    return true;
  }

  $clone() { return new C4AulFunc().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Parent = o.Parent;
    this.Name.$assign(o.Name);
    this.MapNext = o.MapNext;
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4AulFunc, C4AulParSet });
