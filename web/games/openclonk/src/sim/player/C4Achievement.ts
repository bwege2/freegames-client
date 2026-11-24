// @ts-nocheck
// OpenClonk 36de799: src/player/C4Achievement.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $padd, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, StdMap } from '../../rt/std.ts';

export class C4AchievementGraphics {
  Graphics = new StdMap((a, b) => a.op_lt(b));
  idGrp = 0;

  Init$rC4Group(File) {
    const FileName = new Int8Array(255);
    File.ResetSearch();
    while (File.FindNextEntry$pi8$pi8$pu64$b(S("Achv*.png"), P(FileName, 0))) {
      let new_fct = new $.C4FacetSurface().init();
      if (!new_fct.Load(File, P(FileName, 0), -2, -1, false, 0)) {
        $delete(new_fct);
        $.LogF($.LoadResStr(S("IDS_PRC_NOGFXFILE")), P(FileName, 0), $.LoadResStr(S("IDS_ERR_NOFILE")));
        return false;
      }
      $.RemoveExtension$pi8(P(FileName, 0));
      let id_offset = $.SCharPos(42, S("Achv*.png"));
      0;
      let sFileName = new $.StdCopyStrBuf().init$pi8$b($padd(P(FileName, 0), id_offset));
      let i = this.Graphics.find(sFileName);
      if (!i.eq(this.Graphics.end())) {
        $delete(i.v.second);
      }
      this.Graphics.entry(sFileName, () => null).second = new_fct;
    }
    return true;
  }

  Init$rC4GroupSet(Files) {
    const idNewGrp = [0];
    let pGrp = Files.FindEntry(S("Achv*.png"), null, P(idNewGrp, 0));
    if (pGrp == null) {
      return true;
    }
    if (idNewGrp[0] === this.idGrp) {
      return true;
    }
    this.idGrp = idNewGrp[0];
    return this.Init$rC4Group(pGrp);
  }

  Clear() {
    for (const Graphic of this.Graphics) {
      $delete(Graphic.second);
    }
    this.Graphics.clear();
    this.idGrp = 0;
  }

  FindByName(name) {
    let i = this.Graphics.find(new $.StdCopyStrBuf().init$pi8$b(name));
    if (!i.eq(this.Graphics.end())) {
      return i.v.second;
    } else {
      return null;
    }
  }

  $clone() { return new C4AchievementGraphics().$assign(this); }
  $assign(o) {
    this.Graphics = o.Graphics.$clone();
    this.idGrp = o.idGrp;
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4AchievementGraphics });
