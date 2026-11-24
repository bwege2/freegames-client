// @ts-nocheck
// OpenClonk 36de799: src/player/C4RankSystem.cpp, src/player/C4RankSystem.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $u64n, ftoi32 } from '../../rt/int.ts';
import { c$memcpy, c$pow, c$sscanf, c$strcpy, c$strlen } from '../../rt/libc.ts';
import { $padd, $rd, $wr, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete } from '../../rt/std.ts';

export class C4RankSystem {
  Register = new Int8Array(257);
  RankName = new Int8Array(31);
  RankBase = 0;
  pszRankNames = null;
  szRankNames = null;
  iRankNum = 0;
  pszRankExtensions = null;
  iRankExtNum = 0;

  init() {
    this.pszRankNames = null;
    this.szRankNames = null;
    this.pszRankExtensions = null;
    C4RankSystem.prototype.Default.call(this);
    return this;
  }

  $dtor() {
    C4RankSystem.prototype.Clear.call(this);
  }

  Default() {
    this.Clear();
    this.Register[0] = 0;
    this.RankName[0] = 0;
    this.RankBase = 1000;
    this.iRankExtNum = 0;
  }

  Clear() {
    if (this.pszRankNames != null) {
      $delete(this.pszRankNames);
      this.pszRankNames = null;
    }
    if (this.pszRankExtensions != null) {
      $delete(this.pszRankExtensions);
      this.pszRankExtensions = null;
    }
    if (this.szRankNames != null) {
      $delete(this.szRankNames);
      this.szRankNames = null;
    }
    this.iRankNum = 0;
    this.iRankExtNum = 0;
  }

  Init(szRegister, szDefRanks, iRankBase) {
    $.SCopy$pi8$pi8$u64(szRegister, P(this.Register, 0), 256);
    this.RankBase = iRankBase;
    this.Clear();
    if (szDefRanks == null) {
      return 0;
    }
    this.szRankNames = P(new Int8Array(c$strlen(szDefRanks) + 1), 0);
    c$strcpy(this.szRankNames, szDefRanks);
    for (let p = this.szRankNames; p.a[p.o] !== 0; p = p.add(1)) {
      if (p.a[p.o] === 124) {
        p.a[p.o] = 0;
        this.iRankNum = this.iRankNum + 1 | 0;
      }
    }
    this.iRankNum = this.iRankNum + 1 | 0;
    this.pszRankNames = P(new Array($u64n(this.iRankNum)).fill(null), 0);
    let p = this.szRankNames;
    for (let i = 0; i < this.iRankNum; i = i + 1 | 0) {
      this.pszRankNames.a[this.pszRankNames.o + i] = p;
      p = p.add(c$strlen(p) + 1);
    }
    return this.iRankNum;
  }

