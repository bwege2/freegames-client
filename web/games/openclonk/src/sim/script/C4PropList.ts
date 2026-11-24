// @ts-nocheck
// OpenClonk 36de799: src/script/C4PropList.cpp, src/script/C4PropList.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $u64n } from '../../rt/int.ts';
import { c$strcmp } from '../../rt/libc.ts';
import { $oat, $oi, $rd, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $begin, $delete, $end, $fill_from, $max, $reserve, $throw, $vpush, HashSet, StdSet, StdString, seq_assign, std_sort } from '../../rt/std.ts';

export class C4Property {
  Key = null;
  Value = new $.C4Value().init$v();

  init$v() {
    this.Key = null;
    this.Value = new $.C4Value().init$v();
    return this;
  }

  init$pC4String$C4Value(Key, Value) {
    this.Key = Key;
    this.Value = new $.C4Value().$copy(Value);
    0;
    Key.IncRef();
    return this;
  }

  op_assign$mC4Property(o) {
    if (this.Key != null) {
      this.Key.DecRef();
    }
    this.Key = o.Key;
    o.Key = null;
    this.Value.$assign(o.Value);
    return this;
  }

  $dtor() {
    if (this.Key != null) {
      this.Key.DecRef();
    }
  }

  CompileFunc(pComp, numbers$) {
    const numbers = [numbers$];
    let s = new $.StdStrBuf();
    if (!pComp.isDeserializer()) {
      s.$assign(this.Key.GetData());
    }
    pComp.Value$rStdStrBuf(s);
    if (pComp.isDeserializer()) {
      if (this.Key != null) {
        this.Key.DecRef();
      }
      this.Key = $.Strings.RegString$StdStrBuf(new $.StdStrBuf().init$rStdStrBuf$b(s));
      this.Key.IncRef();
    }
    pComp.Separator(3 /*SEP_SET*/);
    pComp.Value$StdParameterAdapt$C4Value$pC4ValueNumbers($.mkParAdapt$rC4Value$rpC4ValueNumbers(this.Value, P(numbers, 0)));
  }

  op_bool() {
    return this.Key != null;
  }

  op_lt(cmp) {
    return c$strcmp(this.GetSafeKey(), cmp.GetSafeKey()) < 0;
  }

  GetSafeKey() {
    if (this.Key != null && this.Key.GetCStr() != null) {
      return this.Key.GetCStr();
    }
    return S("");
  }

  $copy(o) {
    this.Key = o.Key;
    this.Value = new $.C4Value().$copy(o.Value);
    if (this.Key != null) {
      this.Key.IncRef();
    }
    return this;
  }
  $clone() { return new C4Property().$copy(this); }
  $assign(o) {
    if (o.Key != null) {
      o.Key.IncRef();
    }
    if (this.Key != null) {
      this.Key.DecRef();
    }
    this.Key = o.Key;
    this.Value.$assign(o.Value);
    return this;
  }
}

export class C4PropList {
  Refs = new HashSet();
  Properties = new $.C4Set$C4Property().init();
  prototype = new $.C4Value().init$v();
  constant = false;
  Status = 1;

  Clear() {
    this.constant = false;
    this.Properties.Clear();
    this.prototype.Set0();
  }

  GetName() {
    let s = this.GetPropertyStr(1 /*P_Name*/);
    if (s == null) {
      return S("");
    }
    return s.GetCStr();
  }

  SetName(NewName = null) {
    if (NewName == null) {
      this.ResetProperty($oat($.Strings.P, 1 /*P_Name*/));
    } else {
      this.SetProperty(1 /*P_Name*/, $.C4VString$pi8(NewName));
    }
  }

  SetOnFire(_OnFire) {
  }

  GetDef$v$c() {
    if (this.GetPrototype() != null) {
      return this.GetPrototype().GetDef$v();
    }
    return null;
  }

  GetDef$v() {
    if (this.GetPrototype() != null) {
      return this.GetPrototype().GetDef$v();
    }
    return null;
  }

  GetObject$v() {
    if (this.GetPrototype() != null) {
      return this.GetPrototype().GetObject$v();
    }
    return null;
  }

