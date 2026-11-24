// @ts-nocheck
// OpenClonk 36de799: src/script/C4Value.cpp, src/script/C4Value.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $begin, $delete, $end, $throw, $vpush, StdException, StdMap, StdString } from '../../rt/std.ts';

export class Nillable$pC4Def {
  _nil = false;
  _val = null;

  init$rpC4Def(value) {
    this._nil = value == null && !C4Value.IsNullableType(12);
    this._val = value;
    return this;
  }

  init$C4Void(_0) {
    this._nil = true;
    this._val = null;
    return this;
  }

  IsNil() {
    return this._nil;
  }

  op_C4Def_() {
    return this._val;
  }

  $copy(other) {
    Nillable$pC4Def.prototype.$assign.call(this, other);
    return this;
  }
  $clone() { return new Nillable$pC4Def().$copy(this); }
  $assign(val) {
    this._val = val._val;
    this._nil = val._nil;
    return this;
  }
}

export class Nillable$pC4String {
  _nil = false;
  _val = null;

  init$rpC4String(value) {
    this._nil = value == null && !C4Value.IsNullableType(4);
    this._val = value;
    return this;
  }

  init$C4Void(_0) {
    this._nil = true;
    this._val = null;
    return this;
  }

  IsNil() {
    return this._nil;
  }

  op_C4String_() {
    return this._val;
  }

  $copy(other) {
    Nillable$pC4String.prototype.$assign.call(this, other);
    return this;
  }
  $clone() { return new Nillable$pC4String().$copy(this); }
  $assign(val) {
    this._val = val._val;
    this._nil = val._nil;
    return this;
  }
}

export class Nillable$pC4ValueArray {
  _nil = false;
  _val = null;

  init$rpC4ValueArray(value) {
    this._nil = value == null && !C4Value.IsNullableType(5);
    this._val = value;
    return this;
  }

  init$C4Void(_0) {
    this._nil = true;
    this._val = null;
    return this;
  }

  IsNil() {
    return this._nil;
  }

  op_C4ValueArray_() {
    return this._val;
  }

  $copy(other) {
    Nillable$pC4ValueArray.prototype.$assign.call(this, other);
    return this;
  }
  $clone() { return new Nillable$pC4ValueArray().$copy(this); }
  $assign(val) {
    this._val = val._val;
    this._nil = val._nil;
    return this;
  }
}

export class Nillable$i32 {
  _nil = false;
  _val = 0;

  init$i32(value) {
    this._nil = value === 0 && !C4Value.IsNullableType(1);
    this._val = value;
    return this;
  }

  init$x(_0) {
    this._nil = true;
    this._val = 0;
    return this;
  }

  init$C4Void(_0) {
    this._nil = true;
    this._val = 0;
    return this;
  }

  IsNil() {
    return this._nil;
  }

  op_int() {
    return this._val;
  }

  $copy(other) {
    Nillable$i32.prototype.$assign.call(this, other);
    return this;
  }
  $clone() { return new Nillable$i32().$copy(this); }
  $assign(val) {
    this._val = val._val;
    this._nil = val._nil;
    return this;
  }
}

export class Nillable$i64 {
  _nil = false;
  _val = 0;

  init$i64(value) {
    this._nil = value === 0 && !C4Value.IsNullableType(1);
    this._val = value;
    return this;
  }

  init$C4Void(_0) {
    this._nil = true;
    this._val = 0;
    return this;
  }

  IsNil() {
    return this._nil;
  }

  op_long() {
    return this._val;
  }

  op_assign$i64(val) {
    this._val = val;
    this._nil = val === 0 && !C4Value.IsNullableType(1);
    return this;
  }

  op_dec$i32(_0) {
    let $t1;
    let v = ($t1 = this._val, this._val = this._val - 1, $t1);
    return v;
  }

  $copy(other) {
    Nillable$i64.prototype.$assign.call(this, other);
    return this;
  }
  $clone() { return new Nillable$i64().$copy(this); }
  $assign(val) {
    this._val = val._val;
    this._nil = val._nil;
    return this;
  }
}

export class C4V_Data {
  $v = 0;
  get Int() { const v = this.$v; return v === null ? 0 : v; }
  set Int(v) { this.$v = v; }
  get Ptr() { const v = this.$v; return v === 0 ? null : v; }
  set Ptr(v) { this.$v = v; }
  get PropList() { const v = this.$v; return v === 0 ? null : v; }
  set PropList(v) { this.$v = v; }
  get Str() { const v = this.$v; return v === 0 ? null : v; }
  set Str(v) { this.$v = v; }
  get Array() { const v = this.$v; return v === 0 ? null : v; }
  set Array(v) { this.$v = v; }
  get Fn() { const v = this.$v; return v === 0 ? null : v; }
  set Fn(v) { this.$v = v; }

  op_void_() {
    return this.Ptr;
  }

