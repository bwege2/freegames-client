// @ts-nocheck
// OpenClonk 36de799: src/control/C4PlayerInfoConflicts.cpp, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $u64n } from '../../rt/int.ts';
import { c$sqrt } from '../../rt/libc.ts';
import { UnsyncedRandom$u32 } from '../../rt/native.ts';
import { $rd, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, $max, $min } from '../../rt/std.ts';

export class C4PlayerInfoListAttributeConflictResolver {
  ppCheckInfos = null;
  iCheckInfoCount = 0;
  rPriCheckList = null;
  rSecCheckList = null;
  pSecPacket = null;
  eAttr = 0;
  pResolvePacket = null;
  fAnyChange = false;
  pResolveInfo = null;
  fCurrentConflict = false;
  fOriginalConflict = false;
  fAlternateConflict = false;
  pLowPrioOriginalConflictPacket = null;
  pLowPrioAlternateConflictPacket = null;

  init(rPriCheckList, rSecCheckList, pSecPacket) {
    this.ppCheckInfos = null;
    this.iCheckInfoCount = 0;
    this.pSecPacket = pSecPacket;
    this.rPriCheckList = rPriCheckList;
    this.rSecCheckList = rSecCheckList;
    let $t1, $t2;
    let iMaxCheckCount = rPriCheckList.GetInfoCount() + (!(pSecPacket == null) ? 1 : 0) | 0;
    if (iMaxCheckCount === 0) {
      return this;
    }
    this.ppCheckInfos = P(new Array($u64n(iMaxCheckCount)).fill(null), 0);
    for (let i = 0; i < rPriCheckList.GetInfoCount(); i = i + 1 | 0) {
      let pInfos = rPriCheckList.GetIndexedInfo(i);
      if (pInfos !== pSecPacket) {
        this.ppCheckInfos.a[this.ppCheckInfos.o + ($t1 = this.iCheckInfoCount, this.iCheckInfoCount = this.iCheckInfoCount + 1 | 0, $t1)] = pInfos;
      } else {
        this.pSecPacket = null;
      }
    }
    if (pSecPacket != null) {
      this.ppCheckInfos.a[this.ppCheckInfos.o + ($t2 = this.iCheckInfoCount, this.iCheckInfoCount = this.iCheckInfoCount + 1 | 0, $t2)] = pSecPacket;
    }
    return this;
  }

  $dtor() {
    $delete(this.ppCheckInfos);
  }

  ReaddInfoForCheck(pCheckAdd) {
    let $t1;
    for (let i = 0; i < this.iCheckInfoCount; i = i + 1 | 0) {
      if (this.ppCheckInfos.a[this.ppCheckInfos.o + i] === pCheckAdd) {
        return;
      }
    }
    this.ppCheckInfos.a[this.ppCheckInfos.o + ($t1 = this.iCheckInfoCount, this.iCheckInfoCount = this.iCheckInfoCount + 1 | 0, $t1)] = pCheckAdd;
  }

  GetAttributePriorityDifference(pInfo1, pPck1, pInfo2, pPck2) {
    if (pInfo1.IsJoined()) {
      return pInfo2.IsJoined() ? 0 : 1;
    }
    if (pInfo2.IsJoined()) {
      return -1;
    }
    let iTypeDiff = pInfo2.GetType() - pInfo1.GetType() | 0;
    if (iTypeDiff !== 0) {
      return iTypeDiff;
    }
    let iScoreDiff = pInfo1.getLeagueScore() - pInfo2.getLeagueScore() | 0;
    if (iScoreDiff !== 0) {
      return iScoreDiff;
    }
    if (pPck1.IsDeveloperPacket()) {
      return pPck2.IsDeveloperPacket() ? 0 : 1;
    }
    if (pPck2.IsDeveloperPacket()) {
      return -1;
    }
    return 0;
  }