  GetObject$v$c() {
    if (this.GetPrototype() != null) {
      return this.GetPrototype().GetObject$v();
    }
    return null;
  }

  GetEffect() {
    if (this.GetPrototype() != null) {
      return this.GetPrototype().GetEffect();
    }
    return null;
  }

  GetPropListNumbered() {
    if (this.GetPrototype() != null) {
      return this.GetPrototype().GetPropListNumbered();
    }
    return null;
  }

  GetMapScriptLayer() {
    if (this.GetPrototype() != null) {
      return this.GetPrototype().GetMapScriptLayer();
    }
    return null;
  }

  GetMapScriptMap() {
    if (this.GetPrototype() != null) {
      return this.GetPrototype().GetMapScriptMap();
    }
    return null;
  }

  GetPrototype() {
    return this.prototype._getPropList();
  }

  RemoveCyclicPrototypes() {
    for (let it = this.prototype.getPropList(); it != null; it = it.prototype.getPropList()) {
      if (it === this) {
        this.prototype.Set0();
      }
    }
  }

  IsStatic$v() {
    return null;
  }

  IsStatic$v$c() {
    return this.IsStatic$v();
  }

  IsNumbered() {
    return false;
  }

  Delete() {
    return false;
  }

  GetPropertyByS(k, pResult) {
    if (this.Properties.Has$2(k)) {
      pResult.$assign(this.Properties.Get$2(k).Value);
      return true;
    } else if (k === $oat($.Strings.P, 0 /*P_Prototype*/)) {
      pResult.$assign(this.prototype);
      return true;
    } else if (this.GetPrototype() != null) {
      return this.GetPrototype().GetPropertyByS(k, pResult);
    } else {
      return false;
    }
  }

  GetProperties() {
    let $t1;
    let a = null;
    let i = 0;
    let hasInheritedProperties = this.GetPrototype() != null;
    if (hasInheritedProperties) {
      a = this.GetPrototype().GetProperties();
      i = a.GetSize();
      a.SetSize((i >>> 0) + this.Properties.GetSize() >>> 0 | 0);
    } else {
      a = new $.C4ValueArray().init$i32(this.Properties.GetSize() | 0);
      i = 0;
    }
    let p = this.Properties.First();
    while (p != null) {
      let newPropertyName = p.Key;
      0;
      let skipProperty = false;
      if (hasInheritedProperties) {
        for (let j = 0; j < $u64n(i); j = j + 1) {
          if (a.op_index$i32(j | 0).getStr() !== newPropertyName) {
            continue;
          }
          skipProperty = true;
          break;
        }
      }
      if (!skipProperty) {
        a.op_index$i32(($t1 = i, i = i + 1 | 0, $t1)).$assign($.C4VString$pC4String(newPropertyName));
        0;
      }
      p = this.Properties.Next(p);
    }
    if (hasInheritedProperties) {
      a.SetSize(i);
    }
    return a;
  }

  SetPropertyByS(k, to) {
    0;
    if (k === $oat($.Strings.P, 0 /*P_Prototype*/)) {
      let newpt = to.getPropList();
      for (let it = newpt; it != null; it = it.GetPrototype()) {
        if (it === this) {
          $throw(new $.C4AulExecError().init(S("Trying to create cyclic prototype structure")));
        }
      }
      this.prototype.SetPropList(newpt);
    } else if (this.Properties.Has(k)) {
      this.Properties.Get(k).Value.$assign(to);
    } else {
      this.Properties.Add$mC4Property(new C4Property().init$pC4String$C4Value(k, to));
    }
  }

  ResetProperty(k) {
    if (k === $oat($.Strings.P, 0 /*P_Prototype*/)) {
      this.prototype.Set0();
    } else {
      this.Properties.Remove(k);
    }
  }

  GetProperty(k, pResult) {
    return this.GetPropertyByS($oat($.Strings.P, k), pResult);
  }

  GetPropertyStr(n) {
    let k = $oat($.Strings.P, n);
    if (this.Properties.Has(k)) {
      return this.Properties.Get(k).Value.getStr();
    }
    if (this.GetPrototype() != null) {
      return this.GetPrototype().GetPropertyStr(n);
    }
    return null;
  }