  op_const_void_() {
    return this.Ptr;
  }

  op_assign(p) {
    0;
    this.Ptr = p;
    return this;
  }
  $clone() { const u = new C4V_Data(); u.$v = this.$v; return u; }
  $assign(o) { this.$v = o.$v; return this; }
}

export class C4JSONSerializationError extends StdException {
  msg = new StdString();

  init(msg) {
    this.msg = msg.$clone();
    return this;
  }

  what() {
    return this.msg.c_str();
  }

  $clone() { return new C4JSONSerializationError().$assign(this); }
  $assign(o) {
    this.msg = o.msg.$clone();
    return this;
  }
}

export class C4Value {
  Data = new C4V_Data();
  Type = 0 /*C4V_Nil*/;

  init$v() {
    this.Data = new C4V_Data();
    this.Type = 0 /*C4V_Nil*/;
    this.Data.op_assign(null);
    return this;
  }

  init$b(data) {
    this.Data = new C4V_Data();
    this.Type = 2 /*C4V_Bool*/;
    this.Data.Int = data ? 1 : 0;
    return this;
  }

  init$i32(data) {
    this.Data = new C4V_Data();
    this.Type = 1 /*C4V_Int*/;
    this.Data.Int = data;
    return this;
  }

  init$i64(data) {
    this.Data = new C4V_Data();
    this.Type = 1 /*C4V_Int*/;
    this.Data.Int = data | 0;
    return this;
  }

  init$pC4PropListStatic(p) {
    C4Value.prototype.init$pC4PropList.call(this, p);
    return this;
  }

  init$pC4Def(p) {
    C4Value.prototype.init$pC4PropList.call(this, p);
    return this;
  }

  init$pC4Object(p) {
    C4Value.prototype.init$pC4PropList.call(this, p);
    return this;
  }

  init$pC4Effect(p) {
    C4Value.prototype.init$pC4PropList.call(this, p);
    return this;
  }

  init$pC4String(pStr) {
    this.Data = new C4V_Data();
    this.Type = pStr != null ? 4 /*C4V_String*/ : 0 /*C4V_Nil*/;
    this.Data.Str = pStr;
    C4Value.prototype.AddDataRef.call(this);
    return this;
  }

  init$pi8(s) {
    this.Data = new C4V_Data();
    this.Type = s != null ? 4 /*C4V_String*/ : 0 /*C4V_Nil*/;
    this.Data.Str = s != null ? $.Strings.RegString$pi8(s) : null;
    C4Value.prototype.AddDataRef.call(this);
    return this;
  }

  init$StdStrBuf(s) {
    this.Data = new C4V_Data();
    this.Type = s.isNull() ? 0 /*C4V_Nil*/ : 4 /*C4V_String*/;
    this.Data.Str = s.isNull() ? null : $.Strings.RegString$StdStrBuf(new $.StdStrBuf().init$StdStrBuf$b(s));
    C4Value.prototype.AddDataRef.call(this);
    return this;
  }

  init$pC4ValueArray(pArray) {
    this.Data = new C4V_Data();
    this.Type = pArray != null ? 5 /*C4V_Array*/ : 0 /*C4V_Nil*/;
    this.Data.Array = pArray;
    C4Value.prototype.AddDataRef.call(this);
    return this;
  }

  init$pC4AulFunc(pFn) {
    this.Data = new C4V_Data();
    this.Type = pFn != null ? 6 /*C4V_Function*/ : 0 /*C4V_Nil*/;
    this.Data.Fn = pFn;
    C4Value.prototype.AddDataRef.call(this);
    return this;
  }

  init$pC4PropList(p) {
    this.Data = new C4V_Data();
    this.Type = p != null ? 3 /*C4V_PropList*/ : 0 /*C4V_Nil*/;
    this.Data.PropList = p;
    C4Value.prototype.AddDataRef.call(this);
    return this;
  }

  init$C4ObjectPtr(p) {
    C4Value.prototype.init$pC4Object.call(this, p.op_C4Object_());
    return this;
  }

  $dtor() {
    C4Value.prototype.DelDataRef.call(this, this.Data.$clone(), this.Type);
  }

  getInt() {
    return this.CheckConversion(1 /*C4V_Int*/) ? this.Data.Int : 0;
  }

  getBool() {
    return this.CheckConversion(2 /*C4V_Bool*/) ? !!(this.Data.op_const_void_() != null) : false;
  }

  getObj() {
    return this.CheckConversion(11 /*C4V_Object*/) ? this.Data.PropList.GetObject$v() : null;
  }

  getDef() {
    return this.CheckConversion(12 /*C4V_Def*/) ? this.Data.PropList.GetDef$v() : null;
  }

  getPropList() {
    return this.CheckConversion(3 /*C4V_PropList*/) ? this.Data.PropList : null;
  }