  Load(hGroup, szFilenames, DefRankBase, szLanguage) {
    let $t1, $t2;
    this.Clear();
    0;
    0;
    let Ranks = new $.C4ComponentHost().init();
    if (!$.C4Language.LoadComponentHost(Ranks, hGroup, szFilenames, szLanguage)) {
      return false;
    }
    let iSize = Ranks.GetDataSize();
    if (iSize === 0) {
      return false;
    }
    this.szRankNames = P(new Int8Array(iSize + 1), 0);
    c$memcpy(this.szRankNames, Ranks.GetData(), iSize * 1);
    this.szRankNames.a[this.szRankNames.o + iSize] = 0;
    let i = 0;
    for (; i < iSize; i = i + 1 >>> 0) {
      if (this.szRankNames.a[this.szRankNames.o + i] === 10 || this.szRankNames.a[this.szRankNames.o + i] === 13) {
        this.szRankNames.a[this.szRankNames.o + i] = 0;
      }
    }
    let pRank0 = this.szRankNames;
    let pPos = this.szRankNames;
    for (i = 0; i < iSize; i = i + 1 >>> 0, pPos = pPos.add(1)) {
      if (pPos.a[pPos.o] === 0) {
        if (pPos.o - pRank0.o > 0) {
          if (pRank0.a[pRank0.o] === 42) {
            this.iRankExtNum = this.iRankExtNum + 1 | 0;
          } else if (pRank0.a[pRank0.o] !== 35) {
            if ($.SCharPos(61, pRank0) < 0) {
              this.iRankNum = this.iRankNum + 1 | 0;
            }
          }
        }
        pRank0 = $padd(pPos, 1);
      }
    }
    if (this.iRankNum === 0) {
      this.Clear();
      return false;
    }
    this.RankBase = DefRankBase;
    this.pszRankNames = P(new Array($u64n(this.iRankNum)).fill(null), 0);
    if (this.iRankExtNum !== 0) {
      this.pszRankExtensions = P(new Array($u64n(this.iRankExtNum)).fill(null), 0);
    }
    pRank0 = this.szRankNames;
    pPos = this.szRankNames;
    let pszCurrRank = this.pszRankNames;
    let pszCurrRankExt = this.pszRankExtensions;
    for (i = 0; i < iSize; i = i + 1 >>> 0, pPos = pPos.add(1)) {
      if (pPos.a[pPos.o] === 0) {
        if (pPos.o - pRank0.o > 0) {
          if (pRank0.a[pRank0.o] === 42) {
            $wr(($t1 = pszCurrRankExt, pszCurrRankExt = pszCurrRankExt.add(1), $t1), 0, $padd(pRank0, 1));
          } else if (pRank0.a[pRank0.o] !== 35) {
            let iEqPos = $.SCharPos(61, pRank0);
            if (iEqPos >= 0) {
              pRank0.a[pRank0.o + iEqPos] = 0;
              let szValue = $padd($padd(pRank0, iEqPos), 1);
              if ($.SEqual(pRank0, S("Base"))) {
                c$sscanf(szValue, S("%d"), P(this, "RankBase"));
              }
            } else {
              $wr(($t2 = pszCurrRank, pszCurrRank = pszCurrRank.add(1), $t2), 0, pRank0);
            }
          }
        }
        pRank0 = $padd(pPos, 1);
      }
    }
    if (this.RankBase === 0) {
      this.RankBase = 1000;
    }
    return true;
  }

  Experience(iRank) {
    if (iRank < 0) {
      return 0;
    }
    return ftoi32(c$pow(iRank, 1.5) * this.RankBase);
  }

  RankByExperience(iExp) {
    let iRank = 0;
    while (this.Experience(iRank + 1 | 0) <= iExp) {
      iRank = iRank + 1 | 0;
    }
    return iRank;
  }

  GetRankName(iRank, fReturnLastIfOver) {
    if (iRank < 0) {
      return new $.StdStrBuf();
    }
    if (this.pszRankNames != null) {
      if (this.iRankNum <= 0) {
        return new $.StdStrBuf();
      }
      if (iRank >= Math.imul(this.iRankNum, this.iRankExtNum + 1 | 0)) {
        if (!fReturnLastIfOver) {
          return new $.StdStrBuf();
        }
        iRank = Math.imul(this.iRankNum, this.iRankExtNum + 1 | 0) - 1 | 0;
      }
      let sResult = new $.StdStrBuf();
      if (iRank >= this.iRankNum) {
        let iExtension = (iRank / this.iRankNum | 0) - 1 | 0;
        iRank = iRank % this.iRankNum;
        sResult.Format(this.pszRankExtensions.a[this.pszRankExtensions.o + iExtension], this.pszRankNames.a[this.pszRankNames.o + iRank]);
      } else {
        sResult.Ref$pi8(this.pszRankNames.a[this.pszRankNames.o + iRank]);
      }
      return sResult;
    }
    return new $.StdStrBuf();
  }

  Check(_iRank, _szDefRankName) {
    return true;
  }

  GetExtendedRankNum() {
    return this.iRankExtNum;
  }

