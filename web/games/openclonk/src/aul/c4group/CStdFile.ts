// @ts-nocheck
// OpenClonk 36de799: src/c4group/CStdFile.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $ } from '../../rt/registry.ts';

export class CStdStream {

  $clone() { return new CStdStream().$assign(this); }
  $assign(o) {
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { CStdStream });