  getStr() {
    return this.CheckConversion(4 /*C4V_String*/) ? this.Data.Str : null;
  }

  getArray() {
    return this.CheckConversion(5 /*C4V_Array*/) ? this.Data.Array : null;
  }

  getFunction() {
    return this.CheckConversion(6 /*C4V_Function*/) ? this.Data.Fn : null;
  }

  _getInt() {
    return this.Data.Int;
  }

  _getBool() {
    return !(this.Data.Int === 0);
  }

  _getObj() {
    return this.Data.PropList != null ? this.Data.PropList.GetObject$v() : null;
  }

  _getDef() {
    return this.Data.PropList != null ? this.Data.PropList.GetDef$v() : null;
  }

  _getStr() {
    return this.Data.Str;
  }

  _getArray() {
    return this.Data.Array;
  }

  _getFunction() {
    return this.Data.Fn;
  }

  _getPropList() {
    return this.Data.PropList;
  }

  op_not() {
    return !(this.GetData().op_void_() != null);
  }

  op_const_void_() {
    return this.GetData().op_void_() != null ? this : null;
  }

  Set$C4Value(nValue) {
    this.Set$C4V_Data$i32(nValue.Data.$clone(), nValue.Type);
  }

  SetInt(i) {
    let d = new C4V_Data();
    d.Int = i;
    this.Set$C4V_Data$i32(d.$clone(), 1 /*C4V_Int*/);
  }

  SetBool(b) {
    let d = new C4V_Data();
    d.Int = b ? 1 : 0;
    this.Set$C4V_Data$i32(d.$clone(), 2 /*C4V_Bool*/);
  }

  SetString(Str) {
    let d = new C4V_Data();
    d.Str = Str;
    this.Set$C4V_Data$i32(d.$clone(), 4 /*C4V_String*/);
  }

  SetArray(Array_) {
    let d = new C4V_Data();
    d.Array = Array_;
    this.Set$C4V_Data$i32(d.$clone(), 5 /*C4V_Array*/);
  }

  SetFunction(Fn) {
    let d = new C4V_Data();
    d.Fn = Fn;
    this.Set$C4V_Data$i32(d.$clone(), 6 /*C4V_Function*/);
  }

  SetPropList(PropList) {
    let d = new C4V_Data();
    d.PropList = PropList;
    this.Set$C4V_Data$i32(d.$clone(), 3 /*C4V_PropList*/);
  }

  SetObjectEnum(i) {
    let d = new C4V_Data();
    d.Int = i;
    this.Set$C4V_Data$i32(d.$clone(), 9 /*C4V_C4ObjectEnum*/);
  }

  Set0() {
    let oData = this.Data.$clone();
    let oType = this.Type;
    this.Data.op_assign(null);
    this.Type = 0 /*C4V_Nil*/;
    this.DelDataRef(oData.$clone(), oType);
  }

  op_eq(Value2) {
    if (!('C4Value$op_eq$top' in $)) $.C4Value$op_eq$top = null;
    let here = new Seen().init($.C4Value$op_eq$top, this, Value2);
    let recursion = $.C4Value$op_eq$top != null && $.C4Value$op_eq$top.recursion(here);
    if (recursion) {
      let first = $.C4Value$op_eq$top.first();
      $.LogF(S("Caught infinite recursion comparing %s and %s"), first.left.GetDataString().getData(), first.right.GetDataString().getData());
      return false;
    }
    $.C4Value$op_eq$top = here;
    let result = ComparisonImpl(this, Value2);
    $.C4Value$op_eq$top = here.prev;
    return result;
  }

  op_ne(Value2) {
    return !this.op_eq(Value2);
  }

  IsIdenticalTo(cmp) {
    return this.GetType() === cmp.GetType() && this.GetData().op_void_() === cmp.GetData().op_void_();
  }

  op_addAssign(by) {
    this.Data.Int = this.Data.Int + by | 0;
    this.Type = 1 /*C4V_Int*/;
    return this;
  }

  op_inc$v() {
    this.Data.Int = this.Data.Int + 1 | 0;
    this.Type = 1 /*C4V_Int*/;
    return this;
  }

  op_inc$i32(_0) {
    let old = new C4Value().$copy(this);
    this.op_inc$v();
    return old;
  }

  op_dec$v() {
    this.Data.Int = this.Data.Int - 1 | 0;
    this.Type = 1 /*C4V_Int*/;
    return this;
  }

  op_dec$i32(_0) {
    let old = new C4Value().$copy(this);
    this.op_dec$v();
    return old;
  }

  GetData() {
    return this.Data.$clone();
  }

  GetType() {
    return this.Type;
  }

  GetTypeEx() {
    if (this.Type === 3) {
      if (this.FnCnvEffect()) {
        return 13 /*C4V_Effect*/;
      }
      if (this.FnCnvObject()) {
        return 11 /*C4V_Object*/;
      }
      if (this.FnCnvDef()) {
        return 12 /*C4V_Def*/;
      }
    }
    return this.Type;
  }

