// @ts-nocheck
// OpenClonk 36de799: src/script/C4StringTable.cpp, src/script/C4StringTable.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $oadd, $oarr, $oat, $oidx, $padd, $peq, $rd, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $addr, $delete, $max, seq_sort } from '../../rt/std.ts';

export class C4RefCnt {
  RefCnt = 0;

  IncRef() {
    this.RefCnt = this.RefCnt + 1 >>> 0;
  }

  DecRef() {
    if (!((this.RefCnt = this.RefCnt - 1 >>> 0) !== 0)) {
      $delete(this);
    }
  }

  $clone() { return new C4RefCnt().$assign(this); }
  $assign(o) {
    this.RefCnt = o.RefCnt;
    return this;
  }
}

export class C4RefCntPointer$C4String {
  p = null;

  init$pC4String(p) {
    this.p = p;
    this.IncRef();
    return this;
  }

  $dtor() {
    this.DecRef();
  }

  op_arrow$v() {
    return this.p;
  }

  op_arrow$v$c() {
    return this.p;
  }

  op_C4String_() {
    return this.p;
  }

  op_const_C4String_() {
    return this.p;
  }

  IncRef() {
    if (this.p != null) {
      this.p.IncRef();
    }
  }

  DecRef() {
    if (this.p != null) {
      this.p.DecRef();
    }
  }

  $clone() { return new C4RefCntPointer$C4String().$assign(this); }
  $assign(o) {
    this.p = o.p;
    return this;
  }
}

export class C4Set$pC4PropList {
  Capacity = 0;
  Size = 0;
  Table = null;

  $clone() { return new C4Set$pC4PropList().$assign(this); }
  $assign(o) {
    this.Capacity = o.Capacity;
    this.Size = o.Size;
    this.Table = o.Table;
    return this;
  }
}

export class C4Set$pC4PropListNumbered {
  Capacity = 0;
  Size = 0;
  Table = null;

  GetPlaceFor(e) {
    let h = $.Hash$rpC4PropListNumbered(e);
    let p = $padd(this.Table, h % this.Capacity);
    while (p.a[p.o] != null && !C4Set$pC4PropListNumbered.Equals(p.a[p.o], e)) {
      p = $padd(this.Table, (h = h + 1 >>> 0) % this.Capacity);
    }
    return p;
  }

  AddInternal$mpC4PropListNumbered(e) {
    let p = this.GetPlaceFor(e);
    p.a[p.o] = e;
    return p;
  }

  ClearTable() {
    for (let i = 0; i < this.Capacity; i = i + 1 >>> 0) {
      this.Table.a[this.Table.o + i] = null;
    }
  }

  MaintainCapacity() {
    if (this.Capacity - this.Size >>> 0 < $max(2, this.Capacity / 4 >>> 0)) {
      let OCapacity = this.Capacity;
      this.Capacity = Math.imul(this.Capacity, 2) >>> 0;
      let OTable = this.Table;
      this.Table = P(new Array(this.Capacity).fill(null), 0);
      this.ClearTable();
      for (let i = 0; i < OCapacity; i = i + 1 >>> 0) {
        if (OTable.a[OTable.o + i] != null) {
          this.AddInternal$mpC4PropListNumbered(OTable.a[OTable.o + i]);
        }
      }
      $delete(OTable);
    }
  }

  static Equals(a, b) {
    return a === b;
  }

  init() {
    this.Capacity = 2;
    this.Size = 0;
    this.Table = P(new Array(this.Capacity).fill(null), 0);
    this.ClearTable();
    return this;
  }

  $dtor() {
    $delete(this.Table);
  }

  Get(e) {
    let h = $.Hash$i32(e);
    let r = $padd(this.Table, h % this.Capacity);
    while (r.a[r.o] != null && !$.Equals$rpC4PropListNumbered$i32(r.a[r.o], e)) {
      r = $padd(this.Table, (h = h + 1 >>> 0) % this.Capacity);
    }
    return r;
  }

  GetSize() {
    return this.Size;
  }

  Add$mpC4PropListNumbered(e) {
    this.MaintainCapacity();
    let r = this.AddInternal$mpC4PropListNumbered(e);
    this.Size = this.Size + 1 >>> 0;
    return r;
  }

  Remove(e) {
    let h = $.Hash$rpC4PropListNumbered(e);
    let r = $padd(this.Table, h % this.Capacity);
    while (r.a[r.o] != null && !C4Set$pC4PropListNumbered.Equals(r.a[r.o], e)) {
      r = $padd(this.Table, (h = h + 1 >>> 0) % this.Capacity);
    }
    0;
    r.a[r.o] = null;
    this.Size = this.Size - 1 >>> 0;
    while ($rd(r = $padd(this.Table, (h = h + 1 >>> 0) % this.Capacity)) != null) {
      let m = r.a[r.o];
      r.a[r.o] = null;
      this.AddInternal$mpC4PropListNumbered(m);
    }
  }

  First() {
    return this.Next($padd(this.Table, -1));
  }

  Next(p) {
    while (!$peq((p = p.add(1)), $padd(this.Table, this.Capacity))) {
      if (p.a[p.o] != null) {
        return p;
      }
    }
    return null;
  }

  $clone() { return new C4Set$pC4PropListNumbered().$assign(this); }
  $assign(o) {
    this.Capacity = o.Capacity;
    this.Size = o.Size;
    this.Table = o.Table;
    return this;
  }
}

export class C4Set$pC4PropListScript {
  Capacity = 0;
  Size = 0;
  Table = null;

  GetPlaceFor(e) {
    let h = C4Set$pC4PropListScript.Hash(e);
    let p = $padd(this.Table, h % this.Capacity);
    while (p.a[p.o] != null && !C4Set$pC4PropListScript.Equals(p.a[p.o], e)) {
      p = $padd(this.Table, (h = h + 1 >>> 0) % this.Capacity);
    }
    return p;
  }

