// @ts-nocheck
// OpenClonk 36de799: src/object/C4Id.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $copy, StdMap, StdPair, StdString } from '../../rt/std.ts';

export class C4ID {
  static lookup;
  static names;
  static None;
  static Clonk;
  static Bubble;
  static EditorBase;
  v = 0;

  assign(s) {
    let it = C4ID.lookup.find(s);
    if (!it.eq(C4ID.lookup.end())) {
      this.v = it.v.second;
    } else {
      this.v = C4ID.names.length;
      C4ID.names.push(s);
      C4ID.lookup.insertPair(new StdPair($copy(s), this.v));
    }
  }

  init$v() {
    this.v = C4ID.None.v;
    return this;
  }

  init$string(s) {
    C4ID.prototype.assign.call(this, s);
    return this;
  }

  init$StdStrBuf(s) {
    C4ID.prototype.assign.call(this, StdString.of(s.getData()));
    return this;
  }

  init$u64(i) {
    this.v = i;
    0;
    return this;
  }

  ToString() {
    0;
    return C4ID.names[this.v].c_str();
  }

  op_basic_string() {
    0;
    return C4ID.names[this.v].$clone();
  }

  GetHandle() {
    return this.v;
  }

  CompileFunc(comp) {
    if (comp.isSerializer()) {
      0;
      comp.String$pi8$u64$i32(P(C4ID.names[this.v].d, 0), C4ID.names[this.v].size(), 4 /*RCT_ID*/);
    } else {
      const data = [null];
      comp.String$ppi8$i32(P(data, 0), 4 /*RCT_ID*/);
      this.v = new C4ID().init$string(StdString.of(data[0])).v;
      $.StdBuf.DeletePointer(data[0]);
    }
  }

  op_eq(other) {
    return C4ID.names[this.v].eq(C4ID.names[other.v]);
  }

  op_ne(other) {
    return C4ID.names[this.v].ne(C4ID.names[other.v]);
  }

  op_lt(other) {
    return C4ID.names[this.v].lt(C4ID.names[other.v]);
  }

  op_gt(other) {
    return C4ID.names[this.v].gt(C4ID.names[other.v]);
  }

  op_le(other) {
    return C4ID.names[this.v].le(C4ID.names[other.v]);
  }

  op_ge(other) {
    return C4ID.names[this.v].ge(C4ID.names[other.v]);
  }

  op_unsigned_long_C4ID_() {
    return this.v === C4ID.None.v ? null : "v";
  }

  $clone() { return new C4ID().$assign(this); }
  $assign(o) {
    this.v = o.v;
    return this;
  }
}

export function $init(): void {
  C4ID.lookup = new StdMap();
  C4ID.names = [];
  C4ID.None = new C4ID().init$string(StdString.of(S("None")));
  C4ID.Clonk = new C4ID().init$string(StdString.of(S("Clonk")));
  C4ID.Bubble = new C4ID().init$string(StdString.of(S("Fx_Bubble")));
  C4ID.EditorBase = new C4ID().init$string(StdString.of(S("EditorBase")));
}

Object.assign($, { C4ID });