  GetTypeName() {
    return GetC4VName(this.GetType());
  }

  Denumerate(numbers) {
    switch (this.Type) {
      case 8:
        this.Set$C4Value(numbers.GetValue(this.Data.Int >>> 0));
        break;
      case 5:
        this.Data.Array.Denumerate(numbers);
        break;
      case 3:
        if (!this.Data.PropList.IsNumbered() && !(this.Data.PropList.IsStatic$v() != null)) {
          this.Data.PropList.Denumerate(numbers);
        }
        break;
      case 9:
        {
          let pObj = $.C4PropListNumbered.GetByNumber(this.Data.Int);
          if (pObj != null) {
            this.SetPropList(pObj);
          } else {
            $.LogF(S("ERROR: Object number %d is missing."), this.Data.Int);
            this.Set0();
          }
        }
      default:
        break;
    }
  }

  GetDataString(depth = 10, ignore_reference_parent = null) {
    switch (this.GetType()) {
      case 1:
        return $.FormatString(S("%ld"), this.Data.Int);
      case 2:
        return new $.StdStrBuf().init$pi8$b(this.Data.op_const_void_() != null ? S("true") : S("false"));
      case 3:
        {
          if (this.Data.PropList === $.ScriptEngine.GetPropList()) {
            return new $.StdStrBuf().init$pi8$b(S("Global"));
          }
          let Obj = this.Data.PropList.GetObject$v();
          if (Obj === this.Data.PropList) {
            return $.FormatString(S("Object(%d)"), Obj.Number);
          }
          let Def = this.Data.PropList.IsStatic$v();
          if (Def != null) {
            if (ignore_reference_parent == null || Def.GetParent() !== ignore_reference_parent) {
              return Def.GetDataString$v$c();
            }
          }
          let fx = this.Data.PropList.GetEffect();
          let DataString = new $.StdStrBuf();
          $.StdStrBuf.prototype.op_assign$pi8.call(DataString, fx != null ? S("effect {") : S("{"));
          this.Data.PropList.AppendDataString(DataString, S(", "), depth, Def != null && ignore_reference_parent != null);
          DataString.AppendChar(125);
          return DataString;
        }
      case 4:
        return this.Data.Str != null && this.Data.Str.GetCStr() != null ? $.FormatString(S("\"%s\""), this.Data.Str.GetCStr()) : new $.StdStrBuf().init$pi8$b(S("(nullstring)"));
      case 5:
        {
          if (depth <= 0 && this.Data.Array.GetSize() !== 0) {
            return new $.StdStrBuf().init$pi8$b(S("[...]"));
          }
          let DataString = new $.StdStrBuf();
          $.StdStrBuf.prototype.op_assign$pi8.call(DataString, S("["));
          for (let i = 0; i < this.Data.Array.GetSize(); i = i + 1 | 0) {
            if (i !== 0) {
              DataString.Append$pi8(S(", "));
            }
            DataString.Append$StdStrBuf(this.Data.Array.GetItem(i).GetDataString(depth - 1 | 0));
          }
          DataString.AppendChar(93);
          return DataString;
        }
      case 6:
        return this.Data.Fn.GetFullName();
      case 0:
        return new $.StdStrBuf().init$pi8$b(S("nil"));
      default:
        return new $.StdStrBuf().init$pi8$b(S("-unknown type- "));
    }
  }

  ToJSON(depth = 10, ignore_reference_parent = null) {
    switch (this.GetType()) {
      case 1:
        return $.FormatString(S("%ld"), this.Data.Int);
      case 2:
        return new $.StdStrBuf().init$pi8$b(this.Data.op_const_void_() != null ? S("true") : S("false"));
      case 3:
        {
          let Def = this.Data.PropList.IsStatic$v();
          if (Def != null) {
            if (ignore_reference_parent == null || Def.GetParent() !== ignore_reference_parent) {
              return Def.ToJSON();
            }
          }
          return this.Data.PropList.ToJSON(depth, Def != null && ignore_reference_parent != null);
        }
      case 4:
        if (this.Data.Str != null && this.Data.Str.GetCStr() != null) {
          let str = this.Data.Str.GetData();
          str.EscapeString();
          str.Replace(S("\n"), S("\\n"));
          return $.FormatString(S("\"%s\""), str.getData());
        } else {
          return new $.StdStrBuf().init$pi8$b(S("null"));
        }
      case 5:
        {
          if (depth <= 0 && this.Data.Array.GetSize() !== 0) {
            $throw(new C4JSONSerializationError().init(StdString.of(S("maximum depth reached"))));
          }
          let DataString = new $.StdStrBuf();
          $.StdStrBuf.prototype.op_assign$pi8.call(DataString, S("["));
          for (let i = 0; i < this.Data.Array.GetSize(); i = i + 1 | 0) {
            if (i !== 0) {
              DataString.Append$pi8(S(","));
            }
            DataString.Append$StdStrBuf(this.Data.Array.GetItem(i).ToJSON(depth - 1 | 0));
          }
          DataString.AppendChar(93);
          return DataString;
        }
      case 6:
        $throw(new C4JSONSerializationError().init(StdString.of(S("cannot serialize function"))));
      case 0:
        return new $.StdStrBuf().init$pi8$b(S("null"));
      default:
        $throw(new C4JSONSerializationError().init(StdString.of(S("unknown type"))));
    }
  }