  AddInternal$mpC4PropListScript(e) {
    let p = this.GetPlaceFor(e);
    p.a[p.o] = e;
    return p;
  }

  ClearTable() {
    for (let i = 0; i < this.Capacity; i = i + 1 >>> 0) {
      this.Table.a[this.Table.o + i] = null;
    }
  }

  MaintainCapacity() {
    if (this.Capacity - this.Size >>> 0 < $max(2, this.Capacity / 4 >>> 0)) {
      let OCapacity = this.Capacity;
      this.Capacity = Math.imul(this.Capacity, 2) >>> 0;
      let OTable = this.Table;
      this.Table = P(new Array(this.Capacity).fill(null), 0);
      this.ClearTable();
      for (let i = 0; i < OCapacity; i = i + 1 >>> 0) {
        if (OTable.a[OTable.o + i] != null) {
          this.AddInternal$mpC4PropListScript(OTable.a[OTable.o + i]);
        }
      }
      $delete(OTable);
    }
  }

  static Hash(e) {
    let hash = $addr(e);
    return Math.trunc(hash / 63) >>> 0;
  }

  static Equals(a, b) {
    return a === b;
  }

  init() {
    this.Capacity = 2;
    this.Size = 0;
    this.Table = P(new Array(this.Capacity).fill(null), 0);
    this.ClearTable();
    return this;
  }

  $dtor() {
    $delete(this.Table);
  }

  GetSize() {
    return this.Size;
  }

  Add$mpC4PropListScript(e) {
    this.MaintainCapacity();
    let r = this.AddInternal$mpC4PropListScript(e);
    this.Size = this.Size + 1 >>> 0;
    return r;
  }

  Remove(e) {
    let h = C4Set$pC4PropListScript.Hash(e);
    let r = $padd(this.Table, h % this.Capacity);
    while (r.a[r.o] != null && !C4Set$pC4PropListScript.Equals(r.a[r.o], e)) {
      r = $padd(this.Table, (h = h + 1 >>> 0) % this.Capacity);
    }
    0;
    r.a[r.o] = null;
    this.Size = this.Size - 1 >>> 0;
    while ($rd(r = $padd(this.Table, (h = h + 1 >>> 0) % this.Capacity)) != null) {
      let m = r.a[r.o];
      r.a[r.o] = null;
      this.AddInternal$mpC4PropListScript(m);
    }
  }

  First() {
    return this.Next($padd(this.Table, -1));
  }

  Next(p) {
    while (!$peq((p = p.add(1)), $padd(this.Table, this.Capacity))) {
      if (p.a[p.o] != null) {
        return p;
      }
    }
    return null;
  }

  $clone() { return new C4Set$pC4PropListScript().$assign(this); }
  $assign(o) {
    this.Capacity = o.Capacity;
    this.Size = o.Size;
    this.Table = o.Table;
    return this;
  }
}

export class C4Set$C4Property {
  Capacity = 0;
  Size = 0;
  Table = null;

  GetPlaceFor(e) {
    let h = $.Hash$C4Property(e);
    let p = $oadd(this.Table, h % this.Capacity);
    while (p.op_bool() && !C4Set$C4Property.Equals$C4Property$C4Property(p, e)) {
      p = $oadd(this.Table, (h = h + 1 >>> 0) % this.Capacity);
    }
    return p;
  }

  AddInternal$C4Property(e) {
    let p = this.GetPlaceFor(e);
    p.$assign(e);
    return p;
  }

  AddInternal$mC4Property(e) {
    let p = this.GetPlaceFor(e);
    p.op_assign$mC4Property(e);
    return p;
  }

  ClearTable() {
    for (let i = 0; i < this.Capacity; i = i + 1 >>> 0) {
      $oidx(this.Table, i).op_assign$mC4Property(new $.C4Property().init$v());
    }
  }

  MaintainCapacity() {
    if (this.Capacity - this.Size >>> 0 < $max(2, this.Capacity / 4 >>> 0)) {
      let OCapacity = this.Capacity;
      this.Capacity = Math.imul(this.Capacity, 2) >>> 0;
      let OTable = this.Table;
      this.Table = $oat($oarr(this.Capacity, () => new $.C4Property().init$v()), 0);
      this.ClearTable();
      for (let i = 0; i < OCapacity; i = i + 1 >>> 0) {
        if ($oidx(OTable, i).op_bool()) {
          this.AddInternal$mC4Property($oidx(OTable, i));
        }
      }
      $delete(OTable);
    }
  }

  static Hash(e) {
    return $.Hash$pC4String(e);
  }

  static Equals$C4Property$rpC4String(a, b) {
    return a.Key === b;
  }

  static Equals$C4Property$C4Property(a, b) {
    return a.Key === b.Key;
  }

  init() {
    this.Capacity = 2;
    this.Size = 0;
    this.Table = $oat($oarr(this.Capacity, () => new $.C4Property().init$v()), 0);
    this.ClearTable();
    return this;
  }

  $dtor() {
    $delete(this.Table);
  }