  GetBaseRankNum() {
    return this.iRankNum;
  }

  static DrawRankSymbol(fctSymbol, iRank, pfctRankSymbols, iRankSymbolCount, fOwnSurface, iXOff = 0, cgoDrawDirect = null) {
    if (iRank < 0) {
      iRank = 0;
    }
    const iMaxRankSym = [0];
    const Q = [0];
    if (pfctRankSymbols.GetPhaseNum(P(iMaxRankSym, 0), P(Q, 0))) {
      if (iMaxRankSym[0] === 0) {
        iMaxRankSym[0] = 1;
      }
      let iBaseRank = iRank % iRankSymbolCount;
      if ((iRank / iRankSymbolCount | 0) !== 0) {
        let fctExtended = $.GraphicsResource.fctCaptain.$clone();
        if (iMaxRankSym[0] > iRankSymbolCount) {
          let iExtended = ((iRank / iRankSymbolCount | 0) - 1 | 0) + iRankSymbolCount | 0;
          if (iExtended >= iMaxRankSym[0]) {
            iExtended = iMaxRankSym[0] - 1 | 0;
            iBaseRank = iRankSymbolCount - 1 | 0;
          }
          fctExtended.$assign(pfctRankSymbols.GetPhase(iExtended));
        }
        let iSize = ftoi32(pfctRankSymbols.Wdt);
        if (cgoDrawDirect == null) {
          fctSymbol.Create(iSize, iSize);
          pfctRankSymbols.DrawX(fctSymbol.Surface, Math.fround(0), Math.fround(0), Math.fround(iSize), Math.fround(iSize), iBaseRank);
          fctExtended.DrawX(fctSymbol.Surface, Math.fround(0), Math.fround(0), Math.fround(Math.imul(iSize, 2) / 3 | 0), Math.fround(Math.imul(iSize, 2) / 3 | 0));
        } else {
          pfctRankSymbols.Draw$pC4Surface$f32$f32$i32$i32(cgoDrawDirect.Surface, Math.fround(cgoDrawDirect.X + Math.fround(iXOff)), cgoDrawDirect.Y, iBaseRank);
          fctExtended.Draw$pC4Surface$f32$f32$i32$i32(cgoDrawDirect.Surface, Math.fround(Math.fround(cgoDrawDirect.X + Math.fround(iXOff)) - Math.fround(4)), Math.fround(cgoDrawDirect.Y - Math.fround(3)));
        }
      } else {
        if (cgoDrawDirect != null) {
          pfctRankSymbols.Draw$pC4Surface$f32$f32$i32$i32(cgoDrawDirect.Surface, Math.fround(cgoDrawDirect.X + Math.fround(iXOff)), cgoDrawDirect.Y, iBaseRank);
        } else if (fOwnSurface) {
          let iSize = ftoi32(pfctRankSymbols.Wdt);
          fctSymbol.Create(iSize, iSize);
          pfctRankSymbols.DrawX(fctSymbol.Surface, Math.fround(0), Math.fround(0), Math.fround(iSize), Math.fround(iSize), iBaseRank);
        } else {
          fctSymbol.Set$C4Facet(pfctRankSymbols.GetPhase(iBaseRank));
        }
      }
      return true;
    }
    return false;
  }

  $clone() { return new C4RankSystem().$assign(this); }
  $assign(o) {
    this.Register = o.Register.slice();
    this.RankName = o.RankName.slice();
    this.RankBase = o.RankBase;
    this.pszRankNames = o.pszRankNames;
    this.szRankNames = o.szRankNames;
    this.iRankNum = o.iRankNum;
    this.pszRankExtensions = o.pszRankExtensions;
    this.iRankExtNum = o.iRankExtNum;
    return this;
  }
}


export function $init(): void {
  $.DefaultRanks = new C4RankSystem(); $.DefaultRanks.init();
}

Object.assign($, { C4RankSystem });