  CheckParConversion(vtToType) {
    switch (vtToType) {
      case 0:
        return this.Type === 0 || this.Type === 1 && this.op_not();
      case 1:
        return this.Type === 1 || this.Type === 0 || this.Type === 2;
      case 2:
        return true;
      case 3:
        return this.Type === 3 || this.Type === 0 || this.Type === 1 && this.op_not();
      case 4:
        return this.Type === 4 || this.Type === 0 || this.Type === 1 && this.op_not();
      case 5:
        return this.Type === 5 || this.Type === 0 || this.Type === 1 && this.op_not();
      case 6:
        return this.Type === 6 || this.Type === 0 || this.Type === 1 && this.op_not();
      case 10:
        return true;
      case 11:
        return this.Type === 3 && this.FnCnvObject() || this.Type === 0 || this.Type === 1 && this.op_not();
      case 12:
        return this.Type === 3 && this.FnCnvDef() || this.Type === 0 || this.Type === 1 && this.op_not();
      case 13:
        return this.Type === 3 && this.FnCnvEffect() || this.Type === 0 || this.Type === 1 && this.op_not();
      default:
        0;
        return false;
    }
  }

  CheckConversion(vtToType) {
    switch (vtToType) {
      case 0:
        return this.Type === 0;
      case 1:
        return this.Type === 0 || this.Type === 1 || this.Type === 2;
      case 2:
        return true;
      case 3:
        return this.Type === 3;
      case 4:
        return this.Type === 4;
      case 5:
        return this.Type === 5;
      case 6:
        return this.Type === 6;
      case 10:
        return true;
      case 11:
        return this.Type === 3 && this.FnCnvObject();
      case 12:
        return this.Type === 3 && this.FnCnvDef();
      case 13:
        return this.Type === 3 && this.FnCnvEffect();
      default:
        0;
        return false;
    }
  }

  static WarnAboutConversion(Type, vtToType) {
    switch (vtToType) {
      case 0:
        return Type !== 0 && Type !== 10;
      case 1:
        return Type !== 1 && Type !== 0 && Type !== 2 && Type !== 10;
      case 2:
        return false;
      case 3:
        return Type !== 3 && Type !== 13 && Type !== 12 && Type !== 11 && Type !== 0 && Type !== 10;
      case 4:
        return Type !== 4 && Type !== 0 && Type !== 10;
      case 5:
        return Type !== 5 && Type !== 0 && Type !== 10;
      case 6:
        return Type !== 6 && Type !== 0 && Type !== 10;
      case 10:
        return false;
      case 12:
        return Type !== 12 && Type !== 11 && Type !== 3 && Type !== 0 && Type !== 10;
      case 11:
        return Type !== 11 && Type !== 3 && Type !== 0 && Type !== 10;
      case 13:
        return Type !== 13 && Type !== 3 && Type !== 0 && Type !== 10;
      default:
        0;
        return false;
    }
  }