  GetPropertyArray(n) {
    let k = $oat($.Strings.P, n);
    if (this.Properties.Has(k)) {
      return this.Properties.Get(k).Value.getArray();
    }
    if (this.GetPrototype() != null) {
      return this.GetPrototype().GetPropertyArray(n);
    }
    return null;
  }

  GetFunc$i32(k) {
    return this.GetFunc$pC4String($oat($.Strings.P, k));
  }

  GetFunc$pC4String(k) {
    0;
    if (this.Properties.Has(k)) {
      return this.Properties.Get(k).Value.getFunction();
    }
    if (this.GetPrototype() != null) {
      return this.GetPrototype().GetFunc$pC4String(k);
    }
    return null;
  }

  GetFunc$pi8(s) {
    0;
    if (s.a[s.o + 0] === 126) {
      s = s.add(1);
    }
    let k = $.Strings.FindString(s);
    if (k == null) {
      return null;
    }
    return this.GetFunc$pC4String(k);
  }

  EnumerateOwnFuncs(prev = null) {
    let p = prev != null ? this.Properties.Next(this.Properties.Get(prev)) : this.Properties.First();
    while (p != null) {
      if (p.Value.getFunction() != null) {
        return p.Key;
      }
      p = this.Properties.Next(p);
    }
    return null;
  }

  Call$i32$pC4AulParSet$b(k, pPars = null, fPassErrors = false) {
    return this.Call$pC4String$pC4AulParSet$b($oat($.Strings.P, k), pPars, fPassErrors);
  }

  Call$pC4String$pC4AulParSet$b(k, Pars = null, fPassErrors = false) {
    if (this.Status === 0) {
      return new $.C4Value().init$v();
    }
    let pFn = this.GetFunc$pC4String(k);
    if (pFn == null) {
      return new $.C4Value().init$v();
    }
    return pFn.Exec$pC4PropList$pC4AulParSet$b(this, Pars, fPassErrors);
  }

  Call$pi8$pC4AulParSet$b(s, Pars = null, fPassErrors = false) {
    if (this.Status === 0) {
      return new $.C4Value().init$v();
    }
    0;
    let pFn = this.GetFunc$pi8(s);
    if (pFn == null) {
      if (s.a[s.o + 0] !== 126) {
        let err = new $.C4AulExecError().init($.FormatString(S("Undefined function: %s"), s).getData());
        if (fPassErrors) {
          $throw(err.$clone());
        }
        $.ScriptEngine.GetErrorHandler().OnError(err.what());
      }
      return new $.C4Value().init$v();
    }
    return pFn.Exec$pC4PropList$pC4AulParSet$b(this, Pars, fPassErrors);
  }

  GetPropertyP(n) {
    let k = $oat($.Strings.P, n);
    if (this.Properties.Has(k)) {
      let v = this.Properties.Get(k).Value.getStr();
      if ($oi(v) >= $oi($oat($.Strings.P, 0)) && $oi(v) < $oi($oat($.Strings.P, 249 /*P_LAST*/))) {
        return v.$i - $oat($.Strings.P, 0).$i | 0;
      }
      return 249 /*P_LAST*/;
    }
    if (this.GetPrototype() != null) {
      return this.GetPrototype().GetPropertyP(n);
    }
    return 249 /*P_LAST*/;
  }

  GetPropertyBool(n, default_val = false) {
    let k = $oat($.Strings.P, n);
    if (this.Properties.Has(k)) {
      return this.Properties.Get(k).Value.getBool() ? 1 : 0;
    }
    if (this.GetPrototype() != null) {
      return this.GetPrototype().GetPropertyBool(n, default_val);
    }
    return default_val ? 1 : 0;
  }

  GetPropertyInt(n, default_val = 0) {
    let k = $oat($.Strings.P, n);
    if (this.Properties.Has(k)) {
      return this.Properties.Get(k).Value.getInt();
    }
    if (this.GetPrototype() != null) {
      return this.GetPrototype().GetPropertyInt(n, default_val);
    }
    return default_val;
  }

  GetPropertyPropList(n) {
    let k = $oat($.Strings.P, n);
    if (this.Properties.Has(k)) {
      return this.Properties.Get(k).Value.getPropList();
    }
    if (this.GetPrototype() != null) {
      return this.GetPrototype().GetPropertyPropList(n);
    }
    return null;
  }

