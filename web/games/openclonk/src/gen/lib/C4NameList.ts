// @ts-nocheck
// OpenClonk 36de799: src/lib/C4NameList.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { c$memcmp } from '../../rt/libc.ts';
import { $own, $ta, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';

export class C4NameList {
  Name = [
  $ta(Int8Array, 31, [0]),
  new Int8Array(31),
  new Int8Array(31),
  new Int8Array(31),
  new Int8Array(31),
  new Int8Array(31),
  new Int8Array(31),
  new Int8Array(31),
  new Int8Array(31),
  new Int8Array(31),
];
  Count = $ta(Int32Array, 10, [0]);

  Clear() {
    $.InplaceReconstruct$pC4NameList(this);
  }

  Add(szName, iCount = 0) {
    for (let cnt = 0; cnt < 10; cnt = cnt + 1 | 0) {
      if (this.Name[cnt][0] === 0) {
        $.SCopy$pi8$pi8$u64(szName, P(this.Name[cnt], 0), 30);
        this.Count[cnt] = iCount;
        return true;
      }
    }
    return false;
  }

  Set(szName, iCount) {
    let cnt = 0;
    for (cnt = 0; cnt < 10; cnt = cnt + 1 | 0) {
      if ($.SEqual(P(this.Name[cnt], 0), szName)) {
        this.Count[cnt] = iCount;
        return true;
      }
    }
    for (cnt = 0; cnt < 10; cnt = cnt + 1 | 0) {
      if (this.Name[cnt][0] === 0) {
        $.SCopy$pi8$pi8$u64(szName, P(this.Name[cnt], 0), 30);
        this.Count[cnt] = iCount;
        return true;
      }
    }
    return false;
  }

  IsEmpty() {
    for (const cnt of this.Name) {
      if (cnt[0] !== 0) {
        return false;
      }
    }
    return true;
  }

  op_eq(rhs) {
    return !(c$memcmp(this, rhs, 352) !== 0);
  }

  CompileFunc(pComp, fValues = true) {
    let deserializing = pComp.isDeserializer();
    for (let cnt = 0; cnt < 10; cnt = cnt + 1 | 0) {
      if (deserializing || this.Name[cnt][0] !== 0) {
        if (cnt !== 0) {
          pComp.Separator(2 /*SEP_SEP2*/);
        }
        pComp.Value$StdDefaultAdapt$StdStringAdapt$x($.mkDefaultAdapt$mStdStringAdapt$x($.mkStringAdapt$pi8$i32$i32(P(this.Name[cnt], 0), 30, 2 /*RCT_Idtf*/), S("")));
        if (fValues) {
          pComp.Separator(3 /*SEP_SET*/);
          pComp.Value$StdDefaultAdapt$i32$i32($.mkDefaultAdapt$ri32$i32(P(this.Count, cnt), 0));
        }
      }
    }
  }

  $clone() { return new C4NameList().$assign(this); }
  $assign(o) {
    this.Name = $own(o.Name.map(($e0) => $e0.slice()));
    this.Count = o.Count.slice();
    return this;
  }
}


export function $init(): void {
  $.C4MaxNameList$C4NameList = 10;
}

Object.assign($, { C4NameList });
