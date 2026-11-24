// @ts-nocheck
// OpenClonk 36de799: src/c4group/C4ComponentHost.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $ } from '../../rt/registry.ts';

export class C4ComponentHost {
  Data = new $.StdCopyStrBuf();
  Filename = new $.StdCopyStrBuf();
  FilePath = new $.StdCopyStrBuf();

  $dtor() {
    C4ComponentHost.prototype.Clear.call(this);
  }

  GetFilePath() {
    return this.FilePath.getData();
  }

  Clear() {
    this.Data.Clear();
    this.OnLoad();
  }

  GetDataBuf() {
    return this.Data;
  }

  OnLoad() {
  }

  $clone() { return new C4ComponentHost().$assign(this); }
  $assign(o) {
    this.Data.$assign(o.Data);
    this.Filename.$assign(o.Filename);
    this.FilePath.$assign(o.FilePath);
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4ComponentHost });