  HasProperty(k) {
    return this.Properties.Has(k);
  }

  SetProperty(k, to) {
    this.SetPropertyByS($oat($.Strings.P, k), to);
  }

  static New$pC4PropList(prototype = null) {
    let r = new C4PropListScript().init(prototype);
    return r;
  }

  static NewStatic(prototype, parent, key) {
    return new C4PropListStatic().init(prototype, parent, key);
  }

  Freeze() {
    this.constant = true;
  }

  Thaw() {
    this.constant = false;
  }

  ThawRecursively() {
    this.Thaw();
    let prop_names = this.GetUnsortedProperties(null, $.ScriptEngine.GetPropList());
    for (const prop_name of prop_names) {
      let child_val = new $.C4Value().init$v();
      this.GetPropertyByS(prop_name, child_val);
      let child_proplist = child_val.getPropList();
      if (child_proplist != null && child_proplist.IsFrozen()) {
        child_proplist.ThawRecursively();
      }
    }
  }

  IsFrozen() {
    return this.constant;
  }

  FreezeAndMakeStaticRecursively(prop_lists, parent = null, key = null) {
    this.Freeze();
    let this_static = this.IsStatic$v();
    if (this_static == null) {
      this_static = C4PropList.NewStatic(this.GetPrototype(), parent, key);
      this_static.Properties.Swap(this.Properties);
      this_static.Status = this.Status;
      let pre_freeze_refs = this.Refs.$clone();
      let holder = $.C4VPropList(this);
      for (const ref of pre_freeze_refs) {
        ref.SetPropList(this_static);
      }
      if (prop_lists != null) {
        $vpush(prop_lists, $.C4VPropList(this_static));
      }
    }
    let prop_names = this_static.GetSortedLocalProperties$b(false);
    for (const prop_name of prop_names) {
      let child_val = new $.C4Value().init$v();
      this_static.GetPropertyByS(prop_name, child_val);
      let child_proplist = child_val.getPropList();
      if (child_proplist != null) {
        let child_static = child_proplist.IsStatic$v();
        if (child_static == null || child_static.GetParent() === this_static && child_static.GetParentKeyName() === prop_name) {
          child_proplist.FreezeAndMakeStaticRecursively(prop_lists, this_static, prop_name);
        }
      }
    }
    return this_static;
  }

  Denumerate(numbers) {
    let p = this.Properties.First();
    while (p != null) {
      p.Value.Denumerate(numbers);
      p = this.Properties.Next(p);
    }
    this.prototype.Denumerate(numbers);
    this.RemoveCyclicPrototypes();
  }

  $dtor() {
    for (const Ref of this.Refs) {
      Ref.Data.op_assign(null);
      Ref.Type = 0 /*C4V_Nil*/;
    }
    this.Refs.clear();
    0;
  }

  CompileFunc$pStdCompiler$pC4ValueNumbers(pComp, numbers$) {
    const numbers = [numbers$];
    let oldFormat = false;
    0;
    if (pComp.isDeserializer() && pComp.hasNaming()) {
      try {
        pComp.Value$rb(P(this, "constant"));
        oldFormat = true;
      } catch ($e2) {
        if ($e2 instanceof $.StdCompiler$NotFoundException) {
          const pEx = $e2;
          $delete(pEx);
          pComp.Value$StdParameterAdapt$C4Value$pC4ValueNumbers($.mkParAdapt$rC4Value$rpC4ValueNumbers(this.prototype, P(numbers, 0)));
        } else {
          throw $e2;
        }
      }
    } else {
      pComp.Value$StdParameterAdapt$C4Value$pC4ValueNumbers($.mkParAdapt$rC4Value$rpC4ValueNumbers(this.prototype, P(numbers, 0)));
    }
    pComp.Separator(2 /*SEP_SEP2*/);
    pComp.Value$StdParameterAdapt$C4Set$C4Property$pC4ValueNumbers($.mkParAdapt$rC4Set$C4Property$rpC4ValueNumbers(this.Properties, P(numbers, 0)));
    if (oldFormat) {
      if (this.Properties.Has($oat($.Strings.P, 0 /*P_Prototype*/))) {
        this.prototype.$assign(this.Properties.Get($oat($.Strings.P, 0 /*P_Prototype*/)).Value);
        this.Properties.Remove($oat($.Strings.P, 0 /*P_Prototype*/));
      }
    }
  }

