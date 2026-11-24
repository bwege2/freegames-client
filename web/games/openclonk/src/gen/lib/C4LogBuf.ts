// @ts-nocheck
// OpenClonk 36de799: src/lib/C4LogBuf.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $u64n } from '../../rt/int.ts';
import { c$memcpy, c$strchr, c$strcpy, c$strlen } from '../../rt/libc.ts';
import { $oarr, $oat, $oidx, $padd, $peq, $rd, $wr, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, $max, StdString } from '../../rt/std.ts';

export class C4LogBuffer {
  szBuf = null;
  pLineDataBuf = null;
  iBufSize = 0;
  iFirstLinePos = 0;
  iAfterLastLinePos = 0;
  iLineDataPos = 0;
  iNextLineDataPos = 0;
  iMaxLineCount = 0;
  iLineCount = 0;
  iLineBreakWidth = 0;
  szIndent = null;
  fDynamicGrow = false;
  fMarkup = false;

  GrowLineCountBuffer(iGrowBy) {
    0;
    if (iGrowBy === 0) {
      return;
    }
    let pNewBuf = $oat($oarr($u64n(this.iMaxLineCount = $u64n(this.iMaxLineCount) + iGrowBy | 0), () => new C4LogBuffer$LineData()), 0);
    if (this.iLineCount !== 0) {
      c$memcpy(pNewBuf, this.pLineDataBuf, 16 * $u64n(this.iLineCount));
    }
    $delete(this.pLineDataBuf);
    this.pLineDataBuf = pNewBuf;
  }

  GrowTextBuffer(iGrowBy) {
    0;
    if (iGrowBy === 0) {
      return;
    }
    let pNewBuf = P(new Int8Array($u64n(this.iBufSize = $u64n(this.iBufSize) + iGrowBy | 0)), 0);
    if (this.iAfterLastLinePos !== 0) {
      c$memcpy(pNewBuf, this.szBuf, 1 * $u64n(this.iAfterLastLinePos));
    }
    $delete(this.szBuf);
    this.szBuf = pNewBuf;
  }

  DiscardFirstLine() {
    0;
    this.iLineCount = this.iLineCount - 1 | 0;
    while (this.szBuf.a[this.szBuf.o + this.iFirstLinePos] !== 0) {
      this.iFirstLinePos = this.iFirstLinePos + 1 | 0;
    }
    this.iFirstLinePos = this.iFirstLinePos + 1 | 0;
    if (this.iFirstLinePos === this.iBufSize || this.szBuf.a[this.szBuf.o + this.iFirstLinePos] === 0 || this.iLineCount === 0) {
      this.iFirstLinePos = 0;
    }
    this.iLineDataPos = this.iLineDataPos + 1 | 0;
    if (this.iLineCount === 0) {
      this.iLineDataPos = this.iNextLineDataPos = 0;
    }
  }

  AppendSingleLine(szLine, iLineLength, szIndent, pFont, dwClr, fNewPar) {
    if (szLine == null || iLineLength === 0 || szLine.a[szLine.o] === 0) {
      return;
    }
    if (this.iLineCount === this.iMaxLineCount) {
      if (this.fDynamicGrow) {
        this.GrowLineCountBuffer($u64n(4 + (this.iMaxLineCount / 2 | 0) | 0));
      } else {
        this.DiscardFirstLine();
      }
    }
    iLineLength = iLineLength + 1 | 0;
    if (szIndent != null) {
      iLineLength = $u64n(iLineLength) + c$strlen(szIndent) | 0;
    }
    if (iLineLength > this.iBufSize && !this.fDynamicGrow) {
      szLine = szLine.add(iLineLength - this.iBufSize | 0);
      iLineLength = this.iBufSize;
    }
    if ((this.iAfterLastLinePos + iLineLength | 0) > this.iBufSize) {
      if (this.fDynamicGrow) {
        this.GrowTextBuffer($u64n($max(iLineLength, this.iBufSize / 2 | 0)));
      } else {
        while (this.iFirstLinePos >= this.iAfterLastLinePos) {
          this.DiscardFirstLine();
        }
        if (this.iAfterLastLinePos < this.iBufSize) {
          this.szBuf.a[this.szBuf.o + this.iAfterLastLinePos] = 0;
        }
        this.iAfterLastLinePos = 0;
      }
    }
    if (!this.fDynamicGrow) {
      while (this.iLineCount !== 0 && $.Inside$i32$i32$i32$3(this.iFirstLinePos, this.iAfterLastLinePos, (this.iAfterLastLinePos + iLineLength | 0) - 1 | 0)) {
        this.DiscardFirstLine();
      }
    }
    let iIndentLen = 0;
    if (szIndent != null) {
      iIndentLen = c$strlen(szIndent) | 0;
      c$memcpy($padd(this.szBuf, this.iAfterLastLinePos), szIndent, $u64n(iIndentLen));
    }
    if ((iLineLength - iIndentLen | 0) > 1) {
      c$memcpy($padd($padd(this.szBuf, this.iAfterLastLinePos), iIndentLen), szLine, $u64n((iLineLength - iIndentLen | 0) - 1 | 0));
    }
    this.iAfterLastLinePos = this.iAfterLastLinePos + iLineLength | 0;
    this.szBuf.a[this.szBuf.o + (this.iAfterLastLinePos - 1 | 0)] = 0;
    const rData = $oidx(this.pLineDataBuf, this.iNextLineDataPos);
    rData.pFont = pFont;
    rData.dwClr = dwClr;
    rData.fNewParagraph = fNewPar;
    this.iLineCount = this.iLineCount + 1 | 0;
    if ((this.iNextLineDataPos = this.iNextLineDataPos + 1 | 0) === this.iMaxLineCount) {
      if (this.fDynamicGrow) {
        this.GrowLineCountBuffer($u64n(4 + (this.iMaxLineCount / 2 | 0) | 0));
      } else {
        this.iNextLineDataPos = 0;
      }
    }
  }

