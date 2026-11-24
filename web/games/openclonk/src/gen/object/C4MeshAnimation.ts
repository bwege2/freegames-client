// @ts-nocheck
// OpenClonk 36de799: src/object/C4MeshAnimation.cpp, src/object/C4MeshAnimation.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { StdMeshInstance$SerializableValueProvider, StdMeshInstanceValueProvider } from '../lib/StdMesh.ts';
import { $oat, $own, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $minBy, $throw } from '../../rt/std.ts';

export class C4ValueProviderRef$i32 extends StdMeshInstanceValueProvider {
  Ref = null;
  Scale = new $.C4Fixed();

  init(ref, scale) {
    super.init();
    this.Scale = scale.$clone();
    this.Ref = ref;
    return this;
  }

  Execute() {
    this.Value.$assign(this.Scale.op_mul$i32(this.Ref));
    return true;
  }

  $clone() { return new C4ValueProviderRef$i32().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Ref = o.Ref;
    this.Scale.$assign(o.Scale);
    return this;
  }
}

export class C4ValueProviderConst extends StdMeshInstance$SerializableValueProvider {

  init$v() {
    return this;
  }

  init$C4Fixed(value) {
    this.Value.$assign(value);
    return this;
  }

  Execute() {
    return true;
  }

  $clone() { return new C4ValueProviderConst().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class C4ValueProviderLinear extends StdMeshInstance$SerializableValueProvider {
  Begin = new $.C4Fixed();
  End = new $.C4Fixed();
  Length = 0;
  Ending = 0 /*ANIM_Loop*/;
  LastTick = 0;

  init$v() {
    this.Begin = $.Fix0$C4Real.$clone();
    this.End = $.Fix0$C4Real.$clone();
    this.Length = 0;
    this.Ending = 0 /*ANIM_Loop*/;
    this.LastTick = 0;
    return this;
  }

  init$C4Fixed$C4Fixed$C4Fixed$i32$i32(pos, begin, end, length, ending) {
    this.Begin = begin.$clone();
    this.End = end.$clone();
    this.Length = length;
    this.Ending = ending;
    this.LastTick = $.Game.FrameCounter;
    this.Value.$assign(pos);
    return this;
  }

  Execute() {
    this.Value.op_addAssign$C4Fixed(this.End.op_sub$C4Fixed(this.Begin).op_mul$C4Fixed($.itofix$i32($.Game.FrameCounter - this.LastTick | 0)).op_div$i32(this.Length));
    this.LastTick = $.Game.FrameCounter;
    0;
    while (this.End.op_gt$C4Fixed(this.Begin) && this.Value.op_gt$C4Fixed(this.End) || this.End.op_lt$C4Fixed(this.Begin) && this.Value.op_lt$C4Fixed(this.End)) {
      switch (this.Ending) {
        case 0:
          this.Value.op_subAssign$C4Fixed(this.End.op_sub$C4Fixed(this.Begin));
          return true;
        case 1:
          this.Value.$assign(this.End);
          return true;
        case 2:
          this.Value.$assign(this.End);
          return false;
      }
    }
    return true;
  }

  CompileFunc(pComp) {
    const Endings = $own([((($o) => ($o.Name = S("Loop"), $o.Val = 0 /*ANIM_Loop*/, $o))(new $.StdEnumEntry$i32())), ((($o) => ($o.Name = S("Hold"), $o.Val = 1 /*ANIM_Hold*/, $o))(new $.StdEnumEntry$i32())), ((($o) => ($o.Name = S("Remove"), $o.Val = 2 /*ANIM_Remove*/, $o))(new $.StdEnumEntry$i32())), ((($o) => ($o.Name = null, $o.Val = 0, $o))(new $.StdEnumEntry$i32()))]);
    $.StdMeshInstance$SerializableValueProvider.prototype.CompileFunc.call(this, pComp);
    pComp.Separator();
    pComp.Value$rC4Fixed(this.Begin);
    pComp.Separator();
    pComp.Value$rC4Fixed(this.End);
    pComp.Separator();
    pComp.Value$ri32(P(this, "Length"));
    pComp.Separator();
    pComp.Value$StdEnumAdapt$i32$u8$2($.mkEnumAdaptT$2(P(this, "Ending"), $oat(Endings, 0)));
    pComp.Separator();
    pComp.Value$ri32(P(this, "LastTick"));
    if (pComp.isDeserializer()) {
      if (this.LastTick > $.Game.FrameCounter) {
        this.LastTick = 0;
      }
    }
  }

  $clone() { return new C4ValueProviderLinear().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Begin.$assign(o.Begin);
    this.End.$assign(o.End);
    this.Length = o.Length;
    this.Ending = o.Ending;
    this.LastTick = o.LastTick;
    return this;
  }
}

export class C4ValueProviderX extends StdMeshInstance$SerializableValueProvider {
  Object = new $.C4ObjectPtr().init$v();
  Begin = new $.C4Fixed();
  End = new $.C4Fixed();
  Length = 0;

  init$v() {
    this.Object = new $.C4ObjectPtr().init$pC4Object(null);
    this.Begin = $.Fix0$C4Real.$clone();
    this.End = $.Fix0$C4Real.$clone();
    this.Length = 0;
    return this;
  }

  init$pC4Object$C4Fixed$C4Fixed$C4Fixed$i32(object, pos, begin, end, length) {
    this.Object = new $.C4ObjectPtr().init$pC4Object(object);
    this.Begin = begin.$clone();
    this.End = end.$clone();
    this.Length = length;
    this.Value.$assign(pos);
    return this;
  }

  Execute() {
    if (this.Object.op_not()) {
      return false;
    }
    this.Value.op_addAssign$C4Fixed(this.End.op_sub$C4Fixed(this.Begin).op_mul$C4Fixed(this.Object.op_arrow().xdir).op_div$i32(this.Length));
    if (this.End.op_gt$C4Fixed(this.Begin)) {
      while (this.Value.op_gt$C4Fixed(this.End)) {
        this.Value.op_subAssign$C4Fixed(this.End.op_sub$C4Fixed(this.Begin));
      }
      while (this.Value.op_lt$C4Fixed(this.Begin)) {
        this.Value.op_addAssign$C4Fixed(this.End.op_sub$C4Fixed(this.Begin));
      }
    } else {
      while (this.Value.op_gt$C4Fixed(this.Begin)) {
        this.Value.op_subAssign$C4Fixed(this.Begin.op_sub$C4Fixed(this.End));
      }
      while (this.Value.op_lt$C4Fixed(this.End)) {
        this.Value.op_addAssign$C4Fixed(this.Begin.op_sub$C4Fixed(this.End));
      }
    }
    return true;
  }

  CompileFunc(pComp) {
    $.StdMeshInstance$SerializableValueProvider.prototype.CompileFunc.call(this, pComp);
    pComp.Separator();
    pComp.Value$rC4ObjectPtr(this.Object);
    pComp.Separator();
    pComp.Value$rC4Fixed(this.Begin);
    pComp.Separator();
    pComp.Value$rC4Fixed(this.End);
    pComp.Separator();
    pComp.Value$ri32(P(this, "Length"));
  }

  DenumeratePointers() {
    this.Object.DenumeratePointers();
  }

  ClearPointers(pObj) {
    if (this.Object.op_eq$pC4Object(pObj)) {
      this.Object.op_assign(null);
    }
  }

  $clone() { return new C4ValueProviderX().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Object.$assign(o.Object);
    this.Begin.$assign(o.Begin);
    this.End.$assign(o.End);
    this.Length = o.Length;
    return this;
  }
}

export class C4ValueProviderY extends StdMeshInstance$SerializableValueProvider {
  Object = new $.C4ObjectPtr().init$v();
  Begin = new $.C4Fixed();
  End = new $.C4Fixed();
  Length = 0;

  init$v() {
    this.Object = new $.C4ObjectPtr().init$pC4Object(null);
    this.Begin = $.Fix0$C4Real.$clone();
    this.End = $.Fix0$C4Real.$clone();
    this.Length = 0;
    return this;
  }

  init$pC4Object$C4Fixed$C4Fixed$C4Fixed$i32(object, pos, begin, end, length) {
    this.Object = new $.C4ObjectPtr().init$pC4Object(object);
    this.Begin = begin.$clone();
    this.End = end.$clone();
    this.Length = length;
    this.Value.$assign(pos);
    return this;
  }

  Execute() {
    if (this.Object.op_not()) {
      return false;
    }
    this.Value.op_addAssign$C4Fixed(this.End.op_sub$C4Fixed(this.Begin).op_mul$C4Fixed(this.Object.op_arrow().ydir).op_div$i32(this.Length));
    if (this.End.op_gt$C4Fixed(this.Begin)) {
      while (this.Value.op_gt$C4Fixed(this.End)) {
        this.Value.op_subAssign$C4Fixed(this.End.op_sub$C4Fixed(this.Begin));
      }
      while (this.Value.op_lt$C4Fixed(this.Begin)) {
        this.Value.op_addAssign$C4Fixed(this.End.op_sub$C4Fixed(this.Begin));
      }
    } else {
      while (this.Value.op_gt$C4Fixed(this.Begin)) {
        this.Value.op_subAssign$C4Fixed(this.Begin.op_sub$C4Fixed(this.End));
      }
      while (this.Value.op_lt$C4Fixed(this.End)) {
        this.Value.op_addAssign$C4Fixed(this.Begin.op_sub$C4Fixed(this.End));
      }
    }
    return true;
  }

  CompileFunc(pComp) {
    $.StdMeshInstance$SerializableValueProvider.prototype.CompileFunc.call(this, pComp);
    pComp.Separator();
    pComp.Value$rC4ObjectPtr(this.Object);
    pComp.Separator();
    pComp.Value$rC4Fixed(this.Begin);
    pComp.Separator();
    pComp.Value$rC4Fixed(this.End);
    pComp.Separator();
    pComp.Value$ri32(P(this, "Length"));
  }

  DenumeratePointers() {
    this.Object.DenumeratePointers();
  }

  ClearPointers(pObj) {
    if (this.Object.op_eq$pC4Object(pObj)) {
      this.Object.op_assign(null);
    }
  }

  $clone() { return new C4ValueProviderY().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Object.$assign(o.Object);
    this.Begin.$assign(o.Begin);
    this.End.$assign(o.End);
    this.Length = o.Length;
    return this;
  }
}

export class C4ValueProviderR extends StdMeshInstance$SerializableValueProvider {
  Object = new $.C4ObjectPtr().init$v();
  Begin = new $.C4Fixed();
  End = new $.C4Fixed();

  init$v() {
    this.Object = new $.C4ObjectPtr().init$pC4Object(null);
    this.Begin = $.Fix0$C4Real.$clone();
    this.End = $.Fix0$C4Real.$clone();
    return this;
  }

  init$pC4Object$C4Fixed$C4Fixed(object, begin, end) {
    this.Object = new $.C4ObjectPtr().init$pC4Object(object);
    this.Begin = begin.$clone();
    this.End = end.$clone();
    C4ValueProviderR.prototype.Execute.call(this);
    return this;
  }

  Execute() {
    if (this.Object.op_not()) {
      return false;
    }
    let r = this.Object.op_arrow().fix_r.$clone();
    if (r.op_lt$i32(0)) {
      r.op_addAssign$i32(360);
    }
    this.Value.$assign(this.Begin.op_add$C4Fixed(this.End.op_sub$C4Fixed(this.Begin).op_mul$C4Fixed(r).op_div$i32(360)));
    return true;
  }

  CompileFunc(pComp) {
    $.StdMeshInstance$SerializableValueProvider.prototype.CompileFunc.call(this, pComp);
    pComp.Separator();
    pComp.Value$rC4ObjectPtr(this.Object);
    pComp.Separator();
    pComp.Value$rC4Fixed(this.Begin);
    pComp.Separator();
    pComp.Value$rC4Fixed(this.End);
  }

  DenumeratePointers() {
    this.Object.DenumeratePointers();
  }

  ClearPointers(pObj) {
    if (this.Object.op_eq$pC4Object(pObj)) {
      this.Object.op_assign(null);
    }
  }

  $clone() { return new C4ValueProviderR().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Object.$assign(o.Object);
    this.Begin.$assign(o.Begin);
    this.End.$assign(o.End);
    return this;
  }
}

export class C4ValueProviderAbsX extends StdMeshInstance$SerializableValueProvider {
  Object = new $.C4ObjectPtr().init$v();
  Begin = new $.C4Fixed();
  End = new $.C4Fixed();
  Length = 0;

  init$v() {
    this.Object = new $.C4ObjectPtr().init$pC4Object(null);
    this.Begin = $.Fix0$C4Real.$clone();
    this.End = $.Fix0$C4Real.$clone();
    this.Length = 0;
    return this;
  }

  init$pC4Object$C4Fixed$C4Fixed$C4Fixed$i32(object, pos, begin, end, length) {
    this.Object = new $.C4ObjectPtr().init$pC4Object(object);
    this.Begin = begin.$clone();
    this.End = end.$clone();
    this.Length = length;
    this.Value.$assign(pos);
    return this;
  }

  Execute() {
    if (this.Object.op_not()) {
      return false;
    }
    let dist = new $.C4Fixed();
    if (this.Object.op_arrow().xdir.op_gt$C4Fixed($.itofix$i32(100)) || this.Object.op_arrow().ydir.op_gt$C4Fixed($.itofix$i32(100))) {
      dist.$assign($.itofix$i32($.Distance(0, 0, $.fixtoi$C4Fixed(this.Object.op_arrow().xdir), $.fixtoi$C4Fixed(this.Object.op_arrow().ydir))));
    } else if (this.Object.op_arrow().xdir.op_gt$C4Fixed($.itofix$i32(1)) || this.Object.op_arrow().ydir.op_gt$C4Fixed($.itofix$i32(1))) {
      dist.$assign($.itofix$i32$i32($.Distance(0, 0, $.fixtoi$C4Fixed$i32(this.Object.op_arrow().xdir, 256), $.fixtoi$C4Fixed$i32(this.Object.op_arrow().ydir, 256)), 16));
    } else {
      dist.$assign($.itofix$i32$i32($.Distance(0, 0, $.fixtoi$C4Fixed$i32(this.Object.op_arrow().xdir, 16384), $.fixtoi$C4Fixed$i32(this.Object.op_arrow().ydir, 16384)), 128));
    }
    this.Value.op_addAssign$C4Fixed(this.End.op_sub$C4Fixed(this.Begin).op_mul$C4Fixed($.Abs$C4Fixed(this.Object.op_arrow().xdir.$clone())).op_div$i32(this.Length));
    0;
    while (this.End.op_gt$C4Fixed(this.Begin) && this.Value.op_gt$C4Fixed(this.End) || this.End.op_lt$C4Fixed(this.Begin) && this.Value.op_lt$C4Fixed(this.End)) {
      this.Value.op_subAssign$C4Fixed(this.End.op_sub$C4Fixed(this.Begin));
    }
    return true;
  }

  CompileFunc(pComp) {
    $.StdMeshInstance$SerializableValueProvider.prototype.CompileFunc.call(this, pComp);
    pComp.Separator();
    pComp.Value$rC4ObjectPtr(this.Object);
    pComp.Separator();
    pComp.Value$rC4Fixed(this.Begin);
    pComp.Separator();
    pComp.Value$rC4Fixed(this.End);
    pComp.Separator();
    pComp.Value$ri32(P(this, "Length"));
  }

  DenumeratePointers() {
    this.Object.DenumeratePointers();
  }

  ClearPointers(pObj) {
    if (this.Object.op_eq$pC4Object(pObj)) {
      this.Object.op_assign(null);
    }
  }

  $clone() { return new C4ValueProviderAbsX().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Object.$assign(o.Object);
    this.Begin.$assign(o.Begin);
    this.End.$assign(o.End);
    this.Length = o.Length;
    return this;
  }
}

export class C4ValueProviderAbsY extends StdMeshInstance$SerializableValueProvider {
  Object = new $.C4ObjectPtr().init$v();
  Begin = new $.C4Fixed();
  End = new $.C4Fixed();
  Length = 0;

  init$v() {
    this.Object = new $.C4ObjectPtr().init$pC4Object(null);
    this.Begin = $.Fix0$C4Real.$clone();
    this.End = $.Fix0$C4Real.$clone();
    this.Length = 0;
    return this;
  }

  init$pC4Object$C4Fixed$C4Fixed$C4Fixed$i32(object, pos, begin, end, length) {
    this.Object = new $.C4ObjectPtr().init$pC4Object(object);
    this.Begin = begin.$clone();
    this.End = end.$clone();
    this.Length = length;
    this.Value.$assign(pos);
    return this;
  }

  Execute() {
    if (this.Object.op_not()) {
      return false;
    }
    this.Value.op_addAssign$C4Fixed(this.End.op_sub$C4Fixed(this.Begin).op_mul$C4Fixed($.Abs$C4Fixed(this.Object.op_arrow().ydir.$clone())).op_div$i32(this.Length));
    0;
    while (this.End.op_gt$C4Fixed(this.Begin) && this.Value.op_gt$C4Fixed(this.End) || this.End.op_lt$C4Fixed(this.Begin) && this.Value.op_lt$C4Fixed(this.End)) {
      this.Value.op_subAssign$C4Fixed(this.End.op_sub$C4Fixed(this.Begin));
    }
    return true;
  }

  CompileFunc(pComp) {
    $.StdMeshInstance$SerializableValueProvider.prototype.CompileFunc.call(this, pComp);
    pComp.Separator();
    pComp.Value$rC4ObjectPtr(this.Object);
    pComp.Separator();
    pComp.Value$rC4Fixed(this.Begin);
    pComp.Separator();
    pComp.Value$rC4Fixed(this.End);
    pComp.Separator();
    pComp.Value$ri32(P(this, "Length"));
  }

  DenumeratePointers() {
    this.Object.DenumeratePointers();
  }

  ClearPointers(pObj) {
    if (this.Object.op_eq$pC4Object(pObj)) {
      this.Object.op_assign(null);
    }
  }

  $clone() { return new C4ValueProviderAbsY().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Object.$assign(o.Object);
    this.Begin.$assign(o.Begin);
    this.End.$assign(o.End);
    this.Length = o.Length;
    return this;
  }
}

export class C4ValueProviderDist extends StdMeshInstance$SerializableValueProvider {
  Object = new $.C4ObjectPtr().init$v();
  Begin = new $.C4Fixed();
  End = new $.C4Fixed();
  Length = 0;

  init$v() {
    this.Object = new $.C4ObjectPtr().init$pC4Object(null);
    this.Begin = $.Fix0$C4Real.$clone();
    this.End = $.Fix0$C4Real.$clone();
    this.Length = 0;
    return this;
  }

  init$pC4Object$C4Fixed$C4Fixed$C4Fixed$i32(object, pos, begin, end, length) {
    this.Object = new $.C4ObjectPtr().init$pC4Object(object);
    this.Begin = begin.$clone();
    this.End = end.$clone();
    this.Length = length;
    this.Value.$assign(pos);
    return this;
  }

  Execute() {
    if (this.Object.op_not()) {
      return false;
    }
    let dist = new $.C4Fixed();
    if (this.Object.op_arrow().xdir.op_gt$C4Fixed($.itofix$i32(256)) || this.Object.op_arrow().ydir.op_gt$C4Fixed($.itofix$i32(256))) {
      dist.$assign($.itofix$i32($.Distance(0, 0, $.fixtoi$C4Fixed(this.Object.op_arrow().xdir), $.fixtoi$C4Fixed(this.Object.op_arrow().ydir))));
    } else if (this.Object.op_arrow().xdir.op_gt$C4Fixed($.itofix$i32(1)) || this.Object.op_arrow().ydir.op_gt$C4Fixed($.itofix$i32(1))) {
      dist.$assign($.itofix$i32$i32($.Distance(0, 0, $.fixtoi$C4Fixed$i32(this.Object.op_arrow().xdir, 256), $.fixtoi$C4Fixed$i32(this.Object.op_arrow().ydir, 256)), 256));
    } else {
      dist.$assign($.itofix$i32$i32($.Distance(0, 0, $.fixtoi$C4Fixed$i32(this.Object.op_arrow().xdir, 65536), $.fixtoi$C4Fixed$i32(this.Object.op_arrow().ydir, 65536)), 65536));
    }
    this.Value.op_addAssign$C4Fixed(this.End.op_sub$C4Fixed(this.Begin).op_mul$C4Fixed(dist).op_div$i32(this.Length));
    0;
    while (this.End.op_gt$C4Fixed(this.Begin) && this.Value.op_gt$C4Fixed(this.End) || this.End.op_lt$C4Fixed(this.Begin) && this.Value.op_lt$C4Fixed(this.End)) {
      this.Value.op_subAssign$C4Fixed(this.End.op_sub$C4Fixed(this.Begin));
    }
    return true;
  }

  CompileFunc(pComp) {
    $.StdMeshInstance$SerializableValueProvider.prototype.CompileFunc.call(this, pComp);
    pComp.Separator();
    pComp.Value$rC4ObjectPtr(this.Object);
    pComp.Separator();
    pComp.Value$rC4Fixed(this.Begin);
    pComp.Separator();
    pComp.Value$rC4Fixed(this.End);
    pComp.Separator();
    pComp.Value$ri32(P(this, "Length"));
  }

  DenumeratePointers() {
    this.Object.DenumeratePointers();
  }

  ClearPointers(pObj) {
    if (this.Object.op_eq$pC4Object(pObj)) {
      this.Object.op_assign(null);
    }
  }

  $clone() { return new C4ValueProviderDist().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Object.$assign(o.Object);
    this.Begin.$assign(o.Begin);
    this.End.$assign(o.End);
    this.Length = o.Length;
    return this;
  }
}

export class C4ValueProviderXDir extends StdMeshInstance$SerializableValueProvider {
  Object = new $.C4ObjectPtr().init$v();
  Begin = new $.C4Fixed();
  End = new $.C4Fixed();
  MaxXDir = new $.C4Fixed();

  init$v() {
    this.Object = new $.C4ObjectPtr().init$pC4Object(null);
    this.Begin = $.Fix0$C4Real.$clone();
    this.End = $.Fix0$C4Real.$clone();
    this.MaxXDir = $.Fix0$C4Real.$clone();
    return this;
  }

  init$pC4Object$C4Fixed$C4Fixed$C4Fixed(object, begin, end, max_xdir) {
    this.Object = new $.C4ObjectPtr().init$pC4Object(object);
    this.Begin = begin.$clone();
    this.End = end.$clone();
    this.MaxXDir = max_xdir.$clone();
    C4ValueProviderXDir.prototype.Execute.call(this);
    return this;
  }

  Execute() {
    if (this.Object.op_not()) {
      return false;
    }
    this.Value.$assign(this.Begin.op_add$C4Fixed(this.End.op_sub$C4Fixed(this.Begin).op_mul$C4Fixed($minBy($.Abs$C4Fixed(this.Object.op_arrow().xdir.op_div$C4Fixed(this.MaxXDir)), $.itofix$i32(1), (x, y) => x.op_lt$C4Fixed(y)))));
    return true;
  }

  CompileFunc(pComp) {
    $.StdMeshInstance$SerializableValueProvider.prototype.CompileFunc.call(this, pComp);
    pComp.Separator();
    pComp.Value$rC4ObjectPtr(this.Object);
    pComp.Separator();
    pComp.Value$rC4Fixed(this.Begin);
    pComp.Separator();
    pComp.Value$rC4Fixed(this.End);
    pComp.Separator();
    pComp.Value$rC4Fixed(this.MaxXDir);
  }

  DenumeratePointers() {
    this.Object.DenumeratePointers();
  }

  ClearPointers(pObj) {
    if (this.Object.op_eq$pC4Object(pObj)) {
      this.Object.op_assign(null);
    }
  }

  $clone() { return new C4ValueProviderXDir().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Object.$assign(o.Object);
    this.Begin.$assign(o.Begin);
    this.End.$assign(o.End);
    this.MaxXDir.$assign(o.MaxXDir);
    return this;
  }
}

export class C4ValueProviderYDir extends StdMeshInstance$SerializableValueProvider {
  Object = new $.C4ObjectPtr().init$v();
  Begin = new $.C4Fixed();
  End = new $.C4Fixed();
  MaxYDir = new $.C4Fixed();

  init$v() {
    this.Object = new $.C4ObjectPtr().init$pC4Object(null);
    this.Begin = $.Fix0$C4Real.$clone();
    this.End = $.Fix0$C4Real.$clone();
    this.MaxYDir = $.Fix0$C4Real.$clone();
    return this;
  }

  init$pC4Object$C4Fixed$C4Fixed$C4Fixed(object, begin, end, max_ydir) {
    this.Object = new $.C4ObjectPtr().init$pC4Object(object);
    this.Begin = begin.$clone();
    this.End = end.$clone();
    this.MaxYDir = max_ydir.$clone();
    C4ValueProviderYDir.prototype.Execute.call(this);
    return this;
  }

  Execute() {
    if (this.Object.op_not()) {
      return false;
    }
    this.Value.$assign(this.Begin.op_add$C4Fixed(this.End.op_sub$C4Fixed(this.Begin).op_mul$C4Fixed($minBy($.Abs$C4Fixed(this.Object.op_arrow().ydir.op_div$C4Fixed(this.MaxYDir)), $.itofix$i32(1), (x, y) => x.op_lt$C4Fixed(y)))));
    return true;
  }

  CompileFunc(pComp) {
    $.StdMeshInstance$SerializableValueProvider.prototype.CompileFunc.call(this, pComp);
    pComp.Separator();
    pComp.Value$rC4ObjectPtr(this.Object);
    pComp.Separator();
    pComp.Value$rC4Fixed(this.Begin);
    pComp.Separator();
    pComp.Value$rC4Fixed(this.End);
    pComp.Separator();
    pComp.Value$rC4Fixed(this.MaxYDir);
  }

  DenumeratePointers() {
    this.Object.DenumeratePointers();
  }

  ClearPointers(pObj) {
    if (this.Object.op_eq$pC4Object(pObj)) {
      this.Object.op_assign(null);
    }
  }

  $clone() { return new C4ValueProviderYDir().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Object.$assign(o.Object);
    this.Begin.$assign(o.Begin);
    this.End.$assign(o.End);
    this.MaxYDir.$assign(o.MaxYDir);
    return this;
  }
}

export class C4ValueProviderRDir extends StdMeshInstance$SerializableValueProvider {
  Object = new $.C4ObjectPtr().init$v();
  Begin = new $.C4Fixed();
  End = new $.C4Fixed();
  MinRDir = new $.C4Fixed();
  MaxRDir = new $.C4Fixed();

  init$v() {
    this.Object = new $.C4ObjectPtr().init$pC4Object(null);
    this.Begin = $.Fix0$C4Real.$clone();
    this.End = $.Fix0$C4Real.$clone();
    this.MinRDir = $.Fix0$C4Real.$clone();
    this.MaxRDir = $.Fix0$C4Real.$clone();
    return this;
  }

  init$pC4Object$C4Fixed$C4Fixed$C4Fixed$C4Fixed(object, begin, end, min_rdir, max_rdir) {
    this.Object = new $.C4ObjectPtr().init$pC4Object(object);
    this.Begin = begin.$clone();
    this.End = end.$clone();
    this.MinRDir = min_rdir.$clone();
    this.MaxRDir = max_rdir.$clone();
    C4ValueProviderRDir.prototype.Execute.call(this);
    return this;
  }

  Execute() {
    if (this.Object.op_not()) {
      return false;
    }
    let val = this.Object.op_arrow().rdir.op_sub$C4Fixed(this.MinRDir).op_div$C4Fixed(this.MaxRDir.op_sub$C4Fixed(this.MinRDir));
    this.Value.$assign(this.Begin.op_add$C4Fixed(this.End.op_sub$C4Fixed(this.Begin).op_mul$C4Fixed($.Clamp$C4Fixed$C4Fixed$C4Fixed(val.$clone(), $.itofix$i32(0), $.itofix$i32(1)))));
    return true;
  }

  CompileFunc(pComp) {
    $.StdMeshInstance$SerializableValueProvider.prototype.CompileFunc.call(this, pComp);
    pComp.Separator();
    pComp.Value$rC4ObjectPtr(this.Object);
    pComp.Separator();
    pComp.Value$rC4Fixed(this.Begin);
    pComp.Separator();
    pComp.Value$rC4Fixed(this.End);
    pComp.Separator();
    pComp.Value$rC4Fixed(this.MaxRDir);
  }

  DenumeratePointers() {
    this.Object.DenumeratePointers();
  }

  ClearPointers(pObj) {
    if (this.Object.op_eq$pC4Object(pObj)) {
      this.Object.op_assign(null);
    }
  }

  $clone() { return new C4ValueProviderRDir().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Object.$assign(o.Object);
    this.Begin.$assign(o.Begin);
    this.End.$assign(o.End);
    this.MinRDir.$assign(o.MinRDir);
    this.MaxRDir.$assign(o.MaxRDir);
    return this;
  }
}

export class C4ValueProviderAbsRDir extends StdMeshInstance$SerializableValueProvider {
  Object = new $.C4ObjectPtr().init$v();
  Begin = new $.C4Fixed();
  End = new $.C4Fixed();
  MinRDir = new $.C4Fixed();
  MaxRDir = new $.C4Fixed();

  init$v() {
    this.Object = new $.C4ObjectPtr().init$pC4Object(null);
    this.Begin = $.Fix0$C4Real.$clone();
    this.End = $.Fix0$C4Real.$clone();
    this.MinRDir = $.Fix0$C4Real.$clone();
    this.MaxRDir = $.Fix0$C4Real.$clone();
    return this;
  }

  init$pC4Object$C4Fixed$C4Fixed$C4Fixed$C4Fixed(object, begin, end, min_rdir, max_rdir) {
    this.Object = new $.C4ObjectPtr().init$pC4Object(object);
    this.Begin = begin.$clone();
    this.End = end.$clone();
    this.MinRDir = min_rdir.$clone();
    this.MaxRDir = max_rdir.$clone();
    C4ValueProviderAbsRDir.prototype.Execute.call(this);
    return this;
  }

  Execute() {
    if (this.Object.op_not()) {
      return false;
    }
    let val = $.Abs$C4Fixed(this.Object.op_arrow().rdir.$clone()).op_sub$C4Fixed(this.MinRDir).op_div$C4Fixed(this.MaxRDir.op_sub$C4Fixed(this.MinRDir));
    this.Value.$assign(this.Begin.op_add$C4Fixed(this.End.op_sub$C4Fixed(this.Begin).op_mul$C4Fixed($.Clamp$C4Fixed$C4Fixed$C4Fixed(val.$clone(), $.itofix$i32(0), $.itofix$i32(1)))));
    return true;
  }

  CompileFunc(pComp) {
    $.StdMeshInstance$SerializableValueProvider.prototype.CompileFunc.call(this, pComp);
    pComp.Separator();
    pComp.Value$rC4ObjectPtr(this.Object);
    pComp.Separator();
    pComp.Value$rC4Fixed(this.Begin);
    pComp.Separator();
    pComp.Value$rC4Fixed(this.End);
    pComp.Separator();
    pComp.Value$rC4Fixed(this.MaxRDir);
  }

  DenumeratePointers() {
    this.Object.DenumeratePointers();
  }

  ClearPointers(pObj) {
    if (this.Object.op_eq$pC4Object(pObj)) {
      this.Object.op_assign(null);
    }
  }

  $clone() { return new C4ValueProviderAbsRDir().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Object.$assign(o.Object);
    this.Begin.$assign(o.Begin);
    this.End.$assign(o.End);
    this.MinRDir.$assign(o.MinRDir);
    this.MaxRDir.$assign(o.MaxRDir);
    return this;
  }
}

export class C4ValueProviderCosR extends StdMeshInstance$SerializableValueProvider {
  Object = new $.C4ObjectPtr().init$v();
  Begin = new $.C4Fixed();
  End = new $.C4Fixed();
  Offset = new $.C4Fixed();

  init$v() {
    this.Object = new $.C4ObjectPtr().init$pC4Object(null);
    this.Begin = $.Fix0$C4Real.$clone();
    this.End = $.Fix0$C4Real.$clone();
    this.Offset = $.Fix0$C4Real.$clone();
    return this;
  }

  init$pC4Object$C4Fixed$C4Fixed$C4Fixed(object, begin, end, offset) {
    this.Object = new $.C4ObjectPtr().init$pC4Object(object);
    this.Begin = begin.$clone();
    this.End = end.$clone();
    this.Offset = offset.$clone();
    C4ValueProviderCosR.prototype.Execute.call(this);
    return this;
  }

  Execute() {
    if (this.Object.op_not()) {
      return false;
    }
    this.Value.$assign(this.Begin.op_add$C4Fixed(this.End.op_sub$C4Fixed(this.Begin).op_mul$C4Fixed($.Cos(this.Object.op_arrow().fix_r.op_add$C4Fixed(this.Offset)))));
    return true;
  }

  CompileFunc(pComp) {
    $.StdMeshInstance$SerializableValueProvider.prototype.CompileFunc.call(this, pComp);
    pComp.Separator();
    pComp.Value$rC4ObjectPtr(this.Object);
    pComp.Separator();
    pComp.Value$rC4Fixed(this.Begin);
    pComp.Separator();
    pComp.Value$rC4Fixed(this.End);
    pComp.Separator();
    pComp.Value$rC4Fixed(this.Offset);
  }

  DenumeratePointers() {
    this.Object.DenumeratePointers();
  }

  ClearPointers(pObj) {
    if (this.Object.op_eq$pC4Object(pObj)) {
      this.Object.op_assign(null);
    }
  }

  $clone() { return new C4ValueProviderCosR().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Object.$assign(o.Object);
    this.Begin.$assign(o.Begin);
    this.End.$assign(o.End);
    this.Offset.$assign(o.Offset);
    return this;
  }
}

export class C4ValueProviderSinR extends StdMeshInstance$SerializableValueProvider {
  Object = new $.C4ObjectPtr().init$v();
  Begin = new $.C4Fixed();
  End = new $.C4Fixed();
  Offset = new $.C4Fixed();

  init$v() {
    this.Object = new $.C4ObjectPtr().init$pC4Object(null);
    this.Begin = $.Fix0$C4Real.$clone();
    this.End = $.Fix0$C4Real.$clone();
    this.Offset = $.Fix0$C4Real.$clone();
    return this;
  }

  init$pC4Object$C4Fixed$C4Fixed$C4Fixed(object, begin, end, offset) {
    this.Object = new $.C4ObjectPtr().init$pC4Object(object);
    this.Begin = begin.$clone();
    this.End = end.$clone();
    this.Offset = offset.$clone();
    C4ValueProviderSinR.prototype.Execute.call(this);
    return this;
  }

  Execute() {
    if (this.Object.op_not()) {
      return false;
    }
    this.Value.$assign(this.Begin.op_add$C4Fixed(this.End.op_sub$C4Fixed(this.Begin).op_mul$C4Fixed($.Sin(this.Object.op_arrow().fix_r.op_add$C4Fixed(this.Offset)))));
    return true;
  }

  CompileFunc(pComp) {
    $.StdMeshInstance$SerializableValueProvider.prototype.CompileFunc.call(this, pComp);
    pComp.Separator();
    pComp.Value$rC4ObjectPtr(this.Object);
    pComp.Separator();
    pComp.Value$rC4Fixed(this.Begin);
    pComp.Separator();
    pComp.Value$rC4Fixed(this.End);
    pComp.Separator();
    pComp.Value$rC4Fixed(this.Offset);
  }

  DenumeratePointers() {
    this.Object.DenumeratePointers();
  }

  ClearPointers(pObj) {
    if (this.Object.op_eq$pC4Object(pObj)) {
      this.Object.op_assign(null);
    }
  }

  $clone() { return new C4ValueProviderSinR().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Object.$assign(o.Object);
    this.Begin.$assign(o.Begin);
    this.End.$assign(o.End);
    this.Offset.$assign(o.Offset);
    return this;
  }
}

export class C4ValueProviderCosV extends StdMeshInstance$SerializableValueProvider {
  Object = new $.C4ObjectPtr().init$v();
  Begin = new $.C4Fixed();
  End = new $.C4Fixed();
  Offset = new $.C4Fixed();

  init$v() {
    this.Object = new $.C4ObjectPtr().init$pC4Object(null);
    this.Begin = $.Fix0$C4Real.$clone();
    this.End = $.Fix0$C4Real.$clone();
    this.Offset = $.Fix0$C4Real.$clone();
    return this;
  }

  init$pC4Object$C4Fixed$C4Fixed$C4Fixed(object, begin, end, offset) {
    this.Object = new $.C4ObjectPtr().init$pC4Object(object);
    this.Begin = begin.$clone();
    this.End = end.$clone();
    this.Offset = offset.$clone();
    C4ValueProviderCosV.prototype.Execute.call(this);
    return this;
  }

  Execute() {
    if (this.Object.op_not()) {
      return false;
    }
    let angle = $.Angle(0, 0, $.fixtoi$C4Fixed$i32(this.Object.op_arrow().xdir, 256), $.fixtoi$C4Fixed$i32(this.Object.op_arrow().ydir, 256));
    this.Value.$assign(this.Begin.op_add$C4Fixed(this.End.op_sub$C4Fixed(this.Begin).op_mul$C4Fixed($.Cos($.itofix$i32(angle).op_add$C4Fixed(this.Offset)))));
    return true;
  }

  CompileFunc(pComp) {
    $.StdMeshInstance$SerializableValueProvider.prototype.CompileFunc.call(this, pComp);
    pComp.Separator();
    pComp.Value$rC4ObjectPtr(this.Object);
    pComp.Separator();
    pComp.Value$rC4Fixed(this.Begin);
    pComp.Separator();
    pComp.Value$rC4Fixed(this.End);
    pComp.Separator();
    pComp.Value$rC4Fixed(this.Offset);
  }

  DenumeratePointers() {
    this.Object.DenumeratePointers();
  }

  ClearPointers(pObj) {
    if (this.Object.op_eq$pC4Object(pObj)) {
      this.Object.op_assign(null);
    }
  }

  $clone() { return new C4ValueProviderCosV().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Object.$assign(o.Object);
    this.Begin.$assign(o.Begin);
    this.End.$assign(o.End);
    this.Offset.$assign(o.Offset);
    return this;
  }
}

export class C4ValueProviderSinV extends StdMeshInstance$SerializableValueProvider {
  Object = new $.C4ObjectPtr().init$v();
  Begin = new $.C4Fixed();
  End = new $.C4Fixed();
  Offset = new $.C4Fixed();

  init$v() {
    this.Object = new $.C4ObjectPtr().init$pC4Object(null);
    this.Begin = $.Fix0$C4Real.$clone();
    this.End = $.Fix0$C4Real.$clone();
    this.Offset = $.Fix0$C4Real.$clone();
    return this;
  }

  init$pC4Object$C4Fixed$C4Fixed$C4Fixed(object, begin, end, offset) {
    this.Object = new $.C4ObjectPtr().init$pC4Object(object);
    this.Begin = begin.$clone();
    this.End = end.$clone();
    this.Offset = offset.$clone();
    C4ValueProviderSinV.prototype.Execute.call(this);
    return this;
  }

  Execute() {
    if (this.Object.op_not()) {
      return false;
    }
    let angle = $.Angle(0, 0, $.fixtoi$C4Fixed$i32(this.Object.op_arrow().xdir, 256), $.fixtoi$C4Fixed$i32(this.Object.op_arrow().ydir, 256));
    this.Value.$assign(this.Begin.op_add$C4Fixed(this.End.op_sub$C4Fixed(this.Begin).op_mul$C4Fixed($.Sin($.itofix$i32(angle).op_add$C4Fixed(this.Offset)))));
    return true;
  }

  CompileFunc(pComp) {
    $.StdMeshInstance$SerializableValueProvider.prototype.CompileFunc.call(this, pComp);
    pComp.Separator();
    pComp.Value$rC4ObjectPtr(this.Object);
    pComp.Separator();
    pComp.Value$rC4Fixed(this.Begin);
    pComp.Separator();
    pComp.Value$rC4Fixed(this.End);
    pComp.Separator();
    pComp.Value$rC4Fixed(this.Offset);
  }

  DenumeratePointers() {
    this.Object.DenumeratePointers();
  }

  ClearPointers(pObj) {
    if (this.Object.op_eq$pC4Object(pObj)) {
      this.Object.op_assign(null);
    }
  }

  $clone() { return new C4ValueProviderSinV().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Object.$assign(o.Object);
    this.Begin.$assign(o.Begin);
    this.End.$assign(o.End);
    this.Offset.$assign(o.Offset);
    return this;
  }
}

export class C4ValueProviderAction extends StdMeshInstance$SerializableValueProvider {
  Object = new $.C4ObjectPtr().init$v();

  init$v() {
    this.Object = new $.C4ObjectPtr().init$pC4Object(null);
    return this;
  }

  init$pC4Object(object) {
    this.Object = new $.C4ObjectPtr().init$pC4Object(object);
    return this;
  }

  Execute() {
    if (this.Object.op_not()) {
      return false;
    }
    const Action = this.Object.op_arrow().Action;
    let pActionDef = this.Object.op_arrow().GetAction();
    let animation = Action.Animation.GetAnimation();
    let length = pActionDef.GetPropertyInt(29 /*P_Length*/);
    let delay = pActionDef.GetPropertyInt(30 /*P_Delay*/);
    if (delay !== 0) {
      this.Value.$assign($.itofix$i32(Math.imul(Action.Phase, delay) + Action.PhaseDelay | 0).op_mul$C4Fixed($.ftofix(animation.Length)).op_div$i32(Math.imul(delay, length)));
    } else {
      this.Value.$assign($.itofix$i32(Action.Phase).op_mul$C4Fixed($.ftofix(animation.Length)).op_div$i32(length));
    }
    return true;
  }

  CompileFunc(pComp) {
    $.StdMeshInstance$SerializableValueProvider.prototype.CompileFunc.call(this, pComp);
    pComp.Separator();
    pComp.Value$rC4ObjectPtr(this.Object);
  }

  DenumeratePointers() {
    this.Object.DenumeratePointers();
  }

  ClearPointers(pObj) {
    if (this.Object.op_eq$pC4Object(pObj)) {
      this.Object.op_assign(null);
    }
  }

  $clone() { return new C4ValueProviderAction().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Object.$assign(o.Object);
    return this;
  }
}


















export function CreateValueProviderFromArray(pForObj, Data, pos_for_animation = null) {
  let type = Data.op_index$i32(0).getInt();
  switch (type) {
    case 0:
      return new C4ValueProviderConst().init$C4Fixed($.itofix$i32$i32(Data.op_index$i32(1).getInt(), 1000));
    case 1:
      {
        let end = Data.op_index$i32(3).getInt();
        let len = Data.op_index$i32(4).getInt();
        if (len === 0) {
          $throw(new $.C4AulExecError().init(S("Length cannot be zero")));
        }
        if (pos_for_animation != null) {
          let max_end = $.fixtoi$C4Fixed$i32($.ftofix(pos_for_animation.Length), 1000);
          if (end < 0 || end > max_end) {
            $throw(new $.C4AulExecError().init($.FormatString(S("End (%d) not in range of animation '%s' (0-%d)."), end, pos_for_animation.Name.getData(), max_end).getData()));
          }
        }
        return new C4ValueProviderLinear().init$C4Fixed$C4Fixed$C4Fixed$i32$i32($.itofix$i32$i32(Data.op_index$i32(1).getInt(), 1000), $.itofix$i32$i32(Data.op_index$i32(2).getInt(), 1000), $.itofix$i32$i32(end, 1000), len, Data.op_index$i32(5).getInt());
      }
    case 2:
      if (pForObj == null) {
        return null;
      }
      if (Data.op_index$i32(4).getInt() === 0) {
        $throw(new $.C4AulExecError().init(S("Length cannot be zero")));
      }
      return new C4ValueProviderX().init$pC4Object$C4Fixed$C4Fixed$C4Fixed$i32(pForObj, $.itofix$i32$i32(Data.op_index$i32(1).getInt(), 1000), $.itofix$i32$i32(Data.op_index$i32(2).getInt(), 1000), $.itofix$i32$i32(Data.op_index$i32(3).getInt(), 1000), Data.op_index$i32(4).getInt());
    case 3:
      if (pForObj == null) {
        return null;
      }
      if (Data.op_index$i32(4).getInt() === 0) {
        $throw(new $.C4AulExecError().init(S("Length cannot be zero")));
      }
      return new C4ValueProviderY().init$pC4Object$C4Fixed$C4Fixed$C4Fixed$i32(pForObj, $.itofix$i32$i32(Data.op_index$i32(1).getInt(), 1000), $.itofix$i32$i32(Data.op_index$i32(2).getInt(), 1000), $.itofix$i32$i32(Data.op_index$i32(3).getInt(), 1000), Data.op_index$i32(4).getInt());
    case 4:
      if (Data.GetSize() >= 4 && Data.op_index$i32(3).op_ne($.C4VNull)) {
        pForObj = Data.op_index$i32(3).getObj();
      }
      if (pForObj == null) {
        return null;
      }
      return new C4ValueProviderR().init$pC4Object$C4Fixed$C4Fixed(pForObj, $.itofix$i32$i32(Data.op_index$i32(1).getInt(), 1000), $.itofix$i32$i32(Data.op_index$i32(2).getInt(), 1000));
    case 5:
      if (pForObj == null) {
        return null;
      }
      if (Data.op_index$i32(4).getInt() === 0) {
        $throw(new $.C4AulExecError().init(S("Length cannot be zero")));
      }
      return new C4ValueProviderAbsX().init$pC4Object$C4Fixed$C4Fixed$C4Fixed$i32(pForObj, $.itofix$i32$i32(Data.op_index$i32(1).getInt(), 1000), $.itofix$i32$i32(Data.op_index$i32(2).getInt(), 1000), $.itofix$i32$i32(Data.op_index$i32(3).getInt(), 1000), Data.op_index$i32(4).getInt());
    case 6:
      if (pForObj == null) {
        return null;
      }
      if (Data.op_index$i32(4).getInt() === 0) {
        $throw(new $.C4AulExecError().init(S("Length cannot be zero")));
      }
      return new C4ValueProviderAbsY().init$pC4Object$C4Fixed$C4Fixed$C4Fixed$i32(pForObj, $.itofix$i32$i32(Data.op_index$i32(1).getInt(), 1000), $.itofix$i32$i32(Data.op_index$i32(2).getInt(), 1000), $.itofix$i32$i32(Data.op_index$i32(3).getInt(), 1000), Data.op_index$i32(4).getInt());
    case 7:
      if (pForObj == null) {
        return null;
      }
      if (Data.op_index$i32(4).getInt() === 0) {
        $throw(new $.C4AulExecError().init(S("Length cannot be zero")));
      }
      return new C4ValueProviderDist().init$pC4Object$C4Fixed$C4Fixed$C4Fixed$i32(pForObj, $.itofix$i32$i32(Data.op_index$i32(1).getInt(), 1000), $.itofix$i32$i32(Data.op_index$i32(2).getInt(), 1000), $.itofix$i32$i32(Data.op_index$i32(3).getInt(), 1000), Data.op_index$i32(4).getInt());
    case 8:
      if (pForObj == null) {
        return null;
      }
      if (Data.op_index$i32(3).getInt() === 0) {
        $throw(new $.C4AulExecError().init(S("MaxXDir cannot be zero")));
      }
      return new C4ValueProviderXDir().init$pC4Object$C4Fixed$C4Fixed$C4Fixed(pForObj, $.itofix$i32$i32(Data.op_index$i32(1).getInt(), 1000), $.itofix$i32$i32(Data.op_index$i32(2).getInt(), 1000), $.itofix$i32$i32(Data.op_index$i32(3).getInt(), Data.op_index$i32(4).getInt()));
    case 9:
      if (pForObj == null) {
        return null;
      }
      if (Data.op_index$i32(3).getInt() === 0) {
        $throw(new $.C4AulExecError().init(S("MaxYDir cannot be zero")));
      }
      return new C4ValueProviderYDir().init$pC4Object$C4Fixed$C4Fixed$C4Fixed(pForObj, $.itofix$i32$i32(Data.op_index$i32(1).getInt(), 1000), $.itofix$i32$i32(Data.op_index$i32(2).getInt(), 1000), $.itofix$i32$i32(Data.op_index$i32(3).getInt(), Data.op_index$i32(4).getInt()));
    case 10:
      if (pForObj == null) {
        return null;
      }
      if ((Data.op_index$i32(4).getInt() - Data.op_index$i32(3).getInt() | 0) === 0) {
        $throw(new $.C4AulExecError().init(S("MaxRDir - MinRDir cannot be zero")));
      }
      return new C4ValueProviderRDir().init$pC4Object$C4Fixed$C4Fixed$C4Fixed$C4Fixed(pForObj, $.itofix$i32$i32(Data.op_index$i32(1).getInt(), 1000), $.itofix$i32$i32(Data.op_index$i32(2).getInt(), 1000), $.itofix$i32$i32(Data.op_index$i32(3).getInt(), Data.op_index$i32(5).getInt()), $.itofix$i32$i32(Data.op_index$i32(4).getInt(), Data.op_index$i32(5).getInt()));
    case 11:
      if (pForObj == null) {
        return null;
      }
      if ((Data.op_index$i32(4).getInt() - Data.op_index$i32(3).getInt() | 0) === 0) {
        $throw(new $.C4AulExecError().init(S("MaxRDir - MinRDir cannot be zero")));
      }
      return new C4ValueProviderAbsRDir().init$pC4Object$C4Fixed$C4Fixed$C4Fixed$C4Fixed(pForObj, $.itofix$i32$i32(Data.op_index$i32(1).getInt(), 1000), $.itofix$i32$i32(Data.op_index$i32(2).getInt(), 1000), $.itofix$i32$i32(Data.op_index$i32(3).getInt(), Data.op_index$i32(5).getInt()), $.itofix$i32$i32(Data.op_index$i32(4).getInt(), Data.op_index$i32(5).getInt()));
    case 12:
      if (pForObj == null) {
        return null;
      }
      return new C4ValueProviderCosR().init$pC4Object$C4Fixed$C4Fixed$C4Fixed(pForObj, $.itofix$i32$i32(Data.op_index$i32(1).getInt(), 1000), $.itofix$i32$i32(Data.op_index$i32(2).getInt(), 1000), $.itofix$i32$i32(Data.op_index$i32(3).getInt(), Data.op_index$i32(4).getInt()));
    case 13:
      if (pForObj == null) {
        return null;
      }
      return new C4ValueProviderSinR().init$pC4Object$C4Fixed$C4Fixed$C4Fixed(pForObj, $.itofix$i32$i32(Data.op_index$i32(1).getInt(), 1000), $.itofix$i32$i32(Data.op_index$i32(2).getInt(), 1000), $.itofix$i32$i32(Data.op_index$i32(3).getInt(), Data.op_index$i32(4).getInt()));
    case 14:
      if (pForObj == null) {
        return null;
      }
      return new C4ValueProviderCosV().init$pC4Object$C4Fixed$C4Fixed$C4Fixed(pForObj, $.itofix$i32$i32(Data.op_index$i32(1).getInt(), 1000), $.itofix$i32$i32(Data.op_index$i32(2).getInt(), 1000), $.itofix$i32$i32(Data.op_index$i32(3).getInt(), Data.op_index$i32(4).getInt()));
    case 15:
      if (pForObj == null) {
        return null;
      }
      return new C4ValueProviderSinV().init$pC4Object$C4Fixed$C4Fixed$C4Fixed(pForObj, $.itofix$i32$i32(Data.op_index$i32(1).getInt(), 1000), $.itofix$i32$i32(Data.op_index$i32(2).getInt(), 1000), $.itofix$i32$i32(Data.op_index$i32(3).getInt(), Data.op_index$i32(4).getInt()));
    case 16:
      if (pForObj == null) {
        return null;
      }
      return new C4ValueProviderAction().init$pC4Object(pForObj);
    default:
      return null;
  }
}

export function $init(): void {
  $.C4ValueProviderConstID = new $.StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderConst(); $.C4ValueProviderConstID.init(S("const"));
  $.C4ValueProviderLinearID = new $.StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderLinear(); $.C4ValueProviderLinearID.init(S("linear"));
  $.C4ValueProviderXID = new $.StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderX(); $.C4ValueProviderXID.init(S("x"));
  $.C4ValueProviderYID = new $.StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderY(); $.C4ValueProviderYID.init(S("y"));
  $.C4ValueProviderRID = new $.StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderR(); $.C4ValueProviderRID.init(S("r"));
  $.C4ValueProviderAbsXID = new $.StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderAbsX(); $.C4ValueProviderAbsXID.init(S("absx"));
  $.C4ValueProviderAbsYID = new $.StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderAbsY(); $.C4ValueProviderAbsYID.init(S("absy"));
  $.C4ValueProviderDistID = new $.StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderDist(); $.C4ValueProviderDistID.init(S("dist"));
  $.C4ValueProviderXDirID = new $.StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderXDir(); $.C4ValueProviderXDirID.init(S("xdir"));
  $.C4ValueProviderYDirID = new $.StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderYDir(); $.C4ValueProviderYDirID.init(S("ydir"));
  $.C4ValueProviderRDirID = new $.StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderRDir(); $.C4ValueProviderRDirID.init(S("rdir"));
  $.C4ValueProviderAbsRDirID = new $.StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderAbsRDir(); $.C4ValueProviderAbsRDirID.init(S("absrdir"));
  $.C4ValueProviderCosRID = new $.StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderCosR(); $.C4ValueProviderCosRID.init(S("cosr"));
  $.C4ValueProviderSinRID = new $.StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderSinR(); $.C4ValueProviderSinRID.init(S("sinr"));
  $.C4ValueProviderCosVID = new $.StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderCosV(); $.C4ValueProviderCosVID.init(S("cosv"));
  $.C4ValueProviderSinVID = new $.StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderSinV(); $.C4ValueProviderSinVID.init(S("sinv"));
  $.C4ValueProviderActionID = new $.StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderAction(); $.C4ValueProviderActionID.init(S("action"));
}

Object.assign($, { C4ValueProviderAbsRDir, C4ValueProviderAbsX, C4ValueProviderAbsY, C4ValueProviderAction, C4ValueProviderConst, C4ValueProviderCosR, C4ValueProviderCosV, C4ValueProviderDist, C4ValueProviderLinear, C4ValueProviderR, C4ValueProviderRDir, C4ValueProviderRef$i32, C4ValueProviderSinR, C4ValueProviderSinV, C4ValueProviderX, C4ValueProviderXDir, C4ValueProviderY, C4ValueProviderYDir, CreateValueProviderFromArray });