  IsAttributeConflict(pInfo1, pInfo2, eLevel) {
    if (this.eAttr === 0) {
      let dwClr1 = pInfo1.GetColor();
      let dwClr2 = 0;
      switch (eLevel) {
        case 0:
          dwClr2 = pInfo2.GetColor();
          break;
        case 1:
          dwClr2 = pInfo2.GetOriginalColor();
          break;
        case 2:
          dwClr2 = pInfo2.GetAlternateColor();
          break;
      }
      return IsColorConflict(dwClr1, dwClr2);
    } else if (this.eAttr === 1) {
      let szName1 = pInfo1.GetName();
      let szName2 = S("");
      switch (eLevel) {
        case 0:
          szName2 = pInfo2.GetName();
          break;
        case 1:
          szName2 = pInfo2.GetOriginalName();
          break;
        default:
          return $.SEqualNoCase(szName1, szName2);
      }
    }
    return false;
  }

  MarkConflicts$rC4ClientPlayerInfos$b(rCheckPacket, fTestOriginal) {
    let pCheckAgainstInfo = null;
    for (let j = 0; (pCheckAgainstInfo = rCheckPacket.GetPlayerInfo$i32(j)) != null; j = j + 1 | 0) {
      if (pCheckAgainstInfo.IsUsingAttribute(this.eAttr)) {
        if (!(this.pResolveInfo.GetID() !== 0) || this.pResolveInfo.GetID() !== pCheckAgainstInfo.GetID()) {
          if (this.pResolveInfo !== pCheckAgainstInfo) {
            let fHasHigherPrio = this.GetAttributePriorityDifference(this.pResolveInfo, this.pResolvePacket, pCheckAgainstInfo, rCheckPacket) > 0;
            if (!fHasHigherPrio) {
              if (this.IsAttributeConflict(pCheckAgainstInfo, this.pResolveInfo, 0 /*PLRAL_Current*/)) {
                this.fCurrentConflict = true;
              }
            }
            if (fTestOriginal) {
              if (this.IsAttributeConflict(pCheckAgainstInfo, this.pResolveInfo, 1 /*PLRAL_Original*/)) {
                if (fHasHigherPrio && !this.fOriginalConflict && this.pLowPrioOriginalConflictPacket == null) {
                  this.pLowPrioOriginalConflictPacket = rCheckPacket;
                } else {
                  this.pLowPrioOriginalConflictPacket = null;
                  this.fOriginalConflict = true;
                }
              }
              if (this.IsAttributeConflict(pCheckAgainstInfo, this.pResolveInfo, 2 /*PLRAL_Alternate*/)) {
                if (fHasHigherPrio && !this.fAlternateConflict && this.pLowPrioAlternateConflictPacket == null) {
                  this.pLowPrioAlternateConflictPacket = rCheckPacket;
                } else {
                  this.fAlternateConflict = true;
                }
              }
            }
          }
        }
      }
    }
  }

  MarkConflicts$C4PlayerInfoList$b(rCheckList, fTestOriginal) {
    for (let i = 0; i < rCheckList.GetInfoCount(); i = i + 1 | 0) {
      this.MarkConflicts$rC4ClientPlayerInfos$b(rCheckList.GetIndexedInfo(i), fTestOriginal);
    }
  }