  init(iSize, iMaxLines, iLBWidth, szIndentChars = S("    "), fDynamicGrow = false, fMarkup = true) {
    this.iBufSize = iSize;
    this.iFirstLinePos = 0;
    this.iAfterLastLinePos = 0;
    this.iLineDataPos = 0;
    this.iNextLineDataPos = 0;
    this.iMaxLineCount = iMaxLines;
    this.iLineCount = 0;
    this.iLineBreakWidth = iLBWidth;
    this.fDynamicGrow = fDynamicGrow;
    this.fMarkup = fMarkup;
    if (szIndentChars != null && szIndentChars.a[szIndentChars.o] !== 0) {
      this.szIndent = P(new Int8Array(c$strlen(szIndentChars) + 1), 0);
      c$strcpy(this.szIndent, szIndentChars);
    } else {
      this.szIndent = null;
    }
    if (this.iBufSize !== 0) {
      this.szBuf = P(new Int8Array($u64n(this.iBufSize)), 0);
    } else {
      this.szBuf = null;
    }
    if (this.iMaxLineCount !== 0) {
      this.pLineDataBuf = $oat($oarr($u64n(this.iMaxLineCount), () => new C4LogBuffer$LineData()), 0);
    } else {
      this.pLineDataBuf = null;
    }
    0;
    return this;
  }

  $dtor() {
    $delete(this.pLineDataBuf);
    $delete(this.szBuf);
    if (this.szIndent != null) {
      $delete(this.szIndent);
    }
  }

  AppendLines(szLine, pFont, dwClr, pFirstLineFont = null) {
    let $t1;
    const LineBreakChars = new Int8Array([13, 10, 124]);
    let iLineBreakCharCount = 2 + (this.fMarkup ? 1 : 0) | 0;
    if (szLine == null) {
      return;
    }
    let fAnyLineBreakChar = false;
    for (let i = 0; i < iLineBreakCharCount; i = i + 1 | 0) {
      if (c$strchr(szLine, LineBreakChars[i]) != null) {
        fAnyLineBreakChar = true;
        break;
      }
    }
    if (fAnyLineBreakChar) {
      let szBuf = P(new Int8Array(c$strlen(szLine) + 1), 0);
      let szBufPos = null;
      let szPos2 = szBuf;
      let szBufFind = null;
      c$strcpy(szBuf, szLine);
      while ((szBufPos = szPos2) != null) {
        szPos2 = null;
        for (let i$2 = 0; i$2 < iLineBreakCharCount; i$2 = i$2 + 1 | 0) {
          if ((szBufFind = c$strchr(szBufPos, LineBreakChars[i$2])) != null) {
            if (szPos2 == null || szBufFind.o < szPos2.o) {
              szPos2 = szBufFind;
            }
          }
        }
        if (szPos2 != null) {
          $wr(($t1 = szPos2, szPos2 = szPos2.add(1), $t1), 0, 0);
        }
        if (szBufPos.a[szBufPos.o] === 0) {
          continue;
        }
        if (pFirstLineFont != null) {
          this.AppendLines(szBufPos, pFirstLineFont, dwClr);
          pFirstLineFont = null;
        } else {
          this.AppendLines(szBufPos, pFont, dwClr);
        }
      }
      $delete(szBuf);
      return;
    }
    if (this.iLineBreakWidth === 0 || pFont == null) {
      this.AppendSingleLine(szLine, c$strlen(szLine) | 0, null, pFont, dwClr, true);
    } else {
      let markup = new $.C4Markup().init(false);
      const markupPos = [szLine];
      let rline = new StdString();
      let iLineIndex = 0;
      while (szLine.a[szLine.o] !== 0) {
        let iBreakWdt = this.iLineBreakWidth;
        if (iLineIndex !== 0 && this.szIndent != null) {
          const iIndentWdt = [0];
          const Q = [0];
          pFont.GetTextExtent(this.szIndent, P(iIndentWdt, 0), P(Q, 0), true);
          iBreakWdt = iBreakWdt - iIndentWdt[0] | 0;
        }
        const szNextLine = [null];
        let iNumChars = pFont.GetMessageBreak(szLine, P(szNextLine, 0), iBreakWdt);
        if (this.fMarkup) {
          let opening = markup.OpeningTags();
          while (markupPos[0].o < szNextLine[0].o) {
            if (markupPos[0].a[markupPos[0].o] === 60) {
              if (markup.Read(P(markupPos, 0))) {
                if (markupPos[0].o > szNextLine[0].o) {
                  iNumChars = iNumChars + (markupPos[0].o - szNextLine[0].o + 1) | 0;
                  szNextLine[0] = markupPos[0];
                }
                continue;
              }
            }
            markupPos[0] = markupPos[0].add(1);
          }
          let closing = markup.ClosingTags();
          if (!opening.empty() || !closing.empty()) {
            rline.assign(opening);
            rline.append(szLine, $u64n(iNumChars));
            rline.append(closing);
            szLine = rline.c_str();
            iNumChars = rline.size() | 0;
          }
        }
        this.AppendSingleLine(szLine, iNumChars, iLineIndex !== 0 ? this.szIndent : null, pFont, dwClr, iLineIndex === 0);
        szLine = szNextLine[0];
        iLineIndex = iLineIndex + 1 | 0;
        rline.clear();
      }
    }
  }

