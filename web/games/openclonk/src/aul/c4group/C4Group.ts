// @ts-nocheck
// OpenClonk 36de799: src/c4group/C4Group.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { CStdStream } from './CStdFile.ts';
import { $cs, $ta, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';

export class C4GroupHeader {
  Id = $cs(S("RedWolf Design GrpFolder"), 28);
  Ver1 = $.C4GroupFileVer1$C4Group;
  Ver2 = $.C4GroupFileVer2$C4Group;
  Entries = 0;
  Reserved = $ta(Int8Array, 164, [0]);

  $clone() { return new C4GroupHeader().$assign(this); }
  $assign(o) {
    this.Id = o.Id.slice();
    this.Ver1 = o.Ver1;
    this.Ver2 = o.Ver2;
    this.Entries = o.Entries;
    this.Reserved = o.Reserved.slice();
    return this;
  }
}

export class C4Group extends CStdStream {
  p = null;
  Head = new C4GroupHeader();

  $clone() { return new C4Group().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.p = o.p;
    this.Head.$assign(o.Head);
    return this;
  }
}



export function $init(): void {
  $.C4GroupFileVer1$C4Group = 1;
  $.C4GroupFileVer2$C4Group = 2;
}

Object.assign($, { C4Group, C4GroupHeader });