  AppendDataString(out, delim, depth = 3, ignore_reference_parent = false) {
    const DataString = out;
    if (depth <= 0 && this.Properties.GetSize() !== 0) {
      DataString.Append$pi8(S("..."));
      return;
    }
    let has_elements = false;
    if (this.prototype.op_const_void_() != null) {
      DataString.Append$pi8(S("Prototype = "));
      DataString.Append$StdStrBuf(this.prototype.GetDataString(depth - 1 | 0, ignore_reference_parent ? this.IsStatic$v$c() : null));
      has_elements = true;
    }
    let sorted_props = this.Properties.GetSortedListOfElementPointers();
    for (let p = $begin(sorted_props); !p.eq($end(sorted_props)); p.inc()) {
      if (has_elements) {
        DataString.Append$pi8(delim);
      }
      DataString.Append$StdStrBuf(p.v.Key.GetData());
      DataString.Append$pi8(S(" = "));
      DataString.Append$StdStrBuf(p.v.Value.GetDataString(depth - 1 | 0, ignore_reference_parent ? this.IsStatic$v$c() : null));
      has_elements = true;
    }
  }

  ToJSON(depth = 10, ignore_reference_parent = false) {
    if (depth <= 0 && this.Properties.GetSize() !== 0) {
      $throw(new $.C4JSONSerializationError().init(StdString.of(S("maximum depth reached"))));
    }
    let DataString = new $.StdStrBuf();
    $.StdStrBuf.prototype.op_assign$pi8.call(DataString, S("{"));
    let has_elements = false;
    if (this.prototype.op_const_void_() != null) {
      DataString.Append$pi8(S("Prototype:"));
      DataString.Append$StdStrBuf(this.prototype.ToJSON(depth - 1 | 0, ignore_reference_parent ? this.IsStatic$v$c() : null));
      has_elements = true;
    }
    let sorted_props = this.Properties.GetSortedListOfElementPointers();
    for (let p = $begin(sorted_props); !p.eq($end(sorted_props)); p.inc()) {
      if (has_elements) {
        DataString.Append$pi8(S(","));
      }
      DataString.Append$StdStrBuf(new $.C4Value().init$pC4String(p.v.Key).ToJSON());
      DataString.Append$pi8(S(":"));
      DataString.Append$StdStrBuf(p.v.Value.ToJSON(depth - 1 | 0, ignore_reference_parent ? this.IsStatic$v$c() : null));
      has_elements = true;
    }
    DataString.Append$pi8(S("}"));
    return DataString;
  }

  GetSortedLocalProperties$b(add_prototype = true) {
    let sorted_props = this.Properties.GetSortedListOfElementPointers();
    let result = [];
    $reserve(result, sorted_props.length + (add_prototype ? 1 : 0));
    if (add_prototype) {
      result.push($oat($.Strings.P, 0 /*P_Prototype*/));
    }
    for (const p of sorted_props) {
      result.push(p.Key);
    }
    return result;
  }

  GetSortedLocalProperties$pi8$pC4PropList(prefix, ignore_overridden) {
    let result = [];
    for (let pp = this.Properties.First(); pp != null; pp = this.Properties.Next(pp)) {
      if (pp.Key !== $oat($.Strings.P, 0 /*P_Prototype*/)) {
        if (prefix == null || pp.Key.GetData().BeginsWith(prefix)) {
          let check = ignore_overridden;
          let overridden = false;
          if (check != null && check !== this) {
            if (check.HasProperty(pp.Key)) {
              overridden = true;
              break;
            }
            check = check.GetPrototype();
          }
          result.push(pp.Key);
        }
      }
    }
    std_sort($begin(result), $end(result), ((a, b) => {
  return c$strcmp(a.GetCStr(), b.GetCStr()) < 0;
}));
    return result;
  }

