// @ts-nocheck
// OpenClonk 36de799: src/c4group/C4Extra.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete } from '../../rt/std.ts';

export class C4Extra {
  ExtraGroups = [];

  init() {
    this.ExtraGroups = [];
    return this;
  }

  Init() {
    let $t1;
    if (this.ExtraGroups.length === 0) {
      return true;
    }
    const szSegment = new Int8Array(4097);
    for (let cseg = 0; $.SCopySegment(P($.Game.DefinitionFilenames, 0), cseg, P(szSegment, 0), 59, 4096); cseg = cseg + 1 | 0) {
      $t1 = this.ExtraGroups;
      for (let $i2 = 0; $i2 < $t1.length; $i2++) {
        const ExtraGroup = P($t1, $i2);
        if (this.LoadDef(ExtraGroup.a[ExtraGroup.o], $.GetFilename$2(P(szSegment, 0)))) {
          break;
        }
      }
    }
    return true;
  }

  InitGroup() {
    let $t1, $t2, $t3;
    $t1 = $.Reloc;
    $t2 = $t1.begin();
    $t3 = $t1.end();
    for (; $.op_ne$C4Reloc$const_iterator$C4Reloc$const_iterator($t2, $t3); $t2.op_inc()) {
      const iter = $t2.op_mul();
      let pGroup = new $.C4Group().init();
      if (pGroup.Open(iter.strBuf.op_add$pi8(S("/")).op_add$pi8(S("Extra.ocg")).getData())) {
        this.ExtraGroups.push(pGroup);
      }
    }
    return true;
  }

  LoadDef(hGroup, szName) {
    if (!hGroup.FindEntry$pi8$pStdStrBuf$pu64(szName)) {
      return false;
    }
    $.LogF($.LoadResStr(S("IDS_PRC_LOADEXTRA")), hGroup.GetName(), szName);
    let pGrp = new $.C4Group().init();
    if (!pGrp.OpenAsChild(hGroup, szName)) {
      $.Log($.LoadResStr(S("IDS_ERR_FAILURE")));
      $delete(pGrp);
      return false;
    }
    $.Game.GroupSet.RegisterGroup(pGrp, true, 3, 47);
    return true;
  }

  $clone() { return new C4Extra().$assign(this); }
  $assign(o) {
    this.ExtraGroups = o.ExtraGroups.slice();
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4Extra });
