// @ts-nocheck
// OpenClonk 36de799: src/lib/StdMeshLoaderDataStream.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $i64n, $u64n } from '../../rt/int.ts';
import { c$memchr, c$memcpy } from '../../rt/libc.ts';
import { $padd, $peq, $reinterp, $reinterpVoid, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $throw, StdString } from '../../rt/std.ts';

export class DataStream {
  begin = null;
  cursor = null;
  end = null;

  init(src, length) {
    this.begin = this.cursor = src;
    this.end = $padd(this.cursor, length);
    return this;
  }

  AtEof() {
    return $peq(this.cursor, this.end);
  }

  GetRemainingBytes() {
    return $u64n(this.end.o - this.cursor.o);
  }

  Seek(offset) {
    if (offset > 0 && this.GetRemainingBytes() < $u64n(offset)) {
      $throw(new $.InsufficientData().init());
    }
    if (this.cursor.o - this.begin.o < -offset) {
      $throw(new $.InsufficientData().init());
    }
    this.cursor = this.cursor.add(offset);
  }

  Peek$v$5() {
    if (this.GetRemainingBytes() < 2) {
      $throw(new $.InsufficientData().init());
    }
    const temp = Uint16Array.of(0);
    c$memcpy($reinterp(P(temp, 0), "i8"), this.cursor, 2);
    return temp[0];
  }

  Peek$px$u64(dest, size) {
    if (this.GetRemainingBytes() < size) {
      $throw(new $.InsufficientData().init());
    }
    c$memcpy(dest, this.cursor, size);
  }

  Read$px$u64(dest, size) {
    this.Peek$px$u64(dest, size);
    this.cursor = this.cursor.add(size);
  }

  Peek$v$2() {
    if (this.GetRemainingBytes() < 1) {
      $throw(new $.InsufficientData().init());
    }
    return this.cursor.a[this.cursor.o] !== 0;
  }

  Peek$v() {
    let terminator = $reinterpVoid(c$memchr(this.cursor, 10, this.GetRemainingBytes()), "i8");
    if (terminator == null) {
      $throw(new $.InsufficientData().init(S("Unterminated string")));
    }
    return StdString.of(this.cursor, terminator);
  }

  Read$v() {
    let temp = this.Peek$v();
    this.Seek($i64n(temp.size() + 1));
    return temp;
  }

  Peek$v$4() {
    if (this.GetRemainingBytes() < 4) {
      $throw(new $.InsufficientData().init());
    }
    const temp = Uint32Array.of(0);
    c$memcpy($reinterp(P(temp, 0), "i8"), this.cursor, 4);
    return temp[0];
  }

  Peek$v$3() {
    if (this.GetRemainingBytes() < 4) {
      $throw(new $.InsufficientData().init());
    }
    const temp = Float32Array.of(0);
    c$memcpy($reinterp(P(temp, 0), "i8"), this.cursor, 4);
    return temp[0];
  }

  Read$v$5() {
    let temp = this.Peek$v$5();
    this.Seek(2);
    return temp;
  }

  Read$v$4() {
    let temp = this.Peek$v$4();
    this.Seek(4);
    return temp;
  }

  Read$v$2() {
    let temp = this.Peek$v$2();
    this.Seek(1);
    return temp;
  }

  Read$v$3() {
    let temp = this.Peek$v$3();
    this.Seek(4);
    return temp;
  }

  $clone() { return new DataStream().$assign(this); }
  $assign(o) {
    this.begin = o.begin;
    this.cursor = o.cursor;
    this.end = o.end;
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { DataStream });
