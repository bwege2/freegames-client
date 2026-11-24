// @ts-nocheck
// OpenClonk 36de799: src/platform/C4TimeMilliseconds.cpp, src/platform/C4TimeMilliseconds.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $N } from '../../rt/native.ts';
import { S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';

export class C4TimeMilliseconds {
  time = 0;
  inf = 0 /*NoInfinity*/;

  static Now(...a) { return $N.C4TimeMilliseconds_Now.apply(this, a); } // rt/native.ts

  init$u32(millis) {
    this.time = millis;
    this.inf = 0 /*NoInfinity*/;
    return this;
  }

  init$i32(infinity) {
    this.time = 0;
    this.inf = infinity;
    return this;
  }

  AsInt() {
    return this.time;
  }

  IsInfinite() {
    return this.inf !== 0;
  }

  AsString() {
    if (this.inf === 1) {
      return new $.StdCopyStrBuf().init$pi8$b(S("POSITIVE INFINITY"));
    }
    if (this.inf === -1) {
      return new $.StdCopyStrBuf().init$pi8$b(S("NEGATIVE INFINITY"));
    }
    let string = new $.StdCopyStrBuf();
    string.Format(S("%u:%02u:%02u:%03u:"), ((this.time / 1000 >>> 0) / 60 >>> 0) / 60 >>> 0, ((this.time / 1000 >>> 0) / 60 >>> 0) % 60, (this.time / 1000 >>> 0) % 60, this.time % 1000);
    return new $.StdCopyStrBuf().init$StdCopyStrBuf$b(string);
  }

  op_subAssign(rhs) {
    this.time = this.time - rhs >>> 0;
    return this;
  }

  op_addAssign(rhs) {
    this.time = this.time + rhs >>> 0;
    return this;
  }

  $clone() { return new C4TimeMilliseconds().$assign(this); }
  $assign(o) {
    this.time = o.time;
    this.inf = o.inf;
    return this;
  }
}

export function op_eq$C4TimeMilliseconds$C4TimeMilliseconds(lhs, rhs) {
  return lhs.inf === rhs.inf && lhs.time === rhs.time;
}

export function op_lt(lhs, rhs) {
  if (lhs.inf !== 0 || rhs.inf !== 0) {
    return lhs.inf < rhs.inf;
  }
  return lhs.time < rhs.time;
}

export function op_ne$C4TimeMilliseconds$C4TimeMilliseconds(lhs, rhs) {
  return !op_eq$C4TimeMilliseconds$C4TimeMilliseconds(lhs, rhs);
}

export function op_gt(lhs, rhs) {
  return op_lt(rhs, lhs);
}

export function op_le(lhs, rhs) {
  return !op_gt(lhs, rhs);
}

export function op_ge(lhs, rhs) {
  return !op_lt(lhs, rhs);
}

export function op_add$C4TimeMilliseconds$u32(lhs, rhs) {
  lhs.op_addAssign(rhs);
  return lhs.$clone();
}

export function op_sub$C4TimeMilliseconds$u32(lhs, rhs) {
  lhs.op_subAssign(rhs);
  return lhs.$clone();
}

export function op_sub$C4TimeMilliseconds$C4TimeMilliseconds(lhs, rhs) {
  if (lhs.inf !== 0 || rhs.inf !== 0) {
    let infinityTo = lhs.inf - rhs.inf | 0;
    if (infinityTo < 0) {
      return -0x80000000;
    }
    if (infinityTo > 0) {
      return 0x7fffffff;
    }
    return 0;
  }
  return lhs.time - rhs.time >>> 0 | 0;
}

export function $init(): void {
}

Object.assign($, { C4TimeMilliseconds, op_add$C4TimeMilliseconds$u32, op_eq$C4TimeMilliseconds$C4TimeMilliseconds, op_ge, op_gt, op_le, op_lt, op_ne$C4TimeMilliseconds$C4TimeMilliseconds, op_sub$C4TimeMilliseconds$C4TimeMilliseconds, op_sub$C4TimeMilliseconds$u32 });