  CompileFunc(pComp, numbers) {
    let deserializing = pComp.isDeserializer();
    const cC4VID = [0];
    if (!deserializing) {
      0;
      switch (this.Type) {
        case 0:
          cC4VID[0] = 110;
          break;
        case 1:
          cC4VID[0] = 105;
          break;
        case 2:
          cC4VID[0] = 98;
          break;
        case 3:
          if (this.getPropList().IsStatic$v() != null) {
            cC4VID[0] = 68;
          } else if (this.getPropList().IsNumbered()) {
            cC4VID[0] = 79;
          } else {
            cC4VID[0] = 69;
          }
          break;
        case 5:
          cC4VID[0] = 69;
          break;
        case 6:
          cC4VID[0] = 68;
          break;
        case 4:
          cC4VID[0] = 115;
          break;
        default:
          0;
      }
    }
    pComp.Character(P(cC4VID, 0));
    const iTmp = [0];
    switch (cC4VID[0]) {
      case 105:
        iTmp[0] = this.Data.Int;
        pComp.Value$ri32(P(iTmp, 0));
        this.SetInt(iTmp[0]);
        break;
      case 98:
        iTmp[0] = this.Data.Int;
        pComp.Value$ri32(P(iTmp, 0));
        this.SetBool(!(iTmp[0] === 0));
        break;
      case 69:
        if (!deserializing) {
          iTmp[0] = numbers.GetNumberForValue(this) | 0;
        }
        pComp.Value$ri32(P(iTmp, 0));
        if (deserializing) {
          this.Data.Int = iTmp[0];
          this.Type = 8 /*C4V_Enum*/;
        }
        break;
      case 79:
        if (!deserializing) {
          iTmp[0] = this.getPropList().GetPropListNumbered().Number;
        }
        pComp.Value$ri32(P(iTmp, 0));
        if (deserializing) {
          this.Data.Int = iTmp[0];
          this.Type = 9 /*C4V_C4ObjectEnum*/;
        }
        break;
      case 68:
        {
          if (!pComp.isDeserializer()) {
            let p = this.getPropList();
            if (this.getFunction() != null) {
              p = this.Data.Fn.Parent;
              0;
              0;
              0;
            }
            p.IsStatic$v$c().RefCompileFunc(pComp, numbers);
            if (this.getFunction() != null) {
              pComp.Separator(4 /*SEP_PART*/);
              let s = new $.StdStrBuf();
              s.Ref$pi8(this.Data.Fn.GetName());
              pComp.Value$StdParameterAdapt$StdStrBuf$i32$2($.mkParAdapt$rStdStrBuf$mi32(s, 4 /*RCT_ID*/));
            }
          } else {
            let s = new $.StdStrBuf();
            let temp = new C4Value().init$v();
            pComp.Value$StdParameterAdapt$StdStrBuf$i32$2($.mkParAdapt$rStdStrBuf$mi32(s, 4 /*RCT_ID*/));
            if (!$.ScriptEngine.GetGlobalConstant(s.getData(), temp)) {
              pComp.excCorrupt(S("Cannot find global constant %s"), s.getData());
            }
            while (pComp.Separator(4 /*SEP_PART*/)) {
              let p = temp.getPropList();
              if (p == null) {
                pComp.excCorrupt(S("static proplist %s is not a proplist anymore"), s.getData());
              }
              pComp.Value$StdParameterAdapt$StdStrBuf$i32$2($.mkParAdapt$rStdStrBuf$mi32(s, 4 /*RCT_ID*/));
              let c4s = $.Strings.FindString(s.getData());
              if (c4s == null || !p.GetPropertyByS(c4s, temp)) {
                pComp.excCorrupt(S("Cannot find property %s in %s"), s.getData(), this.GetDataString().getData());
              }
            }
            this.Set$C4Value(temp);
          }
          break;
        }
      case 115:
        {
          let s = new $.StdStrBuf();
          if (!deserializing) {
            s.$assign(this.Data.Str.GetData());
          }
          pComp.Value$rStdStrBuf(s);
          if (deserializing) {
            this.SetString($.Strings.RegString$StdStrBuf(new $.StdStrBuf().init$rStdStrBuf$b(s)));
          }
          break;
        }
      case 99:
        if (deserializing) {
          this.Set$C4Value($.GameScript.ScenPropList);
        }
        break;
      case 116:
        if (deserializing) {
          this.Set$C4Value($.GameScript.ScenPrototype);
        }
        break;
      case 103:
        if (deserializing) {
          this.SetPropList($.ScriptEngine.GetPropList());
        }
        break;
      case 110:
      case 65:
        if (deserializing) {
          this.Set0();
        }
        break;
      default:
        pComp.excCorrupt(S("unknown C4Value type tag '%c'"), cC4VID[0]);
        break;
    }
  }

  static IsNullableType(Type) {
    return Type === 1 || Type === 2;
  }

  Set$C4V_Data$i32(nData, nType) {
    if (this.Data.op_void_() === nData.op_void_() && this.Type >= 3) {
      return;
    }
    let oData = this.Data.$clone();
    let oType = this.Type;
    this.Data.$assign(nData);
    this.Type = nData.op_void_() != null || C4Value.IsNullableType(nType) ? nType : 0 /*C4V_Nil*/;
    this.AddDataRef();
    this.DelDataRef(oData.$clone(), oType);
  }

  AddDataRef() {
    0;
    0;
    switch (this.Type) {
      case 3:
        this.Data.PropList.AddRef(this);
        break;
      case 4:
        this.Data.Str.IncRef();
        break;
      case 5:
        this.Data.Array.IncRef();
        break;
      case 6:
        this.Data.Fn.IncRef();
        break;
      default:
        break;
    }
  }

  DelDataRef(Data, Type) {
    0;
    0;
    switch (Type) {
      case 3:
        Data.PropList.DelRef(this);
        break;
      case 4:
        Data.Str.DecRef();
        break;
      case 5:
        Data.Array.DecRef();
        break;
      case 6:
        Data.Fn.DecRef();
        break;
      default:
        break;
    }
  }

