// @ts-nocheck
// OpenClonk 36de799: src/object/C4ObjectInfo.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { c$snprintf, c$time } from '../../rt/libc.ts';
import { $padd, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { C4ObjectInfoCore } from './C4InfoCore.ts';

export class C4ObjectInfo extends C4ObjectInfoCore {
  WasInAction = false;
  InAction = false;
  InActionTime = 0;
  HasDied = false;
  ControlCount = 0;
  pDef = null;
  Filename = new Int8Array(4097);
  Next = null;

  init() {
    super.init();
    C4ObjectInfo.prototype.Default$v.call(this);
    return this;
  }

  $dtor() {
    C4ObjectInfo.prototype.Clear.call(this);
  }

  Default$v() {
    this.WasInAction = false;
    this.InAction = false;
    this.InActionTime = 0;
    this.HasDied = false;
    this.ControlCount = 0;
    this.Filename[0] = 0;
    this.Next = null;
    this.pDef = null;
  }

  Clear() {
    this.pDef = null;
  }

  Evaluate() {
    this.Retire();
    if (this.WasInAction) {
      this.Rounds = this.Rounds + 1 | 0;
    }
  }

  Retire() {
    if (!this.InAction) {
      return;
    }
    this.InAction = false;
    this.TotalPlayingTime = this.TotalPlayingTime + ($.Game.Time - this.InActionTime | 0) | 0;
  }

  Recruit() {
    if (this.InAction) {
      return;
    }
    this.WasInAction = true;
    this.InAction = true;
    this.InActionTime = $.Game.Time;
    let pDef = $.Definitions.ID2Def(this.id.$clone());
    if (pDef != null && pDef.pRankNames != null) {
      let sRank = pDef.pRankNames.GetRankName(this.Rank, true);
      if (sRank.op_const_void_() != null) {
        this.sRankName.Copy$StdStrBuf(sRank);
      }
    }
  }

  SetBirthday() {
    this.Birthday = c$time(null) | 0;
  }

  Save$rC4Group$b$pC4DefList(hGroup, fStoreTiny, pDefs) {
    const szTempGroup = new Int8Array(4097);
    $.SCopy$pi8$pi8$u64(P(this.Name, 0), P(szTempGroup, 0), 4096);
    $.MakeFilenameFromTitle(P(szTempGroup, 0));
    $.SAppend(S(".oci"), P(szTempGroup, 0), 4096);
    if (!$.SEqualNoCase(P(this.Filename, 0), P(szTempGroup, 0))) {
      if (this.Filename[0] === 0) {
        $.SCopy$pi8$pi8$u64(P(szTempGroup, 0), P(this.Filename, 0), 4096);
        while (hGroup.FindEntry$pi8$pStdStrBuf$pu64(P(this.Filename, 0))) {
          $.RemoveExtension$pi8(P(this.Filename, 0));
          let iFinNum = $.GetTrailingNumber(P(this.Filename, 0));
          let iLen = $.SLen(P(this.Filename, 0)) | 0;
          while (iLen !== 0 && $.Inside$i8$i8$i8(this.Filename[iLen - 1 | 0], 48, 57)) {
            iLen = iLen - 1 | 0;
          }
          if (iLen > 4074) {
            $.LogF(S("Error generating unique filename for %s(%s): Path overflow"), P(this.Name, 0), hGroup.GetFullName().getData());
            break;
          }
          c$snprintf($padd(P(this.Filename, 0), iLen), 22, S("%d"), iFinNum + 1 | 0);
          $.EnforceExtension$pi8$pi8(P(this.Filename, 0), S("oci"));
        }
      } else {
        if (!hGroup.FindEntry$pi8$pStdStrBuf$pu64(P(szTempGroup, 0))) {
          if (hGroup.Rename(P(this.Filename, 0), P(szTempGroup, 0))) {
            $.SCopy$pi8$pi8$u64(P(szTempGroup, 0), P(this.Filename, 0), 4096);
          } else {
            $.LogF(S("Error adjusting crew info for %s into %s: Rename error from %s to %s!"), P(this.Name, 0), hGroup.GetFullName().getData(), P(this.Filename, 0), P(szTempGroup, 0));
          }
        }
      }
    }
    let hTemp = new $.C4Group().init();
    if (!hTemp.OpenAsChild(hGroup, P(this.Filename, 0), false, true)) {
      return false;
    }
    if (pDefs != null && !fStoreTiny) {
      let pDef = pDefs.ID2Def(this.id.$clone());
      if (pDef != null) {
        if (pDef.pRankSymbols != null) {
          let fctRankSymbol = new $.C4FacetSurface().init();
          if ($.C4RankSystem.DrawRankSymbol(fctRankSymbol, this.Rank, pDef.pRankSymbols, pDef.iNumRankSymbols, true)) {
            fctRankSymbol.GetFace().SavePNG$rC4Group$pi8$b$b(hTemp, S("Rank.png"));
          }
        } else {
          hTemp.Delete(S("Rank.png"));
        }
      }
    }
    if (!$.C4ObjectInfoCore.prototype.Save$rC4Group$pC4DefList.call(this, hTemp, pDefs)) {
      hTemp.Close$v();
      return false;
    }
    hTemp.Close$v();
    return true;
  }

  Load$rC4Group(hGroup) {
    $.SCopy$pi8$pi8$u64($.GetFilename(hGroup.GetName()), P(this.Filename, 0), 255);
    return $.C4ObjectInfoCore.prototype.Load$rC4Group.call(this, hGroup);
  }

  Load$rC4Group$pi8(hMother, szEntryname) {
    if ($.SEqualNoCase($.GetExtension(szEntryname), S("oci"))) {
      let hChild = new $.C4Group().init();
      if (hChild.OpenAsChild(hMother, szEntryname)) {
        if (!C4ObjectInfo.prototype.Load$rC4Group.call(this, hChild)) {
          hChild.Close$v();
          return false;
        }
        this.pDef = $.C4Id2Def(this.id.$clone());
        hChild.Close$v();
        return true;
      }
    }
    return false;
  }

  $clone() { return new C4ObjectInfo().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.WasInAction = o.WasInAction;
    this.InAction = o.InAction;
    this.InActionTime = o.InActionTime;
    this.HasDied = o.HasDied;
    this.ControlCount = o.ControlCount;
    this.pDef = o.pDef;
    this.Filename = o.Filename.slice();
    this.Next = o.Next;
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4ObjectInfo });