  CompileFunc(pComp, numbers$) {
    const numbers = [numbers$];
    let $t1;
    let fNaming = pComp.hasNaming();
    if (pComp.isDeserializer()) {
      this.Clear();
      const iSize = [0];
      if (!pComp.hasNaming()) {
        pComp.Value$ru32(P(iSize, 0));
      }
      do {
        if (!fNaming && !(($t1 = iSize[0], iSize[0] = iSize[0] - 1 >>> 0, $t1) !== 0)) {
          break;
        }
        try {
          let e = new $.C4Property().init$v();
          pComp.Value$StdParameterAdapt$C4Property$pC4ValueNumbers($.mkParAdapt$rC4Property$rpC4ValueNumbers(e, P(numbers, 0)));
          this.Add$C4Property(e);
        } catch ($e3) {
          if ($e3 instanceof $.StdCompiler$NotFoundException) {
            const pEx = $e3;
            $delete(pEx);
            break;
          } else {
            throw $e3;
          }
        }
      } while (pComp.Separator(1 /*SEP_SEP*/));
    } else {
      if (!fNaming) {
        const iSize = [this.GetSize() | 0];
        pComp.Value$ri32(P(iSize, 0));
      }
      let p = this.First();
      while (p != null) {
        pComp.Value$StdParameterAdapt$C4Property$pC4ValueNumbers($.mkParAdapt$rC4Property$rpC4ValueNumbers(p, P(numbers, 0)));
        p = this.Next(p);
        if (p != null) {
          pComp.Separator(1 /*SEP_SEP*/);
        }
      }
    }
  }

  Clear() {
    this.ClearTable();
    this.Size = 0;
  }

  Has(e) {
    let h = C4Set$C4Property.Hash(e);
    let r = $oadd(this.Table, h % this.Capacity);
    while (r.op_bool() && !C4Set$C4Property.Equals$C4Property$rpC4String(r, e)) {
      r = $oadd(this.Table, (h = h + 1 >>> 0) % this.Capacity);
    }
    return !!r.op_bool();
  }

  GetSize() {
    return this.Size;
  }

  Add$C4Property(e) {
    this.MaintainCapacity();
    let r = this.AddInternal$C4Property(e);
    this.Size = this.Size + 1 >>> 0;
    return r;
  }

  Add$mC4Property(e) {
    this.MaintainCapacity();
    let r = this.AddInternal$mC4Property(e);
    this.Size = this.Size + 1 >>> 0;
    return r;
  }

  First() {
    return this.Next($oadd(this.Table, -1));
  }

  Next(p) {
    while ((p = $oadd(p, 1)) !== $oadd(this.Table, this.Capacity)) {
      if (p.op_bool()) {
        return p;
      }
    }
    return null;
  }

  Swap(S2) {
    let Capacity2 = S2.Capacity;
    let Size2 = S2.Size;
    let Table2 = S2.Table;
    S2.Capacity = this.Capacity;
    S2.Size = this.Size;
    S2.Table = this.Table;
    this.Capacity = Capacity2;
    this.Size = Size2;
    this.Table = Table2;
  }

  static SortFunc(p1, p2) {
    return p1.op_lt(p2);
  }

  GetSortedListOfElementPointers() {
    let result = [];
    for (let p = this.First(); p != null; p = this.Next(p)) {
      result.push(p);
    }
    seq_sort(result, C4Set$C4Property.SortFunc);
    return result;
  }

  Get(e) {
    let h = C4Set$C4Property.Hash(e);
    let r = $oadd(this.Table, h % this.Capacity);
    while (r.op_bool() && !C4Set$C4Property.Equals$C4Property$rpC4String(r, e)) {
      r = $oadd(this.Table, (h = h + 1 >>> 0) % this.Capacity);
    }
    return r;
  }

  Get(e) {
    let h = $.Hash$pC4String(e);
    let r = $oadd(this.Table, h % this.Capacity);
    while (r.op_bool() && !$.Equals$C4Property$pC4String(r, e)) {
      r = $oadd(this.Table, (h = h + 1 >>> 0) % this.Capacity);
    }
    return r;
  }

  Has(e) {
    let h = $.Hash$pC4String(e);
    let r = $oadd(this.Table, h % this.Capacity);
    while (r.op_bool() && !$.Equals$C4Property$pC4String(r, e)) {
      r = $oadd(this.Table, (h = h + 1 >>> 0) % this.Capacity);
    }
    return !!r.op_bool();
  }

  Remove(e) {
    let h = C4Set$C4Property.Hash(e);
    let r = $oadd(this.Table, h % this.Capacity);
    while (r.op_bool() && !C4Set$C4Property.Equals$C4Property$rpC4String(r, e)) {
      r = $oadd(this.Table, (h = h + 1 >>> 0) % this.Capacity);
    }
    0;
    r.op_assign$mC4Property(new $.C4Property().init$v());
    this.Size = this.Size - 1 >>> 0;
    while ((r = $oadd(this.Table, (h = h + 1 >>> 0) % this.Capacity)).op_bool()) {
      let m = new $.C4Property().$copy(r);
      r.op_assign$mC4Property(new $.C4Property().init$v());
      this.AddInternal$mC4Property(m);
    }
  }

  $clone() { return new C4Set$C4Property().$assign(this); }
  $assign(o) {
    this.Capacity = o.Capacity;
    this.Size = o.Size;
    this.Table = o.Table;
    return this;
  }
}

export class C4Set$pC4String {
  Capacity = 0;
  Size = 0;
  Table = null;

  GetPlaceFor(e) {
    let h = Hash$rpC4String(e);
    let p = $padd(this.Table, h % this.Capacity);
    while (p.a[p.o] != null && !C4Set$pC4String.Equals(p.a[p.o], e)) {
      p = $padd(this.Table, (h = h + 1 >>> 0) % this.Capacity);
    }
    return p;
  }

  AddInternal$mpC4String(e) {
    let p = this.GetPlaceFor(e);
    p.a[p.o] = e;
    return p;
  }

  ClearTable() {
    for (let i = 0; i < this.Capacity; i = i + 1 >>> 0) {
      this.Table.a[this.Table.o + i] = null;
    }
  }

  MaintainCapacity() {
    if (this.Capacity - this.Size >>> 0 < $max(2, this.Capacity / 4 >>> 0)) {
      let OCapacity = this.Capacity;
      this.Capacity = Math.imul(this.Capacity, 2) >>> 0;
      let OTable = this.Table;
      this.Table = P(new Array(this.Capacity).fill(null), 0);
      this.ClearTable();
      for (let i = 0; i < OCapacity; i = i + 1 >>> 0) {
        if (OTable.a[OTable.o + i] != null) {
          this.AddInternal$mpC4String(OTable.a[OTable.o + i]);
        }
      }
      $delete(OTable);
    }
  }