  FnCnvObject() {
    if (this.Data.PropList.GetObject$v() != null) {
      return true;
    }
    return false;
  }

  FnCnvDef() {
    if (this.Data.PropList.GetDef$v() != null) {
      return true;
    }
    return false;
  }

  FnCnvEffect() {
    if (this.Data.PropList.GetEffect() != null) {
      return true;
    }
    return false;
  }

  LogDeletedObjectWarning(p) {
    if (p.GetPropListNumbered() != null) {
      $.LogF(S("Warning: using deleted object (#%d) (%s)!"), p.GetPropListNumbered().Number, p.GetName());
    } else {
      $.LogF(S("Warning: using deleted proplist %p (%s)!"), p, p.GetName());
    }
    $.AulExec.LogCallStack();
  }

  init$Nillable$i64$2(v) {
    this.$assign(v.IsNil() ? new C4Value().init$v() : new C4Value().init$i64(v.op_long()));
    return this;
  }

  init$Nillable$pC4Def$2(v) {
    this.$assign(v.IsNil() ? new C4Value().init$v() : new C4Value().init$pC4Def(v.op_C4Def_()));
    return this;
  }

  init$Nillable$i32$2(v) {
    this.$assign(v.IsNil() ? new C4Value().init$v() : new C4Value().init$i32(v.op_int()));
    return this;
  }

  init$Nillable$pC4ValueArray$2(v) {
    this.$assign(v.IsNil() ? new C4Value().init$v() : new C4Value().init$pC4ValueArray(v.op_C4ValueArray_()));
    return this;
  }

  init$Nillable$pC4String$2(v) {
    this.$assign(v.IsNil() ? new C4Value().init$v() : new C4Value().init$pC4String(v.op_C4String_()));
    return this;
  }

  $copy(nValue) {
    this.Data = nValue.Data.$clone();
    this.Type = nValue.Type;
    C4Value.prototype.AddDataRef.call(this);
    return this;
  }
  $clone() { return new C4Value().$copy(this); }
  $assign(nValue) {
    this.Set$C4Value(nValue);
    return this;
  }
}

export class C4ValueNumbers {
  ValuesToSave = [];
  LoadedValues = [];
  ValueNumbers = new StdMap();

  init() {
    this.ValuesToSave = [];
    this.LoadedValues = [];
    this.ValueNumbers = new StdMap();
    return this;
  }

  GetNumberForValue(v) {
    if (this.ValueNumbers.find(v.GetData().op_void_()).eq(this.ValueNumbers.end())) {
      this.ValuesToSave.push(v);
      this.ValueNumbers.entry(v.GetData().op_void_(), () => 0).second = this.ValuesToSave.length >>> 0;
      return this.ValuesToSave.length >>> 0;
    }
    return this.ValueNumbers.entry(v.GetData().op_void_(), () => 0).second;
  }

  GetValue(n) {
    if (n <= this.LoadedValues.length) {
      return this.LoadedValues[n - 1 >>> 0];
    }
    $.LogF(S("ERROR: Value number %d is missing."), n);
    return $.C4VNull;
  }

  Denumerate() {
    for (const LoadedValue of this.LoadedValues) {
      LoadedValue.Denumerate(this);
    }
  }

  CompileFunc(pComp) {
    let $t1;
    let deserializing = pComp.isDeserializer();
    let fNaming = pComp.hasNaming();
    if (deserializing) {
      const iSize = [0];
      if (!fNaming) {
        pComp.Value$ru32(P(iSize, 0));
      }
      do {
        if (!fNaming && !(($t1 = iSize[0], iSize[0] = iSize[0] - 1 >>> 0, $t1) !== 0)) {
          break;
        }
        try {
          $vpush(this.LoadedValues, new C4Value().init$v());
          this.CompileValue(pComp, this.LoadedValues[this.LoadedValues.length - 1]);
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
        const iSize = [this.ValuesToSave.length | 0];
        pComp.Value$ri32(P(iSize, 0));
      }
      for (let i = $begin(this.ValuesToSave); !i.eq($end(this.ValuesToSave)); i.inc()) {
        this.CompileValue(pComp, i.v);
        if (!i.eq($end(this.ValuesToSave))) {
          pComp.Separator(1 /*SEP_SEP*/);
        }
      }
    }
  }

  CompileValue(pComp, v) {
    let deserializing = pComp.isDeserializer();
    const cC4VID = [0];
    switch (v.GetType()) {
      case 3:
        cC4VID[0] = 112;
        break;
      case 5:
        cC4VID[0] = 97;
        break;
      default:
        0;
        break;
    }
    pComp.Character(P(cC4VID, 0));
    pComp.Separator(7 /*SEP_START*/);
    switch (cC4VID[0]) {
      case 112:
        {
          const p = [v._getPropList()];
          pComp.Value$StdParameterAdapt$StdPtrAdapt$C4PropList$pC4ValueNumbers($.mkParAdapt$mStdPtrAdapt$C4PropList$mpC4ValueNumbers($.mkPtrAdaptNoNull$rpC4PropList(P(p, 0)), this));
          if (deserializing) {
            v.SetPropList(p[0]);
          }
        }
        break;
      case 97:
        {
          const a = [v._getArray()];
          pComp.Value$StdParameterAdapt$StdPtrAdapt$C4ValueArray$pC4ValueNumbers($.mkParAdapt$mStdPtrAdapt$C4ValueArray$mpC4ValueNumbers($.mkPtrAdaptNoNull$rpC4ValueArray(P(a, 0)), this));
          if (deserializing) {
            v.SetArray(a[0]);
          }
        }
        break;
      default:
        pComp.excCorrupt(S("Unexpected character '%c'"), cC4VID[0]);
        break;
    }
    pComp.Separator(8 /*SEP_END*/);
  }

  $clone() { return new C4ValueNumbers().$assign(this); }
  $assign(o) {
    this.ValuesToSave = o.ValuesToSave.slice();
    this.LoadedValues = o.LoadedValues.slice();
    this.ValueNumbers = o.ValueNumbers.$clone();
    return this;
  }
}

export class Seen {
  prev = null;
  left = null;
  right = null;