  GetUnsortedProperties(prefix, ignore_parent = null) {
    let result = [];
    let p = this;
    do {
      for (let pp = p.Properties.First(); pp != null; pp = p.Properties.Next(pp)) {
        if (pp.Key !== $oat($.Strings.P, 0 /*P_Prototype*/)) {
          if (prefix == null || pp.Key.GetData().BeginsWith(prefix)) {
            result.push(pp.Key);
          }
        }
      }
      p = p.GetPrototype();
      if (p === ignore_parent) {
        break;
      }
    } while (p != null);
    return result;
  }

  GetSortedProperties(prefix, ignore_parent = null) {
    let result = this.GetUnsortedProperties(prefix, ignore_parent);
    let result_set = $fill_from(new StdSet((a, b) => new sort_cmp().op_call(a, b)), $begin(result), $end(result));
    seq_assign(result, result_set.begin(), result_set.end());
    return result;
  }

  op_eq(b) {
    if (this === b) {
      return true;
    }
    if (this.IsNumbered() || b.IsNumbered()) {
      return false;
    }
    if (this.Properties.GetSize() !== b.Properties.GetSize()) {
      return false;
    }
    if (this.GetDef$v$c() !== b.GetDef$v$c()) {
      return false;
    }
    let p = this.Properties.First();
    while (p != null) {
      const bp = b.Properties.Get(p.Key);
      if (!bp.op_bool()) {
        return false;
      }
      if (p.Value.op_ne(bp.Value)) {
        return false;
      }
      p = this.Properties.Next(p);
    }
    return true;
  }

  init(prototype = null) {
    this.Refs = new HashSet();
    this.Properties = new $.C4Set$C4Property().init();
    this.prototype = new $.C4Value().init$pC4PropList(prototype);
    this.constant = false;
    this.Status = 1;
    return this;
  }

  ClearRefs() {
    for (const ref of this.Refs.$clone()) {
      ref.Set0();
    }
    0;
  }

  AddRef(pRef) {
    0;
    this.Refs.insert(pRef);
  }

  DelRef(pRef) {
    let erased = this.Refs.erase(pRef);
    0;
    if (this.Refs.empty() && this.Delete()) {
      $delete(this);
    }
  }

  begin() {
    let iter = new C4PropList$Iterator().init();
    if (this.GetPrototype() != null) {
      iter.$assign(this.GetPrototype().begin());
    } else {
      iter.properties = [];
    }
    iter.Reserve(this.Properties.GetSize());
    let p = this.Properties.First();
    while (p != null) {
      iter.AddProperty(p);
      p = this.Properties.Next(p);
    }
    iter.Init();
    return iter;
  }

  end() {
    return new C4PropList$Iterator().init();
  }

  $clone() { return new C4PropList().$assign(this); }
  $assign(o) {
    this.Refs = o.Refs.$clone();
    this.Properties.$assign(o.Properties);
    this.prototype.$assign(o.prototype);
    this.constant = o.constant;
    this.Status = o.Status;
    return this;
  }
}

export class C4PropList$Iterator {
  properties = null;
  iter = null;

  AddProperty(prop) {
    let i = 0;
    let len = this.properties.length;
    for (; i < len; i = i + 1) {
      let oldProperty = this.properties[i];
      if (oldProperty.Key === prop.Key) {
        this.properties[i] = prop;
        return;
      }
    }
    this.properties.push(prop);
  }

  Reserve(additionalAmount) {
    $reserve(this.properties, this.properties.length + additionalAmount);
  }

  Init() {
    this.iter = $begin(this.properties).copy();
  }

  init() {
    this.properties = null;
    this.iter = null;
    return this;
  }

  $clone() { return new C4PropList$Iterator().$assign(this); }
  $assign(o) {
    this.properties = o.properties;
    this.iter = o.iter.$clone();
    return this;
  }
}

export class sort_cmp {

  op_call(a, b) {
    return c$strcmp(a.GetCStr(), b.GetCStr()) < 0;
  }

