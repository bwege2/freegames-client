// @ts-nocheck
// OpenClonk 36de799: src/network/C4NetIO.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $ } from '../../rt/registry.ts';

export class C4NetIO$HostAddress {
  $u1 = new C4NetIO$HostAddress$$anon1();

  init$v() {
    C4NetIO$HostAddress.prototype.Clear.call(this);
    return this;
  }

  $copy(other) {
    this.SetHost$C4NetIO$HostAddress(other);
    return this;
  }
  $clone() { return new C4NetIO$HostAddress().$copy(this); }
  $assign(o) {
    this.$u1.$assign(o.$u1);
    return this;
  }
}

export class C4NetIO$HostAddress$$anon1 {
  $v = 0;
  get gen() { return this.$v; }
  set gen(v) { this.$v = v; }
  get v4() { return this.$v; }
  set v4(v) { this.$v = v; }
  get v6() { return this.$v; }
  set v6(v) { this.$v = v; }
  $clone() { const u = new C4NetIO$HostAddress$$anon1(); u.$v = this.$v; return u; }
  $assign(o) { this.$v = o.$v; return this; }
}

export class C4NetIO$EndpointAddress extends C4NetIO$HostAddress {
  static IPPORT_NONE;

  init$v() {
    super.init$v();
    this.Clear();
    return this;
  }

  $copy(other) {
    super.init$v();
    this.SetAddress$C4NetIO$EndpointAddress(other);
    return this;
  }
  $clone() { return new C4NetIO$EndpointAddress().$copy(this); }
  $assign(other) {
    this.SetAddress$C4NetIO$EndpointAddress(other);
    return this;
  }
}

export function $init(): void {
  C4NetIO$EndpointAddress.IPPORT_NONE = 0;
}

Object.assign($, { C4NetIO$EndpointAddress, C4NetIO$HostAddress, C4NetIO$HostAddress$$anon1 });
