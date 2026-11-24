// @ts-nocheck
// OpenClonk 36de799: src/object/C4ObjectPtr.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { P } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';

export class C4ObjectPtr {
  static Null;
  data = new C4ObjectPtr$$anon1();

  init$v() {
    this.data = new C4ObjectPtr$$anon1();
    return this;
  }

  init$pC4Object(pObj) {
    this.data = new C4ObjectPtr$$anon1();
    this.data.ptr = pObj;
    return this;
  }

  CompileFunc(pComp) {
    0;
    const nptr = [0];
    if (!pComp.isDeserializer() && this.data.ptr != null) {
      nptr[0] = this.data.ptr.Number;
    }
    pComp.Value$ri32(P(nptr, 0));
    if (pComp.isDeserializer()) {
      this.data.nptr = nptr[0];
    }
  }

  DenumeratePointers() {
    0;
    0;
    this.data.ptr = $.Objects.ObjectPointer(this.data.nptr);
  }

  op_not() {
    0;
    return this.data.ptr == null;
  }

  op_eq$pC4Object(other) {
    0;
    return this.data.ptr === other;
  }

  op_eq$C4ObjectPtr(other) {
    0;
    return this.data.ptr === other.data.ptr;
  }

  op_ne$pC4Object(other) {
    0;
    return this.data.ptr !== other;
  }

  op_ne$C4ObjectPtr(other) {
    0;
    return this.data.ptr !== other.data.ptr;
  }

  op_assign(object) {
    this.data.ptr = object;
    return this.$clone();
  }

  op_mul() {
    0;
    return this.data.ptr;
  }

  op_arrow() {
    0;
    return this.data.ptr;
  }

  op_C4Object_() {
    0;
    return this.data.ptr;
  }

  $clone() { return new C4ObjectPtr().$assign(this); }
  $assign(o) {
    this.data.$assign(o.data);
    return this;
  }
}

export class C4ObjectPtr$$anon1 {
  $v = null;
  get ptr() { const v = this.$v; return v === 0 ? null : v; }
  set ptr(v) { this.$v = v; }
  get nptr() { const v = this.$v; return v === null ? 0 : v; }
  set nptr(v) { this.$v = v; }
  $clone() { const u = new C4ObjectPtr$$anon1(); u.$v = this.$v; return u; }
  $assign(o) { this.$v = o.$v; return this; }
}

export function $init(): void {
  C4ObjectPtr.Null = new C4ObjectPtr().init$pC4Object(null);
}

Object.assign($, { C4ObjectPtr, C4ObjectPtr$$anon1 });