  ResolveInInfo() {
    let iTries = 0;
    this.fOriginalConflict = false;
    this.fAlternateConflict = this.eAttr === 1 || !(this.pResolveInfo.GetAlternateColor() !== 0);
    for (; ; ) {
      this.fCurrentConflict = false;
      this.pLowPrioOriginalConflictPacket = this.pLowPrioAlternateConflictPacket = null;
      this.MarkConflicts$C4PlayerInfoList$b(this.rPriCheckList, iTries === 0);
      if (this.eAttr !== 1) {
        this.MarkConflicts$C4PlayerInfoList$b(this.rSecCheckList, iTries === 0);
      }
      if (this.pSecPacket != null) {
        this.MarkConflicts$rC4ClientPlayerInfos$b(this.pSecPacket, iTries === 0);
      }
      if (this.eAttr === 0) {
        if (iTries === 0) {
          if (this.pResolveInfo.GetColor() !== this.pResolveInfo.GetOriginalColor()) {
            if (!this.fOriginalConflict) {
              this.pResolveInfo.SetColor(this.pResolveInfo.GetOriginalColor());
              if (this.pLowPrioOriginalConflictPacket != null) {
                this.ReaddInfoForCheck(this.pLowPrioOriginalConflictPacket);
              }
              break;
            } else if (this.pResolveInfo.GetColor() !== this.pResolveInfo.GetAlternateColor() && !this.fAlternateConflict) {
              this.pResolveInfo.SetColor(this.pResolveInfo.GetAlternateColor());
              if (this.pLowPrioAlternateConflictPacket != null) {
                this.ReaddInfoForCheck(this.pLowPrioAlternateConflictPacket);
              }
              break;
            }
          }
        }
        if (!this.fCurrentConflict) {
          break;
        }
        let dwNewClr = 0;
        if ((iTries = iTries + 1 | 0) > 100) {
          $.LogF($.LoadResStr(S("IDS_PRC_NOREPLPLRCLR")), this.pResolveInfo.GetName() != null ? this.pResolveInfo.GetName() : S("<NONAME>"));
          this.pResolveInfo.SetColor(this.pResolveInfo.GetOriginalColor());
          break;
        } else {
          dwNewClr = GenerateRandomPlayerColor(iTries);
        }
        this.pResolveInfo.SetColor(dwNewClr);
      } else {
        if (!$.SEqualNoCase(this.pResolveInfo.GetName(), this.pResolveInfo.GetOriginalName())) {
          if (!this.fOriginalConflict) {
            this.pResolveInfo.SetForcedName(null);
            if (this.pLowPrioOriginalConflictPacket != null) {
              this.ReaddInfoForCheck(this.pLowPrioOriginalConflictPacket);
            }
            break;
          }
        }
        if (!this.fCurrentConflict) {
          break;
        }
        if ((iTries = iTries + 1 | 0) > 100) {
          break;
        }
        this.pResolveInfo.SetForcedName($.FormatString(S("%s (%d)"), this.pResolveInfo.GetOriginalName(), iTries + 1 | 0).getData());
      }
    }
  }

  ResolveInPacket() {
    let $t1;
    this.fAnyChange = false;
    let iCheck = 0;
    while ((this.pResolveInfo = this.pResolvePacket.GetPlayerInfo$i32(($t1 = iCheck, iCheck = iCheck + 1 | 0, $t1))) != null) {
      if (this.pResolveInfo.HasJoined()) {
        continue;
      }
      let dwPrevColor = this.pResolveInfo.GetColor();
      let sPrevForcedName = new $.StdStrBuf();
      sPrevForcedName.Copy$pi8(this.pResolveInfo.GetForcedName());
      for (this.eAttr = 0 /*PLRATT_Color*/; this.eAttr !== 2; this.eAttr = this.eAttr + 1 | 0) {
        if (this.eAttr === 0) {
          if (this.pResolveInfo.GetAssociatedSavegamePlayerID() !== 0) {
            continue;
          }
          if ($.Game.Teams.IsTeamColors() && $.Game.Teams.GetTeamByID(this.pResolveInfo.GetTeam()) != null) {
            continue;
          }
        } else if (this.eAttr === 1) {
          if (this.pResolveInfo.getLeagueAccount() != null && $rd(this.pResolveInfo.getLeagueAccount()) !== 0) {
            continue;
          }
        }
        if (this.pResolveInfo.IsAttributesFixed()) {
          continue;
        }
        this.ResolveInInfo();
      }
      if (this.pResolveInfo.GetColor() !== dwPrevColor || this.pResolveInfo.GetForcedName() !== sPrevForcedName.op_const_void_()) {
        this.fAnyChange = true;
      }
    }
    if (this.fAnyChange) {
      this.pResolvePacket.SetUpdated();
    }
  }

  Resolve() {
    while (this.iCheckInfoCount !== 0) {
      this.pResolvePacket = this.ppCheckInfos.a[this.ppCheckInfos.o + (this.iCheckInfoCount = this.iCheckInfoCount - 1 | 0)];
      this.ResolveInPacket();
    }
  }

