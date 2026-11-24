// @ts-nocheck
// OpenClonk 36de799: src/script/C4AulDefFunc.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $oidx, $ta, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $throw } from '../../rt/std.ts';
import { C4AulExecError } from './C4Aul.ts';
import { C4AulFunc } from './C4AulFunc.ts';

export class C4Void {

  $clone() { return new C4Void().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ThisImpl$C4Object {

  static Conv(_this, func) {
    let Obj = _this != null ? _this.GetObject$v() : null;
    if (Obj != null) {
      return Obj;
    } else {
      $throw(new NeedObjectContext().init(func.GetName()));
    }
  }

  $clone() { return new ThisImpl$C4Object().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ThisImpl$C4PropList {

  static Conv(_this, _func) {
    return _this;
  }

  $clone() { return new ThisImpl$C4PropList().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$pC4Def$C4PropList$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$pC4Def(pFunc(_this, C4ValueConv$i32._FromC4V(pPars)));
    pPars;
  }

  $clone() { return new ExecImpl$pC4Def$C4PropList$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$pC4Effect$C4PropList$pC4PropList$i32$i32$C4Value$C4Value$C4Value$C4Value {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$pC4Effect(pFunc(_this, C4ValueConv$pC4PropList._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2)), C4ValueConv$C4Value$2._FromC4V($oidx(pPars, 3)), C4ValueConv$C4Value$2._FromC4V($oidx(pPars, 4)), C4ValueConv$C4Value$2._FromC4V($oidx(pPars, 5)), C4ValueConv$C4Value$2._FromC4V($oidx(pPars, 6))));
    pPars;
  }

  $clone() { return new ExecImpl$pC4Effect$C4PropList$pC4PropList$i32$i32$C4Value$C4Value$C4Value$C4Value().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$pC4Effect$C4PropList$pC4String$pC4PropList$i32$i32 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$pC4Effect(pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars), C4ValueConv$pC4PropList._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2)), C4ValueConv$i32._FromC4V($oidx(pPars, 3))));
    pPars;
  }

  $clone() { return new ExecImpl$pC4Effect$C4PropList$pC4String$pC4PropList$i32$i32().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$pC4Object$C4Object$pC4Def {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$pC4Object(pFunc(_this, C4ValueConv$pC4Def._FromC4V(pPars)));
    pPars;
  }

  $clone() { return new ExecImpl$pC4Object$C4Object$pC4Def().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$pC4Object$C4Object$C4ID {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$pC4Object(pFunc(_this, C4ValueConv$C4ID._FromC4V(pPars)));
    pPars;
  }

  $clone() { return new ExecImpl$pC4Object$C4Object$C4ID().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$pC4Object$C4Object$pC4PropList$Nillable$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$pC4Object(pFunc(_this, C4ValueConv$pC4PropList._FromC4V(pPars), C4ValueConv$Nillable$i64._FromC4V($oidx(pPars, 1))));
    pPars;
  }

  $clone() { return new ExecImpl$pC4Object$C4Object$pC4PropList$Nillable$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$pC4Object$C4Object$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$pC4Object(pFunc(_this, C4ValueConv$i32._FromC4V(pPars)));
    pPars;
  }

  $clone() { return new ExecImpl$pC4Object$C4Object$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$pC4Object$C4Object {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$pC4Object(pFunc(_this));
    pPars;
  }

  $clone() { return new ExecImpl$pC4Object$C4Object().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$pC4Object$C4PropList$pC4PropList$i64$i64$Nillable$i64$i64$b$b {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$pC4Object(pFunc(_this, C4ValueConv$pC4PropList._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2)), C4ValueConv$Nillable$i64._FromC4V($oidx(pPars, 3)), C4ValueConv$i32._FromC4V($oidx(pPars, 4)), C4ValueConv$b._FromC4V($oidx(pPars, 5)), C4ValueConv$b._FromC4V($oidx(pPars, 6))));
    pPars;
  }

  $clone() { return new ExecImpl$pC4Object$C4PropList$pC4PropList$i64$i64$Nillable$i64$i64$b$b().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$pC4Object$C4PropList$pC4PropList$i64$i64$Nillable$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$pC4Object(pFunc(_this, C4ValueConv$pC4PropList._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2)), C4ValueConv$Nillable$i64._FromC4V($oidx(pPars, 3))));
    pPars;
  }

  $clone() { return new ExecImpl$pC4Object$C4PropList$pC4PropList$i64$i64$Nillable$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$pC4Object$C4PropList$pC4PropList$i64$i64$i64$i64$i64$pC4PropList {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$pC4Object(pFunc(_this, C4ValueConv$pC4PropList._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2)), C4ValueConv$i32._FromC4V($oidx(pPars, 3)), C4ValueConv$i32._FromC4V($oidx(pPars, 4)), C4ValueConv$i32._FromC4V($oidx(pPars, 5)), C4ValueConv$pC4PropList._FromC4V($oidx(pPars, 6))));
    pPars;
  }

  $clone() { return new ExecImpl$pC4Object$C4PropList$pC4PropList$i64$i64$i64$i64$i64$pC4PropList().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$pC4Object$C4PropList$pC4PropList {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$pC4Object(pFunc(_this, C4ValueConv$pC4PropList._FromC4V(pPars)));
    pPars;
  }

  $clone() { return new ExecImpl$pC4Object$C4PropList$pC4PropList().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$pC4Object$C4PropList$i64$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$pC4Object(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1))));
    pPars;
  }

  $clone() { return new ExecImpl$pC4Object$C4PropList$i64$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$pC4Object$C4PropList$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$pC4Object(pFunc(_this, C4ValueConv$i32._FromC4V(pPars)));
    pPars;
  }

  $clone() { return new ExecImpl$pC4Object$C4PropList$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$pC4Object$C4PropList {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$pC4Object(pFunc(_this));
    pPars;
  }

  $clone() { return new ExecImpl$pC4Object$C4PropList().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$pC4PropList$C4Object {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$pC4PropList(pFunc(_this));
    pPars;
  }

  $clone() { return new ExecImpl$pC4PropList$C4Object().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$pC4PropList$C4PropList$pC4PropList {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$pC4PropList(pFunc(_this, C4ValueConv$pC4PropList._FromC4V(pPars)));
    pPars;
  }

  $clone() { return new ExecImpl$pC4PropList$C4PropList$pC4PropList().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$pC4PropList$C4PropList$pC4String$i32$i32 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$pC4PropList(pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2))));
    pPars;
  }

  $clone() { return new ExecImpl$pC4PropList$C4PropList$pC4String$i32$i32().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$pC4PropList$C4PropList$C4Value$pC4ValueArray {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$pC4PropList(pFunc(_this, C4ValueConv$C4Value$2._FromC4V(pPars), C4ValueConv$pC4ValueArray._FromC4V($oidx(pPars, 1))));
    pPars;
  }

  $clone() { return new ExecImpl$pC4PropList$C4PropList$C4Value$pC4ValueArray().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$pC4PropList$C4PropList$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$pC4PropList(pFunc(_this, C4ValueConv$i32._FromC4V(pPars)));
    pPars;
  }

  $clone() { return new ExecImpl$pC4PropList$C4PropList$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$pC4String$C4Object {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$pC4String(pFunc(_this));
    pPars;
  }

  $clone() { return new ExecImpl$pC4String$C4Object().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$pC4String$C4PropList$pC4String {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$pC4String(pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars)));
    pPars;
  }

  $clone() { return new ExecImpl$pC4String$C4PropList$pC4String().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$pC4String$C4PropList$b {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$pC4String(pFunc(_this, C4ValueConv$b._FromC4V(pPars)));
    pPars;
  }

  $clone() { return new ExecImpl$pC4String$C4PropList$b().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$pC4String$C4PropList$C4Value {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$pC4String(pFunc(_this, C4ValueConv$C4Value$2._FromC4V(pPars)));
    pPars;
  }

  $clone() { return new ExecImpl$pC4String$C4PropList$C4Value().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$pC4String$C4PropList$i64$i64$b$b {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$pC4String(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$b._FromC4V($oidx(pPars, 2)), C4ValueConv$b._FromC4V($oidx(pPars, 3))));
    pPars;
  }

  $clone() { return new ExecImpl$pC4String$C4PropList$i64$i64$b$b().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$pC4String$C4PropList$i64$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$pC4String(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1))));
    pPars;
  }

  $clone() { return new ExecImpl$pC4String$C4PropList$i64$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$pC4String$C4PropList$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$pC4String(pFunc(_this, C4ValueConv$i32._FromC4V(pPars)));
    pPars;
  }

  $clone() { return new ExecImpl$pC4String$C4PropList$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$pC4String$C4PropList {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$pC4String(pFunc(_this));
    pPars;
  }

  $clone() { return new ExecImpl$pC4String$C4PropList().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$C4Value$C4Object$pC4String$pC4String$i32 {

  static Exec(pFunc, _this, pPars, _3) {
    return pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars), C4ValueConv$pC4String._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2)));
    pPars;
  }

  $clone() { return new ExecImpl$C4Value$C4Object$pC4String$pC4String$i32().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$C4Value$C4Object$pC4String$C4Value {

  static Exec(pFunc, _this, pPars, _3) {
    return pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars), C4ValueConv$C4Value$2._FromC4V($oidx(pPars, 1)));
    pPars;
  }

  $clone() { return new ExecImpl$C4Value$C4Object$pC4String$C4Value().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$C4Value$C4Object$pC4String {

  static Exec(pFunc, _this, pPars, _3) {
    return pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars));
    pPars;
  }

  $clone() { return new ExecImpl$C4Value$C4Object$pC4String().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$C4Value$C4Object$i32$i32 {

  static Exec(pFunc, _this, pPars, _3) {
    return pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)));
    pPars;
  }

  $clone() { return new ExecImpl$C4Value$C4Object$i32$i32().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$C4Value$C4PropList$pC4String$pC4PropList$i32$i32$pC4PropList$pC4Def$C4Value$C4Value$C4Value$C4Value {

  static Exec(pFunc, _this, pPars, _3) {
    return pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars), C4ValueConv$pC4PropList._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2)), C4ValueConv$i32._FromC4V($oidx(pPars, 3)), C4ValueConv$pC4PropList._FromC4V($oidx(pPars, 4)), C4ValueConv$pC4Def._FromC4V($oidx(pPars, 5)), C4ValueConv$C4Value$2._FromC4V($oidx(pPars, 6)), C4ValueConv$C4Value$2._FromC4V($oidx(pPars, 7)), C4ValueConv$C4Value$2._FromC4V($oidx(pPars, 8)), C4ValueConv$C4Value$2._FromC4V($oidx(pPars, 9)));
    pPars;
  }

  $clone() { return new ExecImpl$C4Value$C4PropList$pC4String$pC4PropList$i32$i32$pC4PropList$pC4Def$C4Value$C4Value$C4Value$C4Value().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$C4Value$C4PropList$pC4String$pC4PropList$i32$i32$C4Value$C4Value$C4Value$C4Value {

  static Exec(pFunc, _this, pPars, _3) {
    return pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars), C4ValueConv$pC4PropList._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2)), C4ValueConv$i32._FromC4V($oidx(pPars, 3)), C4ValueConv$C4Value$2._FromC4V($oidx(pPars, 4)), C4ValueConv$C4Value$2._FromC4V($oidx(pPars, 5)), C4ValueConv$C4Value$2._FromC4V($oidx(pPars, 6)), C4ValueConv$C4Value$2._FromC4V($oidx(pPars, 7)));
    pPars;
  }

  $clone() { return new ExecImpl$C4Value$C4PropList$pC4String$pC4PropList$i32$i32$C4Value$C4Value$C4Value$C4Value().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$C4Value$C4PropList$pC4String$pC4PropList {

  static Exec(pFunc, _this, pPars, _3) {
    return pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars), C4ValueConv$pC4PropList._FromC4V($oidx(pPars, 1)));
    pPars;
  }

  $clone() { return new ExecImpl$C4Value$C4PropList$pC4String$pC4PropList().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$C4Value$C4PropList$pC4String$pC4String$i32$i32 {

  static Exec(pFunc, _this, pPars, _3) {
    return pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars), C4ValueConv$pC4String._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2)), C4ValueConv$i32._FromC4V($oidx(pPars, 3)));
    pPars;
  }

  $clone() { return new ExecImpl$C4Value$C4PropList$pC4String$pC4String$i32$i32().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$C4Value$C4PropList$pC4String$pC4String$i32 {

  static Exec(pFunc, _this, pPars, _3) {
    return pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars), C4ValueConv$pC4String._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2)));
    pPars;
  }

  $clone() { return new ExecImpl$C4Value$C4PropList$pC4String$pC4String$i32().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$C4Value$C4PropList$pC4String$b {

  static Exec(pFunc, _this, pPars, _3) {
    return pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars), C4ValueConv$b._FromC4V($oidx(pPars, 1)));
    pPars;
  }

  $clone() { return new ExecImpl$C4Value$C4PropList$pC4String$b().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$C4Value$C4PropList$pC4String$i32 {

  static Exec(pFunc, _this, pPars, _3) {
    return pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)));
    pPars;
  }

  $clone() { return new ExecImpl$C4Value$C4PropList$pC4String$i32().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$C4Value$C4PropList$i32$C4ID$i32$i32 {

  static Exec(pFunc, _this, pPars, _3) {
    return pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$C4ID._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2)), C4ValueConv$i32._FromC4V($oidx(pPars, 3)));
    pPars;
  }

  $clone() { return new ExecImpl$C4Value$C4PropList$i32$C4ID$i32$i32().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$C4Value$C4PropList$i32$pC4String$C4Value {

  static Exec(pFunc, _this, pPars, _3) {
    return pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$pC4String._FromC4V($oidx(pPars, 1)), C4ValueConv$C4Value$2._FromC4V($oidx(pPars, 2)));
    pPars;
  }

  $clone() { return new ExecImpl$C4Value$C4PropList$i32$pC4String$C4Value().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$C4Value$C4PropList$i32$pC4String {

  static Exec(pFunc, _this, pPars, _3) {
    return pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$pC4String._FromC4V($oidx(pPars, 1)));
    pPars;
  }

  $clone() { return new ExecImpl$C4Value$C4PropList$i32$pC4String().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$pC4ValueArray$C4PropList$pC4PropList$i32$i32 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$pC4ValueArray(pFunc(_this, C4ValueConv$pC4PropList._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2))));
    pPars;
  }

  $clone() { return new ExecImpl$pC4ValueArray$C4PropList$pC4PropList$i32$i32().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$pC4ValueArray$C4PropList$pC4PropList {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$pC4ValueArray(pFunc(_this, C4ValueConv$pC4PropList._FromC4V(pPars)));
    pPars;
  }

  $clone() { return new ExecImpl$pC4ValueArray$C4PropList$pC4PropList().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$pC4ValueArray$C4PropList$C4Value$C4Value$C4Value$C4Value {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$pC4ValueArray(pFunc(_this, C4ValueConv$C4Value._FromC4V(pPars), C4ValueConv$C4Value._FromC4V($oidx(pPars, 1)), C4ValueConv$C4Value._FromC4V($oidx(pPars, 2)), C4ValueConv$C4Value._FromC4V($oidx(pPars, 3))));
    pPars;
  }

  $clone() { return new ExecImpl$pC4ValueArray$C4PropList$C4Value$C4Value$C4Value$C4Value().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$pC4ValueArray$C4PropList$C4Value$C4Value$C4Value {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$pC4ValueArray(pFunc(_this, C4ValueConv$C4Value._FromC4V(pPars), C4ValueConv$C4Value._FromC4V($oidx(pPars, 1)), C4ValueConv$C4Value._FromC4V($oidx(pPars, 2))));
    pPars;
  }

  $clone() { return new ExecImpl$pC4ValueArray$C4PropList$C4Value$C4Value$C4Value().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$pC4ValueArray$C4PropList$C4Value$C4Value {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$pC4ValueArray(pFunc(_this, C4ValueConv$C4Value._FromC4V(pPars), C4ValueConv$C4Value._FromC4V($oidx(pPars, 1))));
    pPars;
  }

  $clone() { return new ExecImpl$pC4ValueArray$C4PropList$C4Value$C4Value().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$pC4ValueArray$C4PropList$C4Value {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$pC4ValueArray(pFunc(_this, C4ValueConv$C4Value._FromC4V(pPars)));
    pPars;
  }

  $clone() { return new ExecImpl$pC4ValueArray$C4PropList$C4Value().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$pC4ValueArray$C4PropList$C4Value$2 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$pC4ValueArray(pFunc(_this, C4ValueConv$C4Value$2._FromC4V(pPars)));
    pPars;
  }

  $clone() { return new ExecImpl$pC4ValueArray$C4PropList$C4Value$2().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$pC4ValueArray$C4PropList$i32$i32$Nillable$i32$Nillable$i32$Nillable$i32$Nillable$i32$Nillable$i32$i32 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$pC4ValueArray(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$Nillable$i32._FromC4V($oidx(pPars, 2)), C4ValueConv$Nillable$i32._FromC4V($oidx(pPars, 3)), C4ValueConv$Nillable$i32._FromC4V($oidx(pPars, 4)), C4ValueConv$Nillable$i32._FromC4V($oidx(pPars, 5)), C4ValueConv$Nillable$i32._FromC4V($oidx(pPars, 6)), C4ValueConv$i32._FromC4V($oidx(pPars, 7))));
    pPars;
  }

  $clone() { return new ExecImpl$pC4ValueArray$C4PropList$i32$i32$Nillable$i32$Nillable$i32$Nillable$i32$Nillable$i32$Nillable$i32$i32().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$pC4ValueArray$C4PropList$i32$i32$i32$i32 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$pC4ValueArray(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2)), C4ValueConv$i32._FromC4V($oidx(pPars, 3))));
    pPars;
  }

  $clone() { return new ExecImpl$pC4ValueArray$C4PropList$i32$i32$i32$i32().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$pC4ValueArray$C4PropList$i32 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$pC4ValueArray(pFunc(_this, C4ValueConv$i32._FromC4V(pPars)));
    pPars;
  }

  $clone() { return new ExecImpl$pC4ValueArray$C4PropList$i32().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$pC4ValueArray$C4PropList$i64$i64$i64$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$pC4ValueArray(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2)), C4ValueConv$i32._FromC4V($oidx(pPars, 3))));
    pPars;
  }

  $clone() { return new ExecImpl$pC4ValueArray$C4PropList$i64$i64$i64$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$pC4ValueArray$C4PropList$i64$i64$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$pC4ValueArray(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2))));
    pPars;
  }

  $clone() { return new ExecImpl$pC4ValueArray$C4PropList$i64$i64$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$pC4ValueArray$C4PropList {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$pC4ValueArray(pFunc(_this));
    pPars;
  }

  $clone() { return new ExecImpl$pC4ValueArray$C4PropList().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$Nillable$pC4Def$C4Object {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$Nillable$pC4Def$2(pFunc(_this));
    pPars;
  }

  $clone() { return new ExecImpl$Nillable$pC4Def$C4Object().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$Nillable$pC4String$C4Object$Nillable$i32$Nillable$i32 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$Nillable$pC4String$2(pFunc(_this, C4ValueConv$Nillable$i32._FromC4V(pPars), C4ValueConv$Nillable$i32._FromC4V($oidx(pPars, 1))));
    pPars;
  }

  $clone() { return new ExecImpl$Nillable$pC4String$C4Object$Nillable$i32$Nillable$i32().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$Nillable$pC4String$C4PropList$pC4String$pC4String$pC4String$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$Nillable$pC4String$2(pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars), C4ValueConv$pC4String._FromC4V($oidx(pPars, 1)), C4ValueConv$pC4String._FromC4V($oidx(pPars, 2)), C4ValueConv$i32._FromC4V($oidx(pPars, 3))));
    pPars;
  }

  $clone() { return new ExecImpl$Nillable$pC4String$C4PropList$pC4String$pC4String$pC4String$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$Nillable$pC4String$C4PropList$pC4String$pC4String$pC4String {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$Nillable$pC4String$2(pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars), C4ValueConv$pC4String._FromC4V($oidx(pPars, 1)), C4ValueConv$pC4String._FromC4V($oidx(pPars, 2))));
    pPars;
  }

  $clone() { return new ExecImpl$Nillable$pC4String$C4PropList$pC4String$pC4String$pC4String().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$Nillable$pC4String$C4PropList$i32$Nillable$pC4String$i32 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$Nillable$pC4String$2(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$Nillable$pC4String._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2))));
    pPars;
  }

  $clone() { return new ExecImpl$Nillable$pC4String$C4PropList$i32$Nillable$pC4String$i32().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$Nillable$pC4String$C4PropList$i32 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$Nillable$pC4String$2(pFunc(_this, C4ValueConv$i32._FromC4V(pPars)));
    pPars;
  }

  $clone() { return new ExecImpl$Nillable$pC4String$C4PropList$i32().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$Nillable$pC4ValueArray$C4PropList$pC4String$pC4String$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$Nillable$pC4ValueArray$2(pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars), C4ValueConv$pC4String._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2))));
    pPars;
  }

  $clone() { return new ExecImpl$Nillable$pC4ValueArray$C4PropList$pC4String$pC4String$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$Nillable$pC4ValueArray$C4PropList$Nillable$i32 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$Nillable$pC4ValueArray$2(pFunc(_this, C4ValueConv$Nillable$i32._FromC4V(pPars)));
    pPars;
  }

  $clone() { return new ExecImpl$Nillable$pC4ValueArray$C4PropList$Nillable$i32().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$Nillable$pC4ValueArray$C4PropList {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$Nillable$pC4ValueArray$2(pFunc(_this));
    pPars;
  }

  $clone() { return new ExecImpl$Nillable$pC4ValueArray$C4PropList().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$Nillable$i32$C4Object$pC4PropList$pC4String$pC4String$pC4ValueArray$i32$i32 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$Nillable$i32$2(pFunc(_this, C4ValueConv$pC4PropList._FromC4V(pPars), C4ValueConv$pC4String._FromC4V($oidx(pPars, 1)), C4ValueConv$pC4String._FromC4V($oidx(pPars, 2)), C4ValueConv$pC4ValueArray._FromC4V($oidx(pPars, 3)), C4ValueConv$i32._FromC4V($oidx(pPars, 4)), C4ValueConv$i32._FromC4V($oidx(pPars, 5))));
    pPars;
  }

  $clone() { return new ExecImpl$Nillable$i32$C4Object$pC4PropList$pC4String$pC4String$pC4ValueArray$i32$i32().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$Nillable$i32$C4Object$pC4String$pC4ValueArray$i32$pC4ValueArray$Nillable$i32$Nillable$i32 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$Nillable$i32$2(pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars), C4ValueConv$pC4ValueArray._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2)), C4ValueConv$pC4ValueArray._FromC4V($oidx(pPars, 3)), C4ValueConv$Nillable$i32._FromC4V($oidx(pPars, 4)), C4ValueConv$Nillable$i32._FromC4V($oidx(pPars, 5))));
    pPars;
  }

  $clone() { return new ExecImpl$Nillable$i32$C4Object$pC4String$pC4ValueArray$i32$pC4ValueArray$Nillable$i32$Nillable$i32().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$Nillable$i32$C4Object$pC4String$Nillable$i32 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$Nillable$i32$2(pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars), C4ValueConv$Nillable$i32._FromC4V($oidx(pPars, 1))));
    pPars;
  }

  $clone() { return new ExecImpl$Nillable$i32$C4Object$pC4String$Nillable$i32().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$Nillable$i32$C4Object$pC4String$i32$pC4ValueArray$Nillable$pC4ValueArray$Nillable$i32$Nillable$i32 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$Nillable$i32$2(pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$pC4ValueArray._FromC4V($oidx(pPars, 2)), C4ValueConv$Nillable$pC4ValueArray._FromC4V($oidx(pPars, 3)), C4ValueConv$Nillable$i32._FromC4V($oidx(pPars, 4)), C4ValueConv$Nillable$i32._FromC4V($oidx(pPars, 5))));
    pPars;
  }

  $clone() { return new ExecImpl$Nillable$i32$C4Object$pC4String$i32$pC4ValueArray$Nillable$pC4ValueArray$Nillable$i32$Nillable$i32().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$Nillable$i32$C4Object$Nillable$i32$Nillable$i32 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$Nillable$i32$2(pFunc(_this, C4ValueConv$Nillable$i32._FromC4V(pPars), C4ValueConv$Nillable$i32._FromC4V($oidx(pPars, 1))));
    pPars;
  }

  $clone() { return new ExecImpl$Nillable$i32$C4Object$Nillable$i32$Nillable$i32().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$Nillable$i32$C4Object$i32$Nillable$i32 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$Nillable$i32$2(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$Nillable$i32._FromC4V($oidx(pPars, 1))));
    pPars;
  }

  $clone() { return new ExecImpl$Nillable$i32$C4Object$i32$Nillable$i32().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$Nillable$i32$C4PropList$pC4String {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$Nillable$i32$2(pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars)));
    pPars;
  }

  $clone() { return new ExecImpl$Nillable$i32$C4PropList$pC4String().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$Nillable$i32$C4PropList$C4Value$Nillable$i32 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$Nillable$i32$2(pFunc(_this, C4ValueConv$C4Value$2._FromC4V(pPars), C4ValueConv$Nillable$i32._FromC4V($oidx(pPars, 1))));
    pPars;
  }

  $clone() { return new ExecImpl$Nillable$i32$C4PropList$C4Value$Nillable$i32().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$Nillable$i64$C4Object$i64$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$Nillable$i64$2(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1))));
    pPars;
  }

  $clone() { return new ExecImpl$Nillable$i64$C4Object$i64$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$Nillable$i64$C4Object$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$Nillable$i64$2(pFunc(_this, C4ValueConv$i32._FromC4V(pPars)));
    pPars;
  }

  $clone() { return new ExecImpl$Nillable$i64$C4Object$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$Nillable$i64$C4Object {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$Nillable$i64$2(pFunc(_this));
    pPars;
  }

  $clone() { return new ExecImpl$Nillable$i64$C4Object().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$Nillable$i64$C4PropList$pC4String$pC4String {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$Nillable$i64$2(pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars), C4ValueConv$pC4String._FromC4V($oidx(pPars, 1))));
    pPars;
  }

  $clone() { return new ExecImpl$Nillable$i64$C4PropList$pC4String$pC4String().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$Nillable$i64$C4PropList$pC4String$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$Nillable$i64$2(pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1))));
    pPars;
  }

  $clone() { return new ExecImpl$Nillable$i64$C4PropList$pC4String$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$Nillable$i64$C4PropList$pC4String {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$Nillable$i64$2(pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars)));
    pPars;
  }

  $clone() { return new ExecImpl$Nillable$i64$C4PropList$pC4String().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$Nillable$i64$C4PropList$i64$i64$i64$i64$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$Nillable$i64$2(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2)), C4ValueConv$i32._FromC4V($oidx(pPars, 3)), C4ValueConv$i32._FromC4V($oidx(pPars, 4))));
    pPars;
  }

  $clone() { return new ExecImpl$Nillable$i64$C4PropList$i64$i64$i64$i64$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$Nillable$i64$C4PropList$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$Nillable$i64$2(pFunc(_this, C4ValueConv$i32._FromC4V(pPars)));
    pPars;
  }

  $clone() { return new ExecImpl$Nillable$i64$C4PropList$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$Nillable$i64$C4PropList {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$Nillable$i64$2(pFunc(_this));
    pPars;
  }

  $clone() { return new ExecImpl$Nillable$i64$C4PropList().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4Object$pC4Def$pC4Object$i64$pC4String$i64$i64$b$C4ID {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$pC4Def._FromC4V(pPars), C4ValueConv$pC4Object._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2)), C4ValueConv$pC4String._FromC4V($oidx(pPars, 3)), C4ValueConv$i32._FromC4V($oidx(pPars, 4)), C4ValueConv$i32._FromC4V($oidx(pPars, 5)), C4ValueConv$b._FromC4V($oidx(pPars, 6)), C4ValueConv$C4ID._FromC4V($oidx(pPars, 7))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4Object$pC4Def$pC4Object$i64$pC4String$i64$i64$b$C4ID().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4Object$C4ID {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$C4ID._FromC4V(pPars)));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4Object$C4ID().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4Object$pC4Object$b {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$pC4Object._FromC4V(pPars), C4ValueConv$b._FromC4V($oidx(pPars, 1))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4Object$pC4Object$b().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4Object$pC4Object$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$pC4Object._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4Object$pC4Object$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4Object$pC4Object {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$pC4Object._FromC4V(pPars)));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4Object$pC4Object().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4Object$pC4String$pC4Def$i64$i64$pC4String$i64$pC4Object {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars), C4ValueConv$pC4Def._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2)), C4ValueConv$i32._FromC4V($oidx(pPars, 3)), C4ValueConv$pC4String._FromC4V($oidx(pPars, 4)), C4ValueConv$i32._FromC4V($oidx(pPars, 5)), C4ValueConv$pC4Object._FromC4V($oidx(pPars, 6))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4Object$pC4String$pC4Def$i64$i64$pC4String$i64$pC4Object().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4Object$pC4String$pC4Object$pC4Object$b {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars), C4ValueConv$pC4Object._FromC4V($oidx(pPars, 1)), C4ValueConv$pC4Object._FromC4V($oidx(pPars, 2)), C4ValueConv$b._FromC4V($oidx(pPars, 3))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4Object$pC4String$pC4Object$pC4Object$b().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4Object$pC4String$pC4Object$C4Value$i32$pC4Object$C4Value$i32 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars), C4ValueConv$pC4Object._FromC4V($oidx(pPars, 1)), C4ValueConv$C4Value$2._FromC4V($oidx(pPars, 2)), C4ValueConv$i32._FromC4V($oidx(pPars, 3)), C4ValueConv$pC4Object._FromC4V($oidx(pPars, 4)), C4ValueConv$C4Value$2._FromC4V($oidx(pPars, 5)), C4ValueConv$i32._FromC4V($oidx(pPars, 6))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4Object$pC4String$pC4Object$C4Value$i32$pC4Object$C4Value$i32().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4Object$pC4String$pC4Object$C4Value$i32$pC4Object$i32$C4Value$i32$i32 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars), C4ValueConv$pC4Object._FromC4V($oidx(pPars, 1)), C4ValueConv$C4Value$2._FromC4V($oidx(pPars, 2)), C4ValueConv$i32._FromC4V($oidx(pPars, 3)), C4ValueConv$pC4Object._FromC4V($oidx(pPars, 4)), C4ValueConv$i32._FromC4V($oidx(pPars, 5)), C4ValueConv$C4Value$2._FromC4V($oidx(pPars, 6)), C4ValueConv$i32._FromC4V($oidx(pPars, 7)), C4ValueConv$i32._FromC4V($oidx(pPars, 8))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4Object$pC4String$pC4Object$C4Value$i32$pC4Object$i32$C4Value$i32$i32().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4Object$pC4String$pC4String$pC4Def$i32$C4Value$pC4String$i32$C4Value$C4Value {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars), C4ValueConv$pC4String._FromC4V($oidx(pPars, 1)), C4ValueConv$pC4Def._FromC4V($oidx(pPars, 2)), C4ValueConv$i32._FromC4V($oidx(pPars, 3)), C4ValueConv$C4Value$2._FromC4V($oidx(pPars, 4)), C4ValueConv$pC4String._FromC4V($oidx(pPars, 5)), C4ValueConv$i32._FromC4V($oidx(pPars, 6)), C4ValueConv$C4Value$2._FromC4V($oidx(pPars, 7)), C4ValueConv$C4Value$2._FromC4V($oidx(pPars, 8))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4Object$pC4String$pC4String$pC4Def$i32$C4Value$pC4String$i32$C4Value$C4Value().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4Object$pC4String$pC4String$pC4ValueArray$pC4ValueArray$C4Value$pC4PropList$i32 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars), C4ValueConv$pC4String._FromC4V($oidx(pPars, 1)), C4ValueConv$pC4ValueArray._FromC4V($oidx(pPars, 2)), C4ValueConv$pC4ValueArray._FromC4V($oidx(pPars, 3)), C4ValueConv$C4Value._FromC4V($oidx(pPars, 4)), C4ValueConv$pC4PropList._FromC4V($oidx(pPars, 5)), C4ValueConv$i32._FromC4V($oidx(pPars, 6))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4Object$pC4String$pC4String$pC4ValueArray$pC4ValueArray$C4Value$pC4PropList$i32().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4Object$pC4String$i32 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4Object$pC4String$i32().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4Object$Nillable$i32$pC4ValueArray$Nillable$i32 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$Nillable$i32._FromC4V(pPars), C4ValueConv$pC4ValueArray._FromC4V($oidx(pPars, 1)), C4ValueConv$Nillable$i32._FromC4V($oidx(pPars, 2))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4Object$Nillable$i32$pC4ValueArray$Nillable$i32().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4Object$Nillable$i32$Nillable$i32 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$Nillable$i32._FromC4V(pPars), C4ValueConv$Nillable$i32._FromC4V($oidx(pPars, 1))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4Object$Nillable$i32$Nillable$i32().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4Object$Nillable$i64$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$Nillable$i64._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4Object$Nillable$i64$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4Object$b$pC4Def$b {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$b._FromC4V(pPars), C4ValueConv$pC4Def._FromC4V($oidx(pPars, 1)), C4ValueConv$b._FromC4V($oidx(pPars, 2))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4Object$b$pC4Def$b().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4Object$b$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$b._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4Object$b$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4Object$i32 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$i32._FromC4V(pPars)));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4Object$i32().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4Object$i64$pC4ValueArray {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$pC4ValueArray._FromC4V($oidx(pPars, 1))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4Object$i64$pC4ValueArray().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4Object$i64$Nillable$pC4String$Nillable$pC4String {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$Nillable$pC4String._FromC4V($oidx(pPars, 1)), C4ValueConv$Nillable$pC4String._FromC4V($oidx(pPars, 2))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4Object$i64$Nillable$pC4String$Nillable$pC4String().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4Object$i64$b {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$b._FromC4V($oidx(pPars, 1))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4Object$i64$b().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4Object$i64$i64$i64$i64$i64$i64$i64$i64$i64$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2)), C4ValueConv$i32._FromC4V($oidx(pPars, 3)), C4ValueConv$i32._FromC4V($oidx(pPars, 4)), C4ValueConv$i32._FromC4V($oidx(pPars, 5)), C4ValueConv$i32._FromC4V($oidx(pPars, 6)), C4ValueConv$i32._FromC4V($oidx(pPars, 7)), C4ValueConv$i32._FromC4V($oidx(pPars, 8)), C4ValueConv$i32._FromC4V($oidx(pPars, 9))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4Object$i64$i64$i64$i64$i64$i64$i64$i64$i64$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4Object$i64$i64$i64$i64$i64$i64$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2)), C4ValueConv$i32._FromC4V($oidx(pPars, 3)), C4ValueConv$i32._FromC4V($oidx(pPars, 4)), C4ValueConv$i32._FromC4V($oidx(pPars, 5)), C4ValueConv$i32._FromC4V($oidx(pPars, 6))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4Object$i64$i64$i64$i64$i64$i64$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4Object$i64$i64$i64$i64$i64$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2)), C4ValueConv$i32._FromC4V($oidx(pPars, 3)), C4ValueConv$i32._FromC4V($oidx(pPars, 4)), C4ValueConv$i32._FromC4V($oidx(pPars, 5))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4Object$i64$i64$i64$i64$i64$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4Object$i64$i64$i64$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2)), C4ValueConv$i32._FromC4V($oidx(pPars, 3))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4Object$i64$i64$i64$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4Object$i64$i64$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4Object$i64$i64$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4Object$i64$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4Object$i64$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4Object$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$i32._FromC4V(pPars)));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4Object$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4Object {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4Object().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$pC4Def {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$pC4Def._FromC4V(pPars)));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$pC4Def().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$pC4Object$b$pC4String$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$pC4Object._FromC4V(pPars), C4ValueConv$b._FromC4V($oidx(pPars, 1)), C4ValueConv$pC4String._FromC4V($oidx(pPars, 2)), C4ValueConv$i32._FromC4V($oidx(pPars, 3))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$pC4Object$b$pC4String$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$pC4Object$b {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$pC4Object._FromC4V(pPars), C4ValueConv$b._FromC4V($oidx(pPars, 1))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$pC4Object$b().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$pC4Object$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$pC4Object._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$pC4Object$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$pC4PropList$pC4ValueArray {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$pC4PropList._FromC4V(pPars), C4ValueConv$pC4ValueArray._FromC4V($oidx(pPars, 1))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$pC4PropList$pC4ValueArray().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$pC4PropList$Nillable$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$pC4PropList._FromC4V(pPars), C4ValueConv$Nillable$i64._FromC4V($oidx(pPars, 1))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$pC4PropList$Nillable$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$pC4PropList$b {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$pC4PropList._FromC4V(pPars), C4ValueConv$b._FromC4V($oidx(pPars, 1))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$pC4PropList$b().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$pC4PropList$C4Value$pC4ValueArray$i32 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$pC4PropList._FromC4V(pPars), C4ValueConv$C4Value$2._FromC4V($oidx(pPars, 1)), C4ValueConv$pC4ValueArray._FromC4V($oidx(pPars, 2)), C4ValueConv$i32._FromC4V($oidx(pPars, 3))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$pC4PropList$C4Value$pC4ValueArray$i32().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$pC4PropList$i32$i32$pC4Object {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$pC4PropList._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2)), C4ValueConv$pC4Object._FromC4V($oidx(pPars, 3))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$pC4PropList$i32$i32$pC4Object().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$pC4PropList$i32$i32 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$pC4PropList._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$pC4PropList$i32$i32().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$pC4String$pC4Object$Nillable$i64$i64$i64$i64$C4ID$pC4PropList$i64$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars), C4ValueConv$pC4Object._FromC4V($oidx(pPars, 1)), C4ValueConv$Nillable$i64._FromC4V($oidx(pPars, 2)), C4ValueConv$i32._FromC4V($oidx(pPars, 3)), C4ValueConv$i32._FromC4V($oidx(pPars, 4)), C4ValueConv$i32._FromC4V($oidx(pPars, 5)), C4ValueConv$C4ID._FromC4V($oidx(pPars, 6)), C4ValueConv$pC4PropList._FromC4V($oidx(pPars, 7)), C4ValueConv$i32._FromC4V($oidx(pPars, 8)), C4ValueConv$i32._FromC4V($oidx(pPars, 9))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$pC4String$pC4Object$Nillable$i64$i64$i64$i64$C4ID$pC4PropList$i64$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$pC4String$pC4PropList$pC4Effect$b {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars), C4ValueConv$pC4PropList._FromC4V($oidx(pPars, 1)), C4ValueConv$pC4Effect._FromC4V($oidx(pPars, 2)), C4ValueConv$b._FromC4V($oidx(pPars, 3))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$pC4String$pC4PropList$pC4Effect$b().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$pC4String$pC4PropList$pC4ValueArray {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars), C4ValueConv$pC4PropList._FromC4V($oidx(pPars, 1)), C4ValueConv$pC4ValueArray._FromC4V($oidx(pPars, 2))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$pC4String$pC4PropList$pC4ValueArray().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$pC4String$pC4PropList {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars), C4ValueConv$pC4PropList._FromC4V($oidx(pPars, 1))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$pC4String$pC4PropList().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$pC4String$pC4String$pC4String {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars), C4ValueConv$pC4String._FromC4V($oidx(pPars, 1)), C4ValueConv$pC4String._FromC4V($oidx(pPars, 2))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$pC4String$pC4String$pC4String().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$pC4String$pC4String {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars), C4ValueConv$pC4String._FromC4V($oidx(pPars, 1))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$pC4String$pC4String().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$pC4String$C4Value$C4Value$C4Value$C4Value$C4Value$pC4PropList$i32 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars), C4ValueConv$C4Value._FromC4V($oidx(pPars, 1)), C4ValueConv$C4Value._FromC4V($oidx(pPars, 2)), C4ValueConv$C4Value._FromC4V($oidx(pPars, 3)), C4ValueConv$C4Value._FromC4V($oidx(pPars, 4)), C4ValueConv$C4Value._FromC4V($oidx(pPars, 5)), C4ValueConv$pC4PropList._FromC4V($oidx(pPars, 6)), C4ValueConv$i32._FromC4V($oidx(pPars, 7))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$pC4String$C4Value$C4Value$C4Value$C4Value$C4Value$pC4PropList$i32().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$pC4String$Nillable$i64$Nillable$i64$pC4String {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars), C4ValueConv$Nillable$i64._FromC4V($oidx(pPars, 1)), C4ValueConv$Nillable$i64._FromC4V($oidx(pPars, 2)), C4ValueConv$pC4String._FromC4V($oidx(pPars, 3))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$pC4String$Nillable$i64$Nillable$i64$pC4String().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$pC4String$b$Nillable$i64$Nillable$i64$i64$i64$i64$pC4PropList {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars), C4ValueConv$b._FromC4V($oidx(pPars, 1)), C4ValueConv$Nillable$i64._FromC4V($oidx(pPars, 2)), C4ValueConv$Nillable$i64._FromC4V($oidx(pPars, 3)), C4ValueConv$i32._FromC4V($oidx(pPars, 4)), C4ValueConv$i32._FromC4V($oidx(pPars, 5)), C4ValueConv$i32._FromC4V($oidx(pPars, 6)), C4ValueConv$pC4PropList._FromC4V($oidx(pPars, 7))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$pC4String$b$Nillable$i64$Nillable$i64$i64$i64$i64$pC4PropList().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$pC4String$b$b {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars), C4ValueConv$b._FromC4V($oidx(pPars, 1)), C4ValueConv$b._FromC4V($oidx(pPars, 2))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$pC4String$b$b().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$pC4String$b$i64$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars), C4ValueConv$b._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2)), C4ValueConv$i32._FromC4V($oidx(pPars, 3))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$pC4String$b$i64$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$pC4String$C4Value$pC4PropList {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars), C4ValueConv$C4Value$2._FromC4V($oidx(pPars, 1)), C4ValueConv$pC4PropList._FromC4V($oidx(pPars, 2))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$pC4String$C4Value$pC4PropList().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$pC4String$i32$i32$pC4Object {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2)), C4ValueConv$pC4Object._FromC4V($oidx(pPars, 3))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$pC4String$i32$i32$pC4Object().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$pC4String$i64$i64$Nillable$i64$Nillable$i64$i64$i64$pC4PropList {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2)), C4ValueConv$Nillable$i64._FromC4V($oidx(pPars, 3)), C4ValueConv$Nillable$i64._FromC4V($oidx(pPars, 4)), C4ValueConv$i32._FromC4V($oidx(pPars, 5)), C4ValueConv$i32._FromC4V($oidx(pPars, 6)), C4ValueConv$pC4PropList._FromC4V($oidx(pPars, 7))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$pC4String$i64$i64$Nillable$i64$Nillable$i64$i64$i64$pC4PropList().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$pC4String$i64$i64$i64$C4ID {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2)), C4ValueConv$i32._FromC4V($oidx(pPars, 3)), C4ValueConv$C4ID._FromC4V($oidx(pPars, 4))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$pC4String$i64$i64$i64$C4ID().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$pC4String$i64$i64$i64$i64$i64$i64$i64$i64$C4Value {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2)), C4ValueConv$i32._FromC4V($oidx(pPars, 3)), C4ValueConv$i32._FromC4V($oidx(pPars, 4)), C4ValueConv$i32._FromC4V($oidx(pPars, 5)), C4ValueConv$i32._FromC4V($oidx(pPars, 6)), C4ValueConv$i32._FromC4V($oidx(pPars, 7)), C4ValueConv$i32._FromC4V($oidx(pPars, 8)), C4ValueConv$C4Value$2._FromC4V($oidx(pPars, 9))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$pC4String$i64$i64$i64$i64$i64$i64$i64$i64$C4Value().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$pC4String$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$pC4String$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$pC4String {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars)));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$pC4String().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$pC4ValueArray$pC4String$b {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$pC4ValueArray._FromC4V(pPars), C4ValueConv$pC4String._FromC4V($oidx(pPars, 1)), C4ValueConv$b._FromC4V($oidx(pPars, 2))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$pC4ValueArray$pC4String$b().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$pC4ValueArray$b {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$pC4ValueArray._FromC4V(pPars), C4ValueConv$b._FromC4V($oidx(pPars, 1))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$pC4ValueArray$b().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$pC4ValueArray$i32$b {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$pC4ValueArray._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$b._FromC4V($oidx(pPars, 2))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$pC4ValueArray$i32$b().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$Nillable$i64$C4ID$b {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$Nillable$i64._FromC4V(pPars), C4ValueConv$C4ID._FromC4V($oidx(pPars, 1)), C4ValueConv$b._FromC4V($oidx(pPars, 2))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$Nillable$i64$C4ID$b().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$Nillable$i64._FromC4V(pPars), C4ValueConv$Nillable$i64._FromC4V($oidx(pPars, 1)), C4ValueConv$Nillable$i64._FromC4V($oidx(pPars, 2)), C4ValueConv$Nillable$i64._FromC4V($oidx(pPars, 3)), C4ValueConv$Nillable$i64._FromC4V($oidx(pPars, 4)), C4ValueConv$Nillable$i64._FromC4V($oidx(pPars, 5)), C4ValueConv$Nillable$i64._FromC4V($oidx(pPars, 6))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$b {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$b._FromC4V(pPars)));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$b().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$C4Value$C4Value {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$C4Value$2._FromC4V(pPars), C4ValueConv$C4Value$2._FromC4V($oidx(pPars, 1))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$C4Value$C4Value().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$i32$pC4String {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$pC4String._FromC4V($oidx(pPars, 1))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$i32$pC4String().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$i32$i32$pC4Object {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$pC4Object._FromC4V($oidx(pPars, 2))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$i32$i32$pC4Object().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$i32$i32$C4Value$C4Value {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$C4Value$2._FromC4V($oidx(pPars, 2)), C4ValueConv$C4Value$2._FromC4V($oidx(pPars, 3))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$i32$i32$C4Value$C4Value().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$i32$i32 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$i32$i32().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$i64$C4ID$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$C4ID._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$i64$C4ID$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$i64$pC4Object$b {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$pC4Object._FromC4V($oidx(pPars, 1)), C4ValueConv$b._FromC4V($oidx(pPars, 2))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$i64$pC4Object$b().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$i64$pC4Object {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$pC4Object._FromC4V($oidx(pPars, 1))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$i64$pC4Object().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$i64$pC4PropList {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$pC4PropList._FromC4V($oidx(pPars, 1))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$i64$pC4PropList().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$i64$pC4String {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$pC4String._FromC4V($oidx(pPars, 1))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$i64$pC4String().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$i64$b {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$b._FromC4V($oidx(pPars, 1))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$i64$b().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$i64$i64$pC4String$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$pC4String._FromC4V($oidx(pPars, 2)), C4ValueConv$i32._FromC4V($oidx(pPars, 3))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$i64$i64$pC4String$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$i64$i64$b$b$b {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$b._FromC4V($oidx(pPars, 2)), C4ValueConv$b._FromC4V($oidx(pPars, 3)), C4ValueConv$b._FromC4V($oidx(pPars, 4))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$i64$i64$b$b$b().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$i64$i64$b {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$b._FromC4V($oidx(pPars, 2))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$i64$i64$b().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$i64$i64$i64$pC4PropList {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2)), C4ValueConv$pC4PropList._FromC4V($oidx(pPars, 3))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$i64$i64$i64$pC4PropList().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$i64$i64$i64$i64$i64$pC4PropList {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2)), C4ValueConv$i32._FromC4V($oidx(pPars, 3)), C4ValueConv$i32._FromC4V($oidx(pPars, 4)), C4ValueConv$pC4PropList._FromC4V($oidx(pPars, 5))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$i64$i64$i64$i64$i64$pC4PropList().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$i64$i64$i64$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2)), C4ValueConv$i32._FromC4V($oidx(pPars, 3))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$i64$i64$i64$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$i64$i64$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$i64$i64$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$i64$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1))));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$i64$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this, C4ValueConv$i32._FromC4V(pPars)));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$b$C4PropList {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$b(pFunc(_this));
    pPars;
  }

  $clone() { return new ExecImpl$b$C4PropList().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$i32$C4PropList$pC4PropList {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$i32(pFunc(_this, C4ValueConv$pC4PropList._FromC4V(pPars)));
    pPars;
  }

  $clone() { return new ExecImpl$i32$C4PropList$pC4PropList().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$i32$C4PropList$pC4String {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$i32(pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars)));
    pPars;
  }

  $clone() { return new ExecImpl$i32$C4PropList$pC4String().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$i32$C4PropList$pC4ValueArray$C4Value {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$i32(pFunc(_this, C4ValueConv$pC4ValueArray._FromC4V(pPars), C4ValueConv$C4Value$2._FromC4V($oidx(pPars, 1))));
    pPars;
  }

  $clone() { return new ExecImpl$i32$C4PropList$pC4ValueArray$C4Value().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$i32$C4PropList$C4Value$pC4ValueArray {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$i32(pFunc(_this, C4ValueConv$C4Value$2._FromC4V(pPars), C4ValueConv$pC4ValueArray._FromC4V($oidx(pPars, 1))));
    pPars;
  }

  $clone() { return new ExecImpl$i32$C4PropList$C4Value$pC4ValueArray().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$i32$C4PropList$C4Value {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$i32(pFunc(_this, C4ValueConv$C4Value$2._FromC4V(pPars)));
    pPars;
  }

  $clone() { return new ExecImpl$i32$C4PropList$C4Value().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$i32$C4PropList$i32$i32 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$i32(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1))));
    pPars;
  }

  $clone() { return new ExecImpl$i32$C4PropList$i32$i32().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$i32$C4PropList$i64$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$i32(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1))));
    pPars;
  }

  $clone() { return new ExecImpl$i32$C4PropList$i64$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$i32$C4PropList$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$i32(pFunc(_this, C4ValueConv$i32._FromC4V(pPars)));
    pPars;
  }

  $clone() { return new ExecImpl$i32$C4PropList$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$i32$C4PropList {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$i32(pFunc(_this));
    pPars;
  }

  $clone() { return new ExecImpl$i32$C4PropList().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$i64$C4Object$C4ID {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$i64(pFunc(_this, C4ValueConv$C4ID._FromC4V(pPars)));
    pPars;
  }

  $clone() { return new ExecImpl$i64$C4Object$C4ID().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$i64$C4Object$pC4Object {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$i64(pFunc(_this, C4ValueConv$pC4Object._FromC4V(pPars)));
    pPars;
  }

  $clone() { return new ExecImpl$i64$C4Object$pC4Object().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$i64$C4Object$b {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$i64(pFunc(_this, C4ValueConv$b._FromC4V(pPars)));
    pPars;
  }

  $clone() { return new ExecImpl$i64$C4Object$b().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$i64$C4Object$i64$i64$i64$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$i64(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2)), C4ValueConv$i32._FromC4V($oidx(pPars, 3))));
    pPars;
  }

  $clone() { return new ExecImpl$i64$C4Object$i64$i64$i64$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$i64$C4Object$i64$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$i64(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1))));
    pPars;
  }

  $clone() { return new ExecImpl$i64$C4Object$i64$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$i64$C4Object$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$i64(pFunc(_this, C4ValueConv$i32._FromC4V(pPars)));
    pPars;
  }

  $clone() { return new ExecImpl$i64$C4Object$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$i64$C4Object {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$i64(pFunc(_this));
    pPars;
  }

  $clone() { return new ExecImpl$i64$C4Object().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$i64$C4PropList$C4ID$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$i64(pFunc(_this, C4ValueConv$C4ID._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1))));
    pPars;
  }

  $clone() { return new ExecImpl$i64$C4PropList$C4ID$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$i64$C4PropList$pC4Object$pC4Object {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$i64(pFunc(_this, C4ValueConv$pC4Object._FromC4V(pPars), C4ValueConv$pC4Object._FromC4V($oidx(pPars, 1))));
    pPars;
  }

  $clone() { return new ExecImpl$i64$C4PropList$pC4Object$pC4Object().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$i64$C4PropList$pC4Object$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$i64(pFunc(_this, C4ValueConv$pC4Object._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1))));
    pPars;
  }

  $clone() { return new ExecImpl$i64$C4PropList$pC4Object$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$i64$C4PropList$pC4String$pC4PropList$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$i64(pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars), C4ValueConv$pC4PropList._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2))));
    pPars;
  }

  $clone() { return new ExecImpl$i64$C4PropList$pC4String$pC4PropList$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$i64$C4PropList$pC4String$pC4String {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$i64(pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars), C4ValueConv$pC4String._FromC4V($oidx(pPars, 1))));
    pPars;
  }

  $clone() { return new ExecImpl$i64$C4PropList$pC4String$pC4String().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$i64$C4PropList$pC4String$i64$b {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$i64(pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$b._FromC4V($oidx(pPars, 2))));
    pPars;
  }

  $clone() { return new ExecImpl$i64$C4PropList$pC4String$i64$b().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$i64$C4PropList$pC4String$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$i64(pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1))));
    pPars;
  }

  $clone() { return new ExecImpl$i64$C4PropList$pC4String$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$i64$C4PropList$pC4String {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$i64(pFunc(_this, C4ValueConv$pC4String._FromC4V(pPars)));
    pPars;
  }

  $clone() { return new ExecImpl$i64$C4PropList$pC4String().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$i64$C4PropList$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$i64(pFunc(_this, C4ValueConv$Nillable$i64._FromC4V(pPars), C4ValueConv$Nillable$i64._FromC4V($oidx(pPars, 1)), C4ValueConv$Nillable$i64._FromC4V($oidx(pPars, 2)), C4ValueConv$Nillable$i64._FromC4V($oidx(pPars, 3)), C4ValueConv$Nillable$i64._FromC4V($oidx(pPars, 4))));
    pPars;
  }

  $clone() { return new ExecImpl$i64$C4PropList$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$i64$C4PropList$b {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$i64(pFunc(_this, C4ValueConv$b._FromC4V(pPars)));
    pPars;
  }

  $clone() { return new ExecImpl$i64$C4PropList$b().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$i64$C4PropList$C4Value$Nillable$i64$b$i64$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$i64(pFunc(_this, C4ValueConv$C4Value$2._FromC4V(pPars), C4ValueConv$Nillable$i64._FromC4V($oidx(pPars, 1)), C4ValueConv$b._FromC4V($oidx(pPars, 2)), C4ValueConv$i32._FromC4V($oidx(pPars, 3)), C4ValueConv$i32._FromC4V($oidx(pPars, 4))));
    pPars;
  }

  $clone() { return new ExecImpl$i64$C4PropList$C4Value$Nillable$i64$b$i64$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$i64$C4PropList$i64$b {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$i64(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$b._FromC4V($oidx(pPars, 1))));
    pPars;
  }

  $clone() { return new ExecImpl$i64$C4PropList$i64$b().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$i64$C4PropList$i64$i64$b {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$i64(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$b._FromC4V($oidx(pPars, 2))));
    pPars;
  }

  $clone() { return new ExecImpl$i64$C4PropList$i64$i64$b().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$i64$C4PropList$i64$i64$i64$b$b {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$i64(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2)), C4ValueConv$b._FromC4V($oidx(pPars, 3)), C4ValueConv$b._FromC4V($oidx(pPars, 4))));
    pPars;
  }

  $clone() { return new ExecImpl$i64$C4PropList$i64$i64$i64$b$b().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$i64$C4PropList$i64$i64$i64$i64$pC4String {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$i64(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2)), C4ValueConv$i32._FromC4V($oidx(pPars, 3)), C4ValueConv$pC4String._FromC4V($oidx(pPars, 4))));
    pPars;
  }

  $clone() { return new ExecImpl$i64$C4PropList$i64$i64$i64$i64$pC4String().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$i64$C4PropList$i64$i64$i64$i64$b$b {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$i64(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2)), C4ValueConv$i32._FromC4V($oidx(pPars, 3)), C4ValueConv$b._FromC4V($oidx(pPars, 4)), C4ValueConv$b._FromC4V($oidx(pPars, 5))));
    pPars;
  }

  $clone() { return new ExecImpl$i64$C4PropList$i64$i64$i64$i64$b$b().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$i64$C4PropList$i64$i64$i64$i64$b {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$i64(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2)), C4ValueConv$i32._FromC4V($oidx(pPars, 3)), C4ValueConv$b._FromC4V($oidx(pPars, 4))));
    pPars;
  }

  $clone() { return new ExecImpl$i64$C4PropList$i64$i64$i64$i64$b().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$i64$C4PropList$i64$i64$i64$i64$i64$i64$pC4String$pC4String$b {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$i64(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2)), C4ValueConv$i32._FromC4V($oidx(pPars, 3)), C4ValueConv$i32._FromC4V($oidx(pPars, 4)), C4ValueConv$i32._FromC4V($oidx(pPars, 5)), C4ValueConv$pC4String._FromC4V($oidx(pPars, 6)), C4ValueConv$pC4String._FromC4V($oidx(pPars, 7)), C4ValueConv$b._FromC4V($oidx(pPars, 8))));
    pPars;
  }

  $clone() { return new ExecImpl$i64$C4PropList$i64$i64$i64$i64$i64$i64$pC4String$pC4String$b().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$i64$C4PropList$i64$i64$i64$i64$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$i64(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2)), C4ValueConv$i32._FromC4V($oidx(pPars, 3)), C4ValueConv$i32._FromC4V($oidx(pPars, 4))));
    pPars;
  }

  $clone() { return new ExecImpl$i64$C4PropList$i64$i64$i64$i64$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$i64$C4PropList$i64$i64$i64$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$i64(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2)), C4ValueConv$i32._FromC4V($oidx(pPars, 3))));
    pPars;
  }

  $clone() { return new ExecImpl$i64$C4PropList$i64$i64$i64$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$i64$C4PropList$i64$i64$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$i64(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2))));
    pPars;
  }

  $clone() { return new ExecImpl$i64$C4PropList$i64$i64$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$i64$C4PropList$i64$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$i64(pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1))));
    pPars;
  }

  $clone() { return new ExecImpl$i64$C4PropList$i64$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$i64$C4PropList$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$i64(pFunc(_this, C4ValueConv$i32._FromC4V(pPars)));
    pPars;
  }

  $clone() { return new ExecImpl$i64$C4PropList$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$i64$C4PropList {

  static Exec(pFunc, _this, pPars, _3) {
    return new $.C4Value().init$i64(pFunc(_this));
    pPars;
  }

  $clone() { return new ExecImpl$i64$C4PropList().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$x$C4Object$pC4Object$pC4Object {

  static Exec(pFunc, _this, pPars, _3) {
    pFunc(_this, C4ValueConv$pC4Object._FromC4V(pPars), C4ValueConv$pC4Object._FromC4V($oidx(pPars, 1)));
    return new $.C4Value().init$v();
    pPars;
  }

  $clone() { return new ExecImpl$x$C4Object$pC4Object$pC4Object().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$x$C4Object$pC4Object {

  static Exec(pFunc, _this, pPars, _3) {
    pFunc(_this, C4ValueConv$pC4Object._FromC4V(pPars));
    return new $.C4Value().init$v();
    pPars;
  }

  $clone() { return new ExecImpl$x$C4Object$pC4Object().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$x$C4Object$b {

  static Exec(pFunc, _this, pPars, _3) {
    pFunc(_this, C4ValueConv$b._FromC4V(pPars));
    return new $.C4Value().init$v();
    pPars;
  }

  $clone() { return new ExecImpl$x$C4Object$b().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$x$C4Object$i64$Nillable$i64$Nillable$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$Nillable$i64._FromC4V($oidx(pPars, 1)), C4ValueConv$Nillable$i64._FromC4V($oidx(pPars, 2)));
    return new $.C4Value().init$v();
    pPars;
  }

  $clone() { return new ExecImpl$x$C4Object$i64$Nillable$i64$Nillable$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$x$C4Object$i64$Nillable$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$Nillable$i64._FromC4V($oidx(pPars, 1)));
    return new $.C4Value().init$v();
    pPars;
  }

  $clone() { return new ExecImpl$x$C4Object$i64$Nillable$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$x$C4Object$i64$b$Nillable$i64$Nillable$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$b._FromC4V($oidx(pPars, 1)), C4ValueConv$Nillable$i64._FromC4V($oidx(pPars, 2)), C4ValueConv$Nillable$i64._FromC4V($oidx(pPars, 3)));
    return new $.C4Value().init$v();
    pPars;
  }

  $clone() { return new ExecImpl$x$C4Object$i64$b$Nillable$i64$Nillable$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$x$C4Object$i64$i64$b$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$b._FromC4V($oidx(pPars, 2)), C4ValueConv$i32._FromC4V($oidx(pPars, 3)));
    return new $.C4Value().init$v();
    pPars;
  }

  $clone() { return new ExecImpl$x$C4Object$i64$i64$b$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$x$C4Object$i64$i64$b {

  static Exec(pFunc, _this, pPars, _3) {
    pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$b._FromC4V($oidx(pPars, 2)));
    return new $.C4Value().init$v();
    pPars;
  }

  $clone() { return new ExecImpl$x$C4Object$i64$i64$b().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$x$C4Object$i64$i64$i64$b {

  static Exec(pFunc, _this, pPars, _3) {
    pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2)), C4ValueConv$b._FromC4V($oidx(pPars, 3)));
    return new $.C4Value().init$v();
    pPars;
  }

  $clone() { return new ExecImpl$x$C4Object$i64$i64$i64$b().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$x$C4Object$i64$i64$i64$i64$i64$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2)), C4ValueConv$i32._FromC4V($oidx(pPars, 3)), C4ValueConv$i32._FromC4V($oidx(pPars, 4)), C4ValueConv$i32._FromC4V($oidx(pPars, 5)));
    return new $.C4Value().init$v();
    pPars;
  }

  $clone() { return new ExecImpl$x$C4Object$i64$i64$i64$i64$i64$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$x$C4Object$i64$i64$i64$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2)), C4ValueConv$i32._FromC4V($oidx(pPars, 3)));
    return new $.C4Value().init$v();
    pPars;
  }

  $clone() { return new ExecImpl$x$C4Object$i64$i64$i64$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$x$C4Object$i64$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)));
    return new $.C4Value().init$v();
    pPars;
  }

  $clone() { return new ExecImpl$x$C4Object$i64$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$x$C4Object$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    pFunc(_this, C4ValueConv$i32._FromC4V(pPars));
    return new $.C4Value().init$v();
    pPars;
  }

  $clone() { return new ExecImpl$x$C4Object$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$x$C4Object {

  static Exec(pFunc, _this, pPars, _3) {
    pFunc(_this);
    return new $.C4Value().init$v();
    pPars;
  }

  $clone() { return new ExecImpl$x$C4Object().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$x$C4PropList$pC4PropList$pC4PropList {

  static Exec(pFunc, _this, pPars, _3) {
    pFunc(_this, C4ValueConv$pC4PropList._FromC4V(pPars), C4ValueConv$pC4PropList._FromC4V($oidx(pPars, 1)));
    return new $.C4Value().init$v();
    pPars;
  }

  $clone() { return new ExecImpl$x$C4PropList$pC4PropList$pC4PropList().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$x$C4PropList$pC4ValueArray$i32 {

  static Exec(pFunc, _this, pPars, _3) {
    pFunc(_this, C4ValueConv$pC4ValueArray._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)));
    return new $.C4Value().init$v();
    pPars;
  }

  $clone() { return new ExecImpl$x$C4PropList$pC4ValueArray$i32().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$x$C4PropList$b$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    pFunc(_this, C4ValueConv$b._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)));
    return new $.C4Value().init$v();
    pPars;
  }

  $clone() { return new ExecImpl$x$C4PropList$b$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$x$C4PropList$b {

  static Exec(pFunc, _this, pPars, _3) {
    pFunc(_this, C4ValueConv$b._FromC4V(pPars));
    return new $.C4Value().init$v();
    pPars;
  }

  $clone() { return new ExecImpl$x$C4PropList$b().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$x$C4PropList$i64$b {

  static Exec(pFunc, _this, pPars, _3) {
    pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$b._FromC4V($oidx(pPars, 1)));
    return new $.C4Value().init$v();
    pPars;
  }

  $clone() { return new ExecImpl$x$C4PropList$i64$b().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$x$C4PropList$i64$i64$i64$Nillable$i64$Nillable$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2)), C4ValueConv$Nillable$i64._FromC4V($oidx(pPars, 3)), C4ValueConv$Nillable$i64._FromC4V($oidx(pPars, 4)));
    return new $.C4Value().init$v();
    pPars;
  }

  $clone() { return new ExecImpl$x$C4PropList$i64$i64$i64$Nillable$i64$Nillable$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$x$C4PropList$i64$i64$i64$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2)), C4ValueConv$i32._FromC4V($oidx(pPars, 3)));
    return new $.C4Value().init$v();
    pPars;
  }

  $clone() { return new ExecImpl$x$C4PropList$i64$i64$i64$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$x$C4PropList$i64$i64$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    pFunc(_this, C4ValueConv$i32._FromC4V(pPars), C4ValueConv$i32._FromC4V($oidx(pPars, 1)), C4ValueConv$i32._FromC4V($oidx(pPars, 2)));
    return new $.C4Value().init$v();
    pPars;
  }

  $clone() { return new ExecImpl$x$C4PropList$i64$i64$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ExecImpl$x$C4PropList$i64 {

  static Exec(pFunc, _this, pPars, _3) {
    pFunc(_this, C4ValueConv$i32._FromC4V(pPars));
    return new $.C4Value().init$v();
    pPars;
  }

  $clone() { return new ExecImpl$x$C4PropList$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class C4ValueConv$Nillable$pC4String {
  static Type;

  static _FromC4V(v) {
    if (v.GetType() === 0) {
      return new $.Nillable$pC4String().init$C4Void(new C4Void());
    } else {
      return new $.Nillable$pC4String().init$rpC4String(C4ValueConv$pC4String._FromC4V(v));
    }
  }

  $clone() { return new C4ValueConv$Nillable$pC4String().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class C4ValueConv$Nillable$pC4ValueArray {
  static Type;

  static _FromC4V(v) {
    if (v.GetType() === 0) {
      return new $.Nillable$pC4ValueArray().init$C4Void(new C4Void());
    } else {
      return new $.Nillable$pC4ValueArray().init$rpC4ValueArray(C4ValueConv$pC4ValueArray._FromC4V(v));
    }
  }

  $clone() { return new C4ValueConv$Nillable$pC4ValueArray().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class C4ValueConv$Nillable$i32 {
  static Type;

  static _FromC4V(v) {
    if (v.GetType() === 0) {
      return new $.Nillable$i32().init$C4Void(new C4Void());
    } else {
      return new $.Nillable$i32().init$i32(C4ValueConv$i32._FromC4V(v));
    }
  }

  $clone() { return new C4ValueConv$Nillable$i32().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class C4ValueConv$Nillable$i64 {
  static Type;

  static _FromC4V(v) {
    if (v.GetType() === 0) {
      return new $.Nillable$i64().init$C4Void(new C4Void());
    } else {
      return new $.Nillable$i64().init$i64(C4ValueConv$i32._FromC4V(v));
    }
  }

  $clone() { return new C4ValueConv$Nillable$i64().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class C4ValueConv$i32 {
  static Type;

  static _FromC4V(v) {
    return v._getInt();
  }

  $clone() { return new C4ValueConv$i32().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class C4ValueConv$b {
  static Type;

  static _FromC4V(v) {
    return v._getBool();
  }

  $clone() { return new C4ValueConv$b().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class C4ValueConv$C4ID {
  static Type;

  static _FromC4V(v) {
    let def = v.getDef();
    return (def != null ? def.id : $.C4ID.None).$clone();
  }

  $clone() { return new C4ValueConv$C4ID().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class C4ValueConv$pC4Object {
  static Type;

  static _FromC4V(v) {
    return v._getObj();
  }

  $clone() { return new C4ValueConv$pC4Object().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class C4ValueConv$pC4String {
  static Type;

  static _FromC4V(v) {
    return v._getStr();
  }

  $clone() { return new C4ValueConv$pC4String().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class C4ValueConv$pC4ValueArray {
  static Type;

  static _FromC4V(v) {
    return v._getArray();
  }

  $clone() { return new C4ValueConv$pC4ValueArray().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class C4ValueConv$pC4PropList {
  static Type;

  static _FromC4V(v) {
    return v._getPropList();
  }

  $clone() { return new C4ValueConv$pC4PropList().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class C4ValueConv$pC4Effect {
  static Type;

  static _FromC4V(v) {
    let p = v._getPropList();
    return p != null ? p.GetEffect() : null;
  }

  $clone() { return new C4ValueConv$pC4Effect().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class C4ValueConv$pC4Def {
  static Type;

  static _FromC4V(v) {
    return v._getDef();
  }

  $clone() { return new C4ValueConv$pC4Def().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class C4ValueConv$C4Value$2 {
  static Type;

  static _FromC4V(v) {
    return v;
  }

  $clone() { return new C4ValueConv$C4Value$2().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class C4ValueConv$C4Value {
  static Type;

  static _FromC4V(v) {
    return new $.C4Value().$copy(v);
  }

  $clone() { return new C4ValueConv$C4Value().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class C4ScriptConstDef {
  Identifier = null;
  ValType = 0;
  Data = 0;

  $clone() { return new C4ScriptConstDef().$assign(this); }
  $assign(o) {
    this.Identifier = o.Identifier;
    this.ValType = o.ValType;
    this.Data = o.Data;
    return this;
  }
}

export class C4ScriptFnDef {
  Identifier = null;
  Public = false;
  RetType = 0;
  ParType = new Int32Array(10);
  FunctionC4V = null;

  $clone() { return new C4ScriptFnDef().$assign(this); }
  $assign(o) {
    this.Identifier = o.Identifier;
    this.Public = o.Public;
    this.RetType = o.RetType;
    this.ParType = o.ParType.slice();
    this.FunctionC4V = o.FunctionC4V;
    return this;
  }
}

export class C4AulEngineFunc$pC4Def$C4PropList$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$pC4Def$C4PropList$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 1;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 12;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$pC4Def$C4PropList$i64.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$pC4Def$C4PropList$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$pC4Effect$C4PropList$pC4PropList$i32$i32$C4Value$C4Value$C4Value$C4Value extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [3, 1, 1, 10, 10, 10, 10]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$pC4Effect$C4PropList$pC4PropList$i32$i32$C4Value$C4Value$C4Value$C4Value.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 7;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 13;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$pC4Effect$C4PropList$pC4PropList$i32$i32$C4Value$C4Value$C4Value$C4Value.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$pC4Effect$C4PropList$pC4PropList$i32$i32$C4Value$C4Value$C4Value$C4Value().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$pC4Effect$C4PropList$pC4String$pC4PropList$i32$i32 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [4, 3, 1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$pC4Effect$C4PropList$pC4String$pC4PropList$i32$i32.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 4;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 13;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$pC4Effect$C4PropList$pC4String$pC4PropList$i32$i32.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$pC4Effect$C4PropList$pC4String$pC4PropList$i32$i32().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$pC4Object$C4Object$pC4Def extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [12]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$pC4Object$C4Object$pC4Def.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 1;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 11;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$pC4Object$C4Object$pC4Def.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$pC4Object$C4Object$pC4Def().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$pC4Object$C4Object$C4ID extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [3]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$pC4Object$C4Object$C4ID.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 1;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 11;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$pC4Object$C4Object$C4ID.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$pC4Object$C4Object$C4ID().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$pC4Object$C4Object$pC4PropList$Nillable$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [3, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$pC4Object$C4Object$pC4PropList$Nillable$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 11;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$pC4Object$C4Object$pC4PropList$Nillable$i64.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$pC4Object$C4Object$pC4PropList$Nillable$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$pC4Object$C4Object$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$pC4Object$C4Object$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 1;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 11;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$pC4Object$C4Object$i64.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$pC4Object$C4Object$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$pC4Object$C4Object extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, []);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$pC4Object$C4Object.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 0;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 11;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$pC4Object$C4Object.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$pC4Object$C4Object().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$pC4Object$C4PropList$pC4PropList$i64$i64$Nillable$i64$i64$b$b extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [3, 1, 1, 1, 1, 2, 2]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$pC4Object$C4PropList$pC4PropList$i64$i64$Nillable$i64$i64$b$b.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 7;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 11;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$pC4Object$C4PropList$pC4PropList$i64$i64$Nillable$i64$i64$b$b.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$pC4Object$C4PropList$pC4PropList$i64$i64$Nillable$i64$i64$b$b().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$pC4Object$C4PropList$pC4PropList$i64$i64$Nillable$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [3, 1, 1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$pC4Object$C4PropList$pC4PropList$i64$i64$Nillable$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 4;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 11;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$pC4Object$C4PropList$pC4PropList$i64$i64$Nillable$i64.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$pC4Object$C4PropList$pC4PropList$i64$i64$Nillable$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$pC4Object$C4PropList$pC4PropList$i64$i64$i64$i64$i64$pC4PropList extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [3, 1, 1, 1, 1, 1, 3]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$pC4Object$C4PropList$pC4PropList$i64$i64$i64$i64$i64$pC4PropList.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 7;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 11;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$pC4Object$C4PropList$pC4PropList$i64$i64$i64$i64$i64$pC4PropList.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$pC4Object$C4PropList$pC4PropList$i64$i64$i64$i64$i64$pC4PropList().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$pC4Object$C4PropList$pC4PropList extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [3]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$pC4Object$C4PropList$pC4PropList.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 1;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 11;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$pC4Object$C4PropList$pC4PropList.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$pC4Object$C4PropList$pC4PropList().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$pC4Object$C4PropList$i64$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$pC4Object$C4PropList$i64$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 11;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$pC4Object$C4PropList$i64$i64.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$pC4Object$C4PropList$i64$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$pC4Object$C4PropList$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$pC4Object$C4PropList$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 1;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 11;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$pC4Object$C4PropList$i64.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$pC4Object$C4PropList$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$pC4Object$C4PropList extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, []);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$pC4Object$C4PropList.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 0;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 11;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$pC4Object$C4PropList.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$pC4Object$C4PropList().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$pC4PropList$C4Object extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, []);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$pC4PropList$C4Object.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 0;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 3;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$pC4PropList$C4Object.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$pC4PropList$C4Object().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$pC4PropList$C4PropList$pC4PropList extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [3]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$pC4PropList$C4PropList$pC4PropList.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 1;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 3;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$pC4PropList$C4PropList$pC4PropList.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$pC4PropList$C4PropList$pC4PropList().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$pC4PropList$C4PropList$pC4String$i32$i32 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [4, 1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$pC4PropList$C4PropList$pC4String$i32$i32.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 3;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 3;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$pC4PropList$C4PropList$pC4String$i32$i32.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$pC4PropList$C4PropList$pC4String$i32$i32().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$pC4PropList$C4PropList$C4Value$pC4ValueArray extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [10, 5]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$pC4PropList$C4PropList$C4Value$pC4ValueArray.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 3;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$pC4PropList$C4PropList$C4Value$pC4ValueArray.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$pC4PropList$C4PropList$C4Value$pC4ValueArray().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$pC4PropList$C4PropList$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$pC4PropList$C4PropList$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 1;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 3;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$pC4PropList$C4PropList$i64.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$pC4PropList$C4PropList$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$pC4String$C4Object extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, []);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$pC4String$C4Object.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 0;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 4;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$pC4String$C4Object.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$pC4String$C4Object().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$pC4String$C4PropList$pC4String extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [4]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$pC4String$C4PropList$pC4String.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 1;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 4;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$pC4String$C4PropList$pC4String.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$pC4String$C4PropList$pC4String().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$pC4String$C4PropList$b extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [2]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$pC4String$C4PropList$b.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 1;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 4;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$pC4String$C4PropList$b.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$pC4String$C4PropList$b().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$pC4String$C4PropList$C4Value extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [10]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$pC4String$C4PropList$C4Value.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 1;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 4;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$pC4String$C4PropList$C4Value.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$pC4String$C4PropList$C4Value().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$pC4String$C4PropList$i64$i64$b$b extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1, 2, 2]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$pC4String$C4PropList$i64$i64$b$b.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 4;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 4;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$pC4String$C4PropList$i64$i64$b$b.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$pC4String$C4PropList$i64$i64$b$b().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$pC4String$C4PropList$i64$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$pC4String$C4PropList$i64$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 4;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$pC4String$C4PropList$i64$i64.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$pC4String$C4PropList$i64$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$pC4String$C4PropList$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$pC4String$C4PropList$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 1;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 4;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$pC4String$C4PropList$i64.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$pC4String$C4PropList$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$pC4String$C4PropList extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, []);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$pC4String$C4PropList.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 0;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 4;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$pC4String$C4PropList.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$pC4String$C4PropList().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$C4Value$C4Object$pC4String$pC4String$i32 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [4, 4, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$C4Value$C4Object$pC4String$pC4String$i32.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 3;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 10;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$C4Value$C4Object$pC4String$pC4String$i32.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$C4Value$C4Object$pC4String$pC4String$i32().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$C4Value$C4Object$pC4String$C4Value extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [4, 10]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$C4Value$C4Object$pC4String$C4Value.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 10;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$C4Value$C4Object$pC4String$C4Value.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$C4Value$C4Object$pC4String$C4Value().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$C4Value$C4Object$pC4String extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [4]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$C4Value$C4Object$pC4String.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 1;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 10;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$C4Value$C4Object$pC4String.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$C4Value$C4Object$pC4String().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$C4Value$C4Object$i32$i32 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$C4Value$C4Object$i32$i32.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 10;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$C4Value$C4Object$i32$i32.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$C4Value$C4Object$i32$i32().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$C4Value$C4PropList$pC4String$pC4PropList$i32$i32$pC4PropList$pC4Def$C4Value$C4Value$C4Value$C4Value extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = new Int32Array([4, 3, 1, 1, 3, 12, 10, 10, 10, 10]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$C4Value$C4PropList$pC4String$pC4PropList$i32$i32$pC4PropList$pC4Def$C4Value$C4Value$C4Value$C4Value.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 10;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 10;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$C4Value$C4PropList$pC4String$pC4PropList$i32$i32$pC4PropList$pC4Def$C4Value$C4Value$C4Value$C4Value.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$C4Value$C4PropList$pC4String$pC4PropList$i32$i32$pC4PropList$pC4Def$C4Value$C4Value$C4Value$C4Value().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$C4Value$C4PropList$pC4String$pC4PropList$i32$i32$C4Value$C4Value$C4Value$C4Value extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [4, 3, 1, 1, 10, 10, 10, 10]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$C4Value$C4PropList$pC4String$pC4PropList$i32$i32$C4Value$C4Value$C4Value$C4Value.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 8;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 10;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$C4Value$C4PropList$pC4String$pC4PropList$i32$i32$C4Value$C4Value$C4Value$C4Value.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$C4Value$C4PropList$pC4String$pC4PropList$i32$i32$C4Value$C4Value$C4Value$C4Value().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$C4Value$C4PropList$pC4String$pC4PropList extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [4, 3]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$C4Value$C4PropList$pC4String$pC4PropList.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 10;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$C4Value$C4PropList$pC4String$pC4PropList.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$C4Value$C4PropList$pC4String$pC4PropList().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$C4Value$C4PropList$pC4String$pC4String$i32$i32 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [4, 4, 1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$C4Value$C4PropList$pC4String$pC4String$i32$i32.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 4;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 10;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$C4Value$C4PropList$pC4String$pC4String$i32$i32.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$C4Value$C4PropList$pC4String$pC4String$i32$i32().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$C4Value$C4PropList$pC4String$pC4String$i32 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [4, 4, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$C4Value$C4PropList$pC4String$pC4String$i32.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 3;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 10;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$C4Value$C4PropList$pC4String$pC4String$i32.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$C4Value$C4PropList$pC4String$pC4String$i32().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$C4Value$C4PropList$pC4String$b extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [4, 2]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$C4Value$C4PropList$pC4String$b.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 10;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$C4Value$C4PropList$pC4String$b.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$C4Value$C4PropList$pC4String$b().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$C4Value$C4PropList$i32$C4ID$i32$i32 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 3, 1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$C4Value$C4PropList$i32$C4ID$i32$i32.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 4;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 10;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$C4Value$C4PropList$i32$C4ID$i32$i32.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$C4Value$C4PropList$i32$C4ID$i32$i32().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$C4Value$C4PropList$i32$pC4String$C4Value extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 4, 10]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$C4Value$C4PropList$i32$pC4String$C4Value.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 3;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 10;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$C4Value$C4PropList$i32$pC4String$C4Value.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$C4Value$C4PropList$i32$pC4String$C4Value().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$C4Value$C4PropList$i32$pC4String extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 4]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$C4Value$C4PropList$i32$pC4String.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 10;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$C4Value$C4PropList$i32$pC4String.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$C4Value$C4PropList$i32$pC4String().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$pC4ValueArray$C4PropList$pC4PropList$i32$i32 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [3, 1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$pC4ValueArray$C4PropList$pC4PropList$i32$i32.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 3;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 5;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$pC4ValueArray$C4PropList$pC4PropList$i32$i32.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$pC4ValueArray$C4PropList$pC4PropList$i32$i32().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$pC4ValueArray$C4PropList$pC4PropList extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [3]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$pC4ValueArray$C4PropList$pC4PropList.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 1;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 5;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$pC4ValueArray$C4PropList$pC4PropList.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$pC4ValueArray$C4PropList$pC4PropList().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$pC4ValueArray$C4PropList$C4Value$C4Value$C4Value$C4Value extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [10, 10, 10, 10]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$pC4ValueArray$C4PropList$C4Value$C4Value$C4Value$C4Value.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 4;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 5;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$pC4ValueArray$C4PropList$C4Value$C4Value$C4Value$C4Value.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$pC4ValueArray$C4PropList$C4Value$C4Value$C4Value$C4Value().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$pC4ValueArray$C4PropList$C4Value$C4Value$C4Value extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [10, 10, 10]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$pC4ValueArray$C4PropList$C4Value$C4Value$C4Value.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 3;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 5;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$pC4ValueArray$C4PropList$C4Value$C4Value$C4Value.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$pC4ValueArray$C4PropList$C4Value$C4Value$C4Value().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$pC4ValueArray$C4PropList$C4Value$C4Value extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [10, 10]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$pC4ValueArray$C4PropList$C4Value$C4Value.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 5;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$pC4ValueArray$C4PropList$C4Value$C4Value.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$pC4ValueArray$C4PropList$C4Value$C4Value().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$pC4ValueArray$C4PropList$C4Value extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [10]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$pC4ValueArray$C4PropList$C4Value.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 1;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 5;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$pC4ValueArray$C4PropList$C4Value.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$pC4ValueArray$C4PropList$C4Value().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$pC4ValueArray$C4PropList$C4Value$2 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [10]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$pC4ValueArray$C4PropList$C4Value$2.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 1;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 5;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$pC4ValueArray$C4PropList$C4Value$2.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$pC4ValueArray$C4PropList$C4Value$2().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$pC4ValueArray$C4PropList$i32$i32$Nillable$i32$Nillable$i32$Nillable$i32$Nillable$i32$Nillable$i32$i32 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1, 1, 1, 1, 1, 1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$pC4ValueArray$C4PropList$i32$i32$Nillable$i32$Nillable$i32$Nillable$i32$Nillable$i32$Nillable$i32$i32.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 8;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 5;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$pC4ValueArray$C4PropList$i32$i32$Nillable$i32$Nillable$i32$Nillable$i32$Nillable$i32$Nillable$i32$i32.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$pC4ValueArray$C4PropList$i32$i32$Nillable$i32$Nillable$i32$Nillable$i32$Nillable$i32$Nillable$i32$i32().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$pC4ValueArray$C4PropList$i32$i32$i32$i32 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1, 1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$pC4ValueArray$C4PropList$i32$i32$i32$i32.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 4;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 5;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$pC4ValueArray$C4PropList$i32$i32$i32$i32.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$pC4ValueArray$C4PropList$i32$i32$i32$i32().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$pC4ValueArray$C4PropList$i32 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$pC4ValueArray$C4PropList$i32.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 1;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 5;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$pC4ValueArray$C4PropList$i32.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$pC4ValueArray$C4PropList$i32().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$pC4ValueArray$C4PropList$i64$i64$i64$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1, 1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$pC4ValueArray$C4PropList$i64$i64$i64$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 4;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 5;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$pC4ValueArray$C4PropList$i64$i64$i64$i64.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$pC4ValueArray$C4PropList$i64$i64$i64$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$pC4ValueArray$C4PropList$i64$i64$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$pC4ValueArray$C4PropList$i64$i64$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 3;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 5;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$pC4ValueArray$C4PropList$i64$i64$i64.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$pC4ValueArray$C4PropList$i64$i64$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$pC4ValueArray$C4PropList extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, []);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$pC4ValueArray$C4PropList.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 0;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 5;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$pC4ValueArray$C4PropList.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$pC4ValueArray$C4PropList().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$Nillable$pC4Def$C4Object extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, []);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$Nillable$pC4Def$C4Object.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 0;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 12;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$Nillable$pC4Def$C4Object.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$Nillable$pC4Def$C4Object().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$Nillable$pC4String$C4Object$Nillable$i32$Nillable$i32 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$Nillable$pC4String$C4Object$Nillable$i32$Nillable$i32.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 4;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$Nillable$pC4String$C4Object$Nillable$i32$Nillable$i32.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$Nillable$pC4String$C4Object$Nillable$i32$Nillable$i32().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$Nillable$pC4String$C4PropList$pC4String$pC4String$pC4String$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [4, 4, 4, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$Nillable$pC4String$C4PropList$pC4String$pC4String$pC4String$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 4;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 4;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$Nillable$pC4String$C4PropList$pC4String$pC4String$pC4String$i64.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$Nillable$pC4String$C4PropList$pC4String$pC4String$pC4String$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$Nillable$pC4String$C4PropList$pC4String$pC4String$pC4String extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [4, 4, 4]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$Nillable$pC4String$C4PropList$pC4String$pC4String$pC4String.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 3;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 4;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$Nillable$pC4String$C4PropList$pC4String$pC4String$pC4String.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$Nillable$pC4String$C4PropList$pC4String$pC4String$pC4String().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$Nillable$pC4String$C4PropList$i32$Nillable$pC4String$i32 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 4, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$Nillable$pC4String$C4PropList$i32$Nillable$pC4String$i32.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 3;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 4;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$Nillable$pC4String$C4PropList$i32$Nillable$pC4String$i32.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$Nillable$pC4String$C4PropList$i32$Nillable$pC4String$i32().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$Nillable$pC4String$C4PropList$i32 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$Nillable$pC4String$C4PropList$i32.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 1;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 4;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$Nillable$pC4String$C4PropList$i32.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$Nillable$pC4String$C4PropList$i32().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$Nillable$pC4ValueArray$C4PropList$pC4String$pC4String$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [4, 4, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$Nillable$pC4ValueArray$C4PropList$pC4String$pC4String$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 3;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 5;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$Nillable$pC4ValueArray$C4PropList$pC4String$pC4String$i64.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$Nillable$pC4ValueArray$C4PropList$pC4String$pC4String$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$Nillable$pC4ValueArray$C4PropList$Nillable$i32 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$Nillable$pC4ValueArray$C4PropList$Nillable$i32.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 1;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 5;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$Nillable$pC4ValueArray$C4PropList$Nillable$i32.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$Nillable$pC4ValueArray$C4PropList$Nillable$i32().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$Nillable$pC4ValueArray$C4PropList extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, []);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$Nillable$pC4ValueArray$C4PropList.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 0;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 5;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$Nillable$pC4ValueArray$C4PropList.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$Nillable$pC4ValueArray$C4PropList().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$Nillable$i32$C4Object$pC4PropList$pC4String$pC4String$pC4ValueArray$i32$i32 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [3, 4, 4, 5, 1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$Nillable$i32$C4Object$pC4PropList$pC4String$pC4String$pC4ValueArray$i32$i32.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 6;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$Nillable$i32$C4Object$pC4PropList$pC4String$pC4String$pC4ValueArray$i32$i32.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$Nillable$i32$C4Object$pC4PropList$pC4String$pC4String$pC4ValueArray$i32$i32().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$Nillable$i32$C4Object$pC4String$pC4ValueArray$i32$pC4ValueArray$Nillable$i32$Nillable$i32 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [4, 5, 1, 5, 1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$Nillable$i32$C4Object$pC4String$pC4ValueArray$i32$pC4ValueArray$Nillable$i32$Nillable$i32.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 6;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$Nillable$i32$C4Object$pC4String$pC4ValueArray$i32$pC4ValueArray$Nillable$i32$Nillable$i32.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$Nillable$i32$C4Object$pC4String$pC4ValueArray$i32$pC4ValueArray$Nillable$i32$Nillable$i32().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$Nillable$i32$C4Object$pC4String$Nillable$i32 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [4, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$Nillable$i32$C4Object$pC4String$Nillable$i32.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$Nillable$i32$C4Object$pC4String$Nillable$i32.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$Nillable$i32$C4Object$pC4String$Nillable$i32().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$Nillable$i32$C4Object$pC4String$i32$pC4ValueArray$Nillable$pC4ValueArray$Nillable$i32$Nillable$i32 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [4, 1, 5, 5, 1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$Nillable$i32$C4Object$pC4String$i32$pC4ValueArray$Nillable$pC4ValueArray$Nillable$i32$Nillable$i32.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 6;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$Nillable$i32$C4Object$pC4String$i32$pC4ValueArray$Nillable$pC4ValueArray$Nillable$i32$Nillable$i32.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$Nillable$i32$C4Object$pC4String$i32$pC4ValueArray$Nillable$pC4ValueArray$Nillable$i32$Nillable$i32().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$Nillable$i32$C4Object$Nillable$i32$Nillable$i32 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$Nillable$i32$C4Object$Nillable$i32$Nillable$i32.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$Nillable$i32$C4Object$Nillable$i32$Nillable$i32.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$Nillable$i32$C4Object$Nillable$i32$Nillable$i32().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$Nillable$i32$C4Object$i32$Nillable$i32 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$Nillable$i32$C4Object$i32$Nillable$i32.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$Nillable$i32$C4Object$i32$Nillable$i32.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$Nillable$i32$C4Object$i32$Nillable$i32().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$Nillable$i32$C4PropList$C4Value$Nillable$i32 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [10, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$Nillable$i32$C4PropList$C4Value$Nillable$i32.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$Nillable$i32$C4PropList$C4Value$Nillable$i32.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$Nillable$i32$C4PropList$C4Value$Nillable$i32().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$Nillable$i64$C4Object$i64$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$Nillable$i64$C4Object$i64$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$Nillable$i64$C4Object$i64$i64.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$Nillable$i64$C4Object$i64$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$Nillable$i64$C4Object$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$Nillable$i64$C4Object$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 1;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$Nillable$i64$C4Object$i64.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$Nillable$i64$C4Object$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$Nillable$i64$C4Object extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, []);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$Nillable$i64$C4Object.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 0;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$Nillable$i64$C4Object.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$Nillable$i64$C4Object().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$Nillable$i64$C4PropList$pC4String$pC4String extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [4, 4]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$Nillable$i64$C4PropList$pC4String$pC4String.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$Nillable$i64$C4PropList$pC4String$pC4String.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$Nillable$i64$C4PropList$pC4String$pC4String().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$Nillable$i64$C4PropList$pC4String$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [4, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$Nillable$i64$C4PropList$pC4String$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$Nillable$i64$C4PropList$pC4String$i64.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$Nillable$i64$C4PropList$pC4String$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$Nillable$i64$C4PropList$pC4String extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [4]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$Nillable$i64$C4PropList$pC4String.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 1;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$Nillable$i64$C4PropList$pC4String.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$Nillable$i64$C4PropList$pC4String().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$Nillable$i64$C4PropList$i64$i64$i64$i64$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1, 1, 1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$Nillable$i64$C4PropList$i64$i64$i64$i64$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 5;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$Nillable$i64$C4PropList$i64$i64$i64$i64$i64.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$Nillable$i64$C4PropList$i64$i64$i64$i64$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$Nillable$i64$C4PropList extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, []);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$Nillable$i64$C4PropList.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 0;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$Nillable$i64$C4PropList.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$Nillable$i64$C4PropList().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4Object$pC4Def$pC4Object$i64$pC4String$i64$i64$b$C4ID extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [12, 11, 1, 4, 1, 1, 2, 3]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4Object$pC4Def$pC4Object$i64$pC4String$i64$i64$b$C4ID.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 8;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4Object$pC4Def$pC4Object$i64$pC4String$i64$i64$b$C4ID.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4Object$pC4Def$pC4Object$i64$pC4String$i64$i64$b$C4ID().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4Object$C4ID extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [3]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4Object$C4ID.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 1;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4Object$C4ID.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4Object$C4ID().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4Object$pC4Object$b extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [11, 2]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4Object$pC4Object$b.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4Object$pC4Object$b.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4Object$pC4Object$b().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4Object$pC4Object$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [11, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4Object$pC4Object$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4Object$pC4Object$i64.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4Object$pC4Object$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4Object$pC4Object extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [11]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4Object$pC4Object.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 1;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4Object$pC4Object.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4Object$pC4Object().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4Object$pC4String$pC4Def$i64$i64$pC4String$i64$pC4Object extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [4, 12, 1, 1, 4, 1, 11]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4Object$pC4String$pC4Def$i64$i64$pC4String$i64$pC4Object.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 7;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4Object$pC4String$pC4Def$i64$i64$pC4String$i64$pC4Object.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4Object$pC4String$pC4Def$i64$i64$pC4String$i64$pC4Object().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4Object$pC4String$pC4Object$pC4Object$b extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [4, 11, 11, 2]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4Object$pC4String$pC4Object$pC4Object$b.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 4;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4Object$pC4String$pC4Object$pC4Object$b.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4Object$pC4String$pC4Object$pC4Object$b().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4Object$pC4String$pC4Object$C4Value$i32$pC4Object$C4Value$i32 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [4, 11, 10, 1, 11, 10, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4Object$pC4String$pC4Object$C4Value$i32$pC4Object$C4Value$i32.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 7;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4Object$pC4String$pC4Object$C4Value$i32$pC4Object$C4Value$i32.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4Object$pC4String$pC4Object$C4Value$i32$pC4Object$C4Value$i32().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4Object$pC4String$pC4Object$C4Value$i32$pC4Object$i32$C4Value$i32$i32 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [4, 11, 10, 1, 11, 1, 10, 1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4Object$pC4String$pC4Object$C4Value$i32$pC4Object$i32$C4Value$i32$i32.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 9;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4Object$pC4String$pC4Object$C4Value$i32$pC4Object$i32$C4Value$i32$i32.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4Object$pC4String$pC4Object$C4Value$i32$pC4Object$i32$C4Value$i32$i32().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4Object$pC4String$pC4String$pC4Def$i32$C4Value$pC4String$i32$C4Value$C4Value extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [4, 4, 12, 1, 10, 4, 1, 10, 10]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4Object$pC4String$pC4String$pC4Def$i32$C4Value$pC4String$i32$C4Value$C4Value.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 9;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4Object$pC4String$pC4String$pC4Def$i32$C4Value$pC4String$i32$C4Value$C4Value.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4Object$pC4String$pC4String$pC4Def$i32$C4Value$pC4String$i32$C4Value$C4Value().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4Object$pC4String$pC4String$pC4ValueArray$pC4ValueArray$C4Value$pC4PropList$i32 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [4, 4, 5, 5, 10, 3, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4Object$pC4String$pC4String$pC4ValueArray$pC4ValueArray$C4Value$pC4PropList$i32.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 7;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4Object$pC4String$pC4String$pC4ValueArray$pC4ValueArray$C4Value$pC4PropList$i32.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4Object$pC4String$pC4String$pC4ValueArray$pC4ValueArray$C4Value$pC4PropList$i32().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4Object$pC4String$i32 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [4, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4Object$pC4String$i32.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4Object$pC4String$i32.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4Object$pC4String$i32().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4Object$Nillable$i32$pC4ValueArray$Nillable$i32 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 5, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4Object$Nillable$i32$pC4ValueArray$Nillable$i32.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 3;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4Object$Nillable$i32$pC4ValueArray$Nillable$i32.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4Object$Nillable$i32$pC4ValueArray$Nillable$i32().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4Object$Nillable$i32$Nillable$i32 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4Object$Nillable$i32$Nillable$i32.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4Object$Nillable$i32$Nillable$i32.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4Object$Nillable$i32$Nillable$i32().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4Object$Nillable$i64$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4Object$Nillable$i64$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4Object$Nillable$i64$i64.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4Object$Nillable$i64$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4Object$b$pC4Def$b extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [2, 12, 2]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4Object$b$pC4Def$b.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 3;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4Object$b$pC4Def$b.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4Object$b$pC4Def$b().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4Object$b$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [2, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4Object$b$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4Object$b$i64.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4Object$b$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4Object$i32 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4Object$i32.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 1;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4Object$i32.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4Object$i32().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4Object$i64$pC4ValueArray extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 5]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4Object$i64$pC4ValueArray.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4Object$i64$pC4ValueArray.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4Object$i64$pC4ValueArray().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4Object$i64$Nillable$pC4String$Nillable$pC4String extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 4, 4]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4Object$i64$Nillable$pC4String$Nillable$pC4String.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 3;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4Object$i64$Nillable$pC4String$Nillable$pC4String.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4Object$i64$Nillable$pC4String$Nillable$pC4String().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4Object$i64$b extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 2]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4Object$i64$b.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4Object$i64$b.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4Object$i64$b().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4Object$i64$i64$i64$i64$i64$i64$i64$i64$i64$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = new Int32Array([1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4Object$i64$i64$i64$i64$i64$i64$i64$i64$i64$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 10;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4Object$i64$i64$i64$i64$i64$i64$i64$i64$i64$i64.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4Object$i64$i64$i64$i64$i64$i64$i64$i64$i64$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4Object$i64$i64$i64$i64$i64$i64$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1, 1, 1, 1, 1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4Object$i64$i64$i64$i64$i64$i64$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 7;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4Object$i64$i64$i64$i64$i64$i64$i64.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4Object$i64$i64$i64$i64$i64$i64$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4Object$i64$i64$i64$i64$i64$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1, 1, 1, 1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4Object$i64$i64$i64$i64$i64$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 6;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4Object$i64$i64$i64$i64$i64$i64.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4Object$i64$i64$i64$i64$i64$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4Object$i64$i64$i64$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1, 1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4Object$i64$i64$i64$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 4;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4Object$i64$i64$i64$i64.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4Object$i64$i64$i64$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4Object$i64$i64$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4Object$i64$i64$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 3;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4Object$i64$i64$i64.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4Object$i64$i64$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4Object$i64$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4Object$i64$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4Object$i64$i64.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4Object$i64$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4Object$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4Object$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 1;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4Object$i64.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4Object$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4Object extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, []);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4Object.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 0;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4Object.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4Object().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$pC4Def extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [12]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$pC4Def.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 1;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$pC4Def.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$pC4Def().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$pC4Object$b$pC4String$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [11, 2, 4, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$pC4Object$b$pC4String$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 4;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$pC4Object$b$pC4String$i64.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$pC4Object$b$pC4String$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$pC4Object$b extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [11, 2]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$pC4Object$b.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$pC4Object$b.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$pC4Object$b().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$pC4Object$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [11, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$pC4Object$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$pC4Object$i64.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$pC4Object$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$pC4PropList$pC4ValueArray extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [3, 5]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$pC4PropList$pC4ValueArray.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$pC4PropList$pC4ValueArray.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$pC4PropList$pC4ValueArray().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$pC4PropList$Nillable$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [3, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$pC4PropList$Nillable$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$pC4PropList$Nillable$i64.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$pC4PropList$Nillable$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$pC4PropList$b extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [3, 2]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$pC4PropList$b.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$pC4PropList$b.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$pC4PropList$b().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$pC4PropList$C4Value$pC4ValueArray$i32 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [3, 10, 5, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$pC4PropList$C4Value$pC4ValueArray$i32.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 4;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$pC4PropList$C4Value$pC4ValueArray$i32.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$pC4PropList$C4Value$pC4ValueArray$i32().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$pC4PropList$i32$i32$pC4Object extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [3, 1, 1, 11]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$pC4PropList$i32$i32$pC4Object.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 4;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$pC4PropList$i32$i32$pC4Object.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$pC4PropList$i32$i32$pC4Object().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$pC4PropList$i32$i32 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [3, 1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$pC4PropList$i32$i32.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 3;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$pC4PropList$i32$i32.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$pC4PropList$i32$i32().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$pC4String$pC4Object$Nillable$i64$i64$i64$i64$C4ID$pC4PropList$i64$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = new Int32Array([4, 11, 1, 1, 1, 1, 3, 3, 1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$pC4String$pC4Object$Nillable$i64$i64$i64$i64$C4ID$pC4PropList$i64$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 10;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$pC4String$pC4Object$Nillable$i64$i64$i64$i64$C4ID$pC4PropList$i64$i64.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$pC4String$pC4Object$Nillable$i64$i64$i64$i64$C4ID$pC4PropList$i64$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$pC4String$pC4PropList$pC4Effect$b extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [4, 3, 13, 2]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$pC4String$pC4PropList$pC4Effect$b.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 4;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$pC4String$pC4PropList$pC4Effect$b.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$pC4String$pC4PropList$pC4Effect$b().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$pC4String$pC4PropList extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [4, 3]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$pC4String$pC4PropList.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$pC4String$pC4PropList.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$pC4String$pC4PropList().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$pC4String$pC4String$pC4String extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [4, 4, 4]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$pC4String$pC4String$pC4String.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 3;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$pC4String$pC4String$pC4String.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$pC4String$pC4String$pC4String().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$pC4String$pC4String extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [4, 4]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$pC4String$pC4String.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$pC4String$pC4String.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$pC4String$pC4String().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$pC4String$C4Value$C4Value$C4Value$C4Value$C4Value$pC4PropList$i32 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [4, 10, 10, 10, 10, 10, 3, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$pC4String$C4Value$C4Value$C4Value$C4Value$C4Value$pC4PropList$i32.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 8;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$pC4String$C4Value$C4Value$C4Value$C4Value$C4Value$pC4PropList$i32.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$pC4String$C4Value$C4Value$C4Value$C4Value$C4Value$pC4PropList$i32().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$pC4String$Nillable$i64$Nillable$i64$pC4String extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [4, 1, 1, 4]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$pC4String$Nillable$i64$Nillable$i64$pC4String.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 4;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$pC4String$Nillable$i64$Nillable$i64$pC4String.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$pC4String$Nillable$i64$Nillable$i64$pC4String().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$pC4String$b$Nillable$i64$Nillable$i64$i64$i64$i64$pC4PropList extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [4, 2, 1, 1, 1, 1, 1, 3]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$pC4String$b$Nillable$i64$Nillable$i64$i64$i64$i64$pC4PropList.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 8;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$pC4String$b$Nillable$i64$Nillable$i64$i64$i64$i64$pC4PropList.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$pC4String$b$Nillable$i64$Nillable$i64$i64$i64$i64$pC4PropList().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$pC4String$b$b extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [4, 2, 2]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$pC4String$b$b.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 3;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$pC4String$b$b.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$pC4String$b$b().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$pC4String$b$i64$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [4, 2, 1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$pC4String$b$i64$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 4;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$pC4String$b$i64$i64.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$pC4String$b$i64$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$pC4String$C4Value$pC4PropList extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [4, 10, 3]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$pC4String$C4Value$pC4PropList.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 3;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$pC4String$C4Value$pC4PropList.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$pC4String$C4Value$pC4PropList().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$pC4String$i32$i32$pC4Object extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [4, 1, 1, 11]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$pC4String$i32$i32$pC4Object.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 4;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$pC4String$i32$i32$pC4Object.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$pC4String$i32$i32$pC4Object().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$pC4String$i64$i64$Nillable$i64$Nillable$i64$i64$i64$pC4PropList extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [4, 1, 1, 1, 1, 1, 1, 3]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$pC4String$i64$i64$Nillable$i64$Nillable$i64$i64$i64$pC4PropList.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 8;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$pC4String$i64$i64$Nillable$i64$Nillable$i64$i64$i64$pC4PropList.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$pC4String$i64$i64$Nillable$i64$Nillable$i64$i64$i64$pC4PropList().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$pC4String$i64$i64$i64$C4ID extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [4, 1, 1, 1, 3]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$pC4String$i64$i64$i64$C4ID.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 5;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$pC4String$i64$i64$i64$C4ID.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$pC4String$i64$i64$i64$C4ID().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$pC4String$i64$i64$i64$i64$i64$i64$i64$i64$C4Value extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = new Int32Array([4, 1, 1, 1, 1, 1, 1, 1, 1, 10]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$pC4String$i64$i64$i64$i64$i64$i64$i64$i64$C4Value.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 10;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$pC4String$i64$i64$i64$i64$i64$i64$i64$i64$C4Value.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$pC4String$i64$i64$i64$i64$i64$i64$i64$i64$C4Value().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$pC4String$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [4, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$pC4String$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$pC4String$i64.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$pC4String$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$pC4String extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [4]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$pC4String.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 1;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$pC4String.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$pC4String().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$pC4ValueArray$pC4String$b extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [5, 4, 2]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$pC4ValueArray$pC4String$b.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 3;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$pC4ValueArray$pC4String$b.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$pC4ValueArray$pC4String$b().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$pC4ValueArray$b extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [5, 2]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$pC4ValueArray$b.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$pC4ValueArray$b.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$pC4ValueArray$b().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$pC4ValueArray$i32$b extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [5, 1, 2]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$pC4ValueArray$i32$b.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 3;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$pC4ValueArray$i32$b.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$pC4ValueArray$i32$b().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$Nillable$i64$C4ID$b extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 3, 2]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$Nillable$i64$C4ID$b.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 3;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$Nillable$i64$C4ID$b.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$Nillable$i64$C4ID$b().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1, 1, 1, 1, 1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 7;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$b extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [2]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$b.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 1;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$b.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$b().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$C4Value$C4Value extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [10, 10]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$C4Value$C4Value.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$C4Value$C4Value.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$C4Value$C4Value().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$i32$pC4String extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 4]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$i32$pC4String.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$i32$pC4String.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$i32$pC4String().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$i32$i32$pC4Object extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1, 11]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$i32$i32$pC4Object.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 3;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$i32$i32$pC4Object.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$i32$i32$pC4Object().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$i32$i32$C4Value$C4Value extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1, 10, 10]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$i32$i32$C4Value$C4Value.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 4;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$i32$i32$C4Value$C4Value.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$i32$i32$C4Value$C4Value().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$i32$i32 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$i32$i32.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$i32$i32.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$i32$i32().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$i64$C4ID$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 3, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$i64$C4ID$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 3;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$i64$C4ID$i64.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$i64$C4ID$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$i64$pC4Object$b extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 11, 2]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$i64$pC4Object$b.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 3;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$i64$pC4Object$b.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$i64$pC4Object$b().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$i64$pC4Object extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 11]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$i64$pC4Object.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$i64$pC4Object.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$i64$pC4Object().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$i64$pC4PropList extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 3]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$i64$pC4PropList.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$i64$pC4PropList.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$i64$pC4PropList().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$i64$pC4String extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 4]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$i64$pC4String.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$i64$pC4String.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$i64$pC4String().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$i64$b extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 2]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$i64$b.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$i64$b.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$i64$b().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$i64$i64$pC4String$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1, 4, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$i64$i64$pC4String$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 4;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$i64$i64$pC4String$i64.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$i64$i64$pC4String$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$i64$i64$b$b$b extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1, 2, 2, 2]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$i64$i64$b$b$b.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 5;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$i64$i64$b$b$b.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$i64$i64$b$b$b().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$i64$i64$b extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1, 2]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$i64$i64$b.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 3;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$i64$i64$b.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$i64$i64$b().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$i64$i64$i64$pC4PropList extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1, 1, 3]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$i64$i64$i64$pC4PropList.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 4;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$i64$i64$i64$pC4PropList.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$i64$i64$i64$pC4PropList().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$i64$i64$i64$i64$i64$pC4PropList extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1, 1, 1, 1, 3]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$i64$i64$i64$i64$i64$pC4PropList.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 6;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$i64$i64$i64$i64$i64$pC4PropList.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$i64$i64$i64$i64$i64$pC4PropList().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$i64$i64$i64$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1, 1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$i64$i64$i64$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 4;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$i64$i64$i64$i64.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$i64$i64$i64$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$i64$i64$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$i64$i64$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 3;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$i64$i64$i64.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$i64$i64$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$i64$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$i64$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$i64$i64.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$i64$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 1;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$i64.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, []);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 0;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$i32$C4PropList$pC4PropList extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [3]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$i32$C4PropList$pC4PropList.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 1;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$i32$C4PropList$pC4PropList.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$i32$C4PropList$pC4PropList().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$i32$C4PropList$pC4String extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [4]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$i32$C4PropList$pC4String.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 1;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$i32$C4PropList$pC4String.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$i32$C4PropList$pC4String().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$i32$C4PropList$pC4ValueArray$C4Value extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [5, 10]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$i32$C4PropList$pC4ValueArray$C4Value.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$i32$C4PropList$pC4ValueArray$C4Value.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$i32$C4PropList$pC4ValueArray$C4Value().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$i32$C4PropList$C4Value$pC4ValueArray extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [10, 5]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$i32$C4PropList$C4Value$pC4ValueArray.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$i32$C4PropList$C4Value$pC4ValueArray.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$i32$C4PropList$C4Value$pC4ValueArray().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$i32$C4PropList$C4Value extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [10]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$i32$C4PropList$C4Value.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 1;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$i32$C4PropList$C4Value.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$i32$C4PropList$C4Value().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$i32$C4PropList$i32$i32 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$i32$C4PropList$i32$i32.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$i32$C4PropList$i32$i32.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$i32$C4PropList$i32$i32().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$i32$C4PropList$i64$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$i32$C4PropList$i64$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$i32$C4PropList$i64$i64.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$i32$C4PropList$i64$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$i32$C4PropList$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$i32$C4PropList$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 1;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$i32$C4PropList$i64.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$i32$C4PropList$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$i32$C4PropList extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, []);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$i32$C4PropList.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 0;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$i32$C4PropList.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$i32$C4PropList().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$i64$C4Object$C4ID extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [3]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$i64$C4Object$C4ID.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 1;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$i64$C4Object$C4ID.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$i64$C4Object$C4ID().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$i64$C4Object$pC4Object extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [11]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$i64$C4Object$pC4Object.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 1;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$i64$C4Object$pC4Object.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$i64$C4Object$pC4Object().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$i64$C4Object$b extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [2]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$i64$C4Object$b.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 1;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$i64$C4Object$b.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$i64$C4Object$b().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$i64$C4Object$i64$i64$i64$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1, 1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$i64$C4Object$i64$i64$i64$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 4;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$i64$C4Object$i64$i64$i64$i64.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$i64$C4Object$i64$i64$i64$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$i64$C4Object$i64$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$i64$C4Object$i64$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$i64$C4Object$i64$i64.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$i64$C4Object$i64$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$i64$C4Object$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$i64$C4Object$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 1;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$i64$C4Object$i64.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$i64$C4Object$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$i64$C4Object extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, []);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$i64$C4Object.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 0;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$i64$C4Object.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$i64$C4Object().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$i64$C4PropList$C4ID$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [3, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$i64$C4PropList$C4ID$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$i64$C4PropList$C4ID$i64.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$i64$C4PropList$C4ID$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$i64$C4PropList$pC4Object$pC4Object extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [11, 11]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$i64$C4PropList$pC4Object$pC4Object.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$i64$C4PropList$pC4Object$pC4Object.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$i64$C4PropList$pC4Object$pC4Object().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$i64$C4PropList$pC4Object$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [11, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$i64$C4PropList$pC4Object$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$i64$C4PropList$pC4Object$i64.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$i64$C4PropList$pC4Object$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$i64$C4PropList$pC4String$pC4PropList$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [4, 3, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$i64$C4PropList$pC4String$pC4PropList$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 3;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$i64$C4PropList$pC4String$pC4PropList$i64.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$i64$C4PropList$pC4String$pC4PropList$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$i64$C4PropList$pC4String$pC4String extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [4, 4]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$i64$C4PropList$pC4String$pC4String.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$i64$C4PropList$pC4String$pC4String.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$i64$C4PropList$pC4String$pC4String().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$i64$C4PropList$pC4String$i64$b extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [4, 1, 2]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$i64$C4PropList$pC4String$i64$b.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 3;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$i64$C4PropList$pC4String$i64$b.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$i64$C4PropList$pC4String$i64$b().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$i64$C4PropList$pC4String$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [4, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$i64$C4PropList$pC4String$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$i64$C4PropList$pC4String$i64.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$i64$C4PropList$pC4String$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$i64$C4PropList$pC4String extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [4]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$i64$C4PropList$pC4String.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 1;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$i64$C4PropList$pC4String.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$i64$C4PropList$pC4String().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$i64$C4PropList$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1, 1, 1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$i64$C4PropList$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 5;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$i64$C4PropList$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$i64$C4PropList$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$i64$C4PropList$b extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [2]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$i64$C4PropList$b.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 1;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$i64$C4PropList$b.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$i64$C4PropList$b().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$i64$C4PropList$C4Value$Nillable$i64$b$i64$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [10, 1, 2, 1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$i64$C4PropList$C4Value$Nillable$i64$b$i64$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 5;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$i64$C4PropList$C4Value$Nillable$i64$b$i64$i64.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$i64$C4PropList$C4Value$Nillable$i64$b$i64$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$i64$C4PropList$i64$b extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 2]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$i64$C4PropList$i64$b.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$i64$C4PropList$i64$b.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$i64$C4PropList$i64$b().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$i64$C4PropList$i64$i64$b extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1, 2]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$i64$C4PropList$i64$i64$b.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 3;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$i64$C4PropList$i64$i64$b.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$i64$C4PropList$i64$i64$b().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$i64$C4PropList$i64$i64$i64$b$b extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1, 1, 2, 2]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$i64$C4PropList$i64$i64$i64$b$b.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 5;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$i64$C4PropList$i64$i64$i64$b$b.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$i64$C4PropList$i64$i64$i64$b$b().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$i64$C4PropList$i64$i64$i64$i64$pC4String extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1, 1, 1, 4]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$i64$C4PropList$i64$i64$i64$i64$pC4String.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 5;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$i64$C4PropList$i64$i64$i64$i64$pC4String.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$i64$C4PropList$i64$i64$i64$i64$pC4String().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$i64$C4PropList$i64$i64$i64$i64$b$b extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1, 1, 1, 2, 2]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$i64$C4PropList$i64$i64$i64$i64$b$b.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 6;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$i64$C4PropList$i64$i64$i64$i64$b$b.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$i64$C4PropList$i64$i64$i64$i64$b$b().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$i64$C4PropList$i64$i64$i64$i64$b extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1, 1, 1, 2]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$i64$C4PropList$i64$i64$i64$i64$b.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 5;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$i64$C4PropList$i64$i64$i64$i64$b.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$i64$C4PropList$i64$i64$i64$i64$b().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$i64$C4PropList$i64$i64$i64$i64$i64$i64$pC4String$pC4String$b extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1, 1, 1, 1, 1, 4, 4, 2]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$i64$C4PropList$i64$i64$i64$i64$i64$i64$pC4String$pC4String$b.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 9;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$i64$C4PropList$i64$i64$i64$i64$i64$i64$pC4String$pC4String$b.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$i64$C4PropList$i64$i64$i64$i64$i64$i64$pC4String$pC4String$b().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$i64$C4PropList$i64$i64$i64$i64$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1, 1, 1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$i64$C4PropList$i64$i64$i64$i64$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 5;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$i64$C4PropList$i64$i64$i64$i64$i64.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$i64$C4PropList$i64$i64$i64$i64$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$i64$C4PropList$i64$i64$i64$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1, 1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$i64$C4PropList$i64$i64$i64$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 4;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$i64$C4PropList$i64$i64$i64$i64.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$i64$C4PropList$i64$i64$i64$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$i64$C4PropList$i64$i64$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$i64$C4PropList$i64$i64$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 3;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$i64$C4PropList$i64$i64$i64.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$i64$C4PropList$i64$i64$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$i64$C4PropList$i64$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$i64$C4PropList$i64$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$i64$C4PropList$i64$i64.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$i64$C4PropList$i64$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$i64$C4PropList$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$i64$C4PropList$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 1;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$i64$C4PropList$i64.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$i64$C4PropList$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$i64$C4PropList extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, []);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$i64$C4PropList.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 0;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$i64$C4PropList.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$i64$C4PropList().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$x$C4Object$pC4Object$pC4Object extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [11, 11]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$x$C4Object$pC4Object$pC4Object.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 0;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$x$C4Object$pC4Object$pC4Object.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$x$C4Object$pC4Object$pC4Object().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$x$C4Object$pC4Object extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [11]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$x$C4Object$pC4Object.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 1;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 0;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$x$C4Object$pC4Object.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$x$C4Object$pC4Object().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$x$C4Object$b extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [2]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$x$C4Object$b.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 1;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 0;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$x$C4Object$b.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$x$C4Object$b().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$x$C4Object$i64$Nillable$i64$Nillable$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$x$C4Object$i64$Nillable$i64$Nillable$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 3;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 0;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$x$C4Object$i64$Nillable$i64$Nillable$i64.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$x$C4Object$i64$Nillable$i64$Nillable$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$x$C4Object$i64$Nillable$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$x$C4Object$i64$Nillable$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 0;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$x$C4Object$i64$Nillable$i64.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$x$C4Object$i64$Nillable$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$x$C4Object$i64$b$Nillable$i64$Nillable$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 2, 1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$x$C4Object$i64$b$Nillable$i64$Nillable$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 4;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 0;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$x$C4Object$i64$b$Nillable$i64$Nillable$i64.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$x$C4Object$i64$b$Nillable$i64$Nillable$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$x$C4Object$i64$i64$b$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1, 2, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$x$C4Object$i64$i64$b$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 4;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 0;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$x$C4Object$i64$i64$b$i64.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$x$C4Object$i64$i64$b$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$x$C4Object$i64$i64$i64$b extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1, 1, 2]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$x$C4Object$i64$i64$i64$b.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 4;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 0;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$x$C4Object$i64$i64$i64$b.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$x$C4Object$i64$i64$i64$b().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$x$C4Object$i64$i64$i64$i64$i64$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1, 1, 1, 1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$x$C4Object$i64$i64$i64$i64$i64$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 6;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 0;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$x$C4Object$i64$i64$i64$i64$i64$i64.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$x$C4Object$i64$i64$i64$i64$i64$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$x$C4Object$i64$i64$i64$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1, 1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$x$C4Object$i64$i64$i64$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 4;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 0;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$x$C4Object$i64$i64$i64$i64.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$x$C4Object$i64$i64$i64$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$x$C4Object$i64$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$x$C4Object$i64$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 0;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$x$C4Object$i64$i64.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$x$C4Object$i64$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$x$C4Object$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$x$C4Object$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 1;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 0;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$x$C4Object$i64.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$x$C4Object$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$x$C4Object extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, []);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$x$C4Object.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 0;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 0;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$x$C4Object.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$x$C4Object().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$x$C4PropList$pC4PropList$pC4PropList extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [3, 3]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$x$C4PropList$pC4PropList$pC4PropList.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 0;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$x$C4PropList$pC4PropList$pC4PropList.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$x$C4PropList$pC4PropList$pC4PropList().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$x$C4PropList$pC4ValueArray$i32 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [5, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$x$C4PropList$pC4ValueArray$i32.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 0;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$x$C4PropList$pC4ValueArray$i32.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$x$C4PropList$pC4ValueArray$i32().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$x$C4PropList$b$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [2, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$x$C4PropList$b$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 0;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$x$C4PropList$b$i64.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$x$C4PropList$b$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$x$C4PropList$b extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [2]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$x$C4PropList$b.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 1;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 0;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$x$C4PropList$b.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$x$C4PropList$b().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$x$C4PropList$i64$b extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 2]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$x$C4PropList$i64$b.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 0;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$x$C4PropList$i64$b.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$x$C4PropList$i64$b().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$x$C4PropList$i64$i64$i64$Nillable$i64$Nillable$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1, 1, 1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$x$C4PropList$i64$i64$i64$Nillable$i64$Nillable$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 5;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 0;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$x$C4PropList$i64$i64$i64$Nillable$i64$Nillable$i64.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$x$C4PropList$i64$i64$i64$Nillable$i64$Nillable$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$x$C4PropList$i64$i64$i64$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1, 1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$x$C4PropList$i64$i64$i64$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 4;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 0;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$x$C4PropList$i64$i64$i64$i64.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$x$C4PropList$i64$i64$i64$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$x$C4PropList$i64$i64$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$x$C4PropList$i64$i64$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 3;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 0;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$x$C4PropList$i64$i64$i64.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$x$C4PropList$i64$i64$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$x$C4PropList$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$x$C4PropList$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 1;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 0;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$x$C4PropList$i64.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$x$C4PropList$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class NeedObjectContext extends C4AulExecError {

  init(function_) {
    super.init($.FormatString(S("%s: must be called from object context"), function_).getData());
    return this;
  }

  $clone() { return new NeedObjectContext().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class NeedNonGlobalContext extends C4AulExecError {

  init(function_) {
    super.init($.FormatString(S("%s: call must not be from global context"), function_).getData());
    return this;
  }

  $clone() { return new NeedNonGlobalContext().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class C4AulEngineFunc$C4Value$C4PropList$pC4String$i32 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [4, 1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$C4Value$C4PropList$pC4String$i32.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 2;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 10;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$C4Value$C4PropList$pC4String$i32.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$C4Value$C4PropList$pC4String$i32().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$Nillable$i32$C4PropList$pC4String extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [4]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$Nillable$i32$C4PropList$pC4String.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 1;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$Nillable$i32$C4PropList$pC4String.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$Nillable$i32$C4PropList$pC4String().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$Nillable$i64$C4PropList$i64 extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$Nillable$i64$C4PropList$i64.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 1;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 1;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$Nillable$i64$C4PropList$i64.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$Nillable$i64$C4PropList$i64().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$b$C4PropList$pC4String$pC4PropList$pC4ValueArray extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [4, 3, 5]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$b$C4PropList$pC4String$pC4PropList$pC4ValueArray.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 3;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 2;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$b$C4PropList$pC4String$pC4PropList$pC4ValueArray.Exec(this.pFunc, ThisImpl$C4PropList.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$b$C4PropList$pC4String$pC4PropList$pC4ValueArray().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulEngineFunc$x$C4Object$i64$i64$b extends C4AulFunc {
  pFunc = null;
  ParType = new Int32Array(10);
  Public = false;

  init(Parent, pName, pFunc, Public) {
    super.init(Parent, pName);
    this.pFunc = pFunc;
    this.ParType = $ta(Int32Array, 10, [1, 1, 2]);
    this.Public = Public;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    for (let i = C4AulEngineFunc$x$C4Object$i64$i64$b.prototype.GetParCount.call(this); i < 10; i = i + 1 | 0) {
      this.ParType[i] = 10 /*C4V_Any*/;
    }
    return this;
  }

  GetParCount() {
    return 3;
  }

  GetParType() {
    return P(this.ParType, 0);
  }

  GetRetType() {
    return 0;
  }

  GetPublic() {
    return this.Public;
  }

  Exec$pC4PropList$pC4Value$b(_this, pPars, _fPassErrors) {
    return ExecImpl$x$C4Object$i64$i64$b.Exec(this.pFunc, ThisImpl$C4Object.Conv(_this, this), pPars, null);
  }

  $clone() { return new C4AulEngineFunc$x$C4Object$i64$i64$b().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFunc = o.pFunc;
    this.ParType = o.ParType.slice();
    this.Public = o.Public;
    return this;
  }
}

export class C4AulDefFunc extends C4AulFunc {
  Def = null;

  init(Parent, pDef) {
    super.init(Parent, pDef.Identifier);
    this.Def = pDef;
    Parent.SetPropertyByS(this.Name.op_C4String_(), $.C4VFunction(this));
    return this;
  }

  $dtor() {
    super.$dtor();
  }

  GetPublic() {
    return !!this.Def.Public;
  }

  GetParType() {
    return P(this.Def.ParType, 0);
  }

  GetRetType() {
    return this.Def.RetType;
  }

  Exec$pC4PropList$pC4Value$b(p, pPars, _fPassErrors = false) {
    0;
    return this.Def.FunctionC4V(p, pPars);
  }

  $clone() { return new C4AulDefFunc().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Def = o.Def;
    return this;
  }
}

export function FnStringPar(pString) {
  return pString != null ? pString.GetCStr() : S("");
}

export function String_(str) {
  return str != null ? $.Strings.RegString$pi8(str) : null;
}

export function Object_(_this) {
  return _this != null ? _this.GetObject$v() : null;
}

export function AddFunc(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$C4Value$C4PropList$pC4String$pC4PropList().init(Parent, Name, pFunc, Public);
}

export function AddFunc$2(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$C4Value$C4PropList$pC4String$pC4PropList$i32$i32$C4Value$C4Value$C4Value$C4Value().init(Parent, Name, pFunc, Public);
}

export function AddFunc$3(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$C4Value$C4PropList$pC4String$pC4PropList$i32$i32$pC4PropList$pC4Def$C4Value$C4Value$C4Value$C4Value().init(Parent, Name, pFunc, Public);
}

export function AddFunc$4(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$C4Value$C4PropList$pC4String$pC4String$i32().init(Parent, Name, pFunc, Public);
}

export function AddFunc$5(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$C4Value$C4PropList$pC4String$pC4String$i32$i32().init(Parent, Name, pFunc, Public);
}

export function AddFunc$6(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$C4Value$C4PropList$pC4String$b().init(Parent, Name, pFunc, Public);
}

export function AddFunc$7(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$C4Value$C4PropList$pC4String$i32().init(Parent, Name, pFunc, Public);
}

export function AddFunc$8(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$C4Value$C4PropList$i32$C4ID$i32$i32().init(Parent, Name, pFunc, Public);
}

export function AddFunc$9(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$C4Value$C4PropList$i32$pC4String().init(Parent, Name, pFunc, Public);
}

export function AddFunc$10(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$C4Value$C4PropList$i32$pC4String$C4Value().init(Parent, Name, pFunc, Public);
}

export function AddFunc$11(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$C4Value$C4Object$pC4String().init(Parent, Name, pFunc, Public);
}

export function AddFunc$12(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$C4Value$C4Object$pC4String$C4Value().init(Parent, Name, pFunc, Public);
}

export function AddFunc$13(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$C4Value$C4Object$pC4String$pC4String$i32().init(Parent, Name, pFunc, Public);
}

export function AddFunc$14(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$C4Value$C4Object$i32$i32().init(Parent, Name, pFunc, Public);
}

export function AddFunc$15(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$Nillable$pC4ValueArray$C4PropList().init(Parent, Name, pFunc, Public);
}

export function AddFunc$16(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$Nillable$pC4ValueArray$C4PropList$pC4String$pC4String$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$17(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$Nillable$pC4ValueArray$C4PropList$Nillable$i32().init(Parent, Name, pFunc, Public);
}

export function AddFunc$18(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$Nillable$pC4Def$C4Object().init(Parent, Name, pFunc, Public);
}

export function AddFunc$19(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$Nillable$pC4String$C4PropList$pC4String$pC4String$pC4String().init(Parent, Name, pFunc, Public);
}

export function AddFunc$20(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$Nillable$pC4String$C4PropList$pC4String$pC4String$pC4String$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$21(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$Nillable$pC4String$C4PropList$i32().init(Parent, Name, pFunc, Public);
}

export function AddFunc$22(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$Nillable$pC4String$C4PropList$i32$Nillable$pC4String$i32().init(Parent, Name, pFunc, Public);
}

export function AddFunc$23(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$Nillable$pC4String$C4Object$Nillable$i32$Nillable$i32().init(Parent, Name, pFunc, Public);
}

export function AddFunc$24(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$Nillable$i32$C4PropList$pC4String().init(Parent, Name, pFunc, Public);
}

export function AddFunc$25(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$Nillable$i32$C4PropList$C4Value$Nillable$i32().init(Parent, Name, pFunc, Public);
}

export function AddFunc$26(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$Nillable$i32$C4Object$pC4PropList$pC4String$pC4String$pC4ValueArray$i32$i32().init(Parent, Name, pFunc, Public);
}

export function AddFunc$27(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$Nillable$i32$C4Object$pC4String$pC4ValueArray$i32$pC4ValueArray$Nillable$i32$Nillable$i32().init(Parent, Name, pFunc, Public);
}

export function AddFunc$28(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$Nillable$i32$C4Object$pC4String$Nillable$i32().init(Parent, Name, pFunc, Public);
}

export function AddFunc$29(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$Nillable$i32$C4Object$pC4String$i32$pC4ValueArray$Nillable$pC4ValueArray$Nillable$i32$Nillable$i32().init(Parent, Name, pFunc, Public);
}

export function AddFunc$30(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$Nillable$i32$C4Object$Nillable$i32$Nillable$i32().init(Parent, Name, pFunc, Public);
}

export function AddFunc$31(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$Nillable$i32$C4Object$i32$Nillable$i32().init(Parent, Name, pFunc, Public);
}

export function AddFunc$32(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$Nillable$i64$C4PropList().init(Parent, Name, pFunc, Public);
}

export function AddFunc$33(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$Nillable$i64$C4PropList$pC4String().init(Parent, Name, pFunc, Public);
}

export function AddFunc$34(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$Nillable$i64$C4PropList$pC4String$pC4String().init(Parent, Name, pFunc, Public);
}

export function AddFunc$35(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$Nillable$i64$C4PropList$pC4String$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$36(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$Nillable$i64$C4PropList$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$37(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$Nillable$i64$C4PropList$i64$i64$i64$i64$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$38(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$Nillable$i64$C4Object().init(Parent, Name, pFunc, Public);
}

export function AddFunc$39(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$Nillable$i64$C4Object$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$40(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$Nillable$i64$C4Object$i64$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$41(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$pC4PropList$C4Object().init(Parent, Name, pFunc, Public);
}

export function AddFunc$42(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$pC4PropList$C4PropList$pC4String$i32$i32().init(Parent, Name, pFunc, Public);
}

export function AddFunc$43(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$pC4PropList$C4PropList$C4Value$pC4ValueArray().init(Parent, Name, pFunc, Public);
}

export function AddFunc$44(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$pC4PropList$C4PropList$pC4PropList().init(Parent, Name, pFunc, Public);
}

export function AddFunc$45(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$pC4PropList$C4PropList$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$46(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$pC4ValueArray$C4PropList$C4Value().init(Parent, Name, pFunc, Public);
}

export function AddFunc$47(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$pC4ValueArray$C4PropList$C4Value$C4Value().init(Parent, Name, pFunc, Public);
}

export function AddFunc$48(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$pC4ValueArray$C4PropList$C4Value$C4Value$C4Value().init(Parent, Name, pFunc, Public);
}

export function AddFunc$49(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$pC4ValueArray$C4PropList$C4Value$C4Value$C4Value$C4Value().init(Parent, Name, pFunc, Public);
}

export function AddFunc$50(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$pC4ValueArray$C4PropList().init(Parent, Name, pFunc, Public);
}

export function AddFunc$51(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$pC4ValueArray$C4PropList$pC4PropList().init(Parent, Name, pFunc, Public);
}

export function AddFunc$52(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$pC4ValueArray$C4PropList$pC4PropList$i32$i32().init(Parent, Name, pFunc, Public);
}

export function AddFunc$53(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$pC4ValueArray$C4PropList$C4Value$2().init(Parent, Name, pFunc, Public);
}

export function AddFunc$54(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$pC4ValueArray$C4PropList$i32().init(Parent, Name, pFunc, Public);
}

export function AddFunc$55(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$pC4ValueArray$C4PropList$i32$i32$Nillable$i32$Nillable$i32$Nillable$i32$Nillable$i32$Nillable$i32$i32().init(Parent, Name, pFunc, Public);
}

export function AddFunc$56(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$pC4ValueArray$C4PropList$i32$i32$i32$i32().init(Parent, Name, pFunc, Public);
}

export function AddFunc$57(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$pC4ValueArray$C4PropList$i64$i64$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$58(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$pC4ValueArray$C4PropList$i64$i64$i64$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$59(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$pC4Def$C4PropList$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$60(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$pC4Effect$C4PropList$pC4String$pC4PropList$i32$i32().init(Parent, Name, pFunc, Public);
}

export function AddFunc$61(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$pC4Effect$C4PropList$pC4PropList$i32$i32$C4Value$C4Value$C4Value$C4Value().init(Parent, Name, pFunc, Public);
}

export function AddFunc$62(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$pC4Object$C4PropList().init(Parent, Name, pFunc, Public);
}

export function AddFunc$63(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$pC4Object$C4PropList$pC4PropList().init(Parent, Name, pFunc, Public);
}

export function AddFunc$64(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$pC4Object$C4PropList$pC4PropList$i64$i64$Nillable$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$65(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$pC4Object$C4PropList$pC4PropList$i64$i64$Nillable$i64$i64$b$b().init(Parent, Name, pFunc, Public);
}

export function AddFunc$66(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$pC4Object$C4PropList$pC4PropList$i64$i64$i64$i64$i64$pC4PropList().init(Parent, Name, pFunc, Public);
}

export function AddFunc$67(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$pC4Object$C4PropList$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$68(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$pC4Object$C4PropList$i64$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$69(Parent, Name, pFunc, Public) {
  new C4AulEngineFunc$pC4Object$C4Object$C4ID().init(Parent, Name, pFunc, Public);
}

export function AddFunc$70(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$pC4Object$C4Object().init(Parent, Name, pFunc, Public);
}

export function AddFunc$71(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$pC4Object$C4Object$pC4PropList$Nillable$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$72(Parent, Name, pFunc, Public) {
  new C4AulEngineFunc$pC4Object$C4Object$pC4Def().init(Parent, Name, pFunc, Public);
}

export function AddFunc$73(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$pC4Object$C4Object$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$74(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$pC4String$C4PropList().init(Parent, Name, pFunc, Public);
}

export function AddFunc$75(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$pC4String$C4PropList$C4Value().init(Parent, Name, pFunc, Public);
}

export function AddFunc$76(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$pC4String$C4PropList$pC4String().init(Parent, Name, pFunc, Public);
}

export function AddFunc$77(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$pC4String$C4PropList$b().init(Parent, Name, pFunc, Public);
}

export function AddFunc$78(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$pC4String$C4PropList$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$79(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$pC4String$C4PropList$i64$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$80(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$pC4String$C4PropList$i64$i64$b$b().init(Parent, Name, pFunc, Public);
}

export function AddFunc$81(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$pC4String$C4Object().init(Parent, Name, pFunc, Public);
}

export function AddFunc$82(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$Nillable$i64$C4ID$b().init(Parent, Name, pFunc, Public);
}

export function AddFunc$83(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$84(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList().init(Parent, Name, pFunc, Public);
}

export function AddFunc$85(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$pC4ValueArray$pC4String$b().init(Parent, Name, pFunc, Public);
}

export function AddFunc$86(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$pC4ValueArray$b().init(Parent, Name, pFunc, Public);
}

export function AddFunc$87(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$pC4ValueArray$i32$b().init(Parent, Name, pFunc, Public);
}

export function AddFunc$88(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$pC4Def().init(Parent, Name, pFunc, Public);
}

export function AddFunc$89(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$pC4Object$b().init(Parent, Name, pFunc, Public);
}

export function AddFunc$90(Parent, Name, pFunc, Public) {
  new C4AulEngineFunc$b$C4PropList$pC4Object$b$pC4String$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$91(Parent, Name, pFunc, Public) {
  new C4AulEngineFunc$b$C4PropList$pC4Object$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$92(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$pC4String$C4Value$C4Value$C4Value$C4Value$C4Value$pC4PropList$i32().init(Parent, Name, pFunc, Public);
}

export function AddFunc$93(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$pC4String$Nillable$i64$Nillable$i64$pC4String().init(Parent, Name, pFunc, Public);
}

export function AddFunc$94(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$pC4String().init(Parent, Name, pFunc, Public);
}

export function AddFunc$95(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$pC4String$pC4Object$Nillable$i64$i64$i64$i64$C4ID$pC4PropList$i64$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$96(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$pC4String$pC4PropList().init(Parent, Name, pFunc, Public);
}

export function AddFunc$97(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$pC4String$pC4PropList$pC4ValueArray().init(Parent, Name, pFunc, Public);
}

export function AddFunc$98(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$pC4String$pC4PropList$pC4Effect$b().init(Parent, Name, pFunc, Public);
}

export function AddFunc$99(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$pC4String$C4Value$pC4PropList().init(Parent, Name, pFunc, Public);
}

export function AddFunc$100(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$pC4String$pC4String().init(Parent, Name, pFunc, Public);
}

export function AddFunc$101(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$pC4String$pC4String$pC4String().init(Parent, Name, pFunc, Public);
}

export function AddFunc$102(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$pC4String$b$Nillable$i64$Nillable$i64$i64$i64$i64$pC4PropList().init(Parent, Name, pFunc, Public);
}

export function AddFunc$103(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$pC4String$b$b().init(Parent, Name, pFunc, Public);
}

export function AddFunc$104(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$pC4String$b$i64$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$105(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$pC4String$i32$i32$pC4Object().init(Parent, Name, pFunc, Public);
}

export function AddFunc$106(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$pC4String$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$107(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$pC4String$i64$i64$Nillable$i64$Nillable$i64$i64$i64$pC4PropList().init(Parent, Name, pFunc, Public);
}

export function AddFunc$108(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$pC4String$i64$i64$i64$C4ID().init(Parent, Name, pFunc, Public);
}

export function AddFunc$109(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$pC4String$i64$i64$i64$i64$i64$i64$i64$i64$C4Value().init(Parent, Name, pFunc, Public);
}

export function AddFunc$110(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$pC4PropList$Nillable$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$111(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$pC4PropList$pC4ValueArray().init(Parent, Name, pFunc, Public);
}

export function AddFunc$112(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$pC4PropList$C4Value$pC4ValueArray$i32().init(Parent, Name, pFunc, Public);
}

export function AddFunc$113(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$pC4PropList$b().init(Parent, Name, pFunc, Public);
}

export function AddFunc$114(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$pC4PropList$i32$i32().init(Parent, Name, pFunc, Public);
}

export function AddFunc$115(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$pC4PropList$i32$i32$pC4Object().init(Parent, Name, pFunc, Public);
}

export function AddFunc$116(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$C4Value$C4Value().init(Parent, Name, pFunc, Public);
}

export function AddFunc$117(Parent, Name, pFunc, Public) {
  new C4AulEngineFunc$b$C4PropList$b().init(Parent, Name, pFunc, Public);
}

export function AddFunc$118(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$i32$pC4String().init(Parent, Name, pFunc, Public);
}

export function AddFunc$119(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$i32$i32().init(Parent, Name, pFunc, Public);
}

export function AddFunc$120(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$i32$i32$pC4Object().init(Parent, Name, pFunc, Public);
}

export function AddFunc$121(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$i32$i32$C4Value$C4Value().init(Parent, Name, pFunc, Public);
}

export function AddFunc$122(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$i64$C4ID$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$123(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$124(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$i64$pC4Object().init(Parent, Name, pFunc, Public);
}

export function AddFunc$125(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$i64$pC4Object$b().init(Parent, Name, pFunc, Public);
}

export function AddFunc$126(Parent, Name, pFunc, Public) {
  new C4AulEngineFunc$b$C4PropList$i64$pC4String().init(Parent, Name, pFunc, Public);
}

export function AddFunc$127(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$i64$pC4PropList().init(Parent, Name, pFunc, Public);
}

export function AddFunc$128(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$i64$b().init(Parent, Name, pFunc, Public);
}

export function AddFunc$129(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$i64$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$130(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$i64$i64$pC4String$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$131(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$i64$i64$b().init(Parent, Name, pFunc, Public);
}

export function AddFunc$132(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$i64$i64$b$b$b().init(Parent, Name, pFunc, Public);
}

export function AddFunc$133(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$i64$i64$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$134(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$i64$i64$i64$pC4PropList().init(Parent, Name, pFunc, Public);
}

export function AddFunc$135(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$i64$i64$i64$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$136(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$i64$i64$i64$i64$i64$pC4PropList().init(Parent, Name, pFunc, Public);
}

export function AddFunc$137(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4Object$C4ID().init(Parent, Name, pFunc, Public);
}

export function AddFunc$138(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4Object$Nillable$i32$pC4ValueArray$Nillable$i32().init(Parent, Name, pFunc, Public);
}

export function AddFunc$139(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4Object$Nillable$i32$Nillable$i32().init(Parent, Name, pFunc, Public);
}

export function AddFunc$140(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4Object$Nillable$i64$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$141(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4Object().init(Parent, Name, pFunc, Public);
}

export function AddFunc$142(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4Object$pC4Def$pC4Object$i64$pC4String$i64$i64$b$C4ID().init(Parent, Name, pFunc, Public);
}

export function AddFunc$143(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4Object$pC4String$pC4Def$i64$i64$pC4String$i64$pC4Object().init(Parent, Name, pFunc, Public);
}

export function AddFunc$144(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4Object$pC4String$pC4Object$C4Value$i32$pC4Object$C4Value$i32().init(Parent, Name, pFunc, Public);
}

export function AddFunc$145(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4Object$pC4String$pC4Object$C4Value$i32$pC4Object$i32$C4Value$i32$i32().init(Parent, Name, pFunc, Public);
}

export function AddFunc$146(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4Object$pC4String$pC4Object$pC4Object$b().init(Parent, Name, pFunc, Public);
}

export function AddFunc$147(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4Object$pC4String$pC4String$pC4ValueArray$pC4ValueArray$C4Value$pC4PropList$i32().init(Parent, Name, pFunc, Public);
}

export function AddFunc$148(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4Object$pC4String$pC4String$pC4Def$i32$C4Value$pC4String$i32$C4Value$C4Value().init(Parent, Name, pFunc, Public);
}

export function AddFunc$149(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4Object$pC4String$i32().init(Parent, Name, pFunc, Public);
}

export function AddFunc$150(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4Object$pC4Object().init(Parent, Name, pFunc, Public);
}

export function AddFunc$151(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4Object$pC4Object$b().init(Parent, Name, pFunc, Public);
}

export function AddFunc$152(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4Object$pC4Object$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$153(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4Object$b$pC4Def$b().init(Parent, Name, pFunc, Public);
}

export function AddFunc$154(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4Object$b$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$155(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4Object$i32().init(Parent, Name, pFunc, Public);
}

export function AddFunc$156(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4Object$i64$Nillable$pC4String$Nillable$pC4String().init(Parent, Name, pFunc, Public);
}

export function AddFunc$157(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4Object$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$158(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4Object$i64$pC4ValueArray().init(Parent, Name, pFunc, Public);
}

export function AddFunc$159(Parent, Name, pFunc, Public) {
  new C4AulEngineFunc$b$C4Object$i64$b().init(Parent, Name, pFunc, Public);
}

export function AddFunc$160(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4Object$i64$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$161(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4Object$i64$i64$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$162(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4Object$i64$i64$i64$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$163(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4Object$i64$i64$i64$i64$i64$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$164(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4Object$i64$i64$i64$i64$i64$i64$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$165(Parent, Name, pFunc, Public) {
  new C4AulEngineFunc$b$C4Object$i64$i64$i64$i64$i64$i64$i64$i64$i64$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$166(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$i32$C4PropList().init(Parent, Name, pFunc, Public);
}

export function AddFunc$167(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$i32$C4PropList$pC4ValueArray$C4Value().init(Parent, Name, pFunc, Public);
}

export function AddFunc$168(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$i32$C4PropList$pC4String().init(Parent, Name, pFunc, Public);
}

export function AddFunc$169(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$i32$C4PropList$pC4PropList().init(Parent, Name, pFunc, Public);
}

export function AddFunc$170(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$i32$C4PropList$C4Value().init(Parent, Name, pFunc, Public);
}

export function AddFunc$171(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$i32$C4PropList$C4Value$pC4ValueArray().init(Parent, Name, pFunc, Public);
}

export function AddFunc$172(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$i32$C4PropList$i32$i32().init(Parent, Name, pFunc, Public);
}

export function AddFunc$173(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$i32$C4PropList$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$174(Parent, Name, pFunc, Public) {
  new C4AulEngineFunc$i32$C4PropList$i64$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$175(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$i64$C4PropList$C4ID$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$176(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$i64$C4PropList$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$177(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$i64$C4PropList().init(Parent, Name, pFunc, Public);
}

export function AddFunc$178(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$i64$C4PropList$pC4Object$pC4Object().init(Parent, Name, pFunc, Public);
}

export function AddFunc$179(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$i64$C4PropList$pC4Object$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$180(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$i64$C4PropList$pC4String().init(Parent, Name, pFunc, Public);
}

export function AddFunc$181(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$i64$C4PropList$pC4String$pC4PropList$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$182(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$i64$C4PropList$pC4String$pC4String().init(Parent, Name, pFunc, Public);
}

export function AddFunc$183(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$i64$C4PropList$pC4String$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$184(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$i64$C4PropList$pC4String$i64$b().init(Parent, Name, pFunc, Public);
}

export function AddFunc$185(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$i64$C4PropList$C4Value$Nillable$i64$b$i64$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$186(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$i64$C4PropList$b().init(Parent, Name, pFunc, Public);
}

export function AddFunc$187(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$i64$C4PropList$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$188(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$i64$C4PropList$i64$b().init(Parent, Name, pFunc, Public);
}

export function AddFunc$189(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$i64$C4PropList$i64$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$190(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$i64$C4PropList$i64$i64$b().init(Parent, Name, pFunc, Public);
}

export function AddFunc$191(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$i64$C4PropList$i64$i64$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$192(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$i64$C4PropList$i64$i64$i64$b$b().init(Parent, Name, pFunc, Public);
}

export function AddFunc$193(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$i64$C4PropList$i64$i64$i64$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$194(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$i64$C4PropList$i64$i64$i64$i64$pC4String().init(Parent, Name, pFunc, Public);
}

export function AddFunc$195(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$i64$C4PropList$i64$i64$i64$i64$b().init(Parent, Name, pFunc, Public);
}

export function AddFunc$196(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$i64$C4PropList$i64$i64$i64$i64$b$b().init(Parent, Name, pFunc, Public);
}

export function AddFunc$197(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$i64$C4PropList$i64$i64$i64$i64$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$198(Parent, Name, pFunc, Public) {
  new C4AulEngineFunc$i64$C4PropList$i64$i64$i64$i64$i64$i64$pC4String$pC4String$b().init(Parent, Name, pFunc, Public);
}

export function AddFunc$199(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$i64$C4Object$C4ID().init(Parent, Name, pFunc, Public);
}

export function AddFunc$200(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$i64$C4Object().init(Parent, Name, pFunc, Public);
}

export function AddFunc$201(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$i64$C4Object$pC4Object().init(Parent, Name, pFunc, Public);
}

export function AddFunc$202(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$i64$C4Object$b().init(Parent, Name, pFunc, Public);
}

export function AddFunc$203(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$i64$C4Object$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$204(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$i64$C4Object$i64$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$205(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$i64$C4Object$i64$i64$i64$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$206(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$x$C4PropList$pC4ValueArray$i32().init(Parent, Name, pFunc, Public);
}

export function AddFunc$207(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$x$C4PropList$pC4PropList$pC4PropList().init(Parent, Name, pFunc, Public);
}

export function AddFunc$208(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$x$C4PropList$b().init(Parent, Name, pFunc, Public);
}

export function AddFunc$209(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$x$C4PropList$b$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$210(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$x$C4PropList$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$211(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$x$C4PropList$i64$b().init(Parent, Name, pFunc, Public);
}

export function AddFunc$212(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$x$C4PropList$i64$i64$i64$Nillable$i64$Nillable$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$213(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$x$C4PropList$i64$i64$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$214(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$x$C4PropList$i64$i64$i64$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$215(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$x$C4Object().init(Parent, Name, pFunc, Public);
}

export function AddFunc$216(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$x$C4Object$pC4Object().init(Parent, Name, pFunc, Public);
}

export function AddFunc$217(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$x$C4Object$pC4Object$pC4Object().init(Parent, Name, pFunc, Public);
}

export function AddFunc$218(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$x$C4Object$b().init(Parent, Name, pFunc, Public);
}

export function AddFunc$219(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$x$C4Object$i64$Nillable$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$220(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$x$C4Object$i64$Nillable$i64$Nillable$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$221(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$x$C4Object$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$222(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$x$C4Object$i64$b$Nillable$i64$Nillable$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$223(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$x$C4Object$i64$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$224(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$x$C4Object$i64$i64$b().init(Parent, Name, pFunc, Public);
}

export function AddFunc$225(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$x$C4Object$i64$i64$b$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$226(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$x$C4Object$i64$i64$i64$b().init(Parent, Name, pFunc, Public);
}

export function AddFunc$227(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$x$C4Object$i64$i64$i64$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$228(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$x$C4Object$i64$i64$i64$i64$i64$i64().init(Parent, Name, pFunc, Public);
}

export function $init(): void {
  C4ValueConv$pC4Def.Type = 12 /*C4V_Def*/;
  C4ValueConv$pC4Effect.Type = 13 /*C4V_Effect*/;
  C4ValueConv$C4ID.Type = 3 /*C4V_PropList*/;
  C4ValueConv$pC4Object.Type = 11 /*C4V_Object*/;
  C4ValueConv$pC4PropList.Type = 3 /*C4V_PropList*/;
  C4ValueConv$pC4String.Type = 4 /*C4V_String*/;
  C4ValueConv$C4Value.Type = 10 /*C4V_Any*/;
  C4ValueConv$pC4ValueArray.Type = 5 /*C4V_Array*/;
  C4ValueConv$Nillable$pC4String.Type = 4;
  C4ValueConv$Nillable$pC4ValueArray.Type = 5;
  C4ValueConv$Nillable$i32.Type = 1;
  C4ValueConv$Nillable$i64.Type = 1;
  C4ValueConv$b.Type = 2 /*C4V_Bool*/;
  C4ValueConv$C4Value$2.Type = 10 /*C4V_Any*/;
  C4ValueConv$i32.Type = 1 /*C4V_Int*/;
}

Object.assign($, { AddFunc, AddFunc$10, AddFunc$100, AddFunc$101, AddFunc$102, AddFunc$103, AddFunc$104, AddFunc$105, AddFunc$106, AddFunc$107, AddFunc$108, AddFunc$109, AddFunc$11, AddFunc$110, AddFunc$111, AddFunc$112, AddFunc$113, AddFunc$114, AddFunc$115, AddFunc$116, AddFunc$117, AddFunc$118, AddFunc$119, AddFunc$12, AddFunc$120, AddFunc$121, AddFunc$122, AddFunc$123, AddFunc$124, AddFunc$125, AddFunc$126, AddFunc$127, AddFunc$128, AddFunc$129, AddFunc$13, AddFunc$130, AddFunc$131, AddFunc$132, AddFunc$133, AddFunc$134, AddFunc$135, AddFunc$136, AddFunc$137, AddFunc$138, AddFunc$139, AddFunc$14, AddFunc$140, AddFunc$141, AddFunc$142, AddFunc$143, AddFunc$144, AddFunc$145, AddFunc$146, AddFunc$147, AddFunc$148, AddFunc$149, AddFunc$15, AddFunc$150, AddFunc$151, AddFunc$152, AddFunc$153, AddFunc$154, AddFunc$155, AddFunc$156, AddFunc$157, AddFunc$158, AddFunc$159, AddFunc$16, AddFunc$160, AddFunc$161, AddFunc$162, AddFunc$163, AddFunc$164, AddFunc$165, AddFunc$166, AddFunc$167, AddFunc$168, AddFunc$169, AddFunc$17, AddFunc$170, AddFunc$171, AddFunc$172, AddFunc$173, AddFunc$174, AddFunc$175, AddFunc$176, AddFunc$177, AddFunc$178, AddFunc$179, AddFunc$18, AddFunc$180, AddFunc$181, AddFunc$182, AddFunc$183, AddFunc$184, AddFunc$185, AddFunc$186, AddFunc$187, AddFunc$188, AddFunc$189, AddFunc$19, AddFunc$190, AddFunc$191, AddFunc$192, AddFunc$193, AddFunc$194, AddFunc$195, AddFunc$196, AddFunc$197, AddFunc$198, AddFunc$199, AddFunc$2, AddFunc$20, AddFunc$200, AddFunc$201, AddFunc$202, AddFunc$203, AddFunc$204, AddFunc$205, AddFunc$206, AddFunc$207, AddFunc$208, AddFunc$209, AddFunc$21, AddFunc$210, AddFunc$211, AddFunc$212, AddFunc$213, AddFunc$214, AddFunc$215, AddFunc$216, AddFunc$217, AddFunc$218, AddFunc$219, AddFunc$22, AddFunc$220, AddFunc$221, AddFunc$222, AddFunc$223, AddFunc$224, AddFunc$225, AddFunc$226, AddFunc$227, AddFunc$228, AddFunc$23, AddFunc$24, AddFunc$25, AddFunc$26, AddFunc$27, AddFunc$28, AddFunc$29, AddFunc$3, AddFunc$30, AddFunc$31, AddFunc$32, AddFunc$33, AddFunc$34, AddFunc$35, AddFunc$36, AddFunc$37, AddFunc$38, AddFunc$39, AddFunc$4, AddFunc$40, AddFunc$41, AddFunc$42, AddFunc$43, AddFunc$44, AddFunc$45, AddFunc$46, AddFunc$47, AddFunc$48, AddFunc$49, AddFunc$5, AddFunc$50, AddFunc$51, AddFunc$52, AddFunc$53, AddFunc$54, AddFunc$55, AddFunc$56, AddFunc$57, AddFunc$58, AddFunc$59, AddFunc$6, AddFunc$60, AddFunc$61, AddFunc$62, AddFunc$63, AddFunc$64, AddFunc$65, AddFunc$66, AddFunc$67, AddFunc$68, AddFunc$69, AddFunc$7, AddFunc$70, AddFunc$71, AddFunc$72, AddFunc$73, AddFunc$74, AddFunc$75, AddFunc$76, AddFunc$77, AddFunc$78, AddFunc$79, AddFunc$8, AddFunc$80, AddFunc$81, AddFunc$82, AddFunc$83, AddFunc$84, AddFunc$85, AddFunc$86, AddFunc$87, AddFunc$88, AddFunc$89, AddFunc$9, AddFunc$90, AddFunc$91, AddFunc$92, AddFunc$93, AddFunc$94, AddFunc$95, AddFunc$96, AddFunc$97, AddFunc$98, AddFunc$99, C4AulDefFunc, C4AulEngineFunc$C4Value$C4Object$i32$i32, C4AulEngineFunc$C4Value$C4Object$pC4String, C4AulEngineFunc$C4Value$C4Object$pC4String$C4Value, C4AulEngineFunc$C4Value$C4Object$pC4String$pC4String$i32, C4AulEngineFunc$C4Value$C4PropList$i32$C4ID$i32$i32, C4AulEngineFunc$C4Value$C4PropList$i32$pC4String, C4AulEngineFunc$C4Value$C4PropList$i32$pC4String$C4Value, C4AulEngineFunc$C4Value$C4PropList$pC4String$b, C4AulEngineFunc$C4Value$C4PropList$pC4String$i32, C4AulEngineFunc$C4Value$C4PropList$pC4String$pC4PropList, C4AulEngineFunc$C4Value$C4PropList$pC4String$pC4PropList$i32$i32$C4Value$C4Value$C4Value$C4Value, C4AulEngineFunc$C4Value$C4PropList$pC4String$pC4PropList$i32$i32$pC4PropList$pC4Def$C4Value$C4Value$C4Value$C4Value, C4AulEngineFunc$C4Value$C4PropList$pC4String$pC4String$i32, C4AulEngineFunc$C4Value$C4PropList$pC4String$pC4String$i32$i32, C4AulEngineFunc$Nillable$i32$C4Object$Nillable$i32$Nillable$i32, C4AulEngineFunc$Nillable$i32$C4Object$i32$Nillable$i32, C4AulEngineFunc$Nillable$i32$C4Object$pC4PropList$pC4String$pC4String$pC4ValueArray$i32$i32, C4AulEngineFunc$Nillable$i32$C4Object$pC4String$Nillable$i32, C4AulEngineFunc$Nillable$i32$C4Object$pC4String$i32$pC4ValueArray$Nillable$pC4ValueArray$Nillable$i32$Nillable$i32, C4AulEngineFunc$Nillable$i32$C4Object$pC4String$pC4ValueArray$i32$pC4ValueArray$Nillable$i32$Nillable$i32, C4AulEngineFunc$Nillable$i32$C4PropList$C4Value$Nillable$i32, C4AulEngineFunc$Nillable$i32$C4PropList$pC4String, C4AulEngineFunc$Nillable$i64$C4Object, C4AulEngineFunc$Nillable$i64$C4Object$i64, C4AulEngineFunc$Nillable$i64$C4Object$i64$i64, C4AulEngineFunc$Nillable$i64$C4PropList, C4AulEngineFunc$Nillable$i64$C4PropList$i64, C4AulEngineFunc$Nillable$i64$C4PropList$i64$i64$i64$i64$i64, C4AulEngineFunc$Nillable$i64$C4PropList$pC4String, C4AulEngineFunc$Nillable$i64$C4PropList$pC4String$i64, C4AulEngineFunc$Nillable$i64$C4PropList$pC4String$pC4String, C4AulEngineFunc$Nillable$pC4Def$C4Object, C4AulEngineFunc$Nillable$pC4String$C4Object$Nillable$i32$Nillable$i32, C4AulEngineFunc$Nillable$pC4String$C4PropList$i32, C4AulEngineFunc$Nillable$pC4String$C4PropList$i32$Nillable$pC4String$i32, C4AulEngineFunc$Nillable$pC4String$C4PropList$pC4String$pC4String$pC4String, C4AulEngineFunc$Nillable$pC4String$C4PropList$pC4String$pC4String$pC4String$i64, C4AulEngineFunc$Nillable$pC4ValueArray$C4PropList, C4AulEngineFunc$Nillable$pC4ValueArray$C4PropList$Nillable$i32, C4AulEngineFunc$Nillable$pC4ValueArray$C4PropList$pC4String$pC4String$i64, C4AulEngineFunc$b$C4Object, C4AulEngineFunc$b$C4Object$C4ID, C4AulEngineFunc$b$C4Object$Nillable$i32$Nillable$i32, C4AulEngineFunc$b$C4Object$Nillable$i32$pC4ValueArray$Nillable$i32, C4AulEngineFunc$b$C4Object$Nillable$i64$i64, C4AulEngineFunc$b$C4Object$b$i64, C4AulEngineFunc$b$C4Object$b$pC4Def$b, C4AulEngineFunc$b$C4Object$i32, C4AulEngineFunc$b$C4Object$i64, C4AulEngineFunc$b$C4Object$i64$Nillable$pC4String$Nillable$pC4String, C4AulEngineFunc$b$C4Object$i64$b, C4AulEngineFunc$b$C4Object$i64$i64, C4AulEngineFunc$b$C4Object$i64$i64$i64, C4AulEngineFunc$b$C4Object$i64$i64$i64$i64, C4AulEngineFunc$b$C4Object$i64$i64$i64$i64$i64$i64, C4AulEngineFunc$b$C4Object$i64$i64$i64$i64$i64$i64$i64, C4AulEngineFunc$b$C4Object$i64$i64$i64$i64$i64$i64$i64$i64$i64$i64, C4AulEngineFunc$b$C4Object$i64$pC4ValueArray, C4AulEngineFunc$b$C4Object$pC4Def$pC4Object$i64$pC4String$i64$i64$b$C4ID, C4AulEngineFunc$b$C4Object$pC4Object, C4AulEngineFunc$b$C4Object$pC4Object$b, C4AulEngineFunc$b$C4Object$pC4Object$i64, C4AulEngineFunc$b$C4Object$pC4String$i32, C4AulEngineFunc$b$C4Object$pC4String$pC4Def$i64$i64$pC4String$i64$pC4Object, C4AulEngineFunc$b$C4Object$pC4String$pC4Object$C4Value$i32$pC4Object$C4Value$i32, C4AulEngineFunc$b$C4Object$pC4String$pC4Object$C4Value$i32$pC4Object$i32$C4Value$i32$i32, C4AulEngineFunc$b$C4Object$pC4String$pC4Object$pC4Object$b, C4AulEngineFunc$b$C4Object$pC4String$pC4String$pC4Def$i32$C4Value$pC4String$i32$C4Value$C4Value, C4AulEngineFunc$b$C4Object$pC4String$pC4String$pC4ValueArray$pC4ValueArray$C4Value$pC4PropList$i32, C4AulEngineFunc$b$C4PropList, C4AulEngineFunc$b$C4PropList$C4Value$C4Value, C4AulEngineFunc$b$C4PropList$Nillable$i64$C4ID$b, C4AulEngineFunc$b$C4PropList$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64, C4AulEngineFunc$b$C4PropList$b, C4AulEngineFunc$b$C4PropList$i32$i32, C4AulEngineFunc$b$C4PropList$i32$i32$C4Value$C4Value, C4AulEngineFunc$b$C4PropList$i32$i32$pC4Object, C4AulEngineFunc$b$C4PropList$i32$pC4String, C4AulEngineFunc$b$C4PropList$i64, C4AulEngineFunc$b$C4PropList$i64$C4ID$i64, C4AulEngineFunc$b$C4PropList$i64$b, C4AulEngineFunc$b$C4PropList$i64$i64, C4AulEngineFunc$b$C4PropList$i64$i64$b, C4AulEngineFunc$b$C4PropList$i64$i64$b$b$b, C4AulEngineFunc$b$C4PropList$i64$i64$i64, C4AulEngineFunc$b$C4PropList$i64$i64$i64$i64, C4AulEngineFunc$b$C4PropList$i64$i64$i64$i64$i64$pC4PropList, C4AulEngineFunc$b$C4PropList$i64$i64$i64$pC4PropList, C4AulEngineFunc$b$C4PropList$i64$i64$pC4String$i64, C4AulEngineFunc$b$C4PropList$i64$pC4Object, C4AulEngineFunc$b$C4PropList$i64$pC4Object$b, C4AulEngineFunc$b$C4PropList$i64$pC4PropList, C4AulEngineFunc$b$C4PropList$i64$pC4String, C4AulEngineFunc$b$C4PropList$pC4Def, C4AulEngineFunc$b$C4PropList$pC4Object$b, C4AulEngineFunc$b$C4PropList$pC4Object$b$pC4String$i64, C4AulEngineFunc$b$C4PropList$pC4Object$i64, C4AulEngineFunc$b$C4PropList$pC4PropList$C4Value$pC4ValueArray$i32, C4AulEngineFunc$b$C4PropList$pC4PropList$Nillable$i64, C4AulEngineFunc$b$C4PropList$pC4PropList$b, C4AulEngineFunc$b$C4PropList$pC4PropList$i32$i32, C4AulEngineFunc$b$C4PropList$pC4PropList$i32$i32$pC4Object, C4AulEngineFunc$b$C4PropList$pC4PropList$pC4ValueArray, C4AulEngineFunc$b$C4PropList$pC4String, C4AulEngineFunc$b$C4PropList$pC4String$C4Value$C4Value$C4Value$C4Value$C4Value$pC4PropList$i32, C4AulEngineFunc$b$C4PropList$pC4String$C4Value$pC4PropList, C4AulEngineFunc$b$C4PropList$pC4String$Nillable$i64$Nillable$i64$pC4String, C4AulEngineFunc$b$C4PropList$pC4String$b$Nillable$i64$Nillable$i64$i64$i64$i64$pC4PropList, C4AulEngineFunc$b$C4PropList$pC4String$b$b, C4AulEngineFunc$b$C4PropList$pC4String$b$i64$i64, C4AulEngineFunc$b$C4PropList$pC4String$i32$i32$pC4Object, C4AulEngineFunc$b$C4PropList$pC4String$i64, C4AulEngineFunc$b$C4PropList$pC4String$i64$i64$Nillable$i64$Nillable$i64$i64$i64$pC4PropList, C4AulEngineFunc$b$C4PropList$pC4String$i64$i64$i64$C4ID, C4AulEngineFunc$b$C4PropList$pC4String$i64$i64$i64$i64$i64$i64$i64$i64$C4Value, C4AulEngineFunc$b$C4PropList$pC4String$pC4Object$Nillable$i64$i64$i64$i64$C4ID$pC4PropList$i64$i64, C4AulEngineFunc$b$C4PropList$pC4String$pC4PropList, C4AulEngineFunc$b$C4PropList$pC4String$pC4PropList$pC4Effect$b, C4AulEngineFunc$b$C4PropList$pC4String$pC4PropList$pC4ValueArray, C4AulEngineFunc$b$C4PropList$pC4String$pC4String, C4AulEngineFunc$b$C4PropList$pC4String$pC4String$pC4String, C4AulEngineFunc$b$C4PropList$pC4ValueArray$b, C4AulEngineFunc$b$C4PropList$pC4ValueArray$i32$b, C4AulEngineFunc$b$C4PropList$pC4ValueArray$pC4String$b, C4AulEngineFunc$i32$C4PropList, C4AulEngineFunc$i32$C4PropList$C4Value, C4AulEngineFunc$i32$C4PropList$C4Value$pC4ValueArray, C4AulEngineFunc$i32$C4PropList$i32$i32, C4AulEngineFunc$i32$C4PropList$i64, C4AulEngineFunc$i32$C4PropList$i64$i64, C4AulEngineFunc$i32$C4PropList$pC4PropList, C4AulEngineFunc$i32$C4PropList$pC4String, C4AulEngineFunc$i32$C4PropList$pC4ValueArray$C4Value, C4AulEngineFunc$i64$C4Object, C4AulEngineFunc$i64$C4Object$C4ID, C4AulEngineFunc$i64$C4Object$b, C4AulEngineFunc$i64$C4Object$i64, C4AulEngineFunc$i64$C4Object$i64$i64, C4AulEngineFunc$i64$C4Object$i64$i64$i64$i64, C4AulEngineFunc$i64$C4Object$pC4Object, C4AulEngineFunc$i64$C4PropList, C4AulEngineFunc$i64$C4PropList$C4ID$i64, C4AulEngineFunc$i64$C4PropList$C4Value$Nillable$i64$b$i64$i64, C4AulEngineFunc$i64$C4PropList$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64, C4AulEngineFunc$i64$C4PropList$b, C4AulEngineFunc$i64$C4PropList$i64, C4AulEngineFunc$i64$C4PropList$i64$b, C4AulEngineFunc$i64$C4PropList$i64$i64, C4AulEngineFunc$i64$C4PropList$i64$i64$b, C4AulEngineFunc$i64$C4PropList$i64$i64$i64, C4AulEngineFunc$i64$C4PropList$i64$i64$i64$b$b, C4AulEngineFunc$i64$C4PropList$i64$i64$i64$i64, C4AulEngineFunc$i64$C4PropList$i64$i64$i64$i64$b, C4AulEngineFunc$i64$C4PropList$i64$i64$i64$i64$b$b, C4AulEngineFunc$i64$C4PropList$i64$i64$i64$i64$i64, C4AulEngineFunc$i64$C4PropList$i64$i64$i64$i64$i64$i64$pC4String$pC4String$b, C4AulEngineFunc$i64$C4PropList$i64$i64$i64$i64$pC4String, C4AulEngineFunc$i64$C4PropList$pC4Object$i64, C4AulEngineFunc$i64$C4PropList$pC4Object$pC4Object, C4AulEngineFunc$i64$C4PropList$pC4String, C4AulEngineFunc$i64$C4PropList$pC4String$i64, C4AulEngineFunc$i64$C4PropList$pC4String$i64$b, C4AulEngineFunc$i64$C4PropList$pC4String$pC4PropList$i64, C4AulEngineFunc$i64$C4PropList$pC4String$pC4String, C4AulEngineFunc$pC4Def$C4PropList$i64, C4AulEngineFunc$pC4Effect$C4PropList$pC4PropList$i32$i32$C4Value$C4Value$C4Value$C4Value, C4AulEngineFunc$pC4Effect$C4PropList$pC4String$pC4PropList$i32$i32, C4AulEngineFunc$pC4Object$C4Object, C4AulEngineFunc$pC4Object$C4Object$C4ID, C4AulEngineFunc$pC4Object$C4Object$i64, C4AulEngineFunc$pC4Object$C4Object$pC4Def, C4AulEngineFunc$pC4Object$C4Object$pC4PropList$Nillable$i64, C4AulEngineFunc$pC4Object$C4PropList, C4AulEngineFunc$pC4Object$C4PropList$i64, C4AulEngineFunc$pC4Object$C4PropList$i64$i64, C4AulEngineFunc$pC4Object$C4PropList$pC4PropList, C4AulEngineFunc$pC4Object$C4PropList$pC4PropList$i64$i64$Nillable$i64, C4AulEngineFunc$pC4Object$C4PropList$pC4PropList$i64$i64$Nillable$i64$i64$b$b, C4AulEngineFunc$pC4Object$C4PropList$pC4PropList$i64$i64$i64$i64$i64$pC4PropList, C4AulEngineFunc$pC4PropList$C4Object, C4AulEngineFunc$pC4PropList$C4PropList$C4Value$pC4ValueArray, C4AulEngineFunc$pC4PropList$C4PropList$i64, C4AulEngineFunc$pC4PropList$C4PropList$pC4PropList, C4AulEngineFunc$pC4PropList$C4PropList$pC4String$i32$i32, C4AulEngineFunc$pC4String$C4Object, C4AulEngineFunc$pC4String$C4PropList, C4AulEngineFunc$pC4String$C4PropList$C4Value, C4AulEngineFunc$pC4String$C4PropList$b, C4AulEngineFunc$pC4String$C4PropList$i64, C4AulEngineFunc$pC4String$C4PropList$i64$i64, C4AulEngineFunc$pC4String$C4PropList$i64$i64$b$b, C4AulEngineFunc$pC4String$C4PropList$pC4String, C4AulEngineFunc$pC4ValueArray$C4PropList, C4AulEngineFunc$pC4ValueArray$C4PropList$C4Value, C4AulEngineFunc$pC4ValueArray$C4PropList$C4Value$2, C4AulEngineFunc$pC4ValueArray$C4PropList$C4Value$C4Value, C4AulEngineFunc$pC4ValueArray$C4PropList$C4Value$C4Value$C4Value, C4AulEngineFunc$pC4ValueArray$C4PropList$C4Value$C4Value$C4Value$C4Value, C4AulEngineFunc$pC4ValueArray$C4PropList$i32, C4AulEngineFunc$pC4ValueArray$C4PropList$i32$i32$Nillable$i32$Nillable$i32$Nillable$i32$Nillable$i32$Nillable$i32$i32, C4AulEngineFunc$pC4ValueArray$C4PropList$i32$i32$i32$i32, C4AulEngineFunc$pC4ValueArray$C4PropList$i64$i64$i64, C4AulEngineFunc$pC4ValueArray$C4PropList$i64$i64$i64$i64, C4AulEngineFunc$pC4ValueArray$C4PropList$pC4PropList, C4AulEngineFunc$pC4ValueArray$C4PropList$pC4PropList$i32$i32, C4AulEngineFunc$x$C4Object, C4AulEngineFunc$x$C4Object$b, C4AulEngineFunc$x$C4Object$i64, C4AulEngineFunc$x$C4Object$i64$Nillable$i64, C4AulEngineFunc$x$C4Object$i64$Nillable$i64$Nillable$i64, C4AulEngineFunc$x$C4Object$i64$b$Nillable$i64$Nillable$i64, C4AulEngineFunc$x$C4Object$i64$i64, C4AulEngineFunc$x$C4Object$i64$i64$b, C4AulEngineFunc$x$C4Object$i64$i64$b$i64, C4AulEngineFunc$x$C4Object$i64$i64$i64$b, C4AulEngineFunc$x$C4Object$i64$i64$i64$i64, C4AulEngineFunc$x$C4Object$i64$i64$i64$i64$i64$i64, C4AulEngineFunc$x$C4Object$pC4Object, C4AulEngineFunc$x$C4Object$pC4Object$pC4Object, C4AulEngineFunc$x$C4PropList$b, C4AulEngineFunc$x$C4PropList$b$i64, C4AulEngineFunc$x$C4PropList$i64, C4AulEngineFunc$x$C4PropList$i64$b, C4AulEngineFunc$x$C4PropList$i64$i64$i64, C4AulEngineFunc$x$C4PropList$i64$i64$i64$Nillable$i64$Nillable$i64, C4AulEngineFunc$x$C4PropList$i64$i64$i64$i64, C4AulEngineFunc$x$C4PropList$pC4PropList$pC4PropList, C4AulEngineFunc$x$C4PropList$pC4ValueArray$i32, C4ScriptConstDef, C4ScriptFnDef, C4ValueConv$C4ID, C4ValueConv$C4Value, C4ValueConv$C4Value$2, C4ValueConv$Nillable$i32, C4ValueConv$Nillable$i64, C4ValueConv$Nillable$pC4String, C4ValueConv$Nillable$pC4ValueArray, C4ValueConv$b, C4ValueConv$i32, C4ValueConv$pC4Def, C4ValueConv$pC4Effect, C4ValueConv$pC4Object, C4ValueConv$pC4PropList, C4ValueConv$pC4String, C4ValueConv$pC4ValueArray, C4Void, ExecImpl$C4Value$C4Object$i32$i32, ExecImpl$C4Value$C4Object$pC4String, ExecImpl$C4Value$C4Object$pC4String$C4Value, ExecImpl$C4Value$C4Object$pC4String$pC4String$i32, ExecImpl$C4Value$C4PropList$i32$C4ID$i32$i32, ExecImpl$C4Value$C4PropList$i32$pC4String, ExecImpl$C4Value$C4PropList$i32$pC4String$C4Value, ExecImpl$C4Value$C4PropList$pC4String$b, ExecImpl$C4Value$C4PropList$pC4String$i32, ExecImpl$C4Value$C4PropList$pC4String$pC4PropList, ExecImpl$C4Value$C4PropList$pC4String$pC4PropList$i32$i32$C4Value$C4Value$C4Value$C4Value, ExecImpl$C4Value$C4PropList$pC4String$pC4PropList$i32$i32$pC4PropList$pC4Def$C4Value$C4Value$C4Value$C4Value, ExecImpl$C4Value$C4PropList$pC4String$pC4String$i32, ExecImpl$C4Value$C4PropList$pC4String$pC4String$i32$i32, ExecImpl$Nillable$i32$C4Object$Nillable$i32$Nillable$i32, ExecImpl$Nillable$i32$C4Object$i32$Nillable$i32, ExecImpl$Nillable$i32$C4Object$pC4PropList$pC4String$pC4String$pC4ValueArray$i32$i32, ExecImpl$Nillable$i32$C4Object$pC4String$Nillable$i32, ExecImpl$Nillable$i32$C4Object$pC4String$i32$pC4ValueArray$Nillable$pC4ValueArray$Nillable$i32$Nillable$i32, ExecImpl$Nillable$i32$C4Object$pC4String$pC4ValueArray$i32$pC4ValueArray$Nillable$i32$Nillable$i32, ExecImpl$Nillable$i32$C4PropList$C4Value$Nillable$i32, ExecImpl$Nillable$i32$C4PropList$pC4String, ExecImpl$Nillable$i64$C4Object, ExecImpl$Nillable$i64$C4Object$i64, ExecImpl$Nillable$i64$C4Object$i64$i64, ExecImpl$Nillable$i64$C4PropList, ExecImpl$Nillable$i64$C4PropList$i64, ExecImpl$Nillable$i64$C4PropList$i64$i64$i64$i64$i64, ExecImpl$Nillable$i64$C4PropList$pC4String, ExecImpl$Nillable$i64$C4PropList$pC4String$i64, ExecImpl$Nillable$i64$C4PropList$pC4String$pC4String, ExecImpl$Nillable$pC4Def$C4Object, ExecImpl$Nillable$pC4String$C4Object$Nillable$i32$Nillable$i32, ExecImpl$Nillable$pC4String$C4PropList$i32, ExecImpl$Nillable$pC4String$C4PropList$i32$Nillable$pC4String$i32, ExecImpl$Nillable$pC4String$C4PropList$pC4String$pC4String$pC4String, ExecImpl$Nillable$pC4String$C4PropList$pC4String$pC4String$pC4String$i64, ExecImpl$Nillable$pC4ValueArray$C4PropList, ExecImpl$Nillable$pC4ValueArray$C4PropList$Nillable$i32, ExecImpl$Nillable$pC4ValueArray$C4PropList$pC4String$pC4String$i64, ExecImpl$b$C4Object, ExecImpl$b$C4Object$C4ID, ExecImpl$b$C4Object$Nillable$i32$Nillable$i32, ExecImpl$b$C4Object$Nillable$i32$pC4ValueArray$Nillable$i32, ExecImpl$b$C4Object$Nillable$i64$i64, ExecImpl$b$C4Object$b$i64, ExecImpl$b$C4Object$b$pC4Def$b, ExecImpl$b$C4Object$i32, ExecImpl$b$C4Object$i64, ExecImpl$b$C4Object$i64$Nillable$pC4String$Nillable$pC4String, ExecImpl$b$C4Object$i64$b, ExecImpl$b$C4Object$i64$i64, ExecImpl$b$C4Object$i64$i64$i64, ExecImpl$b$C4Object$i64$i64$i64$i64, ExecImpl$b$C4Object$i64$i64$i64$i64$i64$i64, ExecImpl$b$C4Object$i64$i64$i64$i64$i64$i64$i64, ExecImpl$b$C4Object$i64$i64$i64$i64$i64$i64$i64$i64$i64$i64, ExecImpl$b$C4Object$i64$pC4ValueArray, ExecImpl$b$C4Object$pC4Def$pC4Object$i64$pC4String$i64$i64$b$C4ID, ExecImpl$b$C4Object$pC4Object, ExecImpl$b$C4Object$pC4Object$b, ExecImpl$b$C4Object$pC4Object$i64, ExecImpl$b$C4Object$pC4String$i32, ExecImpl$b$C4Object$pC4String$pC4Def$i64$i64$pC4String$i64$pC4Object, ExecImpl$b$C4Object$pC4String$pC4Object$C4Value$i32$pC4Object$C4Value$i32, ExecImpl$b$C4Object$pC4String$pC4Object$C4Value$i32$pC4Object$i32$C4Value$i32$i32, ExecImpl$b$C4Object$pC4String$pC4Object$pC4Object$b, ExecImpl$b$C4Object$pC4String$pC4String$pC4Def$i32$C4Value$pC4String$i32$C4Value$C4Value, ExecImpl$b$C4Object$pC4String$pC4String$pC4ValueArray$pC4ValueArray$C4Value$pC4PropList$i32, ExecImpl$b$C4PropList, ExecImpl$b$C4PropList$C4Value$C4Value, ExecImpl$b$C4PropList$Nillable$i64$C4ID$b, ExecImpl$b$C4PropList$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64, ExecImpl$b$C4PropList$b, ExecImpl$b$C4PropList$i32$i32, ExecImpl$b$C4PropList$i32$i32$C4Value$C4Value, ExecImpl$b$C4PropList$i32$i32$pC4Object, ExecImpl$b$C4PropList$i32$pC4String, ExecImpl$b$C4PropList$i64, ExecImpl$b$C4PropList$i64$C4ID$i64, ExecImpl$b$C4PropList$i64$b, ExecImpl$b$C4PropList$i64$i64, ExecImpl$b$C4PropList$i64$i64$b, ExecImpl$b$C4PropList$i64$i64$b$b$b, ExecImpl$b$C4PropList$i64$i64$i64, ExecImpl$b$C4PropList$i64$i64$i64$i64, ExecImpl$b$C4PropList$i64$i64$i64$i64$i64$pC4PropList, ExecImpl$b$C4PropList$i64$i64$i64$pC4PropList, ExecImpl$b$C4PropList$i64$i64$pC4String$i64, ExecImpl$b$C4PropList$i64$pC4Object, ExecImpl$b$C4PropList$i64$pC4Object$b, ExecImpl$b$C4PropList$i64$pC4PropList, ExecImpl$b$C4PropList$i64$pC4String, ExecImpl$b$C4PropList$pC4Def, ExecImpl$b$C4PropList$pC4Object$b, ExecImpl$b$C4PropList$pC4Object$b$pC4String$i64, ExecImpl$b$C4PropList$pC4Object$i64, ExecImpl$b$C4PropList$pC4PropList$C4Value$pC4ValueArray$i32, ExecImpl$b$C4PropList$pC4PropList$Nillable$i64, ExecImpl$b$C4PropList$pC4PropList$b, ExecImpl$b$C4PropList$pC4PropList$i32$i32, ExecImpl$b$C4PropList$pC4PropList$i32$i32$pC4Object, ExecImpl$b$C4PropList$pC4PropList$pC4ValueArray, ExecImpl$b$C4PropList$pC4String, ExecImpl$b$C4PropList$pC4String$C4Value$C4Value$C4Value$C4Value$C4Value$pC4PropList$i32, ExecImpl$b$C4PropList$pC4String$C4Value$pC4PropList, ExecImpl$b$C4PropList$pC4String$Nillable$i64$Nillable$i64$pC4String, ExecImpl$b$C4PropList$pC4String$b$Nillable$i64$Nillable$i64$i64$i64$i64$pC4PropList, ExecImpl$b$C4PropList$pC4String$b$b, ExecImpl$b$C4PropList$pC4String$b$i64$i64, ExecImpl$b$C4PropList$pC4String$i32$i32$pC4Object, ExecImpl$b$C4PropList$pC4String$i64, ExecImpl$b$C4PropList$pC4String$i64$i64$Nillable$i64$Nillable$i64$i64$i64$pC4PropList, ExecImpl$b$C4PropList$pC4String$i64$i64$i64$C4ID, ExecImpl$b$C4PropList$pC4String$i64$i64$i64$i64$i64$i64$i64$i64$C4Value, ExecImpl$b$C4PropList$pC4String$pC4Object$Nillable$i64$i64$i64$i64$C4ID$pC4PropList$i64$i64, ExecImpl$b$C4PropList$pC4String$pC4PropList, ExecImpl$b$C4PropList$pC4String$pC4PropList$pC4Effect$b, ExecImpl$b$C4PropList$pC4String$pC4PropList$pC4ValueArray, ExecImpl$b$C4PropList$pC4String$pC4String, ExecImpl$b$C4PropList$pC4String$pC4String$pC4String, ExecImpl$b$C4PropList$pC4ValueArray$b, ExecImpl$b$C4PropList$pC4ValueArray$i32$b, ExecImpl$b$C4PropList$pC4ValueArray$pC4String$b, ExecImpl$i32$C4PropList, ExecImpl$i32$C4PropList$C4Value, ExecImpl$i32$C4PropList$C4Value$pC4ValueArray, ExecImpl$i32$C4PropList$i32$i32, ExecImpl$i32$C4PropList$i64, ExecImpl$i32$C4PropList$i64$i64, ExecImpl$i32$C4PropList$pC4PropList, ExecImpl$i32$C4PropList$pC4String, ExecImpl$i32$C4PropList$pC4ValueArray$C4Value, ExecImpl$i64$C4Object, ExecImpl$i64$C4Object$C4ID, ExecImpl$i64$C4Object$b, ExecImpl$i64$C4Object$i64, ExecImpl$i64$C4Object$i64$i64, ExecImpl$i64$C4Object$i64$i64$i64$i64, ExecImpl$i64$C4Object$pC4Object, ExecImpl$i64$C4PropList, ExecImpl$i64$C4PropList$C4ID$i64, ExecImpl$i64$C4PropList$C4Value$Nillable$i64$b$i64$i64, ExecImpl$i64$C4PropList$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64$Nillable$i64, ExecImpl$i64$C4PropList$b, ExecImpl$i64$C4PropList$i64, ExecImpl$i64$C4PropList$i64$b, ExecImpl$i64$C4PropList$i64$i64, ExecImpl$i64$C4PropList$i64$i64$b, ExecImpl$i64$C4PropList$i64$i64$i64, ExecImpl$i64$C4PropList$i64$i64$i64$b$b, ExecImpl$i64$C4PropList$i64$i64$i64$i64, ExecImpl$i64$C4PropList$i64$i64$i64$i64$b, ExecImpl$i64$C4PropList$i64$i64$i64$i64$b$b, ExecImpl$i64$C4PropList$i64$i64$i64$i64$i64, ExecImpl$i64$C4PropList$i64$i64$i64$i64$i64$i64$pC4String$pC4String$b, ExecImpl$i64$C4PropList$i64$i64$i64$i64$pC4String, ExecImpl$i64$C4PropList$pC4Object$i64, ExecImpl$i64$C4PropList$pC4Object$pC4Object, ExecImpl$i64$C4PropList$pC4String, ExecImpl$i64$C4PropList$pC4String$i64, ExecImpl$i64$C4PropList$pC4String$i64$b, ExecImpl$i64$C4PropList$pC4String$pC4PropList$i64, ExecImpl$i64$C4PropList$pC4String$pC4String, ExecImpl$pC4Def$C4PropList$i64, ExecImpl$pC4Effect$C4PropList$pC4PropList$i32$i32$C4Value$C4Value$C4Value$C4Value, ExecImpl$pC4Effect$C4PropList$pC4String$pC4PropList$i32$i32, ExecImpl$pC4Object$C4Object, ExecImpl$pC4Object$C4Object$C4ID, ExecImpl$pC4Object$C4Object$i64, ExecImpl$pC4Object$C4Object$pC4Def, ExecImpl$pC4Object$C4Object$pC4PropList$Nillable$i64, ExecImpl$pC4Object$C4PropList, ExecImpl$pC4Object$C4PropList$i64, ExecImpl$pC4Object$C4PropList$i64$i64, ExecImpl$pC4Object$C4PropList$pC4PropList, ExecImpl$pC4Object$C4PropList$pC4PropList$i64$i64$Nillable$i64, ExecImpl$pC4Object$C4PropList$pC4PropList$i64$i64$Nillable$i64$i64$b$b, ExecImpl$pC4Object$C4PropList$pC4PropList$i64$i64$i64$i64$i64$pC4PropList, ExecImpl$pC4PropList$C4Object, ExecImpl$pC4PropList$C4PropList$C4Value$pC4ValueArray, ExecImpl$pC4PropList$C4PropList$i64, ExecImpl$pC4PropList$C4PropList$pC4PropList, ExecImpl$pC4PropList$C4PropList$pC4String$i32$i32, ExecImpl$pC4String$C4Object, ExecImpl$pC4String$C4PropList, ExecImpl$pC4String$C4PropList$C4Value, ExecImpl$pC4String$C4PropList$b, ExecImpl$pC4String$C4PropList$i64, ExecImpl$pC4String$C4PropList$i64$i64, ExecImpl$pC4String$C4PropList$i64$i64$b$b, ExecImpl$pC4String$C4PropList$pC4String, ExecImpl$pC4ValueArray$C4PropList, ExecImpl$pC4ValueArray$C4PropList$C4Value, ExecImpl$pC4ValueArray$C4PropList$C4Value$2, ExecImpl$pC4ValueArray$C4PropList$C4Value$C4Value, ExecImpl$pC4ValueArray$C4PropList$C4Value$C4Value$C4Value, ExecImpl$pC4ValueArray$C4PropList$C4Value$C4Value$C4Value$C4Value, ExecImpl$pC4ValueArray$C4PropList$i32, ExecImpl$pC4ValueArray$C4PropList$i32$i32$Nillable$i32$Nillable$i32$Nillable$i32$Nillable$i32$Nillable$i32$i32, ExecImpl$pC4ValueArray$C4PropList$i32$i32$i32$i32, ExecImpl$pC4ValueArray$C4PropList$i64$i64$i64, ExecImpl$pC4ValueArray$C4PropList$i64$i64$i64$i64, ExecImpl$pC4ValueArray$C4PropList$pC4PropList, ExecImpl$pC4ValueArray$C4PropList$pC4PropList$i32$i32, ExecImpl$x$C4Object, ExecImpl$x$C4Object$b, ExecImpl$x$C4Object$i64, ExecImpl$x$C4Object$i64$Nillable$i64, ExecImpl$x$C4Object$i64$Nillable$i64$Nillable$i64, ExecImpl$x$C4Object$i64$b$Nillable$i64$Nillable$i64, ExecImpl$x$C4Object$i64$i64, ExecImpl$x$C4Object$i64$i64$b, ExecImpl$x$C4Object$i64$i64$b$i64, ExecImpl$x$C4Object$i64$i64$i64$b, ExecImpl$x$C4Object$i64$i64$i64$i64, ExecImpl$x$C4Object$i64$i64$i64$i64$i64$i64, ExecImpl$x$C4Object$pC4Object, ExecImpl$x$C4Object$pC4Object$pC4Object, ExecImpl$x$C4PropList$b, ExecImpl$x$C4PropList$b$i64, ExecImpl$x$C4PropList$i64, ExecImpl$x$C4PropList$i64$b, ExecImpl$x$C4PropList$i64$i64$i64, ExecImpl$x$C4PropList$i64$i64$i64$Nillable$i64$Nillable$i64, ExecImpl$x$C4PropList$i64$i64$i64$i64, ExecImpl$x$C4PropList$pC4PropList$pC4PropList, ExecImpl$x$C4PropList$pC4ValueArray$i32, FnStringPar, NeedNonGlobalContext, NeedObjectContext, Object_, String_, ThisImpl$C4Object, ThisImpl$C4PropList });
