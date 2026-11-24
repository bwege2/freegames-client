// @ts-nocheck
// OpenClonk 36de799: src/gui/C4Folder.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete } from '../../rt/std.ts';

export class C4FolderHead {
  static $layout = [["Index", 0, "i32", 0]];
  static $size = 4;
  Index = 0;

  Default() {
    this.Index = 0;
  }

  CompileFunc(pComp) {
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Index"), S("Index"), 0));
  }

  $clone() { return new C4FolderHead().$assign(this); }
  $assign(o) {
    this.Index = o.Index;
    return this;
  }
}

export class C4Folder {
  static $layout = [["Head.Index", 0, "i32", 0]];
  static $size = 4;
  Head = new C4FolderHead();

  init() {
    this.Head = new C4FolderHead();
    C4Folder.prototype.Default.call(this);
    return this;
  }

  Default() {
    this.Head.Default();
  }

  Load(hGroup) {
    const pSource = [null];
    if (!hGroup.LoadEntry$pi8$ppi8$pu64$i32(S("Folder.txt"), P(pSource, 0), null, 1)) {
      return false;
    }
    if (!this.Compile(pSource[0])) {
      $delete(pSource[0]);
      return false;
    }
    $delete(pSource[0]);
    return true;
  }

  CompileFunc(pComp) {
    pComp.Value$StdNamingAdapt$C4FolderHead($.mkNamingAdapt$rC4FolderHead$pi8(this.Head, S("Head")));
  }

  Compile(szSource) {
    this.Default();
    return $.CompileFromBuf_LogWarn$rC4Folder$x$pi8(this, new $.StdStrBuf().init$pi8$b(szSource), S("Folder.txt"));
  }

  $clone() { return new C4Folder().$assign(this); }
  $assign(o) {
    this.Head.$assign(o.Head);
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4Folder, C4FolderHead });