  static Equals(a, b) {
    return a === b;
  }

  init() {
    this.Capacity = 2;
    this.Size = 0;
    this.Table = P(new Array(this.Capacity).fill(null), 0);
    this.ClearTable();
    return this;
  }

  $dtor() {
    $delete(this.Table);
  }

  Add$mpC4String(e) {
    this.MaintainCapacity();
    let r = this.AddInternal$mpC4String(e);
    this.Size = this.Size + 1 >>> 0;
    return r;
  }

  Get(e) {
    let h = Hash$pi8(e);
    let r = $padd(this.Table, h % this.Capacity);
    while (r.a[r.o] != null && !Equals$rpC4String$pi8(r.a[r.o], e)) {
      r = $padd(this.Table, (h = h + 1 >>> 0) % this.Capacity);
    }
    return r;
  }

  Remove(e) {
    let h = Hash$rpC4String(e);
    let r = $padd(this.Table, h % this.Capacity);
    while (r.a[r.o] != null && !C4Set$pC4String.Equals(r.a[r.o], e)) {
      r = $padd(this.Table, (h = h + 1 >>> 0) % this.Capacity);
    }
    0;
    r.a[r.o] = null;
    this.Size = this.Size - 1 >>> 0;
    while ($rd(r = $padd(this.Table, (h = h + 1 >>> 0) % this.Capacity)) != null) {
      let m = r.a[r.o];
      r.a[r.o] = null;
      this.AddInternal$mpC4String(m);
    }
  }

  $clone() { return new C4Set$pC4String().$assign(this); }
  $assign(o) {
    this.Capacity = o.Capacity;
    this.Size = o.Size;
    this.Table = o.Table;
    return this;
  }
}

export class C4StringTable {
  Set = new C4Set$pC4String().init();
  P = $oarr(249, () => new C4String().init$v());