  $clone() { return new C4PlayerInfoListAttributeConflictResolver().$assign(this); }
  $assign(o) {
    this.ppCheckInfos = o.ppCheckInfos;
    this.iCheckInfoCount = o.iCheckInfoCount;
    this.rPriCheckList = o.rPriCheckList;
    this.rSecCheckList = o.rSecCheckList;
    this.pSecPacket = o.pSecPacket;
    this.eAttr = o.eAttr;
    this.pResolvePacket = o.pResolvePacket;
    this.fAnyChange = o.fAnyChange;
    this.pResolveInfo = o.pResolveInfo;
    this.fCurrentConflict = o.fCurrentConflict;
    this.fOriginalConflict = o.fOriginalConflict;
    this.fAlternateConflict = o.fAlternateConflict;
    this.pLowPrioOriginalConflictPacket = o.pLowPrioOriginalConflictPacket;
    this.pLowPrioAlternateConflictPacket = o.pLowPrioAlternateConflictPacket;
    return this;
  }
}



export function GenerateRandomPlayerColor(_iTry) {
  return (((0xff000000 | (($min(UnsyncedRandom$u32(302) | 0, 256) >>> 0 & 255) >>> 0 << 16) >>> 0) >>> 0 | (($min(UnsyncedRandom$u32(302) | 0, 256) >>> 0 & 255) >>> 0 << 8) >>> 0) >>> 0 | ($min(UnsyncedRandom$u32(302) | 0, 256) & 255) >>> 0) >>> 0;
}

export function IsColorConflict(dwClr1, dwClr2) {
  let R1 = (255 & dwClr1 >>> 16) >>> 0 | 0;
  let G1 = (255 & dwClr1 >>> 8) >>> 0 | 0;
  let B1 = (255 & dwClr1) >>> 0 | 0;
  let R2 = (255 & dwClr2 >>> 16) >>> 0 | 0;
  let G2 = (255 & dwClr2 >>> 8) >>> 0 | 0;
  let B2 = (255 & dwClr2) >>> 0 | 0;
  const r1 = [0];
  const g1 = [0];
  const b1 = [0];
  const r2 = [0];
  const g2 = [0];
  const b2 = [0];
  const x1 = [0];
  const y1 = [0];
  const Y1 = [0];
  const x2 = [0];
  const y2 = [0];
  const Y2 = [0];
  const u1 = [0];
  const v1 = [0];
  const u2 = [0];
  const v2 = [0];
  $.RGB2rgb(R1, G1, B1, P(r1, 0), P(g1, 0), P(b1, 0));
  $.RGB2rgb(R2, G2, B2, P(r2, 0), P(g2, 0), P(b2, 0));
  $.rgb2xyY(r1[0], g1[0], b1[0], P(x1, 0), P(y1, 0), P(Y1, 0));
  $.rgb2xyY(r2[0], g2[0], b2[0], P(x2, 0), P(y2, 0), P(Y2, 0));
  $.xy2upvp(x1[0], y1[0], P(u1, 0), P(v1, 0));
  $.xy2upvp(x2[0], y2[0], P(u2, 0), P(v2, 0));
  let Y = (Y1[0] + Y2[0]) / 2;
  let clrdiff = c$sqrt((u2[0] - u1[0]) * (u2[0] - u1[0]) + (v2[0] - v1[0]) * (v2[0] - v1[0])) * Y * Y * 150;
  let lumdiff = $.Abs$f64(Y2[0] - Y1[0]) / $max(Y * Y * 5, 0.5) / 0.1;
  return clrdiff + lumdiff < 1;
}

export function $init(): void {
  $.C4MaxPlayerColorChangeTries$C4PlayerInfoConflicts = 100;
  $.C4MaxPlayerNameChangeTries$C4PlayerInfoConflicts = 100;
}

Object.assign($, { C4PlayerInfoListAttributeConflictResolver, GenerateRandomPlayerColor, IsColorConflict });
