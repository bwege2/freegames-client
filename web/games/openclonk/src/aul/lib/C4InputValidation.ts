// @ts-nocheck
// OpenClonk 36de799: src/lib/C4InputValidation.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { StdCopyStrBuf } from './StdBuf.ts';
import { $ } from '../../rt/registry.ts';

export class ValidatedStdCopyStrBufBase extends StdCopyStrBuf {

  init$v() {
    return this;
  }

  $dtor() {
    super.$dtor();
  }

  $clone() { return new ValidatedStdCopyStrBufBase().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class ValidatedStdCopyStrBuf$3 extends ValidatedStdCopyStrBufBase {

  init$v() {
    super.init$v();
    return this;
  }

  $clone() { return new ValidatedStdCopyStrBuf$3().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class ValidatedStdCopyStrBuf$10 extends ValidatedStdCopyStrBufBase {

  init$v() {
    super.init$v();
    return this;
  }

  $clone() { return new ValidatedStdCopyStrBuf$10().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { ValidatedStdCopyStrBuf$10, ValidatedStdCopyStrBuf$3, ValidatedStdCopyStrBufBase });