  init() {
    this.Set = new C4Set$pC4String().init();
    this.P = $oarr(249, () => new C4String().init$v());
    this.P[0 /*P_Prototype*/].op_assign$pi8(S("Prototype"));
    this.P[1 /*P_Name*/].op_assign$pi8(S("Name"));
    this.P[2 /*P_Priority*/].op_assign$pi8(S("Priority"));
    this.P[3 /*P_Interval*/].op_assign$pi8(S("Interval"));
    this.P[4 /*P_CommandTarget*/].op_assign$pi8(S("CommandTarget"));
    this.P[5 /*P_Time*/].op_assign$pi8(S("Time"));
    this.P[6 /*P_Construction*/].op_assign$pi8(S("Construction"));
    this.P[7 /*P_Destruction*/].op_assign$pi8(S("Destruction"));
    this.P[8 /*P_Start*/].op_assign$pi8(S("Start"));
    this.P[9 /*P_Stop*/].op_assign$pi8(S("Stop"));
    this.P[10 /*P_Timer*/].op_assign$pi8(S("Timer"));
    this.P[11 /*P_Effect*/].op_assign$pi8(S("Effect"));
    this.P[12 /*P_Damage*/].op_assign$pi8(S("Damage"));
    this.P[13 /*P_Collectible*/].op_assign$pi8(S("Collectible"));
    this.P[14 /*P_Touchable*/].op_assign$pi8(S("Touchable"));
    this.P[15 /*P_ActMap*/].op_assign$pi8(S("ActMap"));
    this.P[23 /*P_Procedure*/].op_assign$pi8(S("Procedure"));
    this.P[24 /*P_Speed*/].op_assign$pi8(S("Speed"));
    this.P[25 /*P_Accel*/].op_assign$pi8(S("Accel"));
    this.P[26 /*P_Decel*/].op_assign$pi8(S("Decel"));
    this.P[16 /*P_Attach*/].op_assign$pi8(S("Attach"));
    this.P[27 /*P_Directions*/].op_assign$pi8(S("Directions"));
    this.P[28 /*P_FlipDir*/].op_assign$pi8(S("FlipDir"));
    this.P[29 /*P_Length*/].op_assign$pi8(S("Length"));
    this.P[30 /*P_Delay*/].op_assign$pi8(S("Delay"));
    this.P[31 /*P_X*/].op_assign$pi8(S("X"));
    this.P[32 /*P_Y*/].op_assign$pi8(S("Y"));
    this.P[33 /*P_x*/].op_assign$pi8(S("x"));
    this.P[34 /*P_y*/].op_assign$pi8(S("y"));
    this.P[35 /*P_Wdt*/].op_assign$pi8(S("Wdt"));
    this.P[36 /*P_Hgt*/].op_assign$pi8(S("Hgt"));
    this.P[37 /*P_wdt*/].op_assign$pi8(S("wdt"));
    this.P[38 /*P_hgt*/].op_assign$pi8(S("hgt"));
    this.P[39 /*P_Vertices*/].op_assign$pi8(S("Vertices"));
    this.P[40 /*P_Edges*/].op_assign$pi8(S("Edges"));
    this.P[41 /*P_LineWidth*/].op_assign$pi8(S("LineWidth"));
    this.P[42 /*P_OffX*/].op_assign$pi8(S("OffX"));
    this.P[43 /*P_OffY*/].op_assign$pi8(S("OffY"));
    this.P[44 /*P_Material*/].op_assign$pi8(S("Material"));
    this.P[46 /*P_Proplist*/].op_assign$pi8(S("Proplist"));
    this.P[45 /*P_proplist*/].op_assign$pi8(S("proplist"));
    this.P[47 /*P_FacetBase*/].op_assign$pi8(S("FacetBase"));
    this.P[48 /*P_FacetTopFace*/].op_assign$pi8(S("FacetTopFace"));
    this.P[49 /*P_FacetTargetStretch*/].op_assign$pi8(S("FacetTargetStretch"));
    this.P[50 /*P_NextAction*/].op_assign$pi8(S("NextAction"));
    this.P[51 /*P_Hold*/].op_assign$pi8(S("Hold"));
    this.P[52 /*P_Idle*/].op_assign$pi8(S("Idle"));
    this.P[53 /*P_NoOtherAction*/].op_assign$pi8(S("NoOtherAction"));
    this.P[54 /*P_StartCall*/].op_assign$pi8(S("StartCall"));
    this.P[55 /*P_EndCall*/].op_assign$pi8(S("EndCall"));
    this.P[56 /*P_AbortCall*/].op_assign$pi8(S("AbortCall"));
    this.P[57 /*P_PhaseCall*/].op_assign$pi8(S("PhaseCall"));
    this.P[58 /*P_Sound*/].op_assign$pi8(S("Sound"));
    this.P[59 /*P_ObjectDisabled*/].op_assign$pi8(S("ObjectDisabled"));
    this.P[60 /*P_DigFree*/].op_assign$pi8(S("DigFree"));
    this.P[61 /*P_InLiquidAction*/].op_assign$pi8(S("InLiquidAction"));
    this.P[62 /*P_TurnAction*/].op_assign$pi8(S("TurnAction"));
    this.P[63 /*P_Reverse*/].op_assign$pi8(S("Reverse"));
    this.P[64 /*P_Step*/].op_assign$pi8(S("Step"));
    this.P[67 /*P_Animation*/].op_assign$pi8(S("Animation"));
    this.P[68 /*P_Action*/].op_assign$pi8(S("Action"));
    this.P[17 /*P_Visibility*/].op_assign$pi8(S("Visibility"));
    this.P[18 /*P_Parallaxity*/].op_assign$pi8(S("Parallaxity"));
    this.P[19 /*P_LineColors*/].op_assign$pi8(S("LineColors"));
    this.P[20 /*P_LineAttach*/].op_assign$pi8(S("LineAttach"));
    this.P[65 /*P_MouseDrag*/].op_assign$pi8(S("MouseDrag"));
    this.P[66 /*P_MouseDragImage*/].op_assign$pi8(S("MouseDragImage"));
    this.P[21 /*P_PictureTransformation*/].op_assign$pi8(S("PictureTransformation"));
    this.P[22 /*P_MeshTransformation*/].op_assign$pi8(S("MeshTransformation"));
    this.P[69 /*P_BreatheWater*/].op_assign$pi8(S("BreatheWater"));
    this.P[70 /*P_CorrosionResist*/].op_assign$pi8(S("CorrosionResist"));
    this.P[71 /*P_MaxEnergy*/].op_assign$pi8(S("MaxEnergy"));
    this.P[72 /*P_MaxBreath*/].op_assign$pi8(S("MaxBreath"));
    this.P[73 /*P_ThrowSpeed*/].op_assign$pi8(S("ThrowSpeed"));
    this.P[74 /*P_Mode*/].op_assign$pi8(S("Mode"));
    this.P[75 /*P_CausedBy*/].op_assign$pi8(S("CausedBy"));
    this.P[76 /*P_Blasted*/].op_assign$pi8(S("Blasted"));
    this.P[77 /*P_IncineratingObj*/].op_assign$pi8(S("IncineratingObj"));
    this.P[78 /*P_Plane*/].op_assign$pi8(S("Plane"));
    this.P[79 /*P_BorderBound*/].op_assign$pi8(S("BorderBound"));
    this.P[80 /*P_ContactCalls*/].op_assign$pi8(S("ContactCalls"));
    this.P[81 /*P_SolidMaskPlane*/].op_assign$pi8(S("SolidMaskPlane"));
    this.P[82 /*P_Tooltip*/].op_assign$pi8(S("Tooltip"));
    this.P[83 /*P_Placement*/].op_assign$pi8(S("Placement"));
    this.P[84 /*P_ContainBlast*/].op_assign$pi8(S("ContainBlast"));
    this.P[85 /*P_BlastIncinerate*/].op_assign$pi8(S("BlastIncinerate"));
    this.P[86 /*P_ContactIncinerate*/].op_assign$pi8(S("ContactIncinerate"));
    this.P[87 /*P_MaterialIncinerate*/].op_assign$pi8(S("MaterialIncinerate"));
    this.P[88 /*P_Global*/].op_assign$pi8(S("Global"));
    this.P[89 /*P_Scenario*/].op_assign$pi8(S("Scenario"));
    this.P[90 /*P_JumpSpeed*/].op_assign$pi8(S("JumpSpeed"));
    this.P[91 /*P_BackgroundColor*/].op_assign$pi8(S("BackgroundColor"));
    this.P[92 /*P_Decoration*/].op_assign$pi8(S("Decoration"));
    this.P[93 /*P_Symbol*/].op_assign$pi8(S("Symbol"));
    this.P[94 /*P_Target*/].op_assign$pi8(S("Target"));
    this.P[95 /*P_Std*/].op_assign$pi8(S("Std"));
    this.P[96 /*P_Text*/].op_assign$pi8(S("Text"));
    this.P[97 /*P_GraphicsName*/].op_assign$pi8(S("GraphicsName"));
    this.P[99 /*P_OnClick*/].op_assign$pi8(S("OnClick"));
    this.P[100 /*P_OnMouseIn*/].op_assign$pi8(S("OnMouseIn"));
    this.P[101 /*P_OnMouseOut*/].op_assign$pi8(S("OnMouseOut"));
    this.P[102 /*P_OnClose*/].op_assign$pi8(S("OnClose"));
    this.P[98 /*P_ID*/].op_assign$pi8(S("ID"));
    this.P[103 /*P_Style*/].op_assign$pi8(S("Style"));
    this.P[104 /*P_Player*/].op_assign$pi8(S("Player"));
    this.P[105 /*P_Margin*/].op_assign$pi8(S("Margin"));
    this.P[106 /*P_Algo*/].op_assign$pi8(S("Algo"));
    this.P[107 /*P_Layer*/].op_assign$pi8(S("Layer"));
    this.P[108 /*P_Seed*/].op_assign$pi8(S("Seed"));
    this.P[109 /*P_Ratio*/].op_assign$pi8(S("Ratio"));
    this.P[110 /*P_FixedOffset*/].op_assign$pi8(S("FixedOffset"));
    this.P[111 /*P_Op*/].op_assign$pi8(S("Op"));
    this.P[112 /*P_R*/].op_assign$pi8(S("R"));
    this.P[113 /*P_Scale*/].op_assign$pi8(S("Scale"));
    this.P[114 /*P_Amplitude*/].op_assign$pi8(S("Amplitude"));
    this.P[115 /*P_Iterations*/].op_assign$pi8(S("Iterations"));
    this.P[116 /*P_Empty*/].op_assign$pi8(S("Empty"));
    this.P[117 /*P_Open*/].op_assign$pi8(S("Open"));
    this.P[118 /*P_Left*/].op_assign$pi8(S("Left"));
    this.P[119 /*P_Top*/].op_assign$pi8(S("Top"));
    this.P[120 /*P_Right*/].op_assign$pi8(S("Right"));
    this.P[121 /*P_Bottom*/].op_assign$pi8(S("Bottom"));
    this.P[122 /*P_Filter*/].op_assign$pi8(S("Filter"));
    this.P[123 /*P_ForceX*/].op_assign$pi8(S("ForceX"));
    this.P[124 /*P_ForceY*/].op_assign$pi8(S("ForceY"));
    this.P[125 /*P_G*/].op_assign$pi8(S("G"));
    this.P[126 /*P_B*/].op_assign$pi8(S("B"));
    this.P[127 /*P_Alpha*/].op_assign$pi8(S("Alpha"));
    this.P[128 /*P_DampingX*/].op_assign$pi8(S("DampingX"));
    this.P[129 /*P_DampingY*/].op_assign$pi8(S("DampingY"));
    this.P[130 /*P_Size*/].op_assign$pi8(S("Size"));
    this.P[131 /*P_Rotation*/].op_assign$pi8(S("Rotation"));
    this.P[132 /*P_BlitMode*/].op_assign$pi8(S("BlitMode"));
    this.P[133 /*P_Phase*/].op_assign$pi8(S("Phase"));
    this.P[134 /*P_Stretch*/].op_assign$pi8(S("Stretch"));
    this.P[135 /*P_CollisionVertex*/].op_assign$pi8(S("CollisionVertex"));
    this.P[136 /*P_CollisionDensity*/].op_assign$pi8(S("CollisionDensity"));
    this.P[137 /*P_OnCollision*/].op_assign$pi8(S("OnCollision"));
    this.P[138 /*P_Distance*/].op_assign$pi8(S("Distance"));
    this.P[139 /*P_Smoke*/].op_assign$pi8(S("Smoke"));
    this.P[140 /*P_Source*/].op_assign$pi8(S("Source"));
    this.P[141 /*P_Color*/].op_assign$pi8(S("Color"));
    this.P[142 /*P_EditCursorCommands*/].op_assign$pi8(S("EditCursorCommands"));
    this.P[143 /*P_IsPointContained*/].op_assign$pi8(S("IsPointContained"));
    this.P[144 /*P_GetRandomPoint*/].op_assign$pi8(S("GetRandomPoint"));
    this.P[145 /*P_Type*/].op_assign$pi8(S("Type"));
    this.P[146 /*P_Reverb_Density*/].op_assign$pi8(S("Reverb_Density"));
    this.P[147 /*P_Reverb_Diffusion*/].op_assign$pi8(S("Reverb_Diffusion"));
    this.P[148 /*P_Reverb_Gain*/].op_assign$pi8(S("Reverb_Gain"));
    this.P[149 /*P_Reverb_GainHF*/].op_assign$pi8(S("Reverb_GainHF"));
    this.P[150 /*P_Reverb_Decay_Time*/].op_assign$pi8(S("Reverb_Decay_Time"));
    this.P[151 /*P_Reverb_Decay_HFRatio*/].op_assign$pi8(S("Reverb_Decay_HFRatio"));
    this.P[152 /*P_Reverb_Reflections_Gain*/].op_assign$pi8(S("Reverb_Reflections_Gain"));
    this.P[153 /*P_Reverb_Reflections_Delay*/].op_assign$pi8(S("Reverb_Reflections_Delay"));
    this.P[154 /*P_Reverb_Late_Reverb_Gain*/].op_assign$pi8(S("Reverb_Late_Reverb_Gain"));
    this.P[155 /*P_Reverb_Late_Reverb_Delay*/].op_assign$pi8(S("Reverb_Late_Reverb_Delay"));
    this.P[156 /*P_Reverb_Air_Absorption_GainHF*/].op_assign$pi8(S("Reverb_Air_Absorption_GainHF"));
    this.P[157 /*P_Reverb_Room_Rolloff_Factor*/].op_assign$pi8(S("Reverb_Room_Rolloff_Factor"));
    this.P[158 /*P_Reverb_Decay_HFLimit*/].op_assign$pi8(S("Reverb_Decay_HFLimit"));
    this.P[159 /*P_Echo_Delay*/].op_assign$pi8(S("Echo_Delay"));
    this.P[160 /*P_Echo_LRDelay*/].op_assign$pi8(S("Echo_LRDelay"));
    this.P[161 /*P_Echo_Damping*/].op_assign$pi8(S("Echo_Damping"));
    this.P[162 /*P_Echo_Feedback*/].op_assign$pi8(S("Echo_Feedback"));
    this.P[163 /*P_Echo_Spread*/].op_assign$pi8(S("Echo_Spread"));
    this.P[164 /*P_Equalizer_Low_Gain*/].op_assign$pi8(S("Equalizer_Low_Gain"));
    this.P[165 /*P_Equalizer_Low_Cutoff*/].op_assign$pi8(S("Equalizer_Low_Cutoff"));
    this.P[166 /*P_Equalizer_Mid1_Gain*/].op_assign$pi8(S("Equalizer_Mid1_Gain"));
    this.P[167 /*P_Equalizer_Mid1_Center*/].op_assign$pi8(S("Equalizer_Mid1_Center"));
    this.P[168 /*P_Equalizer_Mid1_Width*/].op_assign$pi8(S("Equalizer_Mid1_Width"));
    this.P[169 /*P_Equalizer_Mid2_Gain*/].op_assign$pi8(S("Equalizer_Mid2_Gain"));
    this.P[170 /*P_Equalizer_Mid2_Center*/].op_assign$pi8(S("Equalizer_Mid2_Center"));
    this.P[171 /*P_Equalizer_Mid2_Width*/].op_assign$pi8(S("Equalizer_Mid2_Width"));
    this.P[172 /*P_Equalizer_High_Gain*/].op_assign$pi8(S("Equalizer_High_Gain"));
    this.P[173 /*P_Equalizer_High_Cutoff*/].op_assign$pi8(S("Equalizer_High_Cutoff"));
    this.P[174 /*P_LightOffset*/].op_assign$pi8(S("LightOffset"));
    this.P[175 /*P_PlayList*/].op_assign$pi8(S("PlayList"));
    this.P[176 /*P_MusicBreakMin*/].op_assign$pi8(S("MusicBreakMin"));
    this.P[177 /*P_MusicBreakMax*/].op_assign$pi8(S("MusicBreakMax"));
    this.P[178 /*P_MusicBreakChance*/].op_assign$pi8(S("MusicBreakChance"));
    this.P[179 /*P_MusicMaxPositionMemory*/].op_assign$pi8(S("MusicMaxPositionMemory"));
    this.P[180 /*P_InflameLandscape*/].op_assign$pi8(S("InflameLandscape"));
    this.P[181 /*P_OptionKey*/].op_assign$pi8(S("OptionKey"));
    this.P[182 /*P_ValueKey*/].op_assign$pi8(S("ValueKey"));
    this.P[183 /*P_Value*/].op_assign$pi8(S("Value"));
    this.P[184 /*P_DefaultValueFunction*/].op_assign$pi8(S("DefaultValueFunction"));
    this.P[185 /*P_Delegate*/].op_assign$pi8(S("Delegate"));
    this.P[186 /*P_VertexDelegate*/].op_assign$pi8(S("VertexDelegate"));
    this.P[187 /*P_EdgeDelegate*/].op_assign$pi8(S("EdgeDelegate"));
    this.P[188 /*P_HorizontalFix*/].op_assign$pi8(S("HorizontalFix"));
    this.P[189 /*P_VerticalFix*/].op_assign$pi8(S("VerticalFix"));
    this.P[190 /*P_StructureFix*/].op_assign$pi8(S("StructureFix"));
    this.P[191 /*P_OnUpdate*/].op_assign$pi8(S("OnUpdate"));
    this.P[192 /*P_EditorPropertyChanged*/].op_assign$pi8(S("EditorPropertyChanged"));
    this.P[193 /*P_Min*/].op_assign$pi8(S("Min"));
    this.P[194 /*P_Max*/].op_assign$pi8(S("Max"));
    this.P[195 /*P_Set*/].op_assign$pi8(S("Set"));
    this.P[196 /*P_SetGlobal*/].op_assign$pi8(S("SetGlobal"));
    this.P[197 /*P_SetRoot*/].op_assign$pi8(S("SetRoot"));
    this.P[198 /*P_Options*/].op_assign$pi8(S("Options"));
    this.P[199 /*P_Key*/].op_assign$pi8(S("Key"));
    this.P[200 /*P_AsyncGet*/].op_assign$pi8(S("AsyncGet"));
    this.P[201 /*P_Get*/].op_assign$pi8(S("Get"));
    this.P[202 /*P_Relative*/].op_assign$pi8(S("Relative"));
    this.P[203 /*P_CanMoveCenter*/].op_assign$pi8(S("CanMoveCenter"));
    this.P[204 /*P_StartFromObject*/].op_assign$pi8(S("StartFromObject"));
    this.P[205 /*P_Storage*/].op_assign$pi8(S("Storage"));
    this.P[206 /*P_Elements*/].op_assign$pi8(S("Elements"));
    this.P[207 /*P_EditOnSelection*/].op_assign$pi8(S("EditOnSelection"));
    this.P[208 /*P_EditorProps*/].op_assign$pi8(S("EditorProps"));
    this.P[209 /*P_DefaultEditorProp*/].op_assign$pi8(S("DefaultEditorProp"));
    this.P[210 /*P_EditorActions*/].op_assign$pi8(S("EditorActions"));
    this.P[211 /*P_CopyDefault*/].op_assign$pi8(S("CopyDefault"));
    this.P[212 /*P_Display*/].op_assign$pi8(S("Display"));
    this.P[213 /*P_DefaultValue*/].op_assign$pi8(S("DefaultValue"));
    this.P[214 /*P_DefinitionPriority*/].op_assign$pi8(S("DefinitionPriority"));
    this.P[215 /*P_Group*/].op_assign$pi8(S("Group"));
    this.P[216 /*P_Command*/].op_assign$pi8(S("Command"));
    this.P[217 /*P_Select*/].op_assign$pi8(S("Select"));
    this.P[218 /*P_DescendPath*/].op_assign$pi8(S("DescendPath"));
    this.P[219 /*P_EmptyName*/].op_assign$pi8(S("EmptyName"));
    this.P[220 /*P_ShortName*/].op_assign$pi8(S("ShortName"));
    this.P[221 /*P_EditorHelp*/].op_assign$pi8(S("EditorHelp"));
    this.P[222 /*P_Description*/].op_assign$pi8(S("Description"));
    this.P[223 /*P_AllowEditing*/].op_assign$pi8(S("AllowEditing"));
    this.P[224 /*P_EditorInitialize*/].op_assign$pi8(S("EditorInitialize"));
    this.P[225 /*P_EditorPlacementLimit*/].op_assign$pi8(S("EditorPlacementLimit"));
    this.P[226 /*P_EditorCollection*/].op_assign$pi8(S("EditorCollection"));
    this.P[227 /*P_Sorted*/].op_assign$pi8(S("Sorted"));
    this.P[228 /*P_Uniforms*/].op_assign$pi8(S("Uniforms"));
    this.P[229 /*P_ForceSerialization*/].op_assign$pi8(S("ForceSerialization"));
    this.P[230 /*P_DrawArrows*/].op_assign$pi8(S("DrawArrows"));
    this.P[231 /*P_SCENPAR*/].op_assign$pi8(S("SCENPAR"));
    this.P[232 /*P_Translatable*/].op_assign$pi8(S("Translatable"));
    this.P[233 /*P_Function*/].op_assign$pi8(S("Function"));
    this.P[234 /*P_Translate*/].op_assign$pi8(S("Translate"));
    this.P[235 /*DFA_WALK*/].op_assign$pi8(S("WALK"));
    this.P[236 /*DFA_FLIGHT*/].op_assign$pi8(S("FLIGHT"));
    this.P[237 /*DFA_KNEEL*/].op_assign$pi8(S("KNEEL"));
    this.P[238 /*DFA_SCALE*/].op_assign$pi8(S("SCALE"));
    this.P[239 /*DFA_HANGLE*/].op_assign$pi8(S("HANGLE"));
    this.P[240 /*DFA_DIG*/].op_assign$pi8(S("DIG"));
    this.P[241 /*DFA_SWIM*/].op_assign$pi8(S("SWIM"));
    this.P[242 /*DFA_THROW*/].op_assign$pi8(S("THROW"));
    this.P[243 /*DFA_PUSH*/].op_assign$pi8(S("PUSH"));
    this.P[244 /*DFA_LIFT*/].op_assign$pi8(S("LIFT"));
    this.P[245 /*DFA_FLOAT*/].op_assign$pi8(S("FLOAT"));
    this.P[246 /*DFA_ATTACH*/].op_assign$pi8(S("ATTACH"));
    this.P[247 /*DFA_CONNECT*/].op_assign$pi8(S("CONNECT"));
    this.P[248 /*DFA_PULL*/].op_assign$pi8(S("PULL"));
    for (const i of this.P) {
      0;
      i.IncRef();
    }
    return this;
  }