  $clone() { return new sort_cmp().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class C4PropListNumbered extends C4PropList {
  static PropLists;
  static ShelvedPropLists;
  static EnumerationIndex;
  Number = -1;

  $dtor() {
    if (this.Number !== -1) {
      C4PropListNumbered.PropLists.Remove(this);
    } else {
      $.Log(S("removing numbered proplist without number"));
    }
    super.$dtor();
  }

  CompileFunc$pStdCompiler$pC4ValueNumbers(pComp, numbers) {
    const n = [this.Number];
    pComp.Value$ri32(P(n, 0));
    pComp.Separator(2 /*SEP_SEP2*/);
    C4PropList.prototype.CompileFunc$pStdCompiler$pC4ValueNumbers.call(this, pComp, numbers);
    if (pComp.isDeserializer()) {
      if ($rd(C4PropListNumbered.PropLists.Get(n[0])) != null) {
        pComp.excCorrupt(S("multiple PropLists with Number %d"), n[0]);
        return;
      }
      this.Number = n[0];
      C4PropListNumbered.PropLists.Add$mpC4PropListNumbered(this);
    }
  }

  GetPropListNumbered() {
    return this;
  }

  IsNumbered() {
    return true;
  }

  static GetByNumber(iNumber) {
    return $rd(C4PropListNumbered.PropLists.Get(iNumber));
  }

  static CheckPropList(pObj) {
    if (pObj == null) {
      return false;
    }
    let p = C4PropListNumbered.PropLists.First();
    while (p != null) {
      if (p.a[p.o] === pObj) {
        return true;
      }
      p = C4PropListNumbered.PropLists.Next(p);
    }
    return false;
  }

  static SetEnumerationIndex(iMaxObjectNumber) {
    C4PropListNumbered.EnumerationIndex = $max(C4PropListNumbered.EnumerationIndex, iMaxObjectNumber);
  }

  static GetEnumerationIndex() {
    return C4PropListNumbered.EnumerationIndex;
  }

  static ResetEnumerationIndex() {
    0;
    C4PropListNumbered.EnumerationIndex = 0;
  }

  static ShelveNumberedPropLists() {
    0;
    $reserve(C4PropListNumbered.ShelvedPropLists, C4PropListNumbered.PropLists.GetSize());
    let p_next = C4PropListNumbered.PropLists.First();
    let p = null;
    while ((p = p_next) != null) {
      p_next = C4PropListNumbered.PropLists.Next(p);
      let pl = p.a[p.o];
      if (pl.Number !== -1) {
        pl.ClearNumber();
        C4PropListNumbered.ShelvedPropLists.push(pl);
      }
    }
  }

  static UnshelveNumberedPropLists() {
    let $t1;
    $t1 = C4PropListNumbered.ShelvedPropLists;
    for (let $i1 = 0; $i1 < $t1.length; $i1++) {
      const ShelvedPropList = P($t1, $i1);
      ShelvedPropList.a[ShelvedPropList.o].AcquireNumber();
    }
    C4PropListNumbered.ShelvedPropLists.length = 0;
  }

  static ClearShelve() {
    C4PropListNumbered.ShelvedPropLists.length = 0;
  }

  static ClearNumberedPropLists() {
    let p_next = C4PropListNumbered.PropLists.First();
    let p = null;
    while ((p = p_next) != null) {
      p_next = C4PropListNumbered.PropLists.Next(p);
      if (p.a[p.o] != null) {
        C4PropList.prototype.Clear.call(p.a[p.o]);
      }
    }
  }

  init(prototype = null) {
    super.init(prototype);
    this.Number = -1;
    return this;
  }

  AcquireNumber() {
    do {
      this.Number = (C4PropListNumbered.EnumerationIndex = C4PropListNumbered.EnumerationIndex + 1 | 0);
    } while ($rd(C4PropListNumbered.PropLists.Get(this.Number)) != null);
    C4PropListNumbered.PropLists.Add$mpC4PropListNumbered(this);
  }

  ClearNumber() {
    if (this.Number !== -1) {
      C4PropListNumbered.PropLists.Remove(this);
      this.Number = -1;
    }
  }

  $clone() { return new C4PropListNumbered().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Number = o.Number;
    return this;
  }
}

export class C4PropListScript extends C4PropList {
  static PropLists;

  init(prototype = null) {
    super.init(prototype);
    C4PropListScript.PropLists.Add$mpC4PropListScript(this);
    return this;
  }

  $dtor() {
    C4PropListScript.PropLists.Remove(this);
    super.$dtor();
  }

  Delete() {
    return true;
  }

  static ClearScriptPropLists() {
    let p_next = null;
    let p = null;
    while ((p_next = C4PropListScript.PropLists.First()) != null) {
      let prev_size = C4PropListScript.PropLists.GetSize();
      while ((p = p_next) != null) {
        p_next = C4PropListScript.PropLists.Next(p);
        if (p.a[p.o] != null) {
          let ref = $.C4VPropList(p.a[p.o]);
          C4PropList.prototype.Clear.call(p.a[p.o]);
        }
      }
      if (C4PropListScript.PropLists.GetSize() >= prev_size) {
        break;
      }
    }
  }

  $clone() { return new C4PropListScript().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class C4PropListStatic extends C4PropList {
  Parent = null;
  ParentKeyName = new $.C4RefCntPointer$C4String();

  init(prototype, parent, key) {
    super.init(prototype);
    this.Parent = parent;
    this.ParentKeyName = new $.C4RefCntPointer$C4String().init$pC4String(key);
    return this;
  }

  $dtor() {
    super.$dtor();
  }

  Delete() {
    return true;
  }

  IsStatic$v() {
    return this;
  }

  RefCompileFunc(pComp, numbers) {
    0;
    if (this.Parent != null) {
      this.Parent.RefCompileFunc(pComp, numbers);
      pComp.Separator(4 /*SEP_PART*/);
    }
    if (!(this.ParentKeyName.op_const_C4String_() != null)) {
      pComp.excCorrupt(S("C4PropListStatic::RefCompileFunc without ParentKeyName"));
    }
    pComp.Value$StdParameterAdapt$StdStrBuf$i32($.mkParAdapt$mStdStrBuf$mi32(this.ParentKeyName.op_arrow$v$c().GetData(), 4 /*RCT_ID*/));
  }

  GetDataString$v$c() {
    let r = new $.StdStrBuf();
    if (this.Parent != null) {
      r.Take$mStdStrBuf(this.Parent.GetDataString$v$c());
      r.AppendChar(46);
    }
    0;
    if (this.ParentKeyName.op_const_C4String_() != null) {
      r.Append$StdStrBuf(this.ParentKeyName.op_arrow$v$c().GetData());
    }
    return r;
  }

  GetName() {
    let s = this.GetPropertyStr(1 /*P_Name*/);
    if (s == null) {
      s = this.ParentKeyName.op_const_C4String_();
    }
    if (s == null) {
      return S("");
    }
    return s.GetCStr();
  }

  GetParent() {
    return this.Parent;
  }

  GetParentKeyName() {
    return this.ParentKeyName.op_C4String_();
  }

  $clone() { return new C4PropListStatic().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Parent = o.Parent;
    this.ParentKeyName.$assign(o.ParentKeyName);
    return this;
  }
}

export class C4PropListStaticMember extends C4PropListStatic {

  init(prototype, parent, key) {
    super.init(prototype, parent, key);
    return this;
  }

  Delete() {
    return false;
  }

  $clone() { return new C4PropListStaticMember().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export function CompileNewFunc$rpC4PropList$pStdCompiler$pC4ValueNumbers(pStruct, pComp, rPar$) {
  const rPar = [rPar$];
  let $t1;
  let temp = C4PropList.New$pC4PropList();
  pComp.Value$StdParameterAdapt$C4PropList$pC4ValueNumbers$2($.mkParAdapt$rC4PropList$rpC4ValueNumbers(temp, P(rPar, 0)));
  pStruct.a[pStruct.o] = ($t1 = temp, temp = null, $t1);
}

export function $init(): void {
  C4PropListNumbered.PropLists = new $.C4Set$pC4PropListNumbered().init();
  C4PropListNumbered.ShelvedPropLists = [];
  C4PropListNumbered.EnumerationIndex = 0;
  C4PropListScript.PropLists = new $.C4Set$pC4PropListScript().init();
}

Object.assign($, { C4PropList, C4PropList$Iterator, C4PropListNumbered, C4PropListScript, C4PropListStatic, C4PropListStaticMember, C4Property, CompileNewFunc$rpC4PropList$pStdCompiler$pC4ValueNumbers, sort_cmp });