  init(prev, left, right) {
    this.prev = prev;
    this.left = left;
    this.right = right;
    return this;
  }

  op_eq(other) {
    return this.left === other.left && this.right === other.right;
  }

  recursion(new_top) {
    for (let s = this; s != null; s = s.prev) {
      if (s.op_eq(new_top)) {
        return true;
      }
    }
    return false;
  }

  first() {
    let s = this;
    while (s.prev != null) {
      s = s.prev;
    }
    return s;
  }

  $clone() { return new Seen().$assign(this); }
  $assign(o) {
    this.prev = o.prev;
    this.left = o.left;
    this.right = o.right;
    return this;
  }
}


export function GetC4VName(Type) {
  switch (Type) {
    case 0:
      return S("nil");
    case 1:
      return S("int");
    case 2:
      return S("bool");
    case 4:
      return S("string");
    case 5:
      return S("array");
    case 3:
      return S("proplist");
    case 10:
      return S("any");
    case 11:
      return S("object");
    case 12:
      return S("def");
    case 13:
      return S("effect");
    case 6:
      return S("function");
    default:
      return S("!Fehler!");
  }
}

export function C4VObj(pObj) {
  return new C4Value().init$pC4PropList(pObj);
}

export function C4VInt(i) {
  return new C4Value().init$i32(i);
}

export function C4VBool(b) {
  return new C4Value().init$b(b);
}

export function C4VPropList(p) {
  return new C4Value().init$pC4PropList(p);
}

export function C4VString$pC4String(pStr) {
  return new C4Value().init$pC4String(pStr);
}

export function C4VString$StdStrBuf(strString) {
  return new C4Value().init$StdStrBuf(strString);
}

export function C4VString$pi8(strString) {
  return new C4Value().init$pi8(strString);
}

export function C4VArray(pArray) {
  return new C4Value().init$pC4ValueArray(pArray);
}

export function C4VFunction(pFn) {
  return new C4Value().init$pC4AulFunc(pFn);
}

export function ComparisonImpl(Value1, Value2) {
  let Type1 = Value1.GetType();
  let Data1 = Value1.GetData();
  let Type2 = Value2.GetType();
  let Data2 = Value2.GetData();
  switch (Type1) {
    case 0:
      0;
      return Type1 === Type2;
    case 1:
    case 2:
      return (Type2 === 1 || Type2 === 2) && Data1.Int === Data2.Int;
    case 3:
      return Type1 === Type2 && Data1.PropList.op_eq(Data2.PropList);
    case 4:
      return Type1 === Type2 && Data1.Str === Data2.Str;
    case 5:
      return Type1 === Type2 && (Data1.Array === Data2.Array || Data1.Array.op_eq(Data2.Array));
    case 6:
      return Type1 === Type2 && Data1.Fn === Data2.Fn;
    default:
      0;
      return Data1.op_void_() === Data2.op_void_();
  }
}

export function $init(): void {
  $.C4VNull = new C4Value(); $.C4VNull.init$v();
}

Object.assign($, { C4JSONSerializationError, C4VArray, C4VBool, C4VFunction, C4VInt, C4VObj, C4VPropList, C4VString$StdStrBuf, C4VString$pC4String, C4VString$pi8, C4V_Data, C4Value, C4ValueNumbers, ComparisonImpl, GetC4VName, Nillable$i32, Nillable$i64, Nillable$pC4Def, Nillable$pC4String, Nillable$pC4ValueArray, Seen });