  $dtor() {
    0;
  }

  RegString$StdStrBuf(String_) {
    let s = this.FindString(String_.getData());
    if (s != null) {
      return s;
    } else {
      return new C4String().init$StdStrBuf(new $.StdStrBuf().init$rStdStrBuf$b(String_));
    }
  }

  RegString$pi8(s) {
    return this.RegString$StdStrBuf(new $.StdStrBuf().init$pi8$b(s));
  }

  FindString(strString) {
    return $rd(this.Set.Get(strString));
  }

  $clone() { return new C4StringTable().$assign(this); }
  $assign(o) {
    this.Set.$assign(o.Set);
    this.P = o.P.slice();
    return this;
  }
}

export class C4String extends C4RefCnt {
  Hash = 0;
  Data = new $.StdCopyStrBuf();

  init$StdStrBuf(strString) {
    this.Data = new $.StdCopyStrBuf();
    this.Data.Take$mStdStrBuf(strString);
    this.Hash = Hash$pi8(this.Data.getData());
    $.Strings.Set.Add$mpC4String(this);
    return this;
  }

  init$v() {
    this.Data = new $.StdCopyStrBuf();
    return this;
  }

  op_assign$pi8(s) {
    0;
    0;
    this.Data.Ref$pi8(s);
    this.Hash = Hash$pi8(this.Data.getData());
    $.Strings.Set.Add$mpC4String(this);
  }