  GetLine(iLineIndex, ppFont, pdwClr, pfNewPar) {
    let $t1, $t2;
    if (iLineIndex < 0) {
      iLineIndex = iLineIndex + this.iLineCount | 0;
      if (iLineIndex < 0) {
        return null;
      }
    }
    if (iLineIndex >= this.iLineCount) {
      return null;
    }
    const rData = $oidx(this.pLineDataBuf, (this.iLineDataPos + iLineIndex | 0) % this.iMaxLineCount);
    if (ppFont != null) {
      ppFont.a[ppFont.o] = rData.pFont;
    }
    if (pdwClr != null) {
      pdwClr.a[pdwClr.o] = rData.dwClr;
    }
    if (pfNewPar != null) {
      pfNewPar.a[pfNewPar.o] = rData.fNewParagraph;
    }
    let szResult = $padd(this.szBuf, this.iFirstLinePos);
    while (($t1 = iLineIndex, iLineIndex = iLineIndex - 1 | 0, $t1) !== 0) {
      while ($rd(($t2 = szResult, szResult = szResult.add(1), $t2)) !== 0) {
        ;
      }
      if ($peq(szResult, $padd(this.szBuf, this.iBufSize)) || szResult.a[szResult.o] === 0) {
        szResult = this.szBuf;
      }
    }
    return szResult;
  }

  Clear() {
    this.iFirstLinePos = this.iAfterLastLinePos = this.iLineCount = this.iNextLineDataPos = this.iLineDataPos = 0;
  }

  GetCount() {
    return this.iLineCount;
  }

  SetLBWidth(iToWidth) {
    this.iLineBreakWidth = iToWidth;
  }

  $clone() { return new C4LogBuffer().$assign(this); }
  $assign(o) {
    this.szBuf = o.szBuf;
    this.pLineDataBuf = o.pLineDataBuf;
    this.iBufSize = o.iBufSize;
    this.iFirstLinePos = o.iFirstLinePos;
    this.iAfterLastLinePos = o.iAfterLastLinePos;
    this.iLineDataPos = o.iLineDataPos;
    this.iNextLineDataPos = o.iNextLineDataPos;
    this.iMaxLineCount = o.iMaxLineCount;
    this.iLineCount = o.iLineCount;
    this.iLineBreakWidth = o.iLineBreakWidth;
    this.szIndent = o.szIndent;
    this.fDynamicGrow = o.fDynamicGrow;
    this.fMarkup = o.fMarkup;
    return this;
  }
}

export class C4LogBuffer$LineData {
  pFont = null;
  dwClr = 0;
  fNewParagraph = false;

  $clone() { return new C4LogBuffer$LineData().$assign(this); }
  $assign(o) {
    this.pFont = o.pFont;
    this.dwClr = o.dwClr;
    this.fNewParagraph = o.fNewParagraph;
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4LogBuffer, C4LogBuffer$LineData });
