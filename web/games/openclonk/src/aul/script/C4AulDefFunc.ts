// @ts-nocheck
// OpenClonk 36de799: src/script/C4AulDefFunc.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { C4AulExecError } from './C4Aul.ts';
import { C4AulFunc } from './C4AulFunc.ts';
import { $oidx, $ta, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';

export class C4Void {

  $clone() { return new C4Void().$assign(this); }
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
    for (let i = this.GetParCount(); i < 10; i = i + 1 | 0) {
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
    for (let i = this.GetParCount(); i < 10; i = i + 1 | 0) {
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
    for (let i = this.GetParCount(); i < 10; i = i + 1 | 0) {
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
    for (let i = this.GetParCount(); i < 10; i = i + 1 | 0) {
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
    for (let i = this.GetParCount(); i < 10; i = i + 1 | 0) {
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
    for (let i = this.GetParCount(); i < 10; i = i + 1 | 0) {
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
    for (let i = this.GetParCount(); i < 10; i = i + 1 | 0) {
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
    for (let i = this.GetParCount(); i < 10; i = i + 1 | 0) {
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
    for (let i = this.GetParCount(); i < 10; i = i + 1 | 0) {
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
    for (let i = this.GetParCount(); i < 10; i = i + 1 | 0) {
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
    for (let i = this.GetParCount(); i < 10; i = i + 1 | 0) {
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
    for (let i = this.GetParCount(); i < 10; i = i + 1 | 0) {
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
    for (let i = this.GetParCount(); i < 10; i = i + 1 | 0) {
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
    for (let i = this.GetParCount(); i < 10; i = i + 1 | 0) {
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
    for (let i = this.GetParCount(); i < 10; i = i + 1 | 0) {
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
    for (let i = this.GetParCount(); i < 10; i = i + 1 | 0) {
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
    for (let i = this.GetParCount(); i < 10; i = i + 1 | 0) {
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
    for (let i = this.GetParCount(); i < 10; i = i + 1 | 0) {
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
    for (let i = this.GetParCount(); i < 10; i = i + 1 | 0) {
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
    for (let i = this.GetParCount(); i < 10; i = i + 1 | 0) {
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
    for (let i = this.GetParCount(); i < 10; i = i + 1 | 0) {
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
    for (let i = this.GetParCount(); i < 10; i = i + 1 | 0) {
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
    for (let i = this.GetParCount(); i < 10; i = i + 1 | 0) {
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
    for (let i = this.GetParCount(); i < 10; i = i + 1 | 0) {
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
    for (let i = this.GetParCount(); i < 10; i = i + 1 | 0) {
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
    for (let i = this.GetParCount(); i < 10; i = i + 1 | 0) {
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
    for (let i = this.GetParCount(); i < 10; i = i + 1 | 0) {
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
    for (let i = this.GetParCount(); i < 10; i = i + 1 | 0) {
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
    for (let i = this.GetParCount(); i < 10; i = i + 1 | 0) {
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
    for (let i = this.GetParCount(); i < 10; i = i + 1 | 0) {
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
    for (let i = this.GetParCount(); i < 10; i = i + 1 | 0) {
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
    for (let i = this.GetParCount(); i < 10; i = i + 1 | 0) {
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
    for (let i = this.GetParCount(); i < 10; i = i + 1 | 0) {
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
    for (let i = this.GetParCount(); i < 10; i = i + 1 | 0) {
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
    for (let i = this.GetParCount(); i < 10; i = i + 1 | 0) {
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
    for (let i = this.GetParCount(); i < 10; i = i + 1 | 0) {
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
    for (let i = this.GetParCount(); i < 10; i = i + 1 | 0) {
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
    for (let i = this.GetParCount(); i < 10; i = i + 1 | 0) {
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
    for (let i = this.GetParCount(); i < 10; i = i + 1 | 0) {
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
    for (let i = this.GetParCount(); i < 10; i = i + 1 | 0) {
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
    for (let i = this.GetParCount(); i < 10; i = i + 1 | 0) {
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
    for (let i = this.GetParCount(); i < 10; i = i + 1 | 0) {
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
    for (let i = this.GetParCount(); i < 10; i = i + 1 | 0) {
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
    for (let i = this.GetParCount(); i < 10; i = i + 1 | 0) {
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
  new C4AulEngineFunc$C4Value$C4PropList$pC4String$b().init(Parent, Name, pFunc, Public);
}

export function AddFunc$5(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$C4Value$C4PropList$pC4String$i32().init(Parent, Name, pFunc, Public);
}

export function AddFunc$6(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$Nillable$pC4ValueArray$C4PropList$pC4String$pC4String$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$7(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$Nillable$pC4String$C4PropList$pC4String$pC4String$pC4String().init(Parent, Name, pFunc, Public);
}

export function AddFunc$8(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$Nillable$pC4String$C4PropList$pC4String$pC4String$pC4String$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$9(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$Nillable$pC4String$C4PropList$i32$Nillable$pC4String$i32().init(Parent, Name, pFunc, Public);
}

export function AddFunc$10(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$Nillable$i32$C4PropList$pC4String().init(Parent, Name, pFunc, Public);
}

export function AddFunc$11(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$Nillable$i32$C4PropList$C4Value$Nillable$i32().init(Parent, Name, pFunc, Public);
}

export function AddFunc$12(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$Nillable$i64$C4PropList$pC4String$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$13(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$pC4PropList$C4PropList$pC4PropList().init(Parent, Name, pFunc, Public);
}

export function AddFunc$14(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$pC4ValueArray$C4PropList().init(Parent, Name, pFunc, Public);
}

export function AddFunc$15(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$pC4ValueArray$C4PropList$pC4PropList().init(Parent, Name, pFunc, Public);
}

export function AddFunc$16(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$pC4ValueArray$C4PropList$i32().init(Parent, Name, pFunc, Public);
}

export function AddFunc$17(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$pC4ValueArray$C4PropList$i64$i64$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$18(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$pC4ValueArray$C4PropList$i64$i64$i64$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$19(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$pC4Effect$C4PropList$pC4String$pC4PropList$i32$i32().init(Parent, Name, pFunc, Public);
}

export function AddFunc$20(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$pC4Effect$C4PropList$pC4PropList$i32$i32$C4Value$C4Value$C4Value$C4Value().init(Parent, Name, pFunc, Public);
}

export function AddFunc$21(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$pC4String$C4PropList$pC4String().init(Parent, Name, pFunc, Public);
}

export function AddFunc$22(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$pC4String$C4PropList$b().init(Parent, Name, pFunc, Public);
}

export function AddFunc$23(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList().init(Parent, Name, pFunc, Public);
}

export function AddFunc$24(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$pC4ValueArray$pC4String$b().init(Parent, Name, pFunc, Public);
}

export function AddFunc$25(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$pC4ValueArray$b().init(Parent, Name, pFunc, Public);
}

export function AddFunc$26(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$pC4ValueArray$i32$b().init(Parent, Name, pFunc, Public);
}

export function AddFunc$27(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$pC4Def().init(Parent, Name, pFunc, Public);
}

export function AddFunc$28(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$pC4String$pC4PropList().init(Parent, Name, pFunc, Public);
}

export function AddFunc$29(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$pC4String$pC4PropList$pC4Effect$b().init(Parent, Name, pFunc, Public);
}

export function AddFunc$30(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$pC4String$C4Value$pC4PropList().init(Parent, Name, pFunc, Public);
}

export function AddFunc$31(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$C4Value$C4Value().init(Parent, Name, pFunc, Public);
}

export function AddFunc$32(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$i32$pC4String().init(Parent, Name, pFunc, Public);
}

export function AddFunc$33(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$b$C4PropList$i64$i64$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$34(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$i32$C4PropList$pC4ValueArray$C4Value().init(Parent, Name, pFunc, Public);
}

export function AddFunc$35(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$i32$C4PropList$C4Value().init(Parent, Name, pFunc, Public);
}

export function AddFunc$36(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$i64$C4PropList$pC4String$pC4PropList$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$37(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$i64$C4PropList$pC4String$pC4String().init(Parent, Name, pFunc, Public);
}

export function AddFunc$38(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$i64$C4PropList$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$39(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$i64$C4PropList$i64$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$40(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$i64$C4PropList$i64$i64$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$41(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$i64$C4PropList$i64$i64$i64$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$42(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$i64$C4PropList$i64$i64$i64$i64$i64().init(Parent, Name, pFunc, Public);
}

export function AddFunc$43(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$x$C4PropList$pC4ValueArray$i32().init(Parent, Name, pFunc, Public);
}

export function AddFunc$44(Parent, Name, pFunc, Public = true) {
  new C4AulEngineFunc$x$C4PropList$pC4PropList$pC4PropList().init(Parent, Name, pFunc, Public);
}

export function $init(): void {
  C4ValueConv$pC4Def.Type = 12 /*C4V_Def*/;
  C4ValueConv$pC4Effect.Type = 13 /*C4V_Effect*/;
  C4ValueConv$pC4PropList.Type = 3 /*C4V_PropList*/;
  C4ValueConv$pC4String.Type = 4 /*C4V_String*/;
  C4ValueConv$pC4ValueArray.Type = 5 /*C4V_Array*/;
  C4ValueConv$Nillable$pC4String.Type = 4;
  C4ValueConv$Nillable$i32.Type = 1;
  C4ValueConv$b.Type = 2 /*C4V_Bool*/;
  C4ValueConv$C4Value$2.Type = 10 /*C4V_Any*/;
  C4ValueConv$i32.Type = 1 /*C4V_Int*/;
}

Object.assign($, { AddFunc, AddFunc$10, AddFunc$11, AddFunc$12, AddFunc$13, AddFunc$14, AddFunc$15, AddFunc$16, AddFunc$17, AddFunc$18, AddFunc$19, AddFunc$2, AddFunc$20, AddFunc$21, AddFunc$22, AddFunc$23, AddFunc$24, AddFunc$25, AddFunc$26, AddFunc$27, AddFunc$28, AddFunc$29, AddFunc$3, AddFunc$30, AddFunc$31, AddFunc$32, AddFunc$33, AddFunc$34, AddFunc$35, AddFunc$36, AddFunc$37, AddFunc$38, AddFunc$39, AddFunc$4, AddFunc$40, AddFunc$41, AddFunc$42, AddFunc$43, AddFunc$44, AddFunc$5, AddFunc$6, AddFunc$7, AddFunc$8, AddFunc$9, C4AulDefFunc, C4AulEngineFunc$C4Value$C4PropList$pC4String$b, C4AulEngineFunc$C4Value$C4PropList$pC4String$i32, C4AulEngineFunc$C4Value$C4PropList$pC4String$pC4PropList, C4AulEngineFunc$C4Value$C4PropList$pC4String$pC4PropList$i32$i32$C4Value$C4Value$C4Value$C4Value, C4AulEngineFunc$C4Value$C4PropList$pC4String$pC4PropList$i32$i32$pC4PropList$pC4Def$C4Value$C4Value$C4Value$C4Value, C4AulEngineFunc$Nillable$i32$C4PropList$C4Value$Nillable$i32, C4AulEngineFunc$Nillable$i32$C4PropList$pC4String, C4AulEngineFunc$Nillable$i64$C4PropList$pC4String$i64, C4AulEngineFunc$Nillable$pC4String$C4PropList$i32$Nillable$pC4String$i32, C4AulEngineFunc$Nillable$pC4String$C4PropList$pC4String$pC4String$pC4String, C4AulEngineFunc$Nillable$pC4String$C4PropList$pC4String$pC4String$pC4String$i64, C4AulEngineFunc$Nillable$pC4ValueArray$C4PropList$pC4String$pC4String$i64, C4AulEngineFunc$b$C4PropList, C4AulEngineFunc$b$C4PropList$C4Value$C4Value, C4AulEngineFunc$b$C4PropList$i32$pC4String, C4AulEngineFunc$b$C4PropList$i64$i64$i64, C4AulEngineFunc$b$C4PropList$pC4Def, C4AulEngineFunc$b$C4PropList$pC4String$C4Value$pC4PropList, C4AulEngineFunc$b$C4PropList$pC4String$pC4PropList, C4AulEngineFunc$b$C4PropList$pC4String$pC4PropList$pC4Effect$b, C4AulEngineFunc$b$C4PropList$pC4ValueArray$b, C4AulEngineFunc$b$C4PropList$pC4ValueArray$i32$b, C4AulEngineFunc$b$C4PropList$pC4ValueArray$pC4String$b, C4AulEngineFunc$i32$C4PropList$C4Value, C4AulEngineFunc$i32$C4PropList$pC4ValueArray$C4Value, C4AulEngineFunc$i64$C4PropList$i64, C4AulEngineFunc$i64$C4PropList$i64$i64, C4AulEngineFunc$i64$C4PropList$i64$i64$i64, C4AulEngineFunc$i64$C4PropList$i64$i64$i64$i64, C4AulEngineFunc$i64$C4PropList$i64$i64$i64$i64$i64, C4AulEngineFunc$i64$C4PropList$pC4String$pC4PropList$i64, C4AulEngineFunc$i64$C4PropList$pC4String$pC4String, C4AulEngineFunc$pC4Effect$C4PropList$pC4PropList$i32$i32$C4Value$C4Value$C4Value$C4Value, C4AulEngineFunc$pC4Effect$C4PropList$pC4String$pC4PropList$i32$i32, C4AulEngineFunc$pC4PropList$C4PropList$pC4PropList, C4AulEngineFunc$pC4String$C4PropList$b, C4AulEngineFunc$pC4String$C4PropList$pC4String, C4AulEngineFunc$pC4ValueArray$C4PropList, C4AulEngineFunc$pC4ValueArray$C4PropList$i32, C4AulEngineFunc$pC4ValueArray$C4PropList$i64$i64$i64, C4AulEngineFunc$pC4ValueArray$C4PropList$i64$i64$i64$i64, C4AulEngineFunc$pC4ValueArray$C4PropList$pC4PropList, C4AulEngineFunc$x$C4PropList$pC4PropList$pC4PropList, C4AulEngineFunc$x$C4PropList$pC4ValueArray$i32, C4ScriptConstDef, C4ScriptFnDef, C4ValueConv$C4Value$2, C4ValueConv$Nillable$i32, C4ValueConv$Nillable$pC4String, C4ValueConv$b, C4ValueConv$i32, C4ValueConv$pC4Def, C4ValueConv$pC4Effect, C4ValueConv$pC4PropList, C4ValueConv$pC4String, C4ValueConv$pC4ValueArray, C4Void, ExecImpl$C4Value$C4PropList$pC4String$b, ExecImpl$C4Value$C4PropList$pC4String$i32, ExecImpl$C4Value$C4PropList$pC4String$pC4PropList, ExecImpl$C4Value$C4PropList$pC4String$pC4PropList$i32$i32$C4Value$C4Value$C4Value$C4Value, ExecImpl$C4Value$C4PropList$pC4String$pC4PropList$i32$i32$pC4PropList$pC4Def$C4Value$C4Value$C4Value$C4Value, ExecImpl$Nillable$i32$C4PropList$C4Value$Nillable$i32, ExecImpl$Nillable$i32$C4PropList$pC4String, ExecImpl$Nillable$i64$C4PropList$pC4String$i64, ExecImpl$Nillable$pC4String$C4PropList$i32$Nillable$pC4String$i32, ExecImpl$Nillable$pC4String$C4PropList$pC4String$pC4String$pC4String, ExecImpl$Nillable$pC4String$C4PropList$pC4String$pC4String$pC4String$i64, ExecImpl$Nillable$pC4ValueArray$C4PropList$pC4String$pC4String$i64, ExecImpl$b$C4PropList, ExecImpl$b$C4PropList$C4Value$C4Value, ExecImpl$b$C4PropList$i32$pC4String, ExecImpl$b$C4PropList$i64$i64$i64, ExecImpl$b$C4PropList$pC4Def, ExecImpl$b$C4PropList$pC4String$C4Value$pC4PropList, ExecImpl$b$C4PropList$pC4String$pC4PropList, ExecImpl$b$C4PropList$pC4String$pC4PropList$pC4Effect$b, ExecImpl$b$C4PropList$pC4ValueArray$b, ExecImpl$b$C4PropList$pC4ValueArray$i32$b, ExecImpl$b$C4PropList$pC4ValueArray$pC4String$b, ExecImpl$i32$C4PropList$C4Value, ExecImpl$i32$C4PropList$pC4ValueArray$C4Value, ExecImpl$i64$C4PropList$i64, ExecImpl$i64$C4PropList$i64$i64, ExecImpl$i64$C4PropList$i64$i64$i64, ExecImpl$i64$C4PropList$i64$i64$i64$i64, ExecImpl$i64$C4PropList$i64$i64$i64$i64$i64, ExecImpl$i64$C4PropList$pC4String$pC4PropList$i64, ExecImpl$i64$C4PropList$pC4String$pC4String, ExecImpl$pC4Effect$C4PropList$pC4PropList$i32$i32$C4Value$C4Value$C4Value$C4Value, ExecImpl$pC4Effect$C4PropList$pC4String$pC4PropList$i32$i32, ExecImpl$pC4PropList$C4PropList$pC4PropList, ExecImpl$pC4String$C4PropList$b, ExecImpl$pC4String$C4PropList$pC4String, ExecImpl$pC4ValueArray$C4PropList, ExecImpl$pC4ValueArray$C4PropList$i32, ExecImpl$pC4ValueArray$C4PropList$i64$i64$i64, ExecImpl$pC4ValueArray$C4PropList$i64$i64$i64$i64, ExecImpl$pC4ValueArray$C4PropList$pC4PropList, ExecImpl$x$C4PropList$pC4PropList$pC4PropList, ExecImpl$x$C4PropList$pC4ValueArray$i32, FnStringPar, NeedNonGlobalContext, String_, ThisImpl$C4PropList });