  $dtor() {
    $.Strings.Set.Remove(this);
  }

  GetCStr() {
    return this.Data.getData();
  }

  GetData() {
    return this.Data.getRef();
  }

  $clone() { return new C4String().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Hash = o.Hash;
    this.Data.$assign(o.Data);
    return this;
  }
}

export function Hash$pi8(s) {
  let $t1;
  let h = 0x811c9dc5;
  let p = s;
  while (p.a[p.o] !== 0) {
    h = Math.imul((h ^ $rd(($t1 = p, p = p.add(1), $t1)) >>> 0) >>> 0, 0x1000193) >>> 0;
  }
  return h;
}

export function Equals$rpC4String$pi8(a, b) {
  return a.GetData().op_eq$pi8(b);
}

export function Hash$pC4String$2(e) {
  return e.Hash;
}

export function Hash$rpC4String(e) {
  return e.Hash;
}

export function $init(): void {
}

Object.assign($, { C4RefCnt, C4RefCntPointer$C4String, C4Set$C4Property, C4Set$pC4PropList, C4Set$pC4PropListNumbered, C4Set$pC4PropListScript, C4Set$pC4String, C4String, C4StringTable, Equals$rpC4String$pi8, Hash$pC4String$2, Hash$pi8, Hash$rpC4String });
