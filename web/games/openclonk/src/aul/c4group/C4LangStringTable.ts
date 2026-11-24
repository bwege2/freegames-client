// @ts-nocheck
// OpenClonk 36de799: src/c4group/C4LangStringTable.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $ } from '../../rt/registry.ts';
import { StdException } from '../../rt/std.ts';

export class C4LangStringTable$NoSuchTranslation extends StdException {

  init(text) {
    return this;
  }

  $clone() { return new C4LangStringTable$NoSuchTranslation().$assign(this); }
  $assign(o) {
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4LangStringTable$NoSuchTranslation });
